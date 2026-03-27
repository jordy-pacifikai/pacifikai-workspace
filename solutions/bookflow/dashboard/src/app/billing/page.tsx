'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  FileText,
  Download,
  Check,
  ArrowUpRight,
  Calendar,
  X,
  Loader2,
  ExternalLink,
  MessageSquare,
  Clock,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness } from '@/hooks/useBusiness';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { getPlanLabel, formatXPF, generateInvoiceData } from '@/lib/invoice-pdf';
import { FreemiusCheckoutButton } from '@/components/ui/FreemiusCheckout';

// Pricing IDs Freemius par plan (mensuel)
const FREEMIUS_PRICING_IDS: Record<string, number> = {
  starter: 57672,
  pro: 57674,
  business: 57676,
};

const GREEN = '#25D366';

// ─── Plan Data ──────────────────────────────────────────────────────────────

interface PlanOption {
  id: string;
  name: string;
  desc: string;
  monthlyPrice: number | null;
  features: string[];
  featured: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'decouverte',
    name: 'Decouverte',
    desc: 'Testez gratuitement',
    monthlyPrice: null,
    features: [
      '14 jours d\'essai',
      '50 conversations',
      '1 canal (Messenger)',
      'Dashboard basique',
    ],
    featured: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Pour les independants',
    monthlyPrice: 4900,
    features: [
      '500 conversations/mois',
      '1 canal (WhatsApp)',
      'Rappels automatiques',
      'Dashboard complet',
      'Avis clients',
    ],
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'L\'automatisation complete',
    monthlyPrice: 9900,
    features: [
      '2 000 conversations/mois',
      'Multi-canal (Messenger, IG, WA)',
      'Google Calendar sync',
      'Analytics avances',
      'Branding personnalise',
    ],
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    desc: 'Pour les equipes',
    monthlyPrice: 24900,
    features: [
      'Conversations illimitees',
      'Multi-staff / multi-sites',
      'Acces API',
      'Support prioritaire dedie',
      'Onboarding personnalise',
    ],
    featured: false,
  },
];

// ─── Invoice Types ──────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Invoice['status'], { label: string; bg: string; text: string }> = {
  paid: { label: 'Payee', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  pending: { label: 'En attente', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  overdue: { label: 'En retard', bg: 'bg-red-500/15', text: 'text-red-400' },
};

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', s.bg, s.text)}>
      {s.label}
    </span>
  );
}

