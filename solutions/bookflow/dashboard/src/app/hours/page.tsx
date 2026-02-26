'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, Coffee, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import { cn } from '@/lib/utils';
import type { OpeningHours } from '@/types/database';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayKey = typeof DAY_ORDER[number];

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const DEFAULT_HOURS: OpeningHours = Object.fromEntries(
  DAY_ORDER.map((d) => [d, { open: '09:00', close: '18:00', is_open: d !== 'sunday' }]),
);

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

export default function HoursPage() {
  const { businessId, businessName } = useAppStore();
  const { data: business, isLoading } = useBusiness(businessId);
  const { mutate: updateBusiness, isPending } = useUpdateBusiness(businessId);

  // Local state for editing
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [bookingBuffer, setBookingBuffer] = useState(0);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [saved, setSaved] = useState(false);

  // Sync from API data once loaded
  useEffect(() => {
    if (!business) return;
    if (business.opening_hours) setHours(business.opening_hours);
    if (business.break_time) {
      setBreakStart(business.break_time.start ?? '12:00');
      setBreakEnd(business.break_time.end ?? '13:00');
    }
    if (business.default_slot_duration) setSlotDuration(business.default_slot_duration);
    if (business.booking_buffer != null) setBookingBuffer(business.booking_buffer);
    if (business.max_advance_booking_days) setMaxAdvanceDays(business.max_advance_booking_days);
  }, [business]);

  function updateDay(day: DayKey, field: 'is_open' | 'open' | 'close', value: boolean | string) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  function handleSave() {
    updateBusiness(
      {
        opening_hours: hours,
        break_time: { start: breakStart, end: breakEnd },
        default_slot_duration: slotDuration,
        booking_buffer: bookingBuffer,
        max_advance_booking_days: maxAdvanceDays,
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

        {/* Opening hours grid */}
        <Section icon={Calendar} title="Horaires d'ouverture">
          <div className="space-y-3">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[120px_60px_1fr] gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-800">
              <span>Jour</span>
              <span>Ouvert</span>
              <span>Plages horaires</span>
            </div>

            {DAY_ORDER.map((day) => {
              const slot = hours[day] ?? { open: '09:00', close: '18:00', is_open: false };
              return (
                <div
                  key={day}
                  className={cn(
                    'grid sm:grid-cols-[120px_60px_1fr] gap-3 sm:gap-4 items-center py-2',
                    'border-b border-gray-800/60 last:border-0',
                  )}
                >
                  {/* Day name */}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      slot.is_open ? 'text-white' : 'text-gray-500',
                    )}
                  >
                    {DAY_LABELS[day]}
                  </span>

                  {/* Toggle */}
                  <Toggle
                    checked={slot.is_open}
                    onChange={(v) => updateDay(day, 'is_open', v)}
                    label={`${DAY_LABELS[day]} ouvert`}
                  />

                  {/* Time range */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimeInput
                      value={slot.open ?? '09:00'}
                      onChange={(v) => updateDay(day, 'open', v)}
                      disabled={!slot.is_open}
                    />
                    <span className="text-gray-500 text-sm">a</span>
                    <TimeInput
                      value={slot.close ?? '18:00'}
                      onChange={(v) => updateDay(day, 'close', v)}
                      disabled={!slot.is_open}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Break time */}
        <Section icon={Coffee} title="Pause dejeuner">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-400 w-24">Pause de</span>
            <TimeInput value={breakStart} onChange={setBreakStart} />
            <span className="text-sm text-gray-500">a</span>
            <TimeInput value={breakEnd} onChange={setBreakEnd} />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Aucun rendez-vous ne sera propose durant cette plage horaire.
          </p>
        </Section>

        {/* Booking settings */}
        <Section icon={Clock} title="Parametres de reservation">
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-white font-medium">Duree des creneaux</p>
                <p className="text-xs text-gray-500 mt-0.5">Duree par defaut d'un rendez-vous</p>
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
                <p className="text-sm text-white font-medium">Reservation a l'avance max</p>
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
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
