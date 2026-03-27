import { createHmac } from "crypto";
import { logger } from "@trigger.dev/sdk";

const UNSUB_SALT = "vea-unsubscribe-v1";

let warnedMissingSecret = false;

function getSecret(): string {
  if (process.env.PORTAL_SECRET) return process.env.PORTAL_SECRET;
  if (!warnedMissingSecret) {
    logger.warn("PORTAL_SECRET not set — falling back to SUPABASE_SERVICE_KEY for unsubscribe tokens. Set PORTAL_SECRET in env vars.");
    warnedMissingSecret = true;
  }
  return process.env.SUPABASE_SERVICE_KEY ?? "";
}

/** Generate an HMAC-signed unsubscribe token for an email address. */
export function generateUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const hmac = createHmac("sha256", getSecret())
    .update(`${UNSUB_SALT}:${normalized}`)
    .digest("hex");
  return Buffer.from(`${normalized}|${hmac}`).toString("base64url");
}

/** Build a full unsubscribe URL with signed token. */
export function buildUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  return `https://vea.pacifikai.com/unsubscribe?token=${token}`;
}
