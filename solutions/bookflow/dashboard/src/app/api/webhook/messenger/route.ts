import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyMetaSignature } from "@/lib/meta-signature";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// ------- Zod Schemas -------

/** POST body — validate fields we USE, passthrough the rest */
const messengerEventSchema = z.object({
  sender: z.object({ id: z.string() }).passthrough(),
  message: z.object({
    mid: z.string().optional(),
    text: z.string().optional(),
    quick_reply: z.object({ payload: z.string() }).passthrough().optional(),
  }).passthrough().optional(),
  postback: z.object({
    payload: z.string(),
    title: z.string(),
  }).passthrough().optional(),
}).passthrough();

const messengerEntrySchema = z.object({
  id: z.string(),
  messaging: z.array(messengerEventSchema).optional(),
}).passthrough();

const messengerWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(messengerEntrySchema).optional(),
}).passthrough();

/** GET query params — Meta webhook verification */
const messengerVerifySchema = z.object({
  "hub.mode": z.string(),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});


/**
 * Messenger Webhook — multi-tenant.
 * Routes messages to correct business by page_id from Meta payload.
 *
 * Meta sends: { object: "page", entry: [{ id: PAGE_ID, messaging: [{ sender, message }] }] }
 */
export async function POST(req: Request) {
  // Rate limit: 200/min per IP (webhook, high volume)
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`webhook-messenger:${ip}`, { interval: 60_000, limit: 200 });
  if (!rlOk) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    // Verify Meta signature (always — missing header = rejected)
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    if (!verifyMetaSignature(rawBody, signature)) {
      logger.error("Invalid or missing Meta signature", { action: "messenger_webhook" });
      return new Response("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const parsed = messengerWebhookSchema.safeParse(body);
    if (!parsed.success) {
      logger.error("Invalid Messenger webhook payload", { action: "messenger_webhook" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (parsed.data.object !== "page") {
      return NextResponse.json({ ok: true });
    }

    const entries = parsed.data.entry ?? [];

    for (const entry of entries) {
      const pageId = entry.id;

      // Lookup business by meta_page_id (includes token for replies)
      const { data: business } = await supabaseAdmin()
        .from("bookbot_businesses")
        .select("id, meta_page_token")
        .eq("meta_page_id", pageId)
        .limit(1)
        .single();

      if (!business) {
        logger.warn("No business found for page_id", { action: "messenger_webhook", pageId });
        continue;
      }

      for (const event of entry.messaging ?? []) {
        const senderId = event.sender.id;

        let messageText = "";
        let buttonPayload: string | null = null;
        let messageType: "text" | "button" | "interactive" = "text";
        let messageId: string | null = null;

        if (event.message?.quick_reply) {
          messageText = event.message.quick_reply.payload;
          buttonPayload = event.message.quick_reply.payload;
          messageType = "button";
          messageId = event.message.mid ?? null;
        } else if (event.postback) {
          messageText = event.postback.title;
          buttonPayload = event.postback.payload;
          messageType = "button";
        } else if (event.message?.text) {
          messageText = event.message.text;
          messageId = event.message.mid ?? null;
        }

        if (!messageText) continue;

        // Check if we already know this sender's name from a previous session
        // This avoids a Graph API call for every single message from returning users
        let senderName: string | undefined;
        try {
          const { data: existingSession } = await supabaseAdmin()
            .from("bookbot_sessions")
            .select("client_name")
            .eq("phone", `messenger_${senderId}`)
            .eq("business_id", business.id)
            .limit(1)
            .single();
          if (existingSession?.client_name) {
            senderName = existingSession.client_name;
          }
        } catch {
          // No existing session — will try Graph API below
        }

        // Only fetch from Graph API if we don't already have the name
        if (!senderName && business.meta_page_token) {
          try {
            const profileRes = await fetch(
              `https://graph.facebook.com/v22.0/${senderId}?fields=first_name,last_name`,
              {
                headers: { Authorization: `Bearer ${business.meta_page_token}` },
                signal: AbortSignal.timeout(5000),
              },
            );
            if (profileRes.ok) {
              const profile = await profileRes.json();
              const parts = [profile.first_name, profile.last_name].filter(Boolean);
              if (parts.length > 0) senderName = parts.join(" ");
            }
          } catch {
            // Non-blocking — proceed without name
          }
        }

        // Trigger the same Ve'a handler (multi-channel) with idempotencyKey
        const idempotencyKey = messageId ?? `msg_${senderId}_${Date.now()}`;
        await triggerTask(
          "bookbot-whatsapp-handler",
          {
            from: `messenger_${senderId}`,
            message: messageText,
            buttonPayload,
            messageType,
            businessId: business.id,
            pageAccessToken: business.meta_page_token ?? undefined,
            channel: "messenger",
            senderName,
          },
          { idempotencyKey },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Messenger webhook error", { action: "messenger_webhook", error: String(err) });
    return NextResponse.json({ ok: true });
  }
}

/**
 * Meta webhook verification (GET).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = {
    "hub.mode": url.searchParams.get("hub.mode") ?? undefined,
    "hub.verify_token": url.searchParams.get("hub.verify_token") ?? undefined,
    "hub.challenge": url.searchParams.get("hub.challenge") ?? undefined,
  };

  const parsed = messengerVerifySchema.safeParse(params);
  if (!parsed.success) {
    return new Response("Bad Request", { status: 400 });
  }

  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = parsed.data;

  const verifyToken = process.env.META_VERIFY_TOKEN;
  if (!verifyToken) {
    logger.error("META_VERIFY_TOKEN not set", { action: "messenger_verify" });
    return new Response("Server Error", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
