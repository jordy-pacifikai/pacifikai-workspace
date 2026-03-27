import { schedules, logger } from "@trigger.dev/sdk";
import { supaHeaders } from "./lib/supabase-headers.js";
import { sendBrevoEmail } from "./lib/brevo.js";
import { createNotification } from "./lib/notify.js";
import { escapeHtml } from "./utils/html.js";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { buildBusinessConfig } from "./lib/config.js";
import type { BusinessRow } from "./lib/config.js";
import { runWeeklyDigest } from "./weekly-digest.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  birthday_msg_sent_at: string | null;
}

interface ExpiredBusiness {
  id: string;
  name: string;
  email: string | null;
  owner_user_id: string | null;
  trial_ends_at: string;
  plan: string | null;
}

/** Daily at 08:00 Tahiti (UTC-10) = 18:00 UTC
 * Combined task: trial expiration + trial reminder (J-3) + monthly conversation_count reset */
export const trialExpiration = schedules.task({
  id: "trial-expiration",
  cron: "0 18 * * *",
  run: async () => {
    const nowDate = new Date();
    const now = nowDate.toISOString();

    // ── Birthday messages ──
    {
      const bizRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
        { headers: supaHeaders() },
      );
      const businesses: BusinessRow[] = await bizRes.json();

      if (Array.isArray(businesses) && businesses.length > 0) {
        const tahitiDate = nowDate.toLocaleDateString("en-CA", { timeZone: "Pacific/Tahiti" });
        const parts = tahitiDate.split("-");
        const todayMonth = parseInt(parts[1] ?? "0", 10);
        const todayDay = parseInt(parts[2] ?? "0", 10);
        const elevenMonthsAgo = new Date(nowDate.getTime() - 11 * 30 * 24 * 60 * 60 * 1000).toISOString();

        let totalBirthdaySent = 0;
        let birthdayBizCount = 0;

        for (const biz of businesses) {
          const cfg = (biz.config ?? {}) as Record<string, unknown>;
          if (cfg.birthday_messages === false) continue;

          const clientRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookbot_clients?business_id=eq.${biz.id}&birthday=not.is.null&phone=not.is.null&marketing_opt_out=eq.false&select=id,name,phone,birthday,birthday_msg_sent_at`,
            { headers: supaHeaders() },
          );
          const clients: BirthdayClient[] = await clientRes.json();
          if (!Array.isArray(clients) || clients.length === 0) continue;

          const birthdayClients = clients.filter((c) => {
            if (!c.birthday || !c.phone) return false;
            const bParts = c.birthday.split("-");
            if (parseInt(bParts[1] ?? "0", 10) !== todayMonth || parseInt(bParts[2] ?? "0", 10) !== todayDay) return false;
            if (c.birthday_msg_sent_at) {
              const sentAt = new Date(c.birthday_msg_sent_at);
              if (sentAt.toISOString() > elevenMonthsAgo) return false;
            }
            return true;
          });

          if (birthdayClients.length === 0) continue;

          const businessConfig = buildBusinessConfig(biz);
          const slug = biz.booking_slug ?? biz.id;
          const bookingUrl = `https://vea.pacifikai.com/book/${slug}`;
          let bizSent = 0;

          for (const client of birthdayClients) {
            const firstName = client.name.split(" ")[0] || client.name;
            const message =
              `Joyeux anniversaire ${firstName} ! 🎂 Toute l'equipe de ${biz.name} vous souhaite une excellente journee. ` +
              `Pour celebrer, profitez de -10% sur votre prochain rendez-vous : ${bookingUrl}`;

            try {
              await sendWhatsApp(client.phone, message, businessConfig);
              await fetch(
                `${SUPABASE_URL}/rest/v1/bookbot_clients?id=eq.${client.id}`,
                {
                  method: "PATCH",
                  headers: { ...supaHeaders(), Prefer: "return=minimal" },
                  body: JSON.stringify({ birthday_msg_sent_at: new Date().toISOString() }),
                },
              );
              bizSent++;
              logger.info(`Birthday message sent to ${client.name} (${client.phone}) for ${biz.name}`);
            } catch (err) {
              logger.error(`Failed birthday message for ${client.name} at ${biz.name}`, {
                error: err instanceof Error ? err.message : String(err),
              });
            }
          }

          totalBirthdaySent += bizSent;
          if (bizSent > 0) birthdayBizCount++;
        }

        logger.info(`Birthday messages: ${totalBirthdaySent} sent across ${birthdayBizCount} businesses`);
      }
    }

    // ── Monthly conversation_count reset (1st of month) ──
    if (nowDate.getUTCDate() === 1) {
      const resetRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id`,
        {
          method: "PATCH",
          headers: { ...supaHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({ conversation_count: 0 }),
        },
      );
      if (resetRes.ok) {
        logger.info("Monthly conversation_count reset complete");
      } else {
        logger.error(`Monthly reset failed: ${resetRes.status}`);
      }
    }

    // ── Mid-trial reminder (J7 — sent 7 days after signup) ──
    const midTrialFrom = new Date(nowDate.getTime() - 8 * 24 * 60 * 60 * 1000);
    const midTrialTo = new Date(nowDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    const midTrialRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses` +
        `?subscription_status=eq.trial` +
        `&created_at=gt.${midTrialFrom.toISOString()}` +
        `&created_at=lt.${midTrialTo.toISOString()}` +
        `&mid_trial_sent=not.is.true` +
        `&select=id,name,email,owner_user_id,trial_ends_at,plan,conversation_count`,
      { headers: supaHeaders() },
    );
    if (midTrialRes.ok) {
      const midTrials: (ExpiredBusiness & { conversation_count?: number })[] = await midTrialRes.json();
      for (const biz of midTrials) {
        if (!biz.email) continue;
        const conversationCount = biz.conversation_count ?? 0;
        try {
          await sendBrevoEmail({
            to: [{ email: biz.email }],
            subject: `Mi-parcours de votre essai Ve'a`,
            htmlContent: buildMidTrialEmail({ businessName: escapeHtml(biz.name), conversationCount }),
            tags: ["mid-trial"],
          });
          await fetch(`${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`, {
            method: "PATCH",
            headers: { ...supaHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({ mid_trial_sent: true }),
          });
          logger.info(`Mid-trial email sent to ${biz.email}`);
        } catch (err) {
          logger.error(`Mid-trial email error for ${biz.email}`, { error: String(err) });
        }
      }
    }

    // ── Trial reminder (J-3) ──
    const in3Days = new Date(nowDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const reminderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses` +
        `?subscription_status=eq.trial` +
        `&trial_ends_at=gt.${now}` +
        `&trial_ends_at=lt.${in3Days.toISOString()}` +
        `&trial_reminder_sent=not.is.true` +
        `&select=id,name,email,owner_user_id,trial_ends_at,plan`,
      { headers: supaHeaders() },
    );
    if (reminderRes.ok) {
      const reminders: ExpiredBusiness[] = await reminderRes.json();
      for (const biz of reminders) {
        if (!biz.email) continue;
        const trialEndDate = new Date(biz.trial_ends_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        try {
          await sendBrevoEmail({
            to: [{ email: biz.email }],
            subject: `Plus que 3 jours d'essai gratuit — Ve'a`,
            htmlContent: buildReminderEmail({ businessName: escapeHtml(biz.name), trialEndDate }),
            tags: ["trial-reminder"],
          });
          await fetch(`${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`, {
            method: "PATCH",
            headers: { ...supaHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({ trial_reminder_sent: true }),
          });
          await createNotification({
            businessId: biz.id,
            type: "cancellation",
            title: "Essai gratuit — J-3",
            message: `Il vous reste 3 jours d'essai gratuit. Choisissez un abonnement pour continuer sans interruption.`,
            metadata: { plan: biz.plan, trialEndsAt: biz.trial_ends_at },
          });
          logger.info(`Trial reminder sent to ${biz.email}`);
        } catch (err) {
          logger.error(`Trial reminder error for ${biz.email}`, { error: String(err) });
        }
      }
    }

    // ── Trial reminder (J-1) ──
    const in1Day = new Date(nowDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    const j1Res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses` +
        `?subscription_status=eq.trial` +
        `&trial_ends_at=gt.${now}` +
        `&trial_ends_at=lt.${in1Day.toISOString()}` +
        `&trial_reminder_j1_sent=not.is.true` +
        `&select=id,name,email,owner_user_id,trial_ends_at,plan`,
      { headers: supaHeaders() },
    );
    if (j1Res.ok) {
      const j1Businesses: ExpiredBusiness[] = await j1Res.json();
      for (const biz of j1Businesses) {
        if (!biz.email) continue;
        const trialEndDate = new Date(biz.trial_ends_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        try {
          await sendBrevoEmail({
            to: [{ email: biz.email }],
            subject: `Dernier jour d'essai — choisissez votre plan Ve'a`,
            htmlContent: buildJ1ReminderEmail({ businessName: escapeHtml(biz.name), trialEndDate }),
            tags: ["trial-reminder-j1"],
          });
          // Best-effort tracking — column may not exist
          await fetch(`${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`, {
            method: "PATCH",
            headers: { ...supaHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({ trial_reminder_j1_sent: true }),
          });
          logger.info(`J-1 reminder sent to ${biz.email}`);
        } catch (err) {
          logger.error(`J-1 reminder error for ${biz.email}`, { error: String(err) });
        }
      }
    }

    // ── Trial expiration ──

    // Find businesses where trial has expired but status is still 'trial'
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?subscription_status=eq.trial&trial_ends_at=lt.${now}&select=id,name,email,owner_user_id,trial_ends_at,plan`,
      { headers: supaHeaders() },
    );

    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status}`);
    }

    const expired: ExpiredBusiness[] = await res.json();

    if (expired.length === 0) {
      logger.info("No expired trials found");
      return { processed: 0 };
    }

    logger.info(`Found ${expired.length} expired trial(s)`);

    let processed = 0;
    let emailsSent = 0;

    for (const biz of expired) {
      // 1. Update subscription_status to 'expired'
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`,
        {
          method: "PATCH",
          headers: { ...supaHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({ subscription_status: "expired" }),
        },
      );

      if (!updateRes.ok) {
        logger.error(`Failed to update business ${biz.id}: ${updateRes.status}`);
        continue;
      }

      processed++;

      // 2. Send expiration notification email
      const email = biz.email;
      if (!email) {
        logger.warn(`No contact email for business ${biz.id}, skipping email`);
        continue;
      }

      const trialEndDate = new Date(biz.trial_ends_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const htmlContent = buildExpirationEmail({
        businessName: escapeHtml(biz.name),
        trialEndDate,
      });

      try {
        await sendBrevoEmail({
          to: [{ email }],
          subject: `Votre essai Ve'a a expiré — continuez avec un abonnement`,
          htmlContent,
        });
        emailsSent++;
      } catch (err) {
        logger.error(`Brevo error for ${email}`, { error: String(err) });
      }

      // 3. Create in-app notification
      await createNotification({
        businessId: biz.id,
        type: "cancellation", // closest match — trial ended = service interrupted
        title: "Essai terminé",
        message: `Votre période d'essai est terminée. Choisissez un abonnement pour continuer à utiliser Ve'a.`,
        metadata: { plan: biz.plan, trialEndsAt: biz.trial_ends_at },
      });
    }

    logger.info(`Trial expiration complete`, { processed, emailsSent });

    // ── Post-expiry J+2 ──
    const j2From = new Date(nowDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const j2To = new Date(nowDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const j2Res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses` +
        `?subscription_status=eq.expired` +
        `&trial_ends_at=gt.${j2From.toISOString()}` +
        `&trial_ends_at=lt.${j2To.toISOString()}` +
        `&post_expiry_j2_sent=not.is.true` +
        `&select=id,name,email,owner_user_id,trial_ends_at,plan`,
      { headers: supaHeaders() },
    );
    if (j2Res.ok) {
      const j2Businesses: ExpiredBusiness[] = await j2Res.json();
      for (const biz of j2Businesses) {
        if (!biz.email) continue;
        try {
          await sendBrevoEmail({
            to: [{ email: biz.email }],
            subject: `Votre chatbot est en pause — réactivez votre compte Ve'a`,
            htmlContent: buildPostExpiryJ2Email({ businessName: escapeHtml(biz.name) }),
            tags: ["post-expiry-j2"],
          });
          await fetch(`${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`, {
            method: "PATCH",
            headers: { ...supaHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({ post_expiry_j2_sent: true }),
          });
          logger.info(`Post-expiry J+2 sent to ${biz.email}`);
        } catch (err) {
          logger.error(`Post-expiry J+2 error for ${biz.email}`, { error: String(err) });
        }
      }
    }

    // ── Post-expiry J+7 ──
    const j7From = new Date(nowDate.getTime() - 8 * 24 * 60 * 60 * 1000);
    const j7To = new Date(nowDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    const j7Res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses` +
        `?subscription_status=eq.expired` +
        `&trial_ends_at=gt.${j7From.toISOString()}` +
        `&trial_ends_at=lt.${j7To.toISOString()}` +
        `&post_expiry_j7_sent=not.is.true` +
        `&select=id,name,email,owner_user_id,trial_ends_at,plan`,
      { headers: supaHeaders() },
    );
    if (j7Res.ok) {
      const j7Businesses: ExpiredBusiness[] = await j7Res.json();
      for (const biz of j7Businesses) {
        if (!biz.email) continue;
        try {
          await sendBrevoEmail({
            to: [{ email: biz.email }],
            subject: `Dernière chance — vos données seront supprimées dans 30 jours`,
            htmlContent: buildPostExpiryJ7Email({ businessName: escapeHtml(biz.name) }),
            tags: ["post-expiry-j7"],
          });
          await fetch(`${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`, {
            method: "PATCH",
            headers: { ...supaHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({ post_expiry_j7_sent: true }),
          });
          logger.info(`Post-expiry J+7 sent to ${biz.email}`);
        } catch (err) {
          logger.error(`Post-expiry J+7 error for ${biz.email}`, { error: String(err) });
        }
      }
    }

    // ── Weekly digest (Monday only — merged from weekly-digest schedule) ──
    if (nowDate.getUTCDay() === 1) {
      try {
        const digestResult = await runWeeklyDigest(nowDate);
        logger.info("Weekly digest (merged)", digestResult);
      } catch (err) {
        logger.error("Weekly digest failed", { error: err instanceof Error ? err.message : String(err) });
      }
    }

    return { processed, emailsSent };
  },
});

// ─── HTML Builder ────────────────────────────────────────────────────────────

function buildExpirationEmail(p: {
  businessName: string;
  trialEndDate: string;
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
            <p style="margin:0;font-size:14px;color:#aaa;">Votre essai est termin&eacute;</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour <strong>${p.businessName}</strong>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">
              Votre p&eacute;riode d&apos;essai gratuit s&apos;est termin&eacute;e le <strong style="color:#fff;">${p.trialEndDate}</strong>.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Pour continuer &agrave; recevoir des r&eacute;servations automatiques et utiliser votre chatbot IA, choisissez un abonnement adapt&eacute; &agrave; votre activit&eacute;.
            </p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">
                Choisir un abonnement
              </a>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5;">
              Vos donn&eacute;es et votre configuration sont conserv&eacute;es. Vous pouvez r&eacute;activer votre compte &agrave; tout moment.
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

function buildMidTrialEmail(p: { businessName: string; conversationCount: number }): string {
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
            <p style="margin:0;font-size:14px;color:#0d9488;">Mi-parcours de votre essai</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">Bonjour <strong>${p.businessName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">Vous &ecirc;tes &agrave; mi-parcours de votre essai gratuit Ve&apos;a.</p>
            ${p.conversationCount > 0 ? `
            <div style="background:#0d948815;border:1px solid #0d948830;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
              <p style="margin:0;font-size:24px;font-weight:700;color:#0d9488;text-align:center;">${p.conversationCount}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#aaa;text-align:center;">conversation${p.conversationCount > 1 ? 's' : ''} cette semaine</p>
            </div>` : `
            <p style="margin:0 0 20px;font-size:14px;color:#aaa;line-height:1.6;">Votre chatbot est pr&ecirc;t &agrave; recevoir vos premiers clients &mdash; il suffit de le connecter &agrave; votre page.</p>`}
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">Il vous reste encore 7 jours pour explorer toutes les fonctionnalit&eacute;s. Choisissez votre plan d&egrave;s maintenant pour continuer sans interruption.</p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">Choisir mon abonnement</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;"><a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildJ1ReminderEmail(p: { businessName: string; trialEndDate: string }): string {
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
            <p style="margin:0;font-size:14px;color:#ef4444;">Dernier jour d&apos;essai</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">Bonjour <strong>${p.businessName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">Votre essai gratuit se termine <strong style="color:#fff;">demain, le ${p.trialEndDate}</strong>.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">C&apos;est votre derni&egrave;re chance de choisir un abonnement avant que votre chatbot soit mis en pause. Vos donn&eacute;es et configuration resteront int&eacute;gralement conserv&eacute;es.</p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">Choisir mon abonnement maintenant</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;"><a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPostExpiryJ2Email(p: { businessName: string }): string {
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
            <p style="margin:0;font-size:14px;color:#f59e0b;">Votre chatbot est en pause</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">Bonjour <strong>${p.businessName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">Votre essai gratuit est termin&eacute; depuis 2 jours. Votre chatbot est actuellement en pause &mdash; vos clients ne peuvent plus r&eacute;server via Ve&apos;a.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">R&eacute;activez votre compte en quelques secondes. Toute votre configuration est intact&eacute;e.</p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">R&eacute;activer mon compte</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;"><a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPostExpiryJ7Email(p: { businessName: string }): string {
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
            <p style="margin:0;font-size:14px;color:#ef4444;">Derni&egrave;re chance</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">Bonjour <strong>${p.businessName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">Votre essai a expir&eacute; il y a 7 jours. <strong style="color:#fff;">Vos donn&eacute;es seront supprim&eacute;es dans 30 jours</strong> si vous ne r&eacute;activez pas votre compte.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">Services, horaires, configuration chatbot &mdash; tout peut encore &ecirc;tre r&eacute;cup&eacute;r&eacute;. C&apos;est votre derni&egrave;re chance avant suppression d&eacute;finitive.</p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">R&eacute;activer avant suppression</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;"><a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildReminderEmail(p: { businessName: string; trialEndDate: string }): string {
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
            <p style="margin:0;font-size:14px;color:#f59e0b;">Plus que 3 jours d&apos;essai</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">Bonjour <strong>${p.businessName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:14px;color:#aaa;line-height:1.6;">Votre p&eacute;riode d&apos;essai gratuit se termine le <strong style="color:#fff;">${p.trialEndDate}</strong>.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">Pour continuer &agrave; recevoir des r&eacute;servations automatiques, choisissez un abonnement d&egrave;s maintenant.</p>
            <div style="text-align:center;">
              <a href="https://vea.pacifikai.com/billing" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">Choisir mon abonnement</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;"><a href="mailto:vea@pacifikai.com" style="color:#555;text-decoration:none;">vea@pacifikai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
