import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendBrevoEmail } from "./lib/brevo.js";
import { escapeHtml } from "./utils/html.js";

export const cancellationEmail = schemaTask({
  id: "cancellation-email",
  schema: z.object({
    email: z.string().email(),
    businessName: z.string(),
    planName: z.string(),
    periodEnd: z.string(), // ISO date — access until this date
  }),
  retry: { maxAttempts: 3 },
  run: async (payload) => {
    const safeName = escapeHtml(payload.businessName);
    const safePlan = escapeHtml(payload.planName);

    const periodEndFr = new Date(payload.periodEnd).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const htmlContent = buildCancellationEmail({
      businessName: safeName,
      planName: safePlan,
      periodEndFr,
    });

    await sendBrevoEmail({
      to: [{ email: payload.email, name: payload.businessName }],
      subject: "Votre abonnement Ve\u2019a a ete annule",
      htmlContent,
      tags: ["subscription-cancelled"],
    });

    logger.info("Cancellation confirmation email sent", {
      to: payload.email,
      plan: payload.planName,
      periodEnd: payload.periodEnd,
    });

    return { sent: true, to: payload.email };
  },
});

// ─── HTML Builder ─────────────────────────────────────────────────────────────

function buildCancellationEmail(p: {
  businessName: string;
  planName: string;
  periodEndFr: string;
}): string {
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
            <p style="margin:0;font-size:14px;color:#aaa;">Annulation d&apos;abonnement</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour <strong>${p.businessName}</strong>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">
              Votre abonnement <strong style="color:#fff;">${p.planName}</strong> a bien &eacute;t&eacute; annul&eacute;.
            </p>

            <!-- Access info card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#222;border:1px solid #333;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#888;">Acc&egrave;s garanti jusqu&apos;au</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">${p.periodEndFr}</p>
                  <p style="margin:8px 0 0;font-size:13px;color:#666;line-height:1.5;">
                    Vous conservez toutes les fonctionnalit&eacute;s de votre plan jusqu&apos;&agrave; cette date. Aucune action suppl&eacute;mentaire n&apos;est n&eacute;cessaire.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Vos donn&eacute;es et votre configuration sont conserv&eacute;es. Vous pouvez r&eacute;activer votre abonnement &agrave; tout moment.
            </p>

            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">
                R&eacute;activer mon abonnement
              </a>
            </div>

            <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5;">
              Une question ? Contactez-nous &agrave;
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
