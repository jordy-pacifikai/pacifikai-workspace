'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const statsKeys = {
  all: ['stats'] as const,
  dashboard: (businessId: string) =>
    [...statsKeys.all, 'dashboard', businessId] as const,
  advanced: (businessId: string) =>
    [...statsKeys.all, 'advanced', businessId] as const,
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

export interface HourBucket {
  hour: number;
  count: number;
}

export interface MonthBucket {
  month: string; // 'YYYY-MM'
  label: string; // 'Jan', 'Fev', etc.
  count: number;
}

export interface SourceBucket {
  source: string;
  count: number;
}

export interface AdvancedStats {
  conversionRate: number; // % sessions that resulted in booking
  totalSessions: number;
  totalBookingsFromSessions: number;
  cancelledCount: number;
  noShowCount: number;
  cancelNoShowRate: number; // (cancelled + no_show) / total
  peakHours: HourBucket[]; // 24 buckets (0-23)
  monthlyTrend: MonthBucket[]; // last 6 months
  sourceBreakdown: SourceBucket[]; // bookings by source
}

// ─── Fetch dashboard stats (existing) ─────────────────────────────────────────

interface AppointmentSummaryRow {
  status: string;
}

async function fetchDashboardStats(businessId: string): Promise<DashboardStats> {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const [todayRes, weekRes, monthRes, pendingRes, clientsRes] = await Promise.all([
    supabase
      .from('bookbot_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('appointment_date', today),

    supabase
      .from('bookbot_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('appointment_date', weekStart)
      .lte('appointment_date', weekEnd),

    supabase
      .from('bookbot_appointments')
      .select('status', { count: 'exact' })
      .eq('business_id', businessId)
      .gte('appointment_date', monthStart)
      .lte('appointment_date', monthEnd),

    supabase
      .from('bookbot_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending'),

    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ]);

  const monthData = (monthRes.data ?? []) as AppointmentSummaryRow[];
  const total = monthData.length;

  const monthRevenue = 0; // bookbot_appointments has no price column

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

// ─── Fetch advanced stats ─────────────────────────────────────────────────────

async function fetchAdvancedStats(businessId: string): Promise<AdvancedStats> {
  const now = new Date();
  const sixMonthsAgo = subMonths(startOfMonth(now), 5); // start of month 5 months back = 6 months total
  const sixMonthsAgoStr = format(sixMonthsAgo, 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  // Fetch all appointments for the last 6 months (for trend, peak hours, source, cancel rate)
  // Also count sessions for conversion rate
  const [apptRes, sessionsRes] = await Promise.all([
    supabase
      .from('bookbot_appointments')
      .select('appointment_date, time_slot, status, source')
      .eq('business_id', businessId)
      .gte('appointment_date', sixMonthsAgoStr)
      .lte('appointment_date', monthEnd),

    // bookbot_sessions count — total conversations
    supabase
      .from('bookbot_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', sixMonthsAgo.toISOString()),
  ]);

  const appointments = apptRes.data ?? [];
  const totalSessions = sessionsRes.count ?? 0;

  // --- Conversion rate ---
  // Bookings that came from chatbot/whatsapp (session-driven sources)
  const sessionDrivenSources = new Set(['chatbot', 'whatsapp', 'messenger']);
  const totalBookingsFromSessions = appointments.filter((a: any) =>
    sessionDrivenSources.has(a.source ?? ''),
  ).length;
  const conversionRate =
    totalSessions > 0
      ? Math.round((totalBookingsFromSessions / totalSessions) * 100 * 10) / 10
      : 0;

  // --- Cancel / No-show rate ---
  const totalAppts = appointments.length;
  const cancelledCount = appointments.filter((a: any) => a.status === 'cancelled').length;
  const noShowCount = appointments.filter((a: any) => a.status === 'no_show').length;
  const cancelNoShowRate =
    totalAppts > 0
      ? Math.round(((cancelledCount + noShowCount) / totalAppts) * 100 * 10) / 10
      : 0;

  // --- Peak hours heatmap (24 buckets) ---
  const hourCounts: number[] = new Array(24).fill(0);
  appointments.forEach((a: any) => {
    const slot = a.time_slot;
    if (slot && typeof slot === 'string') {
      const hour = parseInt(slot.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    }
  });
  const peakHours: HourBucket[] = hourCounts.map((count, hour) => ({ hour, count }));

  // --- Monthly trend (last 6 months) ---
  const monthLabels = [
    'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthlyMap: Record<string, number> = {};
  const monthlyTrend: MonthBucket[] = [];

  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const key = format(m, 'yyyy-MM');
    monthlyMap[key] = 0;
    monthlyTrend.push({
      month: key,
      label: monthLabels[m.getMonth()],
      count: 0,
    });
  }

  appointments.forEach((a: any) => {
    if (a.appointment_date) {
      const key = a.appointment_date.substring(0, 7); // 'YYYY-MM'
      if (key in monthlyMap) {
        monthlyMap[key]++;
      }
    }
  });

  monthlyTrend.forEach((bucket) => {
    bucket.count = monthlyMap[bucket.month] ?? 0;
  });

  // --- Source breakdown ---
  const sourceCounts: Record<string, number> = {};
  appointments.forEach((a: any) => {
    const src = a.source ?? 'manual';
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  });
  const sourceBreakdown: SourceBucket[] = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    conversionRate,
    totalSessions,
    totalBookingsFromSessions,
    cancelledCount,
    noShowCount,
    cancelNoShowRate,
    peakHours,
    monthlyTrend,
    sourceBreakdown,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDashboardStats(businessId: string | null) {
  return useQuery({
    queryKey: statsKeys.dashboard(businessId ?? ''),
    queryFn: () => fetchDashboardStats(businessId!),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdvancedStats(businessId: string | null) {
  return useQuery({
    queryKey: statsKeys.advanced(businessId ?? ''),
    queryFn: () => fetchAdvancedStats(businessId!),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}
