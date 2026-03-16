import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccessToken } from '@/lib/gcal';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * DELETE /api/appointments
 * Deletes an appointment. If it's a GCal-synced appointment:
 *   1. Deletes the event from Google Calendar
 *   2. Stores gcal_event_id in gcal_dismissed to prevent re-import
 *   3. Deletes from bookbot_appointments
 */
export async function DELETE(req: Request) {
  const body = await req.json();
  const { appointmentId } = body;

  if (!appointmentId) {
    return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });
  }

  const sb = getAdmin();

  // Fetch the appointment to check if it's from GCal
  const { data: appt, error } = await sb
    .from('bookbot_appointments')
    .select('id, business_id, source, gcal_event_id')
    .eq('id', appointmentId)
    .single();

  if (error || !appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
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
      console.error(`[GCal] Failed to delete event ${appt.gcal_event_id} from Google Calendar`);
    }
  }

  // Delete from DB
  await sb.from('bookbot_appointments').delete().eq('id', appointmentId);

  return NextResponse.json({ ok: true });
}
