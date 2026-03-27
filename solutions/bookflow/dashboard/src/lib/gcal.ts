import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Refresh the access token using the stored refresh token for a business.
 * Returns null if no GCal is connected.
 */
export async function getAccessToken(businessId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('bookbot_businesses')
    .select('gcal_refresh_token')
    .eq('id', businessId)
    .single();

  if (!data?.gcal_refresh_token) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: data.gcal_refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    logger.error('Token refresh failed', { action: 'gcal_token', businessId, status: res.status });
    return null;
  }

  const tokens: TokenResponse = await res.json();
  return tokens.access_token;
}

/**
 * Create a Google Calendar event for a booking.
 */
export async function createCalendarEvent(
  businessId: string,
  opts: {
    summary: string;
    description?: string;
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:MM
    endTime: string;    // HH:MM
    timezone: string;
  },
): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data: biz } = await sb
    .from('bookbot_businesses')
    .select('gcal_calendar_id')
    .eq('id', businessId)
    .single();

  if (!biz?.gcal_calendar_id) return null;

  const accessToken = await getAccessToken(businessId);
  if (!accessToken) return null;

  const event = {
    summary: opts.summary,
    description: opts.description ?? '',
    start: {
      dateTime: `${opts.date}T${opts.startTime}:00`,
      timeZone: opts.timezone,
    },
    end: {
      dateTime: `${opts.date}T${opts.endTime}:00`,
      timeZone: opts.timezone,
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(biz.gcal_calendar_id)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  );

  if (!res.ok) {
    logger.error('Create event failed', { action: 'gcal_create_event', businessId, status: res.status });
    return null;
  }

  const created = await res.json();
  return created.id as string;
}

/**
 * Subscribe to Google Calendar push notifications (webhooks).
 * Google will POST to webhookUrl whenever events change.
 * Channel expires after 7 days (max allowed by Google).
 */
export async function watchCalendar(
  businessId: string,
  webhookUrl: string,
): Promise<{ channelId: string; resourceId: string; expiration: string } | null> {
  const sb = supabaseAdmin();
  const { data: biz } = await sb
    .from('bookbot_businesses')
    .select('gcal_calendar_id')
    .eq('id', businessId)
    .single();

  if (!biz?.gcal_calendar_id) return null;

  const accessToken = await getAccessToken(businessId);
  if (!accessToken) return null;

  const channelId = `vea-${businessId}-${Date.now()}`;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(biz.gcal_calendar_id)}/events/watch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        params: { ttl: '604800' }, // 7 days
      }),
    },
  );

  if (!res.ok) {
    logger.error('Watch setup failed', { action: 'gcal_watch', businessId, status: res.status });
    return null;
  }

  const data = await res.json();
  return {
    channelId: data.id,
    resourceId: data.resourceId,
    expiration: data.expiration,
  };
}

/**
 * Stop a Google Calendar watch channel.
 */
export async function stopWatch(
  businessId: string,
  channelId: string,
  resourceId: string,
): Promise<void> {
  const accessToken = await getAccessToken(businessId);
  if (!accessToken) return;

  await fetch('https://www.googleapis.com/calendar/v3/channels/stop', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: channelId, resourceId }),
  }).catch(() => {});
}

/**
 * Fetch upcoming Google Calendar events and return them.
 */
export interface GCalAttendee {
  email: string;
  displayName?: string;
  self?: boolean;
}

export interface GCalEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  attendees: GCalAttendee[];
}

/**
 * Sync GCal events for a single business — shared between cron and webhook.
 * Returns the number of newly synced events.
 */
