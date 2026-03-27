/**
 * Simple className merger — no external dependencies.
 * Filters falsy values and joins with a space.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Compute end time from start time + duration, capped at 23:59.
 * Prevents invalid "24:00" or later when appointments cross midnight.
 */
/**
 * Sanitize a CSS color value to prevent CSS injection.
 * Only allows hex colors (#rgb, #rrggbb, #rrggbbaa) and common named colors.
 * Returns fallback if input is invalid.
 */
const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
export function sanitizeColor(value: string | null | undefined, fallback = '#0d9488'): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed;
  return fallback;
}

/**
 * Compute end time from start time + duration, capped at 23:59.
 * Prevents invalid "24:00" or later when appointments cross midnight.
 */
export function computeEndTime(startTime: string, durationMin: number): string {
  const parts = startTime.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const endMins = Math.min(h * 60 + m + durationMin, 23 * 60 + 59);
  return `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
}
