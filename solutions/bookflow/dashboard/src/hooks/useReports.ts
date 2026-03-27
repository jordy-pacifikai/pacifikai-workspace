'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  businessName: string;
  // Appointments
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShows: number;
  // Revenue
  totalRevenue: number;
  averageRevenue: number;
  // Clients
  newClients: number;
  returningClients: number;
  totalActiveClients: number;
  // Services
  topServices: TopService[];
  // Sources
  bookingSources: Record<string, number>;
  // Comparison
  previousMonthRevenue: number;
  revenueGrowth: number; // percentage
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const reportKeys = {
  all: ['reports'] as const,
  monthly: (businessId: string, month: string) =>
    [...reportKeys.all, 'monthly', businessId, month] as const,
};

// ─── Internal row shapes ──────────────────────────────────────────────────────

interface ApptRow {
  status: string;
  service: string | null;
  source: string | null;
  created_at: string;
  client_phone: string | null;
}

interface PrevApptRow {
  status: string;
  service: string | null;
  source: string | null;
}

interface ClientRow {
  id: string;
  created_at: string;
  total_visits: number | null;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchMonthlyReport(
  businessId: string,
  month: string, // YYYY-MM
): Promise<MonthlyReport> {
  const monthDate = parseISO(`${month}-01`);
  const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

  const prevMonthDate = subMonths(monthDate, 1);
  const prevMonthStart = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd');
  const prevMonthEnd = format(endOfMonth(prevMonthDate), 'yyyy-MM-dd');

  // Fetch in parallel: current month appointments, prev month appointments,
  // business name, current month clients, total clients
  const reportResults = await Promise.allSettled([
      supabase
        .from('bookbot_appointments')
        .select('status, service, source, created_at, client_phone')
        .eq('business_id', businessId)
        .gte('appointment_date', monthStart)
        .lte('appointment_date', monthEnd),

      supabase
        .from('bookbot_appointments')
        .select('status, service, source')
        .eq('business_id', businessId)
        .gte('appointment_date', prevMonthStart)
        .lte('appointment_date', prevMonthEnd),

      supabase
        .from('bookbot_businesses')
        .select('name')
        .eq('id', businessId)
        .single(),

      // Clients created during current month
      supabase
        .from('bookbot_clients')
        .select('id, created_at, total_visits')
        .eq('business_id', businessId)
        .gte('created_at', `${monthStart}T00:00:00`)
        .lte('created_at', `${monthEnd}T23:59:59`),

      supabase
        .from('bookbot_clients')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId),
    ]);

  const currentAppts = reportResults[0].status === 'fulfilled' ? reportResults[0].value : null;
  const prevAppts = reportResults[1].status === 'fulfilled' ? reportResults[1].value : null;
  const businessRes = reportResults[2].status === 'fulfilled' ? reportResults[2].value : null;
  const currentClients = reportResults[3].status === 'fulfilled' ? reportResults[3].value : null;
  const totalClientsRes = reportResults[4].status === 'fulfilled' ? reportResults[4].value : null;

  if (reportResults[0].status === 'rejected') console.warn('[Report] currentAppts query failed:', reportResults[0].reason);
  if (reportResults[1].status === 'rejected') console.warn('[Report] prevAppts query failed:', reportResults[1].reason);
  if (reportResults[2].status === 'rejected') console.warn('[Report] business query failed:', reportResults[2].reason);
  if (reportResults[3].status === 'rejected') console.warn('[Report] currentClients query failed:', reportResults[3].reason);
  if (reportResults[4].status === 'rejected') console.warn('[Report] totalClients query failed:', reportResults[4].reason);

  const appointments = (currentAppts?.data ?? []) as ApptRow[];
  const prevAppointments = (prevAppts?.data ?? []) as PrevApptRow[];
  const businessName = (businessRes?.data as { name: string } | null)?.name ?? 'Mon business';
  const newClientsData = (currentClients?.data ?? []) as ClientRow[];
  const totalActiveClients = totalClientsRes?.count ?? 0;

  // ─── Appointment breakdown ───────────────────────────────────────────────

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;
  const noShows = appointments.filter((a) => a.status === 'no_show').length;

  // ─── Revenue (from services prices if available — currently 0 in DB) ────
  // bookbot_appointments has no price column; revenue is computed from
  // the business's service catalog matched by service name.
  // For now, we return 0 until the price column is added.
  const totalRevenue = 0;
  const averageRevenue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

  // ─── Previous month comparison (appointment count used as proxy) ─────────
  const prevCompleted = prevAppointments.filter((a) => a.status === 'completed').length;
  const prevTotal = prevAppointments.length;

  // Use completedAppointments growth as revenueGrowth proxy when revenue = 0
  const appointmentGrowth =
    prevCompleted > 0
      ? Math.round(((completedAppointments - prevCompleted) / prevCompleted) * 100 * 10) / 10
      : completedAppointments > 0
      ? 100
      : 0;

  // ─── Clients ─────────────────────────────────────────────────────────────

  const newClients = newClientsData.length;
  // Returning clients = those who had > 1 visit created before or during this month
  // Approximate: total_visits > 1 for clients that came this month
  const returningClients = newClientsData.filter(
    (c) => c.total_visits != null && c.total_visits > 1,
  ).length;

  // ─── Top services ────────────────────────────────────────────────────────

  const serviceCounts: Record<string, { count: number; revenue: number }> = {};
  appointments.forEach((a) => {
    const svc = a.service ?? 'Service inconnu';
    if (!serviceCounts[svc]) serviceCounts[svc] = { count: 0, revenue: 0 };
    serviceCounts[svc].count++;
    // revenue = 0 until price column exists
  });

  const topServices: TopService[] = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .map(([name, { count, revenue }]) => ({ name, count, revenue }));

  // ─── Booking sources ─────────────────────────────────────────────────────

  const bookingSources: Record<string, number> = {};
  appointments.forEach((a) => {
    const src = a.source ?? 'manuel';
    bookingSources[src] = (bookingSources[src] ?? 0) + 1;
  });

  return {
    month,
    businessName,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShows,
    totalRevenue,
    averageRevenue,
    newClients,
    returningClients,
    totalActiveClients,
    topServices,
    bookingSources,
    previousMonthRevenue: prevTotal, // reused as prev count proxy
    revenueGrowth: appointmentGrowth,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMonthlyReport(businessId: string | null, month: string) {
  return useQuery({
    queryKey: reportKeys.monthly(businessId ?? '', month),
    queryFn: () => fetchMonthlyReport(businessId!, month),
    enabled: Boolean(businessId) && Boolean(month),
    staleTime: 5 * 60 * 1000, // 5 min — reports don't change often
  });
}
