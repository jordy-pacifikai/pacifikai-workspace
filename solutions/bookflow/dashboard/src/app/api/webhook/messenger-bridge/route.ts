import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { insertWebhookEvent, markWebhookProcessed, markWebhookFailed } from "@/lib/webhook-dlq";
import { createHmac, timingSafeEqual } from "node:crypto";

// UUID-shaped string (accepts non-RFC4122 like a0000000-0000-0000-0000-000000000001)
const uuidShape = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID format");

const messageEventSchema = z.object({
  event_type: z.literal("message.received"),
  business_id: uuidShape,
  timestamp: z.number(),
  data: z.object({
    message_id: z.string(),
    thread_id: z.string(),
    sender_id: z.string(),
    sender_name: z.string().optional(),
    text: z.string(),
    attachments: z
      .array(z.object({ type: z.string(), url: z.string() }).passthrough())
      .optional(),
    is_page_thread: z.boolean().optional(),
  }),
});

const sessionEventSchema = z.object({
  event_type: z.enum(["session.expired", "session.checkpoint"]),
  business_id: uuidShape,
  timestamp: z.number(),
  data: z.object({
    session_id: z.string(),
    status: z.string(),
    reason: z.string().optional(),
  }),
});

const webhookSchema = z.union([messageEventSchema, sessionEventSchema]);

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.MESSENGER_BRIDGE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * POST /api/webhook/messenger-bridge
 *
 * Receives events from the self-hosted Messenger Bridge service.
 * Replaces the Unipile webhook for unofficial Messenger/Instagram access.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`webhook-bridge:${ip}`, {
    interval: 60_000,
    limit: 200,
  });
  if (!rlOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.text();

    // Verify HMAC signature
    const signature = req.headers.get("x-bridge-signature");
    if (!verifySignature(rawBody, signature)) {
      logger.warn("Invalid bridge webhook signature", {
        action: "bridge_webhook",
        ip,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const parsed = webhookSchema.safeParse(body);
    if (!parsed.success) {
      logger.error("Invalid bridge webhook payload", {
        action: "bridge_webhook",
        errors: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const event = parsed.data;

    // ─── Session events (expired, checkpoint) ─────────────────
    if (
      event.event_type === "session.expired" ||
      event.event_type === "session.checkpoint"
    ) {
      logger.warn("Bridge session event", {
        action: "bridge_webhook",
        business_id: event.business_id,
        event_type: event.event_type,
        reason: event.data.reason,
      });
      // TODO: notify business admin via in-app notification
      return NextResponse.json({ ok: true });
    }

    // ─── Message received ─────────────────────────────────────
    // TypeScript narrowing: at this point event_type must be "message.received"
    const msgEvent = event as z.infer<typeof messageEventSchema>;
    const { data } = msgEvent;

    if (!String(data.text).trim()) {
      return NextResponse.json({ ok: true, skipped: "empty_message" });
    }

    // Verify this business exists
    const { data: business } = await supabaseAdmin()
      .from("bookbot_businesses")
      .select("id")
      .eq("id", event.business_id)
      .limit(1)
      .single();

    if (!business) {
      logger.warn("No business found for bridge event", {
        action: "bridge_webhook",
        business_id: event.business_id,
      });
      return NextResponse.json({ ok: true, skipped: "no_business" });
    }

    // Route to the same handler as all other channels.
    // is_page_thread = true → from Graph API poller, reply via Graph API (messenger_*)
    // is_page_thread = false/undefined → from mautrix-meta bridge, reply via bridge (bridge_*)
    const fromPoller = data.is_page_thread === true;
    const taskPayload = {
      from: fromPoller
        ? `messenger_${data.sender_id}`
        : `bridge_${data.thread_id}`,
      message: String(data.text),
      buttonPayload: null,
      messageType: "text" as const,
      businessId: event.business_id,
      channel: fromPoller ? ("messenger" as string) : ("bridge_messenger" as string),
      senderName: data.sender_name,
      // Bridge-specific fields for reply routing
      bridgeThreadId: data.thread_id,
      bridgeSenderId: data.sender_id,
    };

    // DLQ: persist before triggering
    const eventId = await insertWebhookEvent(
      event.business_id,
      "bridge_messenger",
      taskPayload,
    );

    try {
      const triggered = await triggerTask("bookbot-whatsapp-handler", taskPayload, {
        idempotencyKey: data.message_id,
      });
      if (triggered && eventId) {
        await markWebhookProcessed(eventId);
      } else if (eventId) {
        await markWebhookFailed(eventId, "triggerTask returned false");
      }
    } catch (triggerErr) {
      if (eventId) {
        await markWebhookFailed(eventId, String(triggerErr));
      }
      logger.error("Trigger task failed for bridge event", {
        action: "bridge_webhook",
        eventId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Bridge webhook error", {
      action: "bridge_webhook",
      error: String(err),
    });
    return NextResponse.json({ ok: true });
  }
}
