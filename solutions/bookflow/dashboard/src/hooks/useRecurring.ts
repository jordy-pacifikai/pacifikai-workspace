'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecurringAppointment {
  id: string;
  business_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  service: string | null;
  staff_id: string | null;
  day_of_week: number; // 0 = Dimanche, 1 = Lundi … 6 = Samedi
  time_slot: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
  end_date: string | null;
  paused: boolean;
  last_generated_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type RecurringInsert = Omit<RecurringAppointment, 'id' | 'created_at' | 'updated_at' | 'last_generated_date'> & {
  id?: string;
  last_generated_date?: string | null;
};

export type RecurringUpdate = Partial<Omit<RecurringAppointment, 'id' | 'created_at' | 'business_id'>>;

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const recurringKeys = {
  all: ['recurring'] as const,
  list: (businessId: string) => [...recurringKeys.all, 'list', businessId] as const,
  detail: (id: string) => [...recurringKeys.all, 'detail', id] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchRecurring(businessId: string): Promise<RecurringAppointment[]> {
  const { data, error } = await supabase
    .from('bookbot_recurring_appointments')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true })
    .order('time_slot', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as RecurringAppointment[];
}

async function createRecurring(payload: RecurringInsert): Promise<RecurringAppointment> {
  const { data, error } = await supabase
    .from('bookbot_recurring_appointments')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RecurringAppointment;
}

async function updateRecurringById(id: string, updates: RecurringUpdate): Promise<RecurringAppointment> {
  const { data, error } = await supabase
    .from('bookbot_recurring_appointments')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RecurringAppointment;
}

async function deleteRecurringById(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookbot_recurring_appointments')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useRecurringAppointments(businessId: string | null) {
  return useQuery({
    queryKey: recurringKeys.list(businessId ?? ''),
    queryFn: () => fetchRecurring(businessId!),
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecurringInsert) => createRecurring(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création du rendez-vous récurrent');
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RecurringUpdate }) =>
      updateRecurringById(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du rendez-vous récurrent');
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecurringById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression du rendez-vous récurrent');
    },
  });
}
