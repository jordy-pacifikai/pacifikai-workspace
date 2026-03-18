import { create } from 'zustand';
import type { CampaignStatus, CampaignSector } from '@/lib/types';

type ActiveView = 'kanban' | 'list' | 'stats';

interface PipelineState {
  // View
  activeView: ActiveView;
  // Detail panel
  selectedProspect: string | null;
  detailOpen: boolean;
  // Filters
  searchQuery: string;
  statusFilter: CampaignStatus | null;
  sectorFilter: CampaignSector | null;
  batchFilter: number | null;
  icpMinFilter: number;
  // Command palette
  commandOpen: boolean;
}

interface PipelineActions {
  setActiveView: (view: ActiveView) => void;
  selectProspect: (id: string) => void;
  closeDetail: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: CampaignStatus | null) => void;
  setSectorFilter: (sector: CampaignSector | null) => void;
  setBatchFilter: (batch: number | null) => void;
  setIcpMinFilter: (score: number) => void;
  toggleCommand: () => void;
}

export const usePipelineStore = create<PipelineState & PipelineActions>((set) => ({
  // Initial state
  activeView: 'kanban',
  selectedProspect: null,
  detailOpen: false,
  searchQuery: '',
  statusFilter: null,
  sectorFilter: null,
  batchFilter: null,
  icpMinFilter: 0,
  commandOpen: false,

  // Actions
  setActiveView: (view) => set({ activeView: view }),

  selectProspect: (id) =>
    set({
      selectedProspect: id,
      detailOpen: true,
    }),

  closeDetail: () =>
    set({
      detailOpen: false,
      selectedProspect: null,
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  setSectorFilter: (sector) => set({ sectorFilter: sector }),

  setBatchFilter: (batch) => set({ batchFilter: batch }),

  setIcpMinFilter: (score) => set({ icpMinFilter: score }),

  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
}));
