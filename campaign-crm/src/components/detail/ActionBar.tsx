'use client';

import { useState } from 'react';
import { Send, ChevronDown, StickyNote } from 'lucide-react';
import { useUpdateProspectStatus } from '@/hooks/useProspects';
import { STATUS_CONFIG, STATUS_COLUMN_ORDER } from '@/lib/constants';
import type { Prospect, CampaignStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  prospect: Prospect;
  onAddNote?: () => void;
}

export function ActionBar({ prospect, onAddNote }: ActionBarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const { mutate: updateStatus, isPending } = useUpdateProspectStatus();

  function handleStatusChange(newStatus: CampaignStatus) {
    updateStatus({ id: prospect.id, newStatus });
    setStatusOpen(false);
  }

  const currentConfig = STATUS_CONFIG[prospect.status];

  return (
    <div className="flex items-center gap-2 border-t border-[#222233] bg-[#141420] px-4 py-3">
      {/* Send email */}
      <button
        className="flex items-center gap-2 rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0b8278] disabled:opacity-50"
        disabled={!prospect.email}
        title={!prospect.email ? 'Pas d\'email pour ce prospect' : 'Envoyer un email'}
      >
        <Send size={13} />
        Envoyer Email
      </button>

      {/* Status change */}
      <div className="relative">
        <button
          onClick={() => setStatusOpen((o) => !o)}
          disabled={isPending}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50',
            currentConfig.bgColor,
            currentConfig.borderColor,
            currentConfig.textColor,
            'hover:opacity-80'
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', currentConfig.dotColor)}
          />
          {currentConfig.label}
          <ChevronDown size={12} className={cn('transition-transform', statusOpen && 'rotate-180')} />
        </button>

        {statusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute bottom-full left-0 z-20 mb-1 min-w-[180px] overflow-hidden rounded-lg border border-[#222233] bg-[#141420] shadow-xl">
              {STATUS_COLUMN_ORDER.map((status) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                      prospect.status === status
                        ? cn(cfg.bgColor, cfg.textColor)
                        : 'text-[#888] hover:bg-[#1a1a2e] hover:text-[#e0e0e0]'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dotColor)} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add note */}
      <button
        onClick={onAddNote}
        className="ml-auto flex items-center gap-2 rounded-lg border border-[#222233] px-3 py-2 text-sm text-[#888] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
      >
        <StickyNote size={13} />
        Ajouter Note
      </button>
    </div>
  );
}
