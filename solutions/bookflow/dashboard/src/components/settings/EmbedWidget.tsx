'use client';

import { useState } from 'react';
import { Code2, Copy, Check, Monitor, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type EmbedType = 'link' | 'floating';

interface EmbedWidgetProps {
  slug: string;
  businessId?: string | null;
}

// ─── Snippet generators ───────────────────────────────────────────────────────

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
  const safeUrl = JSON.stringify(url);
  return `<script>
(function() {
  var btn = document.createElement('a');
  btn.href = ${safeUrl};
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.innerText = 'Réserver en ligne';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    background: '#25D366',
    color: '#ffffff',
    fontFamily: 'sans-serif',
    fontSize: '15px',
    fontWeight: '600',
    padding: '14px 22px',
    borderRadius: '50px',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
    cursor: 'pointer',
  });
  btn.onmouseenter = function() { btn.style.transform = 'scale(1.04)'; };
  btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
  document.body.appendChild(btn);
})();
</script>`;
}

// ─── Preview components ───────────────────────────────────────────────────────

function LinkButtonPreview() {
  return (
    <div className="flex items-center justify-center py-6 bg-gray-800 rounded-lg border border-gray-700">
      <span
        style={{ background: '#25D366' }}
        className="inline-block text-white text-sm font-semibold px-6 py-3 rounded-lg select-none"
      >
        Réserver en ligne
      </span>
    </div>
  );
}

function FloatingButtonPreview() {
  return (
    <div className="relative py-6 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden min-h-[80px]">
      <p className="text-xs text-gray-500 text-center">Apercu du bouton flottant sur votre site</p>
      <span
        style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.45)' }}
        className="absolute bottom-4 right-4 text-white text-sm font-semibold px-5 py-3 rounded-full select-none"
      >
        Réserver en ligne
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmbedWidget({ slug, businessId }: EmbedWidgetProps) {
  const [embedType, setEmbedType] = useState<EmbedType>('link');
  const [copied, setCopied] = useState(false);

  const identifier = slug || businessId || '';
  const bookingUrl = identifier ? `https://vea.pacifikai.com/book/${identifier}` : '';

  const snippet =
    !bookingUrl
      ? '<!-- Configurez votre URL personnalisee dans "Lien de reservation" d\'abord -->'
      : embedType === 'link'
      ? getLinkSnippet(bookingUrl)
      : getFloatingSnippet(bookingUrl);

  function handleCopy() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <Code2 className="w-4 h-4 text-[#25D366]" />
        <h2 className="text-white font-semibold">Widget de reservation</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Description */}
        <p className="text-sm text-gray-400">
          Copiez ce code et collez-le dans le HTML de votre site web. Un bouton{' '}
          <span className="text-white font-medium">Reserver en ligne</span> apparaitra directement
          sur votre site.
        </p>

        {/* Type toggle */}
        <div className="flex gap-2">
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
            <Monitor className="w-3.5 h-3.5" />
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
            <Layers className="w-3.5 h-3.5" />
            Bouton flottant
          </button>
        </div>

        {/* Preview */}
        {embedType === 'link' ? <LinkButtonPreview /> : <FloatingButtonPreview />}

        {/* Code block */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Code a copier
            </p>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!bookingUrl}
              className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-300 hover:border-[#25D366] hover:text-[#25D366] rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#25D366]" />
                  <span className="text-[#25D366]">Copie !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </>
              )}
            </button>
          </div>
          <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">
            <code>{snippet}</code>
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 space-y-1.5">
          <p className="text-xs text-gray-300 font-medium">Comment utiliser :</p>
          {embedType === 'link' ? (
            <ul className="space-y-1">
              <li className="text-xs text-gray-500">
                1. Copiez le code ci-dessus et collez-le dans le HTML de votre page, la ou vous
                voulez que le bouton apparaisse.
              </li>
              <li className="text-xs text-gray-500">
                2. Vous pouvez modifier le texte <span className="text-gray-400 font-mono">&ldquo;Reserver en ligne&rdquo;</span> et
                les styles directement dans le code.
              </li>
            </ul>
          ) : (
            <ul className="space-y-1">
              <li className="text-xs text-gray-500">
                1. Copiez le code et collez-le avant la balise{' '}
                <span className="text-gray-400 font-mono">&lt;/body&gt;</span> de votre site.
              </li>
              <li className="text-xs text-gray-500">
                2. Le bouton apparaitra automatiquement en bas a droite sur toutes vos pages.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
