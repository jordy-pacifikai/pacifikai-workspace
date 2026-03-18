'use client';

import { Command } from 'cmdk';
import { LayoutGrid, List, BarChart3, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects } from '@/hooks/useProspects';

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, toggleCommand, setActiveView, selectProspect } = usePipelineStore();
  const { data: prospects = [] } = useProspects();

  // Close on Escape is handled by cmdk natively
  function close() {
    if (commandOpen) toggleCommand();
  }

  function goKanban() {
    setActiveView('kanban');
    router.push('/pipeline');
    close();
  }

  function goList() {
    setActiveView('list');
    router.push('/pipeline/list');
    close();
  }

  function goStats() {
    setActiveView('stats');
    router.push('/pipeline/stats');
    close();
  }

  function openProspect(id: string) {
    selectProspect(id);
    close();
  }

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Command dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-[#222233] bg-[#141420] shadow-2xl">
        <Command
          className="flex flex-col"
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
        >
          <div className="flex items-center border-b border-[#222233] px-4">
            <Command.Input
              placeholder="Rechercher un prospect ou une action..."
              className="flex-1 bg-transparent py-4 text-sm text-[#e0e0e0] placeholder-[#888] focus:outline-none"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[#888]">
              Aucun resultat
            </Command.Empty>

            {/* Quick navigation */}
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#888]"
            >
              <Command.Item
                value="Voir Kanban"
                onSelect={goKanban}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#e0e0e0] aria-selected:bg-[#0D9488]/20 aria-selected:text-[#0D9488]"
              >
                <LayoutGrid size={14} className="text-[#888]" />
                Voir Kanban
              </Command.Item>

              <Command.Item
                value="Voir Liste"
                onSelect={goList}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#e0e0e0] aria-selected:bg-[#0D9488]/20 aria-selected:text-[#0D9488]"
              >
                <List size={14} className="text-[#888]" />
                Voir Liste
              </Command.Item>

              <Command.Item
                value="Voir Stats"
                onSelect={goStats}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#e0e0e0] aria-selected:bg-[#0D9488]/20 aria-selected:text-[#0D9488]"
              >
                <BarChart3 size={14} className="text-[#888]" />
                Voir Stats
              </Command.Item>
            </Command.Group>

            {/* Prospects */}
            {prospects.length > 0 && (
              <Command.Group
                heading="Prospects"
                className="mt-2 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#888]"
              >
                {prospects.slice(0, 8).map((prospect) => (
                  <Command.Item
                    key={prospect.id}
                    value={prospect.name}
                    onSelect={() => openProspect(prospect.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#e0e0e0] aria-selected:bg-[#0D9488]/20 aria-selected:text-[#0D9488]"
                  >
                    <User size={14} className="flex-shrink-0 text-[#888]" />
                    <span className="flex-1 truncate">{prospect.name}</span>
                    <span className="text-xs text-[#888]">{prospect.city}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
