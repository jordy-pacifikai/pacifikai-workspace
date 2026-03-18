'use client';

import { LayoutGrid, List, BarChart3, ChevronRight, Users } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects } from '@/hooks/useProspects';
import { SECTOR_CONFIG } from '@/lib/constants';
import type { CampaignSector } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { id: 'kanban', label: 'Kanban', href: '/pipeline', Icon: LayoutGrid },
  { id: 'list',   label: 'Liste',  href: '/pipeline/list', Icon: List },
  { id: 'stats',  label: 'Stats',  href: '/pipeline/stats', Icon: BarChart3 },
] as const;

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { sectorFilter, batchFilter, setSectorFilter, setBatchFilter, setActiveView } = usePipelineStore();
  const { data: prospects = [] } = useProspects();

  // Unique batches from data
  const batches = Array.from(new Set(prospects.map((p) => p.batch).filter((b): b is number => b !== null))).sort(
    (a, b) => a - b
  );

  const sectors = Object.entries(SECTOR_CONFIG) as [CampaignSector, (typeof SECTOR_CONFIG)[CampaignSector]][];

  function navigate(href: string, view: 'kanban' | 'list' | 'stats') {
    setActiveView(view);
    router.push(href);
  }

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-[#222233] bg-[#0d0d18] transition-all duration-300',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-[#222233] px-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0D9488]">
          <span className="text-sm font-bold text-white">C</span>
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-[#e0e0e0]">
            Campaign <span className="text-[#0D9488]">CRM</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 pt-3">
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive =
            id === 'kanban'
              ? pathname === '/pipeline'
              : pathname === href;

          return (
            <button
              key={id}
              onClick={() => navigate(href, id as 'kanban' | 'list' | 'stats')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                isActive
                  ? 'bg-[#0D9488]/20 text-[#0D9488]'
                  : 'text-[#888] hover:bg-[#1a1a2e] hover:text-[#e0e0e0]'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Filters */}
      {!collapsed && (
        <div className="flex flex-col gap-3 border-t border-[#222233] p-3 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888]">Filtres</p>

          {/* Sector filter */}
          <div>
            <label className="mb-1 block text-xs text-[#888]">Secteur</label>
            <select
              value={sectorFilter ?? ''}
              onChange={(e) => setSectorFilter((e.target.value as CampaignSector) || null)}
              className="w-full rounded-md border border-[#222233] bg-[#141420] px-2 py-1.5 text-xs text-[#e0e0e0] focus:border-[#0D9488] focus:outline-none"
            >
              <option value="">Tous</option>
              {sectors.map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Batch filter */}
          <div>
            <label className="mb-1 block text-xs text-[#888]">Batch</label>
            <select
              value={batchFilter ?? ''}
              onChange={(e) => setBatchFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-[#222233] bg-[#141420] px-2 py-1.5 text-xs text-[#e0e0e0] focus:border-[#0D9488] focus:outline-none"
            >
              <option value="">Tous</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  Batch #{b}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Prospect count */}
      <div className="mt-auto border-t border-[#222233] p-3">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg bg-[#141420] px-2 py-2',
            collapsed && 'justify-center'
          )}
        >
          <Users size={14} className="flex-shrink-0 text-[#0D9488]" />
          {!collapsed && (
            <span className="text-xs text-[#888]">
              <span className="font-semibold text-[#e0e0e0]">{prospects.length}</span> prospects
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#222233] bg-[#141420] text-[#888] shadow-md transition-colors hover:text-[#e0e0e0]"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRight
          size={12}
          className={cn('transition-transform duration-300', collapsed ? '' : 'rotate-180')}
        />
      </button>
    </aside>
  );
}
