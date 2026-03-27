import { schemaTask, logger, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendBrevoEmail } from "./lib/brevo.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { escapeHtml } from "./utils/html.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export const welcomeOnboarding = schemaTask({
  id: "welcome-onboarding",
  schema: z.object({
    email: z.string().email(),
    businessName: z.string(),
    plan: z.string().default("starter"),
    sector: z.string().optional(),
  }),
  run: async (payload) => {
    const { email, businessName, plan, sector } = payload;
    const { buildUnsubscribeUrl } = await import("./lib/unsubscribe-token.js");
    const unsubUrl = buildUnsubscribeUrl(email);
    let emailsSent = 0;

    // ─── Email 1: Bienvenue (immédiat) ───────────────────────────────────────

    await sendEmail({
      to: email,
      subject: `Bienvenue sur Ve'a, ${businessName} !`,
      html: buildWelcomeEmail({
        businessName: escapeHtml(businessName),
        plan,
        unsubUrl,
      }),
      unsubUrl,
    });
    emailsSent++;

    logger.info("Welcome email sent", { email, businessName });

    // ─── Email 2: Guide de démarrage (J+1) ──────────────────────────────────

    await wait.for({ hours: 24 });

    if (await isOptedOut(email)) {
      logger.info("Email 2 skipped — user opted out", { email });
      return { emailsSent, to: email, optedOut: true };
    }

    await sendEmail({
      to: email,
      subject: `3 étapes pour activer votre chatbot — ${businessName}`,
      html: buildGettingStartedEmail({
        businessName: escapeHtml(businessName),
        sector: sector ? escapeHtml(sector) : null,
        unsubUrl,
      }),
      unsubUrl,
    });
    emailsSent++;

    logger.info("Getting started email sent", { email });

    // ─── Email 3: Tips & astuces (J+3) ──────────────────────────────────────

    await wait.for({ hours: 48 });

    if (await isOptedOut(email)) {
      logger.info("Email 3 skipped — user opted out", { email });
      return { emailsSent, to: email, optedOut: true };
    }

    await sendEmail({
      to: email,
      subject: `Boostez vos réservations avec ces astuces — ${businessName}`,
      html: buildTipsEmail({
        businessName: escapeHtml(businessName),
        unsubUrl,
      }),
      unsubUrl,
    });
    emailsSent++;

    logger.info("Tips email sent", { email });

    return { emailsSent, to: email };
  },
});

// ─── Opt-out Check ────────────────────────────────────────────────────────

async function isOptedOut(email: string): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/bookbot_businesses?email=eq.${encodeURIComponent(email)}&select=marketing_opt_out&limit=1`;
  const res = await fetch(url, {
    headers: supaHeaders(),
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as { marketing_opt_out: boolean }[];
  return rows.length > 0 && rows[0]!.marketing_opt_out === true;
}

// ─── Email Sender ──────────────────────────────────────────────────────────

async function sendEmail(p: {
  to: string;
  subject: string;
  html: string;
  unsubUrl?: string;
}) {
  await sendBrevoEmail({
    to: [{ email: p.to }],
    subject: p.subject,
    htmlContent: p.html,
    ...(p.unsubUrl && {
      headers: {
        "List-Unsubscribe": `<${p.unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
}

// ─── HTML Builders ─────────────────────────────────────────────────────────

