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
    if (!dayKey || !openingHours[dayKey]) continue;

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

export function generateTimeSlots(
  openingHours: Record<string, string>,
  dateStr: string,
  serviceDuration: number,
  maxSlots = 6
): TimeSlot[] {
  const dayOfWeek = new Date(dateStr).getDay();
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = dayKeys[dayOfWeek];
  const hours = (dayKey && openingHours[dayKey]) ?? "08:00-17:00";

  const [openStr, closeStr] = hours.split("-");
  const openH = parseInt(openStr?.split(":")[0] ?? "8", 10);
  const closeH = parseInt(closeStr?.split(":")[0] ?? "17", 10);

  const slots: TimeSlot[] = [];
  for (let h = openH; h < closeH && slots.length < maxSlots; h++) {
    if (h === 12) continue; // Skip lunch

    slots.push({
      value: `${String(h).padStart(2, "0")}:00`,
      label: `${h}h00`,
    });

    if (serviceDuration <= 30 && slots.length < maxSlots) {
      slots.push({
        value: `${String(h).padStart(2, "0")}:30`,
        label: `${h}h30`,
      });
    }
  }

  return slots;
}
