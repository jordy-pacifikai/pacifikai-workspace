import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseWhatsAppMessage } from "./parse";
import { verifyMetaSignature } from "@/lib/meta-signature";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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

  const { data } = await getSupabase()
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
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown>;
    let rawBody: string | undefined;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Twilio format — no Meta signature check needed
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    } else {
      // Meta Cloud API — verify signature
      rawBody = await req.text();
      const signature = req.headers.get("x-hub-signature-256");
      if (signature && !verifyMetaSignature(rawBody, signature)) {
        console.error("[Ve'a] Invalid Meta signature — rejecting");
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
    const triggerApiUrl = process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";
    const triggerKey = process.env.TRIGGER_SECRET_KEY!;
    const triggerRes = await fetch(
      `${triggerApiUrl}/api/v1/tasks/bookbot-whatsapp-handler/trigger`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${triggerKey}`,
          "Content-Type": "application/json",
          ...(parsed.messageId ? { "Idempotency-Key": parsed.messageId } : {}),
        },
        body: JSON.stringify({
          payload: {
            from: parsed.from,
            message: parsed.message,
            buttonPayload: parsed.buttonPayload,
            messageType: parsed.messageType,
            businessId,
            channel: "whatsapp",
          },
          options: parsed.messageId ? { idempotencyKey: parsed.messageId } : undefined,
        }),
      }
    );

    if (!triggerRes.ok) {
      console.error("[Ve'a] Trigger.dev error:", triggerRes.status, await triggerRes.text());
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Ve'a] Webhook error:", err);
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
    console.error("[Ve'a] META_VERIFY_TOKEN not set");
    return new Response("Server Error", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
