'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/types/database';

// ─── Keys ────────────────────────────────────────────────────────────────────

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (businessId: string, filters?: Record<string, unknown>) =>
    [...appointmentKeys.all, 'list', businessId, filters] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchAppointments(
  businessId: string,
  filters?: { status?: string; dateFrom?: string; dateTo?: string; date?: string },
): Promise<Appointment[]> {
  let query = supabase
    .from('bookbot_appointments')
    .select('*')
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: false })
    .order('time_slot', { ascending: true });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.date) {
    query = query.eq('appointment_date', filters.date);
  }
  if (filters?.dateFrom) {
    query = query.gte('appointment_date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('appointment_date', filters.dateTo);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

async function createAppointment(
  payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('bookbot_appointments')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Appointment;
}

async function updateAppointmentById(
  id: string,
  updates: Partial<Appointment>,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('bookbot_appointments')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Appointment;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAppointments(
  businessId: string | null,
  date?: string,
  filters?: { status?: string; dateFrom?: string; dateTo?: string },
) {
  const effectiveFilters = date ? { ...filters, date } : filters;

  return useQuery({
    queryKey: appointmentKeys.list(businessId ?? '', effectiveFilters),
    queryFn: () => fetchAppointments(businessId!, effectiveFilters),
    enabled: Boolean(businessId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>,
    ) => createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      updateAppointmentById(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
