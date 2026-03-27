import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

const gcalKeys = {
  status: (businessId: string | null) => ['gcal-status', businessId] as const,
};

export function useGoogleCalendarStatus(businessId: string | null) {
  return useQuery({
    queryKey: gcalKeys.status(businessId),
    queryFn: async () => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from('bookbot_businesses')
        .select('gcal_calendar_id, gcal_connected_at, gcal_refresh_token')
        .eq('id', businessId)
        .single();
      if (error) throw error;
      const row = data as { gcal_calendar_id: string | null; gcal_connected_at: string | null; gcal_refresh_token: string | null } | null;
      if (!row) return null;
      // "disconnected" = calendar_id is set (was connected) but connected_at is null (token revoked)
      const isDisconnected = Boolean(row.gcal_calendar_id) && !row.gcal_connected_at;
      return {
        gcal_calendar_id: row.gcal_calendar_id,
        gcal_connected_at: row.gcal_connected_at,
        gcal_disconnected: isDisconnected,
      };
    },
    enabled: Boolean(businessId),
  });
}

export function useConnectGoogle(businessId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('No business ID');
      const res = await fetch(`/api/auth/google?business_id=${businessId}`);
      const data = await res.json();
      if (!data.url) throw new Error('No OAuth URL');
      // Redirect to Google consent screen
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la connexion à Google Calendar');
    },
  });
}

export function useDisconnectGoogle(businessId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts?: { keepSlots?: boolean }) => {
      if (!businessId) throw new Error('No business ID');
      const res = await fetch('/api/auth/google', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, keepSlots: opts?.keepSlots ?? false }),
      });
      if (!res.ok) throw new Error('Disconnect failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gcalKeys.status(businessId) });
      qc.invalidateQueries({ queryKey: ['blocked-slots'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la déconnexion de Google Calendar');
    },
  });
}
