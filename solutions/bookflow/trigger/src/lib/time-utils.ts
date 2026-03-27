/**
 * Compute end time from start time + duration, capped at 23:59.
 * Prevents invalid "24:00" or later when appointments cross midnight.
 */
export function computeEndTime(startTime: string, durationMin: number): string {
  const parts = startTime.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const endMins = Math.min(h * 60 + m + durationMin, 23 * 60 + 59);
  return `${String(Math.floor(endMins / 60)).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;
}
