'use client';

import { KPICards } from '@/components/stats/KPICards';
import { FunnelChart } from '@/components/stats/FunnelChart';
import { useStats } from '@/hooks/useStats';
import { SECTOR_CONFIG } from '@/lib/constants';
import type { CampaignSector } from '@/lib/types';
import { cn } from '@/lib/utils';

function BatchChart() {
  const { data: stats } = useStats();
  const byBatch = stats?.byBatch ?? [];
  const max = Math.max(...byBatch.map((b) => b.count), 1);

  if (byBatch.length === 0) {
    return (
      <div className="rounded-xl border border-[#222233] bg-[#141420] p-6">
        <h3 className="mb-4 text-sm font-semibold text-[#e0e0e0]">Répartition par batch</h3>
        <p className="text-sm text-[#888]">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#222233] bg-[#141420] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#e0e0e0]">Répartition par batch</h3>
      <div className="flex flex-col gap-2">
        {byBatch.map((item) => (
          <div key={item.batch} className="flex items-center gap-3">
            <span className="w-16 text-right text-xs text-[#888]">Batch #{item.batch}</span>
            <div className="relative flex-1 h-5 overflow-hidden rounded bg-[#0a0a12]">
              <div
                className="absolute left-0 top-0 h-full rounded bg-[#0D9488]/60 transition-all duration-500"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-semibold text-[#0D9488]">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectorChart() {
  const { data: stats } = useStats();
  const bySector = stats?.bySector ?? [];
  const total = bySector.reduce((s, b) => s + b.count, 0);

  if (bySector.length === 0) {
    return (
      <div className="rounded-xl border border-[#222233] bg-[#141420] p-6">
        <h3 className="mb-4 text-sm font-semibold text-[#e0e0e0]">Répartition par secteur</h3>
        <p className="text-sm text-[#888]">Aucune donnée disponible</p>
      </div>
    );
  }

  const sorted = [...bySector].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-[#222233] bg-[#141420] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#e0e0e0]">Répartition par secteur</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((item) => {
          const cfg = SECTOR_CONFIG[item.sector as CampaignSector];
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.sector} className="flex items-center gap-3">
              <span className={cn('w-24 truncate text-right text-xs', cfg?.color ?? 'text-[#888]')}>
                {cfg?.label ?? item.sector}
              </span>
              <div className="relative flex-1 h-5 overflow-hidden rounded bg-[#0a0a12]">
                <div
                  className="absolute left-0 top-0 h-full rounded transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: `${cfg?.color?.replace('text-', '') ?? '#888'}40`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-xs text-[#888]">
                {item.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI Cards */}
      <KPICards />

      {/* Funnel + Batch + Sector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FunnelChart />
        <div className="flex flex-col gap-6">
          <BatchChart />
          <SectorChart />
        </div>
      </div>
    </div>
  );
}
