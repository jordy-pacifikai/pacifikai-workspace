export interface ParsedMessage {
  from: string;
  message: string;
  buttonPayload: string | null;
  messageType: "text" | "button" | "interactive";
}

/**
 * Parse incoming WhatsApp webhook payload.
 * Supports both Twilio format and Meta Cloud API format.
 */
export function parseWhatsAppMessage(
  body: Record<string, unknown>
): ParsedMessage | null {
  // Twilio format
  if (typeof body.From === "string") {
    const from = (body.From as string).replace("whatsapp:", "");
    const messageText = (body.Body as string) ?? "";
    const buttonPayload = (body.ButtonPayload as string) ?? null;

    if (!from || (!messageText && !buttonPayload)) return null;

    return {
      from,
      message: messageText.trim(),
      buttonPayload,
      messageType: buttonPayload ? "button" : "text",
    };
  }

  // Meta Cloud API format
  if (body.entry) {
    const entries = body.entry as Array<Record<string, unknown>>;
    const changes =
      (entries[0]?.changes as Array<Record<string, unknown>>) ?? [];
    const value = changes[0]?.value as Record<string, unknown> | undefined;
    const messages =
      (value?.messages as Array<Record<string, unknown>>) ?? [];
    const msg = messages[0];

    if (!msg) return null;

    const from = (msg.from as string) ?? "";
    const msgType = (msg.type as string) ?? "text";

    if (msgType === "interactive") {
      const inter = msg.interactive as Record<
        string,
        Record<string, string>
      >;
      const buttonPayload =
        inter?.button_reply?.id ?? inter?.list_reply?.id ?? "";
      const messageText =
        inter?.button_reply?.title ?? inter?.list_reply?.title ?? "";

      return {
        from,
        message: messageText.trim(),
        buttonPayload: buttonPayload || null,
        messageType: "interactive",
      };
    }

    const textBody = msg.text as Record<string, string> | undefined;
    const messageText = textBody?.body ?? "";

    if (!from || !messageText) return null;

    return {
      from,
      message: messageText.trim(),
      buttonPayload: null,
      messageType: "text",
    };
  }

  return null;
}
