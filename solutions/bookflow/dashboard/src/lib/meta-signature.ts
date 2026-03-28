import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";

/**
 * Verify Meta webhook signature (X-Hub-Signature-256).
 * Returns true if valid, false otherwise.
 *
 * @see https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export function verifyMetaSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.META_APP_SECRET ?? process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) {
    logger.error("META_APP_SECRET not set — rejecting all requests", { action: "meta_signature" });
    return false;
  }

  if (!signatureHeader) return false;

  const [algo, signature] = signatureHeader.split("=");
  if (algo !== "sha256" || !signature) return false;

  const expected = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
