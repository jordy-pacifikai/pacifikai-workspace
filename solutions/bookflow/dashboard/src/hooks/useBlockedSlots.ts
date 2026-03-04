import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface BlockedSlot {
  id: string;
  business_id: string;
  date: string;
  time_from: string | null;
  time_to: string | null;
  all_day: boolean;
  reason: string | null;
  source: string;
  gcal_event_id: string | null;
  created_at: string;
}

const blockedSlotKeys = {
  all: ['blocked-slots'] as const,
  list: (businessId: string | null) => [...blockedSlotKeys.all, 'list', businessId] as const,
};

export function useBlockedSlots(businessId: string | null) {
  return useQuery({
    queryKey: blockedSlotKeys.list(businessId),
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from('bookbot_blocked_slots')
        .select('*')
        .eq('business_id', businessId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as BlockedSlot[];
    },
    enabled: Boolean(businessId),
  });
}

export function useCreateBlockedSlot(businessId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slot: {
      date: string;
      time_from?: string | null;
      time_to?: string | null;
      all_day: boolean;
      reason?: string;
    }) => {
      if (!businessId) throw new Error('No business ID');
      const { error } = await supabase.from('bookbot_blocked_slots').insert({
        business_id: businessId,
        date: slot.date,
        time_from: slot.all_day ? null : (slot.time_from ?? null),
        time_to: slot.all_day ? null : (slot.time_to ?? null),
        all_day: slot.all_day,
        reason: slot.reason ?? null,
        source: 'manual',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blockedSlotKeys.all });
    },
  });
}

export function useDeleteBlockedSlot(businessId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookbot_blocked_slots')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blockedSlotKeys.all });
    },
  });
}
