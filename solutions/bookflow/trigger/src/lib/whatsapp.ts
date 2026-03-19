import type { BusinessConfig } from "./config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/**
 * Send a message to the correct channel based on the `to` address format.
 * - "messenger_SENDER_ID" → Facebook Messenger
 * - "instagram_SENDER_ID" → Instagram DM (same Graph API, different endpoint)
 * - anything else → WhatsApp (Twilio or Meta Cloud API)
 */
export async function sendWhatsApp(
  to: string,
  message: string,
  config: BusinessConfig,
  pageAccessToken?: string
): Promise<void> {
  if (!message) return;

  // Detect Messenger channel
  if (to.startsWith("messenger_")) {
    const recipientId = to.replace("messenger_", "");
    await sendViaMessenger(recipientId, message, config, pageAccessToken);
    return;
  }

  // Detect Instagram channel
  if (to.startsWith("instagram_")) {
    const recipientId = to.replace("instagram_", "");
    await sendViaInstagram(recipientId, message, config, pageAccessToken);
    return;
  }

  // WhatsApp
  if (config.provider === "meta") {
    await sendViaMeta(to, message, config);
  } else {
    await sendViaTwilio(to, message, config);
  }
}

async function sendViaTwilio(
  to: string,
  message: string,
  config: BusinessConfig
): Promise<void> {
  const { twilioSid, twilioToken, twilioFrom } = config;
  if (!twilioSid || !twilioToken || !twilioFrom) {
    throw new Error("Twilio credentials missing in business config");
  }

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const params = new URLSearchParams();
  params.append("From", twilioFrom);
  params.append("To", toFormatted);
  params.append("Body", message);

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }
}

interface MetaApiError {
  error: { message: string; type: string; code: number; fbtrace_id?: string };
}

interface MetaApiSuccess {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

function getMetaCredentials(config: BusinessConfig) {
  const { metaPhoneNumberId, metaAccessToken } = config;
  if (!metaPhoneNumberId || !metaAccessToken) {
    throw new Error("Meta credentials missing in business config");
  }
  return { metaPhoneNumberId, metaAccessToken };
}

function formatPhone(to: string): string {
  return to.replace("whatsapp:", "").replace("+", "");
}

async function parseMetaResponse(res: Response): Promise<string> {
  const body = await res.json();
  if (!res.ok) {
    const err = body as MetaApiError;
    const msg = err.error?.message ?? JSON.stringify(body);
    const code = err.error?.code ?? res.status;
    const type = err.error?.type ?? "unknown";
    throw new Error(`Meta API error ${code} (${type}): ${msg}`);
  }
  const success = body as MetaApiSuccess;
  return success.messages?.[0]?.id ?? "";
}

async function sendViaMeta(
  to: string,
  message: string,
  config: BusinessConfig
): Promise<string> {
  const { metaPhoneNumberId, metaAccessToken } = getMetaCredentials(config);
  const phone = formatPhone(to);

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  return parseMetaResponse(res);
}

/**
 * Send via Facebook Messenger Page API.
 * Requires meta_page_token stored in business config.
 */
async function sendViaMessenger(
  recipientId: string,
  message: string,
  config: BusinessConfig,
  pageAccessToken?: string
): Promise<void> {
  const pageToken = pageAccessToken || await getPageToken(config.businessId);
  if (!pageToken) {
    throw new Error("Messenger page token not found for business");
  }

  const res = await fetch(
    `https://graph.facebook.com/v22.0/me/messages?access_token=${pageToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Messenger API error ${res.status}: ${text}`);
  }
}

/**
 * Send via Instagram DM using the Page token.
 * Instagram DMs use the same /me/messages endpoint as Messenger.
 */
