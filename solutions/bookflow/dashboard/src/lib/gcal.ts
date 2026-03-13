import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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
  const sb = getAdmin();
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
    console.error('[GCal] Token refresh failed:', await res.text());
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
  const sb = getAdmin();
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
    console.error('[GCal] Create event failed:', await res.text());
    return null;
  }

  const created = await res.json();
  return created.id as string;
}

/**
 * Fetch upcoming Google Calendar events and return them.
 */
export async function listCalendarEvents(
  businessId: string,
  timeMin: string,
  timeMax: string,
): Promise<Array<{
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
}> | null> {
  const sb = getAdmin();
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
    console.error('[GCal] List events failed:', await res.text());
    return null;
  }

  const data = await res.json();
  const items = (data.items ?? []) as Array<{
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  }>;

  return items.map((item) => ({
    id: item.id,
    summary: item.summary ?? '(sans titre)',
    start: item.start?.dateTime ?? item.start?.date ?? '',
    end: item.end?.dateTime ?? item.end?.date ?? '',
    allDay: !item.start?.dateTime,
  }));
}
