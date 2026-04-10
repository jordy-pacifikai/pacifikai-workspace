'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppointmentData {
  id: string;
  appointment_date: string;
  time_slot: string;
  service: string;
  client_name: string;
  client_email: string | null;
  business_id: string;
  status: string;
}

interface BusinessData {
  id: string;
  name: string;
  hours: Record<string, unknown>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TEAL = '#25D366';
const TEAL_BG = 'rgba(37, 211, 102, 0.12)';

const DAY_LABELS: Record<string, string> = {
  sun: 'Dim', mon: 'Lun', tue: 'Mar',
  wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam',
};
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_FR = [
  'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
  'jul', 'aoû', 'sep', 'oct', 'nov', 'déc',
];
const MONTH_FR_LONG = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isDayOpen(hours: Record<string, unknown>, dayKey: string): boolean {
  const raw = hours[dayKey];
  if (!raw) return true;
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { is_open?: boolean };
    return obj.is_open !== false;
  }
  const val = String(raw).trim();
  return val !== 'closed' && val !== 'ferme' && val !== '';
}

function buildAvailableDates(hours: Record<string, unknown>, count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Skip today — reschedule at least tomorrow
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < count) {
    const dayKey = DAY_KEYS[cursor.getDay()];
    if (dayKey && isDayOpen(hours, dayKey)) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const dayKey = DAY_KEYS[d.getDay()];
  const dayFull: Record<string, string> = {
    sun: 'Dimanche', mon: 'Lundi', tue: 'Mardi',
    wed: 'Mercredi', thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi',
  };
  return `${dayKey ? dayFull[dayKey] : ''} ${d.getDate()} ${MONTH_FR_LONG[d.getMonth()]}`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`rounded-xl bg-gray-800 animate-pulse ${className ?? ''}`} />;
}

