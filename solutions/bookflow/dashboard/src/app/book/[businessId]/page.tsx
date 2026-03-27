'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { useBookingI18n, type BookingLocale, type BookingTranslations } from '@/lib/i18n-booking';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingBusinessCard from '@/components/booking/BookingBusinessCard';
import { useBookingPersist, clearBookingState } from '@/lib/useBookingPersist';
import { sanitizeColor } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ServiceItem {
  name: string;
  duration: number;
  price: number;
  description?: string;
  is_active?: boolean;
}

// hours values can be an object { open, close, is_open } or a string "08:00-17:00" / "closed"
type HoursRecord = Record<string, unknown>;

interface BusinessData {
  id: string;
  name: string;
  services: ServiceItem[];
  hours: HoursRecord;
  timezone: string;
  logo_url?: string | null;
  bio?: string | null;
  brand_color?: string | null;
  cancellation_hours?: number | null;
}

type Step = 'service' | 'date' | 'time' | 'info';

// ─── Constants ──────────────────────────────────────────────────────────────

const TEAL = '#25D366';
const TEAL_BG = 'rgba(37, 211, 102, 0.12)';
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function getDayLabels(t: BookingTranslations): Record<string, string> {
  return {
    sun: t.daySun, mon: t.dayMon, tue: t.dayTue,
    wed: t.dayWed, thu: t.dayThu, fri: t.dayFri, sat: t.daySat,
  };
}

