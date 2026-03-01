import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Instagram DM Webhook — multi-tenant.
 * Routes messages to correct business by instagram_page_id from Meta payload.
 *
 * Meta sends: { object: "instagram", entry: [{ id: IG_USER_ID, messaging: [{ sender, message }] }] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

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

      const { data: directMatch } = await getSupabase()
        .from("bookbot_businesses")
        .select("id, meta_page_token")
        .eq("meta_ig_account_id", igUserId)
        .limit(1)
        .single();

      if (directMatch) {
        business = directMatch;
      } else {
        // Legacy fallback: scan config JSONB
        const { data: businesses } = await getSupabase()
          .from("bookbot_businesses")
          .select("id, config, meta_page_token")
          .limit(50);

        const legacy = (businesses ?? []).find((b) => {
          const cfg = b.config as Record<string, unknown> | null;
          return cfg?.instagram_page_id === igUserId;
        });
        if (legacy) business = legacy;
      }

      if (!business) {
        console.warn(`[Instagram] No business found for ig_user_id: ${igUserId}`);
        continue;
      }

      for (const event of entry.messaging ?? []) {
        const senderId = event.sender.id;

        // Skip echo messages (sent by the business page itself)
        if (senderId === igUserId) continue;

        const messageText = event.message?.text;
        if (!messageText) continue;

        // Trigger the same BookBot handler (multi-channel)
        const triggerApiUrl = process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";
        const triggerKey = process.env.TRIGGER_SECRET_KEY!;
        const triggerRes = await fetch(
          `${triggerApiUrl}/api/v1/tasks/bookbot-whatsapp-handler/trigger`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                from: `instagram_${senderId}`,
                message: messageText,
                buttonPayload: null,
                messageType: "text",
                businessId: business.id,
                pageAccessToken: business.meta_page_token ?? undefined,
                channel: "instagram",
              },
            }),
          }
        );

        if (!triggerRes.ok) {
          console.error("[Instagram] Trigger.dev error:", triggerRes.status, await triggerRes.text());
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Instagram] Webhook error:", err);
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

  const verifyToken = process.env.META_VERIFY_TOKEN ?? "bookbot_verify_2026";
  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
