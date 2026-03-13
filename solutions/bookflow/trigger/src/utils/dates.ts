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
  blockedDates?: Set<string>
): DateOption[] {
  const now = new Date();
  const dates: DateOption[] = [];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  for (let d = 1; dates.length < count && d < 14; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dayKey = dayKeys[date.getDay()];

    // Skip if business closed that day
    if (!dayKey || !openingHours[dayKey] || openingHours[dayKey] === "closed") continue;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // Skip if entire day is blocked (vacations, all-day GCal events)
    if (blockedDates?.has(dateStr)) continue;

    const dayName = DAY_NAMES[date.getDay()];

    dates.push({
      value: dateStr,
      label: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`,
    });
  }

  return dates;
}

/**
 * Parse time ranges like "08:00-12:00,13:00-17:00" into [{open, close}] pairs.
 */
function parseTimeRanges(hours: string): { openH: number; openM: number; closeH: number; closeM: number }[] {
  if (!hours || hours === "closed") return [];

  return hours.split(",").map((range) => {
    const [openStr, closeStr] = range.trim().split("-");
    const openParts = (openStr ?? "08:00").split(":");
    const closeParts = (closeStr ?? "17:00").split(":");
    return {
      openH: parseInt(openParts[0] ?? "8", 10),
      openM: parseInt(openParts[1] ?? "0", 10),
      closeH: parseInt(closeParts[0] ?? "17", 10),
      closeM: parseInt(closeParts[1] ?? "0", 10),
    };
  });
}

export function generateTimeSlots(
  openingHours: Record<string, string>,
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
