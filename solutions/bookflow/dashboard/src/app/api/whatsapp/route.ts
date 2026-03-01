import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseWhatsAppMessage } from "./parse";

const TRIGGER_API_URL = process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";
const TRIGGER_SECRET_KEY = process.env.TRIGGER_SECRET_KEY!;
const DEFAULT_BUSINESS_ID = process.env.BOOKBOT_BUSINESS_ID!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
  if (!phoneNumberId) return DEFAULT_BUSINESS_ID;

  const { data } = await supabase
    .from("bookbot_businesses")
    .select("id")
    .eq("phone_number_id", phoneNumberId)
    .limit(1)
    .single();

  return data?.id ?? DEFAULT_BUSINESS_ID;
}

/**
 * WhatsApp Webhook — multi-tenant.
 * Routes to correct business by phone_number_id (Meta) or defaults (Twilio).
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown>;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    } else {
      body = await req.json();
    }

    const parsed = parseWhatsAppMessage(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }

    // Multi-tenant routing
    const phoneNumberId = extractPhoneNumberId(body);
    const businessId = await resolveBusinessId(phoneNumberId);

    // Trigger task — must await (Vercel serverless kills unawaited fetches)
    const triggerRes = await fetch(
      `${TRIGGER_API_URL}/api/v1/tasks/bookbot-whatsapp-handler/trigger`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TRIGGER_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            from: parsed.from,
            message: parsed.message,
            buttonPayload: parsed.buttonPayload,
            messageType: parsed.messageType,
            businessId,
          },
        }),
      }
    );

    if (!triggerRes.ok) {
      console.error("[BookBot] Trigger.dev error:", triggerRes.status, await triggerRes.text());
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[BookBot] Webhook error:", err);
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

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN ?? "bookbot_verify_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
