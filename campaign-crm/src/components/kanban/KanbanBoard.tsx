'use client';

import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects, useUpdateProspectStatus } from '@/hooks/useProspects';
import { STATUS_COLUMN_ORDER } from '@/lib/constants';
import type { CampaignStatus } from '@/lib/types';

// Dynamic import with SSR disabled to avoid hydration issues with @hello-pangea/dnd
const DragDropContext = dynamic(
  () => import('@hello-pangea/dnd').then((mod) => mod.DragDropContext),
  { ssr: false }
);

export function KanbanBoard() {
  const { searchQuery, sectorFilter, batchFilter, icpMinFilter } = usePipelineStore();
  const { data: prospects = [], isLoading } = useProspects();
  const { mutate: updateStatus } = useUpdateProspectStatus();

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId as CampaignStatus;
      updateStatus({ id: draggableId, newStatus });
    },
    [updateStatus]
  );

  // Filter prospects
  const filtered = prospects.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.city ?? '').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (sectorFilter && p.sector !== sectorFilter) return false;
    if (batchFilter !== null && p.batch !== batchFilter) return false;
    if (p.icp_score < icpMinFilter) return false;
    return true;
  });

  // Group by status
  const byStatus = STATUS_COLUMN_ORDER.reduce<Record<CampaignStatus, typeof filtered>>(
    (acc, status) => {
      acc[status] = filtered.filter((p) => p.status === status);
      return acc;
    },
    {} as Record<CampaignStatus, typeof filtered>
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#888]">Chargement du pipeline...</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-3 overflow-x-auto p-4 pb-6">
        {STATUS_COLUMN_ORDER.map((status) => (
          <KanbanColumn key={status} status={status} prospects={byStatus[status]} />
        ))}
      </div>
    </DragDropContext>
  );
}
