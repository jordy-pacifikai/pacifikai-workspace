'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Client, Appointment } from '@/types/database';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const clientKeys = {
  all: ['bookbot_clients'] as const,
  list: (businessId: string) => [...clientKeys.all, 'list', businessId] as const,
  history: (clientId: string) => [...clientKeys.all, 'history', clientId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientInput {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchClients(businessId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('bookbot_clients')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

async function fetchClientHistory(clientPhone: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('*')
    .eq('client_phone', clientPhone)
    .order('appointment_date', { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

async function createClient(businessId: string, input: ClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('bookbot_clients')
    .insert({ ...input, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useClients(businessId: string | null) {
  return useQuery({
    queryKey: clientKeys.list(businessId ?? ''),
    queryFn: () => fetchClients(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useClientHistory(clientPhone: string | null) {
  return useQuery({
    queryKey: clientKeys.history(clientPhone ?? ''),
    queryFn: () => fetchClientHistory(clientPhone!),
    enabled: Boolean(clientPhone),
  });
}

export function useCreateClient(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (input: ClientInput) => createClient(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(id) });
    },
  });
}
