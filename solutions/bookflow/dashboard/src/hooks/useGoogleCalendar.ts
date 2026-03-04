import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
        .select('gcal_calendar_id, gcal_connected_at')
        .eq('id', businessId)
        .single();
      if (error) throw error;
      return data as { gcal_calendar_id: string | null; gcal_connected_at: string | null } | null;
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
  });
}

export function useDisconnectGoogle(businessId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error('No business ID');
      const res = await fetch('/api/auth/google', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      if (!res.ok) throw new Error('Disconnect failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gcalKeys.status(businessId) });
    },
  });
}
