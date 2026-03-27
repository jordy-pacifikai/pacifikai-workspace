'use client';

import { useState, Suspense } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Zap,
  Clock,
  XCircle,
  Banknote,
  ShoppingBag,
  Eye,
  CheckCircle,
  Users,
  Target,
  Trophy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import {
  useRevenueStats,
  useServiceStats,
  useSourceStats,
  useConversionStats,
  usePeakHours,
  useCohortData,
  useRevenueForecast,
  useTopClientsLtv,
  type AnalyticsPeriod,
  type CohortRow,
  type ForecastPoint,
  type ClientLtv,
} from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

// ─── Color palette ────────────────────────────────────────────────────────────

const ACCENT = '#25D366';
const SERVICE_COLORS = [
  '#25D366', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#a3e635',
];

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
  loading?: boolean;
}

function KpiCard({ label, value, icon: Icon, accent = ACCENT, sub, loading }: KpiCardProps) {
  if (loading) return <SkeletonCard />;
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

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  className,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('bg-gray-900 border border-gray-800 rounded-xl overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
          <h2 className="text-white font-semibold text-sm truncate">{title}</h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

// ─── Period selector ──────────────────────────────────────────────────────────

function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs font-medium">
      {(['week', 'month'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 transition-colors',
            value === p
              ? 'text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200',
          )}
          style={value === p ? { backgroundColor: ACCENT, color: '#fff' } : undefined}
        >
          {p === 'week' ? 'Semaine' : 'Mois'}
        </button>
      ))}
    </div>
  );
}

// ─── Revenue bar chart (CSS-only) ─────────────────────────────────────────────

