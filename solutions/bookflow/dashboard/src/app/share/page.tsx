'use client';

import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  Download,
  MessageCircle,
  Facebook,
  Instagram,
  Mail,
  Smartphone,
  Code2,
  Monitor,
  Layers,
  Eye,
  BarChart3,
  TrendingUp,
  Globe,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QRCode, useQRDownload } from '@/components/ui/QRCode';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = '#25D366';

// ─── Snippet generators (reused from EmbedWidget) ─────────────────────────────

function getLinkSnippet(url: string): string {
  const safeUrl = url.replace(/"/g, '&quot;');
  return `<a
  href="${safeUrl}"
  target="_blank"
  rel="noopener noreferrer"
  style="display:inline-block;background:#25D366;color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;"
>
  Réserver en ligne
</a>`;
}

function getFloatingSnippet(url: string): string {
  return `<script>
(function() {
  var btn = document.createElement('a');
  btn.href = ${JSON.stringify(url)};
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.innerText = 'Réserver en ligne';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
    background: '#25D366', color: '#ffffff', fontFamily: 'sans-serif',
    fontSize: '15px', fontWeight: '600', padding: '14px 22px',
    borderRadius: '50px', textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
    transition: 'transform 0.15s ease', cursor: 'pointer',
  });
  btn.onmouseenter = function() { btn.style.transform = 'scale(1.04)'; };
  btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
  document.body.appendChild(btn);
})();
<\/script>`;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-800">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
        >
          <Icon size={16} style={{ color: GREEN }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({
  text,
  label = 'Copier',
  successLabel = 'Copié !',
  className = '',
  variant = 'default',
}: {
  text: string;
  label?: string;
  successLabel?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'ghost';
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(successLabel);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const baseClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150';

  const variantClass = {
    default: 'bg-gray-800 border-gray-700 text-gray-300 hover:border-[#25D366] hover:text-[#25D366]',
    primary: 'text-gray-950 border-transparent hover:opacity-90',
    ghost: 'bg-transparent border-gray-700 text-gray-400 hover:text-white hover:border-gray-600',
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className={cn(baseClass, variantClass[variant], className)}
      style={variant === 'primary' ? { backgroundColor: GREEN } : undefined}
    >
      {copied ? (
        <>
          <Check size={13} style={{ color: variant === 'primary' ? '#111' : GREEN }} />
          <span style={{ color: variant === 'primary' ? '#111' : GREEN }}>{successLabel}</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          {label}
        </>
      )}
    </button>
  );
}

// ─── Share button ──────────────────────────────────────────────────────────────

function ShareButton({
  icon: Icon,
  label,
  description,
  onClick,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
  bgColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-150 text-left group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ExternalLink size={14} className="text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
    </button>
  );
}

// ─── Stat mini card ────────────────────────────────────────────────────────────

function StatMini({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-800">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(37,211,102,0.10)' }}
      >
        <Icon size={15} style={{ color: GREEN }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharePage() {
  const { businessId, businessName } = useAppStore();
  const { downloadQR } = useQRDownload();

  const [embedType, setEmbedType] = useState<'link' | 'floating'>('link');
  const [showInstagramHelper, setShowInstagramHelper] = useState(false);

  const bookingUrl = businessId
    ? `https://vea.pacifikai.com/book/${businessId}`
    : '';

  // ── Analytics query ────────────────────────────────────────────────────────
  const { data: pageViews } = useQuery({
    queryKey: ['share-stats', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      if (!businessId) return null;
      const supabase = getSupabaseBrowser();

      // Page views count
      const { count: totalViews } = await supabase
        .from('bookbot_page_views')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);

      // Total bookings (for conversion rate)
      const { count: totalBookings } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);

      // Source breakdown
      const { data: sources } = await supabase
        .from('bookbot_page_views')
        .select('referrer')
        .eq('business_id', businessId)
        .not('referrer', 'is', null)
        .limit(200);

      // Tally sources
      const tally: Record<string, number> = {};
      for (const row of sources ?? []) {
        const key = row.referrer || 'Direct';
        tally[key] = (tally[key] ?? 0) + 1;
      }
      const topSources = Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));

      const views = totalViews ?? 0;
      const bookings = totalBookings ?? 0;
      const convRate = views > 0 ? ((bookings / views) * 100).toFixed(1) : '0.0';

      return { views, bookings, convRate, topSources };
    },
    staleTime: 60_000,
  });

  // ── Share handlers ─────────────────────────────────────────────────────────
  const shareMessage = encodeURIComponent(
    `Prenez rendez-vous en ligne avec ${businessName || 'nous'} : ${bookingUrl}`,
  );

  const shareActions = {
    whatsapp: () => window.open(`https://wa.me/?text=${shareMessage}`, '_blank'),
    facebook: () =>
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingUrl)}`,
        '_blank',
        'width=600,height=400',
      ),
    instagram: () => setShowInstagramHelper((v) => !v),
    email: () => {
      const subject = encodeURIComponent(`Prenez rendez-vous en ligne — ${businessName || 'Réservation'}`);
      const body = encodeURIComponent(
        `Bonjour,\n\nVous pouvez maintenant prendre rendez-vous directement en ligne :\n\n${bookingUrl}\n\nA bientôt !`,
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },
    sms: () => {
      const body = encodeURIComponent(
        `Prenez rendez-vous en ligne : ${bookingUrl}`,
      );
      window.location.href = `sms:?body=${body}`;
    },
  };

  const instagramBioText = `Réserver en ligne ↓\n${bookingUrl}`;
  const snippet = bookingUrl
    ? embedType === 'link'
      ? getLinkSnippet(bookingUrl)
      : getFloatingSnippet(bookingUrl)
    : '';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="Partager" businessName={businessName}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Partagez votre lien de réservation</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Plus vous partagez, plus vous recevez de réservations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ──────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Section 1 — Votre lien */}
          <Section
            icon={Link2}
            title="Votre lien de réservation"
            subtitle="Partagez ce lien partout — sur vos réseaux, par SMS, par email"
          >
            {/* URL display */}
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mb-4">
              <Globe size={14} className="text-gray-500 shrink-0" />
              <span className="flex-1 text-sm text-gray-200 font-mono truncate select-all">
                {bookingUrl || 'Chargement…'}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton
                  text={bookingUrl}
                  label="Copier"
                  successLabel="Lien copié !"
                  variant="primary"
                />
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                  >
                    <Eye size={12} />
                    Voir
                  </a>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pt-2">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <QRCode value={bookingUrl} size={160} />
                </div>
                <button
                  type="button"
                  onClick={() => downloadQR(bookingUrl, `qr-${businessId || 'reservation'}.png`)}
                  disabled={!bookingUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:border-[#25D366] hover:text-[#25D366] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  Télécharger QR
                </button>
              </div>

              <div className="flex-1 space-y-3 text-sm text-gray-400">
                <p className="text-gray-300 font-medium">Conseils d'utilisation :</p>
                <ul className="space-y-2">
                  {[
                    'Imprimez le QR code et affichez-le en salon',
                    'Ajoutez-le sur vos cartes de visite',
                    'Intégrez-le sur votre site web',
                    'Postez-le dans votre story Instagram',
                    'Envoyez-le par SMS à vos clients fidèles',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: GREEN }}
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Section 2 — Réseaux sociaux */}
          <Section
            icon={Share2}
            title="Partager sur les réseaux"
            subtitle="Un clic pour partager sur vos canaux préférés"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShareButton
                icon={MessageCircle}
                label="WhatsApp"
                description="Envoyer à vos contacts"
                onClick={shareActions.whatsapp}
                color="#25D366"
                bgColor="rgba(37,211,102,0.12)"
              />
              <ShareButton
                icon={Facebook}
                label="Facebook"
                description="Publier sur votre page"
                onClick={shareActions.facebook}
                color="#1877F2"
                bgColor="rgba(24,119,242,0.12)"
              />
              <ShareButton
                icon={Instagram}
                label="Instagram"
                description="Texte à copier pour la bio"
                onClick={shareActions.instagram}
                color="#E1306C"
                bgColor="rgba(225,48,108,0.12)"
              />
              <ShareButton
                icon={Mail}
                label="Email"
                description="Envoyer par email"
                onClick={shareActions.email}
                color="#8B5CF6"
                bgColor="rgba(139,92,246,0.12)"
              />
              <ShareButton
                icon={Smartphone}
                label="SMS"
                description="Envoyer par SMS"
                onClick={shareActions.sms}
                color="#F59E0B"
                bgColor="rgba(245,158,11,0.12)"
              />
            </div>

            {/* Instagram bio helper (toggle) */}
            {showInstagramHelper && (
              <div className="mt-4 rounded-xl border border-pink-500/30 bg-pink-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-pink-300">
                    Texte pour votre bio Instagram
                  </p>
                  <CopyButton
                    text={instagramBioText}
                    label="Copier le texte"
                    successLabel="Copié !"
                    className="border-pink-500/40 text-pink-300 hover:border-pink-400 hover:text-pink-200 bg-transparent"
                  />
                </div>
                <pre className="text-sm text-gray-300 bg-gray-950/60 rounded-lg px-4 py-3 font-sans whitespace-pre-wrap border border-gray-800">
                  {instagramBioText}
                </pre>
                <p className="text-xs text-gray-500">
                  Copiez ce texte et collez-le dans la section "Bio" de votre profil Instagram.
                  Le lien sera cliquable dans la section lien de votre profil.
                </p>
              </div>
            )}
          </Section>

          {/* Section 3 — Widget d'intégration */}
          <Section
            icon={Code2}
            title="Widget d'intégration"
            subtitle="Intégrez un bouton de réservation directement sur votre site web"
          >
            {/* Type toggle */}
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setEmbedType('link')}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  embedType === 'link'
                    ? 'bg-[#25D366]/10 border-[#25D366]/60 text-[#25D366]'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300',
                )}
              >
                <Monitor size={14} />
                Bouton lien
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('floating')}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  embedType === 'floating'
                    ? 'bg-[#25D366]/10 border-[#25D366]/60 text-[#25D366]'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300',
                )}
              >
                <Layers size={14} />
                Bouton flottant
              </button>
            </div>

            {/* Preview */}
            {embedType === 'link' ? (
              <div className="flex items-center justify-center py-6 bg-gray-800 rounded-xl border border-gray-700 mb-4">
                <span
                  className="inline-block text-white text-sm font-semibold px-6 py-3 rounded-lg select-none"
                  style={{ backgroundColor: GREEN }}
                >
                  Réserver en ligne
                </span>
              </div>
            ) : (
              <div className="relative py-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden min-h-[80px] mb-4">
                <p className="text-xs text-gray-500 text-center">Aperçu du bouton flottant</p>
                <span
                  className="absolute bottom-4 right-4 text-white text-sm font-semibold px-5 py-3 rounded-full select-none"
                  style={{
                    backgroundColor: GREEN,
                    boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
                  }}
                >
                  Réserver en ligne
                </span>
              </div>
            )}

            {/* Code block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Code HTML à copier
                </p>
                <CopyButton
                  text={snippet}
                  label="Copier le code"
                  successLabel="Code copié !"
                />
              </div>
              <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-48">
                <code>{snippet || '<!-- Configurez votre lien de réservation d\'abord -->'}</code>
              </pre>
            </div>

            <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-300 font-medium mb-1.5">Comment utiliser :</p>
              {embedType === 'link' ? (
                <p className="text-xs text-gray-500">
                  Copiez le code et collez-le dans le HTML de votre page là où vous voulez que le bouton apparaisse.
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Copiez le code et collez-le avant la balise <code className="text-gray-400">&lt;/body&gt;</code> de votre site. Le bouton apparaîtra en bas à droite sur toutes vos pages.
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* ── Right column (1/3) ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Section 4 — Statistiques */}
          <Section
            icon={BarChart3}
            title="Statistiques du lien"
            subtitle="Performance de votre page de réservation"
          >
            <div className="space-y-3">
              <StatMini
                icon={Eye}
                label="Vues de la page"
                value={pageViews?.views ?? '—'}
                sub="Total depuis le début"
              />
              <StatMini
                icon={TrendingUp}
                label="Taux de conversion"
                value={pageViews ? `${pageViews.convRate} %` : '—'}
                sub="Vues → réservations"
              />
              <StatMini
                icon={BarChart3}
                label="Réservations totales"
                value={pageViews?.bookings ?? '—'}
              />
            </div>

            {/* Top sources */}
            {pageViews?.topSources && pageViews.topSources.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-800">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Top sources
                </p>
                <div className="space-y-2">
                  {pageViews.topSources.map(({ source, count }) => {
                    const total = pageViews.views || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={source}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400 truncate max-w-[140px]">{source}</span>
                          <span className="text-gray-500 shrink-0 ml-2">{count} ({pct} %)</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: GREEN }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!pageViews && (
              <div className="mt-4 text-center py-4">
                <p className="text-xs text-gray-600">
                  Les statistiques apparaîtront dès que votre page recevra ses premières visites.
                </p>
              </div>
            )}
          </Section>

          {/* Pro tips card */}
          <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(37,211,102,0.12)' }}
              >
                <TrendingUp size={13} style={{ color: GREEN }} />
              </div>
              <p className="text-sm font-semibold text-white">Maximiser vos réservations</p>
            </div>
            <ul className="space-y-2.5">
              {[
                'Publiez le lien dans votre story Instagram chaque semaine',
                'Ajoutez le QR code en magasin ou en salon',
                'Intégrez le widget sur votre site web',
                'Envoyez le lien à tous vos clients existants',
                'Ajoutez-le à votre signature email',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-gray-950"
                    style={{ backgroundColor: 'rgba(37,211,102,0.7)' }}
                  >
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
