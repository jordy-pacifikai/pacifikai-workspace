'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  MessageSquare,
  Ban,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Appointment, BlockedSlot } from '@/types/database';

// ─── Constants ──────────────────────────────────────────────────────────────────

const GREEN = '#25D366';
const STALE_TIME = 5 * 60 * 1000; // 5 min cache

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DailyBriefingProps {
  businessId: string;
}

interface BriefingStat {
  icon: React.ElementType;
  value: string | number;
  label: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function DailyBriefing({ businessId }: DailyBriefingProps) {
  const [isOpen, setIsOpen] = useState(true);

  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [],
  );

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: todayAppts, isLoading: apptsLoading } = useQuery({
    queryKey: ['daily-briefing', 'appointments', businessId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_appointments')
        .select('*')
        .eq('business_id', businessId)
        .eq('appointment_date', today)
        .neq('status', 'cancelled')
        .order('time_slot');
      if (error) throw new Error(error.message);
      return (data ?? []) as Appointment[];
    },
    enabled: !!businessId,
    staleTime: STALE_TIME,
  });

  const { data: activeConversations, isLoading: convsLoading } = useQuery({
    queryKey: ['daily-briefing', 'conversations', businessId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookbot_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .neq('state', 'idle');
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
    enabled: !!businessId,
    staleTime: STALE_TIME,
  });

  const { data: blockedSlots, isLoading: blockedLoading } = useQuery({
    queryKey: ['daily-briefing', 'blocked', businessId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_blocked_slots')
        .select('*')
        .eq('business_id', businessId)
        .eq('date', today);
      if (error) throw new Error(error.message);
      return (data ?? []) as BlockedSlot[];
    },
    enabled: !!businessId,
    staleTime: STALE_TIME,
  });

  // ── Derived data ────────────────────────────────────────────────────────────

  const isLoading = apptsLoading || convsLoading || blockedLoading;

  const totalAppts = todayAppts?.length ?? 0;
  const next5 = useMemo(() => (todayAppts ?? []).slice(0, 5), [todayAppts]);

  const fillRate = useMemo(() => {
    if (!todayAppts) return 0;
    // Estimate total available slots: 8h work day / 30min avg = 16 slots
    // Blocked slots reduce availability
    const totalSlots = 16;
    const blockedCount = blockedSlots?.length ?? 0;
    const availableSlots = Math.max(totalSlots - blockedCount, 1);
    const occupied = todayAppts.length;
    return Math.min(Math.round((occupied / availableSlots) * 100), 100);
  }, [todayAppts, blockedSlots]);

  const stats: BriefingStat[] = [
    { icon: CalendarCheck, value: totalAppts, label: 'RDV aujourd\'hui' },
    { icon: MessageSquare, value: activeConversations ?? 0, label: 'Messages actifs' },
    { icon: Ban, value: blockedSlots?.length ?? 0, label: 'Créneaux bloqués' },
    { icon: BarChart3, value: `${fillRate} %`, label: 'Taux de remplissage' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl bg-gray-900/50 border border-gray-800 mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
          >
            <CalendarCheck size={16} style={{ color: GREEN }} />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-white">Votre journée</h2>
            <p className="text-xs text-gray-500 capitalize">{todayLabel}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5">
          {/* Stats grid: 2x2 desktop, stack mobile */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-gray-800/50 p-4 animate-pulse">
                  <div className="h-7 w-12 bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-gray-800/40 border border-gray-800/60 p-4 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} style={{ color: GREEN }} className="shrink-0" />
                      <span className="text-xl font-bold text-white leading-none">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Next appointments list */}
              {next5.length > 0 && (
                <div className="rounded-lg bg-gray-800/30 border border-gray-800/50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-800/50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                      Prochains RDV
                    </p>
                  </div>
                  <div className="divide-y divide-gray-800/40">
                    {next5.map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        {/* Time */}
                        <span className="text-sm font-semibold text-gray-300 w-12 shrink-0">
                          {appt.time_slot?.slice(0, 5) ?? '—'}
                        </span>

                        {/* Client + service */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 truncate">
                            {appt.client_name ?? 'Client inconnu'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {appt.service ?? '—'}
                          </p>
                        </div>

                        {/* Status */}
                        <StatusDot status={appt.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocked slots */}
              {(blockedSlots?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {blockedSlots!.map((slot) => (
                    <span
                      key={slot.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                    >
                      <Ban size={11} />
                      {slot.all_day
                        ? 'Journée entière'
                        : `${slot.time_from?.slice(0, 5) ?? '?'} – ${slot.time_to?.slice(0, 5) ?? '?'}`}
                      {slot.reason && (
                        <span className="text-red-500/60">· {slot.reason}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Status dot (compact for briefing) ────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-green-400',
  completed: 'bg-blue-400',
  no_show: 'bg-orange-400',
};

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[status] ?? 'bg-gray-500'}`}
      title={status}
    />
  );
}
