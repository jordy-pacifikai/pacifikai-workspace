'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, Bot, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const PLAN_LABELS: Record<string, { label: string; color: string; limit: number; price?: string; annual?: string }> = {
  essentiel: { label: 'Essentiel', color: 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40', limit: 200, price: '9 900 XPF/mois', annual: '99 000 XPF/an' },
  business: { label: 'Business', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', limit: 500, price: '19 900 XPF/mois', annual: '199 000 XPF/an' },
  premium: { label: 'Premium', color: 'bg-amber-900/50 text-amber-300 border border-amber-700', limit: 999999, price: 'Sur devis' },
};

// ─── Main page ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookbotBusiness = Record<string, any>;

export default function SettingsPage() {
  const { businessId, businessName } = useAppStore();
  const sb = getSupabaseBrowser();
  const queryClient = useQueryClient();

  // Read from bookbot_businesses (source of truth — onboarding writes here)
  const { data: business, isLoading } = useQuery<BookbotBusiness | null>({
    queryKey: ['bookbot-business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await sb
        .from('bookbot_businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      return data;
    },
    enabled: Boolean(businessId),
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await sb
        .from('bookbot_businesses')
        .update(updates)
        .eq('id', businessId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookbot-business', businessId] });
    },
  });

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
    customInstructions: '',
    requiredFields: [] as string[],
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

  // Sync from API — bookbot_businesses schema
  useEffect(() => {
    if (!business) return;
    const cfg = business.config ?? {};
    setGeneral({
      name: business.name ?? '',
      phone: business.phone ?? '',
      email: cfg.email ?? '',
      address: cfg.address ?? '',
      city: cfg.city ?? '',
      category: business.sector ?? cfg.category ?? '',
      description: cfg.description ?? '',
    });
    setChatbot({
      active: cfg.chatbot_active !== false,
      welcomeMessage: cfg.greeting ?? '',
      language: cfg.language ?? 'fr',
      tone: cfg.tone ?? 'chaleureux',
      customInstructions: cfg.custom_instructions ?? '',
      requiredFields: (cfg.required_fields as string[]) ?? [],
    });
    setNotifs({
      reminder24h: cfg.reminder_24h !== false,
      reminder2h: cfg.reminder_2h !== false,
      confirmationRequired: cfg.confirmation_required === true,
    });
  }, [business]);

  function flashSaved(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 3000);
  }

  function saveGeneral() {
    setGeneralSaving(true);
    const existingConfig = (business?.config ?? {}) as Record<string, unknown>;
    updateMutation.mutate(
      {
        name: general.name,
        phone: general.phone,
        sector: general.category,
        config: {
          ...existingConfig,
          email: general.email,
          address: general.address,
          city: general.city,
          category: general.category,
          description: general.description,
        },
      },
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
    const existingConfig = (business?.config ?? {}) as Record<string, unknown>;
    updateMutation.mutate(
      {
        config: {
          ...existingConfig,
          chatbot_active: chatbot.active,
          greeting: chatbot.welcomeMessage,
          language: chatbot.language,
          tone: chatbot.tone,
          custom_instructions: chatbot.customInstructions,
          required_fields: chatbot.requiredFields,
        },
      },
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
    const existingConfig = (business?.config ?? {}) as Record<string, unknown>;
    updateMutation.mutate(
      {
        config: {
          ...existingConfig,
          reminder_24h: notifs.reminder24h,
          reminder_2h: notifs.reminder2h,
          confirmation_required: notifs.confirmationRequired,
        },
      },
      {
        onSuccess: () => {
          setNotifsSaving(false);
          flashSaved(setNotifsSaved);
        },
        onError: () => setNotifsSaving(false),
      },
    );
  }

  // Load conversation usage (must be before any early return)
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

  if (isLoading) return (
    <DashboardLayout title="Parametres" businessName={businessName ?? undefined}>
      <SettingsSkeleton />
    </DashboardLayout>
  );

  const plan = business?.plan ?? usage?.plan ?? 'essentiel';
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS['essentiel'];
  const convCount = usage?.conversation_count ?? 0;
  const convLimit = PLAN_LABELS[usage?.plan ?? plan]?.limit ?? 200;
  const isUnlimited = convLimit >= 999999;
  const convPercent = isUnlimited ? 0 : Math.min(100, Math.round((convCount / convLimit) * 100));

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
          title="Chatbot Ve'a"
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

          <FormField
            label="Informations a collecter avant reservation"
            hint="Le chatbot demandera ces infos au client avant de confirmer le rendez-vous."
          >
            <div className="space-y-1">
              {[
                { key: 'phone', label: 'Numero de telephone' },
                { key: 'email', label: 'Adresse email' },
                { key: 'notes', label: 'Notes / remarques du client' },
              ].map((field) => (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer py-1.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 bg-gray-800 text-[#25D366] focus:ring-[#25D366]"
                    checked={chatbot.requiredFields.includes(field.key)}
                    onChange={(e) => {
                      setChatbot((f) => ({
                        ...f,
                        requiredFields: e.target.checked
                          ? [...f.requiredFields, field.key]
                          : f.requiredFields.filter((k) => k !== field.key),
                      }));
                    }}
                  />
                  <span className="text-sm text-gray-300">{field.label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField
            label="Instructions personnalisees"
            hint="Consignes specifiques pour le chatbot (ex: pas de coloration le lundi, prix minimum 3000 XPF). Max 500 caracteres."
          >
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={4}
              maxLength={500}
              placeholder="Ex: On ne prend pas les enfants de moins de 5 ans. Pas de coloration apres 16h. Parking gratuit derriere le salon."
              value={chatbot.customInstructions}
              onChange={(e) => setChatbot((f) => ({ ...f, customInstructions: e.target.value }))}
            />
            <p className="mt-1 text-xs text-gray-600 text-right">{chatbot.customInstructions.length}/500</p>
          </FormField>
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
                <span className="text-white font-semibold">{convCount}</span>{isUnlimited ? '' : ` / ${convLimit}`}
                {isUnlimited && <span className="ml-1 text-amber-400 text-xs font-medium">Illimite</span>}
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
              <span className="text-[#25D366]">support@vea.pacifikai.com</span>
            </p>
          </div>
        </SectionCard>

      </div>
    </DashboardLayout>
  );
}
