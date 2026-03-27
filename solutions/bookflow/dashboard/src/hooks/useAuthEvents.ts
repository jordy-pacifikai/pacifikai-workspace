'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AuthEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export const authEventKeys = {
  all: ['auth_events'] as const,
  list: (eventType?: string, offset?: number) =>
    [...authEventKeys.all, 'list', eventType, offset] as const,
};

const PAGE_SIZE = 100;

async function fetchAuthEvents(
  eventType?: string,
  offset = 0,
): Promise<AuthEvent[]> {
  let query = supabase
    .from('bookbot_auth_events')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AuthEvent[];
}

export function useAuthEvents(eventType?: string, offset = 0) {
  return useQuery({
    queryKey: authEventKeys.list(eventType, offset),
    queryFn: () => fetchAuthEvents(eventType, offset),
    staleTime: 15 * 1000,
  });
}
