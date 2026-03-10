import { schedules, logger } from "@trigger.dev/sdk";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;

function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

interface Prospect {
  id: string;
  email: string;
  business_name: string;
  contact_name: string;
  sector: string;
  created_at: string;
  drip_email_0_sent_at: string | null;
  drip_email_3_sent_at: string | null;
  drip_email_7_sent_at: string | null;
  drip_unsubscribed: boolean;
}

const SENDER = { email: "newsletter@pacifikai.com", name: "Ve'a by PACIFIK'AI" };

/**
 * Drip campaign for Ve'a prospects.
 * Sends 3 emails over 7 days to prospects in bookbot_prospects table.
 *
 * Day 0: Introduction + value proposition
 * Day 3: Social proof + case studies
 * Day 7: Urgency + special offer
 *
 * Runs every hour. Idempotent: checks sent_at columns before sending.
 */
export const dripCampaign = schedules.task({
  id: "vea-drip-campaign",
  cron: "0 */1 * * *", // every hour
  run: async () => {
    if (!BREVO_API_KEY) {
      logger.warn("BREVO_API_KEY not set, skipping drip campaign");
      return { sent: 0, reason: "no_api_key" };
    }

    // Get all prospects not yet fully dripped and not unsubscribed
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_prospects?drip_unsubscribed=eq.false&or=(drip_email_0_sent_at.is.null,drip_email_3_sent_at.is.null,drip_email_7_sent_at.is.null)&select=*`,
      { headers: supaHeaders() }
    );
    const prospects: Prospect[] = await res.json();

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return { sent: 0, prospects: 0 };
    }

    const now = new Date();
    let totalSent = 0;

    for (const prospect of prospects) {
      const createdAt = new Date(prospect.created_at);
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      // Day 0: send immediately (within first hour)
      if (!prospect.drip_email_0_sent_at && daysSinceCreation >= 0) {
        const sent = await sendDripEmail(prospect, 0);
        if (sent) {
          await markDripSent(prospect.id, 0);
          totalSent++;
        }
      }

      // Day 3: send after 3 days
      if (!prospect.drip_email_3_sent_at && prospect.drip_email_0_sent_at && daysSinceCreation >= 3) {
        const sent = await sendDripEmail(prospect, 3);
        if (sent) {
          await markDripSent(prospect.id, 3);
          totalSent++;
        }
      }

      // Day 7: send after 7 days
      if (!prospect.drip_email_7_sent_at && prospect.drip_email_3_sent_at && daysSinceCreation >= 7) {
        const sent = await sendDripEmail(prospect, 7);
        if (sent) {
          await markDripSent(prospect.id, 7);
          totalSent++;
        }
      }
    }

    logger.info(`Drip campaign: ${totalSent} emails sent to ${prospects.length} prospects`);
    return { sent: totalSent, prospects: prospects.length };
  },
});

async function sendDripEmail(prospect: Prospect, day: 0 | 3 | 7): Promise<boolean> {
  const { subject, html } = getDripContent(prospect, day);

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: prospect.email, name: prospect.contact_name || prospect.business_name }],
        subject,
        htmlContent: html,
        tags: [`drip-day-${day}`, `sector-${prospect.sector}`],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error(`Brevo error for ${prospect.email} (day ${day}): ${res.status} ${text}`);
      return false;
    }

    const data = await res.json();
    logger.info(`Drip day-${day} sent to ${prospect.email}, messageId: ${data.messageId}`);
    return true;
  } catch (err) {
    logger.error(`Failed to send drip day-${day} to ${prospect.email}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

async function markDripSent(prospectId: string, day: 0 | 3 | 7): Promise<void> {
  const column = `drip_email_${day}_sent_at`;
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_prospects?id=eq.${prospectId}`,
    {
      method: "PATCH",
      headers: supaHeaders(),
      body: JSON.stringify({ [column]: new Date().toISOString() }),
    }
  );
}

function getDripContent(prospect: Prospect, day: 0 | 3 | 7): { subject: string; html: string } {
  const name = prospect.contact_name || "Bonjour";
  const biz = prospect.business_name;

  const sectorBenefit: Record<string, string> = {
    salon: "reductions de 40% des no-shows et augmentation de 70 000 F/mois de chiffre d'affaires",
    restaurant: "gestion automatique des reservations et +91 000 F/mois en moyenne",
    medical: "liberation de 15h/semaine pour votre equipe administrative et +136 000 F/mois",
  };
  const benefit = sectorBenefit[prospect.sector] ?? "automatisation complete de vos reservations";

  if (day === 0) {
    return {
      subject: `${name}, Ve'a peut transformer la gestion de ${biz}`,
      html: wrapEmail(`
        <h2 style="color:#1a1a1a;margin-bottom:16px">Bonjour ${name},</h2>
        <p>Je me permets de vous contacter car <strong>${biz}</strong> pourrait beneficier enormement d'un assistant IA de reservation.</p>
        <p><strong>Ve'a</strong> est un chatbot intelligent qui repond a vos clients 24h/24 sur WhatsApp, Messenger et Instagram pour prendre leurs rendez-vous automatiquement.</p>
        <h3 style="color:#25D366">Ce que ca change pour vous :</h3>
        <ul>
          <li>Plus besoin de repondre au telephone pour les reservations</li>
          <li>Vos clients reservent en 30 secondes, meme a 2h du matin</li>
          <li>Rappels automatiques = moins de no-shows</li>
          <li>Synchronisation avec Google Calendar</li>
        </ul>
        <p>Des entreprises similaires voient des ${benefit}.</p>
        <p style="margin-top:24px">
          <a href="https://vea.pacifikai.com" style="background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Decouvrir Ve'a</a>
        </p>
        <p style="margin-top:24px;color:#666">A bientot,<br><strong>Jordy Toofa</strong><br>PACIFIK'AI - Automatisation IA</p>
      `),
    };
  }

  if (day === 3) {
    return {
      subject: `Comment Aimy a augmente ses reservations de 30% (et ce que ca signifie pour ${biz})`,
      html: wrapEmail(`
        <h2 style="color:#1a1a1a;margin-bottom:16px">${name}, voici ce que vivent les entreprises qui ont automatise leurs reservations :</h2>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #25D366">
          <p style="margin:0"><strong>Aimy (Amsterdam)</strong> : +30% de reservations en 3 mois</p>
        </div>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #25D366">
          <p style="margin:0"><strong>Bella Spa (Etats-Unis)</strong> : +52% de reservations en ligne, -35% de no-shows</p>
        </div>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #25D366">
          <p style="margin:0"><strong>Simbo AI (Californie)</strong> : 3000% de retour sur investissement</p>
        </div>
        <p>Ces resultats ne sont pas reserves aux grandes entreprises. Ve'a est concu pour les commerces polynesiens, avec des prix adaptes a notre marche.</p>
        <p><strong>A partir de 9 900 F/mois</strong>, vous avez un assistant disponible 24h/24 qui parle francais et tahitien.</p>
        <p style="margin-top:24px">
          <a href="https://vea.pacifikai.com/#pricing" style="background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Voir les tarifs</a>
        </p>
        <p style="margin-top:24px;color:#666">Jordy Toofa<br>PACIFIK'AI</p>
      `),
    };
  }

  // Day 7
  return {
    subject: `Derniere chance : offre de lancement Ve'a pour ${biz}`,
    html: wrapEmail(`
      <h2 style="color:#1a1a1a;margin-bottom:16px">${name},</h2>
      <p>Je vous ai presente Ve'a il y a une semaine. Depuis, 3 entreprises en Polynesie ont deja active leur assistant.</p>
      <p>Je voulais vous proposer une <strong>offre speciale de lancement</strong> :</p>
      <div style="background:#25D366;color:white;padding:24px;border-radius:12px;margin:20px 0;text-align:center">
        <p style="font-size:20px;font-weight:bold;margin:0">Frais d'activation OFFERTS</p>
        <p style="margin:8px 0 0;opacity:0.9">Economisez 25 000 F sur votre mise en place</p>
      </div>
      <p>Cette offre est valable cette semaine uniquement. Apres ca, les frais d'activation standard s'appliqueront.</p>
      <h3 style="color:#1a1a1a">Pour commencer :</h3>
      <ol>
        <li>Repondez a cet email ou appelez-moi au <strong>89 55 81 89</strong></li>
        <li>On configure votre Ve'a ensemble en 30 minutes</li>
        <li>Vos clients peuvent reserver des le lendemain</li>
      </ol>
      <p style="margin-top:24px">
        <a href="https://vea.pacifikai.com/#contact" style="background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Activer mon Ve'a</a>
      </p>
      <p style="margin-top:24px;color:#666">Jordy Toofa<br>+689 89 55 81 89<br>jordy@pacifikai.com</p>
    `),
  };
}

function wrapEmail(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
      ${body}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#999">
      <p>PACIFIK'AI - Paea, Tahiti, Polynesie francaise</p>
      <p><a href="https://vea.pacifikai.com/unsubscribe?email={{email}}" style="color:#999">Se desinscrire</a></p>
    </div>
  </div>
</body>
</html>`;
}
