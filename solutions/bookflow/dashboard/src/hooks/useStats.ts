'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const statsKeys = {
  all: ['stats'] as const,
  dashboard: (businessId: string) =>
    [...statsKeys.all, 'dashboard', businessId] as const,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  pendingCount: number;
  totalClients: number;
  monthRevenue: number;
  noShowRate: number;
  completionRate: number;
}

// ─── Fetch ─────────────────────────────────────────────────────────────────────

interface AppointmentSummaryRow {
  status: string;
  price: number | null;
}

async function fetchDashboardStats(businessId: string): Promise<DashboardStats> {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const [todayRes, weekRes, monthRes, pendingRes, clientsRes] = await Promise.all([
    // Today's appointment count (head = count only, no rows)
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('date', today),

    // This week's appointment count
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('date', weekStart)
      .lte('date', weekEnd),

    // This month's appointments with status + price for revenue/rate calcs
    supabase
      .from('appointments')
      .select('status, price', { count: 'exact' })
      .eq('business_id', businessId)
      .gte('date', monthStart)
      .lte('date', monthEnd),

    // Pending appointments count
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending'),

    // Total clients count
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ]);

  const monthData = (monthRes.data ?? []) as AppointmentSummaryRow[];
  const total = monthData.length;

  const monthRevenue = monthData
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.price ?? 0), 0);

  const noShows = monthData.filter((a) => a.status === 'no_show').length;
  const completed = monthData.filter((a) => a.status === 'completed').length;

  return {
    todayCount: todayRes.count ?? 0,
    weekCount: weekRes.count ?? 0,
    monthCount: total,
    pendingCount: pendingRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    monthRevenue,
    noShowRate: total > 0 ? (noShows / total) * 100 : 0,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useDashboardStats(businessId: string | null) {
  return useQuery({
    queryKey: statsKeys.dashboard(businessId ?? ''),
    queryFn: () => fetchDashboardStats(businessId!),
    enabled: Boolean(businessId),
    // Stats are fairly stable — refresh every 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
