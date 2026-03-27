'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import type { Business } from '@/types/database';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const businessKeys = {
  all: ['business'] as const,
  detail: (id: string) => [...businessKeys.all, 'detail', id] as const,
};

// ─── Fetch ─────────────────────────────────────────────────────────────────────

const BUSINESS_SELECT = 'id, name, services, hours, timezone, config, booking_slug, logo_url, bio, brand_color, phone, plan, trial_ends_at, subscription_status, cancellation_hours, active, conversation_count, created_at, updated_at';

async function fetchBusiness(id: string): Promise<Business> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select(BUSINESS_SELECT)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Business;
}

async function updateBusiness(
  id: string,
  updates: Partial<Business>,
): Promise<Business> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Business;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useBusiness(businessId: string | null) {
  return useQuery({
    queryKey: businessKeys.detail(businessId ?? ''),
    queryFn: () => fetchBusiness(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useUpdateBusiness(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (updates: Partial<Business>) => updateBusiness(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du business');
    },
  });
}
