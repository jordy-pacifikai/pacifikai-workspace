import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBookingRef } from '@/lib/booking-ref';
import { generatePortalToken } from '@/lib/portal-token';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeColor } from '@/lib/utils';
import DownloadICSButton from './DownloadICSButton';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppointmentRow {
  id: string;
  business_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  service: string | null;
  appointment_date: string;
  time_slot: string;
  end_time: string | null;
  status: string;
}

interface BusinessRow {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  config: Record<string, unknown>;
  phone: string;
  services: Array<{ name: string; duration: number; price: number }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FR_MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const FR_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function formatDateFr(dateStr: string): string {
  // dateStr = 'YYYY-MM-DD'
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const dayName = FR_DAYS[date.getDay()];
  const month = FR_MONTHS[Number(m) - 1];
  return `${dayName} ${d} ${month} ${y}`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem > 0 ? `${h}h${String(rem).padStart(2, '0')}` : `${h}h`;
}

function addMinutes(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function getServiceDuration(
  services: BusinessRow['services'],
  serviceName: string | null,
): number {
  if (!serviceName) return 60;
  const found = services.find((s) => s.name === serviceName);
  return found?.duration ?? 60;
}

// ─── Reference Card (styled visual, replaces QR code) ───────────────────────

function BookingReferenceCard({
  ref: bookingRef,
  confirmUrl,
  accent,
}: {
  ref: string;
  confirmUrl: string;
  accent: string;
}) {
  return (
    <div
      className="w-full rounded-2xl p-5 flex flex-col items-center gap-3"
      style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}30` }}
    >
      {/* QR placeholder icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}20` }}
        aria-hidden="true"
      >
        {/* QR code icon SVG */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="5" height="5" />
          <rect x="16" y="3" width="5" height="5" />
          <rect x="3" y="16" width="5" height="5" />
          <path d="M21 16h-3v3M21 21v.01M16 16v.01M16 21h1M11 3v3M11 8v.01M3 11h3M8 11v3M11 11v.01" />
        </svg>
      </div>

      {/* Reference number */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Référence de réservation</p>
        <p
          className="text-2xl font-black tracking-widest font-mono"
          style={{ color: accent }}
        >
          {bookingRef}
        </p>
      </div>

      {/* Confirmation URL */}
      <p className="text-xs text-gray-600 text-center break-all max-w-[280px]">
        {confirmUrl}
      </p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { businessId } = await params;
  const { id: appointmentId } = await searchParams;

  if (!appointmentId) notFound();

  const admin = supabaseAdmin();

  const [{ data: appt }, { data: biz }] = await Promise.all([
    admin
      .from('bookbot_appointments')
      .select('id, business_id, client_name, client_phone, client_email, service, appointment_date, time_slot, end_time, status')
      .eq('id', appointmentId)
      .single<AppointmentRow>(),
    admin
      .from('bookbot_businesses')
      .select('id, name, logo_url, brand_color, config, phone, services')
      .eq('id', businessId)
      .single<BusinessRow>(),
  ]);

  if (!appt || !biz) notFound();

  // Portal link: look up client by phone to get their ID
  let portalUrl: string | null = null;
  if (appt.client_phone) {
    const { data: clientRow } = await admin
      .from('bookbot_clients')
      .select('id')
      .eq('business_id', businessId)
      .eq('phone', appt.client_phone)
      .single<{ id: string }>();

    if (clientRow?.id) {
      const portalToken = generatePortalToken(clientRow.id);
      const baseUrlForPortal = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vea.pacifikai.com';
      portalUrl = `${baseUrlForPortal}/portal/${portalToken}`;
    }
  }

  const accent = sanitizeColor(biz.brand_color, '#25D366');
  const bookingRef = getBookingRef(appt.id);

  const duration = getServiceDuration(biz.services ?? [], appt.service);
  const endTime = appt.end_time?.slice(0, 5) ?? addMinutes(appt.time_slot, duration);
  const startTime = appt.time_slot.slice(0, 5);
  const dateLabel = formatDateFr(appt.appointment_date);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vea.pacifikai.com';
  const confirmUrl = `${baseUrl}/book/${businessId}/confirmation?id=${appt.id}`;
  const bookingPageUrl = `${baseUrl}/book/${businessId}`;

  // ICS data for client component
  const icsData = {
    title: `${appt.service ?? 'Rendez-vous'} — ${biz.name}`,
    description: `Rendez-vous confirmé chez ${biz.name}. Référence : ${bookingRef}`,
    start: appt.appointment_date,
    startTime,
    end: appt.appointment_date,
    endTime,
    location: (biz.config?.address as string | undefined) ?? '',
  };

  // Business address from config
  const address = (biz.config?.address as string | undefined) ?? null;

  // Logo initials
  const initials = biz.name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Header */}
      <header className="flex flex-col items-center pt-8 pb-2 px-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-white tracking-tight">Ve&#x02BB;a</span>
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        {/* Business logo */}
        {biz.logo_url ? (
          <Image
            src={biz.logo_url}
            alt={biz.name}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 mb-2"
            style={{ borderColor: accent }}
            priority
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-black mb-2"
            style={{ backgroundColor: accent }}
          >
            {initials}
          </div>
        )}
        <p className="text-base font-semibold text-white text-center">{biz.name}</p>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-10">

        {/* Success header */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accent}20` }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Confirmé">
              <path d="M6 16l7 7 13-13" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Réservation confirmée !</h1>
            <p className="text-sm text-gray-400 mt-1">
              Votre rendez-vous chez <strong className="text-white">{biz.name}</strong> est enregistré.
            </p>
          </div>
        </div>

        {/* Appointment details card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Détails du rendez-vous
          </h2>

          {/* Service */}
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accent}15` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Service</p>
              <p className="text-sm font-semibold text-white">{appt.service ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDuration(duration)}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accent}15` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-semibold text-white capitalize">{dateLabel}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accent}15` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Heure</p>
              <p className="text-sm font-semibold text-white">{startTime} — {endTime}</p>
            </div>
          </div>
        </div>

