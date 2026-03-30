'use client';

import { useState, useEffect } from 'react';
import {
  Plug, MessageCircle, Send, Instagram, CheckCircle2, Circle,
  Copy, Check, LogIn, LogOut, Loader2, AlertCircle, Calendar,
  ChevronRight, ChevronLeft, ExternalLink, Shield, Eye, EyeOff,
  Bot, Power, Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import {
  useConnectedChannels,
  useDisconnectFacebook,
  useBridgeStatus,
  type FacebookPageOption,
} from '@/hooks/useChannels';
import {
  useGoogleCalendarStatus,
  useConnectGoogle,
  useDisconnectGoogle,
} from '@/hooks/useGoogleCalendar';
import { loginWithFacebook } from '@/lib/facebook-sdk';

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

// ─── Messenger Login Modal (email+password via mautrix-meta) ─────────────────

type LoginStep = 'credentials' | 'twofactor' | 'approval' | 'connecting' | 'done';

function MessengerLoginModal({
  businessId,
  onClose,
  onSuccess,
}: {
  businessId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorStepId, setTwoFactorStepId] = useState('');
  const [twoFactorLabel, setTwoFactorLabel] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function bridgeAction(action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch('/api/messenger-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, business_id: businessId, ...extra }),
    });
    return res.json();
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    setError('');
    setStep('connecting');

    try {
      // Step 1: Start login flow
      await bridgeAction('login-start');

      // Step 2: Submit credentials
      const result = await bridgeAction('login-credentials', { email, password });

      handleLoginResult(result);
    } catch (err) {
      setStep('credentials');
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoginResult(result: Record<string, unknown>) {
    if (result.type === 'complete') {
      setStep('done');
      setTimeout(() => onSuccess(), 1500);
      return;
    }

    if (result.type === 'display_and_wait' && result.step_id) {
      // "Approve From Another Device" — user taps approve on phone
      setTwoFactorStepId(result.step_id as string);
      setStep('approval');
      pollApproval(result.step_id as string);
      return;
    }

    if (result.type === 'user_input' && result.step_id) {
      const fields = (result.user_input as Record<string, unknown>)?.fields as Array<Record<string, unknown>> | undefined;
      const firstField = fields?.[0];

      // MFA type selection — auto-select "Notification on another device"
      if (firstField?.type === 'select' && (result.step_id as string).includes('mfa_type')) {
        try {
          const mfaResult = await bridgeAction('login-2fa', {
            step_id: result.step_id,
            code: 'Notification on another device',
          });
          handleLoginResult(mfaResult);
        } catch (err) {
          setStep('credentials');
          setError(err instanceof Error ? err.message : 'Erreur MFA');
        }
        return;
      }

      // Code input (TOTP, SMS, email code)
      const label = (firstField?.name as string) || 'Code de verification';
      setTwoFactorStepId(result.step_id as string);
      setTwoFactorLabel(label);
      setStep('twofactor');
      return;
    }

    // Error or unknown step
    setStep('credentials');
    setError((result.instructions as string) || (result.error as string) || 'Identifiants invalides.');
  }

  async function pollApproval(stepId: string) {
    try {
      const result = await bridgeAction('login-wait-approval', { step_id: stepId });
      if (result.type === 'complete') {
        setStep('done');
        setTimeout(() => onSuccess(), 1500);
      } else {
        setStep('credentials');
        setError(result.instructions || result.error || 'Approbation echouee, reessayez.');
      }
    } catch (err) {
      setStep('credentials');
      setError(err instanceof Error ? err.message : 'Erreur de verification');
    }
  }

  async function handle2FA() {
    if (!twoFactorCode.trim()) return;

    setSubmitting(true);
    setError('');
    setStep('connecting');

    try {
      const result = await bridgeAction('login-2fa', {
        step_id: twoFactorStepId,
        code: twoFactorCode,
      });

      handleLoginResult(result);
    } catch (err) {
      setStep('twofactor');
      setError(err instanceof Error ? err.message : 'Erreur de verification');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden max-w-[420px] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === 'done' ? 'bg-[#25D366]' : 'bg-[#1877F2]'} animate-pulse`} />
            <span className="text-sm font-medium text-white">Connecter Messenger</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-sm">
            Annuler
          </button>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Step: Credentials */}
        {step === 'credentials' && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-400">
              Entrez vos identifiants Facebook pour connecter Messenger.
            </p>

            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ou telephone"
                autoFocus
                autoComplete="username"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1877F2]/60"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1877F2]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={submitting || !email.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#1877F2' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Se connecter
            </button>
          </div>
        )}

        {/* Step: 2FA */}
        {step === 'twofactor' && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-400">
              {twoFactorLabel || 'Entrez le code de verification'}
            </p>

            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Code a 6 chiffres"
              autoFocus
              inputMode="numeric"
              maxLength={8}
              onKeyDown={(e) => e.key === 'Enter' && handle2FA()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white text-center tracking-[0.3em] font-mono placeholder:text-gray-600 placeholder:tracking-normal focus:outline-none focus:border-[#1877F2]/60"
            />

            <button
              onClick={handle2FA}
              disabled={submitting || !twoFactorCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#1877F2' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Verifier
            </button>
          </div>
        )}

        {/* Step: Approve on phone */}
        {step === 'approval' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 size={32} className="text-[#1877F2] animate-spin" />
            <p className="text-sm text-white font-medium">Approuvez sur votre telephone</p>
            <p className="text-xs text-gray-400 text-center px-8">
              Ouvrez l&apos;app Facebook sur votre telephone et approuvez la connexion.
            </p>
          </div>
        )}

        {/* Step: Connecting */}
        {step === 'connecting' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="text-[#1877F2] animate-spin" />
            <p className="text-sm text-gray-400">Connexion a Facebook...</p>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 size={32} className="text-[#25D366]" />
            <p className="text-sm text-[#25D366] font-medium">Messenger connecte !</p>
            <p className="text-xs text-gray-400">Les messages seront relayes automatiquement.</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2 justify-center">
            <Shield size={11} className="text-gray-600" />
            <p className="text-[11px] text-gray-600">
              Connexion securisee — vos identifiants ne sont jamais stockes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Messenger Bridge Card (self-hosted, no App Review) ─────────────────────

function MessengerBridgeCard({ businessId }: { businessId: string }) {
  const { data: session, isLoading, refetch } = useBridgeStatus(businessId);
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) return <SkeletonCard />;

  const isActive = session?.status === 'active';
  const isExpired = session?.status === 'expired';

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0084FF15' }}>
              <Send size={20} style={{ color: '#0084FF' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Facebook Messenger</h3>
              <p className="text-xs text-gray-500">
                Connexion directe — aucune validation Meta requise
              </p>
            </div>
          </div>
          {isActive && (
            <span className="flex items-center gap-2 text-sm text-[#25D366]">
              <CheckCircle2 size={18} />
              Connecte
            </span>
          )}
          {isExpired && (
            <span className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={18} />
              Session expiree
            </span>
          )}
        </div>

        {isActive ? (
          <div className="space-y-3">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Messenger actif</p>
                  {session.facebook_user_id && (
                    <p className="text-xs text-gray-500 font-mono mt-1">FB: {session.facebook_user_id}</p>
                  )}
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-[#0084FF]/10 text-[#0084FF]">
                  Messenger
                </span>
              </div>
              {session.created_at && (
                <p className="text-xs text-gray-600 mt-2">
                  Connecte le {new Date(session.created_at).toLocaleDateString('fr-FR')}
                </p>
              )}
              {session.last_poll_at && (
                <p className="text-xs text-gray-600 mt-1">
                  Derniere activite : {new Date(session.last_poll_at).toLocaleString('fr-FR')}
                </p>
              )}
            </div>

            <div className="p-3 bg-[#25D366]/5 border border-[#25D366]/10 rounded-lg">
              <p className="text-xs text-gray-400">
                Les messages entrants sont automatiquement relayes a votre agent IA.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isExpired && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">
                  La session Facebook a expire. Reconnectez-vous pour reactiver Messenger.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#1877F2' }}
            >
              <LogIn size={18} />
              Connecter Messenger
            </button>
            <p className="text-xs text-gray-600 text-center">
              Connectez votre compte Facebook en 30 secondes
            </p>
          </div>
        )}
      </div>

      {showLogin && (
        <MessengerLoginModal
          businessId={businessId}
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            refetch();
          }}
        />
      )}
    </>
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
  const { data: connected, isLoading, refetch: refetchChannels } = useConnectedChannels(businessId);
  const disconnectFacebook = useDisconnectFacebook(businessId);

  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ve'a AI status
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; ai_enabled: boolean; inbox_id: number | null } | null>(null);
  const [togglingAI, setTogglingAI] = useState(false);

  useEffect(() => {
    fetch(`/api/chatwoot?business_id=${encodeURIComponent(businessId)}`)
      .then((r) => r.json())
      .then((data) => setAiStatus(data))
      .catch(() => {});
  }, [businessId]);

  async function toggleAI() {
    if (!aiStatus) return;
    setTogglingAI(true);
    try {
      const res = await fetch('/api/chatwoot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, aiEnabled: !aiStatus.ai_enabled }),
      });
      if (res.ok) setAiStatus((prev) => prev ? { ...prev, ai_enabled: !prev.ai_enabled } : prev);
    } catch { /* ignore */ }
    setTogglingAI(false);
  }

  // Handle OAuth callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('fb_connected') === 'true' || params.get('fb_success')) {
      setSuccessMsg(params.get('fb_success') ? decodeURIComponent(params.get('fb_success')!) : 'Facebook connecte avec succes !');
      refetchChannels();
      window.history.replaceState({}, '', '/channels');
    }

    // Handle OAuth multi-page picker
    if (params.get('fb_pick_pages') === 'true') {
      window.history.replaceState({}, '', '/channels');
      setConnecting(true);
      fetch('/api/messenger/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load-page-session', businessId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.pages) {
            setUserAccessToken(data.userToken || '');
            setPages(data.pages.map((p: { id: string; name: string; access_token: string }) => ({
              id: p.id, name: p.name, access_token: p.access_token, instagram_business_account_id: null,
            })));
            setShowPagePicker(true);
          } else {
            setError(data.error || 'Session expiree, reessaie la connexion Facebook.');
          }
          setConnecting(false);
        })
        .catch(() => { setError('Erreur chargement des pages'); setConnecting(false); });
    }

    const fbError = params.get('fb_error');
    if (fbError) {
      const errorMessages: Record<string, string> = {
        csrf_failed: 'Erreur de securite (CSRF). Reessaye la connexion.',
        token_exchange_failed: 'Erreur lors de l\'echange de token Facebook. Reessaye.',
        pages_fetch_failed: 'Impossible de recuperer tes Pages Facebook. Reessaye.',
        access_denied: 'Tu as refuse l\'acces Facebook. Reessaye si c\'etait une erreur.',
        user_denied: 'Tu as refuse l\'acces Facebook. Reessaye si c\'etait une erreur.',
        invalid_state: 'Session expiree. Reessaye la connexion.',
      };
      setError(errorMessages[fbError] || fbError);
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

    // Handle return from Facebook OAuth callback with multiple pages
    const pickPage = params.get('pick_page');
    if (pickPage) {
      window.history.replaceState({}, '', '/channels');
      try {
        const storedPages = sessionStorage.getItem('fb_pages');
        const storedToken = sessionStorage.getItem('fb_user_token');
        if (storedPages) {
          const parsed = JSON.parse(storedPages);
          setPages(parsed.map((p: { id: string; name: string; access_token: string }) => ({
            id: p.id,
            name: p.name,
            access_token: p.access_token,
            instagram_business_account_id: null,
          })));
          setUserAccessToken(storedToken || '');
          setShowPagePicker(true);
          sessionStorage.removeItem('fb_pages');
          sessionStorage.removeItem('fb_user_token');
        }
      } catch {}
    }
  }, []);

  const [connecting, setConnecting] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState('');

  const [sdkBlocked, setSdkBlocked] = useState(false);

  async function handleConnect() {
    setError('');
    // OAuth redirect flow — works in ALL browsers (no SDK dependency)
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '854522137595486';
    const redirectUri = `${window.location.origin}/api/messenger/oauth-callback`;
    const scopes = 'pages_show_list,pages_manage_metadata,pages_messaging,instagram_manage_messages,public_profile';
    const state = businessId; // pass businessId through OAuth state
    const oauthUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;
    window.location.href = oauthUrl;
  }

  async function handleSelectPage(page: FacebookPageOption, overrideUserToken?: string) {
    setError('');
    setConnecting(true);
    const uat = overrideUserToken || userAccessToken;
    try {
      const res = await fetch('/api/messenger/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect-page',
          businessId,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          userAccessToken: uat,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setShowPagePicker(false);
      setPages([]);
      setSuccessMsg('Page connectee avec succes ! Ve\'a AI est active.');
      setAiStatus({ connected: true, ai_enabled: true, inbox_id: data.inbox_id });
      refetchChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion de la page');
    }
    setConnecting(false);
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
            <h3 className="text-sm font-semibold text-white">
              {connected ? (connected.pageName || 'Page Facebook') : 'Facebook Messenger'}
            </h3>
            <p className="text-xs text-gray-500">
              {connected ? 'Messenger' + (connected.igAccountId ? ' & Instagram' : '') + ' connecte' : 'Connecte ta Page Facebook pour recevoir les messages'}
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

          {/* Ve'a AI — auto-response toggle */}
          {aiStatus?.connected && (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Bot size={16} className={aiStatus.ai_enabled ? 'text-purple-400' : 'text-gray-500'} />
                <div>
                  <p className="text-sm text-white font-medium">Ve&apos;a AI</p>
                  <p className="text-xs text-gray-500">
                    {aiStatus.ai_enabled ? 'Repond automatiquement aux messages' : 'Reponses automatiques desactivees'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAI}
                disabled={togglingAI}
                className={`relative w-11 h-6 rounded-full transition-colors ${aiStatus.ai_enabled ? 'bg-purple-500' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${aiStatus.ai_enabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          )}

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
              disabled={connecting}
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
          {sdkBlocked && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300 font-medium">Navigateur bloque la connexion Facebook</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Ton navigateur (Brave / bloqueur de pubs) empeche le chargement de Facebook.
                  </p>
                  <ol className="text-xs text-amber-200/70 mt-2 space-y-1 list-decimal list-inside">
                    <li>Clique sur l&apos;icone <strong>bouclier</strong> (🛡️) dans la barre d&apos;adresse</li>
                    <li>Desactive la protection pour ce site</li>
                    <li>Recharge la page et reessaye</li>
                  </ol>
                </div>
              </div>
              <button
                onClick={() => { setSdkBlocked(false); handleConnect(); }}
                className="w-full mt-2 px-4 py-2 text-xs font-medium text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition"
              >
                Reessayer la connexion
              </button>
            </div>
          )}
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#1877F2' }}
          >
            {connecting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {connecting ? 'Connexion en cours...' : 'Connecter avec Facebook'}
          </button>
          <p className="text-xs text-gray-600 text-center">
            Connecte ta Page Facebook en 30 secondes — Ve&apos;a AI repond ensuite automatiquement
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

          {/* Facebook Messenger & Instagram — OAuth + Ve'a AI */}
          {businessId && <FacebookConnectedCard businessId={businessId} dashboardUrl={dashboardUrl} />}

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
                <h4 className="text-xs font-semibold text-[#0084FF] mb-2">Messenger (activation assistee)</h4>
                <ol className="space-y-1.5 text-sm text-gray-400">
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">1.</span>
                    Clique sur &quot;Activer Messenger&quot;
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">2.</span>
                    Notre equipe configure la connexion a ton compte Facebook
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[#0084FF] shrink-0">3.</span>
                    Ton agent IA repond automatiquement aux messages Messenger
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

// ─── Ve'a AI Section ──────────────────────────────────────────────────────────

interface ChatwootStatus {
  connected: boolean;
  inbox_id: number | null;
  connected_at: string | null;
  ai_enabled: boolean;
  has_custom_prompt: boolean;
}

function VeaAISection({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<ChatwootStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/chatwoot?business_id=${encodeURIComponent(businessId)}`)
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ connected: false, inbox_id: null, connected_at: null, ai_enabled: false, has_custom_prompt: false }))
      .finally(() => setLoading(false));
  }, [businessId]);

  async function toggleAI() {
    if (!status) return;
    setToggling(true);
    try {
      const res = await fetch('/api/chatwoot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, aiEnabled: !status.ai_enabled }),
      });
      if (res.ok) {
        setStatus((prev) => prev ? { ...prev, ai_enabled: !prev.ai_enabled } : prev);
      }
    } catch { /* ignore */ }
    setToggling(false);
  }

  if (loading) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Bot size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            Ve&apos;a AI
            <Sparkles size={14} className="text-purple-400" />
          </h3>
          <p className="text-xs text-gray-500">Agent IA qui repond automatiquement aux messages</p>
        </div>
        <div className="ml-auto">
          {status?.connected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <CheckCircle2 size={12} />
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
              <Circle size={12} />
              Non configure
            </span>
          )}
        </div>
      </div>

      {status?.connected ? (
        <div className="space-y-4">
          {/* Status info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Inbox Chatwoot</p>
              <p className="text-sm text-gray-200">#{status.inbox_id}</p>
            </div>
            {status.connected_at && (
              <div className="bg-gray-800 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Connecte le</p>
                <p className="text-sm text-gray-200">
                  {new Date(status.connected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* AI toggle */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Power size={16} className={status.ai_enabled ? 'text-purple-400' : 'text-gray-500'} />
              <div>
                <p className="text-sm text-white font-medium">Reponses IA automatiques</p>
                <p className="text-xs text-gray-500">
                  {status.ai_enabled ? 'Ve\'a repond automatiquement aux messages entrants' : 'Les messages sont recus mais pas de reponse auto'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAI}
              disabled={toggling}
              className={`relative w-11 h-6 rounded-full transition-colors ${status.ai_enabled ? 'bg-purple-500' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${status.ai_enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* How it works */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
            <p className="text-xs text-purple-300 font-medium mb-2">Comment ca marche</p>
            <ol className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-purple-400 font-mono shrink-0">1.</span>
                Un client t&apos;envoie un message sur Messenger
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-mono shrink-0">2.</span>
                Ve&apos;a analyse le message et genere une reponse personnalisee
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-mono shrink-0">3.</span>
                La reponse est envoyee automatiquement en quelques secondes
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Connecte ta Page Facebook via Messenger ci-dessus pour activer les reponses IA automatiques.
            Ve&apos;a utilise l&apos;intelligence artificielle pour repondre a tes clients 24h/24.
          </p>
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
            <p className="text-xs text-purple-300">
              <Sparkles size={12} className="inline mr-1" />
              Ve&apos;a comprend le contexte de ton activite et repond en francais avec un ton professionnel adapte.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
