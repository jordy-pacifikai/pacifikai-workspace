'use client';

import { useState, useMemo, Suspense } from 'react';
import { format, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  BarChart3,
  FileBarChart,
  Printer,
  ChevronDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ticket,
  Percent,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useMonthlyReport } from '@/hooks/useReports';
import { PrintableReport } from '@/components/reports/PrintableReport';
import { cn } from '@/lib/utils';

// ─── Source labels / colors ───────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  chatbot:   { label: 'Chatbot',         color: '#25D366' },
  whatsapp:  { label: 'WhatsApp',        color: '#22c55e' },
  messenger: { label: 'Messenger',       color: '#8b5cf6' },
  manual:    { label: 'Manuel',          color: '#3b82f6' },
  manuel:    { label: 'Manuel',          color: '#3b82f6' },
  web:       { label: 'Site web',        color: '#06b6d4' },
  app:       { label: 'Application',     color: '#f59e0b' },
  gcal:      { label: 'Google Calendar', color: '#ec4899' },
  guest:     { label: 'Invité',          color: '#6b7280' },
};

// ─── Month picker options (current + 11 previous) ────────────────────────────

function buildMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = subMonths(now, i);
    const value = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy', { locale: fr });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
}

function KpiCard({ label, value, icon: Icon, accent = '#25D366', sub }: KpiCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 print:hidden">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
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
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-gray-900 border border-gray-800 rounded-xl overflow-hidden print:hidden', className)}>
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-800">
        <Icon className="w-4 h-4 shrink-0" style={{ color: '#25D366' }} />
        <h2 className="text-white font-semibold text-sm truncate">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

// ─── Horizontal source bar ────────────────────────────────────────────────────

function SourceBar({ label, count, color, max }: { label: string; count: number; color: string; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-32 shrink-0 truncate">{label}</span>
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

// ─── Growth indicator ─────────────────────────────────────────────────────────

function GrowthBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium">
        <Minus size={14} />
        Stable
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-semibold"
      style={{ color: positive ? '#25D366' : '#ef4444' }}
    >
      {positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
      {positive ? '+' : ''}{value}%
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { businessId, businessName } = useAppStore();

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0].value);

  const { data: report, isLoading, isError } = useMonthlyReport(businessId, selectedMonth);

  const monthLabelDisplay =
    monthOptions.find((o) => o.value === selectedMonth)?.label ?? selectedMonth;

  // Computed metrics
  const completionRate = report && report.totalAppointments > 0
    ? Math.round((report.completedAppointments / report.totalAppointments) * 100)
    : 0;

  const totalSources = report
    ? Object.values(report.bookingSources).reduce((s, v) => s + v, 0)
    : 0;

  const sortedSources = report
    ? Object.entries(report.bookingSources).sort((a, b) => b[1] - a[1])
    : [];

  const maxSourceCount = sortedSources.length > 0 ? sortedSources[0][1] : 1;

  const totalServicesCount = report?.topServices.reduce((s, svc) => s + svc.count, 0) ?? 0;

  return (
    <DashboardLayout title="Rapports mensuels" businessName={businessName ?? undefined}>
      {/* ── Print trigger — hidden on screen ──────────────────────────────── */}
      {report && <PrintableReport report={report} />}

      <div className="space-y-6 print:hidden">

        {/* ── Header with month picker + download button ─────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Rapports mensuels</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Synthèse de l&apos;activité pour {monthLabelDisplay}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Month picker */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-4 pr-9 py-2.5 focus:outline-none focus:border-gray-500 cursor-pointer transition-colors hover:border-gray-600"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Download PDF */}
            <button
              onClick={() => window.print()}
              disabled={!report}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                report
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed',
              )}
            >
              <Printer size={15} />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {isLoading && <ReportSkeleton />}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {isError && (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-6 py-8 text-center">
            <p className="text-sm text-red-400 font-medium">
              Impossible de charger le rapport. Réessaie dans quelques instants.
            </p>
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        {report && !isLoading && (
          <>
            {/* Section: Vue d'ensemble — 6 KPI cards */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                Vue d&apos;ensemble
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                  label="Rendez-vous"
                  value={report.totalAppointments}
                  icon={CalendarCheck}
                  accent="#3b82f6"
                  sub={`${report.completedAppointments} terminés`}
                />
                <KpiCard
                  label="Taux de complétion"
                  value={`${completionRate}%`}
                  icon={Percent}
                  accent="#25D366"
                  sub={`${report.cancelledAppointments} annulations`}
                />
                <KpiCard
                  label="No-shows"
                  value={report.noShows}
                  icon={AlertTriangle}
                  accent="#f59e0b"
                  sub={report.totalAppointments > 0
                    ? `${Math.round((report.noShows / report.totalAppointments) * 100)}% du total`
                    : undefined
                  }
                />
                <KpiCard
                  label="Nouveaux clients"
                  value={report.newClients}
                  icon={UserPlus}
                  accent="#8b5cf6"
                  sub={`${report.returningClients} fidèles`}
                />
                <KpiCard
                  label="Clients actifs total"
                  value={report.totalActiveClients}
                  icon={Users}
                  accent="#06b6d4"
                />
                <KpiCard
                  label="Ticket moyen"
                  value="0 XPF"
                  icon={Ticket}
                  accent="#ec4899"
                  sub="Prix par service à configurer"
                />
              </div>
            </div>

            {/* Section: Détail par service */}
            <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
            <Section title="Détail par service" icon={BarChart3}>
              {report.topServices.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Aucun service enregistré pour cette période.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {['Service', 'Nb RDV', 'Chiffre d\'affaires', '% du total'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
                              h === 'Service' ? 'text-left' : 'text-right',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {report.topServices.map((svc, idx) => {
                        const pct = totalServicesCount > 0
                          ? Math.round((svc.count / totalServicesCount) * 100)
                          : 0;
                        return (
                          <tr key={svc.name} className="group">
                            <td className="py-3 text-gray-200 font-medium">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                                    idx === 0 && 'bg-amber-500/20 text-amber-400',
                                    idx === 1 && 'bg-gray-600/40 text-gray-300',
                                    idx === 2 && 'bg-orange-800/30 text-orange-400',
                                    idx > 2 && 'bg-gray-800 text-gray-500',
                                  )}
                                >
                                  {idx + 1}
                                </span>
                                {svc.name}
                              </div>
                            </td>
                            <td className="py-3 text-right tabular-nums text-gray-300">
                              {svc.count}
                            </td>
                            <td className="py-3 text-right tabular-nums text-gray-400">
                              {svc.revenue > 0
                                ? `${svc.revenue.toLocaleString('fr-FR')} XPF`
                                : '—'}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${pct}%`,
                                      background: 'linear-gradient(90deg, #25D366, #1aab52)',
                                    }}
                                  />
                                </div>
                                <span className="text-gray-400 tabular-nums w-10">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
            </Suspense>

            {/* Section: Sources + Comparaison côte à côte */}
            <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-64" />}>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Sources de réservation */}
              <Section title="Sources de réservation" icon={BarChart3}>
                {sortedSources.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Aucune donnée pour cette période.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sortedSources.map(([src, count]) => {
                      const cfg = SOURCE_CONFIG[src];
                      return (
                        <SourceBar
                          key={src}
                          label={cfg?.label ?? src}
                          count={count}
                          color={cfg?.color ?? '#6b7280'}
                          max={maxSourceCount}
                        />
                      );
                    })}
                    {totalSources > 0 && (
                      <p className="text-xs text-gray-600 pt-2 border-t border-gray-800">
                        Total : {totalSources} réservation{totalSources > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </Section>

              {/* Comparaison vs mois précédent */}
              <Section title="Comparaison mois précédent" icon={TrendingUp}>
                <div className="space-y-5">
                  {/* Growth badge */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Évolution RDV terminés</p>
                      <GrowthBadge value={report.revenueGrowth} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Mois précédent</p>
                      <p className="text-lg font-bold text-gray-300 tabular-nums">
                        {report.previousMonthRevenue}
                      </p>
                    </div>
                  </div>

                  {/* Status breakdown mini */}
                  <div className="space-y-3">
                    {[
                      { label: 'Terminés', value: report.completedAppointments, icon: CheckCircle, color: '#25D366' },
                      { label: 'Annulés', value: report.cancelledAppointments, icon: XCircle, color: '#ef4444' },
                      { label: 'No-shows', value: report.noShows, icon: AlertTriangle, color: '#f59e0b' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={14} style={{ color }} />
                          <span className="text-sm text-gray-400">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-200 tabular-nums">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Clients recap */}
                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Nouveaux clients ce mois</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#8b5cf6' }}>
                      +{report.newClients}
                    </span>
                  </div>
                </div>
              </Section>
            </div>
            </Suspense>

            {/* Empty state — no appointments at all */}
            {report.totalAppointments === 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-10 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.15)' }}
                >
                  <FileBarChart size={26} style={{ color: '#25D366' }} />
                </div>
                <p className="text-sm font-semibold text-gray-200 mb-1">
                  Aucun rendez-vous pour {monthLabelDisplay}
                </p>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Les données de rapport apparaîtront dès que des rendez-vous auront été enregistrés ce mois-ci.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
