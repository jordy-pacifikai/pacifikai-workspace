'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  business_id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  entity_type?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Keys ───────────────────────────────────────────────────────────────────

export const auditKeys = {
  all: ['audit_log'] as const,
  list: (businessId: string, filters?: AuditFilters, offset?: number) =>
    [...auditKeys.all, 'list', businessId, filters, offset] as const,
};

// ─── Fetch ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

async function fetchAuditLog(
  businessId: string,
  filters?: AuditFilters,
  offset = 0,
): Promise<AuditEntry[]> {
  let query = supabase
    .from('bookbot_audit_log')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (filters?.action) {
    query = query.like('action', `${filters.action}%`);
  }
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditEntry[];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuditLog(
  businessId: string | null,
  filters?: AuditFilters,
  offset = 0,
) {
  return useQuery({
    queryKey: auditKeys.list(businessId ?? '', filters, offset),
    queryFn: () => fetchAuditLog(businessId!, filters, offset),
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
  });
}

// ─── Log helper (fire-and-forget) ───────────────────────────────────────────

export function logAction(
  businessId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
) {
  supabase
    .from('bookbot_audit_log')
    .insert({
      business_id: businessId,
      actor: 'user',
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? {},
    })
    .then(({ error }: { error: { message: string } | null }) => {
      if (error) console.warn('[audit] log failed:', error.message);
    });
}
