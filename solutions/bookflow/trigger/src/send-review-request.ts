import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { sendBrevoEmail } from "./lib/brevo.js";
import { loadBusinessConfig } from "./lib/supabase.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { escapeHtml } from "./utils/html.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export const sendReviewRequestTask = schemaTask({
  id: "send-review-request",
  schema: z.object({
    appointmentId: z.string().uuid(),
    businessId: z.string().uuid(),
    clientPhone: z.string(),
    clientName: z.string().nullable(),
    clientEmail: z.string().email().nullable().optional(),
  }),
  retry: { maxAttempts: 2 },
  run: async (payload) => {
    const { appointmentId, businessId, clientPhone, clientName, clientEmail } = payload;

    // 0. Idempotency: skip if review request already exists for this appointment
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_review_requests?appointment_id=eq.${appointmentId}&select=id`,
      { headers: supaHeaders() },
    );
    const existing = await existingRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      logger.info("Review request already sent, skipping", { appointmentId });
      return { sent: false, reason: "already_sent", reviewRequestId: existing[0].id };
    }

    // 1. Load business config
    const config = await loadBusinessConfig(businessId);
    if (!config) {
      throw new Error(`Business config not found for ${businessId}`);
    }

    // 2. Fetch business review settings
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=name,review_auto_send,review_delay_hours,google_review_url`,
      { headers: supaHeaders() }
    );
    const bizRows = await bizRes.json();
    if (!Array.isArray(bizRows) || bizRows.length === 0) {
      throw new Error(`Business not found: ${businessId}`);
    }
    const biz = bizRows[0];

    // 3. Generate a unique token for the review page
    const token = crypto.randomUUID();
    const reviewUrl = `https://vea.pacifikai.com/review/${token}`;

    // 4. Send WhatsApp message FIRST (so we only create DB record if send succeeds)
    const name = clientName?.trim() || "";
    const businessName = biz.name || "notre etablissement";
    const message = `Merci ${name} pour votre visite chez ${businessName} ! Votre avis compte beaucoup pour nous. Donnez-nous votre retour ici : ${reviewUrl}`;

    await sendWhatsApp(clientPhone, message, config);
    logger.info(`Review request WhatsApp sent to ${clientPhone}`, { appointmentId });

    // 4b. Also send review request email if client has an email
    if (clientEmail && process.env.BREVO_API_KEY) {
      try {
        await sendBrevoEmail({
          to: [{ email: clientEmail, name: name || undefined }],
          subject: `Votre avis sur ${escapeHtml(businessName)}`,
          htmlContent: buildReviewEmailHtml({
            clientName: escapeHtml(name || ""),
            businessName: escapeHtml(businessName),
            reviewUrl,
          }),
        });
        logger.info(`Review request email sent to ${clientEmail}`, { appointmentId });
      } catch (err) {
        // Non-blocking — WhatsApp already sent
        logger.error("Review request email failed", { error: String(err), appointmentId });
      }
    }

    // 5. Create review_request row AFTER successful send — atomic insert as 'sent'
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_review_requests`,
      {
        method: "POST",
        headers: { ...supaHeaders(), Prefer: "return=representation" },
        body: JSON.stringify({
          business_id: businessId,
          appointment_id: appointmentId,
          client_name: clientName || clientPhone,
          client_phone: clientPhone,
          token,
          status: "sent",
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          expires_at: expiresAt,
        }),
      }
    );

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      logger.error(`Failed to create review request after send: ${insertRes.status} ${errText}`, { appointmentId });
      // WhatsApp already sent — don't throw (review URL still works, just not tracked)
    }

    const insertData = await insertRes.json().catch(() => []);
    const reviewRequest = Array.isArray(insertData) ? insertData[0] : insertData;
    const reviewRequestId = reviewRequest?.id;

    return { sent: true, reviewRequestId, token };
  },
});

function buildReviewEmailHtml(p: {
  clientName: string;
  businessName: string;
  reviewUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#fff;">Ve&apos;a</p>
            <p style="margin:0;font-size:14px;color:#aaa;">Votre avis compte</p>
          </td>
        </tr>

        <!-- Accent banner -->
        <tr>
          <td style="background:#25D366;padding:12px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#fff;text-align:center;">
              ${p.businessName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour${p.clientName ? " <strong>" + p.clientName + "</strong>" : ""},
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Merci pour votre visite chez <strong style="color:#fff;">${p.businessName}</strong>.<br>
              Votre avis nous aide &agrave; am&eacute;liorer nos services et &agrave; accueillir de nouveaux clients.
            </p>

            <!-- Star visual -->
            <p style="margin:0 0 24px;text-align:center;font-size:32px;letter-spacing:4px;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="${p.reviewUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">
                  Donner mon avis
                </a>
              </td></tr>
            </table>

            <p style="margin:0;font-size:12px;color:#666;text-align:center;line-height:1.5;">
              Cela ne prend que 30 secondes. Merci !
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#555;">
              Envoy&eacute; via Ve&apos;a &mdash; Assistant de r&eacute;servation IA
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
