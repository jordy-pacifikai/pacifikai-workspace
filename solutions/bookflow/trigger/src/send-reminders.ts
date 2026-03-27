import { schedules, logger, queue } from "@trigger.dev/sdk";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { buildBusinessConfig } from "./lib/config.js";
import { createNotification } from "./lib/notify.js";
import type { BusinessRow } from "./lib/config.js";

const reminderQueue = queue({ name: "reminders", concurrencyLimit: 1 });

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface Appointment {
  id: string;
  business_id: string;
  client_name: string;
  client_phone: string;
  service: string;
  appointment_date: string;
  time_slot: string;
  reminder_sent: string | null;
  status: string;
}

/**
 * Appointment reminders — runs every 30 minutes.
 *
 * Checks for upcoming confirmed appointments and sends WhatsApp reminders:
 * - 72h before (J-3 at ~19:00 business TZ) — early heads-up, time to reschedule
 * - Evening before (J-1 at ~19:00 business TZ) — most effective timing
 * - 2h before — last-chance confirmation request
 *
 * Also detects no-shows (confirmed appointments 15+ min past their time).
 *
 * Tracks sent reminders via `reminder_sent` column:
 * - null = no reminder sent
 * - "72h" = 3-day reminder sent
 * - "evening" = evening-before reminder sent
 * - "2h" = 2h reminder sent
 *
 * Backward compat: "24h" is treated same as "evening" for the 2h check.
 */
