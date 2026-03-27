'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'new_booking'
  | 'cancellation'
  | 'review'
  | 'no_show'
  | 'campaign_complete'
  | 'waitlist_update'
  | 'gcal_disconnected';

export interface AppNotification {
  id: string;
  business_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationChannelPrefs {
  whatsapp: boolean;
  email: boolean;
  in_app: boolean;
}

export type NotificationPrefs = Record<NotificationType, NotificationChannelPrefs>;

export const DEFAULT_PREFS: NotificationPrefs = {
  new_booking:       { whatsapp: true,  email: true,  in_app: true },
  cancellation:      { whatsapp: true,  email: false, in_app: true },
  review:            { whatsapp: false, email: true,  in_app: true },
  no_show:           { whatsapp: true,  email: false, in_app: true },
  campaign_complete: { whatsapp: false, email: false, in_app: true },
  waitlist_update:   { whatsapp: false, email: false, in_app: true },
  gcal_disconnected: { whatsapp: false, email: true,  in_app: true },
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ['bookbot_notifications'] as const,
  list: (businessId: string) => [...notificationKeys.all, 'list', businessId] as const,
  unread: (businessId: string) => [...notificationKeys.all, 'unread', businessId] as const,
  prefs: (businessId: string) => [...notificationKeys.all, 'prefs', businessId] as const,
};

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchNotifications(businessId: string): Promise<AppNotification[]> {
  const sb = getSupabaseBrowser();
  const { data, error } = await sb
    .from('bookbot_notifications')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []) as AppNotification[];
}

async function fetchUnreadCount(businessId: string): Promise<number> {
  const sb = getSupabaseBrowser();
  const { count, error } = await sb
    .from('bookbot_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_read', false);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function fetchNotificationPrefs(businessId: string): Promise<NotificationPrefs> {
  const sb = getSupabaseBrowser();
  const { data, error } = await sb
    .from('bookbot_businesses')
    .select('notification_prefs')
    .eq('id', businessId)
    .single();

  if (error) throw new Error(error.message);
  return (data?.notification_prefs as NotificationPrefs) ?? DEFAULT_PREFS;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useNotifications(businessId: string | null) {
  return useQuery({
    queryKey: notificationKeys.list(businessId ?? ''),
    queryFn: () => fetchNotifications(businessId!),
    enabled: Boolean(businessId),
    staleTime: 30_000,
  });
}

export function useUnreadCount(businessId: string | null) {
  return useQuery({
    queryKey: notificationKeys.unread(businessId ?? ''),
    queryFn: () => fetchUnreadCount(businessId!),
    enabled: Boolean(businessId),
    refetchInterval: 30_000,
    staleTime: 0,
  });
}

export function useMarkAsRead(businessId: string | null) {
  const queryClient = useQueryClient();
  const sb = getSupabaseBrowser();

  return useMutation({
    mutationFn: async (notificationId: string | 'all') => {
      if (notificationId === 'all') {
        const { error } = await sb
          .from('bookbot_notifications')
          .update({ is_read: true })
          .eq('business_id', businessId!)
          .eq('is_read', false);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await sb
          .from('bookbot_notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(businessId ?? '') });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(businessId ?? '') });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors du marquage des notifications');
    },
  });
}

export function useNotificationPrefs(businessId: string | null) {
  return useQuery({
    queryKey: notificationKeys.prefs(businessId ?? ''),
    queryFn: () => fetchNotificationPrefs(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPrefs(businessId: string | null) {
  const queryClient = useQueryClient();
  const sb = getSupabaseBrowser();

  return useMutation({
    mutationFn: async (prefs: NotificationPrefs) => {
      const { error } = await sb
        .from('bookbot_businesses')
        .update({ notification_prefs: prefs })
        .eq('id', businessId!);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.prefs(businessId ?? '') });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour des préférences de notification');
    },
  });
}
