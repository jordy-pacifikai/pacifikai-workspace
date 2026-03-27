import { schedules, logger, queue } from "@trigger.dev/sdk";
import { supaHeaders } from "./lib/supabase-headers.js";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { buildBusinessConfig } from "./lib/config.js";
import { createNotification } from "./lib/notify.js";
import type { BusinessRow } from "./lib/config.js";

const waitlistQueue = queue({ name: "waitlist", concurrencyLimit: 1 });

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface WaitlistEntry {
  id: string;
  business_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  service: string | null;
  preferred_days: number[] | null;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  status: string;
  position: number | null;
}

interface Appointment {
  time_slot: string;
  end_time: string | null;
}

/**
 * Process waitlist — runs every 30 minutes.
 *
 * For each business with 'waiting' entries:
 * 1. Get upcoming dates that match preferred_days
 * 2. Check if slots are available (no conflicting appointments/blocked slots)
 * 3. Notify matching clients via WhatsApp + in-app notification
 * 4. Mark entries as 'notified'
 */
export const processWaitlist = schedules.task({
  id: "process-waitlist",
  cron: "15,45 * * * *", // :15 and :45 of every hour
  queue: waitlistQueue,
  run: async () => {
    // 0. Expire stale entries (waiting > 30 days, or notified > 48h with no booking)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_waitlist?status=eq.waiting&created_at=lt.${thirtyDaysAgo}`,
      {
        method: "PATCH",
        headers: { ...supaHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ status: "expired", updated_at: new Date().toISOString() }),
      },
    );

    await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_waitlist?status=eq.notified&notified_at=lt.${fortyEightHoursAgo}`,
      {
        method: "PATCH",
        headers: { ...supaHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ status: "expired", updated_at: new Date().toISOString() }),
      },
    );

    // 1. Fetch all businesses that have waiting entries
    const waitingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_waitlist?status=eq.waiting&select=id,business_id,client_name,client_phone,client_email,service,preferred_days,preferred_time_start,preferred_time_end,position&order=position.asc.nullslast,created_at.asc`,
      { headers: supaHeaders() },
    );
    if (!waitingRes.ok) {
      logger.error("Failed to fetch waitlist entries", { status: waitingRes.status });
      return { processed: 0 };
    }
    const entries = (await waitingRes.json()) as WaitlistEntry[];

    if (entries.length === 0) {
      logger.info("No waiting entries to process");
      return { processed: 0 };
    }

    // Group by business_id
    const byBusiness = new Map<string, WaitlistEntry[]>();
    for (const entry of entries) {
      const list = byBusiness.get(entry.business_id) ?? [];
      list.push(entry);
      byBusiness.set(entry.business_id, list);
    }

    let totalNotified = 0;

    for (const [businessId, businessEntries] of byBusiness) {
      try {
        const notified = await processBusinessWaitlist(businessId, businessEntries);
        totalNotified += notified;
      } catch (err) {
        logger.error("Error processing waitlist for business", {
          businessId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info("Waitlist processing complete", {
      businesses: byBusiness.size,
      totalWaiting: entries.length,
      totalNotified,
    });

    return { processed: totalNotified };
  },
});

async function processBusinessWaitlist(
  businessId: string,
  entries: WaitlistEntry[],
): Promise<number> {
  // Fetch business details for WhatsApp config
  const bizRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
    { headers: supaHeaders() },
  );
  const bizData = await bizRes.json();
  const biz: BusinessRow | null = Array.isArray(bizData) && bizData.length > 0 ? bizData[0] : null;
  if (!biz) return 0;

  const tz = biz.timezone ?? "Pacific/Tahiti";
  const cfg = (biz.config ?? {}) as Record<string, unknown>;
  const openingHours = (cfg.opening_hours ?? cfg.openingHours ?? {}) as Record<string, string>;
  const bufferMinutes = Number(cfg.buffer_minutes) || 0;
  const bookingSlug = biz.booking_slug ?? businessId;

  // Get next 7 days
  const dates = getNext7Days(tz);

  let notified = 0;

  for (const entry of entries) {
    // Check if any preferred day/time has availability
    const matchingSlot = await findMatchingSlot(
      businessId,
      entry,
      dates,
      openingHours,
      bufferMinutes,
      tz,
    );

    if (!matchingSlot) continue;

    // Notify the client
    const businessConfig = buildBusinessConfig(biz);
    businessConfig.openingHours = openingHours;

    const bookLink = `https://vea.pacifikai.com/book/${bookingSlug}`;
    const dateFr = new Date(matchingSlot.date + "T12:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const name = entry.client_name || "Bonjour";
    const servicePart = entry.service ? ` pour ${entry.service}` : "";

    const msg =
      `${name}, bonne nouvelle !\n\n` +
      `Un creneau s'est libere${servicePart} :\n` +
      `\u{1F4C5} ${dateFr}\n` +
      `\u{1F550} ${matchingSlot.slot}\n` +
      `\u{1F4CD} ${biz.name ?? "Votre prestataire"}\n\n` +
      `Reservez vite avant qu'il ne soit pris :\n${bookLink}\n\n` +
      `Ce message est envoye car vous etes sur notre liste d'attente.`;

    // Send WhatsApp if phone is available
    if (entry.client_phone) {
      try {
        await sendWhatsApp(entry.client_phone, msg, businessConfig);
      } catch (err) {
        logger.warn("Waitlist WhatsApp send failed", {
          entryId: entry.id,
          to: entry.client_phone,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Mark as notified
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_waitlist?id=eq.${entry.id}`,
      {
        method: "PATCH",
        headers: { ...supaHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "notified",
          notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      },
    );

    if (!patchRes.ok) {
      logger.warn("Failed to update waitlist entry status", { entryId: entry.id });
    }

    // Create in-app notification for business owner
    await createNotification({
      businessId,
      type: "waitlist_update",
      title: `Liste d'attente : ${entry.client_name}`,
      message: `${entry.client_name} a ete notifie d'un creneau disponible${servicePart} le ${dateFr} a ${matchingSlot.slot}`,
      metadata: { waitlistEntryId: entry.id, date: matchingSlot.date, slot: matchingSlot.slot },
    });

    notified++;
  }

  return notified;
}

/**
 * Find the first available slot that matches a waitlist entry's preferences.
 */
async function findMatchingSlot(
  businessId: string,
  entry: WaitlistEntry,
  dates: Array<{ date: string; dayOfWeek: number }>,
  openingHours: Record<string, string>,
  bufferMinutes: number,
  tz: string,
): Promise<{ date: string; slot: string } | null> {
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  for (const { date, dayOfWeek } of dates) {
    // Check preferred_days filter
    if (entry.preferred_days && entry.preferred_days.length > 0) {
      if (!entry.preferred_days.includes(dayOfWeek)) continue;
    }

    const dayKey = dayNames[dayOfWeek] as string;
    const hoursStr = openingHours[dayKey];
    if (!hoursStr) continue; // Closed this day

    // Parse opening hours (format: "08:00-17:00" or "08:00-12:00,13:00-17:00")
    const ranges = hoursStr.split(",").map((r: string) => r.trim());
    const allSlots: string[] = [];

    for (const range of ranges) {
      const parts = range.split("-");
      if (parts.length !== 2) continue;
      const open = parts[0]!;
      const close = parts[1]!;
      const slots = generateSlots(open, close, 30); // 30min default
      allSlots.push(...slots);
    }

    // Filter by preferred time window
    const filtered = allSlots.filter((slot) => {
      if (entry.preferred_time_start && slot < entry.preferred_time_start) return false;
      if (entry.preferred_time_end && slot >= entry.preferred_time_end) return false;
      return true;
    });

    if (filtered.length === 0) continue;

    // Check which slots are actually available (no existing bookings)
    const bookedRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&status=in.(confirmed,pending)&source=neq.test&select=time_slot,end_time`,
      { headers: supaHeaders() },
    );
    const booked: Appointment[] = bookedRes.ok ? await bookedRes.json() : [];

    const blockedRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&date=eq.${date}&select=time_from,time_to,all_day`,
      { headers: supaHeaders() },
    );
    const blocked: Array<{ time_from: string | null; time_to: string | null; all_day: boolean }> =
      blockedRes.ok ? await blockedRes.json() : [];

    // If any all-day block exists, skip entire day
    if (blocked.some((b) => b.all_day)) continue;

    // Find first available slot
    for (const slot of filtered) {
      if (isSlotAvailable(slot, 30, booked, blocked, bufferMinutes)) {
        return { date, slot };
      }
    }
  }

  return null;
}

/**
 * Check if a slot is available (no conflicts with booked appointments or blocked slots).
 */
function isSlotAvailable(
  slot: string,
  duration: number,
  booked: Appointment[],
  blocked: Array<{ time_from: string | null; time_to: string | null; all_day: boolean }>,
  bufferMinutes: number,
): boolean {
  const slotStart = timeToMinutes(slot);
  const slotEnd = slotStart + duration;

  // Check against booked appointments
  for (const appt of booked) {
    const apptStart = timeToMinutes(appt.time_slot) - bufferMinutes;
    const apptEnd = appt.end_time
      ? timeToMinutes(appt.end_time) + bufferMinutes
      : timeToMinutes(appt.time_slot) + 30 + bufferMinutes;

    if (slotStart < apptEnd && slotEnd > apptStart) return false;
  }

  // Check against blocked slots
  for (const blk of blocked) {
    if (blk.all_day) return false;
    if (!blk.time_from || !blk.time_to) continue;
    const blkStart = timeToMinutes(blk.time_from);
    const blkEnd = timeToMinutes(blk.time_to);
    if (slotStart < blkEnd && slotEnd > blkStart) return false;
  }

  return true;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function generateSlots(open: string, close: string, interval: number): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(open);
  const end = timeToMinutes(close);

  while (current + interval <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += interval;
  }

  return slots;
}

function getNext7Days(tz: string): Array<{ date: string; dayOfWeek: number }> {
  const days: Array<{ date: string; dayOfWeek: number }> = [];
  const now = new Date();

  for (let i = 1; i <= 7; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-CA", { timeZone: tz });
    const dow = new Date(dateStr + "T12:00:00").getDay();
    days.push({ date: dateStr, dayOfWeek: dow });
  }

  return days;
}
