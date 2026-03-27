import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ConversationSession {
  id: string;
  phone: string;
  client_name: string | null;
  state: string;
  context: { messages?: Array<{ role: string; content: string }> } | null;
  created_at: string;
  updated_at: string;
}

const conversationKeys = {
  list: (businessId: string) => ['conversations', businessId] as const,
};

export function useConversations(businessId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel(`bookbot_sessions:${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookbot_sessions',
        filter: `business_id=eq.${businessId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: conversationKeys.list(businessId) });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [businessId, queryClient]);

  return useQuery({
    queryKey: conversationKeys.list(businessId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_sessions')
        .select('id, phone, client_name, state, context, created_at, updated_at')
        .eq('business_id', businessId!)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ConversationSession[];
    },
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
  });
}