function getDayFullLabels(t: BookingTranslations): Record<string, string> {
  return {
    sun: t.dayFullSun, mon: t.dayFullMon, tue: t.dayFullTue,
    wed: t.dayFullWed, thu: t.dayFullThu, fri: t.dayFullFri, sat: t.dayFullSat,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number, t: BookingTranslations, locale: BookingLocale): string {
  if (price === 0) return t.free;
  return `${price.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} XPF`;
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

/** Returns yyyy-mm-dd for a Date in local time */
function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns true if the given day is open according to the hours record */
function isDayOpen(hours: HoursRecord, dayKey: string): boolean {
  const raw = hours[dayKey];
  if (!raw) return true; // no config = assume open
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { is_open?: boolean };
    return obj.is_open !== false;
  }
  const val = String(raw).trim();
  return val !== 'closed' && val !== 'ferme' && val !== '';
}

/** Build next N dates, skipping days that are closed */
function buildAvailableDates(hours: HoursRecord, count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < count) {
    const dayKey = DAY_KEYS[cursor.getDay()];
    if (dayKey && isDayOpen(hours, dayKey)) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function buildGcalUrl(
  businessName: string,
  serviceName: string,
  date: string,
  time: string,
  duration: number,
  t: BookingTranslations,
): string {
  const endTime = addMinutesToTime(time, duration);
  const dateCompact = date.replace(/-/g, '');
  const startCompact = `${dateCompact}T${time.replace(':', '')}00`;
  const endCompact = `${dateCompact}T${endTime.replace(':', '')}00`;
  const title = encodeURIComponent(`${serviceName} — ${businessName}`);
  const details = encodeURIComponent(t.bookedVia);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startCompact}/${endCompact}&details=${details}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-gray-200 animate-pulse ${className ?? ''}`}
    />
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

interface ServiceStepProps {
  services: ServiceItem[];
  selected: ServiceItem | null;
  onSelect: (s: ServiceItem) => void;
  onNext: () => void;
  t: BookingTranslations;
  locale: BookingLocale;
}

function ServiceStep({ services, selected, onSelect, onNext, t, locale }: ServiceStepProps) {
  const active = services.filter((s) => s.is_active !== false);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-800 mb-1">{t.selectService}</h2>
      {active.length === 0 && (
        <p className="text-sm text-gray-400">{t.noServices}</p>
      )}
      {active.map((s) => {
        const isSelected = selected?.name === s.name;
        return (
          <button
            key={s.name}
            onClick={() => onSelect(s)}
            className="w-full text-left rounded-xl border p-4 transition-all"
            style={{
              borderColor: isSelected ? 'var(--accent)' : '#e5e7eb',
              backgroundColor: isSelected ? TEAL_BG : '#fff',
              boxShadow: isSelected ? `0 0 0 1.5px var(--accent)` : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 text-sm">{s.name}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {formatPrice(s.price, t, locale)}
              </span>
            </div>
            {s.description && (
              <p className="text-xs text-gray-500 mt-1">{s.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs text-gray-400">{formatDuration(s.duration)}</span>
            </div>
          </button>
        );
      })}

      {/* Sticky bottom CTA on mobile */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}

interface DateStepProps {
  hours: HoursRecord;
  selected: string | null;
  onSelect: (date: string) => void;
  onNext: () => void;
  onBack: () => void;
  t: BookingTranslations;
}

function DateStep({ hours, selected, onSelect, onNext, onBack, t }: DateStepProps) {
  const dates = buildAvailableDates(hours, 14);
  const dayLabels = getDayLabels(t);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">{t.selectDate}</h2>

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
                backgroundColor: isSelected ? 'var(--accent)' : '#fff',
                border: `1px solid ${isSelected ? 'var(--accent)' : '#e5e7eb'}`,
                boxShadow: isSelected ? `0 0 0 1.5px var(--accent)` : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: isSelected ? '#000' : '#6b7280' }}
              >
                {dayKey ? dayLabels[dayKey] : ''}
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
                {t.months[d.getMonth()]}
              </span>
              {isToday && (
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: isSelected ? 'rgba(0,0,0,0.7)' : 'var(--accent)' }}
                >
                  {t.today}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sticky bottom nav */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400"
          >
            {t.back}
          </button>
          <button
            onClick={onNext}
            disabled={!selected}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimeStepProps {
  businessId: string;
  date: string;
  duration: number;
  selected: string | null;
  onSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  t: BookingTranslations;
}

function TimeStep({ businessId, date, duration, selected, onSelect, onNext, onBack, t }: TimeStepProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/book/${businessId}/slots?date=${date}&duration=${duration}`)
      .then((r) => r.json())
      .then((data: { slots?: string[] }) => {
        setSlots(data.slots ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [businessId, date, duration]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">{t.selectTime}</h2>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">{t.noSlots}</p>
          <p className="text-xs text-gray-400 mt-1">{t.pickAnotherDate}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => {
            const isSelected = selected === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelect(slot)}
                aria-pressed={isSelected}
                className="rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: isSelected ? 'var(--accent)' : '#fff',
                  border: `1px solid ${isSelected ? 'var(--accent)' : '#e5e7eb'}`,
                  color: isSelected ? '#000' : '#111827',
                  boxShadow: isSelected ? `0 0 0 1.5px var(--accent)` : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky bottom nav */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400"
          >
            {t.back}
          </button>
          <button
            onClick={onNext}
            disabled={!selected}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

interface InfoStepProps {
  businessId: string;
  service: ServiceItem;
  date: string;
  time: string;
  businessName: string;
  cancellationHours: number;
  onBack: () => void;
  onConfirmed?: () => void;
  t: BookingTranslations;
  locale: BookingLocale;
}

function InfoStep({ businessId, service, date, time, businessName, cancellationHours, onBack, onConfirmed, t, locale, initialName, initialPhone, initialEmail, onFieldChange }: InfoStepProps & {
  initialName?: string;
  initialPhone?: string;
  initialEmail?: string;
  onFieldChange?: (field: 'clientName' | 'clientPhone' | 'clientEmail', value: string) => void;
}) {
  const router = useRouter();
  const [clientName, setClientName] = useState(initialName ?? '');
  const [clientPhone, setClientPhone] = useState(initialPhone ?? '');
  const [clientEmail, setClientEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<{ id: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const dateLabel = (() => {
    const d = new Date(`${date}T12:00:00`);
    const dayKey = DAY_KEYS[d.getDay()];
    const dayFull = getDayFullLabels(t);
    return `${dayKey ? dayFull[dayKey] : ''} ${d.getDate()} ${t.months[d.getMonth()]}`;
  })();

  function isPhoneValid(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 6;
  }

  function validateFields(): boolean {
    const errs: { name?: string; phone?: string; email?: string } = {};
    if (!clientName.trim()) errs.name = 'Votre prénom est requis.';
    if (clientPhone.trim() && !isPhoneValid(clientPhone)) {
      errs.phone = t.phoneInvalid;
    }
    if (clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      errs.email = 'Adresse email invalide.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/book/${businessId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: service.name,
          date,
          time,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim() || undefined,
          clientEmail: clientEmail.trim() || undefined,
          businessName,
          price: service.price,
          duration: service.duration,
        }),
      });

      const data = (await res.json()) as { id?: string; error?: string; success?: boolean };

      if (!res.ok || !data.success) {
        setError(data.error ?? t.genericError);
        setLoading(false);
        return;
      }

      const newId = data.id ?? '';
      clearBookingState(businessId);
      onConfirmed?.();
      if (newId) {
        router.push(`/book/${businessId}/confirmation?id=${newId}`);
      } else {
        setConfirmed({ id: newId });
      }
    } catch {
      setError(t.networkError);
      setLoading(false);
    }
  }

  if (confirmed) {
    const gcalUrl = buildGcalUrl(businessName, service.name, date, time, service.duration, t);
    const endTime = addMinutesToTime(time, service.duration);

    const downloadVCard = () => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${businessName}`,
        'END:VCARD',
      ].join('\r\n');
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${businessName}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
      const shareUrl = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: t.bookAt(businessName),
            url: shareUrl,
          });
        } catch {
          // user cancelled or error — silently ignore
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t.linkCopied);
      }
    };

    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: TEAL_BG }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{t.confirmed}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.confirmedMsg(businessName)}</p>
        </div>

        <div className="w-full rounded-xl border border-gray-100 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TEAL_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3v4M8 3v4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.labelDate}</p>
              <p className="text-sm font-medium text-gray-900">{dateLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TEAL_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.labelTime}</p>
              <p className="text-sm font-medium text-gray-900">{time} — {endTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TEAL_BG }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.labelService}</p>
              <p className="text-sm font-medium text-gray-900">{service.name}</p>
              <p className="text-xs text-gray-400">{formatDuration(service.duration)} · {formatPrice(service.price, t, locale)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full grid grid-cols-3 gap-2">
          {/* Download vCard */}
          <button
            onClick={downloadVCard}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-xs font-semibold transition-all hover:opacity-80 border"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t.contact}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-xs font-semibold transition-all hover:opacity-80 border"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {t.share}
          </button>

          {/* Google Calendar */}
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-xs font-semibold transition-all hover:opacity-80 border no-underline"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {t.calendar}
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {t.reference} {confirmed.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 mb-1">{t.yourInfo}</h2>

      {/* Recap card */}
      <div className="rounded-xl border border-gray-100 bg-white p-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TEAL_BG }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{service.name}</p>
          <p className="text-xs text-gray-400">{dateLabel} {t.dateAtTime} {time} · {formatDuration(service.duration)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* First name */}
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t.firstName} <span className="text-red-500">*</span>
          </label>
          <input
            id="clientName"
            type="text"
            required
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              onFieldChange?.('clientName', e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder={t.firstNamePlaceholder}
            autoComplete="given-name"
            autoCapitalize="words"
            className="w-full rounded-xl bg-white border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{
              fontSize: '16px',
              borderColor: fieldErrors.name ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={(e) => {
              if (!fieldErrors.name) e.currentTarget.style.borderColor = 'var(--accent)';
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
          <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t.phone} <span className="text-gray-400 text-xs font-normal">{t.optional}</span>
          </label>
          <input
            id="clientPhone"
            type="tel"
            inputMode="tel"
            value={clientPhone}
            onChange={(e) => {
              setClientPhone(e.target.value);
              onFieldChange?.('clientPhone', e.target.value);
              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder={t.phonePlaceholder}
            autoComplete="tel"
            className="w-full rounded-xl bg-white border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{
              fontSize: '16px',
              borderColor: fieldErrors.phone ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={(e) => {
              if (!fieldErrors.phone) e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = fieldErrors.phone ? '#ef4444' : '#e5e7eb';
            }}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {fieldErrors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
            {t.email} <span className="text-gray-400 text-xs font-normal">{t.optional}</span>
          </label>
          <input
            id="clientEmail"
            type="email"
            inputMode="email"
            value={clientEmail}
            onChange={(e) => {
              setClientEmail(e.target.value);
              onFieldChange?.('clientEmail', e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            className="w-full rounded-xl bg-white border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            style={{
              fontSize: '16px',
              borderColor: fieldErrors.email ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={(e) => {
              if (!fieldErrors.email) e.currentTarget.style.borderColor = 'var(--accent)';
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

      {/* Global API error */}
      {error && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}

      {cancellationHours > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>{t.cancelBefore(cancellationHours)}</span>
        </div>
      )}

      {/* Sticky bottom nav */}
      <div className="sticky bottom-0 pt-3 pb-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 mt-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:border-gray-400 disabled:opacity-50"
          >
            {t.back}
          </button>
          <button
            type="submit"
            disabled={loading || !clientName.trim() || (!!clientPhone.trim() && !isPhoneValid(clientPhone))}
            className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-black transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                {t.confirming}
              </>
            ) : (
              t.confirm
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

// Map wizard Step to 0-based progress index
// service=0, date=1, time=1 (date+time same step visually), info=2
function stepToProgressIndex(step: Step): number {
  if (step === 'service') return 0;
  if (step === 'date' || step === 'time') return 1;
  return 2; // 'info'
}

export default function BookingPage({
  params,
}: {
  params: { businessId: string };
}) {
  const { businessId } = params;

  const [locale, setLocale] = useState<BookingLocale>('fr');
  const t = useBookingI18n(locale);

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  // ─── Persisted form state ────────────────────────────────────────────────────
  const { state: persisted, setState: setPersisted, hydrated } = useBookingPersist(businessId);

  const step = (persisted.step as Step) ?? 'service';
  const selectedService = persisted.serviceName
    ? (business?.services ?? []).find((s) => s.name === persisted.serviceName) ?? null
    : null;
  const selectedDate = persisted.selectedDate;
  const selectedTime = persisted.selectedTime;

  const setStep = (s: Step) => setPersisted({ step: s });
  const setSelectedService = (s: ServiceItem | null) => setPersisted({ serviceName: s?.name ?? null });
  const setSelectedDate = (d: string | null) => setPersisted({ selectedDate: d });
  const setSelectedTime = (t: string | null) => setPersisted({ selectedTime: t });

  // ─── Tracking (fire-and-forget) ─────────────────────────────────────────────
  const trackEvent = useCallback(
    (event: string) => {
      fetch(`/api/book/${businessId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      }).catch(() => {});
    },
    [businessId],
  );

  const fetchBusiness = useCallback(() => {
    fetch(`/api/book/${businessId}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: BusinessData) => {
        setBusiness(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError('__INVALID_LINK__');
        setLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  // Track page view once on mount
  useEffect(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  const accent = sanitizeColor(business?.brand_color, TEAL);
  const progressIndex = stepToProgressIndex(step);

  // Don't render until sessionStorage is hydrated to avoid flicker
  if (!hydrated) return null;

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col relative"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/80 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 transition-all shadow-sm"
        aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {t.switchLang}
      </button>

      {/* Header — Ve'a brand mark only */}
      <header className="flex flex-col items-center pt-8 pb-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Ve&#x02BB;a</span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </div>
      </header>

      {/* Business info card (shown once loaded) */}
      {loading ? (
        <div className="mx-4 mt-1 mb-2">
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
            <SkeletonBlock className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-36" />
              <SkeletonBlock className="h-2.5 w-24" />
            </div>
          </div>
        </div>
      ) : business ? (
        <BookingBusinessCard
          name={business.name}
          logoUrl={business.logo_url}
          bio={business.bio}
          hours={business.hours ?? {}}
          timezone={business.timezone}
          accent={accent}
          businessId={businessId}
        />
      ) : null}

      {/* Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-4 mt-4">
            {/* Progress skeleton */}
            <div className="flex items-center justify-center gap-2 py-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center">
                  <SkeletonBlock className="w-7 h-7 rounded-full" />
                  {i < 2 && <SkeletonBlock className="w-8 h-0.5 mx-1" />}
                </div>
              ))}
            </div>
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : loadError ? (
          <div className="mt-12 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold mb-1">{t.invalidLink}</p>
            <p className="text-sm text-gray-500">{t.invalidLinkMsg}</p>
          </div>
        ) : (
          <>
            {/* Progress indicator (replaces old Stepper) */}
            <BookingProgress currentStep={progressIndex} accent={accent} />

            <div className="mt-2">
              {step === 'service' && business && (
                <ServiceStep
                  services={business.services ?? []}
                  selected={selectedService}
                  onSelect={(s) => setSelectedService(s)}
                  onNext={() => {
                    trackEvent('service_selected');
                    setStep('date');
                  }}
                  t={t}
                  locale={locale}
                />
              )}

              {step === 'date' && business && (
                <DateStep
                  hours={business.hours ?? {}}
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  onNext={() => {
                    trackEvent('date_selected');
                    setStep('time');
                  }}
                  onBack={() => setStep('service')}
                  t={t}
                />
              )}

              {step === 'time' && selectedDate && selectedService && (
                <TimeStep
                  businessId={businessId}
                  date={selectedDate}
                  duration={selectedService.duration}
                  selected={selectedTime}
                  onSelect={(time) => setSelectedTime(time)}
                  onNext={() => setStep('info')}
                  onBack={() => setStep('date')}
                  t={t}
                />
              )}

              {step === 'info' && selectedService && selectedDate && selectedTime && business && (
                <InfoStep
                  businessId={businessId}
                  service={selectedService}
                  date={selectedDate}
                  time={selectedTime}
                  businessName={business.name}
                  cancellationHours={typeof business.cancellation_hours === 'number' ? business.cancellation_hours : 24}
                  onBack={() => setStep('time')}
                  onConfirmed={() => trackEvent('booking_confirmed')}
                  t={t}
                  locale={locale}
                  initialName={persisted.clientName}
                  initialPhone={persisted.clientPhone}
                  initialEmail={persisted.clientEmail}
                  onFieldChange={(field, value) => setPersisted({ [field]: value })}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 pt-2">
        <p className="text-xs text-gray-400">
          {t.poweredBy}{' '}
          <a
            href="https://vea.pacifikai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            Ve&#x02BB;a
          </a>
        </p>
      </footer>
    </div>
  );
}
