'use client';

import { CheckCircle2, TrendingUp, Wallet, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { ClientStats } from '@/hooks/useClientStats';

// ─── Individual stat card ─────────────────────────────────────────────────────

interface CardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'teal' | 'green' | 'amber' | 'blue';
}

function Card({ icon: Icon, label, value, sub, accent = 'teal' }: CardProps) {
  const accentMap = {
    teal: {
      bg: 'bg-[#0d9488]/10',
      border: 'border-[#0d9488]/20',
      icon: 'text-[#0d9488]',
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
    },
  };

  const colors = accentMap[accent];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${colors.icon}`} />
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold leading-tight">
          {label}
        </p>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ClientStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ClientStatsCardsProps {
  stats: ClientStats;
  /** Fallback total_spent from client record (Supabase computed column) */
  clientTotalSpent?: number | null;
}

export function ClientStatsCards({ stats, clientTotalSpent }: ClientStatsCardsProps) {
  // Prefer computed stats from appointments; fall back to client record column
  const totalSpent = stats.totalSpent > 0 ? stats.totalSpent : (clientTotalSpent ?? 0);
  const avgSpent = stats.averageSpent;

  const lastVisitLabel = stats.lastVisit
    ? formatDistanceToNow(new Date(stats.lastVisit), { addSuffix: true, locale: fr })
    : '—';

  const completionRate =
    stats.totalAppointments > 0
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={CheckCircle2}
        label="Visites complétées"
        value={stats.completedAppointments}
        sub={
          stats.totalAppointments > 0
            ? `${completionRate}% des ${stats.totalAppointments} RDV`
            : undefined
        }
        accent="green"
      />
      <Card
        icon={TrendingUp}
        label="Dépenses totales"
        value={totalSpent > 0 ? `${totalSpent.toLocaleString('fr-FR')} XPF` : '—'}
        sub={stats.completedAppointments > 0 ? `${stats.completedAppointments} visites payées` : undefined}
        accent="teal"
      />
      <Card
        icon={Wallet}
        label="Panier moyen"
        value={avgSpent > 0 ? `${avgSpent.toLocaleString('fr-FR')} XPF` : '—'}
        sub={avgSpent > 0 ? 'par visite complétée' : undefined}
        accent="blue"
      />
      <Card
        icon={Clock}
        label="Dernière visite"
        value={lastVisitLabel}
        sub={stats.noShows > 0 ? `${stats.noShows} no-show(s)` : undefined}
        accent="amber"
      />
    </div>
  );
}
