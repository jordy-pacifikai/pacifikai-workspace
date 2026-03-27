/**
 * Escape HTML entities to prevent XSS in email templates.
 * Used by all email tasks (confirmation, cancellation, digest, drip, trial, onboarding).
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
