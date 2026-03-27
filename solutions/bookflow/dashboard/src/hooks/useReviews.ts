'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewRequest {
  id: string;
  business_id: string;
  appointment_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  token: string;
  status: 'pending' | 'sent' | 'viewed' | 'submitted';
  rating: number | null;
  comment: string | null;
  platform: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  submitted_at: string | null;
  created_at: string;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const reviewKeys = {
  all: ['bookbot_review_requests'] as const,
  list: (businessId: string) => [...reviewKeys.all, 'list', businessId] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchReviews(businessId: string): Promise<ReviewRequest[]> {
  const { data, error } = await supabase
    .from('bookbot_review_requests')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRequest[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReviews(businessId: string | null) {
  return useQuery({
    queryKey: reviewKeys.list(businessId ?? ''),
    queryFn: () => fetchReviews(businessId!),
    enabled: Boolean(businessId),
  });
}