export const sendReminders = schedules.task({
  id: "send-appointment-reminders",
  cron: "*/30 * * * *",
  queue: reminderQueue,
  run: async () => {
    const now = new Date();

    // 1. Get all businesses + all relevant appointments in 2 parallel queries (eliminates N+1)
    // Date range: yesterday (for no-show) through 4 days out (for 72h reminder)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const fourDaysOut = new Date(now);
    fourDaysOut.setDate(fourDaysOut.getDate() + 4);
    const fourDaysStr = fourDaysOut.toISOString().slice(0, 10);

    const [bizRes, apptRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
        { headers: supaHeaders() }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_appointments?status=eq.confirmed&client_phone=not.is.null&appointment_date=gte.${yesterdayStr}&appointment_date=lte.${fourDaysStr}&select=id,business_id,client_name,client_phone,service,appointment_date,time_slot,reminder_sent,status`,
        { headers: supaHeaders() }
      ),
    ]);
    const businesses: BusinessRow[] = await bizRes.json();
    const allAppointments: Appointment[] = await apptRes.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return { sent: 0, businesses: 0 };
    }

    // Group appointments by business_id
    const apptsByBiz = new Map<string, Appointment[]>();
    if (Array.isArray(allAppointments)) {
      for (const appt of allAppointments) {
        const list = apptsByBiz.get(appt.business_id) ?? [];
        list.push(appt);
        apptsByBiz.set(appt.business_id, list);
      }
    }

    let totalSent = 0;
    let threeDayCount = 0;
    let eveningCount = 0;
    let twoHourCount = 0;
    let noShowCount = 0;

    for (const biz of businesses) {
      const appointments = apptsByBiz.get(biz.id);
      if (!appointments || appointments.length === 0) continue;

      const cfg = (biz.config ?? {}) as Record<string, unknown>;
      const reminderEvening = cfg.reminder_24h !== false; // reuse existing config flag
      const reminder2h = cfg.reminder_2h !== false; // default true

      if (!reminderEvening && !reminder2h) continue;

      const tz = biz.timezone ?? "Pacific/Tahiti";

      // Current hour in business timezone (for evening window check)
      const localTimeStr = now.toLocaleString("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false });
      const [localHour = 0, localMin = 0] = localTimeStr.split(":").map(Number);
      const localMinutes = localHour * 60 + localMin;
      const isEveningWindow = localMinutes >= 18 * 60 + 30 && localMinutes <= 19 * 60 + 30; // 18:30–19:30

      // Tomorrow's date in business timezone (DST-safe calendar day addition)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD

      // 3 days from now in business timezone (DST-safe calendar day addition)
      const threeDaysOut = new Date(now);
      threeDaysOut.setDate(threeDaysOut.getDate() + 3);
      const threeDaysOutStr = threeDaysOut.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD

      // 2h window: appointments between 1.5h and 2.5h from now
      const h2_min = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
      const h2_max = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

      // No-show cutoff: 15 minutes ago
      const noShowCutoff = new Date(now.getTime() - 15 * 60 * 1000);

      const businessConfig = buildBusinessConfig(biz);

      for (const appt of appointments) {
        if (!appt.client_phone || !appt.appointment_date || !appt.time_slot) continue;

        const apptDateTime = parseApptDateTime(appt.appointment_date, appt.time_slot, tz);
        if (!apptDateTime) continue;

        // --- No-show detection: appointment time + 15min < now, still confirmed ---
        if (apptDateTime.getTime() < noShowCutoff.getTime()) {
          try {
            const marked = await markNoShow(appt.id);
            if (marked) {
              // Send WhatsApp to business owner
              if (businessConfig.humanPhone) {
                const msg = formatNoShowBusiness(appt);
                await sendWhatsApp(businessConfig.humanPhone, msg, businessConfig);
              }
              // Create in-app notification
              await createNotification({
                businessId: biz.id,
                type: "no_show",
                title: `No-show : ${appt.client_name}`,
                message: `${appt.client_name} n'est pas venu pour ${appt.service || "rendez-vous"} à ${appt.time_slot}`,
                metadata: { appointmentId: appt.id, clientPhone: appt.client_phone },
              });

              // Send follow-up message to CLIENT with rebooking link
              try {
                const slug = biz.booking_slug ?? biz.id;
                const bookingUrl = `https://vea.pacifikai.com/book/${slug}`;
                const clientMsg = formatNoShowClient(appt, biz.name, bookingUrl);
                await sendWhatsApp(appt.client_phone, clientMsg, businessConfig);
                logger.info(`No-show client follow-up sent to ${appt.client_phone}`);
              } catch (followupErr) {
                logger.error(`Failed to send no-show client follow-up`, {
                  to: appt.client_phone,
                  error: followupErr instanceof Error ? followupErr.message : String(followupErr),
                });
              }

              noShowCount++;
              logger.info(`No-show detected: ${appt.client_name} for ${appt.appointment_date} ${appt.time_slot}`);
            }
          } catch (err) {
            logger.error(`Failed no-show handling for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
          continue; // past appointment, skip reminder checks
        }

        // Skip past appointments (within 15min grace — handled above)
        if (apptDateTime.getTime() < now.getTime()) continue;

        // --- 72h reminder (J-3 at ~19:00 local) ---
        if (
          reminderEvening &&
          isEveningWindow &&
          !appt.reminder_sent &&
          appt.appointment_date === threeDaysOutStr
        ) {
          const msg = formatReminder72h(appt, biz.name);
          try {
            await sendWhatsApp(appt.client_phone, msg, businessConfig);
            await markReminderSent(appt.id, "72h");
            totalSent++;
            threeDayCount++;
            logger.info(`72h reminder sent to ${appt.client_phone} for ${appt.appointment_date} ${appt.time_slot}`);
          } catch (err) {
            logger.error(`Failed to send 72h reminder for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // --- Evening reminder (J-1 at ~19:00 local) ---
        if (
          reminderEvening &&
          isEveningWindow &&
          (appt.reminder_sent === "72h" || !appt.reminder_sent) &&
          appt.appointment_date === tomorrowStr
        ) {
          const msg = formatReminderEvening(appt, biz.name);
          try {
            await sendWhatsApp(appt.client_phone, msg, businessConfig);
            await markReminderSent(appt.id, "evening");
            totalSent++;
            eveningCount++;
            logger.info(`Evening reminder sent to ${appt.client_phone} for ${appt.appointment_date} ${appt.time_slot}`);
          } catch (err) {
            logger.error(`Failed to send evening reminder for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // --- 2h reminder ---
        if (
          reminder2h &&
          appt.reminder_sent !== "2h" &&
          apptDateTime.getTime() >= h2_min.getTime() &&
          apptDateTime.getTime() <= h2_max.getTime()
        ) {
          const msg = formatReminder2h(appt, biz.name);
          try {
            await sendWhatsApp(appt.client_phone, msg, businessConfig);
            await markReminderSent(appt.id, "2h");
            totalSent++;
            twoHourCount++;
            logger.info(`2h reminder sent to ${appt.client_phone} for ${appt.appointment_date} ${appt.time_slot}`);
          } catch (err) {
            logger.error(`Failed to send 2h reminder for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }
    }

    logger.info(`Reminders sent: ${totalSent} (72h: ${threeDayCount}, evening: ${eveningCount}, 2h: ${twoHourCount}), no-shows: ${noShowCount}`);
    return {
      sent: totalSent,
      threeDayReminders: threeDayCount,
      eveningReminders: eveningCount,
      twoHourReminders: twoHourCount,
      noShows: noShowCount,
      businesses: businesses.length,
    };
  },
});

