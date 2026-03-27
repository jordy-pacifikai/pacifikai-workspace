'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  MessageCircle,
  UserPlus,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────────

const GREEN = '#25D366';
const STALE_TIME = 30_000; // 30s

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  businessId: string;
}

type ActivityType =
  | 'appointment_new'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_no_show'
  | 'appointment_completed'
  | 'conversation'
  | 'new_client';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: Date;
  status?: string;
}

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:   { label: 'En attente', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  confirmed: { label: 'Confirmé',   className: 'bg-green-500/15 text-green-400 border-green-500/25' },
  cancelled: { label: 'Annulé',     className: 'bg-red-500/15 text-red-400 border-red-500/25' },
  completed: { label: 'Terminé',    className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  no_show:   { label: 'No show',    className: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  active:    { label: 'En cours',   className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  booking:   { label: 'Réservation',className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

const ACTIVITY_ICON: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  appointment_new:       { icon: Calendar,      color: '#25D366' },
  appointment_confirmed: { icon: Calendar,      color: '#22c55e' },
  appointment_cancelled: { icon: XCircle,       color: '#ef4444' },
  appointment_no_show:   { icon: AlertTriangle, color: '#f97316' },
  appointment_completed: { icon: Calendar,      color: '#3b82f6' },
  conversation:          { icon: MessageCircle, color: '#8b5cf6' },
  new_client:            { icon: UserPlus,      color: '#06b6d4' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getAppointmentType(status: string): ActivityType {
  switch (status) {
    case 'cancelled': return 'appointment_cancelled';
    case 'no_show':   return 'appointment_no_show';
    case 'completed': return 'appointment_completed';
    case 'confirmed': return 'appointment_confirmed';
    default:          return 'appointment_new';
  }
}

function formatApptDate(date: string, time?: string | null): string {
  try {
    const d = new Date(date);
    const dayStr = format(d, 'dd/MM', { locale: fr });
    const timeStr = time?.slice(0, 5) ?? '';
    return timeStr ? `le ${dayStr} à ${timeStr}` : `le ${dayStr}`;
  } catch {
    return '';
  }
}

function formatRelativeTime(date: Date): string {
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ActivityFeed({ businessId }: ActivityFeedProps) {
  // ── Fetch appointments + conversations in parallel ──────────────────────────

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['activity-feed', 'appointments', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_appointments')
        .select('id, client_name, service, status, created_at, appointment_date, time_slot')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!businessId,
    staleTime: STALE_TIME,
  });

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['activity-feed', 'conversations', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_sessions')
        .select('id, client_name, client_phone, state, updated_at')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!businessId,
    staleTime: STALE_TIME,
  });

  // ── Merge + sort ────────────────────────────────────────────────────────────

  const feed = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Map appointments
    for (const appt of appointments ?? []) {
      const type = getAppointmentType(appt.status);
      const name = appt.client_name ?? 'Client inconnu';
      const when = formatApptDate(appt.appointment_date, appt.time_slot);

      let title = '';
      switch (type) {
        case 'appointment_cancelled':
          title = `Annulation — ${name}`;
          break;
        case 'appointment_no_show':
          title = `No-show — ${name}`;
          break;
        case 'appointment_completed':
          title = `Terminé — ${name}, ${appt.service ?? 'RDV'}`;
          break;
        case 'appointment_confirmed':
          title = `RDV confirmé — ${name}, ${appt.service ?? 'RDV'} ${when}`;
          break;
        default:
          title = `Nouveau RDV — ${name}, ${appt.service ?? 'RDV'} ${when}`;
      }

      items.push({
        id: `appt-${appt.id}`,
        type,
        title,
        subtitle: appt.service ?? undefined,
        timestamp: new Date(appt.created_at),
        status: appt.status,
      });
    }

    // Map conversations
    for (const conv of conversations ?? []) {
      const name = conv.client_name ?? conv.client_phone ?? 'Inconnu';
      const isBooking = conv.state === 'booking' || conv.state === 'confirming';

      items.push({
        id: `conv-${conv.id}`,
        type: 'conversation',
        title: isBooking
          ? `Réservation en cours — ${name}`
          : `Conversation active — ${name}`,
        timestamp: new Date(conv.updated_at),
        status: isBooking ? 'booking' : 'active',
      });
    }

    // Sort by timestamp DESC, take top 15
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items.slice(0, 15);
  }, [appointments, conversations]);

  // ── Loading state ─────────────────────────────────────────────────────────

  const isLoading = apptsLoading || convsLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
        >
          <Calendar size={16} style={{ color: GREEN }} />
        </div>
        <h2 className="text-sm font-semibold text-gray-100">
          Activité récente
        </h2>
        <span className="ml-auto text-xs text-gray-600">
          {!isLoading && feed.length > 0 && `${feed.length} événement${feed.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-3">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 bg-gray-800 rounded" />
                  <div className="h-2.5 w-1/3 bg-gray-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar size={28} className="text-gray-700 mb-2" />
            <p className="text-sm text-gray-500">Aucune activité récente</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-800" />

            {/* Feed items */}
            <div className="space-y-1">
              {feed.map((item, index) => {
                const config = ACTIVITY_ICON[item.type];
                const Icon = config.icon;
                const badge = item.status ? STATUS_BADGE[item.status] : null;
                const isLast = index === feed.length - 1;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'relative flex items-start gap-3 py-2.5 pl-0',
                      !isLast && 'border-b border-transparent',
                    )}
                  >
                    {/* Icon dot on the timeline */}
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-800 bg-gray-950"
                    >
                      <Icon size={14} style={{ color: config.color }} />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-gray-200 leading-snug truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>

                    {/* Status badge */}
                    {badge && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 mt-0.5',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
