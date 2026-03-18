'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Prospect, CampaignStatus } from '@/lib/types';

const QUERY_KEY = ['prospects'] as const;

// Map status to the timestamp column that should be set
const STATUS_TIMESTAMP_MAP: Partial<Record<CampaignStatus, keyof Prospect>> = {
  sent: 'email_sent_at',
  opened: 'email_opened_at',
  replied: 'replied_at',
  devis_sent: 'devis_sent_at',
  converted: 'converted_at',
  lost: 'lost_at',
};

export function useProspects() {
  const queryClient = useQueryClient();

  // Realtime subscription: invalidate on any change
  useEffect(() => {
    const channel = supabase
      .channel('campaign_prospects_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_prospects' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<Prospect[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_prospects')
        .select('*')
        .order('icp_score', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Prospect[];
    },
  });
}

export function useProspectsByStatus(status: CampaignStatus) {
  return useQuery<Prospect[]>({
    queryKey: [...QUERY_KEY, 'status', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_prospects')
        .select('*')
        .eq('status', status)
        .order('icp_score', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Prospect[];
    },
  });
}

export function useUpdateProspectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: CampaignStatus;
    }) => {
      const now = new Date().toISOString();
      const timestampField = STATUS_TIMESTAMP_MAP[newStatus];

      const update: Record<string, string> = {
        status: newStatus,
        updated_at: now,
      };

      if (timestampField) {
        update[timestampField as string] = now;
      }

      const { data, error } = await supabase
        .from('campaign_prospects')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Prospect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
