'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Business } from '@/types/database';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const businessKeys = {
  all: ['business'] as const,
  detail: (id: string) => [...businessKeys.all, 'detail', id] as const,
};

// ─── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchBusiness(id: string): Promise<Business> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('*')
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
  });
}
