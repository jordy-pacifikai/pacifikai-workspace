'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RewardTier {
  points: number;
  reward: string;
  discount_percent: number;
}

export interface LoyaltyConfig {
  enabled: boolean;
  points_per_visit: number;
  points_per_xpf: number;
  welcome_bonus: number;
  birthday_bonus: number;
  reward_thresholds: RewardTier[];
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  enabled: false,
  points_per_visit: 10,
  points_per_xpf: 0,
  welcome_bonus: 50,
  birthday_bonus: 100,
  reward_thresholds: [
    { points: 100, reward: '10% de réduction', discount_percent: 10 },
    { points: 200, reward: '20% de réduction', discount_percent: 20 },
    { points: 500, reward: 'Soin gratuit', discount_percent: 100 },
  ],
};

export type LoyaltyTransactionType = 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';

export interface LoyaltyTransaction {
  id: string;
  business_id: string;
  client_id: string;
  points: number;
  type: LoyaltyTransactionType;
  description: string;
  appointment_id: string | null;
  created_at: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface ClientLoyaltySummary {
  totalPoints: number;
  transactions: LoyaltyTransaction[];
  nextTier: RewardTier | null;
  currentTier: RewardTier | null;
  progressToNext: number; // 0-100
}

export interface LeaderboardEntry {
  client_id: string;
  client_name: string;
  total_points: number;
  transaction_count: number;
}

export interface AddPointsInput {
  clientId: string;
  businessId: string;
  points: number;
  type: LoyaltyTransactionType;
  description: string;
  appointmentId?: string;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const loyaltyKeys = {
  all: ['bookbot_loyalty'] as const,
  config: (businessId: string) => [...loyaltyKeys.all, 'config', businessId] as const,
  client: (clientId: string, businessId: string) =>
    [...loyaltyKeys.all, 'client', clientId, businessId] as const,
  leaderboard: (businessId: string) => [...loyaltyKeys.all, 'leaderboard', businessId] as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function computeLoyaltySummary(
  transactions: LoyaltyTransaction[],
  config: LoyaltyConfig,
): ClientLoyaltySummary {
  const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);
  const thresholds = [...config.reward_thresholds].sort((a, b) => a.points - b.points);

  let currentTier: RewardTier | null = null;
  let nextTier: RewardTier | null = null;

  for (const tier of thresholds) {
    if (totalPoints >= tier.points) {
      currentTier = tier;
    } else if (!nextTier) {
      nextTier = tier;
    }
  }

  let progressToNext = 0;
  if (nextTier) {
    const base = currentTier ? currentTier.points : 0;
    const range = nextTier.points - base;
    progressToNext = Math.min(100, Math.round(((totalPoints - base) / range) * 100));
  } else if (currentTier) {
    progressToNext = 100;
  }

  return { totalPoints, transactions, nextTier, currentTier, progressToNext };
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

async function fetchLoyaltyConfig(businessId: string): Promise<LoyaltyConfig> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('loyalty_config')
    .eq('id', businessId)
    .single();

  if (error) throw new Error(error.message);
  return (data?.loyalty_config as LoyaltyConfig) ?? DEFAULT_LOYALTY_CONFIG;
}

async function updateLoyaltyConfig(
  businessId: string,
  config: LoyaltyConfig,
): Promise<void> {
  const { error } = await supabase
    .from('bookbot_businesses')
    .update({ loyalty_config: config })
    .eq('id', businessId);

  if (error) throw new Error(error.message);
}

async function fetchClientTransactions(
  clientId: string,
  businessId: string,
): Promise<LoyaltyTransaction[]> {
  const { data, error } = await supabase
    .from('bookbot_loyalty_transactions')
    .select('*')
    .eq('client_id', clientId)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []) as LoyaltyTransaction[];
}

async function addLoyaltyPoints(input: AddPointsInput): Promise<LoyaltyTransaction> {
  const { data, error } = await supabase
    .from('bookbot_loyalty_transactions')
    .insert({
      client_id: input.clientId,
      business_id: input.businessId,
      points: input.type === 'redeem' || input.type === 'expire'
        ? -Math.abs(input.points)
        : Math.abs(input.points),
      type: input.type,
      description: input.description,
      appointment_id: input.appointmentId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LoyaltyTransaction;
}

async function fetchLeaderboard(businessId: string): Promise<LeaderboardEntry[]> {
  /*
   * SQL function to create in Supabase (run once via migration or SQL editor):
   *
   * CREATE OR REPLACE FUNCTION get_loyalty_leaderboard(p_business_id UUID, p_limit INT DEFAULT 20)
   * RETURNS TABLE (
   *   client_id       UUID,
   *   client_name     TEXT,
   *   total_points    BIGINT,
   *   transaction_count BIGINT
   * )
   * LANGUAGE sql STABLE SECURITY DEFINER
   * AS $$
   *   SELECT
   *     t.client_id,
   *     COALESCE(c.name, 'Client inconnu') AS client_name,
   *     SUM(t.points)                       AS total_points,
   *     COUNT(*)                            AS transaction_count
   *   FROM bookbot_loyalty_transactions t
   *   LEFT JOIN bookbot_clients c ON c.id = t.client_id
   *   WHERE t.business_id = p_business_id
   *   GROUP BY t.client_id, c.name
   *   HAVING SUM(t.points) > 0
   *   ORDER BY total_points DESC
   *   LIMIT p_limit;
   * $$;
   *
   * Recommended index (if not already present):
   * CREATE INDEX IF NOT EXISTS idx_loyalty_tx_business_client
   *   ON bookbot_loyalty_transactions (business_id, client_id);
   */
  const { data, error } = await supabase
    .rpc('get_loyalty_leaderboard', {
      p_business_id: businessId,
      p_limit: 20,
    });

  if (error) throw new Error(error.message);

  return (data ?? []) as LeaderboardEntry[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLoyaltyConfig(businessId: string | null) {
  return useQuery({
    queryKey: loyaltyKeys.config(businessId ?? ''),
    queryFn: () => fetchLoyaltyConfig(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useUpdateLoyaltyConfig(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (config: LoyaltyConfig) => updateLoyaltyConfig(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.config(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour de la fidélité');
    },
  });
}

export function useClientLoyalty(
  clientId: string | null,
  businessId: string | null,
  config?: LoyaltyConfig,
) {
  return useQuery({
    queryKey: loyaltyKeys.client(clientId ?? '', businessId ?? ''),
    queryFn: async () => {
      const transactions = await fetchClientTransactions(clientId!, businessId!);
      const cfg = config ?? DEFAULT_LOYALTY_CONFIG;
      return computeLoyaltySummary(transactions, cfg);
    },
    enabled: Boolean(clientId) && Boolean(businessId),
  });
}

export function useAddLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddPointsInput) => addLoyaltyPoints(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: loyaltyKeys.client(variables.clientId, variables.businessId),
      });
      queryClient.invalidateQueries({
        queryKey: loyaltyKeys.leaderboard(variables.businessId),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de l\'ajout de points');
    },
  });
}

export function useLoyaltyLeaderboard(businessId: string | null) {
  return useQuery({
    queryKey: loyaltyKeys.leaderboard(businessId ?? ''),
    queryFn: () => fetchLeaderboard(businessId!),
    enabled: Boolean(businessId),
  });
}
