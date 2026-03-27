/**
 * Booking reference card utilities
 * Generates a styled reference display (no external QR deps)
 */

/** Derive a short human-readable booking reference from a UUID */
export function getBookingRef(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** Build confirmation page URL */
export function getConfirmationUrl(businessId: string, appointmentId: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : 'https://vea.pacifikai.com');
  return `${base}/book/${businessId}/confirmation?id=${appointmentId}`;
}
