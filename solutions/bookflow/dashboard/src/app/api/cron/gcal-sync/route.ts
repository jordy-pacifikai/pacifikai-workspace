import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { listCalendarEvents, watchCalendar } from '@/lib/gcal';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * GET /api/cron/gcal-sync
 * Syncs Google Calendar events:
 *   - Timed events → bookbot_appointments (source='gcal', status='confirmed')
 *   - All-day events → bookbot_blocked_slots (source='gcal')
 * Called by Vercel Cron every 15 minutes.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = getAdmin();

  const { data: businesses, error } = await sb
    .from('bookbot_businesses')
    .select('id, gcal_calendar_id, gcal_refresh_token, timezone, gcal_watch_channel_id, gcal_watch_expiration')
    .not('gcal_refresh_token', 'is', null)
    .not('gcal_calendar_id', 'is', null);

  if (error || !businesses?.length) {
    return NextResponse.json({ synced: 0, message: 'No connected businesses' });
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const webhookBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dashboard.vea.pacifikai.com';

  let totalSynced = 0;

  for (const biz of businesses) {
    try {
      // Renew watch channel if expired or missing (expires every 7 days)
      const watchExpired = !biz.gcal_watch_expiration || new Date(biz.gcal_watch_expiration) < new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (watchExpired) {
        const watch = await watchCalendar(biz.id, `${webhookBaseUrl}/api/webhook/gcal`);
        if (watch) {
          await sb.from('bookbot_businesses').update({
            gcal_watch_channel_id: watch.channelId,
            gcal_watch_resource_id: watch.resourceId,
            gcal_watch_expiration: new Date(Number(watch.expiration)).toISOString(),
          }).eq('id', biz.id);
        }
      }

      const events = await listCalendarEvents(biz.id, timeMin, timeMax);
      if (!events) continue;

      const tz = biz.timezone ?? 'Pacific/Tahiti';

      // Get existing gcal appointments (timed events)
      const { data: existingAppts } = await sb
        .from('bookbot_appointments')
        .select('gcal_event_id')
        .eq('business_id', biz.id)
        .eq('source', 'gcal')
        .not('gcal_event_id', 'is', null);

      // Get existing gcal blocked slots (all-day events)
      const { data: existingSlots } = await sb
        .from('bookbot_blocked_slots')
        .select('gcal_event_id')
        .eq('business_id', biz.id)
        .eq('source', 'gcal')
        .not('gcal_event_id', 'is', null);

      // Get dismissed event IDs (user deleted from dashboard → don't re-import)
      const { data: dismissed } = await sb
        .from('bookbot_gcal_dismissed')
        .select('gcal_event_id')
        .eq('business_id', biz.id);

      const dismissedIds = new Set((dismissed ?? []).map((d: { gcal_event_id: string }) => d.gcal_event_id));
      const existingApptIds = new Set((existingAppts ?? []).map((a: { gcal_event_id: string }) => a.gcal_event_id));
      const existingSlotIds = new Set((existingSlots ?? []).map((s: { gcal_event_id: string }) => s.gcal_event_id));
      const seenApptIds = new Set<string>();
      const seenSlotIds = new Set<string>();

      for (const event of events) {
        // Skip events the user explicitly dismissed from the dashboard
        if (dismissedIds.has(event.id)) continue;
        if (event.allDay) {
          // All-day → blocked_slots
          seenSlotIds.add(event.id);

          if (existingSlotIds.has(event.id)) {
            // Update reason if changed
            await sb.from('bookbot_blocked_slots')
              .update({ reason: event.summary, date: event.start })
              .eq('business_id', biz.id)
              .eq('gcal_event_id', event.id)
              .eq('source', 'gcal');
            continue;
          }

          await sb.from('bookbot_blocked_slots').insert({
            business_id: biz.id,
            date: event.start,
            time_from: null,
            time_to: null,
            all_day: true,
            reason: event.summary,
            source: 'gcal',
            gcal_event_id: event.id,
          });
          totalSynced++;
        } else {
          // Timed → appointments
          seenApptIds.add(event.id);

          const startDt = new Date(event.start);
          const endDt = new Date(event.end);
          const startLocal = new Date(startDt.toLocaleString('en-US', { timeZone: tz }));
          const endLocal = new Date(endDt.toLocaleString('en-US', { timeZone: tz }));

          const date = `${startLocal.getFullYear()}-${String(startLocal.getMonth() + 1).padStart(2, '0')}-${String(startLocal.getDate()).padStart(2, '0')}`;
          const timeSlot = `${String(startLocal.getHours()).padStart(2, '0')}:${String(startLocal.getMinutes()).padStart(2, '0')}`;
          const endTime = `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`;

          // Resolve client name & email from attendees (first non-self attendee)
          const attendee = event.attendees[0];
          const clientName = attendee?.displayName ?? event.summary;
          const clientEmail = attendee?.email ?? null;

          // Create client if not exists
          if (clientName) {
            const { data: existingClient } = await sb
              .from('bookbot_clients')
              .select('id')
              .eq('business_id', biz.id)
              .eq('name', clientName)
              .maybeSingle();

            if (!existingClient) {
              await sb.from('bookbot_clients').insert({
                business_id: biz.id,
                name: clientName,
                email: clientEmail,
                source: 'gcal',
                tags: ['gcal'],
              });
            }
          }

          if (existingApptIds.has(event.id)) {
            // Update existing appointment (title/time may have changed on GCal)
            await sb.from('bookbot_appointments')
              .update({
                client_name: clientName,
                client_email: clientEmail,
                appointment_date: date,
                time_slot: timeSlot,
                end_time: endTime,
                updated_at: new Date().toISOString(),
              })
              .eq('business_id', biz.id)
              .eq('gcal_event_id', event.id)
              .eq('source', 'gcal');
            continue;
          }

          await sb.from('bookbot_appointments').insert({
            business_id: biz.id,
            client_name: clientName,
            client_email: clientEmail,
            service: null,
            appointment_date: date,
            time_slot: timeSlot,
            end_time: endTime,
            status: 'confirmed',
            source: 'gcal',
            gcal_event_id: event.id,
          });
          totalSynced++;
        }
      }

      // Cleanup: remove appointments for deleted GCal timed events
      const apptToRemove = Array.from(existingApptIds).filter((id) => !seenApptIds.has(id));
      if (apptToRemove.length > 0) {
        await sb
          .from('bookbot_appointments')
          .delete()
          .eq('business_id', biz.id)
          .eq('source', 'gcal')
          .in('gcal_event_id', apptToRemove);
      }

      // Cleanup: remove blocked slots for deleted GCal all-day events
      const slotToRemove = Array.from(existingSlotIds).filter((id) => !seenSlotIds.has(id));
      if (slotToRemove.length > 0) {
        await sb
          .from('bookbot_blocked_slots')
          .delete()
          .eq('business_id', biz.id)
          .eq('source', 'gcal')
          .in('gcal_event_id', slotToRemove);
      }
    } catch (e) {
      console.error(`[GCal Sync] Error for business ${biz.id}:`, e);
    }
  }

  return NextResponse.json({ synced: totalSynced, businesses: businesses.length });
}
