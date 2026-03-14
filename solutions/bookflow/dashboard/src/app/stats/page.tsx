'use client';

import { useMemo } from 'react';
import {
  Calendar,
  Banknote,
  CheckCircle,
  AlertTriangle,
  Users,
  Clock,
  BarChart3,
  MessageSquare,
  XCircle,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useDashboardStats, useAdvancedStats } from '@/hooks/useStats';
import { useAppointments } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
};

function StatCard({ label, value, icon: Icon, accent = '#25D366', sub }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums break-words">{value}</p>
      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

type BarItem = {
  label: string;
  count: number;
  color: string;
  max: number;
};

function HorizontalBar({ label, count, color, max }: BarItem) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm text-gray-300 tabular-nums w-8 text-right shrink-0">{count}</span>
    </div>
  );
}

// ─── Donut segment (pure CSS) ─────────────────────────────────────────────────

type DonutProps = {
  segments: { label: string; value: number; color: string }[];
  total: number;
};

function DonutChart({ segments, total }: DonutProps) {
  // Build conic-gradient stops
  let accumulated = 0;
  const stops: string[] = [];

  segments.forEach((seg) => {
    const pct = total > 0 ? (seg.value / total) * 100 : 0;
    stops.push(`${seg.color} ${accumulated}% ${accumulated + pct}%`);
    accumulated += pct;
  });

  // Fill remaining with dark gray
  if (accumulated < 100) {
    stops.push(`#1f2937 ${accumulated}% 100%`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut ring */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${stops.join(', ')})`,
          }}
        />
        {/* Inner cutout */}
        <div className="absolute inset-3 bg-gray-900 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-white tabular-nums">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-sm text-gray-400 flex-1 truncate">{seg.label}</span>
            <span className="text-sm text-gray-300 tabular-nums">{seg.value}</span>
            <span className="text-xs text-gray-600 tabular-nums w-10 text-right">
              {total > 0 ? `${Math.round((seg.value / total) * 100)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Peak hours heatmap ───────────────────────────────────────────────────────

function PeakHoursHeatmap({
  hours,
}: {
  hours: { hour: number; count: number }[];
}) {
  const max = Math.max(...hours.map((h) => h.count), 1);

  // Only show business-relevant hours (7h-22h)
  const visibleHours = hours.filter((h) => h.hour >= 7 && h.hour <= 21);

  return (
    <div className="space-y-3">
      {/* Hour grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5">
        {visibleHours.map((h) => {
          const intensity = h.count > 0 ? Math.max(0.15, h.count / max) : 0;
          return (
            <div key={h.hour} className="flex flex-col items-center gap-1">
              <div
                className="w-full aspect-square rounded-lg border border-gray-800 flex items-center justify-center text-xs font-medium tabular-nums transition-colors"
                style={{
                  backgroundColor:
                    h.count > 0
                      ? `rgba(37, 211, 102, ${intensity})`
                      : 'rgb(17, 24, 39)',
                  color: intensity > 0.5 ? '#fff' : '#9ca3af',
                }}
              >
                {h.count}
              </div>
              <span className="text-[10px] text-gray-600 tabular-nums">
                {String(h.hour).padStart(2, '0')}h
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend bar */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-gray-600">Faible</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1.0].map((opacity) => (
            <div
              key={opacity}
              className="flex-1 h-full"
              style={{ backgroundColor: `rgba(37, 211, 102, ${opacity})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-600">Fort</span>
      </div>
    </div>
  );
}

// ─── Monthly trend bar chart (pure CSS) ───────────────────────────────────────

function MonthlyTrendChart({
  months,
}: {
  months: { month: string; label: string; count: number }[];
}) {
  const max = Math.max(...months.map((m) => m.count), 1);

  return (
    <div className="flex items-end gap-2 h-44">
      {months.map((m) => {
        const heightPct = max > 0 ? Math.max(2, (m.count / max) * 100) : 2;
        return (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Count label */}
            <span className="text-xs text-gray-400 tabular-nums">{m.count}</span>

            {/* Bar */}
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  background: 'linear-gradient(180deg, #25D366, #1aab52)',
                }}
              />
            </div>

            {/* Month label */}
            <span className="text-xs text-gray-500 font-medium">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status colors ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmes', color: '#3b82f6' },
  completed: { label: 'Termines', color: '#25D366' },
  cancelled: { label: 'Annules', color: '#ef4444' },
  no_show: { label: 'No-show', color: '#f59e0b' },
  pending: { label: 'En attente', color: '#6b7280' },
};

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  chatbot: { label: 'Chatbot', color: '#25D366' },
  whatsapp: { label: 'WhatsApp', color: '#22c55e' },
  messenger: { label: 'Messenger', color: '#8b5cf6' },
  manual: { label: 'Manuel', color: '#3b82f6' },
  web: { label: 'Site web', color: '#06b6d4' },
  app: { label: 'Application', color: '#f59e0b' },
  gcal: { label: 'Google Calendar', color: '#ec4899' },
  guest: { label: 'Invite', color: '#6b7280' },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-gray-900 border border-gray-800 rounded-xl overflow-hidden', className)}>
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-800">
        <Icon className="w-4 h-4 text-[#25D366] shrink-0" />
        <h2 className="text-white font-semibold text-sm truncate">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`top-${i}`} />
        ))}
      </div>
      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`bot-${i}`} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={`left-${i}`} />
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={`right-${i}`} />
          ))}
        </div>
      </div>
      {/* Wide sections */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={`wide-${i}`} />
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={`svc-${i}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { businessId, businessName } = useAppStore();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { data: stats, isLoading: statsLoading } = useDashboardStats(businessId);
  const { data: advanced, isLoading: advancedLoading } = useAdvancedStats(businessId);
  const { data: appointments, isLoading: apptLoading } = useAppointments(
    businessId,
    undefined,
    { dateFrom: format(monthStart, 'yyyy-MM-dd'), dateTo: format(monthEnd, 'yyyy-MM-dd') },
  );

  const isLoading = statsLoading || apptLoading || advancedLoading;

  // ─── Derived data: status breakdown (current month) ─────────────────────────

  const statusBreakdown = useMemo(() => {
    if (!appointments) return [];
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const s = a.status ?? 'pending';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(STATUS_CONFIG)
      .map(([key, cfg]) => ({
        key,
        label: cfg.label,
        color: cfg.color,
        count: counts[key] ?? 0,
        max,
      }))
      .filter(
        (item) => item.count > 0 || ['confirmed', 'completed', 'pending'].includes(item.key),
      );
  }, [appointments]);

  // ─── Derived data: source donut segments (from advanced stats, 6 months) ────

  const sourceDonutSegments = useMemo(() => {
    if (!advanced?.sourceBreakdown) return [];
    return advanced.sourceBreakdown.map((s) => ({
      label: SOURCE_CONFIG[s.source]?.label ?? s.source,
      value: s.count,
      color: SOURCE_CONFIG[s.source]?.color ?? '#6b7280',
    }));
  }, [advanced]);

  const sourceTotal = useMemo(
    () => sourceDonutSegments.reduce((sum, s) => sum + s.value, 0),
    [sourceDonutSegments],
  );

  // ─── Derived data: top services (current month) ─────────────────────────────

  const topServices = useMemo(() => {
    if (!appointments) return [];
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const svc = a.service ?? 'Service inconnu';
      counts[svc] = (counts[svc] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [appointments]);

  const maxServiceCount = useMemo(
    () => Math.max(...topServices.map((s) => s.count), 1),
    [topServices],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading)
    return (
      <DashboardLayout title="Statistiques" businessName={businessName ?? undefined}>
        <StatsSkeleton />
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="Statistiques" businessName={businessName ?? undefined}>
      <div className="space-y-6">
        {/* Period label */}
        <p className="text-sm text-gray-400">
          Periode:{' '}
          <span className="text-white font-medium capitalize">
            {format(now, 'MMMM yyyy')}
          </span>
          <span className="text-gray-600 ml-2">
            -- Tendances sur 6 mois
          </span>
        </p>

        {/* ── KPI cards row 1: existing ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="RDV ce mois"
            value={stats?.monthCount ?? 0}
            icon={Calendar}
            accent="#3b82f6"
            sub={`${stats?.weekCount ?? 0} cette semaine`}
          />
          <StatCard
            label="Chiffre d'affaires"
            value={
              stats?.monthRevenue != null
                ? `${stats.monthRevenue.toLocaleString('fr-FR')} XPF`
                : '0 XPF'
            }
            icon={Banknote}
            accent="#25D366"
          />
          <StatCard
            label="Taux de completion"
            value={stats?.completionRate != null ? `${Math.round(stats.completionRate)}%` : '--'}
            icon={CheckCircle}
            accent="#25D366"
            sub={`${stats?.totalClients ?? 0} clients total`}
          />
          <StatCard
            label="Taux no-show"
            value={stats?.noShowRate != null ? `${Math.round(stats.noShowRate)}%` : '--'}
            icon={AlertTriangle}
            accent="#f59e0b"
            sub={`${stats?.pendingCount ?? 0} en attente`}
          />
        </div>

        {/* ── KPI cards row 2: new analytics ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Taux de conversion"
            value={advanced ? `${advanced.conversionRate}%` : '--'}
            icon={Zap}
            accent="#8b5cf6"
            sub={
              advanced
                ? `${advanced.totalBookingsFromSessions} RDV / ${advanced.totalSessions} conv.`
                : undefined
            }
          />
          <StatCard
            label="Temps de reponse moy."
            value="--"
            icon={Clock}
            accent="#06b6d4"
            sub="Bientot disponible"
          />
          <StatCard
            label="Annulations + No-show"
            value={advanced ? `${advanced.cancelNoShowRate}%` : '--'}
            icon={XCircle}
            accent="#ef4444"
            sub={
              advanced
                ? `${advanced.cancelledCount} annul. + ${advanced.noShowCount} no-show`
                : undefined
            }
          />
          <StatCard
            label="RDV aujourd'hui"
            value={stats?.todayCount ?? 0}
            icon={Calendar}
            accent="#3b82f6"
          />
        </div>

        {/* ── Monthly trend (bar chart) ───────────────────────────────────────── */}
        <Section title="Tendance mensuelle (6 derniers mois)" icon={BarChart3}>
          {advanced?.monthlyTrend && advanced.monthlyTrend.length > 0 ? (
            <MonthlyTrendChart months={advanced.monthlyTrend} />
          ) : (
            <p className="text-sm text-gray-500 italic">
              Pas encore de donnees sur 6 mois.
            </p>
          )}
        </Section>

        {/* ── Source donut + Status bars ───────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Source breakdown donut */}
          <Section title="Repartition par source (6 mois)" icon={MessageSquare}>
            {sourceDonutSegments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune donnee pour cette periode.</p>
            ) : (
              <DonutChart segments={sourceDonutSegments} total={sourceTotal} />
            )}
          </Section>

          {/* Status breakdown bars */}
          <Section title="Par statut (ce mois)" icon={CheckCircle}>
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune donnee pour cette periode.</p>
            ) : (
              <div className="space-y-4">
                {statusBreakdown.map((item) => (
                  <HorizontalBar
                    key={item.key}
                    label={item.label}
                    count={item.count}
                    color={item.color}
                    max={item.max}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Peak hours heatmap ──────────────────────────────────────────────── */}
        <Section title="Heures de pointe (6 mois)" icon={Clock}>
          {advanced?.peakHours ? (
            <PeakHoursHeatmap hours={advanced.peakHours} />
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune donnee disponible.</p>
          )}
        </Section>

        {/* ── Top services ────────────────────────────────────────────────────── */}
        <Section title="Top 5 services (ce mois)" icon={Users}>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Aucun service enregistre pour cette periode.
            </p>
          ) : (
            <div className="space-y-4">
              {topServices.map((svc, idx) => (
                <div key={svc.name} className="flex items-center gap-4">
                  {/* Rank */}
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      idx === 0 && 'bg-amber-500/20 text-amber-400',
                      idx === 1 && 'bg-gray-600/40 text-gray-300',
                      idx === 2 && 'bg-orange-800/30 text-orange-400',
                      idx > 2 && 'bg-gray-800 text-gray-500',
                    )}
                  >
                    {idx + 1}
                  </span>

                  {/* Bar */}
                  <span className="text-sm text-gray-300 w-24 sm:w-40 truncate shrink-0">{svc.name}</span>
                  <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((svc.count / maxServiceCount) * 100)}%`,
                        background: 'linear-gradient(90deg, #25D366, #1aab52)',
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 tabular-nums w-12 text-right shrink-0">
                    {svc.count} RDV
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Summary footer ──────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'RDV cette semaine', value: stats?.weekCount ?? 0, accent: '#8b5cf6' },
            { label: 'Clients fideles', value: stats?.totalClients ?? 0, accent: '#25D366' },
            {
              label: 'Conversations totales',
              value: advanced?.totalSessions ?? 0,
              accent: '#06b6d4',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <span className="text-sm text-gray-400">{item.label}</span>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: item.accent }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
