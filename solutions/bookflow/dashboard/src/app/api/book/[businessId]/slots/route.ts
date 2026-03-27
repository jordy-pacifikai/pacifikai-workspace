import { NextResponse } from 'next/server';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveBusinessId } from '@/lib/resolve-business';
import { logger } from '@/lib/logger';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// ─── Parse one day entry from bookbot_businesses.hours ───────────────────────
// Handles:
//   Object: { open: "08:00", close: "17:00", is_open: true }
//   String: "08:00-17:00" | "08:00-12:00,13:00-17:00" | "closed"
function parseDayRange(raw: unknown): { ranges: Array<{ open: string; close: string }> } {
  if (!raw) return { ranges: [] };

  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { open?: string; close?: string; is_open?: boolean };
    if (obj.is_open === false) return { ranges: [] };
    if (obj.open && obj.close) return { ranges: [{ open: obj.open, close: obj.close }] };
    return { ranges: [] };
  }

  const val = String(raw).trim();
  if (!val || val === 'closed' || val === 'ferme') return { ranges: [] };

  const parts = val.split(',').map((r) => r.trim());
  const ranges: Array<{ open: string; close: string }> = [];

  if (parts.length === 2) {
    // "08:00-12:00,13:00-17:00" — morning and afternoon
    const [r0, r1] = parts;
    const [open, breakStart] = (r0 ?? '').split('-');
    const [breakEnd, close] = (r1 ?? '').split('-');
    if (open && breakStart) ranges.push({ open, close: breakStart });
    if (breakEnd && close) ranges.push({ open: breakEnd, close });
  } else {
    const [open, close] = (parts[0] ?? '').split('-');
    if (open && close) ranges.push({ open, close });
  }

  return { ranges };
}

function timeToMins(t: string): number {
  const [h = 0, m = 0] = t.split(':').map(Number);
  return h * 60 + m;
}

function generateSlots(
  hours: Record<string, unknown>,
  date: string,
  duration: number,
): string[] {
  const dayKey = DAY_KEYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  if (!dayKey) return [];

  const { ranges } = parseDayRange(hours[dayKey]);
  const slots: string[] = [];

  for (const { open, close } of ranges) {
    const openMins = timeToMins(open);
    const closeMins = timeToMins(close);
    for (let m = openMins; m + duration <= closeMins; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }

  return slots;
}

interface BookingRow {
  time_slot: string;
  end_time: string | null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`slots:${ip}`, { interval: 60_000, limit: 100 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
  const { businessId: rawId } = await params;
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const duration = Math.max(15, Math.min(480, parseInt(url.searchParams.get('duration') ?? '30', 10) || 30));

  if (!date) {
    return NextResponse.json({ error: 'date required' }, { status: 400 });
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const business = await resolveBusinessId(rawId);
  if (!business) return NextResponse.json({ slots: [] });
  if (business.active === false) return NextResponse.json({ slots: [] });
  const businessId = business.id;

  const supabase = supabaseAdmin();

  // Parallelize all 4 independent queries
  const [{ data: biz }, { data: bookings }, { data: blocked }, { data: holidays }] = await Promise.all([
    supabase
      .from('bookbot_businesses')
      .select('hours, config')
      .eq('id', businessId)
      .single(),
    supabase
      .from('bookbot_appointments')
      .select('time_slot, end_time')
      .eq('business_id', businessId)
      .eq('appointment_date', date)
      .in('status', ['confirmed', 'pending'])
      .neq('source', 'test'),
    supabase
      .from('bookbot_blocked_slots')
      .select('time_from, time_to, all_day')
      .eq('business_id', businessId)
      .eq('date', date),
    supabase
      .from('bookbot_holidays')
      .select('all_day, start_time, end_time, recurring_yearly, date')
      .eq('business_id', businessId)
      .or(`date.eq.${date},recurring_yearly.eq.true`),
  ]);

  if (!biz) return NextResponse.json({ slots: [] });

  // All-day block → no slots
  if ((blocked ?? []).some((b) => b.all_day)) {
    return NextResponse.json({ slots: [] });
  }

  // Check bookbot_holidays for this date (exact match + recurring_yearly)
  const dateMMDD = date.slice(5); // "MM-DD"

  const matchingHolidays = (holidays ?? []).filter((h) => {
    if (h.date === date) return true;
    if (h.recurring_yearly && h.date.slice(5) === dateMMDD) return true;
    return false;
  });

  // All-day holiday → no slots
  if (matchingHolidays.some((h) => h.all_day)) {
    return NextResponse.json({ slots: [] });
  }

  const hoursRecord = (biz.hours ?? {}) as Record<string, unknown>;
  const bizConfig = (biz as { config?: Record<string, unknown> }).config ?? {};
  const bufferMin = Math.max(0, Math.min(60, Number(bizConfig.buffer_minutes) || 0));
  const allSlots = generateSlots(hoursRecord, date, duration);

  const occupiedRanges = (bookings ?? []).map((b: BookingRow) => {
    const start = timeToMins(b.time_slot);
    const end = (b.end_time ? timeToMins(b.end_time) : start + duration) + bufferMin;
    return { start, end };
  });

  const blockedRanges = (blocked ?? [])
    .filter((b) => b.time_from && b.time_to)
    .map((b) => ({
      start: timeToMins(b.time_from as string),
      end: timeToMins(b.time_to as string),
    }));

  // Partial holiday closures → add to blocked ranges
  const holidayRanges = matchingHolidays
    .filter((h) => !h.all_day && h.start_time && h.end_time)
    .map((h) => ({
      start: timeToMins(h.start_time as string),
      end: timeToMins(h.end_time as string),
    }));

  const allOccupied = [...occupiedRanges, ...blockedRanges, ...holidayRanges];

  const available = allSlots.filter((slot) => {
    const slotStart = timeToMins(slot);
    const slotEnd = slotStart + duration;
    return !allOccupied.some((o) => slotStart < o.end && o.start < slotEnd);
  });

  return NextResponse.json({ slots: available }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
  } catch (err) {
    logger.error('Slots fetch error', { action: 'book_slots', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
