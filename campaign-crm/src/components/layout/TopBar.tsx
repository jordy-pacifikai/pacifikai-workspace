'use client';

import { Search, Command } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects } from '@/hooks/useProspects';
import { useEffect } from 'react';

const VIEW_LABELS: Record<string, string> = {
  kanban: 'Kanban',
  list:   'Liste',
  stats:  'Statistiques',
};

export function TopBar() {
  const { activeView, searchQuery, setSearchQuery, toggleCommand } = usePipelineStore();
  const { data: prospects = [] } = useProspects();

  // Cmd+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommand();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleCommand]);

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-[#222233] bg-[#0a0a12] px-4">
      {/* Left: view title */}
      <h1 className="min-w-[100px] text-sm font-semibold text-[#e0e0e0]">
        {VIEW_LABELS[activeView] ?? 'Pipeline'}
      </h1>

      {/* Center: search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Rechercher un prospect..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[#222233] bg-[#141420] py-2 pl-9 pr-3 text-sm text-[#e0e0e0] placeholder-[#888] transition-colors focus:border-[#0D9488] focus:outline-none"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Prospect count badge */}
        <span className="rounded-full bg-[#141420] border border-[#222233] px-3 py-1 text-xs text-[#888]">
          <span className="font-semibold text-[#e0e0e0]">{prospects.length}</span> prospects
        </span>

        {/* Cmd+K button */}
        <button
          onClick={toggleCommand}
          className="flex items-center gap-1.5 rounded-lg border border-[#222233] bg-[#141420] px-3 py-1.5 text-xs text-[#888] transition-colors hover:border-[#0D9488] hover:text-[#e0e0e0]"
          aria-label="Ouvrir la palette de commandes"
        >
          <Command size={12} />
          <kbd className="font-mono">K</kbd>
        </button>
      </div>
    </header>
  );
}
