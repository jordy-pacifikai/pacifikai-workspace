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
  subWeeks,
  eachWeekOfInterval,
} from 'date-fns';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: (businessId: string, period: 'week' | 'month') =>
    [...analyticsKeys.all, 'revenue', businessId, period] as const,
  services: (businessId: string) =>
    [...analyticsKeys.all, 'services', businessId] as const,
  sources: (businessId: string) =>
    [...analyticsKeys.all, 'sources', businessId] as const,
  conversion: (businessId: string) =>
    [...analyticsKeys.all, 'conversion', businessId] as const,
  peakHours: (businessId: string) =>
    [...analyticsKeys.all, 'peakHours', businessId] as const,
  cohort: (businessId: string) =>
    [...analyticsKeys.all, 'cohort', businessId] as const,
  revenueForecast: (businessId: string) =>
    [...analyticsKeys.all, 'revenueForecast', businessId] as const,
  topClientsLtv: (businessId: string) =>
    [...analyticsKeys.all, 'topClientsLtv', businessId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = 'week' | 'month';

export interface RevenueDataPoint {
  key: string;       // 'YYYY-WW' or 'YYYY-MM'
  label: string;     // 'Sem 12' or 'Mar'
  revenue: number;   // XPF
  count: number;     // number of completed appointments
}

export interface RevenueStats {
  points: RevenueDataPoint[];
  totalRevenue: number;
  avgPerAppointment: number;
  completedCount: number;
  period: AnalyticsPeriod;
}

export interface ServiceStat {
  name: string;
  bookingCount: number;
  revenue: number;
  cancelledCount: number;
  cancellationRate: number; // %
  avgPrice: number;
}

export interface ServiceStats {
  services: ServiceStat[];
  totalBookings: number;
  totalRevenue: number;
}

export interface SourceStat {
  source: string;
  label: string;
  count: number;
  color: string;
}

export interface SourceStats {
  sources: SourceStat[];
  total: number;
}

export interface ConversionStats {
  pageViews: number;
  serviceSelected: number;
  dateSelected: number;
  bookingConfirmed: number;
  conversionRate: number; // pageViews → bookingConfirmed
  stepRates: number[];    // % from previous step
}

export interface PeakHourCell {
  dayOfWeek: number; // 0=Mon ... 6=Sun
  hour: number;      // 8..20
  count: number;
  intensity: number; // 0..1
}

export interface PeakHoursData {
  cells: PeakHourCell[];
  maxCount: number;
}

// ─── Cohort types ──────────────────────────────────────────────────────────────

export interface CohortRow {
  cohortLabel: string;      // e.g. 'Jan 2026'
  cohortMonth: string;      // 'YYYY-MM'
  totalClients: number;
  retention: (number | null)[];  // M+1..M+6 retention %
}

export interface CohortData {
  rows: CohortRow[];
  hasEnoughData: boolean;
}

// ─── Revenue forecast types ────────────────────────────────────────────────────

export interface ForecastPoint {
  label: string;
  revenue: number;
  projected: boolean;
}

export interface RevenueForecastData {
  points: ForecastPoint[];
}

// ─── Client LTV types ──────────────────────────────────────────────────────────

export interface ClientLtv {
  rank: number;
  clientName: string;
  visitCount: number;
  totalSpent: number;
  lastVisit: string; // ISO date
}

export interface TopClientsLtvData {
  clients: ClientLtv[];
}

// ─── Source display config ────────────────────────────────────────────────────

const SOURCE_DISPLAY: Record<string, { label: string; color: string }> = {
  whatsapp:  { label: 'WhatsApp',   color: '#25D366' },
  chatbot:   { label: 'Chatbot',    color: '#22c55e' },
  messenger: { label: 'Messenger',  color: '#8b5cf6' },
  web:       { label: 'Site web',   color: '#06b6d4' },
  manual:    { label: 'Manuel',     color: '#3b82f6' },
  app:       { label: 'Application',color: '#f59e0b' },
  gcal:      { label: 'Google Cal', color: '#ec4899' },
  guest:     { label: 'Invite',     color: '#6b7280' },
  instagram: { label: 'Instagram',  color: '#e1306c' },
};

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ─── Fetch: Revenue stats ─────────────────────────────────────────────────────

async function fetchRevenueStats(
  businessId: string,
  period: AnalyticsPeriod,
): Promise<RevenueStats> {
  const now = new Date();
  let rangeStart: Date;

  if (period === 'week') {
    // Last 12 weeks
    rangeStart = startOfWeek(subWeeks(now, 11), { weekStartsOn: 1 });
  } else {
    // Last 6 months
    rangeStart = startOfMonth(subMonths(now, 5));
  }

  const rangeEnd = period === 'week'
    ? endOfWeek(now, { weekStartsOn: 1 })
    : endOfMonth(now);

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('appointment_date, status, price')
    .eq('business_id', businessId)
    .gte('appointment_date', format(rangeStart, 'yyyy-MM-dd'))
    .lte('appointment_date', format(rangeEnd, 'yyyy-MM-dd'));

  if (error) throw new Error(error.message);

  const appointments = data ?? [];

  // Build buckets
  const bucketMap = new Map<string, { revenue: number; count: number; label: string }>();

  if (period === 'week') {
    // 12 weeks: key = 'YYYY-WW'
    const weeks = eachWeekOfInterval(
      { start: rangeStart, end: rangeEnd },
      { weekStartsOn: 1 },
    );
    weeks.forEach((weekStart) => {
      const key = format(weekStart, "yyyy-'W'ww");
      const weekNum = format(weekStart, 'w');
      bucketMap.set(key, { revenue: 0, count: 0, label: `S${weekNum}` });
    });
  } else {
    // 6 months: key = 'YYYY-MM'
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const key = format(m, 'yyyy-MM');
      bucketMap.set(key, { revenue: 0, count: 0, label: MONTH_LABELS[m.getMonth()] });
    }
  }

  // Fill with appointment data (only completed appointments generate revenue)
  appointments.forEach((a: any) => {
    if (!a.appointment_date) return;
    let key: string;

    if (period === 'week') {
      // Parse appointment date to get its week key
      const apptDate = new Date(a.appointment_date);
      const weekStart = startOfWeek(apptDate, { weekStartsOn: 1 });
      key = format(weekStart, "yyyy-'W'ww");
    } else {
      key = a.appointment_date.substring(0, 7);
    }

    const bucket = bucketMap.get(key);
    if (!bucket) return;

    bucket.count += 1;
    if (a.status === 'completed') {
      bucket.revenue += a.price ?? 0;
    }
  });

  const points: RevenueDataPoint[] = Array.from(bucketMap.entries()).map(
    ([key, { revenue, count, label }]) => ({ key, label, revenue, count }),
  );

  const completedAppts = appointments.filter((a: any) => a.status === 'completed');
  const totalRevenue = completedAppts.reduce((sum: number, a: any) => sum + (a.price ?? 0), 0);
  const avgPerAppointment = completedAppts.length > 0
    ? Math.round(totalRevenue / completedAppts.length)
    : 0;

  return {
    points,
    totalRevenue,
    avgPerAppointment,
    completedCount: completedAppts.length,
    period,
  };
}

