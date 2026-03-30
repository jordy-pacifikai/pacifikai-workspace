import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { insertWebhookEvent, markWebhookProcessed, markWebhookFailed } from "@/lib/webhook-dlq";

/**
 * Unipile webhook payload — the format varies based on webhook config.
 * We use passthrough + optional fields to handle multiple formats:
 * - Flat format: { account_id, chat_id, message, sender, ... }
 * - Nested format: { event, data: { account_id, chat_id, message, ... } }
 */
const unipileWebhookSchema = z.object({
  // Flat fields (Unipile default webhook format)
  account_id: z.string().optional(),
  account_type: z.string().optional(),
  chat_id: z.string().optional(),
  message_id: z.string().optional(),
  message: z.string().optional(),
  sender: z.string().optional(),
  is_sender: z.union([z.boolean(), z.string()]).optional(),
  timestamp: z.string().optional(),
  webhook_name: z.string().optional(),
  // Nested format (if configured differently)
  event: z.string().optional(),
  data: z.object({
    account_id: z.string(),
    chat_id: z.string(),
    message: z.any(),
    provider: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();

/**
 * POST /api/webhook/unipile
 *
 * Receives incoming messages from Unipile (Messenger/Instagram proxy).
 * Routes to the correct business by unipile_account_id, then triggers
 * the same bookbot-whatsapp-handler task used for all channels.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`webhook-unipile:${ip}`, {
    interval: 60_000,
    limit: 200,
  });
  if (!rlOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const parsed = unipileWebhookSchema.safeParse(body);
    if (!parsed.success) {
      logger.error("Invalid Unipile webhook payload", {
        action: "unipile_webhook",
        errors: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const payload = parsed.data;

    // Normalize: extract fields from flat or nested format
    const accountId = payload.account_id ?? payload.data?.account_id;
    const chatId = payload.chat_id ?? payload.data?.chat_id;
    const messageText = payload.message
      ?? (typeof payload.data?.message === "string" ? payload.data.message : payload.data?.message?.text)
      ?? "";
    const messageId = payload.message_id ?? payload.data?.message?.id;
    const senderName = payload.sender ?? payload.data?.message?.sender?.name ?? undefined;
    const accountType = payload.account_type ?? payload.data?.provider ?? "MESSENGER";

    // Skip if this is a message we sent (is_sender = true)
    if (payload.is_sender === true || payload.is_sender === "true") {
      return NextResponse.json({ ok: true, skipped: "is_sender" });
    }

    if (!accountId || !chatId) {
      logger.warn("Unipile webhook missing account_id or chat_id", {
        action: "unipile_webhook",
        body: JSON.stringify(payload).slice(0, 500),
      });
      return NextResponse.json({ ok: true, skipped: "missing_ids" });
    }

    if (!String(messageText).trim()) {
      return NextResponse.json({ ok: true, skipped: "empty_message" });
    }

    // Lookup business by unipile_account_id
    const { data: business } = await supabaseAdmin()
      .from("bookbot_businesses")
      .select("id, meta_page_token, unipile_enabled")
      .eq("unipile_account_id", accountId)
      .eq("unipile_enabled", true)
      .limit(1)
      .single();

    if (!business) {
      logger.warn("No business found for Unipile account", {
        action: "unipile_webhook",
        account_id: accountId,
      });
      return NextResponse.json({ ok: true, skipped: "no_business" });
    }

    // Normalize to bookbot-handler format
    const channel = String(accountType).toLowerCase().includes("instagram") ? "instagram" : "messenger";

    const taskPayload = {
      from: `unipile_${chatId}`,
      message: String(messageText),
      buttonPayload: null,
      messageType: "text" as const,
      businessId: business.id,
      channel: `unipile_${channel}` as string,
      senderName: senderName ? String(senderName) : undefined,
      unipileChatId: chatId,
      unipileAccountId: accountId,
    };

    // DLQ: persist event before triggering
    const eventId = await insertWebhookEvent(business.id, `unipile_${channel}`, taskPayload);

    try {
      const idempotencyKey = messageId ?? `unipile_${chatId}_${Date.now()}`;
      const triggered = await triggerTask("bookbot-whatsapp-handler", taskPayload, {
        idempotencyKey,
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
      logger.error("Trigger task failed for Unipile event", {
        action: "unipile_webhook",
        eventId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile webhook error", {
      action: "unipile_webhook",
      error: String(err),
    });
    return NextResponse.json({ ok: true });
  }
}
