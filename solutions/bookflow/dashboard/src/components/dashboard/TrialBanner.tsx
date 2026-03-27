'use client';

import Link from 'next/link';
import { Clock, Zap } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppStore } from '@/lib/store';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDaysRemaining(trialEndsAt: string): number {
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

type Urgency = 'green' | 'orange' | 'red' | 'expired';

function getUrgency(days: number): Urgency {
  if (days <= 0) return 'expired';
  if (days < 3) return 'red';
  if (days <= 7) return 'orange';
  return 'green';
}

const urgencyStyles: Record<Urgency, { container: string; text: string; cta: string }> = {
  green: {
    container: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    cta: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30',
  },
  orange: {
    container: 'bg-orange-500/10 border-orange-500/30',
    text: 'text-orange-400',
    cta: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
  },
  red: {
    container: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    cta: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  },
  expired: {
    container: 'bg-red-500/15 border-red-500/40',
    text: 'text-red-300',
    cta: 'bg-red-500/25 text-red-200 hover:bg-red-500/35',
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function TrialBanner() {
  const businessId = useAppStore((s) => s.businessId);
  const { data: business } = useBusiness(businessId);

  // Don't render if data not loaded yet
  if (!business) return null;

  // Don't render for paying customers
  if (business.subscription_status === 'active') return null;

  // Don't render if no trial date set
  if (!business.trial_ends_at) return null;

  const daysLeft = getDaysRemaining(business.trial_ends_at);
  const urgency = getUrgency(daysLeft);
  const styles = urgencyStyles[urgency];

  return (
    <div
      className={`flex items-center justify-between gap-4 w-full rounded-xl px-5 py-3.5 border ${styles.container}`}
    >
      {/* Message */}
      <div className={`flex items-center gap-3 text-sm ${styles.text}`}>
        <Clock size={18} className="shrink-0" />
        <p className="leading-snug">
          {urgency === 'expired' ? (
            <>
              Votre essai gratuit est termine.{' '}
              <span className="font-semibold">
                Passez au plan Pro pour continuer.
              </span>
            </>
          ) : (
            <>
              Il vous reste{' '}
              <span className="font-semibold">
                {daysLeft} jour{daysLeft > 1 ? 's' : ''}
              </span>{' '}
              d&apos;essai gratuit.
            </>
          )}
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/pricing"
        className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${styles.cta}`}
      >
        <Zap size={14} />
        Passer au plan Pro
      </Link>
    </div>
  );
}
