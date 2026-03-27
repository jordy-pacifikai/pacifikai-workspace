'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  message_template: string;
  segment_type: string;
  segment_value: string | null;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface CampaignInput {
  name: string;
  message_template: string;
  segment_type: string;
  segment_value?: string | null;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const campaignKeys = {
  all: ['bookbot_campaigns'] as const,
  list: (businessId: string) => [...campaignKeys.all, 'list', businessId] as const,
  segmentCount: (businessId: string, segmentType: string, segmentValue?: string | null) =>
    [...campaignKeys.all, 'segment', businessId, segmentType, segmentValue ?? ''] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCampaigns(businessId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('bookbot_campaigns')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Campaign[];
}

async function createCampaign(businessId: string, input: CampaignInput): Promise<Campaign> {
  const { data, error } = await supabase
    .from('bookbot_campaigns')
    .insert({
      business_id: businessId,
      name: input.name,
      message_template: input.message_template,
      segment_type: input.segment_type,
      segment_value: input.segment_value ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Campaign;
}

async function fetchSegmentCount(
  businessId: string,
  segmentType: string,
  segmentValue?: string | null,
): Promise<number> {
  let query = supabase
    .from('bookbot_clients')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .not('phone', 'is', null);

  const now = new Date();

  switch (segmentType) {
    case 'inactive_30d': {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`last_visit_at.lt.${cutoff},last_visit_at.is.null`);
      break;
    }
    case 'inactive_60d': {
      const cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`last_visit_at.lt.${cutoff},last_visit_at.is.null`);
      break;
    }
    case 'no_show':
      query = query.gt('no_show_count', 0);
      break;
    case 'new_clients': {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', cutoff);
      break;
    }
    case 'custom_tag':
      if (segmentValue) {
        query = query.contains('tags', [segmentValue]);
      }
      break;
    case 'all':
    default:
      break;
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCampaigns(businessId: string | null) {
  return useQuery({
    queryKey: campaignKeys.list(businessId ?? ''),
    queryFn: () => fetchCampaigns(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useCreateCampaign(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (input: CampaignInput) => createCampaign(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.list(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });
}

export function useSegmentCount(
  businessId: string | null,
  segmentType: string,
  segmentValue?: string | null,
) {
  return useQuery({
    queryKey: campaignKeys.segmentCount(businessId ?? '', segmentType, segmentValue),
    queryFn: () => fetchSegmentCount(businessId!, segmentType, segmentValue),
    enabled: Boolean(businessId) && Boolean(segmentType),
  });
}
