'use client';

import { useMemo } from 'react';
import { Heart, Users, Banknote, UserMinus } from 'lucide-react';
export interface RetentionStats {
  retentionRate: number;
  returningRate: number;
  avgVisitsPerClient: number;
  avgRevenuePerClient: number;
  churnRate: number;
  churnedClients: number;
  newClientsThisMonth: number;
  returningClientsThisMonth: number;
  retentionByMonth: Array<{ month: string; label: string; newClients: number; returning: number }>;
}

// ─── Stat card (inline) ──────────────────────────────────────────────────────

type MiniCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
};

function MiniCard({ label, value, icon: Icon, accent }: MiniCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-lg font-bold text-white tabular-nums break-words">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Stacked bar chart (CSS-only) ────────────────────────────────────────────

function RetentionBarChart({
  data,
}: {
  data: RetentionStats['retentionByMonth'];
}) {
  const max = useMemo(
    () => Math.max(...data.map((m) => m.newClients + m.returning), 1),
    [data],
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-3 min-w-[320px]" style={{ height: '160px' }}>
        {data.map((m) => {
          const total = m.newClients + m.returning;
          const newPct = max > 0 ? Math.max(total > 0 ? (m.newClients / max) * 100 : 0, 0) : 0;
          const retPct = max > 0 ? Math.max(total > 0 ? (m.returning / max) * 100 : 0, 0) : 0;
          // Ensure at least a tiny bar if there's data
          const newH = m.newClients > 0 ? Math.max(newPct, 3) : 0;
          const retH = m.returning > 0 ? Math.max(retPct, 3) : 0;

          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              {/* Total count on top */}
              <span className="text-xs text-gray-400 tabular-nums">{total || ''}</span>

              {/* Stacked bars container */}
              <div className="w-full flex-1 flex items-end justify-center gap-1">
                {/* New clients bar */}
                <div
                  className="flex-1 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${newH}%`,
                    backgroundColor: '#3B82F6',
                    minHeight: m.newClients > 0 ? '3px' : '0',
                  }}
                  title={`Nouveaux: ${m.newClients}`}
                />
                {/* Returning clients bar */}
                <div
                  className="flex-1 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${retH}%`,
                    backgroundColor: '#25D366',
                    minHeight: m.returning > 0 ? '3px' : '0',
                  }}
                  title={`Fideles: ${m.returning}`}
                />
              </div>

              {/* Month label */}
              <span className="text-xs text-gray-500 font-medium">{m.label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3B82F6' }} />
          <span className="text-xs text-gray-400">Nouveaux</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#25D366' }} />
          <span className="text-xs text-gray-400">Fideles</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Props = {
  stats: RetentionStats;
};

export function RetentionChart({ stats }: Props) {
  return (
    <div className="space-y-4">
      {/* Overview cards (2x2 grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard
          label="Taux de retention"
          value={`${stats.returningRate}%`}
          icon={Heart}
          accent="#25D366"
        />
        <MiniCard
          label="Visites / client"
          value={stats.avgVisitsPerClient}
          icon={Users}
          accent="#3B82F6"
        />
        <MiniCard
          label="CA moyen / client"
          value={`${stats.avgRevenuePerClient.toLocaleString('fr-FR')} XPF`}
          icon={Banknote}
          accent="#25D366"
        />
        <MiniCard
          label="Clients perdus"
          value={stats.churnedClients}
          icon={UserMinus}
          accent="#EF4444"
        />
      </div>

      {/* Monthly bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-800">
          <Heart className="w-4 h-4 text-[#25D366] shrink-0" />
          <h2 className="text-white font-semibold text-sm truncate">
            Nouveaux vs Fideles (6 derniers mois)
          </h2>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span>
              Ce mois:{' '}
              <span className="text-blue-400 font-medium">{stats.newClientsThisMonth} nouv.</span>
              {' / '}
              <span className="text-green-400 font-medium">{stats.returningClientsThisMonth} fid.</span>
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {stats.retentionByMonth.length > 0 ? (
            <RetentionBarChart data={stats.retentionByMonth} />
          ) : (
            <p className="text-sm text-gray-500 italic">
              Pas encore de donnees sur 6 mois.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
