'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AiLogEntry {
  id: string;
  business_id: string;
  phone: string;
  channel: string | null;
  user_message: string;
  assistant_reply: string;
  confidence: 'grounded' | 'no_kb_match' | 'fallback' | 'transfer';
  tools_used: string[];
  latency_ms: number | null;
  created_at: string;
}

export interface AiLogFilters {
  confidence?: string;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AiLogStats {
  total: number;
  grounded: number;
  no_kb_match: number;
  fallback: number;
  transfer: number;
  avgLatencyMs: number;
}

export const aiLogKeys = {
  all: ['ai_logs'] as const,
  list: (businessId: string, filters?: AiLogFilters, offset?: number) =>
    [...aiLogKeys.all, 'list', businessId, filters, offset] as const,
  stats: (businessId: string, days?: number) =>
    [...aiLogKeys.all, 'stats', businessId, days] as const,
};

const PAGE_SIZE = 50;

async function fetchAiLogs(
  businessId: string,
  filters?: AiLogFilters,
  offset = 0,
): Promise<AiLogEntry[]> {
  let query = supabase
    .from('bookbot_ai_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (filters?.confidence) {
    query = query.eq('confidence', filters.confidence);
  }
  if (filters?.channel) {
    query = query.eq('channel', filters.channel);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AiLogEntry[];
}

async function fetchAiLogStats(
  businessId: string,
  days = 7,
): Promise<AiLogStats> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('bookbot_ai_logs')
    .select('confidence, latency_ms')
    .eq('business_id', businessId)
    .gte('created_at', since);

  if (error) throw error;
  const rows = data ?? [];

  const stats: AiLogStats = {
    total: rows.length,
    grounded: 0,
    no_kb_match: 0,
    fallback: 0,
    transfer: 0,
    avgLatencyMs: 0,
  };

  let latencySum = 0;
  let latencyCount = 0;

  for (const row of rows) {
    const c = row.confidence as AiLogEntry['confidence'];
    if (c in stats) (stats[c] as number)++;
    if (row.latency_ms) {
      latencySum += row.latency_ms;
      latencyCount++;
    }
  }

  stats.avgLatencyMs = latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0;
  return stats;
}

export function useAiLogs(
  businessId: string | null,
  filters?: AiLogFilters,
  offset = 0,
) {
  return useQuery({
    queryKey: aiLogKeys.list(businessId ?? '', filters, offset),
    queryFn: () => fetchAiLogs(businessId!, filters, offset),
    enabled: !!businessId,
  });
}

export function useAiLogStats(businessId: string | null, days = 7) {
  return useQuery({
    queryKey: aiLogKeys.stats(businessId ?? '', days),
    queryFn: () => fetchAiLogStats(businessId!, days),
    enabled: !!businessId,
    refetchInterval: 5 * 60 * 1000,
  });
}