async function sendViaInstagram(
  recipientId: string,
  message: string,
  config: BusinessConfig,
  pageAccessToken?: string
): Promise<void> {
  const pageToken = pageAccessToken || await getPageToken(config.businessId);
  if (!pageToken) {
    throw new Error("Instagram page token not found for business");
  }

  const res = await fetch(
    `https://graph.facebook.com/v22.0/me/messages?access_token=${pageToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram DM API error ${res.status}: ${text}`);
  }
}

async function getPageToken(businessId: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=meta_page_token`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0].meta_page_token ?? null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Interactive Messages — WhatsApp only
// ---------------------------------------------------------------------------

/**
 * Send WhatsApp reply buttons (max 3 buttons).
 * Use for: confirmation prompts, yes/no, service selection (<=3 options).
 */
export async function sendWhatsAppButtons(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
  config: BusinessConfig,
  header?: string,
  footer?: string,
): Promise<string> {
  if (buttons.length === 0 || buttons.length > 3) {
    throw new Error(
      `WhatsApp buttons must have 1-3 items, got ${buttons.length}`,
    );
  }
  for (const btn of buttons) {
    if (btn.title.length > 20) {
      throw new Error(
        `Button title "${btn.title}" exceeds 20 chars (${btn.title.length})`,
      );
    }
  }

  const { metaPhoneNumberId, metaAccessToken } = getMetaCredentials(config);
  const phone = formatPhone(to);

  const interactive: Record<string, unknown> = {
    type: "button",
    body: { text: body },
    action: {
      buttons: buttons.map((b) => ({
        type: "reply",
        reply: { id: b.id, title: b.title },
      })),
    },
  };

  if (header) interactive.header = { type: "text", text: header };
  if (footer) interactive.footer = { text: footer };

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive,
      }),
    },
  );

  return parseMetaResponse(res);
}

/**
 * Send WhatsApp list message (max 10 items in 1 section).
 * Use for: service selection, time slot selection, date selection.
 */
export async function sendWhatsAppList(
  to: string,
  body: string,
  buttonText: string,
  items: Array<{ id: string; title: string; description?: string }>,
  config: BusinessConfig,
  header?: string,
  footer?: string,
): Promise<string> {
  if (items.length === 0 || items.length > 10) {
    throw new Error(
      `WhatsApp list must have 1-10 items, got ${items.length}`,
    );
  }
  if (buttonText.length > 20) {
    throw new Error(
      `List buttonText "${buttonText}" exceeds 20 chars (${buttonText.length})`,
    );
  }

  const { metaPhoneNumberId, metaAccessToken } = getMetaCredentials(config);
  const phone = formatPhone(to);

  const interactive: Record<string, unknown> = {
    type: "list",
    body: { text: body },
    action: {
      button: buttonText,
      sections: [
        {
          title: "Options",
          rows: items.map((item) => ({
            id: item.id,
            title: item.title,
            ...(item.description ? { description: item.description } : {}),
          })),
        },
      ],
    },
  };

  if (header) interactive.header = { type: "text", text: header };
  if (footer) interactive.footer = { text: footer };

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive,
      }),
    },
  );

  return parseMetaResponse(res);
}

/**
 * Send a pre-approved WhatsApp template message.
 * Use for: appointment reminders, confirmations (outside 24h window).
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }>,
  config: BusinessConfig,
): Promise<string> {
  const { metaPhoneNumberId, metaAccessToken } = getMetaCredentials(config);
  const phone = formatPhone(to);

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    },
  );

  return parseMetaResponse(res);
}

// ---------------------------------------------------------------------------
// Channel detection utility
// ---------------------------------------------------------------------------

/**
 * Detect which channel a recipient uses based on the `to` address format.
 * WhatsApp supports buttons/lists, Messenger supports quick_replies,
 * Instagram supports text only.
 */
export function supportsInteractive(
  to: string,
): "whatsapp" | "messenger" | "instagram" {
  if (to.startsWith("messenger_")) return "messenger";
  if (to.startsWith("instagram_")) return "instagram";
  return "whatsapp";
}
