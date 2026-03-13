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
 * GET /api/cron/gcal-sync
 * Syncs Google Calendar events → bookbot_blocked_slots for all connected businesses.
 * Called by Vercel Cron every 15 minutes.
 * Protected by CRON_SECRET header.
 */
export async function GET(req: Request) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = getAdmin();

  // Get all businesses with GCal connected
  const { data: businesses, error } = await sb
    .from('bookbot_businesses')
    .select('id, gcal_calendar_id, gcal_refresh_token, timezone')
    .not('gcal_refresh_token', 'is', null)
    .not('gcal_calendar_id', 'is', null);

  if (error || !businesses?.length) {
    return NextResponse.json({ synced: 0, message: 'No connected businesses' });
  }

  const now = new Date();
  const timeMin = now.toISOString();
  // Sync 30 days ahead
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let totalSynced = 0;

  for (const biz of businesses) {
    try {
      const events = await listCalendarEvents(biz.id, timeMin, timeMax);
      if (!events) continue;

      // Get existing gcal-sourced blocked slots for this business
      const { data: existingSlots } = await sb
        .from('bookbot_blocked_slots')
        .select('gcal_event_id')
        .eq('business_id', biz.id)
        .eq('source', 'gcal')
        .not('gcal_event_id', 'is', null);

      const existingIds = new Set((existingSlots ?? []).map((s: { gcal_event_id: string }) => s.gcal_event_id));
      const seenIds = new Set<string>();

      for (const event of events) {
        seenIds.add(event.id);

        if (existingIds.has(event.id)) continue; // Already synced

        // Parse event times
        let date: string;
        let timeFrom: string | null = null;
        let timeTo: string | null = null;
        let allDay = false;

        if (event.allDay) {
          // All-day event: date is "YYYY-MM-DD"
          date = event.start;
          allDay = true;
        } else {
          // Timed event: dateTime is "YYYY-MM-DDTHH:MM:SS+offset"
          const startDt = new Date(event.start);
          const endDt = new Date(event.end);

          // Convert to business timezone
          const startLocal = new Date(startDt.toLocaleString('en-US', { timeZone: biz.timezone ?? 'Pacific/Tahiti' }));
          const endLocal = new Date(endDt.toLocaleString('en-US', { timeZone: biz.timezone ?? 'Pacific/Tahiti' }));

          date = `${startLocal.getFullYear()}-${String(startLocal.getMonth() + 1).padStart(2, '0')}-${String(startLocal.getDate()).padStart(2, '0')}`;
          timeFrom = `${String(startLocal.getHours()).padStart(2, '0')}:${String(startLocal.getMinutes()).padStart(2, '0')}`;
          timeTo = `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`;
        }

        await sb.from('bookbot_blocked_slots').insert({
          business_id: biz.id,
          date,
          time_from: timeFrom,
          time_to: timeTo,
          all_day: allDay,
          reason: event.summary,
          source: 'gcal',
          gcal_event_id: event.id,
        });

        totalSynced++;
      }

      // Remove blocked slots for GCal events that no longer exist
      const toRemove = Array.from(existingIds).filter((id) => !seenIds.has(id));
      if (toRemove.length > 0) {
        await sb
          .from('bookbot_blocked_slots')
          .delete()
          .eq('business_id', biz.id)
          .eq('source', 'gcal')
          .in('gcal_event_id', toRemove);
      }
    } catch (e) {
      console.error(`[GCal Sync] Error for business ${biz.id}:`, e);
    }
  }

  return NextResponse.json({ synced: totalSynced, businesses: businesses.length });
}