// ─── Fetch: Service stats ─────────────────────────────────────────────────────

async function fetchServiceStats(businessId: string): Promise<ServiceStats> {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('service, status, price')
    .eq('business_id', businessId)
    .gte('appointment_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
    .lte('appointment_date', format(endOfMonth(now), 'yyyy-MM-dd'));

  if (error) throw new Error(error.message);

  const appointments = data ?? [];

  // Aggregate by service name
  const serviceMap = new Map<string, { bookings: number; revenue: number; cancelled: number }>();

  appointments.forEach((a: any) => {
    const name = a.service?.trim() || 'Service non defini';
    const existing = serviceMap.get(name) ?? { bookings: 0, revenue: 0, cancelled: 0 };
    existing.bookings += 1;
    if (a.status === 'completed') existing.revenue += a.price ?? 0;
    if (a.status === 'cancelled') existing.cancelled += 1;
    serviceMap.set(name, existing);
  });

  const services: ServiceStat[] = Array.from(serviceMap.entries())
    .map(([name, data]) => ({
      name,
      bookingCount: data.bookings,
      revenue: data.revenue,
      cancelledCount: data.cancelled,
      cancellationRate: data.bookings > 0
        ? Math.round((data.cancelled / data.bookings) * 100 * 10) / 10
        : 0,
      avgPrice: data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 8);

  const totalBookings = appointments.length;
  const totalRevenue = appointments
    .filter((a: any) => a.status === 'completed')
    .reduce((sum: number, a: any) => sum + (a.price ?? 0), 0);

  return { services, totalBookings, totalRevenue };
}

// ─── Fetch: Source stats ──────────────────────────────────────────────────────

async function fetchSourceStats(businessId: string): Promise<SourceStats> {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('source')
    .eq('business_id', businessId)
    .gte('appointment_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
    .lte('appointment_date', format(endOfMonth(now), 'yyyy-MM-dd'));

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((a: any) => {
    const src = a.source?.trim() || 'manual';
    counts[src] = (counts[src] ?? 0) + 1;
  });

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  const sources: SourceStat[] = Object.entries(counts)
    .map(([source, count]) => ({
      source,
      label: SOURCE_DISPLAY[source]?.label ?? source,
      count,
      color: SOURCE_DISPLAY[source]?.color ?? '#6b7280',
    }))
    .sort((a, b) => b.count - a.count);

  return { sources, total };
}

// ─── Fetch: Conversion stats ──────────────────────────────────────────────────

async function fetchConversionStats(businessId: string): Promise<ConversionStats> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('bookbot_page_views')
    .select('event')
    .eq('business_id', businessId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('[Conversion] Fetch failed:', error.message);
    return {
      pageViews: 0,
      serviceSelected: 0,
      dateSelected: 0,
      bookingConfirmed: 0,
      conversionRate: 0,
      stepRates: [100, 0, 0, 0],
    };
  }

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    counts[row.event] = (counts[row.event] ?? 0) + 1;
  });

  const pageViews = counts['page_view'] ?? 0;
  const serviceSelected = counts['service_selected'] ?? 0;
  const dateSelected = counts['date_selected'] ?? 0;
  const bookingConfirmed = counts['booking_confirmed'] ?? 0;

  const conversionRate = pageViews > 0
    ? Math.round((bookingConfirmed / pageViews) * 100 * 10) / 10
    : 0;

  // Step drop-off rates (% from previous step)
  const stepRates = [
    100,
    pageViews > 0 ? Math.round((serviceSelected / pageViews) * 100) : 0,
    serviceSelected > 0 ? Math.round((dateSelected / serviceSelected) * 100) : 0,
    dateSelected > 0 ? Math.round((bookingConfirmed / dateSelected) * 100) : 0,
  ];

  return {
    pageViews,
    serviceSelected,
    dateSelected,
    bookingConfirmed,
    conversionRate,
    stepRates,
  };
}

// ─── Fetch: Peak hours heatmap ────────────────────────────────────────────────

async function fetchPeakHours(businessId: string): Promise<PeakHoursData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('appointment_date, time_slot')
    .eq('business_id', businessId)
    .gte('appointment_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
    .lte('appointment_date', format(now, 'yyyy-MM-dd'))
    .not('status', 'eq', 'cancelled');

  if (error) throw new Error(error.message);

  // 7 days (0=Mon ... 6=Sun) × hours 8-20 = 13 slots
  const cellMap: Record<string, number> = {};

  (data ?? []).forEach((a: any) => {
    if (!a.appointment_date || !a.time_slot) return;

    const date = new Date(a.appointment_date);
    // getDay() = 0 (Sun), 1 (Mon)...6 (Sat) → remap to Mon=0 ... Sun=6
    const rawDay = date.getDay();
    const dayOfWeek = rawDay === 0 ? 6 : rawDay - 1;

    const hour = parseInt(a.time_slot.split(':')[0], 10);
    if (isNaN(hour) || hour < 8 || hour > 20) return;

    const key = `${dayOfWeek}_${hour}`;
    cellMap[key] = (cellMap[key] ?? 0) + 1;
  });

  const cells: PeakHourCell[] = [];
  let maxCount = 0;

  for (let d = 0; d < 7; d++) {
    for (let h = 8; h <= 20; h++) {
      const count = cellMap[`${d}_${h}`] ?? 0;
      if (count > maxCount) maxCount = count;
      cells.push({ dayOfWeek: d, hour: h, count, intensity: 0 });
    }
  }

  // Normalize intensity
  if (maxCount > 0) {
    cells.forEach((cell) => {
      cell.intensity = cell.count / maxCount;
    });
  }

  return { cells, maxCount };
}

// ─── Fetch: Cohort analysis ──────────────────────────────────────────────────

async function fetchCohortData(businessId: string): Promise<CohortData> {
  const now = new Date();
  // Fetch last 9 months of data to have 6 cohorts with up to M+6 retention
  const nineMonthsAgo = startOfMonth(subMonths(now, 8));

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('client_name, client_phone, appointment_date, created_at, status')
    .eq('business_id', businessId)
    .gte('appointment_date', format(nineMonthsAgo, 'yyyy-MM-dd'))
    .not('status', 'eq', 'cancelled');

  if (error) throw new Error(error.message);

  const appointments = data ?? [];
  if (appointments.length < 10) {
    return { rows: [], hasEnoughData: false };
  }

  // Group appointments by client, find their first month (cohort)
  const clientFirstMonth = new Map<string, string>();
  const clientActiveMonths = new Map<string, Set<string>>();

  appointments.forEach((a: { client_name: string | null; client_phone: string | null; appointment_date: string | null; created_at: string | null }) => {
    // Use phone as unique key (avoids homonym merging), fallback to name
    const key = a.client_phone?.trim() || a.client_name?.trim();
    if (!key || !a.appointment_date) return;

    const apptMonth = a.appointment_date.substring(0, 7);
    const createdMonth = a.created_at ? a.created_at.substring(0, 7) : apptMonth;

    // First month = earliest of created_at or first appointment
    const existing = clientFirstMonth.get(key);
    if (!existing || createdMonth < existing) {
      clientFirstMonth.set(key, createdMonth);
    }

    if (!clientActiveMonths.has(key)) {
      clientActiveMonths.set(key, new Set());
    }
    clientActiveMonths.get(key)!.add(apptMonth);
  });

  // Build cohort rows for the last 6 complete months
  const rows: CohortRow[] = [];
  const currentMonth = format(now, 'yyyy-MM');

  for (let i = 6; i >= 1; i--) {
    const cohortDate = subMonths(now, i);
    const cohortKey = format(cohortDate, 'yyyy-MM');
    const cohortLabel = MONTH_LABELS[cohortDate.getMonth()] + ' ' + cohortDate.getFullYear();

    // Clients whose first month is this cohort
    const cohortClients: string[] = [];
    clientFirstMonth.forEach((firstMonth, clientName) => {
      if (firstMonth === cohortKey) cohortClients.push(clientName);
    });

    if (cohortClients.length === 0) {
      rows.push({
        cohortLabel,
        cohortMonth: cohortKey,
        totalClients: 0,
        retention: [null, null, null, null, null, null],
      });
      continue;
    }

    // Compute retention for M+1 to M+6
    const retention: (number | null)[] = [];
    for (let m = 1; m <= 6; m++) {
      const targetDate = subMonths(now, i - m);
      const targetMonth = format(targetDate, 'yyyy-MM');

      // If target month is in the future, retention = null
      if (targetMonth > currentMonth) {
        retention.push(null);
        continue;
      }

      const retained = cohortClients.filter((name) =>
        clientActiveMonths.get(name)?.has(targetMonth),
      ).length;

      retention.push(Math.round((retained / cohortClients.length) * 100));
    }

    rows.push({
      cohortLabel,
      cohortMonth: cohortKey,
      totalClients: cohortClients.length,
      retention,
    });
  }

  const hasEnoughData = rows.some((r) => r.totalClients > 0);
  return { rows, hasEnoughData };
}

// ─── Fetch: Revenue forecast ─────────────────────────────────────────────────

async function fetchRevenueForecast(businessId: string): Promise<RevenueForecastData> {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('appointment_date, price, status')
    .eq('business_id', businessId)
    .eq('status', 'completed')
    .gte('appointment_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
    .lte('appointment_date', format(endOfMonth(now), 'yyyy-MM-dd'));

  if (error) throw new Error(error.message);

  const appointments = data ?? [];

  // Bucket by month
  const monthRevenue = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    monthRevenue.set(format(m, 'yyyy-MM'), 0);
  }

  appointments.forEach((a: { appointment_date: string | null; price: number | null }) => {
    if (!a.appointment_date) return;
    const key = a.appointment_date.substring(0, 7);
    const existing = monthRevenue.get(key);
    if (existing !== undefined) {
      monthRevenue.set(key, existing + (a.price ?? 0));
    }
  });

  // Historical points
  const historicalPoints: ForecastPoint[] = [];
  const revenueValues: number[] = [];

  monthRevenue.forEach((rev, key) => {
    const monthIdx = parseInt(key.split('-')[1], 10) - 1;
    historicalPoints.push({
      label: MONTH_LABELS[monthIdx],
      revenue: rev,
      projected: false,
    });
    revenueValues.push(rev);
  });

  // Linear regression for projection (y = a + bx)
  const n = revenueValues.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += revenueValues[i];
    sumXY += i * revenueValues[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = denominator !== 0 ? (sumY - slope * sumX) / n : (sumY / n);

  // Project 3 months ahead
  const projectedPoints: ForecastPoint[] = [];
  for (let i = 1; i <= 3; i++) {
    const futureDate = subMonths(now, -i);
    const monthIdx = futureDate.getMonth();
    const projected = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
    projectedPoints.push({
      label: MONTH_LABELS[monthIdx],
      revenue: projected,
      projected: true,
    });
  }

  return { points: [...historicalPoints, ...projectedPoints] };
}

// ─── Fetch: Top clients LTV ─────────────────────────────────────────────────

async function fetchTopClientsLtv(businessId: string): Promise<TopClientsLtvData> {
  const { data, error } = await supabase
    .from('bookbot_appointments')
    .select('client_name, client_phone, price, appointment_date, status')
    .eq('business_id', businessId)
    .eq('status', 'completed');

  if (error) throw new Error(error.message);

  const appointments = data ?? [];

  // Aggregate per client
  const clientMap = new Map<string, { totalSpent: number; visitCount: number; lastVisit: string }>();

  // Track display name per key for LTV table
  const clientDisplayName = new Map<string, string>();

  appointments.forEach((a: { client_name: string | null; client_phone: string | null; price: number | null; appointment_date: string | null }) => {
    const key = a.client_phone?.trim() || a.client_name?.trim();
    if (!key || !a.appointment_date) return;

    if (a.client_name?.trim()) clientDisplayName.set(key, a.client_name.trim());

    const existing = clientMap.get(key) ?? { totalSpent: 0, visitCount: 0, lastVisit: '' };
    existing.totalSpent += a.price ?? 0;
    existing.visitCount += 1;
    if (a.appointment_date > existing.lastVisit) {
      existing.lastVisit = a.appointment_date;
    }
    clientMap.set(key, existing);
  });

  const clients: ClientLtv[] = Array.from(clientMap.entries())
    .map(([key, data]) => ({
      rank: 0,
      clientName: clientDisplayName.get(key) ?? key,
      visitCount: data.visitCount,
      totalSpent: data.totalSpent,
      lastVisit: data.lastVisit,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  return { clients };
}

// ─── Exported hooks ───────────────────────────────────────────────────────────

export function useRevenueStats(businessId: string | null, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: analyticsKeys.revenue(businessId ?? '', period),
    queryFn: () => fetchRevenueStats(businessId!, period),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function useServiceStats(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.services(businessId ?? ''),
    queryFn: () => fetchServiceStats(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function useSourceStats(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.sources(businessId ?? ''),
    queryFn: () => fetchSourceStats(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function useConversionStats(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.conversion(businessId ?? ''),
    queryFn: () => fetchConversionStats(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function usePeakHours(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.peakHours(businessId ?? ''),
    queryFn: () => fetchPeakHours(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });
}

export function useCohortData(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.cohort(businessId ?? ''),
    queryFn: () => fetchCohortData(businessId!),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueForecast(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.revenueForecast(businessId ?? ''),
    queryFn: () => fetchRevenueForecast(businessId!),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopClientsLtv(businessId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.topClientsLtv(businessId ?? ''),
    queryFn: () => fetchTopClientsLtv(businessId!),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}
