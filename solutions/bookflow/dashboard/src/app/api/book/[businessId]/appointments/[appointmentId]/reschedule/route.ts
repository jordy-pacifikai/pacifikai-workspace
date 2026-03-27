import { NextResponse } from 'next/server';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveBusinessId } from '@/lib/resolve-business';
import { computeEndTime } from '@/lib/utils';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ businessId: string; appointmentId: string }> },
) {
  // Rate limit: 5/min per IP (public endpoint)
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`reschedule:${ip}`, { interval: 60_000, limit: 5 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const { businessId: rawId, appointmentId } = await params;

  let body: { newDate: string; newTime: string; clientEmail?: string };
  try {
    body = (await req.json()) as { newDate: string; newTime: string; clientEmail?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { newDate, newTime, clientEmail } = body;

  if (!newDate || !newTime) {
    return NextResponse.json({ error: 'newDate and newTime are required' }, { status: 400 });
  }

  // Validate date format yyyy-mm-dd
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  // Validate time format hh:mm
  if (!/^\d{2}:\d{2}$/.test(newTime)) {
    return NextResponse.json({ error: 'Invalid time format' }, { status: 400 });
  }

  try {
  const business = await resolveBusinessId(rawId);
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }
  if (business.active === false) {
    return NextResponse.json({ error: 'Ce commerce n\'accepte pas les modifications actuellement.' }, { status: 410 });
  }
  const businessId = business.id;

  // Reject past dates (use business timezone, not UTC)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: business.timezone });
  if (newDate < today) {
    return NextResponse.json({ error: 'Impossible de modifier vers une date passée.' }, { status: 400 });
  }

  // Reject dates more than 365 days in the future
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: business.timezone });
  if (newDate > maxDate) {
    return NextResponse.json({ error: 'Impossible de réserver plus d\'un an à l\'avance.' }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // Fetch existing appointment — verify it belongs to this business
  const { data: existing, error: fetchErr } = await supabase
    .from('bookbot_appointments')
    .select('id, business_id, service, client_name, client_email, status, appointment_date, time_slot, end_time')
    .eq('id', appointmentId)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  if (existing.business_id !== businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Ownership verification: require clientEmail matching the appointment
  // When appointment has no email (WhatsApp-only bookings), block public reschedule — must use portal
  if (!existing.client_email) {
    return NextResponse.json({ error: 'Ce rendez-vous requiert une modification via le lien securise (portail client).' }, { status: 403 });
  }
  if (!clientEmail || clientEmail.toLowerCase() !== (existing.client_email as string).toLowerCase()) {
    return NextResponse.json({ error: 'Verification echouee — verifiez votre adresse email' }, { status: 403 });
  }

  if (existing.status === 'cancelled') {
    return NextResponse.json({ error: 'Ce rendez-vous a déjà été annulé.' }, { status: 409 });
  }

  // Compute new end_time preserving original appointment duration (capped at 23:59)
  let durationMin = 30; // default
  if (existing.end_time && existing.time_slot) {
    const [oh = 0, om = 0] = (existing.time_slot as string).split(':').map(Number);
    const [eh = 0, em = 0] = (existing.end_time as string).split(':').map(Number);
    const origDuration = (eh * 60 + em) - (oh * 60 + om);
    if (origDuration > 0) durationMin = origDuration;
  }
  const newEndTime = computeEndTime(newTime, durationMin);

  // Atomic double-booking prevention: conflict check + update in single transaction
  const { error: updateErr } = await supabase.rpc('reschedule_appointment_atomic', {
    p_appointment_id: appointmentId,
    p_business_id: businessId,
    p_new_date: newDate,
    p_new_time_slot: newTime,
    p_new_end_time: newEndTime,
  });

  if (updateErr) {
    if (updateErr.message?.includes('BOOKING_CONFLICT')) {
      return NextResponse.json({ error: 'Ce créneau n\'est plus disponible.' }, { status: 409 });
    }
    logger.error('Reschedule update failed', { action: 'reschedule', appointmentId, error: updateErr.message });
    return NextResponse.json({ error: 'Erreur lors de la modification.' }, { status: 500 });
  }

  // Fetch business name for email
  const { data: biz } = await supabase
    .from('bookbot_businesses')
    .select('name')
    .eq('id', businessId)
    .single();

  const bizName = escapeHtml((biz as { name: string } | null)?.name ?? 'votre prestataire');

  // Fire-and-forget confirmation email
  if (existing.client_email) {
    const oldDateLabel = escapeHtml(existing.appointment_date as string);
    const oldTime = escapeHtml(existing.time_slot as string);
    const serviceName = escapeHtml(existing.service as string);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #fff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: bold; color: #25D366;">Ve&#39;a</span>
          <p style="color: #9ca3af; margin: 4px 0 0;">Assistant de r&eacute;servation</p>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #25D366; margin: 0 0 16px; font-size: 20px;">Rendez-vous modifi&eacute;</h2>
          <table style="width: 100%; color: #e2e8f0; font-size: 15px;">
            <tr><td style="padding: 6px 0; color: #9ca3af;">Commerce</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${bizName}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Service</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${serviceName}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af; text-decoration: line-through;">Ancienne date</td><td style="padding: 6px 0; text-align: right; color: #6b7280; text-decoration: line-through;">${oldDateLabel} &agrave; ${oldTime}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Nouvelle date</td><td style="padding: 6px 0; text-align: right; font-weight: 600; color: #25D366;">${newDate} &agrave; ${newTime}</td></tr>
          </table>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">Pour toute question, contactez directement ${bizName}.</p>
        <p style="color: #374151; font-size: 11px; text-align: center; margin: 16px 0 0;">Propuls&eacute; par Ve&#39;a &middot; vea.pacifikai.com</p>
      </div>
    `;

    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: "Ve'a", email: 'vea@pacifikai.com' },
        to: [{ email: existing.client_email as string }],
        subject: `Votre RDV a été modifié — ${bizName}`,
        htmlContent: emailHtml,
      }),
    }).catch((err: unknown) => logger.error('Reschedule email send failed', { action: 'reschedule_email', error: String(err) }));
  }

  return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Reschedule error', { action: 'reschedule', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
