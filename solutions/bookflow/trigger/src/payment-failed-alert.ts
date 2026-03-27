import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendBrevoEmail } from "./lib/brevo.js";
import { escapeHtml } from "./utils/html.js";

export const paymentFailedAlert = schemaTask({
  id: "payment-failed-alert",
  schema: z.object({
    email: z.string().email(),
    businessName: z.string(),
  }),
  retry: { maxAttempts: 3 },
  run: async (payload) => {
    const safeName = escapeHtml(payload.businessName);

    const htmlContent = buildPaymentFailedEmail({ businessName: safeName });

    await sendBrevoEmail({
      to: [{ email: payload.email, name: payload.businessName }],
      subject: "Votre paiement a echoue — action requise",
      htmlContent,
      tags: ["payment-failed"],
    });

    logger.info("Payment failed alert sent", { to: payload.email });
    return { sent: true, to: payload.email };
  },
});

// ─── HTML Builder ─────────────────────────────────────────────────────────────

function buildPaymentFailedEmail(p: { businessName: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#fff;">Ve&apos;a</p>
            <p style="margin:0;font-size:14px;color:#aaa;">Echec du paiement</p>
          </td>
        </tr>
        <tr>
          <td style="background:#7f1d1d;padding:12px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#fca5a5;text-align:center;">
              Action requise — votre acc&egrave;s pourrait &ecirc;tre suspendu
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour <strong>${p.businessName}</strong>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">
              Nous n&apos;avons pas pu traiter votre dernier paiement pour votre abonnement Ve&apos;a.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Pour &eacute;viter toute interruption de service, veuillez mettre &agrave; jour votre moyen de paiement d&egrave;s que possible.
            </p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">
                Mettre &agrave; jour mon paiement
              </a>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5;">
              Si vous avez des questions, r&eacute;pondez &agrave; cet email ou contactez-nous &agrave;
              <a href="mailto:vea@pacifikai.com" style="color:#888;text-decoration:none;">vea@pacifikai.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
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
