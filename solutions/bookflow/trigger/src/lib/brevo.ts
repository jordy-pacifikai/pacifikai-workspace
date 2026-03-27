import { logger } from "@trigger.dev/sdk";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export interface BrevoEmailOptions {
  sender?: { email: string; name: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  tags?: string[];
  headers?: Record<string, string>;
}

const DEFAULT_SENDER = { email: "vea@pacifikai.com", name: "Ve'a" };

/**
 * Send an email via Brevo transactional API.
 * Throws on HTTP error (for Trigger.dev retry handling).
 */
export async function sendBrevoEmail(opts: BrevoEmailOptions): Promise<{ messageId: string }> {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: opts.sender ?? DEFAULT_SENDER,
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      ...(opts.tags && { tags: opts.tags }),
      ...(opts.headers && { headers: opts.headers }),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo ${res.status}: ${body}`);
  }

  const data = await res.json();
  logger.info("Email sent via Brevo", {
    to: opts.to[0]?.email,
    messageId: data.messageId,
  });
  return { messageId: data.messageId };
}
