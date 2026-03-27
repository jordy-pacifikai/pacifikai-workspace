'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingBusinessCard from '@/components/booking/BookingBusinessCard';
import DemoBanner from '@/components/booking/DemoBanner';
import { isValidEmail } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DemoService {
  name: string;
  duration: number;
  price: number;
  description: string;
  is_active: boolean;
}

type Step = 'service' | 'date' | 'time' | 'info';

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCENT = '#25D366';
const ACCENT_BG = 'rgba(37, 211, 102, 0.12)';

const DEMO_BUSINESS = {
  name: 'Salon Hinano',
  bio: 'Salon de coiffure polynésien — Démonstration',
  timezone: 'Pacific/Tahiti',
  brand_color: ACCENT,
  hours: {
    mon: { open: '08:00', close: '17:00', is_open: true },
    tue: { open: '08:00', close: '17:00', is_open: true },
    wed: { open: '08:00', close: '17:00', is_open: true },
    thu: { open: '08:00', close: '17:00', is_open: true },
    fri: { open: '08:00', close: '17:00', is_open: true },
    sat: { open: '08:00', close: '17:00', is_open: true },
    sun: { is_open: false },
  } as Record<string, unknown>,
};

const DEMO_SERVICES: DemoService[] = [
  { name: 'Coupe homme', duration: 30, price: 2500, description: 'Coupe classique ou dégradé', is_active: true },
  { name: 'Coupe femme', duration: 45, price: 4500, description: 'Coupe, brushing, finitions', is_active: true },
  { name: 'Couleur complète', duration: 90, price: 8000, description: 'Coloration racines aux pointes', is_active: true },
  { name: 'Barbe & contours', duration: 20, price: 1500, description: 'Taille et rasage précis', is_active: true },
  { name: 'Soin kératine', duration: 60, price: 12000, description: 'Lissage et nutrition en profondeur', is_active: true },
];

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_LABELS: Record<string, string> = {
  sun: 'Dim', mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam',
};
const DAY_FULL_LABELS: Record<string, string> = {
  sun: 'Dimanche', mon: 'Lundi', tue: 'Mardi', wed: 'Mercredi',
  thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi',
};
const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} XPF`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isDayOpen(dayKey: string): boolean {
  const raw = DEMO_BUSINESS.hours[dayKey];
  if (!raw) return true;
  if (typeof raw === 'object' && raw !== null) {
    return (raw as { is_open?: boolean }).is_open !== false;
  }
  return true;
}

function buildAvailableDates(count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    const dayKey = DAY_KEYS[cursor.getDay()];
    if (dayKey && isDayOpen(dayKey)) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/** Generate demo time slots for a given duration (8h-17h, no API call) */
function generateDemoSlots(duration: number): string[] {
  const slots: string[] = [];
  const startMinutes = 8 * 60; // 08:00
  const endMinutes = 17 * 60;  // 17:00
  let current = startMinutes;
  while (current + duration <= endMinutes) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += 30; // 30-min intervals
  }
  return slots;
}

// ─── Step: Service Selection ────────────────────────────────────────────────

function ServiceStep({
  services,
  selected,
  onSelect,
  onNext,
}: {
  services: DemoService[];
  selected: DemoService | null;
  onSelect: (s: DemoService) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Choisissez un service</h2>
      {services.map((s) => {
        const isSelected = selected?.name === s.name;
        return (
          <button
            key={s.name}
            onClick={() => onSelect(s)}
            className="w-full text-left rounded-xl border p-4 transition-all"
            style={{
              borderColor: isSelected ? ACCENT : '#e5e7eb',
              backgroundColor: isSelected ? ACCENT_BG : '#fff',
              boxShadow: isSelected ? `0 0 0 1.5px ${ACCENT}` : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 text-sm">{s.name}</span>
              <span className="text-sm font-semibold" style={{ color: ACCENT }}>
                {formatPrice(s.price)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{s.description}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs text-gray-400">{formatDuration(s.duration)}</span>
            </div>
          </button>
        );
      })}

      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

// ─── Step: Date Selection ───────────────────────────────────────────────────

function DateStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const dates = useMemo(() => buildAvailableDates(14), []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Choisissez une date</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
        {dates.map((d) => {
          const ds = toDateString(d);
          const dayKey = DAY_KEYS[d.getDay()];
          const isSelected = selected === ds;
          const isToday = toDateString(new Date()) === ds;
          return (
            <button
              key={ds}
              onClick={() => onSelect(ds)}
              className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 min-w-[52px] transition-all flex-shrink-0"
              style={{
                backgroundColor: isSelected ? ACCENT : '#fff',
                border: `1px solid ${isSelected ? ACCENT : '#e5e7eb'}`,
                boxShadow: isSelected ? `0 0 0 1.5px ${ACCENT}` : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: isSelected ? '#000' : '#6b7280' }}
              >
                {dayKey ? DAY_LABELS[dayKey] : ''}
              </span>
              <span
                className="text-base font-bold"
                style={{ color: isSelected ? '#000' : '#111827' }}
              >
                {d.getDate()}
              </span>
              <span
                className="text-[10px]"
                style={{ color: isSelected ? 'rgba(0,0,0,0.6)' : '#9ca3af' }}
              >
                {MONTHS[d.getMonth()]}
              </span>
              {isToday && (
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: isSelected ? 'rgba(0,0,0,0.7)' : ACCENT }}
                >
                  Auj.
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400"
          >
            Retour
          </button>
          <button
            onClick={onNext}
            disabled={!selected}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Time Selection ───────────────────────────────────────────────────

function TimeStep({
  duration,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  duration: number;
  selected: string | null;
  onSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const slots = useMemo(() => generateDemoSlots(duration), [duration]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Choisissez un horaire</h2>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className="rounded-xl py-2.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isSelected ? ACCENT : '#fff',
                border: `1px solid ${isSelected ? ACCENT : '#e5e7eb'}`,
                color: isSelected ? '#000' : '#111827',
                boxShadow: isSelected ? `0 0 0 1.5px ${ACCENT}` : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400"
          >
            Retour
          </button>
          <button
            onClick={onNext}
            disabled={!selected}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Client Info ──────────────────────────────────────────────────────

function InfoStep({
  service,
  date,
  time,
  onBack,
  onSubmit,
}: {
  service: DemoService;
  date: string;
  time: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  const dateLabel = useMemo(() => {
    const d = new Date(`${date}T12:00:00`);
    const dayKey = DAY_KEYS[d.getDay()];
    return `${dayKey ? DAY_FULL_LABELS[dayKey] : ''} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }, [date]);

  function validate(): boolean {
    const errs: { name?: string; email?: string } = {};
    if (!clientName.trim()) errs.name = 'Votre prénom est requis.';
    if (clientEmail.trim() && !isValidEmail(clientEmail.trim())) {
      errs.email = 'Adresse email invalide.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Vos informations</h2>

      {/* Recap card */}
      <div className="rounded-xl border border-gray-100 bg-white p-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT_BG }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{service.name}</p>
          <p className="text-xs text-gray-400">{dateLabel} à {time} · {formatDuration(service.duration)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label htmlFor="demoName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            id="demoName"
            type="text"
            required
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Votre prénom"
            autoComplete="given-name"
            autoCapitalize="words"
            className="w-full rounded-xl bg-white border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{
              fontSize: '16px',
              borderColor: fieldErrors.name ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={(e) => {
              if (!fieldErrors.name) e.currentTarget.style.borderColor = ACCENT;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = fieldErrors.name ? '#ef4444' : '#e5e7eb';
            }}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="demoPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Téléphone <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <input
            id="demoPhone"
            type="tel"
            inputMode="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+689 87 XX XX XX"
            autoComplete="tel"
            className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{ fontSize: '16px' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="demoEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <input
            id="demoEmail"
            type="email"
            inputMode="email"
            value={clientEmail}
            onChange={(e) => {
              setClientEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="votre@email.com"
            autoComplete="email"
            className="w-full rounded-xl bg-white border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{
              fontSize: '16px',
              borderColor: fieldErrors.email ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={(e) => {
              if (!fieldErrors.email) e.currentTarget.style.borderColor = ACCENT;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = fieldErrors.email ? '#ef4444' : '#e5e7eb';
            }}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Cancellation info */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>Annulation gratuite jusqu&apos;à 24h avant le rendez-vous.</span>
      </div>

      {/* Sticky bottom nav */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={!clientName.trim()}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Success Modal ──────────────────────────────────────────────────────────

function SuccessModal({
  service,
  date,
  time,
  onClose,
}: {
  service: DemoService;
  date: string;
  time: string;
  onClose: () => void;
}) {
  const dateLabel = useMemo(() => {
    const d = new Date(`${date}T12:00:00`);
    const dayKey = DAY_KEYS[d.getDay()];
    return `${dayKey ? DAY_FULL_LABELS[dayKey] : ''} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }, [date]);

  const endTime = addMinutesToTime(time, service.duration);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center gap-5 animate-[fadeIn_0.3s_ease-out]" role="dialog" aria-modal="true" aria-labelledby="demo-confirm-title">
        {/* Animated check circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-[scaleIn_0.4s_ease-out]"
          style={{ backgroundColor: ACCENT_BG }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="animate-[drawCheck_0.5s_0.2s_ease-out_forwards]"
            style={{ opacity: 1 }}
          >
            <path
              d="M10 20l7 7 13-13"
              stroke={ACCENT}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center">
          <h2 id="demo-confirm-title" className="text-xl font-bold text-gray-900">
            Réservation confirmée !
          </h2>
          <p className="text-sm text-gray-500 mt-1.5">
            Vous avez un rendez-vous chez Salon Hinano
          </p>
        </div>

        {/* Recap card */}
        <div className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3v4M8 3v4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm font-medium text-gray-900">{dateLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Horaire</p>
              <p className="text-sm font-medium text-gray-900">{time} — {endTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Service</p>
              <p className="text-sm font-medium text-gray-900">{service.name}</p>
              <p className="text-xs text-gray-400">{formatDuration(service.duration)} · {formatPrice(service.price)}</p>
            </div>
          </div>
        </div>

        {/* Demo notice */}
        <div
          className="w-full rounded-xl p-3 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(59, 130, 246, 0.06) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            En situation réelle, votre client recevrait une confirmation WhatsApp automatique ici
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/signup"
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white text-center transition-all hover:opacity-90 shadow-lg no-underline"
          style={{ backgroundColor: '#16a34a' }}
        >
          Créer mon compte gratuit — 14 jours offerts
        </Link>

        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Recommencer la démo
        </button>
      </div>
    </div>
  );
}

// ─── Progress index mapping ─────────────────────────────────────────────────

function stepToProgressIndex(step: Step): number {
  if (step === 'service') return 0;
  if (step === 'date' || step === 'time') return 1;
  return 2; // 'info'
}

// ─── Main Demo Page ─────────────────────────────────────────────────────────

export default function DemoBookingPage() {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<DemoService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const progressIndex = stepToProgressIndex(step);

  const handleReset = useCallback(() => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSuccess(false);
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col relative"
      style={{ '--accent': ACCENT } as React.CSSProperties}
    >
      {/* Demo Banner — sticky top */}
      <DemoBanner
        text="Mode démonstration — Ce salon est fictif"
        ctaLabel="Créer mon compte gratuit"
        ctaHref="/signup"
      />

      {/* Header */}
      <header className="flex flex-col items-center pt-6 pb-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Ve&#x02BB;a</span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
        </div>
      </header>

      {/* Business card */}
      <BookingBusinessCard
        name={DEMO_BUSINESS.name}
        bio={DEMO_BUSINESS.bio}
        hours={DEMO_BUSINESS.hours}
        timezone={DEMO_BUSINESS.timezone}
        accent={ACCENT}
      />

      {/* Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-24">
        <BookingProgress currentStep={progressIndex} accent={ACCENT} />

        <div className="mt-2">
          {step === 'service' && (
            <ServiceStep
              services={DEMO_SERVICES}
              selected={selectedService}
              onSelect={setSelectedService}
              onNext={() => setStep('date')}
            />
          )}

          {step === 'date' && (
            <DateStep
              selected={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedTime(null);
              }}
              onNext={() => setStep('time')}
              onBack={() => setStep('service')}
            />
          )}

          {step === 'time' && selectedService && (
            <TimeStep
              duration={selectedService.duration}
              selected={selectedTime}
              onSelect={setSelectedTime}
              onNext={() => setStep('info')}
              onBack={() => setStep('date')}
            />
          )}

          {step === 'info' && selectedService && selectedDate && selectedTime && (
            <InfoStep
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              onBack={() => setStep('time')}
              onSubmit={() => setShowSuccess(true)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 pt-2">
        <p className="text-xs text-gray-400">
          Propulsé par{' '}
          <a
            href="https://vea.pacifikai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            style={{ color: ACCENT }}
          >
            Ve&#x02BB;a
          </a>
        </p>
      </footer>

      {/* Success modal */}
      {showSuccess && selectedService && selectedDate && selectedTime && (
        <SuccessModal
          service={selectedService}
          date={selectedDate}
          time={selectedTime}
          onClose={handleReset}
        />
      )}
    </div>
  );
}
