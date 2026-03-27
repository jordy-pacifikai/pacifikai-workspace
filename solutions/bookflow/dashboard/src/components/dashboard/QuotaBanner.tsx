'use client';

import Link from 'next/link';

// ─── Plan limits ────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
  starter:  50,
  pro:      500,
  business: 2000,
};

export function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan.toLowerCase()] ?? 50;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface QuotaBannerProps {
  used:  number;
  limit: number;
  plan:  string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function QuotaBanner({ used, limit, plan }: QuotaBannerProps) {
  const ratio = limit > 0 ? used / limit : 0;

  if (ratio < 0.8) return null;

  const isExceeded = ratio >= 1.0;

  return (
    <div
      className={[
        'flex items-start justify-between gap-4 w-full rounded-xl px-5 py-4 mb-6',
        isExceeded
          ? 'bg-red-500/10 border border-red-500/30'
          : 'bg-orange-500/10 border border-orange-500/30',
      ].join(' ')}
    >
      {/* Message */}
      <p
        className={[
          'text-sm leading-snug',
          isExceeded ? 'text-red-400' : 'text-orange-400',
        ].join(' ')}
      >
        {isExceeded ? (
          <>
            <span className="mr-1.5">🚫</span>
            Limite atteinte. Les nouveaux clients reçoivent un message d&apos;erreur.{' '}
            <span className="font-semibold">Mettez à jour votre plan.</span>
          </>
        ) : (
          <>
            <span className="mr-1.5">⚠️</span>
            <span className="font-semibold">{used}/{limit}</span> conversations utilisées ce
            mois. Passez au plan supérieur pour ne pas être interrompu.
          </>
        )}
      </p>

      {/* CTA */}
      <Link
        href="/settings#pricing"
        className={[
          'shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
          isExceeded
            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
            : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
        ].join(' ')}
      >
        Upgrade
      </Link>
    </div>
  );
}
