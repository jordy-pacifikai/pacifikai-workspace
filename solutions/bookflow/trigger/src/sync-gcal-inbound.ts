import { schedules, logger } from "@trigger.dev/sdk";
import { listGCalEvents } from "./lib/gcal.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/** Convert a Date to HH:MM in a given timezone */
function toLocalTime(date: Date, tz: string): string {
  const parts = date.toLocaleString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // toLocaleString returns "14:30" or "09:05"
  const [h = "00", m = "00"] = parts.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

/** Convert a Date to YYYY-MM-DD in a given timezone */
function toLocalDate(date: Date, tz: string): string {
  const y = date.toLocaleString("en-US", { timeZone: tz, year: "numeric" });
  const m = date.toLocaleString("en-US", { timeZone: tz, month: "2-digit" });
  const d = date.toLocaleString("en-US", { timeZone: tz, day: "2-digit" });
  return `${y}-${m}-${d}`;
}

function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * Sync Google Calendar events → bookbot_blocked_slots + bookbot_appointments.
 * Runs every 15 minutes. For each business with GCal connected:
 * 1. Fetch events for next 7 days
 * 2. Upsert as blocked slots (source='gcal')
 * 3. Upsert as appointments (source='gcal') for dashboard visibility
 * 4. Remove stale gcal blocked slots + cancel stale gcal appointments
 */
export const syncGCalInbound = schedules.task({
  id: "sync-gcal-inbound",
  cron: "*/15 * * * *",
  run: async () => {
    // 1. Get all businesses with GCal connected
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?gcal_refresh_token=not.is.null&select=id,gcal_refresh_token,gcal_calendar_id,timezone`,
      { headers: supaHeaders() }
    );
    const businesses: { id: string; gcal_refresh_token: string; gcal_calendar_id: string; timezone?: string }[] = await bizRes.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      logger.info("No businesses with GCal connected");
      return { synced: 0 };
    }

    logger.info(`Syncing GCal for ${businesses.length} businesses`);

    let totalSynced = 0;

    for (const biz of businesses) {
      if (!biz.gcal_refresh_token || !biz.gcal_calendar_id) continue;

      try {
        const now = new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const events = await listGCalEvents(
          biz.gcal_refresh_token,
          biz.gcal_calendar_id,
          timeMin,
          timeMax
        );

        logger.info(`Business ${biz.id}: ${events.length} GCal events`);

        // Get existing gcal blocked slots for this business
        const existingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${biz.id}&source=eq.gcal&select=id,gcal_event_id`,
          { headers: supaHeaders() }
        );
        const existingSlots = await existingRes.json();
        const existingSlotIds = new Set(
          (Array.isArray(existingSlots) ? existingSlots : []).map(
            (s: { gcal_event_id: string }) => s.gcal_event_id
          )
        );

        // Get existing gcal appointments for this business
        const existingApptRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${biz.id}&source=eq.gcal&select=id,gcal_event_id`,
          { headers: supaHeaders() }
        );
        const existingAppts = await existingApptRes.json();
        const existingApptIds = new Set(
          (Array.isArray(existingAppts) ? existingAppts : []).map(
            (a: { gcal_event_id: string }) => a.gcal_event_id
          )
        );

        const gcalEventIds = new Set<string>();

        for (const event of events) {
          if (event.status === "cancelled") continue;
          gcalEventIds.add(event.id);

          // Parse start/end
          const startDT = event.start.dateTime;
          const startDate = event.start.date; // all-day events
          const endDT = event.end.dateTime;

          let date: string;
          let timeFrom: string | null = null;
          let timeTo: string | null = null;
          let allDay = false;

          const tz = biz.timezone ?? "Pacific/Tahiti";

          if (startDate && !startDT) {
            // All-day event
            date = startDate;
            allDay = true;
          } else if (startDT) {
            // Timed event — convert to business timezone (NOT UTC)
            const start = new Date(startDT);
            const end = new Date(endDT!);
            date = toLocalDate(start, tz);
            timeFrom = toLocalTime(start, tz);
            timeTo = toLocalTime(end, tz);
          } else {
            continue;
          }

          // Insert blocked slot if not already exists
          if (!existingSlotIds.has(event.id)) {
            await fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots`, {
              method: "POST",
              headers: { ...supaHeaders(), Prefer: "return=minimal" },
              body: JSON.stringify({
                business_id: biz.id,
                date,
                time_from: timeFrom,
                time_to: timeTo,
                all_day: allDay,
                reason: event.summary ?? "Google Calendar",
                source: "gcal",
                gcal_event_id: event.id,
              }),
            });
          }

          // Insert appointment for dashboard visibility (timed events only)
          if (!allDay && timeFrom && !existingApptIds.has(event.id)) {
            await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments`, {
              method: "POST",
              headers: { ...supaHeaders(), Prefer: "return=minimal" },
              body: JSON.stringify({
                business_id: biz.id,
                client_name: event.summary ?? "Google Calendar",
                service: "Google Calendar",
                appointment_date: date,
                time_slot: timeFrom,
                end_time: timeTo,
                status: "confirmed",
                source: "gcal",
                gcal_event_id: event.id,
              }),
            });
          }

          totalSynced++;
        }

        // Remove stale gcal blocked slots (event deleted from GCal)
        for (const existing of Array.isArray(existingSlots) ? existingSlots : []) {
          if (!gcalEventIds.has(existing.gcal_event_id)) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?id=eq.${existing.id}`,
              { method: "DELETE", headers: supaHeaders() }
            );
            logger.info(`Removed stale gcal slot ${existing.id}`);
          }
        }

        // Cancel stale gcal appointments (event deleted from GCal)
        for (const existing of Array.isArray(existingAppts) ? existingAppts : []) {
          if (!gcalEventIds.has(existing.gcal_event_id)) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${existing.id}`,
              {
                method: "PATCH",
                headers: supaHeaders(),
                body: JSON.stringify({ status: "cancelled" }),
              }
            );
            logger.info(`Cancelled stale gcal appointment ${existing.id}`);
          }
        }
      } catch (err) {
        logger.error(`GCal sync failed for business ${biz.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { synced: totalSynced, businesses: businesses.length };
  },
});
