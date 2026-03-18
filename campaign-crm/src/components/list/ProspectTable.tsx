'use client';

import { useState, useMemo } from 'react';
import { Eye, Mail, ChevronUp, ChevronDown, ChevronsUpDown, Globe, ExternalLink } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects } from '@/hooks/useProspects';
import { STATUS_CONFIG, SECTOR_CONFIG } from '@/lib/constants';
import type { Prospect } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortKey = keyof Pick<Prospect, 'name' | 'sector' | 'city' | 'icp_score' | 'status' | 'batch'>;
type SortDir = 'asc' | 'desc';

interface ProspectTableProps {
  onFilteredCount: (n: number) => void;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-[#555]" />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-[#0D9488]" />
    : <ChevronDown size={12} className="text-[#0D9488]" />;
}

export function ProspectTable({ onFilteredCount }: ProspectTableProps) {
  const { searchQuery, statusFilter, sectorFilter, batchFilter, icpMinFilter, selectProspect } = usePipelineStore();
  const { data: prospects = [], isLoading } = useProspects();

  const [sortKey, setSortKey] = useState<SortKey>('icp_score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = useMemo(() => {
    let list = prospects.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !(p.city ?? '').toLowerCase().includes(q) &&
          !(p.email ?? '').toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      if (sectorFilter && p.sector !== sectorFilter) return false;
      if (batchFilter !== null && p.batch !== batchFilter) return false;
      if (p.icp_score < icpMinFilter) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [prospects, searchQuery, statusFilter, sectorFilter, batchFilter, icpMinFilter, sortKey, sortDir]);

  // Report count upward
  useMemo(() => {
    onFilteredCount(filtered.length);
  }, [filtered.length, onFilteredCount]);

  const COLS: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: 'name',      label: 'Nom',      sortable: true },
    { key: 'sector',    label: 'Secteur',  sortable: true },
    { key: 'city',      label: 'Ville',    sortable: true },
    { key: 'icp_score', label: 'ICP',      sortable: true },
    { key: 'status',    label: 'Statut',   sortable: true },
    { key: 'batch',     label: 'Batch',    sortable: true },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-sm text-[#888]">Chargement...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-sm text-[#888]">Aucun prospect ne correspond aux filtres</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222233]">
            {COLS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && toggleSort(col.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]',
                  col.sortable && 'cursor-pointer select-none hover:text-[#e0e0e0]'
                )}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  )}
                </span>
              </th>
            ))}
            {/* Email col (not sortable) */}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888] max-w-[150px]">
              Facebook
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888] max-w-[150px]">
              Site
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">
              Prototypes
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a2e]">
          {filtered.map((prospect) => {
            const statusCfg = STATUS_CONFIG[prospect.status];
            const sectorCfg = SECTOR_CONFIG[prospect.sector];
            const icpColor =
              prospect.icp_score >= 60
                ? 'bg-green-500'
                : prospect.icp_score >= 30
                ? 'bg-amber-500'
                : 'bg-red-500';

            return (
              <tr
                key={prospect.id}
                onClick={() => selectProspect(prospect.id)}
                className="cursor-pointer transition-colors hover:bg-[#141420]"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <span className="font-medium text-[#e0e0e0]">{prospect.name}</span>
                </td>

                {/* Sector */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      sectorCfg.bgColor,
                      sectorCfg.color
                    )}
                  >
                    {sectorCfg.label}
                  </span>
                </td>

                {/* City */}
                <td className="px-4 py-3 text-[#888]">{prospect.city || '—'}</td>

                {/* ICP */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#222233]">
                      <div
                        className={cn('h-full rounded-full', icpColor)}
                        style={{ width: `${prospect.icp_score}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        prospect.icp_score >= 60 ? 'text-green-400' :
                        prospect.icp_score >= 30 ? 'text-amber-400' : 'text-red-400'
                      )}
                    >
                      {prospect.icp_score}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                      statusCfg.bgColor,
                      statusCfg.textColor
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dotColor)} />
                    {statusCfg.label}
                  </span>
                </td>

                {/* Batch */}
                <td className="px-4 py-3 text-[#888] text-xs">
                  {prospect.batch !== null ? `#${prospect.batch}` : '—'}
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-xs text-[#888] max-w-[160px]">
                  <span className="truncate block">{prospect.email ?? '—'}</span>
                </td>

                {/* Facebook */}
                <td className="px-4 py-3 max-w-[150px]" onClick={(e) => e.stopPropagation()}>
                  {prospect.facebook_url ? (
                    <a
                      href={prospect.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#0D9488] hover:text-[#0fbfb0] transition-colors truncate"
                      title={prospect.facebook_page_name ?? prospect.facebook_url}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <span className="truncate">{prospect.facebook_page_name ?? 'Facebook'}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#444]">—</span>
                  )}
                </td>

                {/* Site */}
                <td className="px-4 py-3 max-w-[150px]" onClick={(e) => e.stopPropagation()}>
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#666] hover:text-[#aaa] transition-colors truncate"
                      title={prospect.website}
                    >
                      <Globe size={11} className="shrink-0" />
                      <span className="truncate">{prospect.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#444]">—</span>
                  )}
                </td>

                {/* Prototypes */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {prospect.prototype_urls && prospect.prototype_urls.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {prospect.prototype_urls.slice(0, 3).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 rounded-full bg-[#0D9488]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#0D9488] hover:bg-[#0D9488]/30 transition-colors"
                          title={url}
                        >
                          <ExternalLink size={8} />
                          v{i + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#444]">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => selectProspect(prospect.id)}
                      className="rounded-md p-1.5 text-[#888] transition-colors hover:bg-[#1a1a2e] hover:text-[#0D9488]"
                      title="Voir le détail"
                    >
                      <Eye size={13} />
                    </button>
                    {prospect.email && (
                      <a
                        href={`mailto:${prospect.email}`}
                        className="rounded-md p-1.5 text-[#888] transition-colors hover:bg-[#1a1a2e] hover:text-[#0D9488]"
                        title="Envoyer un email"
                      >
                        <Mail size={13} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
