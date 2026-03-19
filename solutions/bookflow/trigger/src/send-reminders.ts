import { schedules, logger, queue } from "@trigger.dev/sdk";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import type { BusinessConfig } from "./lib/config.js";

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

interface Business {
  id: string;
  name: string;
  config: Record<string, unknown>;
  phone?: string;
  twilio_sid?: string;
  twilio_token?: string;
  twilio_from?: string;
  phone_number_id?: string;
  meta_access_token?: string;
  timezone?: string;
}

function buildBusinessConfig(biz: Business): BusinessConfig {
  const cfg = (biz.config ?? {}) as Record<string, unknown>;
  return {
    businessId: biz.id,
    businessName: biz.name ?? "",
    services: [],
    openingHours: {},
    timezone: biz.timezone ?? "Pacific/Tahiti",
    humanPhone: (cfg.human_phone as string) ?? (biz.phone as string) ?? "",
    provider: biz.phone_number_id ? "meta" : "twilio",
    twilioSid: biz.twilio_sid,
    twilioToken: biz.twilio_token,
    twilioFrom: biz.twilio_from,
    metaPhoneNumberId: biz.phone_number_id,
    metaAccessToken: biz.meta_access_token,
    chatbotConfig: cfg,
  };
}

/**
 * Appointment reminders — runs every 30 minutes.
 *
 * Checks for upcoming confirmed appointments and sends WhatsApp reminders:
 * - Evening before (~19:00 business TZ) — most effective timing
 * - 2h before — last-chance confirmation request
 *
 * Also detects no-shows (confirmed appointments 15+ min past their time).
 *
 * Tracks sent reminders via `reminder_sent` column:
 * - null = no reminder sent
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
    // 1. Get all businesses
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone`,
      { headers: supaHeaders() }
    );
    const businesses: Business[] = await bizRes.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return { sent: 0, businesses: 0 };
    }

    let totalSent = 0;
    let eveningCount = 0;
    let twoHourCount = 0;
    let noShowCount = 0;

    for (const biz of businesses) {
      const cfg = (biz.config ?? {}) as Record<string, unknown>;
      const reminderEvening = cfg.reminder_24h !== false; // reuse existing config flag
      const reminder2h = cfg.reminder_2h !== false; // default true

      if (!reminderEvening && !reminder2h) continue;

      const tz = biz.timezone ?? "Pacific/Tahiti";
      const now = new Date();

      // Current hour in business timezone (for evening window check)
      const localTimeStr = now.toLocaleString("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false });
      const [localHour = 0, localMin = 0] = localTimeStr.split(":").map(Number);
      const localMinutes = localHour * 60 + localMin;
      const isEveningWindow = localMinutes >= 18 * 60 + 30 && localMinutes <= 19 * 60 + 30; // 18:30–19:30

      // Tomorrow's date in business timezone (for evening reminder)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD

      // 2h window: appointments between 1.5h and 2.5h from now
      const h2_min = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
      const h2_max = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

      // No-show cutoff: 15 minutes ago
      const noShowCutoff = new Date(now.getTime() - 15 * 60 * 1000);

      // 2. Get appointments for this business (confirmed, with phone)
      const apptRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${biz.id}&status=eq.confirmed&client_phone=not.is.null&select=id,business_id,client_name,client_phone,service,appointment_date,time_slot,reminder_sent,status`,
        { headers: supaHeaders() }
      );
      const appointments: Appointment[] = await apptRes.json();

      if (!Array.isArray(appointments) || appointments.length === 0) continue;

      const businessConfig = buildBusinessConfig(biz);

      for (const appt of appointments) {
        if (!appt.client_phone || !appt.appointment_date || !appt.time_slot) continue;

        const apptDateTime = parseApptDateTime(appt.appointment_date, appt.time_slot, tz);
        if (!apptDateTime) continue;

        // --- No-show detection: appointment time + 15min < now, still confirmed ---
        if (apptDateTime.getTime() < noShowCutoff.getTime()) {
          try {
            const marked = await markNoShow(appt.id);
            if (marked && businessConfig.humanPhone) {
              const msg = formatNoShowBusiness(appt);
              await sendWhatsApp(businessConfig.humanPhone, msg, businessConfig);
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

        // --- Evening reminder (J-1 at ~19:00 local) ---
        if (
          reminderEvening &&
          isEveningWindow &&
          !appt.reminder_sent &&
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

    logger.info(`Reminders sent: ${totalSent} (evening: ${eveningCount}, 2h: ${twoHourCount}), no-shows: ${noShowCount}`);
    return {
      sent: totalSent,
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

async function markReminderSent(appointmentId: string, level: "evening" | "2h"): Promise<boolean> {
  // Conditional PATCH: only update if reminder_sent is still at the expected previous state
  // Backward compat: for 2h, accept both "evening" and legacy "24h" as valid previous states
  const expectedPrev = level === "evening"
    ? "is.null"
    : "in.(evening,24h)"; // accept both evening and legacy 24h
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&reminder_sent=${expectedPrev}`,
    {
      method: "PATCH",
      headers: { ...supaHeaders(), Prefer: "return=headers-only" },
      body: JSON.stringify({ reminder_sent: level }),
    }
  );
  const range = res.headers.get("content-range");
  if (range && range.includes("0")) return false; // no rows matched
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
  if (range && range.includes("0")) return false;
  return res.ok;
}
