'use client';

import { useMemo } from 'react';
import {
  Calendar,
  Banknote,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useDashboardStats } from '@/hooks/useStats';
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
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
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
  manual: { label: 'Manuel', color: '#3b82f6' },
  web: { label: 'Site web', color: '#8b5cf6' },
  app: { label: 'Application', color: '#f59e0b' },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <Icon className="w-4 h-4 text-[#25D366]" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
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
  const { data: appointments, isLoading: apptLoading } = useAppointments(
    businessId,
    undefined,
    { dateFrom: format(monthStart, 'yyyy-MM-dd'), dateTo: format(monthEnd, 'yyyy-MM-dd') },
  );

  const isLoading = statsLoading || apptLoading;

  // Derive status breakdown
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
      .filter((item) => item.count > 0 || ['confirmed', 'completed', 'pending'].includes(item.key));
  }, [appointments]);

  // Derive source breakdown
  const sourceBreakdown = useMemo(() => {
    if (!appointments) return [];
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const s = a.source ?? 'manual';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(SOURCE_CONFIG)
      .map(([key, cfg]) => ({
        key,
        label: cfg.label,
        color: cfg.color,
        count: counts[key] ?? 0,
        max,
      }))
      .filter((item) => item.count > 0);
  }, [appointments]);

  // Derive top services
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

  if (isLoading) return (
    <DashboardLayout title="Statistiques" businessName={businessName ?? undefined}>
      <StatsSkeleton />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Statistiques" businessName={businessName ?? undefined}>
      <div className="space-y-6">

        {/* Period label */}
        <p className="text-sm text-gray-400">
          Periode: <span className="text-white font-medium capitalize">{format(now, 'MMMM yyyy')}</span>
        </p>

        {/* ─ KPI cards ──────────────────────────────────────────────────────── */}
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
            value={stats?.completionRate != null ? `${stats.completionRate}%` : '—'}
            icon={CheckCircle}
            accent="#25D366"
            sub={`${stats?.totalClients ?? 0} clients total`}
          />
          <StatCard
            label="Taux no-show"
            value={stats?.noShowRate != null ? `${stats.noShowRate}%` : '—'}
            icon={AlertTriangle}
            accent="#f59e0b"
            sub={`${stats?.pendingCount ?? 0} en attente`}
          />
        </div>

        {/* ─ Status + Source breakdown ──────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status breakdown */}
          <Section title="Par statut" icon={CheckCircle}>
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

          {/* Source breakdown */}
          <Section title="Par source" icon={TrendingUp}>
            {sourceBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune donnee pour cette periode.</p>
            ) : (
              <div className="space-y-4">
                {sourceBreakdown.map((item) => (
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

        {/* ─ Top services ───────────────────────────────────────────────────── */}
        <Section title="Top 5 services" icon={Users}>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Aucun service enregistre pour cette periode.</p>
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
                  <span className="text-sm text-gray-300 w-40 truncate shrink-0">{svc.name}</span>
                  <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((svc.count / maxServiceCount) * 100)}%`,
                        background: `linear-gradient(90deg, #25D366, #1aab52)`,
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

        {/* ─ Summary footer ─────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "RDV aujourd'hui", value: stats?.todayCount ?? 0, accent: '#3b82f6' },
            { label: 'RDV cette semaine', value: stats?.weekCount ?? 0, accent: '#8b5cf6' },
            { label: 'Clients fideles', value: stats?.totalClients ?? 0, accent: '#25D366' },
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
