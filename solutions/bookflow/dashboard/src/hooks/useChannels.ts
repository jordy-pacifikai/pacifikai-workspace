'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { loginWithFacebook } from '@/lib/facebook-sdk';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConnectedPage {
  pageId: string;
  pageName: string | null;
  igAccountId: string | null;
  connectedAt: string | null;
}

interface FacebookPageOption {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account_id: string | null;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const channelKeys = {
  all: ['channels'] as const,
  connected: (businessId: string) => [...channelKeys.all, 'connected', businessId] as const,
};

// ─── Fetch connected channels ───────────────────────────────────────────────

async function fetchConnectedChannels(businessId: string): Promise<ConnectedPage | null> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('meta_page_id, meta_page_name, meta_ig_account_id, meta_connected_at')
    .eq('id', businessId)
    .single();

  if (error || !data?.meta_page_id) return null;

  return {
    pageId: data.meta_page_id,
    pageName: data.meta_page_name,
    igAccountId: data.meta_ig_account_id,
    connectedAt: data.meta_connected_at,
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useConnectedChannels(businessId: string | null) {
  return useQuery({
    queryKey: channelKeys.connected(businessId ?? ''),
    queryFn: () => fetchConnectedChannels(businessId!),
    enabled: Boolean(businessId),
  });
}

/**
 * Step 1: Launch Facebook OAuth popup → returns list of available pages.
 */
export function useConnectFacebook(businessId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<FacebookPageOption[]> => {
      // Open Facebook Login popup
      const { accessToken } = await loginWithFacebook();

      // Exchange for permanent page tokens server-side
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, businessId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to connect Facebook');

      return data.pages as FacebookPageOption[];
    },
  });
}

/**
 * Step 2: User picks a page → store permanent token + subscribe webhook.
 */
export function useSelectPage(businessId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: FacebookPageOption) => {
      const res = await fetch('/api/auth/facebook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          pageId: page.id,
          pageName: page.name,
          pageToken: page.access_token,
          igAccountId: page.instagram_business_account_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to connect page');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.connected(businessId ?? '') });
    },
  });
}

/**
 * Disconnect Facebook — remove tokens + unsubscribe webhook.
 */
export function useDisconnectFacebook(businessId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/facebook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to disconnect');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.connected(businessId ?? '') });
    },
  });
}
