'use client';

// ─── BookingBusinessCard ─────────────────────────────────────────────────────
// Compact business info card shown at the top of the public booking page.
// Shows: name, logo/avatar, avg rating (if any), open/closed status.
// Light-themed — not the dark dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Image from 'next/image';

// hours values can be an object { open, close, is_open } or a string "08:00-17:00" / "closed"
type HoursRecord = Record<string, unknown>;

interface ReviewSummary {
  avg: number;
  count: number;
}

interface BookingBusinessCardProps {
  name: string;
  logoUrl?: string | null;
  bio?: string | null;
  hours: HoursRecord;
  timezone?: string;
  accent?: string;
  /** Pass the businessId to fetch review stats */
  businessId?: string;
}

// Day keys matching JS Date.getDay() (0 = Sunday)
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOpenStatus(hours: HoursRecord, timezone?: string): 'open' | 'closed' | 'unknown' {
  try {
    const now = timezone
      ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
      : new Date();

    const dayKey = DAY_KEYS[now.getDay()];
    if (!dayKey) return 'unknown';

    const raw = hours[dayKey];
    if (!raw) return 'unknown'; // no config — don't guess

    // Handle string format: "closed" / "ferme" / "08:00-17:00"
    if (typeof raw === 'string') {
      const val = raw.trim().toLowerCase();
      if (val === 'closed' || val === 'ferme' || val === '') return 'closed';
      // Parse "HH:MM-HH:MM"
      const match = val.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
      if (match) {
        return isNowBetween(match[1]!, match[2]!, now) ? 'open' : 'closed';
      }
      return 'unknown';
    }

    // Handle object format: { is_open, open, close }
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as { is_open?: boolean; open?: string; close?: string };
      if (obj.is_open === false) return 'closed';
      if (obj.open && obj.close) {
        return isNowBetween(obj.open, obj.close, now) ? 'open' : 'closed';
      }
      if (obj.is_open === true) return 'open';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function isNowBetween(openStr: string, closeStr: string, now: Date): boolean {
  const [oh = 0, om = 0] = openStr.split(':').map(Number);
  const [ch = 0, cm = 0] = closeStr.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function StarRating({ avg, count, accent }: { avg: number; count: number; accent: string }) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.4;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && half);
          return (
            <svg
              key={i}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={filled ? accent : 'none'}
              stroke={filled ? accent : '#d1d5db'}
              strokeWidth="2"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-semibold" style={{ color: accent }}>
        {avg.toFixed(1)}
      </span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingBusinessCard({
  name,
  logoUrl,
  bio,
  hours,
  timezone,
  accent = '#25D366',
  businessId,
}: BookingBusinessCardProps) {
  const [reviews, setReviews] = useState<ReviewSummary | null>(null);
  const openStatus = getOpenStatus(hours, timezone);

  // Fetch review summary (fire once, non-blocking)
  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/book/${businessId}/reviews`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { avg?: number; count?: number } | null) => {
        if (data && typeof data.avg === 'number' && typeof data.count === 'number' && data.count > 0) {
          setReviews({ avg: data.avg, count: data.count });
        }
      })
      .catch(() => {});
  }, [businessId]);

  // Avatar initials (max 2 chars)
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm mx-4 mb-2">
      {/* Logo / Avatar */}
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={48}
          height={48}
          className="rounded-full object-cover border-2 flex-shrink-0"
          style={{ borderColor: accent }}
          priority
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
          style={{ backgroundColor: accent }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>

        {bio && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{bio}</p>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Open / Closed badge */}
          {openStatus !== 'unknown' && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: openStatus === 'open' ? 'rgba(37,211,102,0.12)' : 'rgba(239,68,68,0.1)',
                color: openStatus === 'open' ? '#16a34a' : '#dc2626',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: openStatus === 'open' ? '#16a34a' : '#dc2626' }}
              />
              {openStatus === 'open' ? 'Ouvert' : 'Fermé'}
            </span>
          )}

          {/* Star rating */}
          {reviews && (
            <StarRating avg={reviews.avg} count={reviews.count} accent={accent} />
          )}
        </div>
      </div>
    </div>
  );
}
