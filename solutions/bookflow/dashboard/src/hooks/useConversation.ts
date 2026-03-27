import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface ConversationDetail {
  id: string;
  phone: string;
  client_name: string | null;
  state: string;
  context: { messages?: ConversationMessage[] } | null;
  created_at: string;
  updated_at: string;
  business_id: string;
}

export function useConversation(sessionId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`bookbot_session_detail:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookbot_sessions',
        filter: `id=eq.${sessionId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversation', sessionId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, queryClient]);

  return useQuery({
    queryKey: ['conversation', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_sessions')
        .select('id, phone, client_name, state, context, created_at, updated_at, business_id')
        .eq('id', sessionId!)
        .single();
      if (error) throw error;
      return data as ConversationDetail;
    },
    enabled: Boolean(sessionId),
    staleTime: 10 * 1000,
  });
}
