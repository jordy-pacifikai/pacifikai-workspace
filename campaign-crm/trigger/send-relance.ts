/**
 * send-relance.ts — Envoie une relance (J+3, J+7, J+14) a un prospect
 * Brevo SMTP API + log dans campaign_email_events + update prospect
 */
import { task } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
type RelanceType = "j3" | "j7" | "j14";

interface Prospect {
  id: string;
  name: string;
  slug: string;
  email: string;
  city: string | null;
  sector: string;
  prototype_urls: string[];
  relance_count: number;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function buildSubject(type: RelanceType, name: string): string {
  switch (type) {
    case "j3":
      return `Suite \u00e0 mes propositions pour ${name}`;
    case "j7":
      return "85% des clients PF cherchent en ligne avant de se d\u00e9placer";
    case "j14":
      return "Derni\u00e8re fois que je vous \u00e9cris";
  }
}

const SIGNATURE = `
<p style="margin-top:24px;">Mauruuru,</p>
<p style="margin:0;"><strong>Jordy Toofa</strong></p>
<p style="margin:0;color:#666;">PACIFIK&rsquo;AI &mdash; Agence Digitale</p>
<p style="margin:0;color:#666;">jordy@pacifikai.com</p>
`;

function buildHtml(
  type: RelanceType,
  prospect: Prospect
): string {
  const { name, prototype_urls } = prospect;
  const link1 = prototype_urls?.[0] ?? "#";
  const link2 = prototype_urls?.[1] ?? "#";
  const link3 = prototype_urls?.[2] ?? "#";

  switch (type) {
    case "j3":
      return `
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
  <p>Bonjour,</p>
  <p>Je vous avais envoy&eacute; 3 propositions de site web pour <strong>${name}</strong> il y a quelques jours.</p>
  <p>Voici les liens au cas o&ugrave; vous n&rsquo;auriez pas eu le temps de les consulter&nbsp;:</p>
  <ul style="padding-left:20px;">
    <li><a href="${link1}" style="color:#0066cc;">Proposition 1</a></li>
    <li><a href="${link2}" style="color:#0066cc;">Proposition 2</a></li>
    <li><a href="${link3}" style="color:#0066cc;">Proposition 3</a></li>
  </ul>
  <p>N&rsquo;h&eacute;sitez pas &agrave; me dire si l&rsquo;une d&rsquo;elles vous parle, ou si vous souhaitez qu&rsquo;on en discute.</p>
  ${SIGNATURE}
</div>`;

    case "j7":
      return `
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
  <p>Bonjour,</p>
  <p><strong>85% des consommateurs recherchent en ligne</strong> avant de se d&eacute;placer dans un commerce.</p>
  <p>Pour <strong>${name}</strong>, un site web professionnel pourrait transformer ces recherches en clients r&eacute;els &mdash; &agrave; partir de <strong>100&nbsp;000 XPF</strong>.</p>
  <p>J&rsquo;avais pr&eacute;par&eacute; une maquette sur mesure pour vous&nbsp;:</p>
  <p style="margin:16px 0;">
    <a href="${link1}" style="display:inline-block;background:#0066cc;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
      Voir la maquette
    </a>
  </p>
  <p>Est-ce que vous auriez 5 minutes pour en discuter cette semaine&nbsp;?</p>
  ${SIGNATURE}
</div>`;

    case "j14":
      return `
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
  <p>Bonjour,</p>
  <p>Je ne vous relancerai plus &mdash; je sais que vous &ecirc;tes occup&eacute;(e).</p>
  <p>Si un jour vous avez besoin d&rsquo;un site web, d&rsquo;une refonte ou d&rsquo;outils digitaux pour <strong>${name}</strong>, ma porte reste ouverte.</p>
  <p>En attendant, voici le lien vers votre maquette si vous voulez y jeter un &oelig;il plus tard&nbsp;:</p>
  <p><a href="${link1}" style="color:#0066cc;">${link1}</a></p>
  <p>Bonne continuation&nbsp;!</p>
  ${SIGNATURE}
</div>`;
  }
}

// -------------------------------------------------------------------
// Task
// -------------------------------------------------------------------
export const sendRelance = task({
  id: "send-relance",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 30_000,
    randomize: true,
  },
  run: async (payload: { prospectId: string; type: RelanceType }) => {
    const { prospectId, type } = payload;
    const supabase = getSupabase();

    // 1. Fetch prospect
    const { data: prospect, error: fetchErr } = await supabase
      .from("campaign_prospects")
      .select("id, name, slug, email, city, sector, prototype_urls, relance_count")
      .eq("id", prospectId)
      .single();

    if (fetchErr || !prospect) {
      throw new Error(`Prospect ${prospectId} not found: ${fetchErr?.message}`);
    }

    if (!prospect.email) {
      console.log(`Prospect ${prospect.name} has no email — skipping`);
      return { skipped: true, reason: "no_email" };
    }

    // 2. Build email
    const subject = buildSubject(type, prospect.name);
    const htmlContent = buildHtml(type, prospect as Prospect);

    // 3. Send via Brevo
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Jordy Toofa \u2014 PACIFIK\u2019AI",
          email: "jordy@pacifikai.com",
        },
        to: [{ email: prospect.email, name: prospect.name }],
        subject,
        htmlContent,
        tags: [`relance-${type}`, `prospect-${prospect.slug}`],
      }),
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      throw new Error(`Brevo API error ${brevoRes.status}: ${errBody}`);
    }

    const brevoData = (await brevoRes.json()) as { messageId?: string };

    // 4. Log event
    await supabase.from("campaign_email_events").insert({
      prospect_id: prospectId,
      event_type: "sent",
      email_type: `relance_${type}`,
      subject,
      brevo_message_id: brevoData.messageId ?? null,
      metadata: { type, sent_by: "trigger-automation" },
    });

    // 5. Update prospect
    await supabase
      .from("campaign_prospects")
      .update({
        relance_count: (prospect.relance_count ?? 0) + 1,
        last_relance_at: new Date().toISOString(),
        last_relance_type: type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prospectId);

    console.log(
      `Relance ${type} sent to ${prospect.name} (${prospect.email})`
    );

    return {
      sent: true,
      type,
      prospectId,
      name: prospect.name,
      messageId: brevoData.messageId,
    };
  },
});
