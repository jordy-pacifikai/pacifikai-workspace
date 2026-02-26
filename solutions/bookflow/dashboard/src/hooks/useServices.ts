'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/types/database';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const serviceKeys = {
  all: ['services'] as const,
  list: (businessId: string) => [...serviceKeys.all, 'list', businessId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceInput {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  category?: string;
  is_active?: boolean;
  display_order?: number;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchServices(businessId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

async function createService(businessId: string, input: ServiceInput): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({ ...input, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Service;
}

async function updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Service;
}

// Soft delete — set is_active to false
async function softDeleteService(id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useServices(businessId: string | null) {
  return useQuery({
    queryKey: serviceKeys.list(businessId ?? ''),
    queryFn: () => fetchServices(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useCreateService(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (input: ServiceInput) => createService(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(id) });
    },
  });
}

export function useUpdateService(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ServiceInput> }) =>
      updateService(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(bid) });
    },
  });
}

export function useDeleteService(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: (id: string) => softDeleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(bid) });
    },
  });
}
