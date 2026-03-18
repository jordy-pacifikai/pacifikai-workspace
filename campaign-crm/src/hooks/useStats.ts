'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { CampaignStatus, CampaignSector } from '@/lib/types';

export interface StatusCount {
  status: CampaignStatus;
  count: number;
}

export interface SectorCount {
  sector: CampaignSector;
  count: number;
}

export interface BatchCount {
  batch: number;
  count: number;
}

export interface CampaignStats {
  byStatus: StatusCount[];
  bySector: SectorCount[];
  byBatch: BatchCount[];
  total: number;
  conversionRate: number;
  openRate: number;
  replyRate: number;
}

export function useStats() {
  return useQuery<CampaignStats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_prospects')
        .select('status, sector, batch');

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as { status: CampaignStatus; sector: CampaignSector; batch: number | null }[];
      const total = rows.length;

      // Aggregate by status
      const statusMap = new Map<CampaignStatus, number>();
      // Aggregate by sector
      const sectorMap = new Map<CampaignSector, number>();
      // Aggregate by batch
      const batchMap = new Map<number, number>();

      for (const row of rows) {
        statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
        sectorMap.set(row.sector, (sectorMap.get(row.sector) ?? 0) + 1);
        if (row.batch !== null) {
          batchMap.set(row.batch, (batchMap.get(row.batch) ?? 0) + 1);
        }
      }

      const byStatus: StatusCount[] = Array.from(statusMap.entries()).map(
        ([status, count]) => ({ status, count })
      );
      const bySector: SectorCount[] = Array.from(sectorMap.entries()).map(
        ([sector, count]) => ({ sector, count })
      );
      const byBatch: BatchCount[] = Array.from(batchMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([batch, count]) => ({ batch, count }));

      const sent = statusMap.get('sent') ?? 0;
      const opened = statusMap.get('opened') ?? 0;
      const replied = statusMap.get('replied') ?? 0;
      const converted = statusMap.get('converted') ?? 0;

      // Denominator for rates: everyone past "sent" stage
      const emailedTotal = sent + opened + replied + (statusMap.get('devis_sent') ?? 0) + converted + (statusMap.get('lost') ?? 0);

      const conversionRate = emailedTotal > 0 ? (converted / emailedTotal) * 100 : 0;
      const openRate = emailedTotal > 0 ? ((opened + replied + (statusMap.get('devis_sent') ?? 0) + converted) / emailedTotal) * 100 : 0;
      const replyRate = emailedTotal > 0 ? ((replied + (statusMap.get('devis_sent') ?? 0) + converted) / emailedTotal) * 100 : 0;

      return {
        byStatus,
        bySector,
        byBatch,
        total,
        conversionRate: Math.round(conversionRate * 10) / 10,
        openRate: Math.round(openRate * 10) / 10,
        replyRate: Math.round(replyRate * 10) / 10,
      };
    },
    staleTime: 30 * 1000,
  });
}
