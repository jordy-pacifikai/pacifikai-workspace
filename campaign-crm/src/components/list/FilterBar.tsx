'use client';

import { X } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { STATUS_CONFIG, SECTOR_CONFIG, STATUS_COLUMN_ORDER } from '@/lib/constants';
import { useProspects } from '@/hooks/useProspects';
import type { CampaignStatus, CampaignSector } from '@/lib/types';

interface FilterBarProps {
  filteredCount: number;
}

export function FilterBar({ filteredCount }: FilterBarProps) {
  const {
    statusFilter,
    sectorFilter,
    batchFilter,
    icpMinFilter,
    setStatusFilter,
    setSectorFilter,
    setBatchFilter,
    setIcpMinFilter,
  } = usePipelineStore();

  const { data: prospects = [] } = useProspects();
  const batches = Array.from(new Set(prospects.map((p) => p.batch).filter((b): b is number => b !== null))).sort(
    (a, b) => a - b
  );

  const hasFilters =
    statusFilter !== null ||
    sectorFilter !== null ||
    batchFilter !== null ||
    icpMinFilter > 0;

  function reset() {
    setStatusFilter(null);
    setSectorFilter(null);
    setBatchFilter(null);
    setIcpMinFilter(0);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#222233] bg-[#0a0a12] px-4 py-3">
      {/* Status filter */}
      <select
        value={statusFilter ?? ''}
        onChange={(e) => setStatusFilter((e.target.value as CampaignStatus) || null)}
        className="rounded-md border border-[#222233] bg-[#141420] px-3 py-1.5 text-xs text-[#e0e0e0] focus:border-[#0D9488] focus:outline-none"
      >
        <option value="">Tous les statuts</option>
        {STATUS_COLUMN_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>

      {/* Sector filter */}
      <select
        value={sectorFilter ?? ''}
        onChange={(e) => setSectorFilter((e.target.value as CampaignSector) || null)}
        className="rounded-md border border-[#222233] bg-[#141420] px-3 py-1.5 text-xs text-[#e0e0e0] focus:border-[#0D9488] focus:outline-none"
      >
        <option value="">Tous les secteurs</option>
        {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>
            {cfg.label}
          </option>
        ))}
      </select>

      {/* Batch filter */}
      <select
        value={batchFilter ?? ''}
        onChange={(e) => setBatchFilter(e.target.value ? Number(e.target.value) : null)}
        className="rounded-md border border-[#222233] bg-[#141420] px-3 py-1.5 text-xs text-[#e0e0e0] focus:border-[#0D9488] focus:outline-none"
      >
        <option value="">Tous les batches</option>
        {batches.map((b) => (
          <option key={b} value={b}>
            Batch #{b}
          </option>
        ))}
      </select>

      {/* ICP min slider */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#888] whitespace-nowrap">ICP min: {icpMinFilter}</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={icpMinFilter}
          onChange={(e) => setIcpMinFilter(Number(e.target.value))}
          className="w-24 accent-[#0D9488]"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Result count */}
      <span className="text-xs text-[#888]">
        <span className="font-semibold text-[#e0e0e0]">{filteredCount}</span> résultat{filteredCount !== 1 ? 's' : ''}
      </span>

      {/* Reset button */}
      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-[#222233] px-3 py-1.5 text-xs text-[#888] transition-colors hover:border-red-800 hover:text-red-400"
        >
          <X size={11} />
          Réinitialiser
        </button>
      )}
    </div>
  );
}
