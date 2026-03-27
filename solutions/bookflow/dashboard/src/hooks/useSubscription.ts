'use client';

import { useMemo } from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppStore } from '@/lib/store';

// ─── Plan feature map ────────────────────────────────────────────────────────

export type Feature =
  | 'messenger'
  | 'whatsapp'
  | 'instagram'
  | 'basic_analytics'
  | 'advanced_analytics'
  | 'templates'
  | 'campaigns'
  | 'loyalty'
  | 'multi_staff'
  | 'api_access'
  | 'priority_support';

const PLAN_FEATURES: Record<string, Feature[]> = {
  decouverte: ['messenger', 'basic_analytics'],
  starter: ['messenger', 'whatsapp', 'basic_analytics', 'templates'],
  pro: [
    'messenger',
    'whatsapp',
    'instagram',
    'advanced_analytics',
    'templates',
    'campaigns',
    'loyalty',
  ],
  business: [
    'messenger',
    'whatsapp',
    'instagram',
    'advanced_analytics',
    'templates',
    'campaigns',
    'loyalty',
    'multi_staff',
    'api_access',
    'priority_support',
  ],
};

// Trial has same features as decouverte
const TRIAL_FEATURES = PLAN_FEATURES['decouverte'];

// ─── Conversation limits by plan ────────────────────────────────────────────

const CONVERSATION_LIMITS: Record<string, number> = {
  decouverte: 50,
  starter: 500,
  pro: 2000,
  business: Infinity,
};

// ─── Days remaining helper ───────────────────────────────────────────────────

function getDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  const diffMs = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysLeft: number;
  conversationLimit: number;
  conversationCount: number;
  canAccess: (feature: Feature) => boolean;
}

export function useSubscription(): SubscriptionInfo {
  const businessId = useAppStore((s) => s.businessId);
  const { data: business } = useBusiness(businessId);

  return useMemo<SubscriptionInfo>(() => {
    const plan = (business?.plan ?? 'decouverte').toLowerCase();
    const status = business?.subscription_status ?? null;
    const isTrialing = status === 'trial';
    const isActive = status === 'active';
    const isExpired = status === 'expired' || status === 'cancelled';
    const daysLeft = getDaysLeft(business?.trial_ends_at);
    const conversationLimit = CONVERSATION_LIMITS[plan] ?? 50;
    const conversationCount = business?.conversation_count ?? 0;

    // During trial: use trial feature set; active: use plan features
    const activeFeatures: Feature[] = isTrialing
      ? TRIAL_FEATURES
      : (PLAN_FEATURES[plan] ?? PLAN_FEATURES['decouverte']);

    const canAccess = (feature: Feature): boolean => {
      if (isExpired) return false;
      return activeFeatures.includes(feature);
    };

    return {
      plan,
      status,
      isTrialing,
      isActive,
      isExpired,
      daysLeft,
      conversationLimit,
      conversationCount,
      canAccess,
    };
  }, [business]);
}
