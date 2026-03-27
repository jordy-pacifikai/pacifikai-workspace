'use client';

import Link from 'next/link';
import { Clock, Zap } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppStore } from '@/lib/store';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TRIAL_TOTAL_DAYS = 14;
const BANNER_THRESHOLD_DAYS = 10;

function getDaysRemaining(trialEndsAt: string): number {
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

type Urgency = 'amber' | 'orange' | 'red' | 'expired';

function getUrgency(days: number): Urgency {
  if (days <= 0) return 'expired';
  if (days < 3) return 'red';
  if (days <= 5) return 'orange';
  return 'amber';
}

const urgencyStyles: Record<Urgency, { container: string; bar: string; text: string; cta: string }> = {
  amber: {
    container: 'bg-amber-500/10 border-amber-500/30',
    bar: 'bg-amber-400',
    text: 'text-amber-400',
    cta: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
  },
  orange: {
    container: 'bg-orange-500/10 border-orange-500/30',
    bar: 'bg-orange-400',
    text: 'text-orange-400',
    cta: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
  },
  red: {
    container: 'bg-red-500/10 border-red-500/30',
    bar: 'bg-red-400',
    text: 'text-red-400',
    cta: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  },
  expired: {
    container: 'bg-red-500/15 border-red-500/40',
    bar: 'bg-red-500',
    text: 'text-red-300',
    cta: 'bg-red-500/25 text-red-200 hover:bg-red-500/35',
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function TrialBanner() {
  const businessId = useAppStore((s) => s.businessId);
  const { data: business } = useBusiness(businessId);

  if (!business) return null;
  if (business.subscription_status === 'active') return null;
  if (!business.trial_ends_at) return null;

  const daysLeft = getDaysRemaining(business.trial_ends_at);

  // Only show from J-10 onwards (or if expired)
  const isExpired = business.subscription_status === 'expired' || daysLeft <= 0;
  if (!isExpired && daysLeft > BANNER_THRESHOLD_DAYS) return null;

  const urgency = getUrgency(daysLeft);
  const styles = urgencyStyles[urgency];

  // Progress bar: percentage of trial consumed
  const consumed = Math.min(TRIAL_TOTAL_DAYS, Math.max(0, TRIAL_TOTAL_DAYS - daysLeft));
  const progressPct = isExpired ? 100 : Math.round((consumed / TRIAL_TOTAL_DAYS) * 100);

  return (
    <div
      className={`w-full rounded-xl px-5 py-3.5 border mb-4 ${styles.container}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Message */}
        <div className={`flex items-center gap-3 text-sm ${styles.text}`}>
          <Clock size={18} className="shrink-0" />
          <p className="leading-snug">
            {isExpired ? (
              <>
                Votre essai gratuit est termine.{' '}
                <span className="font-semibold">
                  Vos donnees sont conservees pendant 30 jours.
                </span>
              </>
            ) : (
              <>
                Essai gratuit —{' '}
                <span className="font-semibold">
                  {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                </span>
              </>
            )}
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/billing"
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${styles.cta}`}
        >
          <Zap size={14} />
          Choisir un plan
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
