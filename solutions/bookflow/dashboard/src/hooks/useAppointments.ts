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
    .from('appointments')
    .select(
      `
      *,
      client:clients(id, name, phone, email, tags),
      service:services(id, name, duration, price, category)
    `,
    )
    .eq('business_id', businessId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: true });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.date) {
    query = query.eq('date', filters.date);
  }
  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

async function createAppointment(
  payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'client' | 'service'>,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(payload as any)
    .select(
      `
      *,
      client:clients(id, name, phone, email, tags),
      service:services(id, name, duration, price, category)
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  return data as Appointment;
}

async function updateAppointmentById(
  id: string,
  updates: Partial<Appointment>,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select(
      `
      *,
      client:clients(id, name, phone, email, tags),
      service:services(id, name, duration, price, category)
    `,
    )
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
      payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'client' | 'service'>,
    ) => createAppointment(payload),
    onSuccess: (data) => {
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
