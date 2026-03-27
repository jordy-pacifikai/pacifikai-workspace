import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPortalToken } from '@/lib/portal-token';
import { triggerTask } from '@/lib/trigger';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logAuthEvent, extractRequestMeta } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

/**
 * POST /api/portal/cancel
 * Body: { token: string; appointmentId: string }
 *
 * Verifies token → gets clientId → checks appointment belongs to client →
 * updates status to 'cancelled'.
 *
 * Only cancels upcoming appointments (not past/already-cancelled ones).
 */
export async function POST(req: Request) {
  // Rate limit: 5/min per IP
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`portal-cancel:${ip}`, { interval: 60_000, limit: 5 });
  if (!rlOk) {
    const meta = extractRequestMeta(req);
    void logAuthEvent({ eventType: 'rate_limited', ip: meta.ip, userAgent: meta.userAgent, details: { route: 'POST /api/portal/cancel' } });
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const cancelSchema = z.object({
    token: z.string().min(1),
    appointmentId: z.string().uuid(),
  });
  const parsed = cancelSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'token and appointmentId are required' },
      { status: 400 },
    );
  }
  const { token, appointmentId } = parsed.data;

  const clientId = verifyPortalToken(token);
  if (!clientId) {
    const meta = extractRequestMeta(req);
    void logAuthEvent({ eventType: 'invalid_token', ip: meta.ip, userAgent: meta.userAgent, details: { route: 'POST /api/portal/cancel' } });
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Fetch client to resolve phone (appointments are matched by client_phone)
  const { data: client, error: clientErr } = await sb
    .from('bookbot_clients')
    .select('id, phone, business_id')
    .eq('id', clientId)
    .single();

  if (clientErr || !client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  }

  // Fetch the appointment
  const { data: appt, error: apptErr } = await sb
    .from('bookbot_appointments')
    .select('id, business_id, client_phone, client_email, client_name, service, status, appointment_date, time_slot')
    .eq('id', appointmentId)
    .single();

  if (apptErr || !appt) {
    return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });
  }

  // Verify ownership: same business + matching phone (or both null for email-only clients)
  const bothPhonesNull = !client.phone && !appt.client_phone;
  const phoneMatch =
    client.phone && appt.client_phone
      ? appt.client_phone.replace(/\s/g, '') === client.phone.replace(/\s/g, '')
      : bothPhonesNull;

  if (appt.business_id !== client.business_id || !phoneMatch) {
    return NextResponse.json(
      { error: 'Ce rendez-vous ne vous appartient pas' },
      { status: 403 },
    );
  }

  // Only cancel upcoming appointments
  if (appt.status === 'cancelled') {
    return NextResponse.json({ error: 'Ce rendez-vous est déjà annulé' }, { status: 400 });
  }

  // Use business timezone for past-date check (not UTC)
  const { data: bizData } = await sb
    .from('bookbot_businesses')
    .select('timezone, cancellation_hours')
    .eq('id', client.business_id)
    .single();
  const tz = (bizData as { timezone?: string } | null)?.timezone ?? 'Pacific/Tahiti';
  const today = new Date().toLocaleDateString('en-CA', { timeZone: tz });
  if (appt.appointment_date < today) {
    return NextResponse.json(
      { error: 'Impossible d\'annuler un rendez-vous passe' },
      { status: 400 },
    );
  }

  // Enforce cancellation window policy
  const cancellationHours = Number((bizData as { cancellation_hours?: number } | null)?.cancellation_hours) || 0;
  if (cancellationHours > 0 && appt.appointment_date && appt.time_slot) {
    const apptDateTime = new Date(`${appt.appointment_date}T${appt.time_slot}`);
    // Convert "now" to business timezone
    const nowStr = new Date().toLocaleString('en-US', { timeZone: tz });
    const nowInTz = new Date(nowStr);
    const hoursUntilAppt = (apptDateTime.getTime() - nowInTz.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppt < cancellationHours) {
      return NextResponse.json(
        { error: `Les annulations doivent etre faites au moins ${cancellationHours}h a l'avance` },
        { status: 400 },
      );
    }
  }

  const { error: updateErr } = await sb
    .from('bookbot_appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', appointmentId);

  if (updateErr) {
    return NextResponse.json({ error: 'Erreur lors de l\'annulation' }, { status: 500 });
  }

  // Fire-and-forget cancellation email via Trigger.dev
  const clientEmail = appt.client_email as string | null;
  if (clientEmail) {
    triggerTask('send-cancellation-email', {
      businessId: client.business_id,
      clientEmail,
      clientName: (appt.client_name as string) ?? 'Client',
      service: (appt.service as string) ?? null,
      appointmentDate: appt.appointment_date as string,
      timeSlot: appt.time_slot as string,
    }).catch(() => {});
  }

  // Create in-app notification for business owner (non-blocking)
  void sb.from('bookbot_notifications')
    .insert({
      business_id: client.business_id,
      type: 'cancellation' as const,
      title: `Annulation : ${(appt.client_name as string) || 'Client'}`,
      message: `${(appt.client_name as string) || 'Client'} a annulé ${(appt.service as string) || 'son RDV'} du ${appt.appointment_date} à ${appt.time_slot}`,
      is_read: false,
      metadata: { appointmentId },
    })
    .then(() => {});

  return NextResponse.json({ success: true });
}
