import {
  logger,
  schedules_exports
} from "../../../../../../../../chunk-G5XPZL6L.mjs";
import "../../../../../../../../chunk-LQDRVYE2.mjs";
import {
  listGCalEvents
} from "../../../../../../../../chunk-LQVT3GI2.mjs";
import "../../../../../../../../chunk-ALSC375A.mjs";
import {
  __name,
  init_esm
} from "../../../../../../../../chunk-DB4FHRYB.mjs";

// src/sync-gcal-inbound.ts
init_esm();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
function toLocalTime(date, tz) {
  const parts = date.toLocaleString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const [h = "00", m = "00"] = parts.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}
__name(toLocalTime, "toLocalTime");
function toLocalDate(date, tz) {
  const y = date.toLocaleString("en-US", { timeZone: tz, year: "numeric" });
  const m = date.toLocaleString("en-US", { timeZone: tz, month: "2-digit" });
  const d = date.toLocaleString("en-US", { timeZone: tz, day: "2-digit" });
  return `${y}-${m}-${d}`;
}
__name(toLocalDate, "toLocalDate");
function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
}
__name(supaHeaders, "supaHeaders");
var syncGCalInbound = schedules_exports.task({
  id: "sync-gcal-inbound",
  cron: "*/15 * * * *",
  run: /* @__PURE__ */ __name(async () => {
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?gcal_refresh_token=not.is.null&select=id,gcal_refresh_token,gcal_calendar_id,timezone`,
      { headers: supaHeaders() }
    );
    const businesses = await bizRes.json();
    if (!Array.isArray(businesses) || businesses.length === 0) {
      logger.info("No businesses with GCal connected");
      return { synced: 0 };
    }
    logger.info(`Syncing GCal for ${businesses.length} businesses`);
    let totalSynced = 0;
    for (const biz of businesses) {
      if (!biz.gcal_refresh_token || !biz.gcal_calendar_id) continue;
      try {
        const now = /* @__PURE__ */ new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3).toISOString();
        const events = await listGCalEvents(
          biz.gcal_refresh_token,
          biz.gcal_calendar_id,
          timeMin,
          timeMax
        );
        logger.info(`Business ${biz.id}: ${events.length} GCal events`);
        const existingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${biz.id}&source=eq.gcal&select=id,gcal_event_id`,
          { headers: supaHeaders() }
        );
        const existingSlots = await existingRes.json();
        const existingSlotIds = new Set(
          (Array.isArray(existingSlots) ? existingSlots : []).map(
            (s) => s.gcal_event_id
          )
        );
        const existingApptRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${biz.id}&source=eq.gcal&select=id,gcal_event_id`,
          { headers: supaHeaders() }
        );
        const existingAppts = await existingApptRes.json();
        const existingApptIds = new Set(
          (Array.isArray(existingAppts) ? existingAppts : []).map(
            (a) => a.gcal_event_id
          )
        );
        const gcalEventIds = /* @__PURE__ */ new Set();
        for (const event of events) {
          if (event.status === "cancelled") continue;
          gcalEventIds.add(event.id);
          const startDT = event.start.dateTime;
          const startDate = event.start.date;
          const endDT = event.end.dateTime;
          let date;
          let timeFrom = null;
          let timeTo = null;
          let allDay = false;
          const tz = biz.timezone ?? "Pacific/Tahiti";
          if (startDate && !startDT) {
            date = startDate;
            allDay = true;
          } else if (startDT) {
            const start = new Date(startDT);
            const end = new Date(endDT);
            date = toLocalDate(start, tz);
            timeFrom = toLocalTime(start, tz);
            timeTo = toLocalTime(end, tz);
          } else {
            continue;
          }
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
                gcal_event_id: event.id
              })
            });
          }
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
                gcal_event_id: event.id
              })
            });
          }
          totalSynced++;
        }
        for (const existing of Array.isArray(existingSlots) ? existingSlots : []) {
          if (!gcalEventIds.has(existing.gcal_event_id)) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?id=eq.${existing.id}`,
              { method: "DELETE", headers: supaHeaders() }
            );
            logger.info(`Removed stale gcal slot ${existing.id}`);
          }
        }
        for (const existing of Array.isArray(existingAppts) ? existingAppts : []) {
          if (!gcalEventIds.has(existing.gcal_event_id)) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${existing.id}`,
              {
                method: "PATCH",
                headers: supaHeaders(),
                body: JSON.stringify({ status: "cancelled" })
              }
            );
            logger.info(`Cancelled stale gcal appointment ${existing.id}`);
          }
        }
      } catch (err) {
        logger.error(`GCal sync failed for business ${biz.id}`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    return { synced: totalSynced, businesses: businesses.length };
  }, "run")
});
export {
  syncGCalInbound
};
//# sourceMappingURL=sync-gcal-inbound.mjs.map
