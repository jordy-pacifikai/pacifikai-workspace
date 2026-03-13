'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, Coffee, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = typeof DAY_ORDER[number];

const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type DaySlot = {
  isOpen: boolean;
  open: string;
  close: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
};

type HoursState = Record<DayKey, DaySlot>;

const DEFAULT_SLOT: DaySlot = {
  isOpen: true,
  open: '08:00',
  close: '17:00',
  hasBreak: false,
  breakStart: '12:00',
  breakEnd: '13:00',
};

const DEFAULT_HOURS: HoursState = Object.fromEntries(
  DAY_ORDER.map((d) => [d, { ...DEFAULT_SLOT, isOpen: d !== 'sun' }]),
) as HoursState;

// ─── Parse bookbot_businesses.hours format ────────────────────────────────────
// Format: "08:00-12:00,13:00-17:00" (with break) or "08:00-17:00" (no break) or "closed"

function parseHoursRecord(record: Record<string, unknown> | null): HoursState {
  if (!record) return DEFAULT_HOURS;

  const result = { ...DEFAULT_HOURS };
  for (const day of DAY_ORDER) {
    const raw = record[day];
    if (!raw) {
      result[day] = { ...DEFAULT_SLOT, isOpen: day !== 'sun' };
      continue;
    }

    // Handle object format: {open, close, is_open, break_start, break_end}
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as { open?: string; close?: string; is_open?: boolean; break_start?: string; break_end?: string };
      if (obj.is_open === false) {
        result[day] = { ...DEFAULT_SLOT, isOpen: false };
      } else {
        result[day] = {
          isOpen: true,
          open: obj.open ?? '08:00',
          close: obj.close ?? '17:00',
          hasBreak: Boolean(obj.break_start && obj.break_end),
          breakStart: obj.break_start ?? '12:00',
          breakEnd: obj.break_end ?? '13:00',
        };
      }
      continue;
    }

    // Handle string format: "08:00-17:00" or "08:00-12:00,13:00-17:00" or "closed"
    const val = String(raw);
    if (val === 'closed') {
      result[day] = { ...DEFAULT_SLOT, isOpen: false };
      continue;
    }

    const ranges = val.split(',').map((r) => r.trim());
    if (ranges.length === 2) {
      const [r1, r2] = ranges;
      const [open, breakStart] = r1.split('-');
      const [breakEnd, close] = r2.split('-');
      result[day] = {
        isOpen: true,
        open: open ?? '08:00',
        close: close ?? '17:00',
        hasBreak: true,
        breakStart: breakStart ?? '12:00',
        breakEnd: breakEnd ?? '13:00',
      };
    } else {
      const [open, close] = ranges[0].split('-');
      result[day] = {
        isOpen: true,
        open: open ?? '08:00',
        close: close ?? '17:00',
        hasBreak: false,
        breakStart: '12:00',
        breakEnd: '13:00',
      };
    }
  }
  return result;
}

// Convert back to bookbot_businesses.hours format
function serializeHours(hours: HoursState): Record<string, string> {
  const result: Record<string, string> = {};
  for (const day of DAY_ORDER) {
    const slot = hours[day];
    if (!slot.isOpen) {
      result[day] = 'closed';
    } else if (slot.hasBreak) {
      result[day] = `${slot.open}-${slot.breakStart},${slot.breakEnd}-${slot.close}`;
    } else {
      result[day] = `${slot.open}-${slot.close}`;
    }
  }
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type TimeInputProps = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

function TimeInput({ value, onChange, disabled }: TimeInputProps) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm',
        'focus:border-[#25D366] focus:outline-none transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        '[color-scheme:dark]',
      )}
    />
  );
}

type ToggleProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
};

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none',
        checked ? 'bg-[#25D366] border-[#25D366]' : 'bg-gray-700 border-gray-700',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

type NumberInputProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
};

