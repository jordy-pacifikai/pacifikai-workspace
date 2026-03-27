'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Holiday {
  id: string;
  business_id: string;
  date: string;
  label: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  recurring_yearly: boolean;
  created_at: string;
}

export type HolidayInsert = Omit<Holiday, 'id' | 'created_at'> & {
  id?: string;
};

export type HolidayUpdate = Partial<Omit<Holiday, 'id' | 'created_at' | 'business_id'>>;

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const holidayKeys = {
  all: ['holidays'] as const,
  list: (businessId: string) => [...holidayKeys.all, 'list', businessId] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchHolidays(businessId: string): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from('bookbot_holidays')
    .select('*')
    .eq('business_id', businessId)
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Holiday[];
}

async function createHoliday(payload: HolidayInsert): Promise<Holiday> {
  const { data, error } = await supabase
    .from('bookbot_holidays')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Holiday;
}

async function updateHolidayById(id: string, updates: HolidayUpdate): Promise<Holiday> {
  const { data, error } = await supabase
    .from('bookbot_holidays')
    .update(updates as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Holiday;
}

async function deleteHolidayById(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookbot_holidays')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useHolidays(businessId: string | null) {
  return useQuery({
    queryKey: holidayKeys.list(businessId ?? ''),
    queryFn: () => fetchHolidays(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HolidayInsert) => createHoliday(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création du jour férié');
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: HolidayUpdate }) =>
      updateHolidayById(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du jour férié');
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHolidayById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression du jour férié');
    },
  });
}
