import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { getAccessToken } from '@/lib/gcal';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const deleteAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
});

/**
 * DELETE /api/appointments
 * Deletes an appointment. If it's a GCal-synced appointment:
 *   1. Deletes the event from Google Calendar
 *   2. Stores gcal_event_id in gcal_dismissed to prevent re-import
 *   3. Deletes from bookbot_appointments
 */
export async function DELETE(req: Request) {
  try {
  // Rate limit first — before any DB access
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`appointments-delete:${ip}`, { interval: 60_000, limit: 10 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = deleteAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { appointmentId } = parsed.data;

  const sb = supabaseAdmin();

  // Fetch the appointment to check if it's from GCal
  const { data: appt, error } = await sb
    .from('bookbot_appointments')
    .select('id, business_id, source, gcal_event_id')
    .eq('id', appointmentId)
    .single();

  if (error || !appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Verify the user owns this business
  try {
    await requireBusinessAccess(appt.business_id);
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If GCal-sourced, try to delete from Google Calendar + prevent re-import
  if (appt.source === 'gcal' && appt.gcal_event_id) {
    // Store dismissed event ID to prevent re-import on next sync
    await sb.from('bookbot_gcal_dismissed').insert({
      business_id: appt.business_id,
      gcal_event_id: appt.gcal_event_id,
    }).then(() => {}, () => {}); // ignore if already dismissed

    // Try to delete from GCal (best-effort)
    try {
      const { data: biz } = await sb
        .from('bookbot_businesses')
        .select('gcal_calendar_id')
        .eq('id', appt.business_id)
        .single();

      if (biz?.gcal_calendar_id) {
        const accessToken = await getAccessToken(appt.business_id);
        if (accessToken) {
          await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(biz.gcal_calendar_id)}/events/${encodeURIComponent(appt.gcal_event_id)}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
        }
      }
    } catch {
      // Non-blocking — event stays on GCal but won't be re-imported
      logger.warn('GCal event delete failed', { action: 'gcal_delete', eventId: appt.gcal_event_id });
    }
  }

  // Delete from DB
  const { error: deleteErr } = await sb.from('bookbot_appointments').delete().eq('id', appointmentId);
  if (deleteErr) {
    logger.error('Appointment delete failed', { action: 'appointment_delete', error: deleteErr.message });
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Appointment delete error', { action: 'appointment_delete', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
