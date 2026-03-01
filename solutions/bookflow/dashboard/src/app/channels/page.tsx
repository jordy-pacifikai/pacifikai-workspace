'use client';

import { useState, useEffect } from 'react';
import {
  Plug, MessageCircle, Send, Instagram, CheckCircle2, Circle,
  Copy, Check, LogIn, LogOut, Loader2, AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import {
  useConnectedChannels,
  useConnectFacebook,
  useSelectPage,
  useDisconnectFacebook,
} from '@/hooks/useChannels';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WhatsAppConfig {
  whatsapp_phone_number_id?: string;
  whatsapp_access_token?: string;
  whatsapp_verify_token?: string;
  whatsapp_enabled?: boolean;
}

interface FacebookPageOption {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account_id: string | null;
}

// ─── WhatsApp Card (manual config) ─────────────────────────────────────────────

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
  const [copied, setCopied] = useState(false);
  const enabled = Boolean(config.whatsapp_enabled);

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fields = [
    { key: 'whatsapp_phone_number_id', label: 'Phone Number ID', placeholder: 'Ex: 123456789012345' },
    { key: 'whatsapp_access_token', label: 'Access Token (permanent)', placeholder: 'EAABx...', type: 'password' },
    { key: 'whatsapp_verify_token', label: 'Verify Token (au choix)', placeholder: 'Ex: vea_verify_2026' },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D36615' }}>
            <MessageCircle size={20} style={{ color: '#25D366' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">WhatsApp Business</h3>
            <p className="text-xs text-gray-500">Meta Cloud API ou Twilio — Configuration manuelle</p>
          </div>
        </div>
        <button onClick={onToggle} className="flex items-center gap-2 text-sm transition" style={{ color: enabled ? '#25D366' : '#6b7280' }}>
          {enabled ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          {enabled ? 'Actif' : 'Inactif'}
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
            <input
              type={field.type ?? 'text'}
              value={(config as Record<string, string>)[field.key] ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#25D366]/50 font-mono"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">URL du webhook</span>
          <button onClick={copyWebhook} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copie' : 'Copier'}
          </button>
        </div>
        <p className="text-xs text-gray-400 font-mono break-all">{webhookUrl}</p>
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
  const connectFacebook = useConnectFacebook(businessId);
  const selectPage = useSelectPage(businessId);
  const disconnectFacebook = useDisconnectFacebook(businessId);

  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect() {
    setError('');
    try {
      const result = await connectFacebook.mutateAsync();
      if (result.length === 1) {
        // Auto-select if only one page
        await selectPage.mutateAsync(result[0]);
        setShowPagePicker(false);
      } else {
        setPages(result);
        setShowPagePicker(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion Facebook');
    }
  }

  async function handleSelectPage(page: FacebookPageOption) {
    setError('');
    try {
      await selectPage.mutateAsync(page);
      setShowPagePicker(false);
      setPages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion de la page');
    }
  }

  async function handleDisconnect() {
    setError('');
    try {
      await disconnectFacebook.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la deconnexion');
    }
  }

  if (isLoading) {
    return <SkeletonCard />;
  }

  const isConnecting = connectFacebook.isPending || selectPage.isPending;
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
          <span className="flex items-center gap-2 text-sm text-[#25D366]">
            <CheckCircle2 size={18} />
            Connecte
          </span>
        )}
      </div>

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

  const dashboardUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vea.pacifikai.com';

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
                <h4 className="text-xs font-semibold text-[#25D366] mb-2">WhatsApp (manuel)</h4>
                <ol className="space-y-1.5 text-sm text-gray-400">
                  <li className="flex gap-2">
                    <span className="font-mono text-[#25D366] shrink-0">1.</span>
                    Entre ton Phone Number ID et Access Token depuis Meta Developer
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#25D366] shrink-0">2.</span>
                    Copie l&apos;URL du webhook et colle-la dans Meta Developer &gt; Webhooks
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#25D366] shrink-0">3.</span>
                    Clique sur &quot;Sauvegarder WhatsApp&quot;
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
