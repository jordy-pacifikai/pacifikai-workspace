'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, Bot, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Form input primitives ────────────────────────────────────────────────────

const inputClass =
  'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-lg px-3 py-2 text-sm transition-colors';

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5 font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200',
          checked ? 'bg-[#25D366] border-[#25D366]' : 'bg-gray-700 border-gray-700',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  onSave,
  isSaving,
  savedLabel,
  children,
}: {
  icon: React.ElementType;
  title: string;
  onSave?: () => void;
  isSaving?: boolean;
  savedLabel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <Icon className="w-4 h-4 text-[#25D366]" />
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      {onSave && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          {savedLabel ? (
            <span className="text-xs text-[#25D366] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
              Sauvegarde
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-5 py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <SkeletonCard />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, { label: string; color: string; limit: number }> = {
  free: { label: 'Gratuit', color: 'bg-gray-700 text-gray-300', limit: 50 },
  starter: { label: 'Starter', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', limit: 50 },
  pro: { label: 'Pro', color: 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40', limit: 500 },
  enterprise: { label: 'Enterprise', color: 'bg-violet-900/50 text-violet-300 border border-violet-700', limit: 2000 },
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { businessId, businessName } = useAppStore();
  const { data: business, isLoading } = useBusiness(businessId);
  const { mutate: updateBusiness } = useUpdateBusiness(businessId);

  // ── Section 1: General info ──────────────────────────────────────────────
  const [general, setGeneral] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    category: '',
    description: '',
  });
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);

  // ── Section 2: Chatbot ───────────────────────────────────────────────────
  const [chatbot, setChatbot] = useState({
    active: true,
    welcomeMessage: '',
    language: 'fr',
    tone: 'chaleureux',
  });
  const [chatbotSaving, setChatbotSaving] = useState(false);
  const [chatbotSaved, setChatbotSaved] = useState(false);

  // ── Section 3: Notifications ─────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    reminder24h: true,
    reminder2h: true,
    confirmationRequired: false,
  });
  const [notifsSaving, setNotifsSaving] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Sync from API
  useEffect(() => {
    if (!business) return;
    setGeneral({
      name: business.name ?? '',
      phone: business.phone ?? '',
      email: business.email ?? '',
      address: business.address ?? '',
      city: business.city ?? '',
      category: business.category ?? '',
      description: business.description ?? '',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (business as any).config ?? {};
    setChatbot({
      active: cfg.chatbot_active !== false,
      welcomeMessage: cfg.greeting ?? '',
      language: cfg.language ?? 'fr',
      tone: cfg.tone ?? 'chaleureux',
    });
  }, [business]);

  function flashSaved(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 3000);
  }

  function saveGeneral() {
    setGeneralSaving(true);
    updateBusiness(
      { name: general.name, phone: general.phone, email: general.email, address: general.address, city: general.city, category: general.category, description: general.description },
      {
        onSuccess: () => {
          setGeneralSaving(false);
          flashSaved(setGeneralSaved);
        },
        onError: () => setGeneralSaving(false),
      },
    );
  }

  function saveChatbot() {
    setChatbotSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingConfig = ((business as any)?.config ?? {}) as Record<string, unknown>;
    updateBusiness(
      {
        config: {
          ...existingConfig,
          chatbot_active: chatbot.active,
          greeting: chatbot.welcomeMessage,
          language: chatbot.language,
          tone: chatbot.tone,
        },
      } as Record<string, unknown>,
      {
        onSuccess: () => {
          setChatbotSaving(false);
          flashSaved(setChatbotSaved);
        },
        onError: () => setChatbotSaving(false),
      },
    );
  }

  function saveNotifs() {
    setNotifsSaving(true);
    updateBusiness(
      {},
      {
        onSuccess: () => {
          setNotifsSaving(false);
          flashSaved(setNotifsSaved);
        },
        onError: () => setNotifsSaving(false),
      },
    );
  }

  if (isLoading) return (
    <DashboardLayout title="Parametres" businessName={businessName ?? undefined}>
      <SettingsSkeleton />
    </DashboardLayout>
  );

  const plan = business?.subscription_plan ?? 'free';
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS['free'];

  // Load conversation usage from bookbot_businesses
  const sb = getSupabaseBrowser();
  const { data: usage } = useQuery({
    queryKey: ['plan-usage', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await sb
        .from('bookbot_businesses')
        .select('plan, conversation_count, billing_cycle_start')
        .eq('id', businessId)
        .single();
      return data as { plan: string; conversation_count: number; billing_cycle_start: string } | null;
    },
    enabled: Boolean(businessId),
  });

  const convCount = usage?.conversation_count ?? 0;
  const convLimit = PLAN_LABELS[usage?.plan ?? plan]?.limit ?? 50;
  const convPercent = Math.min(100, Math.round((convCount / convLimit) * 100));

  return (
    <DashboardLayout title="Parametres" businessName={businessName ?? undefined}>
      <div className="space-y-6 max-w-2xl">

        {/* ─ 1. General info ──────────────────────────────────────────────── */}
        <SectionCard
          icon={Building2}
          title="Informations generales"
          onSave={saveGeneral}
          isSaving={generalSaving}
          savedLabel={generalSaved}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Nom de l'etablissement">
              <input
                className={inputClass}
                placeholder="Mon salon"
                value={general.name}
                onChange={(e) => setGeneral((f) => ({ ...f, name: e.target.value }))}
              />
            </FormField>
            <FormField label="Categorie">
              <input
                className={inputClass}
                placeholder="Salon de beaute, Barbier..."
                value={general.category}
                onChange={(e) => setGeneral((f) => ({ ...f, category: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Telephone">
              <input
                className={inputClass}
                placeholder="+689 87 00 00 00"
                value={general.phone}
                onChange={(e) => setGeneral((f) => ({ ...f, phone: e.target.value }))}
              />
            </FormField>
            <FormField label="Email">
              <input
                className={inputClass}
                type="email"
                placeholder="contact@monbusiness.pf"
                value={general.email}
                onChange={(e) => setGeneral((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Adresse">
              <input
                className={inputClass}
                placeholder="Rue de la paix"
                value={general.address}
                onChange={(e) => setGeneral((f) => ({ ...f, address: e.target.value }))}
              />
            </FormField>
            <FormField label="Ville">
              <input
                className={inputClass}
                placeholder="Papeete"
                value={general.city}
                onChange={(e) => setGeneral((f) => ({ ...f, city: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label="Description" hint="Visible dans votre page de reservation publique.">
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Decrivez votre etablissement..."
              value={general.description}
              onChange={(e) => setGeneral((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
        </SectionCard>

        {/* ─ 2. Chatbot ───────────────────────────────────────────────────── */}
        <SectionCard
          icon={Bot}
          title="Chatbot BookBot"
          onSave={saveChatbot}
          isSaving={chatbotSaving}
          savedLabel={chatbotSaved}
        >
          <ToggleRow
            label="Chatbot actif"
            description="Le chatbot repond aux clients via WhatsApp et prend les rendez-vous automatiquement."
            checked={chatbot.active}
            onChange={(v) => setChatbot((f) => ({ ...f, active: v }))}
          />

          <FormField
            label="Message de bienvenue"
            hint="Premier message envoye au client lorsqu'il contacte le chatbot."
          >
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Bonjour ! Je suis l'assistant de [votre salon]. Comment puis-je vous aider ?"
              value={chatbot.welcomeMessage}
              onChange={(e) => setChatbot((f) => ({ ...f, welcomeMessage: e.target.value }))}
            />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Langue par defaut">
              <select
                className={inputClass}
                value={chatbot.language}
                onChange={(e) => setChatbot((f) => ({ ...f, language: e.target.value }))}
              >
                <option value="fr">Francais</option>
                <option value="en">Anglais</option>
                <option value="tah">Tahitien</option>
              </select>
            </FormField>
            <FormField label="Ton du chatbot">
              <select
                className={inputClass}
                value={chatbot.tone}
                onChange={(e) => setChatbot((f) => ({ ...f, tone: e.target.value }))}
              >
                <option value="chaleureux">Chaleureux</option>
                <option value="formel">Formel</option>
                <option value="decontracte">Decontracte</option>
              </select>
            </FormField>
          </div>
        </SectionCard>

        {/* ─ 3. Notifications ─────────────────────────────────────────────── */}
        <SectionCard
          icon={Bell}
          title="Notifications"
          onSave={saveNotifs}
          isSaving={notifsSaving}
          savedLabel={notifsSaved}
        >
          <ToggleRow
            label="Rappel 24h avant le RDV"
            description="Envoie un message de rappel au client la veille de son rendez-vous."
            checked={notifs.reminder24h}
            onChange={(v) => setNotifs((f) => ({ ...f, reminder24h: v }))}
          />
          <ToggleRow
            label="Rappel 2h avant le RDV"
            description="Envoie un message de rappel 2 heures avant le rendez-vous."
            checked={notifs.reminder2h}
            onChange={(v) => setNotifs((f) => ({ ...f, reminder2h: v }))}
          />
          <ToggleRow
            label="Confirmation requise"
            description="Le client doit confirmer explicitement son rendez-vous pour qu'il soit valide."
            checked={notifs.confirmationRequired}
            onChange={(v) => setNotifs((f) => ({ ...f, confirmationRequired: v }))}
          />
        </SectionCard>

        {/* ─ 4. Subscription ──────────────────────────────────────────────── */}
        <SectionCard icon={CreditCard} title="Abonnement">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Plan actuel</p>
              <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold', planMeta.color)}>
                {planMeta.label}
              </span>
            </div>
            <button
              disabled
              className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-400 rounded-lg px-4 py-2 text-sm border border-gray-700 cursor-not-allowed opacity-60"
            >
              Upgrade
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Usage conversations */}
          <div className="border-t border-gray-800 pt-4 mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300 font-medium">Conversations ce mois</p>
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">{convCount}</span> / {convLimit}
              </p>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  convPercent >= 90 ? 'bg-red-500' : convPercent >= 70 ? 'bg-yellow-500' : 'bg-[#25D366]',
                )}
                style={{ width: `${convPercent}%` }}
              />
            </div>
            {convPercent >= 90 && (
              <p className="text-xs text-red-400">
                Vous approchez de la limite de votre plan. Passez au plan superieur pour continuer sans interruption.
              </p>
            )}
            {usage?.billing_cycle_start && (
              <p className="text-xs text-gray-500">
                Cycle de facturation demarre le{' '}
                {new Date(usage.billing_cycle_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 mt-2">
            <p className="text-xs text-gray-500">
              Pour modifier votre abonnement ou obtenir une offre personnalisee, contactez notre equipe a{' '}
              <span className="text-[#25D366]">support@bookflow.pf</span>
            </p>
          </div>
        </SectionCard>

      </div>
    </DashboardLayout>
  );
}
