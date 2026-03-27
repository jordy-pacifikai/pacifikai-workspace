import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { supaHeaders } from "./lib/supabase-headers.js";
import { sendBrevoEmail } from "./lib/brevo.js";
import { escapeHtml } from "./utils/html.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export const sendCancellationEmail = schemaTask({
  id: "send-cancellation-email",
  schema: z.object({
    businessId: z.string().uuid(),
    clientEmail: z.string().email(),
    clientName: z.string(),
    service: z.string().nullable(),
    appointmentDate: z.string(), // YYYY-MM-DD
    timeSlot: z.string(), // HH:MM
  }),
  retry: { maxAttempts: 2 },
  run: async (payload) => {
    // 1. Fetch business name
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${payload.businessId}&select=name,brand_color,booking_slug`,
      { headers: supaHeaders() },
    );
    const bizData = await bizRes.json();
    const biz = Array.isArray(bizData) && bizData.length > 0 ? bizData[0] : null;
    const businessName = biz?.name ?? "Votre prestataire";
    const brandColor = biz?.brand_color ?? "#25D366";
    const bookingSlug = biz?.booking_slug ?? payload.businessId;

    // 2. Format date in French
    const dateObj = new Date(payload.appointmentDate + "T12:00:00");
    const dateFr = dateObj.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const serviceName = payload.service ?? "Rendez-vous";
    const rebookLink = `https://vea.pacifikai.com/book/${bookingSlug}`;

    // 3. Build HTML email
    const accent = escapeHtml(brandColor);
    const subject = `Annulation — ${escapeHtml(serviceName)} du ${dateFr}`;

    const htmlContent = buildCancellationHtml({
      businessName: escapeHtml(businessName),
      service: escapeHtml(serviceName),
      dateFr,
      time: payload.timeSlot,
      accent,
      rebookLink,
      clientName: escapeHtml(payload.clientName),
    });

    // 4. Send via Brevo
    await sendBrevoEmail({
      to: [{ email: payload.clientEmail, name: payload.clientName }],
      subject,
      htmlContent,
    });

    logger.info("Cancellation email sent", {
      to: payload.clientEmail,
      business: businessName,
    });

    return { sent: true, to: payload.clientEmail };
  },
});

function buildCancellationHtml(p: {
  businessName: string;
  service: string;
  dateFr: string;
  time: string;
  accent: string;
  rebookLink: string;
  clientName: string;
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
            <p style="margin:0;font-size:14px;color:#aaa;">Annulation de rendez-vous</p>
          </td>
        </tr>

        <!-- Accent banner -->
        <tr>
          <td style="background:#dc2626;padding:12px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#fff;text-align:center;">
              ${p.businessName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour <strong>${p.clientName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Votre rendez-vous a bien &eacute;t&eacute; annul&eacute;. Voici le r&eacute;capitulatif :
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#222;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#aaa;font-size:14px;">Service</td>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:600;color:#fff;text-decoration:line-through;">${p.service}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#aaa;font-size:14px;">Date</td>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:600;color:#dc2626;text-decoration:line-through;">${p.dateFr}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#aaa;font-size:14px;">Heure</td>
                <td style="padding:10px 16px;text-align:right;font-size:14px;font-weight:600;color:#fff;text-decoration:line-through;">${p.time}</td>
              </tr>
            </table>

            <!-- Rebook CTA -->
            <div style="text-align:center;margin-top:8px;">
              <a href="${p.rebookLink}" style="display:inline-block;background:${p.accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
                Reprendre rendez-vous
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#555;">
              Vous recevez ce mail suite &agrave; l&apos;annulation de votre r&eacute;servation sur Ve&apos;a.
            </p>
            <p style="margin:0;font-size:12px;color:#555;">
              <a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// escapeHtml imported from utils/html.ts
