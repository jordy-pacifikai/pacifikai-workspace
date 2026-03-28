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
  const appSecret = (process.env.FACEBOOK_APP_SECRET ?? process.env.META_APP_SECRET)?.trim();
  if (!appSecret) {
    logger.error("META_APP_SECRET not set — rejecting all requests", { action: "meta_signature" });
    return false;
  }

  if (!signatureHeader) {
    logger.error("Missing X-Hub-Signature-256 header", { action: "meta_signature" });
    return false;
  }

  // Debug: log secret hash + signature comparison (remove after fixing)
  logger.info("Meta signature check", {
    action: "meta_signature_debug",
    secretLen: appSecret.length,
    secretPrefix: appSecret.substring(0, 4),
    headerPrefix: signatureHeader.substring(0, 20),
    envSource: process.env.META_APP_SECRET ? "META_APP_SECRET" : "FACEBOOK_APP_SECRET",
  });

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
