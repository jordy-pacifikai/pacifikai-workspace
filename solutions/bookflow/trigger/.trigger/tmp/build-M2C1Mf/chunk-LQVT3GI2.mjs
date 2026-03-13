import {
  __name,
  init_esm
} from "./chunk-DB4FHRYB.mjs";

// src/lib/gcal.ts
init_esm();
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
async function refreshAccessToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal token refresh failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}
__name(refreshAccessToken, "refreshAccessToken");
async function createGCalEvent(params) {
  const accessToken = await refreshAccessToken(params.refreshToken);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description ?? "",
        start: {
          dateTime: params.startDateTime,
          timeZone: params.timezone
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: params.timezone
        },
        reminders: { useDefault: true }
      })
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal create event failed: ${res.status} ${err}`);
  }
  const event = await res.json();
  return event.id;
}
__name(createGCalEvent, "createGCalEvent");
async function deleteGCalEvent(refreshToken, calendarId, eventId) {
  const accessToken = await refreshAccessToken(refreshToken);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.text();
    throw new Error(`GCal delete event failed: ${res.status} ${err}`);
  }
}
__name(deleteGCalEvent, "deleteGCalEvent");
async function listGCalEvents(refreshToken, calendarId, timeMin, timeMax) {
  const accessToken = await refreshAccessToken(refreshToken);
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250"
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal list events failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.items ?? [];
}
__name(listGCalEvents, "listGCalEvents");
async function listCalendars(accessToken) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCal list calendars failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return (data.items ?? []).map((c) => ({
    id: c.id,
    summary: c.summary,
    primary: Boolean(c.primary)
  }));
}
__name(listCalendars, "listCalendars");

export {
  refreshAccessToken,
  createGCalEvent,
  deleteGCalEvent,
  listGCalEvents,
  listCalendars
};
//# sourceMappingURL=chunk-LQVT3GI2.mjs.map
