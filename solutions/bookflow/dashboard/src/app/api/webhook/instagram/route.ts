import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyMetaSignature } from "@/lib/meta-signature";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Instagram DM Webhook — multi-tenant.
 * Routes messages to correct business by instagram_page_id from Meta payload.
 *
 * Meta sends: { object: "instagram", entry: [{ id: IG_USER_ID, messaging: [{ sender, message }] }] }
 */
export async function POST(req: Request) {
  // Rate limit: 200/min per IP (webhook)
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`webhook-instagram:${ip}`, { interval: 60_000, limit: 200 });
  if (!rlOk) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    // Verify Meta signature (always — missing header = rejected)
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    if (!verifyMetaSignature(rawBody, signature)) {
      logger.error("Invalid or missing Meta signature", { action: "instagram_webhook" });
      return new Response("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object !== "instagram") {
      return NextResponse.json({ ok: true });
    }

    const entries = (body.entry ?? []) as Array<{
      id: string;
      messaging?: Array<{
        sender: { id: string };
        recipient: { id: string };
        message?: { mid: string; text?: string };
      }>;
    }>;

    for (const entry of entries) {
      const igUserId = entry.id;

      // Lookup business by meta_ig_account_id column (indexed, fast)
      // Falls back to JSONB config scan for legacy entries
      let business: { id: string; meta_page_token?: string | null } | null = null;

      const { data: directMatch } = await supabaseAdmin()
        .from("bookbot_businesses")
        .select("id, meta_page_token")
        .eq("meta_ig_account_id", igUserId)
        .limit(1)
        .single();

      if (directMatch) {
        business = directMatch;
      } else {
        // Legacy fallback: scan config JSONB (only fetch id + config for matching, then fetch token separately)
        const { data: businesses } = await supabaseAdmin()
          .from("bookbot_businesses")
          .select("id, config")
          .not("config", "is", "null")
          .limit(100);

        const legacy = (businesses ?? []).find((b) => {
          const cfg = b.config as Record<string, unknown> | null;
          return cfg?.instagram_page_id === igUserId;
        });
        if (legacy) {
          // Fetch token separately only for the matched business (avoid loading all tokens into memory)
          const { data: bizToken } = await supabaseAdmin()
            .from("bookbot_businesses")
            .select("id, meta_page_token")
            .eq("id", legacy.id)
            .single();
          if (bizToken) {
            business = bizToken;
            // Auto-fix: populate meta_ig_account_id so the legacy fallback is no longer needed
            await supabaseAdmin()
              .from("bookbot_businesses")
              .update({ meta_ig_account_id: igUserId })
              .eq("id", legacy.id);
          }
        }
      }

      if (!business) {
        logger.warn("No business found for ig_user_id", { action: "instagram_webhook", igUserId });
        continue;
      }

      for (const event of entry.messaging ?? []) {
        const senderId = event.sender.id;

        // Skip echo messages (sent by the business page itself)
        if (senderId === igUserId) continue;

        const messageText = event.message?.text;
        if (!messageText) continue;

        const messageId = event.message?.mid ?? null;

        // Fetch sender profile (name) from Instagram Graph API
        let senderName: string | undefined;
        if (business.meta_page_token) {
          try {
            const profileRes = await fetch(
              `https://graph.facebook.com/v22.0/${senderId}?fields=name,username`,
              {
                headers: { Authorization: `Bearer ${business.meta_page_token}` },
                signal: AbortSignal.timeout(5000),
              },
            );
            if (profileRes.ok) {
              const profile = await profileRes.json();
              senderName = profile.name || profile.username || undefined;
            }
          } catch {
            // Non-blocking
          }
        }

        // Trigger the same Ve'a handler (multi-channel) with idempotencyKey
        const idempotencyKey = messageId ?? `ig_${senderId}_${Date.now()}`;
        await triggerTask(
          "bookbot-whatsapp-handler",
          {
            from: `instagram_${senderId}`,
            message: messageText,
            buttonPayload: null,
            messageType: "text",
            businessId: business.id,
            pageAccessToken: business.meta_page_token ?? undefined,
            channel: "instagram",
            senderName,
          },
          { idempotencyKey },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Instagram webhook error", { action: "instagram_webhook", error: String(err) });
    return NextResponse.json({ ok: true });
  }
}

/**
 * Meta webhook verification (GET).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;
  if (!verifyToken) {
    logger.error("META_VERIFY_TOKEN not set", { action: "instagram_verify" });
    return new Response("Server Error", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
