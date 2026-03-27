'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Business, OpeningHours } from '@/types/database';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasServices(services: Business['services']): boolean {
  return Array.isArray(services) && services.length > 0;
}

function hasConfiguredHours(hours: OpeningHours | null | undefined): boolean {
  if (!hours || typeof hours !== 'object') return false;
  return Object.values(hours).some((day) => day.is_open === true);
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

interface ChecklistData {
  hasServices: boolean;
  hasHours: boolean;
  hasChannel: boolean;
  hasLinkShared: boolean;
  hasSessions: boolean;
}

async function fetchChecklistData(businessId: string): Promise<ChecklistData> {
  const checklistResults = await Promise.allSettled([
    supabase
      .from('bookbot_businesses')
      .select('services, hours')
      .eq('id', businessId)
      .single(),

    supabase
      .from('bookbot_channels')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('bookbot_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ]);

  const businessRes = checklistResults[0].status === 'fulfilled' ? checklistResults[0].value : null;
  const channelRes = checklistResults[1].status === 'fulfilled' ? checklistResults[1].value : null;
  const sessionRes = checklistResults[2].status === 'fulfilled' ? checklistResults[2].value : null;

  if (checklistResults[0].status === 'rejected') console.warn('[Checklist] business query failed:', checklistResults[0].reason);
  if (checklistResults[1].status === 'rejected') console.warn('[Checklist] channel query failed:', checklistResults[1].reason);
  if (checklistResults[2].status === 'rejected') console.warn('[Checklist] session query failed:', checklistResults[2].reason);

  const business = (businessRes?.data ?? null) as {
    services: Business['services'];
    hours: OpeningHours;
  } | null;

  // localStorage check — must be done here since this runs in a browser context
  const linkSharedKey = `vea_link_shared_${businessId}`;
  const linkShared =
    typeof window !== 'undefined' &&
    localStorage.getItem(linkSharedKey) === 'true';

  return {
    hasServices: hasServices(business?.services ?? []),
    hasHours: hasConfiguredHours(business?.hours),
    hasChannel: (channelRes?.count ?? 0) > 0,
    hasLinkShared: linkShared,
    hasSessions: (sessionRes?.count ?? 0) > 0,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSetupChecklist(businessId: string | null): {
  items: ChecklistItem[];
  isLoading: boolean;
  completedCount: number;
  totalCount: number;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['setup-checklist', businessId ?? ''],
    queryFn: () => fetchChecklistData(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });

  const items: ChecklistItem[] = [
    {
      id: 'services',
      label: 'Ajouter vos services',
      href: '/services',
      done: data?.hasServices ?? false,
    },
    {
      id: 'hours',
      label: 'Configurer vos horaires',
      href: '/settings',
      done: data?.hasHours ?? false,
    },
    {
      id: 'channel',
      label: 'Connecter un canal (WhatsApp / Messenger)',
      href: '/channels',
      done: data?.hasChannel ?? false,
    },
    {
      id: 'link',
      label: 'Partager votre lien de réservation',
      href: '/booking-link',
      done: data?.hasLinkShared ?? false,
    },
    {
      id: 'test',
      label: 'Tester le chatbot',
      href: '/chat-test',
      done: data?.hasSessions ?? false,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;

  return {
    items,
    isLoading,
    completedCount,
    totalCount: items.length,
  };
}
