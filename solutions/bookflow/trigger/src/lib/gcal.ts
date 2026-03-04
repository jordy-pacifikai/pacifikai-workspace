/**
 * Google Calendar API v3 — raw fetch (no googleapis SDK dependency).
 * Uses OAuth2 refresh tokens per-business to create/delete/list events.
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export interface GCalEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  status: string;
}

/**
 * Exchange refresh token for a fresh access token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal token refresh failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

/**
 * Create a calendar event. Returns the event ID.
 */
export async function createGCalEvent(params: {
  refreshToken: string;
  calendarId: string;
  summary: string;
  startDateTime: string; // ISO8601 e.g. "2026-03-15T09:00:00"
  endDateTime: string;
  description?: string;
  timezone: string;
}): Promise<string> {
  const accessToken = await refreshAccessToken(params.refreshToken);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description ?? "",
        start: {
          dateTime: params.startDateTime,
          timeZone: params.timezone,
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: params.timezone,
        },
        reminders: { useDefault: true },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal create event failed: ${res.status} ${err}`);
  }

  const event = await res.json();
  return event.id as string;
}

/**
 * Delete a calendar event.
 */
export async function deleteGCalEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const accessToken = await refreshAccessToken(refreshToken);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  // 404 or 410 = already deleted, not an error
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.text();
    throw new Error(`GCal delete event failed: ${res.status} ${err}`);
  }
}

/**
 * List events for a calendar within a time range.
 */
export async function listGCalEvents(
  refreshToken: string,
  calendarId: string,
  timeMin: string, // ISO8601
  timeMax: string  // ISO8601
): Promise<GCalEvent[]> {
  const accessToken = await refreshAccessToken(refreshToken);

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal list events failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return (data.items ?? []) as GCalEvent[];
}

/**
 * List available calendars for a user (after OAuth).
 */
export async function listCalendars(
  accessToken: string
): Promise<{ id: string; summary: string; primary: boolean }[]> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal list calendars failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return (data.items ?? []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    summary: c.summary as string,
    primary: Boolean(c.primary),
  }));
}