/** Parse "2026-03-05" + "14:30" into a Date in the given timezone */
function parseApptDateTime(date: string, time: string, tz: string): Date | null {
  try {
    // Build an ISO string and parse it as if it's in the given timezone
    const isoStr = `${date}T${time}:00`;
    // Create a date formatter that tells us the UTC offset for this timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // We need to find the UTC offset for this timezone at this date
    // Create the date as UTC first, then adjust
    const naiveDate = new Date(isoStr + "Z"); // treat as UTC
    const parts = formatter.formatToParts(naiveDate);
    const getP = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
    const tzDate = new Date(
      `${getP("year")}-${getP("month")}-${getP("day")}T${getP("hour")}:${getP("minute")}:${getP("second")}Z`
    );
    // The offset is the difference between naive UTC and what that UTC time looks like in the timezone
    const offsetMs = tzDate.getTime() - naiveDate.getTime();
    // The actual UTC time for the appointment is: naive - offset
    return new Date(naiveDate.getTime() - offsetMs);
  } catch {
    return null;
  }
}

function formatReminder72h(appt: Appointment, businessName: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, un rappel : tu as ${service} prévu le ${appt.appointment_date} à ${appt.time_slot} chez ${businessName}. Si besoin de modifier, réponds MODIFIER. À bientôt !`;
}

function formatReminderEvening(appt: Appointment, businessName: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, petit rappel pour demain : ${service} à ${appt.time_slot} chez ${businessName}. Réponds OK pour confirmer ou ANNULER si empêché. À demain !`;
}

function formatReminder2h(appt: Appointment, businessName: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, ton RDV chez ${businessName} pour ${service} est dans 2h (${appt.time_slot}). Réponds OK pour confirmer ou ANNULER si empêché. À tout à l'heure !`;
}

function formatNoShowBusiness(appt: Appointment): string {
  const clientName = appt.client_name || "Client";
  const service = appt.service || "rendez-vous";
  return `⚠️ No-show : ${clientName} n'est pas venu pour ${service} à ${appt.time_slot}. Souhaitez-vous le recontacter ?`;
}

function formatNoShowClient(appt: Appointment, businessName: string, bookingUrl: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, on a remarqué que tu n'as pas pu venir pour ${service} chez ${businessName} aujourd'hui. Pas de souci ! Tu peux facilement reprendre rendez-vous ici : ${bookingUrl}\nÀ bientôt 😊`;
}

async function markReminderSent(appointmentId: string, level: "72h" | "evening" | "2h"): Promise<boolean> {
  // Conditional PATCH: only update if reminder_sent is still at the expected previous state
  // For 72h: reminder_sent must be null (first reminder)
  // For evening: accept null (72h was skipped) or "72h"
  // For 2h: accept null, "72h", "evening", or legacy "24h"
  const filter = level === "72h"
    ? `reminder_sent=is.null`
    : level === "evening"
    ? `or=(reminder_sent.is.null,reminder_sent.eq.72h)`
    : `or=(reminder_sent.is.null,reminder_sent.in.(72h,evening,24h))`;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&${filter}`,
    {
      method: "PATCH",
      headers: { ...supaHeaders(), Prefer: "return=headers-only" },
      body: JSON.stringify({ reminder_sent: level }),
    }
  );
  // content-range format: "items START-END/TOTAL" or "items */TOTAL"
  const range = res.headers.get("content-range");
  if (range) {
    const total = range.split("/")[1];
    if (total === "0") return false; // no rows matched
  }
  return res.ok;
}

/** Mark a confirmed appointment as no-show. Returns true if the row was updated. */
async function markNoShow(appointmentId: string): Promise<boolean> {
  // Conditional PATCH: only update if status is still "confirmed"
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&status=eq.confirmed`,
    {
      method: "PATCH",
      headers: { ...supaHeaders(), Prefer: "return=headers-only" },
      body: JSON.stringify({ status: "no_show" }),
    }
  );
  const range = res.headers.get("content-range");
  if (range) {
    const total = range.split("/")[1];
    if (total === "0") return false;
  }
  return res.ok;
}
