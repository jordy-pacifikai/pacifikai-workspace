'use client';

import { useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Users,
  TrendingUp,
  UserPlus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useDashboardStats } from '@/hooks/useStats';
import { useAppointments } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/database';

// ─── Constants ─────────────────────────────────────────────────────────────────

const GREEN = '#25D366';

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending:   { label: 'En attente', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  confirmed: { label: 'Confirmé',   className: 'bg-green-500/15  text-green-400  border-green-500/25'  },
  cancelled: { label: 'Annulé',     className: 'bg-red-500/15    text-red-400    border-red-500/25'    },
  completed: { label: 'Terminé',    className: 'bg-blue-500/15   text-blue-400   border-blue-500/25'   },
  no_show:   { label: 'No show',    className: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 flex flex-col gap-3">
      {/* Icon badge */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
      >
        <Icon size={18} style={{ color: GREEN }} />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-white leading-none tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-sm text-gray-400">{label}</p>
      </div>

      {/* Sub text */}
      {sub && (
        <p className="text-xs text-gray-600 leading-snug">{sub}</p>
      )}
    </div>
  );
}

// ─── Appointment row ───────────────────────────────────────────────────────────

function AppointmentRow({ appt, isToday }: { appt: Appointment; isToday: boolean }) {
  const displayName = appt.client_name ?? 'Client inconnu';

  const serviceName = appt.service ?? '—';

  const timeLabel = appt.time_slot?.slice(0, 5) ?? '—'; // "HH:MM"

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-800/60 last:border-0">
      {/* Time column */}
      <div className="w-12 shrink-0 text-center">
        <p className="text-sm font-semibold text-gray-200">{timeLabel}</p>
        {isToday && (
          <p className="text-[10px] text-gray-600 uppercase tracking-wide">auj.</p>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
        style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: GREEN }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">{displayName}</p>
        <p className="text-xs text-gray-500 truncate">{serviceName}</p>
      </div>

      {/* Status badge */}
      <StatusBadge status={appt.status} />
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyAppointments() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <CalendarCheck size={32} className="text-gray-700 mb-3" />
      <p className="text-sm font-medium text-gray-400">Aucun rendez-vous</p>
      <p className="text-xs text-gray-600 mt-1">
        Aujourd'hui et demain sont libres.
      </p>
    </div>
  );
}

// ─── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { businessId, businessName } = useAppStore();

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const tomorrow = useMemo(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'), []);

  const todayLabel = useMemo(
    () => format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }),
    [],
  );

  // ── Data queries ──────────────────────────────────────────────────────────

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats(businessId);

  const {
    data: todayAppts,
    isLoading: todayLoading,
  } = useAppointments(businessId, today);

  const {
    data: tomorrowAppts,
    isLoading: tomorrowLoading,
  } = useAppointments(businessId, tomorrow);

  // ── Derived data ──────────────────────────────────────────────────────────

  const upcomingLoading = todayLoading || tomorrowLoading;

  // Sort today ascending by time_slot, then tomorrow ascending
  const upcomingAppointments = useMemo(() => {
    const sorted = (arr: Appointment[] | undefined) =>
      [...(arr ?? [])].sort((a, b) =>
        (a.time_slot ?? '').localeCompare(b.time_slot ?? ''),
      );
    return {
      today: sorted(todayAppts),
      tomorrow: sorted(tomorrowAppts),
    };
  }, [todayAppts, tomorrowAppts]);

  const hasUpcoming =
    upcomingAppointments.today.length > 0 ||
    upcomingAppointments.tomorrow.length > 0;

  // ── Revenue formatter ─────────────────────────────────────────────────────

  const formatRevenue = (xpf: number) =>
    new Intl.NumberFormat('fr-PF', {
      style: 'currency',
      currency: 'XPF',
      maximumFractionDigits: 0,
    }).format(xpf);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      title="Tableau de bord"
      businessName={businessName}
      notificationCount={stats?.pendingCount}
    >
      {/* ── Date header ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white capitalize">{todayLabel}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* ── Stat cards grid ──────────────────────────────────────────── */}
      {statsError ? (
        <ErrorState message="Impossible de charger les statistiques." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                icon={CalendarCheck}
                label="RDV aujourd'hui"
                value={stats?.todayCount ?? 0}
                sub={`${stats?.weekCount ?? 0} cette semaine`}
              />
              <StatCard
                icon={CalendarDays}
                label="RDV ce mois"
                value={stats?.monthCount ?? 0}
                sub={`Taux de completion : ${(stats?.completionRate ?? 0).toFixed(0)} %`}
              />
              <StatCard
                icon={Clock}
                label="En attente"
                value={stats?.pendingCount ?? 0}
                sub="Nécessitent une confirmation"
              />
              <StatCard
                icon={Users}
                label="Clients total"
                value={stats?.totalClients ?? 0}
                sub={`No-show : ${(stats?.noShowRate ?? 0).toFixed(0)} % ce mois`}
              />
            </>
          )}
        </div>
      )}

      {/* ── Main content: upcoming + quick actions ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Upcoming appointments (2/3 width) ──────────────────────── */}
        <div className="lg:col-span-2 rounded-xl bg-gray-900 border border-gray-800">

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} style={{ color: GREEN }} />
              <h2 className="text-sm font-semibold text-gray-100">
                Prochains rendez-vous
              </h2>
            </div>
            <a
              href="/appointments"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Voir tout
              <ChevronRight size={13} />
            </a>
          </div>

          {/* Panel body */}
          <div className="px-5 pb-2">
            {upcomingLoading ? (
              <div className="divide-y divide-gray-800/60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} className="py-3" />
                ))}
              </div>
            ) : !hasUpcoming ? (
              <EmptyAppointments />
            ) : (
              <>
                {/* Today's group */}
                {upcomingAppointments.today.length > 0 && (
                  <div>
                    <p className="pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-600">
                      Aujourd'hui
                    </p>
                    {upcomingAppointments.today.map((appt) => (
                      <AppointmentRow key={appt.id} appt={appt} isToday={true} />
                    ))}
                  </div>
                )}

                {/* Tomorrow's group */}
                {upcomingAppointments.tomorrow.length > 0 && (
                  <div>
                    <p className="pt-5 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-600">
                      Demain
                    </p>
                    {upcomingAppointments.tomorrow.map((appt) => (
                      <AppointmentRow key={appt.id} appt={appt} isToday={false} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right column: quick actions + revenue ──────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Quick actions */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-100 mb-4">
              Actions rapides
            </h2>

            <div className="flex flex-col gap-2">
              <QuickActionButton
                href="/appointments/new"
                icon={CalendarCheck}
                label="Nouveau rendez-vous"
                primary
              />
              <QuickActionButton
                href="/clients/new"
                icon={UserPlus}
                label="Nouveau client"
              />
              <QuickActionButton
                href="/stats"
                icon={TrendingUp}
                label="Voir les statistiques"
              />
            </div>
          </div>

          {/* Monthly revenue card */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} style={{ color: GREEN }} />
              <h2 className="text-sm font-semibold text-gray-100">
                Revenu ce mois
              </h2>
            </div>

            {statsLoading ? (
              <div className="mt-3 space-y-2">
                <div className="skeleton h-8 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ) : (
              <>
                <p className="mt-3 text-2xl font-bold text-white leading-none">
                  {formatRevenue(stats?.monthRevenue ?? 0)}
                </p>
                <p className="mt-1.5 text-xs text-gray-500">
                  Basé sur {stats?.monthCount ?? 0} RDV ce mois
                </p>

                {/* Completion rate bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Taux de complétion</span>
                    <span>{(stats?.completionRate ?? 0).toFixed(0)} %</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.completionRate ?? 0}%`,
                        backgroundColor: GREEN,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Quick action button ───────────────────────────────────────────────────────

interface QuickActionButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
  primary?: boolean;
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  primary = false,
}: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        primary
          ? 'text-gray-950 hover:opacity-90 active:opacity-80'
          : 'bg-gray-800 text-gray-200 hover:bg-gray-700/80 hover:text-white',
      )}
      style={primary ? { backgroundColor: GREEN } : undefined}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </a>
  );
}
