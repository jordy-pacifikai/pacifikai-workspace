'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import type { WaitlistEntry, WaitlistStatus } from '@/types/database';

// ─── Keys ────────────────────────────────────────────────────────────────────

export const waitlistKeys = {
  all: ['waitlist'] as const,
  list: (businessId: string) => [...waitlistKeys.all, 'list', businessId] as const,
};

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchWaitlist(businessId: string): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from('bookbot_waitlist')
    .select('*')
    .eq('business_id', businessId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as WaitlistEntry[];
}

async function getNextPosition(businessId: string): Promise<number> {
  const { data, error } = await supabase
    .from('bookbot_waitlist')
    .select('position')
    .eq('business_id', businessId)
    .eq('status', 'waiting')
    .order('position', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return 1;
  return ((data[0] as { position: number }).position ?? 0) + 1;
}

// ─── Insert ──────────────────────────────────────────────────────────────────

interface AddToWaitlistInput {
  business_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  service?: string;
  preferred_days?: number[];
  preferred_time_start?: string;
  preferred_time_end?: string;
  notes?: string;
}

async function addToWaitlist(input: AddToWaitlistInput): Promise<WaitlistEntry> {
  const position = await getNextPosition(input.business_id);

  const { data, error } = await supabase
    .from('bookbot_waitlist')
    .insert({
      ...input,
      position,
      status: 'waiting',
    } as any)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as WaitlistEntry;
}

// ─── Update ──────────────────────────────────────────────────────────────────

async function updateWaitlistEntry(
  id: string,
  updates: Partial<Pick<WaitlistEntry, 'status' | 'notified_at' | 'booked_appointment_id' | 'notes' | 'position'>>,
): Promise<WaitlistEntry> {
  const { data, error } = await supabase
    .from('bookbot_waitlist')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as WaitlistEntry;
}

// ─── Delete / Cancel ─────────────────────────────────────────────────────────

async function removeFromWaitlist(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookbot_waitlist')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useWaitlist(businessId: string | null) {
  return useQuery({
    queryKey: waitlistKeys.list(businessId ?? ''),
    queryFn: () => fetchWaitlist(businessId!),
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAddToWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToWaitlistInput) => addToWaitlist(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'ajout à la liste d'attente");
    },
  });
}

export function useUpdateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<WaitlistEntry, 'status' | 'notified_at' | 'booked_appointment_id' | 'notes' | 'position'>>;
    }) => updateWaitlistEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de la mise à jour de l'entrée liste d'attente");
    },
  });
}

export function useRemoveFromWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeFromWaitlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors du retrait de la liste d'attente");
    },
  });
}