// ─── Public Supabase (anon key) ───────────────────────────────────────────────

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReschedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ appointment_id?: string }>;
}) {
  const { businessId } = React.use(params);
  const { appointment_id } = React.use(searchParams);
  const appointmentId = appointment_id ?? '';

  // ── Data states ──
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Selection states ──
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Slots ──
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ── Submit ──
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // ─── Load appointment + business ──────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!appointmentId) {
      setLoadError('Lien de reprogrammation invalide.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getPublicClient();

      // Fetch appointment (anon key — RLS must allow public select by id)
      const { data: appt, error: apptErr } = await supabase
        .from('bookbot_appointments')
        .select('id, appointment_date, time_slot, service, client_name, client_email, business_id, status')
        .eq('id', appointmentId)
        .single();

      if (apptErr || !appt) {
        setLoadError('Rendez-vous introuvable. Vérifiez votre lien.');
        setLoading(false);
        return;
      }

      // Verify the appointment belongs to this business
      const { data: biz, error: bizErr } = await supabase
        .from('bookbot_businesses')
        .select('id, name, hours')
        .eq('id', appt.business_id)
        .single();

      if (bizErr || !biz || biz.id !== appt.business_id) {
        setLoadError('Ce lien de reprogrammation est invalide.');
        setLoading(false);
        return;
      }

      if (appt.status === 'cancelled') {
        setLoadError('Ce rendez-vous a déjà été annulé.');
        setLoading(false);
        return;
      }

      setAppointment(appt as AppointmentData);
      setBusiness(biz as BusinessData);
      setLoading(false);
    } catch {
      setLoadError('Impossible de charger vos informations. Vérifiez votre connexion.');
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Load slots when date changes ─────────────────────────────────────────

  useEffect(() => {
    if (!selectedDate || !business || !appointment) return;

    setSlotsLoading(true);
    setSelectedTime(null);

    // Estimate duration: we don't store it on appointment — default 30 min
    // The slots API will use the duration param
    fetch(`/api/book/${businessId}/slots?date=${selectedDate}&duration=30`)
      .then((r) => r.json())
      .then((data: { slots?: string[] }) => {
        setSlots(data.slots ?? []);
        setSlotsLoading(false);
      })
      .catch(() => {
        setSlots([]);
        setSlotsLoading(false);
      });
  }, [selectedDate, businessId, business, appointment]);

  // ─── Submit reschedule ────────────────────────────────────────────────────

  async function handleConfirm() {
    if (!selectedDate || !selectedTime || !appointment) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/book/${businessId}/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: selectedDate,
          newTime: selectedTime,
          clientEmail: appointment.client_email,
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setSubmitError(data.error ?? 'Une erreur est survenue. Veuillez réessayer.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setSubmitError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      setSubmitting(false);
    }
  }

  // ─── Render: loading ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header businessName="" />
        <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-8">
          <div className="flex flex-col gap-4 mt-8">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-12 w-48" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-20 w-14 flex-shrink-0" />)}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonBlock key={i} className="h-10" />)}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Render: error ────────────────────────────────────────────────────────

  if (loadError || !appointment || !business) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header businessName="" />
        <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-8">
          <div className="mt-12 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Lien invalide</p>
            <p className="text-sm text-gray-500">{loadError || 'Une erreur est survenue.'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Render: success ──────────────────────────────────────────────────────

  if (success && selectedDate && selectedTime) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header businessName={business.name} />
        <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-8">
          <div className="flex flex-col items-center gap-5 py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: TEAL_BG }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16l7 7 13-13" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-white">RDV modifié avec succès !</h2>
              <p className="text-sm text-gray-400 mt-1">Votre rendez-vous a été reprogrammé</p>
            </div>

            <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TEAL_BG }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3v4M8 3v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nouvelle date</p>
                  <p className="text-sm font-medium text-white">{formatDateLabel(selectedDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TEAL_BG }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nouvel horaire</p>
                  <p className="text-sm font-medium text-white">{selectedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TEAL_BG }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M8 12l2.5 2.5L16 9" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="text-sm font-medium text-white">{appointment.service}</p>
                </div>
              </div>
            </div>

            {appointment.client_email && (
              <p className="text-xs text-gray-500 text-center">
                Une confirmation a été envoyée à {appointment.client_email}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Render: reschedule flow ──────────────────────────────────────────────

  const availableDates = buildAvailableDates(business.hours, 14);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header businessName={business.name} />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-8">
        <div className="flex flex-col gap-6 mt-6">

          {/* Current appointment recap */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Votre RDV actuel</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TEAL_BG }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3v4M8 3v4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{appointment.service}</p>
                <p className="text-xs text-gray-400">
                  {formatDateLabel(appointment.appointment_date)} à {appointment.time_slot}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">avec {business.name}</p>
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Choisissez une nouvelle date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
              {availableDates.map((d) => {
                const ds = toDateString(d);
                const dayKey = DAY_KEYS[d.getDay()];
                const isSelected = selectedDate === ds;
                return (
                  <button
                    key={ds}
                    onClick={() => setSelectedDate(ds)}
                    className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 min-w-[52px] transition-all flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? TEAL : 'rgb(17 24 39)',
                      border: `1px solid ${isSelected ? TEAL : 'rgb(31 41 55)'}`,
                    }}
                  >
                    <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#000' : 'rgb(107 114 128)' }}>
                      {dayKey ? DAY_LABELS[dayKey] : ''}
                    </span>
                    <span className="text-base font-bold" style={{ color: isSelected ? '#000' : 'white' }}>
                      {d.getDate()}
                    </span>
                    <span className="text-[10px]" style={{ color: isSelected ? 'rgba(0,0,0,0.6)' : 'rgb(107 114 128)' }}>
                      {MONTH_FR[d.getMonth()]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          {selectedDate && (
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Choisissez un horaire</h2>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => <SkeletonBlock key={i} className="h-10" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-400">Aucun créneau disponible pour cette date.</p>
                  <p className="text-xs text-gray-600 mt-1">Choisissez une autre date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className="rounded-xl py-2.5 text-sm font-medium transition-all"
                        style={{
                          backgroundColor: isSelected ? TEAL : 'rgb(17 24 39)',
                          border: `1px solid ${isSelected ? TEAL : 'rgb(31 41 55)'}`,
                          color: isSelected ? '#000' : 'white',
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <p className="text-sm text-red-400 rounded-lg bg-red-950 border border-red-900 px-3 py-2">
              {submitError}
            </p>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || submitting}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40"
            style={{ backgroundColor: TEAL }}
          >
            {submitting ? 'Modification en cours...' : 'Confirmer le nouveau créneau'}
          </button>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── Layout sub-components ───────────────────────────────────────────────────

function Header({ businessName }: { businessName: string }) {
  return (
    <header className="flex flex-col items-center pt-8 pb-2 px-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl font-bold text-white tracking-tight">Ve&#x02BB;a</span>
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAL }} />
      </div>
      {businessName && (
        <p className="text-sm text-gray-400 text-center">{businessName}</p>
      )}
      <p className="text-xs text-gray-600 mt-0.5">Modifier mon rendez-vous</p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="text-center pb-6 pt-2">
      <p className="text-xs text-gray-700">
        Propulsé par{' '}
        <a
          href="https://vea.pacifikai.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: TEAL }}
          className="hover:text-gray-500 transition-colors"
        >
          Ve&#x02BB;a
        </a>
      </p>
    </footer>
  );
}
