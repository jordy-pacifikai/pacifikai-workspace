import {
  __name,
  init_esm
} from "../../../../../../../../../chunk-VMIWEUEA.mjs";

// src/utils/parse-message.ts
init_esm();
function parseWhatsAppMessage(body) {
  if (typeof body.From === "string") {
    const from = body.From.replace("whatsapp:", "");
    const messageText = body.Body ?? "";
    const buttonPayload = body.ButtonPayload ?? null;
    if (!from || !messageText && !buttonPayload) return null;
    return {
      from,
      message: messageText.trim(),
      buttonPayload,
      messageType: buttonPayload ? "button" : "text"
    };
  }
  if (body.entry) {
    const entries = body.entry;
    const changes = entries[0]?.changes ?? [];
    const value = changes[0]?.value;
    const messages = value?.messages ?? [];
    const msg = messages[0];
    if (!msg) return null;
    const from = msg.from ?? "";
    const msgType = msg.type ?? "text";
    if (msgType === "interactive") {
      const inter = msg.interactive;
      const buttonPayload = inter?.button_reply?.id ?? inter?.list_reply?.id ?? "";
      const messageText2 = inter?.button_reply?.title ?? inter?.list_reply?.title ?? "";
      return {
        from,
        message: messageText2.trim(),
        buttonPayload: buttonPayload || null,
        messageType: "interactive"
      };
    }
    const textBody = msg.text;
    const messageText = textBody?.body ?? "";
    if (!from || !messageText) return null;
    return {
      from,
      message: messageText.trim(),
      buttonPayload: null,
      messageType: "text"
    };
  }
  return null;
}
__name(parseWhatsAppMessage, "parseWhatsAppMessage");
export {
  parseWhatsAppMessage
};
//# sourceMappingURL=parse-message.mjs.map
