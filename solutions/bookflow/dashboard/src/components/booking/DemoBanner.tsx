'use client';

// ─── DemoBanner ──────────────────────────────────────────────────────────────
// Reusable banner for demo/sandbox pages.
// Shows a clear "demonstration mode" notice + CTA to sign up.
// Subtle green-amber gradient background, responsive.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';

interface DemoBannerProps {
  /** Override the default demo text */
  text?: string;
  /** Override the CTA label */
  ctaLabel?: string;
  /** Override the CTA href (default: /signup) */
  ctaHref?: string;
}

export default function DemoBanner({
  text = 'Mode démonstration — Aucun rendez-vous réel ne sera créé',
  ctaLabel = 'Créer mon compte',
  ctaHref = '/signup',
}: DemoBannerProps) {
  return (
    <div
      className="w-full px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
        borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
      }}
      role="status"
      aria-label="Mode démonstration"
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
          aria-hidden="true"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </span>
        <span className="text-xs sm:text-sm font-medium text-gray-700">
          {text}
        </span>
      </div>

      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 shadow-sm flex-shrink-0"
        style={{ backgroundColor: '#16a34a' }}
      >
        {ctaLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
