import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { listCalendarEvents } from '@/lib/gcal';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * POST /api/webhook/gcal
 * Google Calendar push notification webhook.
 * Called by Google whenever events change on a watched calendar.
 * Headers contain channel info; body is empty (we must re-fetch events).
 */
export async function POST(req: Request) {
  const channelId = req.headers.get('x-goog-channel-id');
  const resourceState = req.headers.get('x-goog-resource-state');

  // Google sends a "sync" message when the watch is first created — ignore it
  if (resourceState === 'sync') {
    return NextResponse.json({ ok: true });
  }

  if (!channelId) {
    return NextResponse.json({ error: 'Missing channel ID' }, { status: 400 });
  }

  const sb = getAdmin();

  // Find the business associated with this watch channel
  const { data: biz } = await sb
    .from('bookbot_businesses')
    .select('id, timezone, gcal_calendar_id')
    .eq('gcal_watch_channel_id', channelId)
    .single();

  if (!biz) {
    console.error(`[GCal Webhook] No business for channel ${channelId}`);
    return NextResponse.json({ error: 'Unknown channel' }, { status: 404 });
  }

  // Re-run the sync for this single business (same logic as cron)
  try {
    const tz = biz.timezone ?? 'Pacific/Tahiti';
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = await listCalendarEvents(biz.id, timeMin, timeMax);
    if (!events) return NextResponse.json({ ok: true, synced: 0 });

    // Get existing data
    const [{ data: existingAppts }, { data: existingSlots }, { data: dismissed }] = await Promise.all([
      sb.from('bookbot_appointments').select('gcal_event_id').eq('business_id', biz.id).eq('source', 'gcal').not('gcal_event_id', 'is', null),
      sb.from('bookbot_blocked_slots').select('gcal_event_id').eq('business_id', biz.id).eq('source', 'gcal').not('gcal_event_id', 'is', null),
      sb.from('bookbot_gcal_dismissed').select('gcal_event_id').eq('business_id', biz.id),
    ]);

    const dismissedIds = new Set((dismissed ?? []).map((d: { gcal_event_id: string }) => d.gcal_event_id));
    const existingApptIds = new Set((existingAppts ?? []).map((a: { gcal_event_id: string }) => a.gcal_event_id));
    const existingSlotIds = new Set((existingSlots ?? []).map((s: { gcal_event_id: string }) => s.gcal_event_id));
    const seenApptIds = new Set<string>();
    const seenSlotIds = new Set<string>();
    let synced = 0;

    for (const event of events) {
      if (dismissedIds.has(event.id)) continue;

      if (event.allDay) {
        seenSlotIds.add(event.id);
        if (existingSlotIds.has(event.id)) {
          await sb.from('bookbot_blocked_slots').update({ reason: event.summary, date: event.start }).eq('business_id', biz.id).eq('gcal_event_id', event.id).eq('source', 'gcal');
          continue;
        }
        await sb.from('bookbot_blocked_slots').insert({
          business_id: biz.id, date: event.start, time_from: null, time_to: null,
          all_day: true, reason: event.summary, source: 'gcal', gcal_event_id: event.id,
        });
        synced++;
      } else {
        seenApptIds.add(event.id);
        const startDt = new Date(event.start);
        const endDt = new Date(event.end);
        const startLocal = new Date(startDt.toLocaleString('en-US', { timeZone: tz }));
        const endLocal = new Date(endDt.toLocaleString('en-US', { timeZone: tz }));
        const date = `${startLocal.getFullYear()}-${String(startLocal.getMonth() + 1).padStart(2, '0')}-${String(startLocal.getDate()).padStart(2, '0')}`;
        const timeSlot = `${String(startLocal.getHours()).padStart(2, '0')}:${String(startLocal.getMinutes()).padStart(2, '0')}`;
        const endTime = `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`;

        const attendee = event.attendees[0];
        const clientName = attendee?.displayName ?? event.summary;
        const clientEmail = attendee?.email ?? null;

        // Create client if not exists
        if (clientName) {
          const { data: existing } = await sb.from('bookbot_clients').select('id').eq('business_id', biz.id).eq('name', clientName).maybeSingle();
          if (!existing) {
            await sb.from('bookbot_clients').insert({ business_id: biz.id, name: clientName, email: clientEmail, source: 'gcal', tags: ['gcal'] });
          }
        }

        if (existingApptIds.has(event.id)) {
          await sb.from('bookbot_appointments').update({
            client_name: clientName, client_email: clientEmail,
            appointment_date: date, time_slot: timeSlot, end_time: endTime,
            updated_at: new Date().toISOString(),
          }).eq('business_id', biz.id).eq('gcal_event_id', event.id).eq('source', 'gcal');
          continue;
        }

        await sb.from('bookbot_appointments').insert({
          business_id: biz.id, client_name: clientName, client_email: clientEmail,
          service: null, appointment_date: date, time_slot: timeSlot, end_time: endTime,
          status: 'confirmed', source: 'gcal', gcal_event_id: event.id,
        });
        synced++;
      }
    }

    // Cleanup deleted events
    const apptToRemove = Array.from(existingApptIds).filter((id) => !seenApptIds.has(id));
    if (apptToRemove.length > 0) {
      await sb.from('bookbot_appointments').delete().eq('business_id', biz.id).eq('source', 'gcal').in('gcal_event_id', apptToRemove);
    }
    const slotToRemove = Array.from(existingSlotIds).filter((id) => !seenSlotIds.has(id));
    if (slotToRemove.length > 0) {
      await sb.from('bookbot_blocked_slots').delete().eq('business_id', biz.id).eq('source', 'gcal').in('gcal_event_id', slotToRemove);
    }

    console.log(`[GCal Webhook] Synced ${synced} new events for business ${biz.id}`);
    return NextResponse.json({ ok: true, synced });
  } catch (e) {
    console.error(`[GCal Webhook] Error for business ${biz.id}:`, e);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
