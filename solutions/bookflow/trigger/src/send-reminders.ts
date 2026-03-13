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
 * - 24h before (if business has reminder_24h enabled)
 * - 2h before (if business has reminder_2h enabled)
 *
 * Tracks sent reminders via `reminder_sent` column:
 * - null = no reminder sent
 * - "24h" = 24h reminder sent
 * - "2h" = both reminders sent (or only 2h if 24h disabled)
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

    for (const biz of businesses) {
      const cfg = (biz.config ?? {}) as Record<string, unknown>;
      const reminder24h = cfg.reminder_24h !== false; // default true
      const reminder2h = cfg.reminder_2h !== false; // default true

      if (!reminder24h && !reminder2h) continue;

      const tz = biz.timezone ?? "Pacific/Tahiti";
      const now = new Date();

      // Calculate time windows in business timezone
      // 24h window: appointments between 23h and 25h from now
      // 2h window: appointments between 1.5h and 2.5h from now
      const h24_min = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const h24_max = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      const h2_min = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
      const h2_max = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

      // 2. Get confirmed appointments for this business in the next 25h
      const apptRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${biz.id}&status=eq.confirmed&client_phone=not.is.null&select=id,business_id,client_name,client_phone,service,appointment_date,time_slot,reminder_sent`,
        { headers: supaHeaders() }
      );
      const appointments: Appointment[] = await apptRes.json();

      if (!Array.isArray(appointments) || appointments.length === 0) continue;

      const businessConfig = buildBusinessConfig(biz);

      for (const appt of appointments) {
        if (!appt.client_phone || !appt.appointment_date || !appt.time_slot) continue;

        // Build appointment datetime in business timezone
        const apptDateTime = parseApptDateTime(appt.appointment_date, appt.time_slot, tz);
        if (!apptDateTime) continue;

        // Skip past appointments
        if (apptDateTime.getTime() < now.getTime()) continue;

        // Check 24h reminder
        if (
          reminder24h &&
          !appt.reminder_sent &&
          apptDateTime.getTime() >= h24_min.getTime() &&
          apptDateTime.getTime() <= h24_max.getTime()
        ) {
          const msg = formatReminder24h(appt, biz.name);
          try {
            await sendWhatsApp(appt.client_phone, msg, businessConfig);
            await markReminderSent(appt.id, "24h");
            totalSent++;
            logger.info(`24h reminder sent to ${appt.client_phone} for ${appt.appointment_date} ${appt.time_slot}`);
          } catch (err) {
            logger.error(`Failed to send 24h reminder for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // Check 2h reminder
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
            logger.info(`2h reminder sent to ${appt.client_phone} for ${appt.appointment_date} ${appt.time_slot}`);
          } catch (err) {
            logger.error(`Failed to send 2h reminder for appointment ${appt.id}`, {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }
    }

    logger.info(`Reminders sent: ${totalSent}`);
    return { sent: totalSent, businesses: businesses.length };
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

function formatReminder24h(appt: Appointment, businessName: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, petit rappel : vous avez rendez-vous demain a ${appt.time_slot} chez ${businessName} pour ${service}. A demain !`;
}

function formatReminder2h(appt: Appointment, businessName: string): string {
  const name = appt.client_name || "Bonjour";
  const service = appt.service || "votre rendez-vous";
  return `${name}, rappel : votre rendez-vous chez ${businessName} pour ${service} est dans 2 heures (${appt.time_slot}). A tout a l'heure !`;
}

async function markReminderSent(appointmentId: string, level: "24h" | "2h"): Promise<boolean> {
  // Conditional PATCH: only update if reminder_sent is still at the expected previous state
  const expectedPrev = level === "24h" ? "is.null" : "eq.24h";
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&reminder_sent=${expectedPrev}`,
    {
      method: "PATCH",
      headers: { ...supaHeaders(), Prefer: "return=headers-only" },
      body: JSON.stringify({ reminder_sent: level }),
    }
  );
  // Check if any row was actually updated (Content-Range header)
  const range = res.headers.get("content-range");
  if (range && range.includes("0")) return false; // no rows matched
  return res.ok;
}
