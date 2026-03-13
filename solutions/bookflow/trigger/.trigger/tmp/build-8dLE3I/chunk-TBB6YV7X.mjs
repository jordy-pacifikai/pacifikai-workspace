import {
  __name,
  init_esm
} from "./chunk-VMIWEUEA.mjs";

// src/lib/whatsapp.ts
init_esm();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
async function sendWhatsApp(to, message, config) {
  if (!message) return;
  if (to.startsWith("messenger_")) {
    const recipientId = to.replace("messenger_", "");
    await sendViaMessenger(recipientId, message, config);
    return;
  }
  if (config.provider === "meta") {
    await sendViaMeta(to, message, config);
  } else {
    await sendViaTwilio(to, message, config);
  }
}
__name(sendWhatsApp, "sendWhatsApp");
async function sendViaTwilio(to, message, config) {
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
        Authorization: "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }
}
__name(sendViaTwilio, "sendViaTwilio");
async function sendViaMeta(to, message, config) {
  const { metaPhoneNumberId, metaAccessToken } = config;
  if (!metaPhoneNumberId || !metaAccessToken) {
    throw new Error("Meta credentials missing in business config");
  }
  const phone = to.replace("whatsapp:", "").replace("+", "");
  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message }
      })
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API error ${res.status}: ${text}`);
  }
}
__name(sendViaMeta, "sendViaMeta");
async function sendViaMessenger(recipientId, message, config) {
  const pageToken = await getPageToken(config.businessId);
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
        message: { text: message }
      })
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Messenger API error ${res.status}: ${text}`);
  }
}
__name(sendViaMessenger, "sendViaMessenger");
async function getPageToken(businessId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=meta_page_token`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0].meta_page_token ?? null;
  }
  return null;
}
__name(getPageToken, "getPageToken");

export {
  sendWhatsApp
};
//# sourceMappingURL=chunk-TBB6YV7X.mjs.map
