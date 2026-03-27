import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendBrevoEmail } from "./lib/brevo.js";
import { escapeHtml } from "./utils/html.js";

export const paymentConfirmation = schemaTask({
  id: "payment-confirmation",
  schema: z.object({
    email: z.string().email(),
    businessName: z.string(),
    planName: z.string(),
    amount: z.number(),
    currency: z.string().default("EUR"),
    periodStart: z.string(),
    periodEnd: z.string(),
  }),
  run: async (payload) => {
    const safeName = escapeHtml(payload.businessName);
    const safePlan = escapeHtml(payload.planName);

    const periodFmt = (iso: string) =>
      new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="color:#fff;font-size:22px;margin:0">Confirmation de paiement</h1>
      <p style="color:#9ca3af;font-size:14px;margin:8px 0 0">Merci pour votre abonnement Ve'a</p>
    </div>
    <div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#9ca3af;font-size:13px;padding:8px 0">Entreprise</td>
          <td style="color:#fff;font-size:13px;padding:8px 0;text-align:right">${safeName}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;padding:8px 0">Plan</td>
          <td style="color:#25D366;font-size:13px;padding:8px 0;text-align:right;font-weight:600">${safePlan}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;padding:8px 0">Montant</td>
          <td style="color:#fff;font-size:13px;padding:8px 0;text-align:right">${payload.amount.toFixed(2)} ${escapeHtml(payload.currency)}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;padding:8px 0">Periode</td>
          <td style="color:#fff;font-size:13px;padding:8px 0;text-align:right">${periodFmt(payload.periodStart)} — ${periodFmt(payload.periodEnd)}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center">
      <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#25D366;color:#000;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">
        Voir ma facturation
      </a>
    </div>
    <p style="color:#6b7280;font-size:11px;text-align:center;margin-top:32px">
      Ve'a par PACIFIK'AI — vea.pacifikai.com
    </p>
  </div>
</body>
</html>`.trim();

    await sendBrevoEmail({
      to: [{ email: payload.email }],
      subject: `Confirmation de paiement — Ve'a (${safePlan})`,
      htmlContent: html,
    });

    logger.info("Payment confirmation email sent", {
      email: payload.email,
      plan: payload.planName,
      amount: payload.amount,
    });
  },
});
