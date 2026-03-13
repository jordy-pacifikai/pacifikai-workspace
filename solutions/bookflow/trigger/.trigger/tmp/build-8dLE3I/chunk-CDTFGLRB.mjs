import {
  __name,
  init_esm
} from "./chunk-VMIWEUEA.mjs";

// src/utils/dates.ts
init_esm();
var DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
function generateAvailableDates(openingHours, count = 3) {
  const now = /* @__PURE__ */ new Date();
  const dates = [];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  for (let d = 1; dates.length < count && d < 14; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dayKey = dayKeys[date.getDay()];
    if (!dayKey || !openingHours[dayKey]) continue;
    const dayName = DAY_NAMES[date.getDay()];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dates.push({
      value: dateStr,
      label: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`
    });
  }
  return dates;
}
__name(generateAvailableDates, "generateAvailableDates");
function generateTimeSlots(openingHours, dateStr, serviceDuration, maxSlots = 6) {
  const dayOfWeek = new Date(dateStr).getDay();
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = dayKeys[dayOfWeek];
  const hours = (dayKey && openingHours[dayKey]) ?? "08:00-17:00";
  const [openStr, closeStr] = hours.split("-");
  const openH = parseInt(openStr?.split(":")[0] ?? "8", 10);
  const closeH = parseInt(closeStr?.split(":")[0] ?? "17", 10);
  const slots = [];
  for (let h = openH; h < closeH && slots.length < maxSlots; h++) {
    if (h === 12) continue;
    slots.push({
      value: `${String(h).padStart(2, "0")}:00`,
      label: `${h}h00`
    });
    if (serviceDuration <= 30 && slots.length < maxSlots) {
      slots.push({
        value: `${String(h).padStart(2, "0")}:30`,
        label: `${h}h30`
      });
    }
  }
  return slots;
}
__name(generateTimeSlots, "generateTimeSlots");

export {
  generateAvailableDates,
  generateTimeSlots
};
//# sourceMappingURL=chunk-CDTFGLRB.mjs.map