function unsubFooter(url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr><td style="text-align:center;padding:12px 0;">
    <a href="${url}" style="color:#555;font-size:11px;text-decoration:underline;">Se d&eacute;sinscrire des emails marketing</a>
  </td></tr>
</table>`;
}

function buildWelcomeEmail(p: { businessName: string; plan: string; unsubUrl: string }): string {
  const planLabel =
    p.plan === "decouverte"
      ? "Découverte"
      : p.plan === "pro"
        ? "Pro"
        : p.plan === "enterprise"
          ? "Enterprise"
          : "Starter";

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
            <p style="margin:0;font-size:14px;color:#0d9488;">Bienvenue !</p>
          </td>
        </tr>
        <tr>
          <td style="background:#0d9488;padding:12px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#fff;text-align:center;">
              Plan ${planLabel} — Essai gratuit activ&eacute;
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Ia ora na <strong>${p.businessName}</strong> ! 🌺
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">
              Votre compte Ve&apos;a est pr&ecirc;t. Votre chatbot IA va g&eacute;rer vos r&eacute;servations 24h/24 sur WhatsApp, Messenger et Instagram.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Prochaine &eacute;tape : configurez vos services et horaires pour commencer &agrave; recevoir des r&eacute;servations automatiques.
            </p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/onboarding" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">
                Configurer mon chatbot
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;">
              Une question ? <a href="mailto:vea@pacifikai.com" style="color:#0d9488;text-decoration:none;">vea@pacifikai.com</a>
            </p>
          </td>
        </tr>
      </table>
      ${unsubFooter(p.unsubUrl)}
    </td></tr>
  </table>
</body>
</html>`;
}

function buildGettingStartedEmail(p: { businessName: string; sector: string | null; unsubUrl: string }): string {
  const sectorTip = p.sector
    ? `Nous avons d&eacute;j&agrave; pr&eacute;-configur&eacute; votre chatbot pour le secteur <strong style="color:#fff;">${p.sector}</strong>.`
    : `Personnalisez votre chatbot selon votre activit&eacute;.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#fff;">3 &eacute;tapes pour d&eacute;marrer</p>
            <p style="margin:0 0 24px;font-size:13px;color:#aaa;">${p.businessName}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="width:36px;vertical-align:top;">
                  <div style="width:28px;height:28px;background:#0d9488;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#fff;">1</div>
                </td>
                <td style="padding:2px 0 16px 12px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">Ajoutez vos services</p>
                  <p style="margin:0;font-size:13px;color:#888;">Nom, dur&eacute;e et prix de chaque prestation.</p>
                </td>
              </tr>
              <tr>
                <td style="width:36px;vertical-align:top;">
                  <div style="width:28px;height:28px;background:#0d9488;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#fff;">2</div>
                </td>
                <td style="padding:2px 0 16px 12px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">D&eacute;finissez vos horaires</p>
                  <p style="margin:0;font-size:13px;color:#888;">Jours d&apos;ouverture, cr&eacute;neaux et pauses.</p>
                </td>
              </tr>
              <tr>
                <td style="width:36px;vertical-align:top;">
                  <div style="width:28px;height:28px;background:#0d9488;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#fff;">3</div>
                </td>
                <td style="padding:2px 0 0 12px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">Connectez vos canaux</p>
                  <p style="margin:0;font-size:13px;color:#888;">WhatsApp, Messenger ou Instagram en 1 clic.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;font-size:13px;color:#888;line-height:1.5;">
              ${sectorTip}
            </p>

            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/settings" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                Acc&eacute;der au tableau de bord
              </a>
            </div>
          </td>
        </tr>
      </table>
      ${unsubFooter(p.unsubUrl)}
    </td></tr>
  </table>
</body>
</html>`;
}

function buildTipsEmail(p: { businessName: string; unsubUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#fff;">Boostez vos r&eacute;servations</p>
            <p style="margin:0 0 24px;font-size:13px;color:#aaa;">${p.businessName}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#222;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:20px;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #2a2a2a;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">📲 Partagez votre lien de r&eacute;servation</p>
                  <p style="margin:0;font-size:13px;color:#888;">Ajoutez-le dans votre bio Instagram et votre page Facebook.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #2a2a2a;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">📋 Personnalisez vos templates</p>
                  <p style="margin:0;font-size:13px;color:#888;">Adaptez les messages de confirmation et rappel &agrave; votre ton.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">⭐ Activez les avis clients</p>
                  <p style="margin:0;font-size:13px;color:#888;">Un email automatique demande un avis apr&egrave;s chaque RDV.</p>
                </td>
              </tr>
            </table>

            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/share" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                Partager mon lien
              </a>
            </div>
          </td>
        </tr>
      </table>
      ${unsubFooter(p.unsubUrl)}
    </td></tr>
  </table>
</body>
</html>`;
}