        {/* Client + Business info */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</h2>
            <p className="text-sm font-semibold text-white">{appt.client_name}</p>
            {appt.client_phone && (
              <p className="text-xs text-gray-400">{appt.client_phone}</p>
            )}
            {appt.client_email && (
              <p className="text-xs text-gray-400">{appt.client_email}</p>
            )}
          </div>

          {/* Business */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Établissement</h2>
            <p className="text-sm font-semibold text-white">{biz.name}</p>
            {biz.phone && (
              <p className="text-xs text-gray-400">{biz.phone}</p>
            )}
            {address && (
              <p className="text-xs text-gray-400">{address}</p>
            )}
          </div>
        </div>

        {/* Reference card */}
        <div className="mt-4">
          <BookingReferenceCard
            ref={bookingRef}
            confirmUrl={confirmUrl}
            accent={accent}
          />
        </div>

        {/* CTA buttons */}
        <div className="mt-5 space-y-3">
          {/* Download ICS — client component for file download */}
          <DownloadICSButton icsData={icsData} accent={accent} />

          {/* Manage bookings — client portal */}
          {portalUrl && (
            <Link
              href={portalUrl}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: accent }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Gérer mes rendez-vous
            </Link>
          )}

          {/* Reschedule */}
          <Link
            href={`/book/${businessId}/reschedule?id=${appt.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold border transition-colors"
            style={{ borderColor: `${accent}50`, color: accent }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Modifier le rendez-vous
          </Link>

          {/* Back to booking */}
          <Link
            href={bookingPageUrl}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour à la page de réservation
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 pt-2">
        <p className="text-xs text-gray-700">
          Propulsé par{' '}
          <a
            href="https://vea.pacifikai.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accent }}
            className="hover:opacity-80 transition-opacity"
          >
            Ve&#x02BB;a
          </a>
        </p>
      </footer>
    </div>
  );
}
