'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UserCircle,
  Download,
  Trash2,
  ExternalLink,
  AlertTriangle,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookbotBusiness = Record<string, any>;

// ─── Plan label map ───────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  essentiel: { label: 'Essentiel', color: 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40' },
  business:  { label: 'Business',  color: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
  premium:   { label: 'Premium',   color: 'bg-amber-900/50 text-amber-300 border border-amber-700' },
};

// ─── Deletion confirmation modal ──────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean;
  businessName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteAccountModal({ open, businessName, onConfirm, onCancel, loading }: DeleteModalProps) {
  const [typedName, setTypedName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTypedName('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isMatch = typedName.trim().toLowerCase() === businessName.trim().toLowerCase();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 id="account-modal-title" className="text-white font-semibold text-base">Supprimer mon compte</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cette action est irreversible</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Warning box */}
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 space-y-2">
              <p className="text-sm text-red-300 font-medium">Ce qui sera supprime dans 30 jours :</p>
              <ul className="text-sm text-gray-400 space-y-1 list-none">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Votre profil business et parametres
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Tous vos clients et historique
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Tous vos rendez-vous et avis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Votre chatbot et base de connaissances
                </li>
              </ul>
            </div>

            {/* Name confirmation input */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirmez en tapant le nom de votre business :{' '}
                <span className="text-white font-semibold">{businessName}</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={businessName}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none rounded-lg px-3 py-2.5 text-sm transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={!isMatch || loading}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all',
                  isMatch && !loading
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-red-500/30 cursor-not-allowed opacity-50',
                )}
              >
                {loading ? 'Traitement...' : 'Supprimer definitivement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Info row (read-only) ─────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-200 font-medium">{value || '—'}</span>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
  danger,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-gray-900 rounded-xl overflow-hidden',
        danger
          ? 'border border-red-500/30'
          : 'border border-gray-800',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-6 py-4 border-b',
          danger ? 'border-red-500/20' : 'border-gray-800',
        )}
      >
        <Icon
          className={cn('w-4 h-4', danger ? 'text-red-400' : 'text-[#25D366]')}
        />
        <h2 className={cn('font-semibold', danger ? 'text-red-300' : 'text-white')}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { businessId, businessName } = useAppStore();
  const sb = getSupabaseBrowser();

  const [exportLoading, setExportLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: business, isLoading } = useQuery<BookbotBusiness | null>({
    queryKey: ['bookbot-business-account', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await sb
        .from('bookbot_businesses')
        .select('name, email, phone, plan, config, deletion_requested_at')
        .eq('id', businessId)
        .single();
      return data;
    },
    enabled: Boolean(businessId),
  });

  // ── Export handler ────────────────────────────────────────────────────────

  async function handleExport() {
    setExportLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error ?? 'Erreur lors de l\'export');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `vea-export-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg('Erreur reseau. Veuillez reessayer.');
    } finally {
      setExportLoading(false);
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────

  async function handleDelete() {
    setDeleteLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error ?? 'Erreur lors de la demande de suppression');
        setDeleteModalOpen(false);
        return;
      }
      setDeleteModalOpen(false);
      setDeleteSuccess(true);
    } catch {
      setErrorMsg('Erreur reseau. Veuillez reessayer.');
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  const plan = business?.plan ?? 'essentiel';
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS['essentiel'];
  const displayName = business?.name ?? businessName ?? 'Mon Business';
  const businessEmail = business?.config?.email ?? '';
  const businessPhone = business?.phone ?? '';
  const deletionPending = Boolean(business?.deletion_requested_at);

  return (
    <DashboardLayout title="Mon compte" businessName={businessName ?? undefined}>
      <div className="space-y-6 max-w-2xl">

        {/* ─ 1. Profil ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <SectionCard icon={UserCircle} title="Profil">
            <div className="space-y-0">
              <InfoRow label="Nom du business" value={displayName} />
              <InfoRow label="Email" value={businessEmail} />
              <InfoRow label="Telephone" value={businessPhone} />
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Plan actuel</span>
                <div className="flex items-center gap-3">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', planMeta.color)}>
                    {planMeta.label}
                  </span>
                  <Link
                    href="/pricing"
                    className="text-xs text-[#25D366] hover:underline flex items-center gap-1"
                  >
                    Changer
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={14} />
                Modifier mes informations dans Parametres
              </Link>
            </div>
          </SectionCard>
        )}

        {/* ─ 2. Donnees personnelles ────────────────────────────────────────── */}
        <SectionCard icon={Shield} title="Mes donnees (RGPD)">
          <div className="space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Conformement au RGPD, vous pouvez a tout moment telecharger une copie complete de toutes vos donnees
              stockees dans Ve&apos;a (clients, rendez-vous, parametres, avis).
            </p>
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 flex items-center justify-center shrink-0">
                <Download size={17} className="text-[#25D366]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">Exporter mes donnees</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Telecharge un fichier JSON complet avec vos clients, rendez-vous, avis et parametres.
                </p>
                <button
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="mt-3 inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  {exportLoading ? 'Generation en cours...' : 'Telecharger mes donnees'}
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─ 3. Zone dangereuse ─────────────────────────────────────────────── */}
        <SectionCard icon={Trash2} title="Zone dangereuse" danger>
          {deleteSuccess || deletionPending ? (
            <div className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/20 rounded-xl">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Suppression planifiee</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Votre compte et toutes vos donnees seront supprimes dans 30 jours.
                  Pour annuler, contactez{' '}
                  <span className="text-[#25D366]">support@vea.pacifikai.com</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                La suppression de votre compte entrainera la suppression definitive de toutes vos donnees
                apres un delai de grâce de 30 jours. Cette action est irreversible.
              </p>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all"
              >
                <Trash2 size={15} />
                Supprimer mon compte
              </button>
            </div>
          )}
        </SectionCard>

        {/* Error banner */}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg(null)}
              className="ml-auto p-1 rounded text-red-400 hover:text-red-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Deletion confirmation modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        businessName={displayName}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
}
