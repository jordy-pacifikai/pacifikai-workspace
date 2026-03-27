import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveBusinessId } from '@/lib/resolve-business';
import { triggerTask } from '@/lib/trigger';
import { computeEndTime } from '@/lib/utils';

interface BookPayload {
  service: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  businessName?: string;
  price?: number;
  duration?: number;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const ip = getClientIp(req);
  const rl = rateLimit(`appointments:${ip}`, { interval: 60_000, limit: 20 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { businessId: rawId } = await params;

  let body: BookPayload;
  try {
    body = (await req.json()) as BookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { service: rawService, date, time, clientName: rawClientName, clientPhone, clientEmail, businessName, price, duration } = body;

  if (!rawService || !date || !time || !rawClientName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Strip HTML tags from user-provided strings (defense-in-depth against stored XSS)
  const service = rawService.replace(/<[^>]*>/g, '').trim();
  const clientName = rawClientName.replace(/<[^>]*>/g, '').trim();

  // Validate string lengths
  if (clientName.length > 100) {
    return NextResponse.json({ error: 'clientName max 100 characters' }, { status: 400 });
  }
  if (service.length > 200) {
    return NextResponse.json({ error: 'service max 200 characters' }, { status: 400 });
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format, expected YYYY-MM-DD' }, { status: 400 });
  }

  // Validate time format HH:MM
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Invalid time format, expected HH:MM' }, { status: 400 });
  }

  // Validate price (must be non-negative if provided)
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }

  // Validate duration range (15–480 minutes)
  if (duration !== undefined) {
    if (typeof duration !== 'number' || duration < 15 || duration > 480) {
      return NextResponse.json({ error: 'duration must be a number between 15 and 480' }, { status: 400 });
    }
  }

  // Validate email format if provided
  if (clientEmail !== undefined && clientEmail !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: 'Invalid clientEmail format' }, { status: 400 });
    }
  }

  // Validate phone format if provided — reject internal channel prefixes
  if (clientPhone !== undefined && clientPhone !== '') {
    if (/^(messenger_|instagram_)/.test(clientPhone)) {
      return NextResponse.json({ error: 'Invalid clientPhone format' }, { status: 400 });
    }
    if (!/^\+?[0-9\s\-()]{6,20}$/.test(clientPhone)) {
      return NextResponse.json({ error: 'Invalid clientPhone format' }, { status: 400 });
    }
  }

  try {
  const business = await resolveBusinessId(rawId);
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }
  if (business.active === false) {
    return NextResponse.json({ error: 'Ce commerce n\'accepte pas les réservations actuellement.' }, { status: 410 });
  }
  const businessId = business.id;

  // Reject past dates (use business timezone, not UTC)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: business.timezone });
  if (date < today) {
    return NextResponse.json({ error: 'Impossible de réserver une date passée.' }, { status: 400 });
  }

  // Reject dates more than 365 days in the future
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: business.timezone });
  if (date > maxDate) {
    return NextResponse.json({ error: 'Impossible de réserver plus d\'un an à l\'avance.' }, { status: 400 });
  }

  // Compute end_time from duration (default 30 min, capped at 23:59)
  const durationMin = duration ?? 30;
  const endTime = computeEndTime(time, durationMin);

  const supabase = supabaseAdmin();

  // Atomic double-booking prevention: conflict check + insert in single transaction
  // Prevents TOCTOU race condition where concurrent requests both pass the check
  const { data: rpcResult, error } = await supabase.rpc('book_appointment_atomic', {
    p_business_id: businessId,
    p_service: service,
    p_appointment_date: date,
    p_time_slot: time,
    p_end_time: endTime,
    p_client_name: clientName,
    p_client_phone: clientPhone ?? null,
    p_client_email: clientEmail ?? null,
    p_price: price ?? 0,
  });

  if (error) {
    if (error.message?.includes('BOOKING_CONFLICT')) {
      return NextResponse.json({ error: 'Ce créneau n\'est plus disponible.' }, { status: 409 });
    }
    logger.error('DB insert error', { action: 'appointment_create', businessId, error: error.message });
    return NextResponse.json({ error: 'Failed to process appointment' }, { status: 500 });
  }

  const appointmentId = rpcResult as string;

  // Fire-and-forget confirmations via Trigger.dev (parallel to reduce latency)
  const [emailSent, whatsappSent] = await Promise.all([
    clientEmail && appointmentId
      ? triggerTask('send-confirmation-email', {
          appointmentId, businessId, clientEmail, clientName,
          service, appointmentDate: date, timeSlot: time,
        }).catch(() => false)
      : false,
    clientPhone && appointmentId
      ? triggerTask('send-confirmation-whatsapp', {
          appointmentId, businessId, clientPhone, clientName,
          service, appointmentDate: date, timeSlot: time,
        }).catch(() => false)
      : false,
  ]);

  return NextResponse.json({ id: appointmentId, success: true, emailSent, whatsappSent });
  } catch (err) {
    logger.error('Appointment create error', { action: 'appointment_create', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
