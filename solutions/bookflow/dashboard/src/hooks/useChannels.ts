'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConnectedPage {
  pageId: string;
  pageName: string | null;
  igAccountId: string | null;
  connectedAt: string | null;
  tokenStatus: string | null;
}

export interface FacebookPageOption {
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
    .select('meta_page_id, meta_page_name, meta_ig_account_id, meta_connected_at, meta_token_status')
    .eq('id', businessId)
    .single();

  if (error || !data?.meta_page_id) return null;

  return {
    pageId: data.meta_page_id,
    pageName: data.meta_page_name,
    igAccountId: data.meta_ig_account_id,
    connectedAt: data.meta_connected_at,
    tokenStatus: data.meta_token_status,
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
 * Start Facebook OAuth — redirects to Facebook login page.
 * No popup, no JS SDK — uses server-side redirect flow.
 */
export function startFacebookOAuth(businessId: string) {
  window.location.href = `/api/auth/facebook?business_id=${encodeURIComponent(businessId)}`;
}

/**
 * User picks a page from the list returned in URL params → store permanent token + subscribe webhook.
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
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la connexion de la page Facebook');
    },
  });
}

/**
 * Disconnect Facebook — remove tokens + unsubscribe webhook.
 */
// ─── Messenger Bridge Types ────────────────────────────────────────────────

export interface MessengerBridgeSession {
  status: 'active' | 'pending' | 'expired' | 'error';
  facebook_user_id: string | null;
  created_at: string | null;
  last_poll_at: string | null;
}

// ─── Messenger Bridge Hooks ────────────────────────────────────────────────

async function fetchBridgeStatus(businessId: string): Promise<MessengerBridgeSession | null> {
  try {
    const res = await fetch('/api/messenger-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bridge-status', business_id: businessId }),
    });
    const data = await res.json();

    // Provisioning API returns { login_ids: ["123456"] } when connected
    if (data.login_ids && data.login_ids.length > 0) {
      return {
        status: 'active',
        facebook_user_id: data.login_ids[0],
        created_at: null,
        last_poll_at: null,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function useBridgeStatus(businessId: string | null) {
  return useQuery({
    queryKey: ['messenger-bridge', 'status', businessId],
    queryFn: () => fetchBridgeStatus(businessId!),
    enabled: Boolean(businessId),
    refetchInterval: 30_000, // poll every 30s to show live status
  });
}

export interface BridgeLoginSession {
  session_id: string;
  screenshot: string;
  viewport: { width: number; height: number };
}

export function useStartBridgeLogin(businessId: string | null) {
  return useMutation({
    mutationFn: async (): Promise<BridgeLoginSession> => {
      const res = await fetch('/api/messenger-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start-login', business_id: businessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to start login');
      return data;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors du demarrage de la connexion');
    },
  });
}

export async function bridgeAction(
  sessionId: string,
  action: { type: string; x?: number; y?: number; text?: string; key?: string; selector?: string; value?: string },
): Promise<{ screenshot: string; status: string; url: string }> {
  const res = await fetch('/api/messenger-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'action', session_id: sessionId, ...action }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Action failed');
  return data;
}

export async function bridgeScreenshot(
  sessionId: string,
): Promise<{ screenshot: string; status: string; url: string }> {
  const res = await fetch('/api/messenger-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'screenshot', session_id: sessionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Screenshot failed');
  return data;
}

export function useCompleteBridgeLogin(businessId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch('/api/messenger-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', session_id: sessionId, business_id: businessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to complete login');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-bridge', 'status', businessId] });
      toast.success('Messenger connecte avec succes !');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la finalisation');
    },
  });
}

export async function cancelBridgeLogin(sessionId: string): Promise<void> {
  await fetch('/api/messenger-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancel', session_id: sessionId }),
  });
}

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
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la déconnexion de Facebook');
    },
  });
}
