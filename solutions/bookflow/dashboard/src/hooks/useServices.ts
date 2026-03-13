'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { businessKeys } from './useBusiness';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const serviceKeys = {
  all: ['services'] as const,
  list: (businessId: string) => [...serviceKeys.all, 'list', businessId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** Service as stored in bookbot_businesses.services JSONB array */
export interface ServiceItem {
  name: string;
  duration: number;
  price: number;
  description?: string;
  category?: string;
  is_active?: boolean;
}

export interface ServiceInput {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  category?: string;
  is_active?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchServicesFromBusiness(businessId: string): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('services')
    .eq('id', businessId)
    .single();

  if (error) throw new Error(error.message);
  const raw: unknown[] = (data as Record<string, unknown>)?.services as unknown[] ?? [];
  return raw.map((s: unknown) => {
    const obj = s as Record<string, unknown>;
    return {
      name: (obj.name as string) ?? '',
      duration: (obj.duration as number) ?? 30,
      price: (obj.price as number) ?? 0,
      description: (obj.description as string) ?? undefined,
      category: (obj.category as string) ?? undefined,
      is_active: obj.is_active !== false, // default true
    };
  });
}

async function saveServicesToBusiness(businessId: string, services: ServiceItem[]): Promise<void> {
  const { error } = await supabase
    .from('bookbot_businesses')
    .update({
      services: services as unknown as Record<string, unknown>[],
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useServices(businessId: string | null) {
  return useQuery({
    queryKey: serviceKeys.list(businessId ?? ''),
    queryFn: () => fetchServicesFromBusiness(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useCreateService(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const existing = await fetchServicesFromBusiness(id);
      const newItem: ServiceItem = {
        name: input.name,
        duration: input.duration,
        price: input.price ?? 0,
        description: input.description,
        category: input.category,
        is_active: input.is_active ?? true,
      };
      await saveServicesToBusiness(id, [...existing, newItem]);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(id) });
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useUpdateService(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: async ({ index, input }: { index: number; input: Partial<ServiceInput> }) => {
      const existing = await fetchServicesFromBusiness(bid);
      if (index < 0 || index >= existing.length) throw new Error('Service introuvable');
      existing[index] = { ...existing[index], ...input } as ServiceItem;
      await saveServicesToBusiness(bid, existing);
      return existing[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(bid) });
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useDeleteService(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: async (index: number) => {
      const existing = await fetchServicesFromBusiness(bid);
      if (index < 0 || index >= existing.length) throw new Error('Service introuvable');
      existing.splice(index, 1);
      await saveServicesToBusiness(bid, existing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(bid) });
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}
