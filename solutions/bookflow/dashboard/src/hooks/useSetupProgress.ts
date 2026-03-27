'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { OpeningHours } from '@/types/database';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type StepStatus = 'completed' | 'in_progress' | 'not_started';

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  status: StepStatus;
  href: string;
  estimatedTime: string;
}

export interface SetupProgress {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

// ─── Raw data shape ────────────────────────────────────────────────────────────

interface ProgressData {
  profileFilled: boolean;
  whatsappConnected: boolean;
  messengerConnected: boolean;
  hasServices: boolean;
  hasHours: boolean;
  hasClient: boolean;
  hasAppointment: boolean;
  hasConversation: boolean;
  isActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasConfiguredHours(hours: OpeningHours | null | undefined): boolean {
  if (!hours || typeof hours !== 'object') return false;
  return Object.values(hours).some((day) => day.is_open === true);
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchProgressData(businessId: string): Promise<ProgressData> {
  const progressResults = await Promise.allSettled([
    supabase
      .from('bookbot_businesses')
      .select('name, phone, phone_number_id, meta_page_id, services, hours, active')
      .eq('id', businessId)
      .single(),

    supabase
      .from('bookbot_clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('bookbot_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('bookbot_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ]);

  const businessRes = progressResults[0].status === 'fulfilled' ? progressResults[0].value : null;
  const clientRes = progressResults[1].status === 'fulfilled' ? progressResults[1].value : null;
  const appointmentRes = progressResults[2].status === 'fulfilled' ? progressResults[2].value : null;
  const conversationRes = progressResults[3].status === 'fulfilled' ? progressResults[3].value : null;

  if (progressResults[0].status === 'rejected') console.warn('[SetupProgress] business query failed:', progressResults[0].reason);
  if (progressResults[1].status === 'rejected') console.warn('[SetupProgress] clients query failed:', progressResults[1].reason);
  if (progressResults[2].status === 'rejected') console.warn('[SetupProgress] appointments query failed:', progressResults[2].reason);
  if (progressResults[3].status === 'rejected') console.warn('[SetupProgress] conversations query failed:', progressResults[3].reason);

  const biz = (businessRes?.data ?? null) as {
    name: string;
    phone: string | null;
    phone_number_id: string | null;
    meta_page_id: string | null;
    services: unknown[];
    hours: OpeningHours | null;
    active: boolean;
  } | null;

  const profileFilled = Boolean(biz?.name?.trim() && biz?.phone?.trim());
  const whatsappConnected = Boolean(biz?.phone_number_id);
  const messengerConnected = Boolean(biz?.meta_page_id);
  const hasServices = Array.isArray(biz?.services) && biz.services.length > 0;
  const hasHours = hasConfiguredHours(biz?.hours);
  const hasClient = (clientRes?.count ?? 0) > 0;
  const hasAppointment = (appointmentRes?.count ?? 0) > 0;
  const hasConversation = (conversationRes?.count ?? 0) > 0;
  const isActive = biz?.active === true;

  return {
    profileFilled,
    whatsappConnected,
    messengerConnected,
    hasServices,
    hasHours,
    hasClient,
    hasAppointment,
    hasConversation,
    isActive,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSetupProgress(businessId: string | null): {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['setup-progress', businessId ?? ''],
    queryFn: () => fetchProgressData(businessId!),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });

  // Helper to derive status from boolean
  const toStatus = (completed: boolean, inProgress?: boolean): StepStatus =>
    completed ? 'completed' : inProgress ? 'in_progress' : 'not_started';

  // Derive channel connection status
  const channelConnected = (data?.whatsappConnected ?? false) || (data?.messengerConnected ?? false);
  // "In progress" = profile exists (they finished onboarding) but no channel yet
  const channelInProgress = (data?.profileFilled ?? false) && !channelConnected;

  const steps: SetupStep[] = [
    {
      id: 'profile',
      label: 'Profil complété',
      description: 'Ajoutez le nom de votre établissement et votre numéro de téléphone.',
      completed: data?.profileFilled ?? false,
      status: toStatus(data?.profileFilled ?? false),
      href: '/settings',
      estimatedTime: '~1 min',
    },
    {
      id: 'channel',
      label: 'Connecter un canal',
      description: 'Reliez WhatsApp Business ou Messenger pour recevoir des messages clients.',
      completed: channelConnected,
      status: toStatus(channelConnected, channelInProgress),
      href: '/channels',
      estimatedTime: '~3 min',
    },
    {
      id: 'services',
      label: 'Services ajoutés',
      description: 'Définissez au moins un service avec sa durée et son tarif.',
      completed: data?.hasServices ?? false,
      status: toStatus(data?.hasServices ?? false),
      href: '/services',
      estimatedTime: '~2 min',
    },
    {
      id: 'hours',
      label: 'Horaires définis',
      description: 'Configurez vos jours et heures d\'ouverture.',
      completed: data?.hasHours ?? false,
      status: toStatus(data?.hasHours ?? false),
      href: '/hours',
      estimatedTime: '~2 min',
    },
    {
      id: 'client',
      label: 'Premier client',
      description: 'Votre premier client a été ajouté ou a réservé via le chatbot.',
      completed: data?.hasClient ?? false,
      status: toStatus(data?.hasClient ?? false),
      href: '/clients',
      estimatedTime: '~1 min',
    },
    {
      id: 'appointment',
      label: 'Premier rendez-vous',
      description: 'Un rendez-vous a été créé manuellement ou via le chatbot IA.',
      completed: data?.hasAppointment ?? false,
      status: toStatus(data?.hasAppointment ?? false, data?.hasClient ?? false),
      href: '/calendar',
      estimatedTime: '~1 min',
    },
    {
      id: 'conversation',
      label: 'Première conversation',
      description: 'Un client a discuté avec votre chatbot via WhatsApp ou Messenger.',
      completed: data?.hasConversation ?? false,
      status: toStatus(data?.hasConversation ?? false, channelConnected),
      href: '/conversations',
      estimatedTime: 'auto',
    },
    {
      id: 'published',
      label: 'Page de réservation publiée',
      description: 'Activez votre espace pour que les clients puissent réserver en ligne.',
      completed: data?.isActive ?? false,
      status: toStatus(data?.isActive ?? false),
      href: '/settings',
      estimatedTime: '~1 min',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;

  return {
    steps,
    completedCount,
    totalCount,
    isComplete: completedCount === totalCount,
    isLoading,
  };
}
