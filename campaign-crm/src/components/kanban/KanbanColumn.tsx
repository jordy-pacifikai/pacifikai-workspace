'use client';

import { Droppable } from '@hello-pangea/dnd';
import { ProspectCard } from './ProspectCard';
import { STATUS_CONFIG } from '@/lib/constants';
import type { Prospect, CampaignStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: CampaignStatus;
  prospects: Prospect[];
}

export function KanbanColumn({ status, prospects }: KanbanColumnProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex w-56 flex-shrink-0 flex-col rounded-xl border border-[#222233] bg-[#0d0d18]">
      {/* Column header */}
      <div className={cn('flex items-center gap-2 rounded-t-xl border-b border-[#222233] px-3 py-2.5', cfg.bgColor)}>
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', cfg.dotColor)} />
        <span className={cn('flex-1 truncate text-xs font-semibold', cfg.textColor)}>{cfg.label}</span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold',
            cfg.bgColor,
            cfg.textColor
          )}
        >
          {prospects.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors',
              snapshot.isDraggingOver ? 'bg-[#0D9488]/5' : '',
              'min-h-[120px] max-h-[calc(100vh-160px)]'
            )}
          >
            {prospects.length === 0 && !snapshot.isDraggingOver ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#222233] py-6">
                <p className="text-xs text-[#555]">Aucun prospect</p>
              </div>
            ) : (
              prospects.map((prospect, index) => (
                <ProspectCard key={prospect.id} prospect={prospect} index={index} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