function RevenueBarChart({
  points,
  loading,
}: {
  points: { key: string; label: string; revenue: number; count: number }[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="h-48 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md skeleton"
            style={{ height: `${20 + ((i * 37 + 13) % 60)}%` }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(...points.map((p) => p.revenue), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1.5 h-48 min-w-[320px]">
        {points.map((p) => {
          const heightPct = max > 0 ? Math.max(2, (p.revenue / max) * 100) : 2;
          const revenueFormatted = p.revenue.toLocaleString('fr-FR');
          return (
            <div key={p.key} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Revenue label on hover */}
              <span className="text-[10px] text-gray-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {revenueFormatted}
              </span>
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500 cursor-default"
                  style={{
                    height: `${heightPct}%`,
                    background: `linear-gradient(180deg, ${ACCENT}, #1aab52)`,
                  }}
                  title={`${p.label}: ${revenueFormatted} XPF (${p.count} RDV)`}
                />
              </div>
              {/* Period label */}
              <span className="text-[10px] text-gray-500 font-medium">{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Services horizontal bars ─────────────────────────────────────────────────

function ServicesChart({
  services,
  totalBookings,
  loading,
}: {
  services: { name: string; bookingCount: number; revenue: number; cancellationRate: number }[];
  totalBookings: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">Aucune donnee de service disponible.</p>
    );
  }

  const maxCount = Math.max(...services.map((s) => s.bookingCount), 1);

  return (
    <div className="space-y-4">
      {services.map((svc, idx) => {
        const widthPct = Math.round((svc.bookingCount / maxCount) * 100);
        const color = SERVICE_COLORS[idx % SERVICE_COLORS.length];
        const shareOfTotal = totalBookings > 0
          ? Math.round((svc.bookingCount / totalBookings) * 100)
          : 0;

        return (
          <div key={svc.name}>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-300 truncate">{svc.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="text-gray-400 tabular-nums">
                  {svc.revenue > 0 ? `${svc.revenue.toLocaleString('fr-FR')} XPF` : '—'}
                </span>
                <span className="text-gray-500 tabular-nums w-8 text-right">
                  {svc.bookingCount}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs text-gray-600 tabular-nums w-8 text-right">
                {shareOfTotal}%
              </span>
            </div>
            {svc.cancellationRate > 0 && (
              <p className="text-xs text-gray-600 mt-0.5 ml-4">
                {svc.cancellationRate}% d&apos;annulations
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut chart (CSS conic-gradient) ────────────────────────────────────────

function DonutChart({
  sources,
  total,
  loading,
}: {
  sources: { source: string; label: string; count: number; color: string }[];
  total: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex gap-6 items-center">
        <div className="w-32 h-32 rounded-full skeleton shrink-0" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return <p className="text-sm text-gray-500 italic">Aucune donnee de source disponible.</p>;
  }

  let accumulated = 0;
  const stops: string[] = sources.map((s) => {
    const pct = total > 0 ? (s.count / total) * 100 : 0;
    const stop = `${s.color} ${accumulated}% ${accumulated + pct}%`;
    accumulated += pct;
    return stop;
  });

  if (accumulated < 100) {
    stops.push(`#1f2937 ${accumulated}% 100%`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut ring */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{ background: `conic-gradient(${stops.join(', ')})` }}
        />
        <div className="absolute inset-3 bg-gray-900 rounded-full flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white tabular-nums">{total}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wide">RDV</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {sources.map((s) => (
          <div key={s.source} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-gray-400 flex-1 truncate">{s.label}</span>
            <span className="text-sm text-gray-300 tabular-nums">{s.count}</span>
            <span className="text-xs text-gray-600 tabular-nums w-10 text-right">
              {total > 0 ? `${Math.round((s.count / total) * 100)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Peak hours heatmap ───────────────────────────────────────────────────────

function PeakHoursHeatmap({
  cells,
  maxCount,
  loading,
}: {
  cells: { dayOfWeek: number; hour: number; count: number; intensity: number }[];
  maxCount: number;
  loading: boolean;
}) {
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-1">
            <div className="w-8 skeleton h-7 rounded" />
            {Array.from({ length: 13 }).map((_, j) => (
              <div key={j} className="flex-1 skeleton h-7 rounded" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (maxCount === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Pas assez de donnees pour le heatmap (90 derniers jours).
      </p>
    );
  }

  // Build lookup for fast access
  const lookup: Record<string, { count: number; intensity: number }> = {};
  cells.forEach((c) => {
    lookup[`${c.dayOfWeek}_${c.hour}`] = { count: c.count, intensity: c.intensity };
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Hour headers */}
        <div className="flex gap-1 mb-1.5 ml-10">
          {HOURS.map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-gray-600 font-medium">
              {h}h
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAY_LABELS.map((day, d) => (
          <div key={day} className="flex gap-1 mb-1">
            {/* Day label */}
            <div className="w-8 shrink-0 flex items-center">
              <span className="text-[11px] text-gray-500 font-medium">{day}</span>
            </div>

            {/* Hour cells */}
            {HOURS.map((h) => {
              const cell = lookup[`${d}_${h}`];
              const intensity = cell?.intensity ?? 0;
              const count = cell?.count ?? 0;

              // Color from transparent to accent
              const r = intensity > 0 ? Math.round(37 + intensity * (37 - 37)) : 37;
              const g = intensity > 0 ? Math.round(211 * intensity) : 30;
              const b = intensity > 0 ? Math.round(102 * intensity) : 46;

              return (
                <div
                  key={h}
                  className="flex-1 h-7 rounded transition-all duration-300"
                  style={{
                    backgroundColor:
                      intensity === 0
                        ? '#1f2937'
                        : `rgba(37, 211, 102, ${0.1 + intensity * 0.9})`,
                  }}
                  title={count > 0 ? `${day} ${h}h: ${count} RDV` : `${day} ${h}h: aucun RDV`}
                />
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-gray-600">Moins</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="w-5 h-4 rounded"
              style={{ backgroundColor: `rgba(37, 211, 102, ${v})` }}
            />
          ))}
          <span className="text-xs text-gray-600">Plus</span>
        </div>
      </div>
    </div>
  );
}

// ─── Conversion funnel ────────────────────────────────────────────────────────

function ConversionFunnel({
  data,
  loading,
}: {
  data: {
    pageViews: number;
    serviceSelected: number;
    dateSelected: number;
    bookingConfirmed: number;
    stepRates: number[];
  } | undefined;
  loading: boolean;
}) {
  const steps = [
    {
      label: 'Vues de la page',
      event: 'page_view',
      count: data?.pageViews ?? 0,
      icon: Eye,
      color: '#06b6d4',
    },
    {
      label: 'Service selectionne',
      event: 'service_selected',
      count: data?.serviceSelected ?? 0,
      icon: ShoppingBag,
      color: '#8b5cf6',
    },
    {
      label: 'Creneau choisi',
      event: 'date_selected',
      count: data?.dateSelected ?? 0,
      icon: Clock,
      color: '#f59e0b',
    },
    {
      label: 'Reservation confirmee',
      event: 'booking_confirmed',
      count: data?.bookingConfirmed ?? 0,
      icon: CheckCircle,
      color: ACCENT,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  const maxCount = Math.max(...steps.map((s) => s.count), 1);
  const hasData = steps.some((s) => s.count > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnee de funnel disponible (table bookbot_page_views vide).
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const widthPct = maxCount > 0 ? Math.max(4, (step.count / maxCount) * 100) : 4;
        const StepIcon = step.icon;
        const dropPct = idx > 0 && (data?.stepRates?.[idx] ?? 0);

        return (
          <div key={step.event} className="relative">
            {/* Step bar */}
            <div
              className="flex items-center gap-4 rounded-xl px-4 py-3 mb-1 transition-all"
              style={{
                background: `${step.color}08`,
                border: `1px solid ${step.color}20`,
              }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${step.color}18` }}
              >
                <StepIcon className="w-4 h-4" style={{ color: step.color }} />
              </div>

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300 font-medium">{step.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {idx > 0 && dropPct !== false && (
                      <span className="text-xs text-gray-500 tabular-nums">
                        {dropPct}% du prec.
                      </span>
                    )}
                    <span
                      className="text-base font-bold tabular-nums"
                      style={{ color: step.color }}
                    >
                      {step.count.toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${widthPct}%`, backgroundColor: step.color }}
                  />
                </div>
              </div>
            </div>

            {/* Connector arrow */}
            {idx < steps.length - 1 && (
              <div className="flex items-center justify-center h-4">
                <div className="w-0.5 h-full bg-gray-700" />
              </div>
            )}
          </div>
        );
      })}

      {/* Overall conversion rate */}
      {data && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3">
          <span className="text-sm text-gray-400">Taux de conversion global</span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: ACCENT }}
          >
            {data.pageViews > 0
              ? `${Math.round((data.bookingConfirmed / data.pageViews) * 100 * 10) / 10}%`
              : '—'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Cohort heatmap table ────────────────────────────────────────────────────

function CohortHeatmap({
  rows,
  hasEnoughData,
  loading,
}: {
  rows: CohortRow[];
  hasEnoughData: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <p className="text-sm text-gray-500 italic">
        Pas encore assez de donnees pour l&apos;analyse par cohorte.
      </p>
    );
  }

  const columns = ['M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-500 font-medium py-2 pr-3 w-28">Cohorte</th>
            <th className="text-center text-xs text-gray-500 font-medium py-2 px-1 w-12">Clients</th>
            {columns.map((col) => (
              <th key={col} className="text-center text-xs text-gray-500 font-medium py-2 px-1">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cohortMonth}>
              <td className="text-xs text-gray-300 font-medium py-1.5 pr-3 whitespace-nowrap">
                {row.cohortLabel}
              </td>
              <td className="text-center text-xs text-gray-400 py-1.5 px-1 tabular-nums">
                {row.totalClients}
              </td>
              {row.retention.map((pct, idx) => {
                if (pct === null) {
                  return (
                    <td key={idx} className="text-center py-1.5 px-1">
                      <div className="h-8 rounded bg-gray-800/50 flex items-center justify-center">
                        <span className="text-[10px] text-gray-600">—</span>
                      </div>
                    </td>
                  );
                }
                // Intensity: 0% = gray, 100% = full green
                const intensity = pct / 100;
                return (
                  <td key={idx} className="text-center py-1.5 px-1">
                    <div
                      className="h-8 rounded flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: pct === 0
                          ? '#1f2937'
                          : `rgba(37, 211, 102, ${0.1 + intensity * 0.7})`,
                      }}
                      title={`${row.cohortLabel} → ${columns[idx]}: ${pct}% retention`}
                    >
                      <span
                        className="text-xs font-medium tabular-nums"
                        style={{ color: pct > 40 ? '#ffffff' : pct > 0 ? '#d1d5db' : '#6b7280' }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Revenue forecast bar chart ──────────────────────────────────────────────

function RevenueForecastChart({
  points,
  loading,
}: {
  points: ForecastPoint[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="h-48 flex items-end gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md skeleton"
            style={{ height: `${20 + ((i * 37 + 13) % 60)}%` }}
          />
        ))}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">Pas encore de donnees pour la prevision.</p>
    );
  }

  const max = Math.max(...points.map((p) => p.revenue), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1.5 h-48 min-w-[420px]">
        {points.map((p, idx) => {
          const heightPct = max > 0 ? Math.max(2, (p.revenue / max) * 100) : 2;
          const revenueFormatted = p.revenue.toLocaleString('fr-FR');
          return (
            <div key={`${p.label}-${idx}`} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[10px] text-gray-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {revenueFormatted}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500 cursor-default"
                  style={{
                    height: `${heightPct}%`,
                    background: p.projected
                      ? `repeating-linear-gradient(135deg, ${ACCENT}40, ${ACCENT}40 4px, transparent 4px, transparent 8px)`
                      : `linear-gradient(180deg, ${ACCENT}, #1aab52)`,
                    opacity: p.projected ? 0.6 : 1,
                    border: p.projected ? `1px dashed ${ACCENT}80` : 'none',
                  }}
                  title={`${p.label}: ${revenueFormatted} XPF${p.projected ? ' (prevision)' : ''}`}
                />
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                p.projected ? 'text-gray-600 italic' : 'text-gray-500',
              )}>
                {p.label}{p.projected ? '*' : ''}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: `linear-gradient(180deg, ${ACCENT}, #1aab52)` }}
          />
          <span>Reel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm opacity-60"
            style={{
              background: `repeating-linear-gradient(135deg, ${ACCENT}40, ${ACCENT}40 2px, transparent 2px, transparent 4px)`,
              border: `1px dashed ${ACCENT}80`,
            }}
          />
          <span>Prevision (regression lineaire)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Top clients LTV table ───────────────────────────────────────────────────

function TopClientsLtvTable({
  clients,
  loading,
}: {
  clients: ClientLtv[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">Aucun client avec un RDV complete.</p>
    );
  }

  function getRankBadgeColor(rank: number): string {
    if (rank <= 3) return '#FFD700'; // Gold
    return '#C0C0C0'; // Silver
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-xs text-gray-500 font-medium py-2 w-12">#</th>
            <th className="text-left text-xs text-gray-500 font-medium py-2">Nom</th>
            <th className="text-center text-xs text-gray-500 font-medium py-2 w-16">Visites</th>
            <th className="text-right text-xs text-gray-500 font-medium py-2 w-32">CA total</th>
            <th className="text-right text-xs text-gray-500 font-medium py-2 w-28">Derniere visite</th>
            <th className="text-right text-xs text-gray-500 font-medium py-2 w-20">Score</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const badgeColor = getRankBadgeColor(client.rank);
            const formattedDate = new Date(client.lastVisit).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            return (
              <tr key={client.clientName} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${badgeColor}18`,
                      border: `1px solid ${badgeColor}40`,
                      color: badgeColor,
                    }}
                  >
                    {client.rank}
                  </div>
                </td>
                <td className="py-2.5 text-gray-200 font-medium truncate max-w-[180px]">
                  {client.clientName}
                </td>
                <td className="py-2.5 text-center text-gray-400 tabular-nums">
                  {client.visitCount}
                </td>
                <td className="py-2.5 text-right font-medium tabular-nums" style={{ color: ACCENT }}>
                  {client.totalSpent.toLocaleString('fr-FR')} XPF
                </td>
                <td className="py-2.5 text-right text-xs text-gray-500">
                  {formattedDate}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums"
                    style={{
                      backgroundColor: `${ACCENT}15`,
                      color: ACCENT,
                    }}
                  >
                    {client.totalSpent.toLocaleString('fr-FR')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Analytics skeleton ───────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="h-48 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 skeleton rounded-t-md" style={{ height: '60%' }} />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { businessId, businessName } = useAppStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const { data: revenue, isLoading: revenueLoading } = useRevenueStats(businessId, period);
  const { data: services, isLoading: servicesLoading } = useServiceStats(businessId);
  const { data: sources, isLoading: sourcesLoading } = useSourceStats(businessId);
  const { data: conversion, isLoading: conversionLoading } = useConversionStats(businessId);
  const { data: peakHours, isLoading: peakLoading } = usePeakHours(businessId);
  const { data: cohort, isLoading: cohortLoading } = useCohortData(businessId);
  const { data: forecast, isLoading: forecastLoading } = useRevenueForecast(businessId);
  const { data: topClients, isLoading: ltvLoading } = useTopClientsLtv(businessId);

  const isInitialLoading = revenueLoading && servicesLoading && sourcesLoading;

  if (isInitialLoading) {
    return (
      <DashboardLayout title="Analytiques" businessName={businessName ?? undefined}>
        <AnalyticsSkeleton />
      </DashboardLayout>
    );
  }

  // Derived: cancel rate from services
  const totalBookings = services?.totalBookings ?? 0;
  const totalCancelled = services?.services.reduce(
    (sum, s) => sum + s.cancelledCount,
    0,
  ) ?? 0;
  const cancelRate = totalBookings > 0
    ? Math.round((totalCancelled / totalBookings) * 100 * 10) / 10
    : 0;

  return (
    <DashboardLayout title="Analytiques" businessName={businessName ?? undefined}>
      <div className="space-y-6">

        {/* ── Period header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Intelligence business — 6 derniers mois
          </p>
        </div>

        {/* ── Row 1: KPI cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={
              revenue
                ? `${revenue.totalRevenue.toLocaleString('fr-FR')} XPF`
                : '— XPF'
            }
            icon={Banknote}
            accent={ACCENT}
            sub={revenue ? `${revenue.completedCount} RDV completes` : undefined}
            loading={revenueLoading}
          />
          <KpiCard
            label="Panier moyen"
            value={
              revenue
                ? `${revenue.avgPerAppointment.toLocaleString('fr-FR')} XPF`
                : '— XPF'
            }
            icon={TrendingUp}
            accent="#3b82f6"
            sub="Par rendez-vous complete"
            loading={revenueLoading}
          />
          <KpiCard
            label="Taux de conversion"
            value={conversion ? `${conversion.conversionRate}%` : '—'}
            icon={Zap}
            accent="#8b5cf6"
            sub={
              conversion
                ? `${conversion.bookingConfirmed} RDV / ${conversion.pageViews} vues`
                : 'Vues → reservations'
            }
            loading={conversionLoading}
          />
          <KpiCard
            label="Taux d'annulation"
            value={`${cancelRate}%`}
            icon={XCircle}
            accent="#ef4444"
            sub={
              totalBookings > 0
                ? `${totalCancelled} annul. sur ${totalBookings} RDV`
                : 'Sur 6 derniers mois'
            }
            loading={servicesLoading}
          />
        </div>

        {/* ── Row 2: Revenue chart ──────────────────────────────────────────── */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
        <Section
          title="Chiffre d'affaires"
          icon={BarChart3}
          action={
            <PeriodSelector value={period} onChange={setPeriod} />
          }
        >
          <RevenueBarChart
            points={revenue?.points ?? []}
            loading={revenueLoading}
          />
          {revenue && !revenueLoading && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Total periode</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {revenue.totalRevenue.toLocaleString('fr-FR')} XPF
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Moy. par RDV</p>
                <p className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>
                  {revenue.avgPerAppointment.toLocaleString('fr-FR')} XPF
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">RDV completes</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {revenue.completedCount}
                </p>
              </div>
            </div>
          )}
        </Section>
        </Suspense>

        {/* ── Row 3: Services + Sources ─────────────────────────────────────── */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Services populaires */}
          <Section title="Services populaires (6 mois)" icon={ShoppingBag}>
            <ServicesChart
              services={services?.services ?? []}
              totalBookings={services?.totalBookings ?? 0}
              loading={servicesLoading}
            />
            {services && !servicesLoading && services.services.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">CA total services</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {services.totalRevenue.toLocaleString('fr-FR')} XPF
                </span>
              </div>
            )}
          </Section>

          {/* Sources de reservation */}
          <Section title="Sources de reservation (6 mois)" icon={PieChart}>
            <DonutChart
              sources={sources?.sources ?? []}
              total={sources?.total ?? 0}
              loading={sourcesLoading}
            />
          </Section>
        </div>
        </Suspense>

        {/* ── Row 4: Peak hours heatmap ─────────────────────────────────────── */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
        <Section title="Heures de pointe (90 derniers jours)" icon={Clock}>
          <PeakHoursHeatmap
            cells={peakHours?.cells ?? []}
            maxCount={peakHours?.maxCount ?? 0}
            loading={peakLoading}
          />
        </Section>
        </Suspense>

        {/* ── Row 5: Conversion funnel ──────────────────────────────────────── */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
        <Section title="Funnel de conversion (30 derniers jours)" icon={Eye}>
          <ConversionFunnel data={conversion} loading={conversionLoading} />
        </Section>
        </Suspense>

        {/* ── Row 6: Cohort analysis ─────────────────────────────────────── */}
        <Section title="Cohortes clients (retention mensuelle)" icon={Users}>
          <CohortHeatmap
            rows={cohort?.rows ?? []}
            hasEnoughData={cohort?.hasEnoughData ?? false}
            loading={cohortLoading}
          />
        </Section>

        {/* ── Row 7: Revenue forecast ────────────────────────────────────── */}
        <Section title="Prevision de revenus" icon={Target}>
          <RevenueForecastChart
            points={forecast?.points ?? []}
            loading={forecastLoading}
          />
          {forecast && !forecastLoading && forecast.points.length > 0 && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Total projete (3 mois)</p>
                <p className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>
                  {forecast.points
                    .filter((p) => p.projected)
                    .reduce((sum, p) => sum + p.revenue, 0)
                    .toLocaleString('fr-FR')}{' '}
                  XPF
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tendance mensuelle</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {(() => {
                    const real = forecast.points.filter((p) => !p.projected);
                    if (real.length < 2) return '—';
                    const diff = real[real.length - 1].revenue - real[real.length - 2].revenue;
                    const sign = diff >= 0 ? '+' : '';
                    return `${sign}${diff.toLocaleString('fr-FR')} XPF`;
                  })()}
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* ── Row 8: Top 10 clients LTV ──────────────────────────────────── */}
        <Section title="Top 10 clients (LTV)" icon={Trophy}>
          <TopClientsLtvTable
            clients={topClients?.clients ?? []}
            loading={ltvLoading}
          />
          {topClients && !ltvLoading && topClients.clients.length > 0 && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-500">CA cumule Top 10</p>
                <p className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>
                  {topClients.clients
                    .reduce((sum, c) => sum + c.totalSpent, 0)
                    .toLocaleString('fr-FR')}{' '}
                  XPF
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Moy. visites Top 10</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {topClients.clients.length > 0
                    ? Math.round(
                        topClients.clients.reduce((sum, c) => sum + c.visitCount, 0) /
                          topClients.clients.length,
                      )
                    : 0}
                </p>
              </div>
            </div>
          )}
        </Section>

      </div>
    </DashboardLayout>
  );
}
