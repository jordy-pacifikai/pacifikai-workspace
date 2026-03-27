export interface DateOption {
  value: string; // "2026-03-01"
  label: string; // "Sam 1/3"
}

export interface TimeSlot {
  value: string; // "09:00"
  label: string; // "9h00"
}

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function generateAvailableDates(
  openingHours: Record<string, string>,
  count = 3,
  blockedDates?: Set<string>,
  timezone = "Pacific/Tahiti",
): DateOption[] {
  const now = new Date();
  const dates: DateOption[] = [];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  for (let d = 1; dates.length < count && d < 14; d++) {
    // Use business timezone to compute "today + d days" correctly
    const future = new Date(now);
    future.setDate(future.getDate() + d);
    const dateStr = future.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
    const dayIdx = new Date(`${dateStr}T12:00:00Z`).getUTCDay(); // noon UTC avoids DST edge
    const dayKey = dayKeys[dayIdx];

    // Skip if business closed that day
    if (!dayKey || !openingHours[dayKey] || openingHours[dayKey] === "closed") continue;

    // Skip if entire day is blocked (vacations, all-day GCal events)
    if (blockedDates?.has(dateStr)) continue;

    const dayName = DAY_NAMES[dayIdx];
    const [, mm, dd] = dateStr.split("-");

    dates.push({
      value: dateStr,
      label: `${dayName} ${parseInt(dd ?? "1", 10)}/${parseInt(mm ?? "1", 10)}`,
    });
  }

  return dates;
}

/**
 * Parse time ranges into [{open, close}] pairs.
 * Supports two formats:
 * - String: "08:00-12:00,13:00-17:00"
 * - Object: { open: "08:00", close: "17:00", is_open: true, break_start: "12:00", break_end: "13:00" }
 */
function parseTimeRanges(hours: string | Record<string, unknown>): { openH: number; openM: number; closeH: number; closeM: number }[] {
  if (!hours) return [];

  // Object format from dashboard (new)
  if (typeof hours === "object") {
    const obj = hours as { open?: string; close?: string; is_open?: boolean; break_start?: string; break_end?: string };
    if (obj.is_open === false) return [];
    const openStr = obj.open ?? "08:00";
    const closeStr = obj.close ?? "17:00";

    const ranges: { openH: number; openM: number; closeH: number; closeM: number }[] = [];

    if (obj.break_start && obj.break_end) {
      // Split into two ranges around the break
      ranges.push(parseTimePair(openStr, obj.break_start));
      ranges.push(parseTimePair(obj.break_end, closeStr));
    } else {
      ranges.push(parseTimePair(openStr, closeStr));
    }
    return ranges;
  }

  // String format (legacy)
  if (hours === "closed") return [];

  return hours.split(",").map((range) => {
    const [openStr, closeStr] = range.trim().split("-");
    return parseTimePair(openStr ?? "08:00", closeStr ?? "17:00");
  });
}

function parseTimePair(openStr: string, closeStr: string) {
  const openParts = openStr.split(":");
  const closeParts = closeStr.split(":");
  return {
    openH: parseInt(openParts[0] ?? "8", 10),
    openM: parseInt(openParts[1] ?? "0", 10),
    closeH: parseInt(closeParts[0] ?? "17", 10),
    closeM: parseInt(closeParts[1] ?? "0", 10),
  };
}

export function generateTimeSlots(
  openingHours: Record<string, string | Record<string, unknown>>,
  dateStr: string,
  serviceDuration: number,
  maxSlots = 20
): TimeSlot[] {
  // Use getUTCDay() because dateStr is "YYYY-MM-DD" which JS parses as UTC midnight
  const dayOfWeek = new Date(dateStr).getUTCDay();
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = dayKeys[dayOfWeek];
  const hours = (dayKey && openingHours[dayKey]) ?? "08:00-17:00";

  const ranges = parseTimeRanges(hours);
  const slots: TimeSlot[] = [];

  for (const range of ranges) {
    // Convert to minutes for easier comparison
    const rangeStartMins = range.openH * 60 + range.openM;
    const rangeEndMins = range.closeH * 60 + range.closeM;

    // Generate slots within this range
    for (let mins = rangeStartMins; mins + serviceDuration <= rangeEndMins && slots.length < maxSlots; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      slots.push({
        value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        label: `${h}h${String(m).padStart(2, "0")}`,
      });
    }
  }

  return slots;
}
