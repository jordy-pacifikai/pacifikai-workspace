import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseWhatsAppMessage } from "./parse";
import { verifyMetaSignature } from "@/lib/meta-signature";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Extract phone_number_id from Meta Cloud API webhook payload.
 */
function extractPhoneNumberId(body: Record<string, unknown>): string | null {
  if (!body.entry) return null;
  const entries = body.entry as Array<Record<string, unknown>>;
  const changes = (entries[0]?.changes as Array<Record<string, unknown>>) ?? [];
  const value = changes[0]?.value as Record<string, unknown> | undefined;
  const metadata = value?.metadata as Record<string, string> | undefined;
  return metadata?.phone_number_id ?? null;
}

/**
 * Lookup business by phone_number_id. Falls back to DEFAULT_BUSINESS_ID.
 */
async function resolveBusinessId(phoneNumberId: string | null): Promise<string> {
  const defaultBizId = process.env.BOOKBOT_BUSINESS_ID!;
  if (!phoneNumberId) return defaultBizId;

  const { data } = await supabaseAdmin()
    .from("bookbot_businesses")
    .select("id")
    .eq("phone_number_id", phoneNumberId)
    .limit(1)
    .single();

  return data?.id ?? defaultBizId;
}

/**
 * WhatsApp Webhook — multi-tenant.
 * Routes to correct business by phone_number_id (Meta) or defaults (Twilio).
 */
export async function POST(req: Request) {
  // Rate limit: 200/min per IP (webhook)
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`webhook-whatsapp:${ip}`, { interval: 60_000, limit: 200 });
  if (!rlOk) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown>;
    let rawBody: string | undefined;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Twilio format deprecated — reject without signature validation
      logger.warn("Rejected form-encoded WhatsApp webhook (Twilio format unsupported)", { action: "whatsapp_webhook" });
      return new Response("Unsupported content type", { status: 415 });
    } else {
      // Meta Cloud API — verify signature (always — missing header = rejected)
      rawBody = await req.text();
      const signature = req.headers.get("x-hub-signature-256");
      if (!verifyMetaSignature(rawBody, signature)) {
        logger.error("Invalid or missing Meta signature", { action: "whatsapp_webhook" });
        return new Response("Unauthorized", { status: 401 });
      }
      body = JSON.parse(rawBody);
    }

    const parsed = parseWhatsAppMessage(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }

    // Multi-tenant routing
    const phoneNumberId = extractPhoneNumberId(body);
    const businessId = await resolveBusinessId(phoneNumberId);

    // Trigger task with idempotencyKey to prevent duplicate processing on Meta retries
    await triggerTask(
      "bookbot-whatsapp-handler",
      {
        from: parsed.from,
        message: parsed.message,
        buttonPayload: parsed.buttonPayload,
        messageType: parsed.messageType,
        businessId,
        channel: "whatsapp",
        messageId: parsed.messageId ?? undefined,
      },
      parsed.messageId ? { idempotencyKey: parsed.messageId } : undefined,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("WhatsApp webhook error", { action: "whatsapp_webhook", error: String(err) });
    return NextResponse.json({ ok: true });
  }
}

/**
 * Meta Cloud API webhook verification (GET).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;
  if (!verifyToken) {
    logger.error("META_VERIFY_TOKEN not set", { action: "whatsapp_verify" });
    return new Response("Server Error", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