// ─── Format Helpers ─────────────────────────────────────────────────────────

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return fmt(s);
  }
  return `${fmt(s)} — ${fmt(e)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Plan Change Modal ──────────────────────────────────────────────────────
// Upgrades → Freemius checkout popup (paiement requis)
// Downgrades → API interne change-plan

const PLAN_RANK: Record<string, number> = {
  decouverte: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

const CONVERSATION_LIMITS: Record<string, number> = {
  decouverte: 50,
  starter: 500,
  pro: 2000,
  business: Infinity,
};

const CANCELLATION_REASONS = [
  'Trop cher',
  'Pas assez de fonctionnalités',
  'Problèmes techniques',
  "Je n'en ai plus besoin",
  'Autre',
] as const;

function ChangePlanModal({
  currentPlan,
  onClose,
  onConfirm,
  isLoading,
  userEmail,
  onUpgradeSuccess,
}: {
  currentPlan: string | null;
  onClose: () => void;
  onConfirm: (planId: string) => void;
  isLoading: boolean;
  userEmail?: string;
  onUpgradeSuccess: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const currentRank = PLAN_RANK[(currentPlan ?? '').toLowerCase()] ?? 0;
  const selectedRank = PLAN_RANK[selected ?? ''] ?? 0;
  const isUpgrade = selected !== null && selectedRank > currentRank;
  const selectedPricingId = selected ? FREEMIUS_PRICING_IDS[selected] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-plan-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 id="billing-plan-title" className="text-lg font-bold text-white">
            Changer de plan
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {PLANS.map((plan) => {
            const isCurrent = (currentPlan ?? '').toLowerCase() === plan.id;
            const isSelected = selected === plan.id;
            const planRank = PLAN_RANK[plan.id] ?? 0;
            const wouldUpgrade = planRank > currentRank;

            return (
              <button
                key={plan.id}
                type="button"
                disabled={isCurrent}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  'text-left rounded-xl p-5 border-2 transition-all',
                  isCurrent
                    ? 'border-gray-700 bg-gray-800/50 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-[#25D366] bg-[#25D366]/5'
                      : 'border-gray-800 bg-gray-900/50 hover:border-gray-700',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        Actuel
                      </span>
                    )}
                    {!isCurrent && wouldUpgrade && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        Upgrade
                      </span>
                    )}
                    {isSelected && !isCurrent && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: GREEN }}
                      >
                        <Check size={12} className="text-gray-950" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                <p className="text-2xl font-bold text-white mb-3">
                  {plan.monthlyPrice !== null
                    ? `${plan.monthlyPrice.toLocaleString('fr-FR')} XPF`
                    : 'Gratuit'}
                  {plan.monthlyPrice !== null && (
                    <span className="text-xs text-gray-500 font-normal ml-1">/mois</span>
                  )}
                </p>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <Check size={12} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            {isUpgrade
              ? 'Upgrade via paiement sécurisé Freemius.'
              : 'Le downgrade prend effet immédiatement.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>

            {/* Upgrade → Freemius checkout popup */}
            {isUpgrade && selected && selectedPricingId ? (
              <FreemiusCheckoutButton
                pricingId={selectedPricingId}
                label="Upgrader maintenant"
                trial={false}
                userEmail={userEmail}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-semibold transition-all text-gray-950 hover:opacity-90',
                )}
                style={{ backgroundColor: GREEN }}
                onSuccess={() => {
                  onUpgradeSuccess();
                  onClose();
                }}
              />
            ) : (
              /* Downgrade → API interne */
              <button
                disabled={!selected || isLoading || isUpgrade}
                onClick={() => selected && onConfirm(selected)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  selected && !isUpgrade
                    ? 'text-gray-950 hover:opacity-90'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed',
                )}
                style={selected && !isUpgrade ? { backgroundColor: GREEN } : undefined}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Confirmer le downgrade'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cancellation Survey Modal ──────────────────────────────────────────────

function CancellationSurveyModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-survey-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 id="cancel-survey-title" className="text-base font-bold text-white">
            Avant de partir...
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-400 mb-4">
            Pourquoi souhaitez-vous annuler ?
          </p>
          <div className="space-y-2">
            {CANCELLATION_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelected(reason)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                  selected === reason
                    ? 'border-red-500/50 bg-red-500/10 text-white'
                    : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:text-white',
                )}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Garder mon abonnement
          </button>
          <button
            disabled={!selected || isLoading}
            onClick={() => selected && onConfirm(selected)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
              selected && !isLoading
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed',
            )}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer l\'annulation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Detail Modal ───────────────────────────────────────────────────

function InvoiceDetailModal({
  invoice,
  businessName,
  businessEmail,
  businessPhone,
  plan,
  onClose,
}: {
  invoice: Invoice;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  plan: string | null;
  onClose: () => void;
}) {
  const data = generateInvoiceData(
    { name: businessName, email: businessEmail, phone: businessPhone, plan },
    invoice,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="billing-cancel-title">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 id="billing-cancel-title" className="text-lg font-bold text-white">Facture {data.invoiceNumber}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const printWin = window.open('', '_blank', 'width=700,height=900');
                if (!printWin) return;
                printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${data.invoiceNumber}</title><style>body{font-family:sans-serif;padding:40px;color:#111;max-width:600px;margin:0 auto}h1{font-size:20px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee}th{background:#f5f5f5;font-size:12px;text-transform:uppercase}tfoot td{font-weight:bold;border-top:2px solid #ddd}.label{font-size:11px;color:#888;text-transform:uppercase;margin-bottom:2px}</style></head><body><h1>Ve'a — Facture</h1><p style="color:#888;margin:0">${data.invoiceNumber}</p><hr style="margin:16px 0"><div style="display:flex;gap:40px;margin-bottom:16px"><div><p class="label">Émetteur</p><strong>${data.issuer.name}</strong><br>${data.issuer.legal}<br>${data.issuer.email}</div><div><p class="label">Client</p><strong>${data.business.name}</strong>${data.business.email ? `<br>${data.business.email}` : ''}</div></div><div style="display:flex;gap:40px;margin-bottom:16px"><div><p class="label">Date d'émission</p>${data.issueDate}</div><div><p class="label">Échéance</p>${data.dueDate}</div></div><table><thead><tr><th>Description</th><th style="text-align:right">Montant</th></tr></thead><tbody>${data.lineItems.map(i => `<tr><td>${i.description}</td><td style="text-align:right">${i.total.toLocaleString('fr-FR')} XPF</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td style="text-align:right">${data.total.toLocaleString('fr-FR')} XPF</td></tr></tfoot></table><p style="font-size:12px;color:#888">${data.legalMentions.join(' ')}</p></body></html>`);
                printWin.document.close();
                printWin.focus();
                setTimeout(() => printWin.print(), 400);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <Printer size={13} />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Issuer */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Emetteur</p>
            <p className="text-sm text-white font-medium">{data.issuer.name}</p>
            <p className="text-xs text-gray-400">{data.issuer.legal}</p>
            <p className="text-xs text-gray-400">{data.issuer.email} | {data.issuer.phone}</p>
          </div>

          {/* Client */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Client</p>
            <p className="text-sm text-white font-medium">{data.business.name}</p>
            {data.business.email && (
              <p className="text-xs text-gray-400">{data.business.email}</p>
            )}
          </div>

          {/* Dates */}
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-500">Date d&apos;emission</p>
              <p className="text-sm text-white">{data.issueDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Echeance</p>
              <p className="text-sm text-white">{data.dueDate}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-2">Description</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="text-sm text-gray-300 px-4 py-3">{item.description}</td>
                    <td className="text-sm text-white font-medium text-right px-4 py-3">
                      {formatXPF(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td className="text-sm font-semibold text-white px-4 py-3">Total</td>
                  <td className="text-sm font-bold text-white text-right px-4 py-3">
                    {formatXPF(data.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment info */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Paiement</p>
            <p className="text-sm text-gray-300">{data.paymentMethod}</p>
            <p className="text-xs text-gray-500 mt-1">
              Reference : <span className="text-gray-300">{data.bankDetails.reference}</span>
            </p>
          </div>

          {/* Legal */}
          <div className="border-t border-gray-800 pt-4">
            {data.legalMentions.map((m, i) => (
              <p key={i} className="text-[11px] text-gray-600 leading-relaxed">{m}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const businessId = useAppStore((s) => s.businessId);
  const businessName = useAppStore((s) => s.businessName);
  const { data: business, isLoading: bizLoading } = useBusiness(businessId);
  const queryClient = useQueryClient();

  const [showChangePlan, setShowChangePlan] = useState(false);
  const [changePlanLoading, setChangePlanLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCancelSurvey, setShowCancelSurvey] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);

  // Email de l'utilisateur pour pré-remplir le checkout Freemius
  const userEmail = business?.email ?? undefined;

  // Fetch invoices
  const supabase = getSupabaseBrowser();
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from('bookbot_invoices')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet — return empty
        console.warn('Invoices query error (table may not exist):', error.message);
        return [];
      }
      return (data ?? []) as Invoice[];
    },
    enabled: Boolean(businessId),
  });

  // Handle plan change
  const handleChangePlan = useCallback(
    async (planId: string) => {
      setChangePlanLoading(true);
      try {
        const res = await fetch('/api/billing/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? 'Erreur');
        }

        // Invalidate business query to refresh plan display
        queryClient.invalidateQueries({ queryKey: ['business'] });
        setShowChangePlan(false);
        setSuccessMsg('Plan mis a jour avec succes ! Une facture vous sera envoyee par email.');
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur lors du changement de plan');
      } finally {
        setChangePlanLoading(false);
      }
    },
    [queryClient],
  );

  // Handle cancellation with survey
  const handleCancel = useCallback(
    async (reason: string) => {
      setCancelLoading(true);
      try {
        // Save cancellation reason
        await fetch('/api/billing/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'decouverte', cancellationReason: reason }),
        });
        queryClient.invalidateQueries({ queryKey: ['business'] });
        setShowCancelSurvey(false);
        setSuccessMsg('Abonnement annulé. Vous restez sur le plan Découverte.');
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
      } finally {
        setCancelLoading(false);
      }
    },
    [queryClient],
  );

  // Handle trial extension (1x 7 days)
  const handleExtendTrial = useCallback(async () => {
    setExtendLoading(true);
    try {
      const res = await fetch('/api/billing/extend-trial', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Erreur');
      }
      queryClient.invalidateQueries({ queryKey: ['business'] });
      setSuccessMsg('Essai étendu de 7 jours supplémentaires !');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'extension');
    } finally {
      setExtendLoading(false);
    }
  }, [queryClient]);

  // Compute renewal date
  const renewalDate = business?.billing_cycle_start
    ? (() => {
        const d = new Date(business.billing_cycle_start);
        d.setMonth(d.getMonth() + 1);
        return formatDate(d.toISOString());
      })()
    : null;

  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const currentPlan = business?.plan ?? null;
  const currentPlanData = PLANS.find((p) => p.id === (currentPlan ?? '').toLowerCase());
  const isLoading = bizLoading || invoicesLoading;

  // Usage
  const conversationCount = business?.conversation_count ?? 0;
  const conversationLimit = CONVERSATION_LIMITS[(currentPlan ?? 'decouverte').toLowerCase()] ?? 50;
  const usagePct = conversationLimit === Infinity ? 0 : Math.min(100, Math.round((conversationCount / conversationLimit) * 100));
  const usageColor = usagePct >= 80 ? 'bg-red-500' : usagePct >= 50 ? 'bg-amber-400' : 'bg-emerald-500';
  const atLimit = conversationLimit !== Infinity && conversationCount >= conversationLimit;

  // Trial extension eligibility
  const bizAny = business as (typeof business & Record<string, unknown>) | undefined;
  const trialExtended = bizAny?.trial_extended === true;
  const canExtend = (business?.subscription_status === 'trial' || business?.subscription_status === 'expired') && !trialExtended;
  const scheduledPlanChange = bizAny?.scheduled_plan_change as string | undefined;
  const planChangeDate = bizAny?.plan_change_date as string | undefined;

  const subscriptionBlocked = useMemo(() => {
    if (!business) return false;
    const s = business.subscription_status;
    return s === 'expired' || s === 'cancelled' || s === 'payment_failed';
  }, [business]);

  return (
    <DashboardLayout title="Facturation">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Expired / blocked banner */}
        {(isExpired || subscriptionBlocked) && !isLoading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4">
            <p className="text-sm font-semibold text-red-400 mb-1">
              {business?.subscription_status === 'payment_failed'
                ? 'Votre paiement a echoue.'
                : 'Votre essai gratuit a expire.'}
            </p>
            <p className="text-xs text-red-400/80">
              Choisissez un plan ci-dessous pour continuer a utiliser Ve&apos;a. Vos donnees sont conservees.
            </p>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3.5">
            <Check size={18} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">{successMsg}</p>
          </div>
        )}

        {/* ── Current Plan ───────────────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${GREEN}15` }}
              >
                <CreditCard size={20} style={{ color: GREEN }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Plan actuel</h2>
                <p className="text-xs text-gray-500">
                  Gerez votre abonnement et votre facturation
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {getPlanLabel(currentPlan)}
                  </span>
                  {business?.subscription_status === 'trial' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-full">
                      Essai
                    </span>
                  )}
                  {business?.subscription_status === 'active' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  )}
                </div>
                {currentPlanData?.monthlyPrice !== null && currentPlanData?.monthlyPrice !== undefined && (
                  <p className="text-sm text-gray-400">
                    {currentPlanData.monthlyPrice.toLocaleString('fr-FR')} XPF / mois
                  </p>
                )}
                {renewalDate && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Prochain renouvellement : {renewalDate}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowChangePlan(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 shrink-0 text-gray-950"
                style={{ backgroundColor: GREEN }}
              >
                Changer de plan
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Usage ──────────────────────────────────────────────────────── */}
        {!isLoading && business && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${GREEN}15` }}
              >
                <MessageSquare size={20} style={{ color: GREEN }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Utilisation ce mois</h2>
                <p className="text-xs text-gray-500">Conversations traitées par votre chatbot</p>
              </div>
            </div>

            {atLimit ? (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">
                  Limite atteinte — passez au plan supérieur pour continuer à recevoir des conversations.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{conversationCount.toLocaleString('fr-FR')}</span>
                {conversationLimit === Infinity
                  ? ' conversations'
                  : ` / ${conversationLimit.toLocaleString('fr-FR')} conversations ce mois`}
              </span>
              {conversationLimit !== Infinity && (
                <span className={cn(
                  'text-xs font-medium',
                  usagePct >= 80 ? 'text-red-400' : usagePct >= 50 ? 'text-amber-400' : 'text-emerald-400',
                )}>
                  {usagePct}%
                </span>
              )}
            </div>

            {conversationLimit !== Infinity && (
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', usageColor)}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Trial extension + Cancel ────────────────────────────────── */}
        {!isLoading && business && (
          <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-5 space-y-3">
            {/* Scheduled downgrade notice */}
            {scheduledPlanChange && planChangeDate && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <p className="text-sm text-amber-400">
                  Votre plan passera à{' '}
                  <span className="font-semibold capitalize">{scheduledPlanChange}</span>{' '}
                  le {new Date(planChangeDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {/* Trial extension — one-time */}
              {canExtend && (
                <button
                  onClick={handleExtendTrial}
                  disabled={extendLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all disabled:opacity-50"
                >
                  {extendLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Clock size={14} />
                  )}
                  J&apos;ai besoin de plus de temps (+7 jours)
                </button>
              )}

              {/* Cancel subscription — only for active paid plans */}
              {business.subscription_status === 'active' && currentPlan !== 'decouverte' && (
                <button
                  onClick={() => setShowCancelSurvey(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-gray-800 hover:border-red-500/30 transition-all"
                >
                  <X size={14} />
                  Annuler l&apos;abonnement
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Invoice History ────────────────────────────────────────────── */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${GREEN}15` }}
            >
              <FileText size={20} style={{ color: GREEN }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Historique des factures</h2>
              <p className="text-xs text-gray-500">
                Consultez et telechargez vos factures
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rect" className="h-14 w-full" />
              ))}
            </div>
          ) : !invoices || invoices.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <FileText size={40} className="mx-auto text-gray-700 mb-3" />
              <p className="text-sm text-gray-400 font-medium">
                Aucune facture pour le moment
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Vos factures apparaitront ici apres votre premiere souscription
              </p>
            </div>
          ) : (
            /* Invoice table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">
                      Periode
                    </th>
                    <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">
                      Montant
                    </th>
                    <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">
                      Statut
                    </th>
                    <th className="text-right text-xs text-gray-500 font-medium pb-3">
                      Facture
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <p className="text-sm text-white">
                          {formatPeriod(inv.period_start, inv.period_end)}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {formatDate(inv.created_at)}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="text-sm text-white font-medium">
                          {formatXPF(inv.amount)}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          <Download size={14} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Payment Info ───────────────────────────────────────────────── */}
        <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-5 space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Paiements sécurisés via Freemius. Une facture vous est envoyée chaque mois par email.
            <br />
            <span className="text-gray-600">
              PACIFIK&apos;AI — EI Jordy TOOFA — Patente G67367
            </span>
          </p>
          <a
            href="https://checkout.freemius.com/my"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={12} />
            Gérer mon abonnement (portail Freemius)
          </a>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showChangePlan && (
        <ChangePlanModal
          currentPlan={currentPlan}
          onClose={() => setShowChangePlan(false)}
          onConfirm={handleChangePlan}
          isLoading={changePlanLoading}
          userEmail={userEmail}
          onUpgradeSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['business'] });
            setSuccessMsg('Abonnement mis à jour ! Bienvenue sur votre nouveau plan.');
            setTimeout(() => setSuccessMsg(null), 5000);
          }}
        />
      )}

      {selectedInvoice && business && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          businessName={business.name}
          businessEmail={business.email ?? ''}
          businessPhone={business.phone}
          plan={business.plan}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {showCancelSurvey && (
        <CancellationSurveyModal
          onClose={() => setShowCancelSurvey(false)}
          onConfirm={handleCancel}
          isLoading={cancelLoading}
        />
      )}
    </DashboardLayout>
  );
}
