'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/types/database';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const clientStatsKeys = {
  all: ['client_stats'] as const,
  stats: (clientId: string, businessId: string) =>
    [...clientStatsKeys.all, clientId, businessId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppointmentHistoryItem {
  id: string;
  date: string;
  time: string | null;
  service: string | null;
  status: Appointment['status'];
  price: number | null;
  notes: string | null;
}

export interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShows: number;
  totalSpent: number;
  averageSpent: number;
  firstVisit: string | null;
  lastVisit: string | null;
  favoriteService: string | null;
  appointmentHistory: AppointmentHistoryItem[];
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchClientStats(
  clientId: string,
  businessId: string,
  clientPhone: string | null,
  clientName: string | null,
  noShowCount: number,
): Promise<ClientStats> {
  // Build query: match by phone (preferred) or fallback to name
  let query = supabase
    .from('bookbot_appointments')
    .select('id, appointment_date, time_slot, service, status, price, notes')
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: false })
    .limit(20);

  if (clientPhone) {
    query = query.eq('client_phone', clientPhone);
  } else if (clientName) {
    query = query.eq('client_name', clientName);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    appointment_date: string;
    time_slot: string | null;
    service: string | null;
    status: Appointment['status'];
    price: number | null;
    notes: string | null;
  }>;

  const totalAppointments = rows.length;
  const completedAppointments = rows.filter((r) => r.status === 'completed').length;
  const cancelledAppointments = rows.filter((r) => r.status === 'cancelled').length;

  const completedRows = rows.filter((r) => r.status === 'completed');
  const totalSpent = completedRows.reduce((sum, r) => sum + (r.price ?? 0), 0);
  const averageSpent =
    completedRows.length > 0 ? Math.round(totalSpent / completedRows.length) : 0;

  // Chronological order: last item = earliest date
  const sortedByDate = [...rows].sort((a, b) =>
    a.appointment_date.localeCompare(b.appointment_date),
  );
  const firstVisit = sortedByDate.length > 0 ? sortedByDate[0].appointment_date : null;
  const lastVisit = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1].appointment_date : null;

  // Service le plus réservé
  const serviceCounts: Record<string, number> = {};
  for (const r of rows) {
    if (r.service) {
      serviceCounts[r.service] = (serviceCounts[r.service] ?? 0) + 1;
    }
  }
  const favoriteService =
    Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const appointmentHistory: AppointmentHistoryItem[] = rows.map((r) => ({
    id: r.id,
    date: r.appointment_date,
    time: r.time_slot ? r.time_slot.slice(0, 5) : null,
    service: r.service,
    status: r.status,
    price: r.price,
    notes: r.notes,
  }));

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShows: noShowCount,
    totalSpent,
    averageSpent,
    firstVisit,
    lastVisit,
    favoriteService,
    appointmentHistory,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseClientStatsOptions {
  clientId: string | null;
  businessId: string | null;
  clientPhone?: string | null;
  clientName?: string | null;
  noShowCount?: number;
}

export function useClientStats({
  clientId,
  businessId,
  clientPhone = null,
  clientName = null,
  noShowCount = 0,
}: UseClientStatsOptions) {
  return useQuery({
    queryKey: clientStatsKeys.stats(clientId ?? '', businessId ?? ''),
    queryFn: () =>
      fetchClientStats(clientId!, businessId!, clientPhone, clientName, noShowCount),
    enabled: Boolean(clientId) && Boolean(businessId) && (Boolean(clientPhone) || Boolean(clientName)),
    staleTime: 30 * 1000,
  });
}
