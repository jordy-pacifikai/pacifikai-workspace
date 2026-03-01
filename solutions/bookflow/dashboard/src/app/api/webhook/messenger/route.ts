import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Messenger Webhook — multi-tenant.
 * Routes messages to correct business by page_id from Meta payload.
 *
 * Meta sends: { object: "page", entry: [{ id: PAGE_ID, messaging: [{ sender, message }] }] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object !== "page") {
      return NextResponse.json({ ok: true });
    }

    const entries = (body.entry ?? []) as Array<{
      id: string;
      messaging?: Array<{
        sender: { id: string };
        message?: { text?: string; quick_reply?: { payload: string } };
        postback?: { payload: string; title: string };
      }>;
    }>;

    for (const entry of entries) {
      const pageId = entry.id;

      // Lookup business by meta_page_id
      const { data: business } = await getSupabase()
        .from("bookbot_businesses")
        .select("id")
        .eq("meta_page_id", pageId)
        .limit(1)
        .single();

      if (!business) {
        console.warn(`[Messenger] No business found for page_id: ${pageId}`);
        continue;
      }

      for (const event of entry.messaging ?? []) {
        const senderId = event.sender.id;

        let messageText = "";
        let buttonPayload: string | null = null;
        let messageType: "text" | "button" | "interactive" = "text";

        if (event.message?.quick_reply) {
          messageText = event.message.quick_reply.payload;
          buttonPayload = event.message.quick_reply.payload;
          messageType = "button";
        } else if (event.postback) {
          messageText = event.postback.title;
          buttonPayload = event.postback.payload;
          messageType = "button";
        } else if (event.message?.text) {
          messageText = event.message.text;
        }

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
                from: `messenger_${senderId}`,
                message: messageText,
                buttonPayload,
                messageType,
                businessId: business.id,
              },
            }),
          }
        );

        if (!triggerRes.ok) {
          console.error("[Messenger] Trigger.dev error:", triggerRes.status, await triggerRes.text());
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Messenger] Webhook error:", err);
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
