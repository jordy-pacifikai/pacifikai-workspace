'use client';

import { useState, useEffect } from 'react';
import {
  Plug, MessageCircle, Send, Instagram, CheckCircle2, Circle,
  Copy, Check, LogIn, LogOut, Loader2, AlertCircle, Calendar,
  ChevronRight, ChevronLeft, ExternalLink, Shield, Eye, EyeOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import {
  useConnectedChannels,
  startFacebookOAuth,
  useSelectPage,
  useDisconnectFacebook,
  type FacebookPageOption,
} from '@/hooks/useChannels';
import {
  useGoogleCalendarStatus,
  useConnectGoogle,
  useDisconnectGoogle,
} from '@/hooks/useGoogleCalendar';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WhatsAppConfig {
  whatsapp_phone_number_id?: string;
  whatsapp_access_token?: string;
  whatsapp_verify_token?: string;
  whatsapp_enabled?: boolean;
}

// ─── WhatsApp Card (guided setup) ─────────────────────────────────────────────

const WA_SETUP_STEPS = [
  {
    title: 'Acceder a Meta Business Suite',
    description: 'Ouvrez votre compte Meta Business Suite et allez dans la section WhatsApp API.',
    instruction: 'Meta Business Suite → Parametres → WhatsApp → Configuration API',
    link: 'https://business.facebook.com/settings/whatsapp',
    linkLabel: 'Ouvrir Meta Business Suite',
  },
  {
    title: 'Phone Number ID',
    description: 'Copiez votre Phone Number ID depuis la section API Setup de Meta Business.',
    instruction: 'Vous le trouvez dans : API Setup → Phone Number ID (chiffres uniquement)',
    field: 'whatsapp_phone_number_id',
    placeholder: 'Ex: 123456789012345',
  },
  {
    title: 'Token d\'acces permanent',
    description: 'Generez un token permanent pour que le chatbot puisse envoyer des messages.',
    instruction: 'System User → Generate Token → whatsapp_business_messaging + whatsapp_business_management',
    link: 'https://business.facebook.com/settings/system-users',
    linkLabel: 'Gerer les System Users',
    field: 'whatsapp_access_token',
    placeholder: 'EAABx...',
    isSecret: true,
  },
  {
    title: 'URL du Webhook',
    description: 'Configurez cette URL dans Meta Developer pour recevoir les messages entrants.',
    instruction: 'Meta Developer → Votre App → WhatsApp → Configuration → Callback URL',
    isWebhook: true,
  },
  {
    title: 'Verify Token',
    description: 'Choisissez un token de verification pour securiser le webhook.',
    instruction: 'Ce token doit correspondre a celui saisi dans Meta Developer → Webhook → Verify Token',
    field: 'whatsapp_verify_token',
    placeholder: 'Ex: vea_verify_2026',
  },
] as const;

function WhatsAppCard({
  config,
  onChange,
  onToggle,
  webhookUrl,
}: {
  config: WhatsAppConfig;
  onChange: (key: string, value: string) => void;
  onToggle: () => void;
  webhookUrl: string;
}) {
  const [setupStep, setSetupStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const enabled = Boolean(config.whatsapp_enabled);

  // Check if all fields are filled to show summary view
  const isConfigured = Boolean(
    config.whatsapp_phone_number_id?.trim() &&
    config.whatsapp_access_token?.trim() &&
    config.whatsapp_verify_token?.trim()
  );

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function verifyToken() {
    const token = config.whatsapp_access_token?.trim();
    if (!token) {
      setVerifyResult({ ok: false, msg: 'Aucun token saisi' });
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(token)}`
      );
      const data = await res.json();
      if (data.error) {
        setVerifyResult({ ok: false, msg: data.error.message || 'Token invalide' });
      } else {
        setVerifyResult({ ok: true, msg: `Token valide — ${data.name || 'System User'}` });
      }
    } catch {
      setVerifyResult({ ok: false, msg: 'Erreur reseau — verifiez votre connexion' });
    } finally {
      setVerifying(false);
    }
  }

  const currentStep = WA_SETUP_STEPS[setupStep];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D36615' }}>
            <MessageCircle size={20} style={{ color: '#25D366' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">WhatsApp Business</h3>
            <p className="text-xs text-gray-500">Meta Cloud API — Guide etape par etape</p>
          </div>
        </div>
        <button onClick={onToggle} className="flex items-center gap-2 text-sm transition" style={{ color: enabled ? '#25D366' : '#6b7280' }}>
          {enabled ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          {enabled ? 'Actif' : 'Inactif'}
        </button>
      </div>

      {/* Step progress dots */}
      <div className="flex items-center gap-1.5 mb-5">
        {WA_SETUP_STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setSetupStep(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === setupStep ? '24px' : '8px',
              backgroundColor: i <= setupStep ? '#25D366' : '#374151',
            }}
          />
        ))}
        <span className="ml-2 text-xs text-gray-500">{setupStep + 1}/{WA_SETUP_STEPS.length}</span>
      </div>

      {/* Current step content */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-gray-950" style={{ backgroundColor: '#25D366' }}>
              {setupStep + 1}
            </span>
            {currentStep.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1">{currentStep.description}</p>
        </div>

        {/* Instruction callout */}
        <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-300 font-mono leading-relaxed">{currentStep.instruction}</p>
        </div>

        {/* External link */}
        {'link' in currentStep && currentStep.link && (
          <a
            href={currentStep.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition hover:opacity-80"
            style={{ color: '#25D366' }}
          >
            <ExternalLink size={12} />
            {currentStep.linkLabel}
          </a>
        )}

        {/* Input field (if this step has one) */}
        {'field' in currentStep && currentStep.field && (
          <div>
            <div className="relative">
              <input
                type={'isSecret' in currentStep && currentStep.isSecret && !showToken ? 'password' : 'text'}
                value={(config as Record<string, string>)[currentStep.field] ?? ''}
                onChange={(e) => onChange(currentStep.field!, e.target.value)}
                placeholder={currentStep.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#25D366]/50 font-mono pr-10"
              />
              {'isSecret' in currentStep && currentStep.isSecret && (
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>

            {/* Token verification (only for access token step) */}
            {currentStep.field === 'whatsapp_access_token' && config.whatsapp_access_token?.trim() && (
              <div className="mt-2 space-y-2">
                <button
                  onClick={verifyToken}
                  disabled={verifying}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    borderColor: 'rgba(37, 211, 102, 0.3)',
                    backgroundColor: 'rgba(37, 211, 102, 0.05)',
                    color: '#25D366',
                  }}
                >
                  {verifying ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                  {verifying ? 'Verification...' : 'Verifier le token'}
                </button>
                {verifyResult && (
                  <div className={`flex items-start gap-2 p-2 rounded-lg text-xs ${verifyResult.ok ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {verifyResult.ok ? <CheckCircle2 size={13} className="shrink-0 mt-0.5" /> : <AlertCircle size={13} className="shrink-0 mt-0.5" />}
                    {verifyResult.msg}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Webhook URL display (step 4) */}
        {'isWebhook' in currentStep && currentStep.isWebhook && (
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Callback URL a coller dans Meta Developer</span>
              <button onClick={copyWebhook} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copie !' : 'Copier'}
              </button>
            </div>
            <p className="text-xs text-[#25D366] font-mono break-all">{webhookUrl}</p>
          </div>
        )}
      </div>

      {/* Step navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
        <button
          onClick={() => setSetupStep(Math.max(0, setupStep - 1))}
          disabled={setupStep === 0}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
          Precedent
        </button>
        {setupStep < WA_SETUP_STEPS.length - 1 ? (
          <button
            onClick={() => setSetupStep(setupStep + 1)}
            className="flex items-center gap-1 text-xs font-medium transition hover:opacity-80"
            style={{ color: '#25D366' }}
          >
            Suivant
            <ChevronRight size={14} />
          </button>
        ) : isConfigured ? (
          <span className="flex items-center gap-1.5 text-xs text-[#25D366]">
            <CheckCircle2 size={13} />
            Configuration complete
          </span>
        ) : (
          <span className="text-xs text-gray-500">Remplissez tous les champs</span>
        )}
      </div>
    </div>
  );
}

// ─── Facebook Connected Card (Messenger + Instagram) ───────────────────────────

function FacebookConnectedCard({
  businessId,
  dashboardUrl,
}: {
  businessId: string;
  dashboardUrl: string;
}) {
  const { data: connected, isLoading } = useConnectedChannels(businessId);
  const selectPage = useSelectPage(businessId);
  const disconnectFacebook = useDisconnectFacebook(businessId);

  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle OAuth callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('fb_connected') === 'true') {
      setSuccessMsg('Facebook connecte avec succes !');
      window.history.replaceState({}, '', '/channels');
    }

    const fbError = params.get('fb_error');
    if (fbError) {
      setError(fbError);
      window.history.replaceState({}, '', '/channels');
    }

    const fbSession = params.get('fb_session');
    if (fbSession) {
      window.history.replaceState({}, '', '/channels');
      fetch(`/api/auth/facebook/pages?session=${encodeURIComponent(fbSession)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.pages) {
            setPages(data.pages as FacebookPageOption[]);
            setShowPagePicker(true);
          } else {
            setError(data.error ?? 'Session expiree');
          }
        })
        .catch(() => setError('Erreur lors du chargement des pages Facebook'));
    }
  }, []);

  function handleConnect() {
    startFacebookOAuth(businessId);
  }

  async function handleSelectPage(page: FacebookPageOption) {
    setError('');
    try {
      await selectPage.mutateAsync(page);
      setShowPagePicker(false);
      setPages([]);
      setSuccessMsg('Page connectee avec succes !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion de la page');
    }
  }

  async function handleDisconnect() {
    setError('');
    setSuccessMsg('');
    try {
      await disconnectFacebook.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la deconnexion');
    }
  }

  if (isLoading) {
    return <SkeletonCard />;
  }

  const isConnecting = selectPage.isPending;
  const isDisconnecting = disconnectFacebook.isPending;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0084FF15' }}>
            <Send size={20} style={{ color: '#0084FF' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Messenger & Instagram</h3>
            <p className="text-xs text-gray-500">
              Connexion automatique via Facebook — Token permanent
            </p>
          </div>
        </div>
        {connected && (
          connected.tokenStatus === 'invalid' ? (
            <span className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={18} />
              Token expire
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-[#25D366]">
              <CheckCircle2 size={18} />
              Connecte
            </span>
          )
        )}
      </div>

      {/* Success */}
      {successMsg && (
        <div className="mb-4 p-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={16} className="text-[#25D366] shrink-0 mt-0.5" />
          <p className="text-xs text-[#25D366]">{successMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Connected state */}
      {connected ? (
        <div className="space-y-3">
          {connected.tokenStatus === 'invalid' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Token Facebook expire</p>
                <p className="text-xs text-red-400/70 mt-1">
                  Le chatbot ne peut plus repondre sur Messenger/Instagram. Deconnecte puis reconnecte ta Page pour renouveler le token.
                </p>
              </div>
            </div>
          )}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{connected.pageName ?? 'Page Facebook'}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {connected.pageId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-[#0084FF]/10 text-[#0084FF]">
                  Messenger
                </span>
                {connected.igAccountId && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#E4405F]/10 text-[#E4405F]">
                    Instagram
                  </span>
                )}
              </div>
            </div>
            {connected.connectedAt && (
              <p className="text-xs text-gray-600 mt-2">
                Connecte le {new Date(connected.connectedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {/* Webhook URLs (read-only, auto-configured) */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-xs text-gray-500 mb-1">Webhooks (auto-configures)</p>
            <p className="text-xs text-gray-400 font-mono break-all">{dashboardUrl}/api/webhook/messenger</p>
            {connected.igAccountId && (
              <p className="text-xs text-gray-400 font-mono break-all mt-1">{dashboardUrl}/api/webhook/instagram</p>
            )}
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition disabled:opacity-40"
          >
            {isDisconnecting ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            Deconnecter
          </button>
        </div>
      ) : showPagePicker ? (
        /* Page picker after OAuth */
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Selectionne la Page Facebook a connecter :</p>
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => handleSelectPage(page)}
              disabled={selectPage.isPending}
              className="w-full p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-[#0084FF]/50 transition text-left disabled:opacity-40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{page.name}</p>
                  <p className="text-xs text-gray-500 font-mono">ID: {page.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-[#0084FF]/10 text-[#0084FF]">
                    Messenger
                  </span>
                  {page.instagram_business_account_id && (
                    <span className="px-2 py-1 text-xs rounded-full bg-[#E4405F]/10 text-[#E4405F]">
                      Instagram
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Not connected — show connect button */
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#1877F2' }}
          >
            {isConnecting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {isConnecting ? 'Connexion en cours...' : 'Connecter avec Facebook'}
          </button>
          <p className="text-xs text-gray-600 text-center">
            Un seul clic connecte Messenger ET Instagram (si lie a la Page)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const businessId = useAppStore((s) => s.businessId);
  const { data: business, isLoading } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness(businessId);

  const [waConfig, setWaConfig] = useState<WhatsAppConfig>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load WhatsApp config from business
  useEffect(() => {
    if (!business) return;
    const c = (business as unknown as Record<string, unknown>).config as WhatsAppConfig | undefined;
    if (c) {
      setWaConfig({
        whatsapp_phone_number_id: c.whatsapp_phone_number_id,
        whatsapp_access_token: c.whatsapp_access_token,
        whatsapp_verify_token: c.whatsapp_verify_token,
        whatsapp_enabled: c.whatsapp_enabled,
      });
    }
  }, [business]);

  function updateWaField(key: string, value: string) {
    setWaConfig((prev) => ({ ...prev, [key]: value }));
  }

  function toggleWhatsApp() {
    setWaConfig((prev) => ({ ...prev, whatsapp_enabled: !prev.whatsapp_enabled }));
  }

  async function saveWhatsAppConfig() {
    if (!businessId) return;
    setSaving(true);
    setSaveMsg('');

    const existingConfig = ((business as unknown as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>;

    updateBusiness.mutate(
      {
        config: {
          ...existingConfig,
          ...waConfig,
        },
      } as Record<string, unknown>,
      {
        onSuccess: () => {
          setSaveMsg('Configuration sauvegardee');
          setTimeout(() => setSaveMsg(''), 3000);
          setSaving(false);
        },
        onError: () => {
          setSaveMsg('Erreur lors de la sauvegarde');
          setSaving(false);
        },
      },
    );
  }

  const dashboardUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dashboard.vea.pacifikai.com';

  return (
    <DashboardLayout title="Canaux de messagerie">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plug size={24} style={{ color: '#25D366' }} />
            Canaux de messagerie
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connecte ton chatbot a WhatsApp, Messenger et Instagram
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Google Calendar — sync bidirectionnelle */}
          <GoogleCalendarSection businessId={businessId} />

          {/* Messenger & Instagram — OAuth auto */}
          {businessId && (
            <FacebookConnectedCard
              businessId={businessId}
              dashboardUrl={dashboardUrl}
            />
          )}

          {/* WhatsApp — manual config */}
          <WhatsAppCard
            config={waConfig}
            onChange={updateWaField}
            onToggle={toggleWhatsApp}
            webhookUrl={`${dashboardUrl}/api/whatsapp`}
          />

          {/* Save WhatsApp config */}
          <div className="flex items-center justify-end gap-3">
            {saveMsg && (
              <span className="text-sm text-[#25D366]">{saveMsg}</span>
            )}
            <button
              onClick={saveWhatsAppConfig}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#25D366' }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder WhatsApp'}
            </button>
          </div>

          {/* Help section */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Comment connecter ?</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-[#0084FF] mb-2">Messenger & Instagram (automatique)</h4>
                <ol className="space-y-1.5 text-sm text-gray-400">
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">1.</span>
                    Clique sur &quot;Connecter avec Facebook&quot;
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">2.</span>
                    Autorise les permissions dans la popup
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">3.</span>
                    Selectionne ta Page — les webhooks se configurent automatiquement
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#25D366] mb-2">WhatsApp (guide integre)</h4>
                <p className="text-sm text-gray-400">
                  Suis le guide etape par etape dans la carte WhatsApp ci-dessus. Le token est verifie automatiquement avant la sauvegarde.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// ─── Google Calendar Section ─────────────────────────────────────────────────

function GoogleCalendarSection({ businessId }: { businessId: string | null }) {
  const { data: gcalStatus, isLoading } = useGoogleCalendarStatus(businessId);
  const connectGoogle = useConnectGoogle(businessId);
  const disconnectGoogle = useDisconnectGoogle(businessId);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const isConnected = Boolean(gcalStatus?.gcal_connected_at);
  const isDisconnected = Boolean(gcalStatus?.gcal_disconnected);

  // Check URL params for OAuth callback result
  const [callbackMsg, setCallbackMsg] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gcal_connected') === 'true') {
      setCallbackMsg('Google Calendar connecte avec succes !');
      window.history.replaceState({}, '', '/channels');
    } else if (params.get('gcal_error')) {
      setCallbackMsg(`Erreur: ${params.get('gcal_error')}`);
      window.history.replaceState({}, '', '/channels');
    }
  }, []);

  if (isLoading) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Calendar size={20} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Google Calendar</h3>
          <p className="text-xs text-gray-500">Synchroniser les RDV avec votre calendrier Google</p>
        </div>
        <div className="ml-auto">
          {isDisconnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertCircle size={12} />
              Deconnecte
            </span>
          ) : isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
              <CheckCircle2 size={12} />
              Connecte
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
              <Circle size={12} />
              Non connecte
            </span>
          )}
        </div>
      </div>

      {callbackMsg && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${callbackMsg.includes('Erreur') ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30'}`}>
          {callbackMsg}
        </div>
      )}

      {isDisconnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Connexion Google Calendar perdue</p>
              <p className="text-xs text-red-400/70 mt-1">
                Google a revoque l&apos;acces a votre calendrier. Les nouveaux RDV ne sont plus synchronises.
                Reconnectez votre compte pour reprendre la synchronisation.
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Ancien calendrier</p>
            <p className="text-sm text-gray-400">{gcalStatus?.gcal_calendar_id ?? 'Principal'}</p>
          </div>
          <button
            onClick={() => connectGoogle.mutate()}
            disabled={connectGoogle.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4285F4' }}
          >
            <Calendar size={15} />
            {connectGoogle.isPending ? 'Reconnexion...' : 'Reconnecter Google Calendar'}
          </button>
        </div>
      ) : isConnected ? (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Calendrier</p>
            <p className="text-sm text-gray-200">{gcalStatus?.gcal_calendar_id ?? 'Principal'}</p>
          </div>
          {gcalStatus?.gcal_connected_at && (
            <p className="text-xs text-gray-500">
              Connecte le {new Date(gcalStatus.gcal_connected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Les nouveaux RDV sont automatiquement ajoutes a votre Google Calendar. Les annulations sont aussi synchronisees.
          </p>
          <button
            onClick={() => setShowDisconnectModal(true)}
            disabled={disconnectGoogle.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-red-400 text-sm font-medium border border-gray-700 hover:border-red-500/40 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <LogOut size={15} />
            {disconnectGoogle.isPending ? 'Deconnexion...' : 'Deconnecter'}
          </button>

          {/* Disconnect modal */}
          {showDisconnectModal && (
            <>
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowDisconnectModal(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="channel-modal-title">
                  <div className="px-5 py-4 border-b border-gray-800">
                    <h2 id="channel-modal-title" className="text-white font-semibold">Deconnecter Google Calendar</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Que souhaitez-vous faire avec les creneaux synchronises depuis Google Calendar ?
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <button
                      onClick={() => {
                        disconnectGoogle.mutate({ keepSlots: false }, { onSuccess: () => setShowDisconnectModal(false) });
                      }}
                      disabled={disconnectGoogle.isPending}
                      className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-red-500/40 hover:bg-red-500/10 transition-colors text-left disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-red-400">Supprimer les creneaux GCal</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Les creneaux bloques importes depuis Google Calendar seront supprimes du dashboard.
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        disconnectGoogle.mutate({ keepSlots: true }, { onSuccess: () => setShowDisconnectModal(false) });
                      }}
                      disabled={disconnectGoogle.isPending}
                      className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors text-left disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-blue-400">Garder les creneaux</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Les creneaux resteront visibles dans le calendrier meme apres la deconnexion.
                      </p>
                    </button>
                    <button
                      onClick={() => setShowDisconnectModal(false)}
                      className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Connecte ton Google Calendar pour que chaque reservation soit automatiquement ajoutee a ton agenda.
          </p>
          <button
            onClick={() => connectGoogle.mutate()}
            disabled={connectGoogle.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4285F4' }}
          >
            <Calendar size={15} />
            {connectGoogle.isPending ? 'Connexion...' : 'Connecter Google Calendar'}
          </button>
        </div>
      )}
    </div>
  );
}