function NumberInput({ value, onChange, min = 0, max, suffix }: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#25D366] focus:outline-none transition-colors"
      />
      {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <Icon className="w-4 h-4 text-[#25D366]" />
        <h2 className="text-white font-medium">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Skeleton state ───────────────────────────────────────────────────────────

function HoursSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard />
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-11 h-6 rounded-full" />
            <Skeleton className="w-28 h-9 rounded-lg" />
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-28 h-9 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookbotBusiness = Record<string, any>;

export default function HoursPage() {
  const { businessId, businessName } = useAppStore();
  const sb = getSupabaseBrowser();
  const queryClient = useQueryClient();

  // Read from bookbot_businesses (source of truth — onboarding writes here)
  const { data: business, isLoading } = useQuery<BookbotBusiness | null>({
    queryKey: ['bookbot-business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await sb
        .from('bookbot_businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      return data;
    },
    enabled: Boolean(businessId),
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await sb
        .from('bookbot_businesses')
        .update(updates)
        .eq('id', businessId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookbot-business', businessId] });
    },
  });

  // Local state for editing
  const [hours, setHours] = useState<HoursState>(DEFAULT_HOURS);
  const [slotDuration, setSlotDuration] = useState(30);
  const [bookingBuffer, setBookingBuffer] = useState(0);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [saved, setSaved] = useState(false);

  // Sync from API data once loaded
  useEffect(() => {
    if (!business) return;
    setHours(parseHoursRecord(business.hours));
    const cfg = business.config ?? {};
    if (cfg.default_slot_duration) setSlotDuration(cfg.default_slot_duration);
    if (cfg.booking_buffer != null) setBookingBuffer(cfg.booking_buffer);
    if (cfg.max_advance_booking_days) setMaxAdvanceDays(cfg.max_advance_booking_days);
  }, [business]);

  function updateDay(day: DayKey, updates: Partial<DaySlot>) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  }

  function handleSave() {
    const existingConfig = (business?.config ?? {}) as Record<string, unknown>;
    updateMutation.mutate(
      {
        hours: serializeHours(hours),
        config: {
          ...existingConfig,
          default_slot_duration: slotDuration,
          booking_buffer: bookingBuffer,
          max_advance_booking_days: maxAdvanceDays,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
      },
    );
  }

  if (isLoading) return (
    <DashboardLayout title="Horaires" businessName={businessName ?? undefined}>
      <HoursSkeleton />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Horaires" businessName={businessName ?? undefined}>
      <div className="space-y-6 max-w-3xl">

        {/* Opening hours grid with per-day breaks */}
        <Section icon={Calendar} title="Horaires d'ouverture">
          <div className="space-y-3">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[100px_52px_1fr] gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-800">
              <span>Jour</span>
              <span>Ouvert</span>
              <span>Plages horaires</span>
            </div>

            {DAY_ORDER.map((day) => {
              const slot = hours[day];
              return (
                <div
                  key={day}
                  className="border-b border-gray-800/60 last:border-0 py-3"
                >
                  {/* Main row */}
                  <div className="grid sm:grid-cols-[100px_52px_1fr] gap-3 sm:gap-4 items-center">
                    {/* Day name */}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        slot.isOpen ? 'text-white' : 'text-gray-500',
                      )}
                    >
                      {DAY_LABELS[day]}
                    </span>

                    {/* Toggle open */}
                    <Toggle
                      checked={slot.isOpen}
                      onChange={(v) => updateDay(day, { isOpen: v })}
                      label={`${DAY_LABELS[day]} ouvert`}
                    />

                    {/* Time range + break toggle */}
                    {slot.isOpen ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TimeInput
                            value={slot.open}
                            onChange={(v) => updateDay(day, { open: v })}
                          />
                          <span className="text-gray-500 text-sm">a</span>
                          <TimeInput
                            value={slot.close}
                            onChange={(v) => updateDay(day, { close: v })}
                          />
                          <button
                            type="button"
                            onClick={() => updateDay(day, { hasBreak: !slot.hasBreak })}
                            className={cn(
                              'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ml-1',
                              slot.hasBreak
                                ? 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300',
                            )}
                          >
                            <Coffee className="w-3 h-3" />
                            Pause
                          </button>
                        </div>

                        {/* Break row */}
                        {slot.hasBreak && (
                          <div className="flex items-center gap-2 flex-wrap pl-0 sm:pl-0">
                            <span className="text-xs text-amber-400/80 w-16">Pause :</span>
                            <TimeInput
                              value={slot.breakStart}
                              onChange={(v) => updateDay(day, { breakStart: v })}
                            />
                            <span className="text-gray-500 text-sm">a</span>
                            <TimeInput
                              value={slot.breakEnd}
                              onChange={(v) => updateDay(day, { breakEnd: v })}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600 italic">Ferme</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Booking settings */}
        <Section icon={Clock} title="Parametres de reservation">
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-white font-medium">Duree des creneaux</p>
                <p className="text-xs text-gray-500 mt-0.5">Duree par defaut d&apos;un rendez-vous</p>
              </div>
              <NumberInput value={slotDuration} onChange={setSlotDuration} min={5} max={480} suffix="minutes" />
            </div>

            <div className="border-t border-gray-800" />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-white font-medium">Tampon entre RDV</p>
                <p className="text-xs text-gray-500 mt-0.5">Temps de preparation entre chaque rendez-vous</p>
              </div>
              <NumberInput value={bookingBuffer} onChange={setBookingBuffer} min={0} max={120} suffix="minutes" />
            </div>

            <div className="border-t border-gray-800" />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-white font-medium">Reservation a l&apos;avance max</p>
                <p className="text-xs text-gray-500 mt-0.5">Nombre de jours maximum de prise de RDV en avance</p>
              </div>
              <NumberInput value={maxAdvanceDays} onChange={setMaxAdvanceDays} min={1} max={365} suffix="jours" />
            </div>
          </div>
        </Section>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-sm text-[#25D366] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
              Horaires enregistres
            </span>
          )}
          {!saved && <span />}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