export async function syncGCalEventsForBusiness(
  businessId: string,
  tz: string,
  events: GCalEvent[],
): Promise<number> {
  const sb = supabaseAdmin();

  const [{ data: existingAppts }, { data: existingSlots }, { data: dismissed }] = await Promise.all([
    sb.from('bookbot_appointments').select('gcal_event_id')
      .eq('business_id', businessId).eq('source', 'gcal').not('gcal_event_id', 'is', null),
    sb.from('bookbot_blocked_slots').select('gcal_event_id')
      .eq('business_id', businessId).eq('source', 'gcal').not('gcal_event_id', 'is', null),
    sb.from('bookbot_gcal_dismissed').select('gcal_event_id')
      .eq('business_id', businessId),
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
        await sb.from('bookbot_blocked_slots')
          .update({ reason: event.summary, date: event.start })
          .eq('business_id', businessId).eq('gcal_event_id', event.id).eq('source', 'gcal');
        continue;
      }
      await sb.from('bookbot_blocked_slots').insert({
        business_id: businessId, date: event.start, time_from: null, time_to: null,
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

      if (clientName) {
        const { data: existing } = await sb.from('bookbot_clients').select('id')
          .eq('business_id', businessId).eq('name', clientName).maybeSingle();
        if (!existing) {
          await sb.from('bookbot_clients').insert({
            business_id: businessId, name: clientName, email: clientEmail, source: 'gcal', tags: ['gcal'],
          });
        }
      }

      if (existingApptIds.has(event.id)) {
        await sb.from('bookbot_appointments').update({
          client_name: clientName, client_email: clientEmail,
          appointment_date: date, time_slot: timeSlot, end_time: endTime,
          updated_at: new Date().toISOString(),
        }).eq('business_id', businessId).eq('gcal_event_id', event.id).eq('source', 'gcal');
        continue;
      }

      await sb.from('bookbot_appointments').insert({
        business_id: businessId, client_name: clientName, client_email: clientEmail,
        service: null, appointment_date: date, time_slot: timeSlot, end_time: endTime,
        status: 'confirmed', source: 'gcal', gcal_event_id: event.id,
      });
      synced++;
    }
  }

  // Cleanup: remove events deleted from GCal
  const apptToRemove = Array.from(existingApptIds).filter((id) => !seenApptIds.has(id));
  const slotToRemove = Array.from(existingSlotIds).filter((id) => !seenSlotIds.has(id));
  if (apptToRemove.length > 0 || slotToRemove.length > 0) {
    await Promise.all([
      ...(apptToRemove.length > 0 ? [sb.from('bookbot_appointments').delete()
        .eq('business_id', businessId).eq('source', 'gcal').in('gcal_event_id', apptToRemove)] : []),
      ...(slotToRemove.length > 0 ? [sb.from('bookbot_blocked_slots').delete()
        .eq('business_id', businessId).eq('source', 'gcal').in('gcal_event_id', slotToRemove)] : []),
    ]);
  }

  return synced;
}

export async function listCalendarEvents(
  businessId: string,
  timeMin: string,
  timeMax: string,
): Promise<GCalEvent[] | null> {
  const sb = supabaseAdmin();
  const { data: biz } = await sb
    .from('bookbot_businesses')
    .select('gcal_calendar_id')
    .eq('id', businessId)
    .single();

  if (!biz?.gcal_calendar_id) return null;

  const accessToken = await getAccessToken(businessId);
  if (!accessToken) return null;

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(biz.gcal_calendar_id)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    logger.error('List events failed', { action: 'gcal_list_events', businessId, status: res.status });
    return null;
  }

  const data = await res.json();
  const items = (data.items ?? []) as Array<{
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    attendees?: Array<{ email?: string; displayName?: string; self?: boolean }>;
  }>;

  return items.map((item) => ({
    id: item.id,
    summary: item.summary ?? '(sans titre)',
    start: item.start?.dateTime ?? item.start?.date ?? '',
    end: item.end?.dateTime ?? item.end?.date ?? '',
    allDay: !item.start?.dateTime,
    attendees: (item.attendees ?? [])
      .filter((a) => a.email && !a.self)
      .map((a) => ({ email: a.email!, displayName: a.displayName, self: a.self })),
  }));
}
