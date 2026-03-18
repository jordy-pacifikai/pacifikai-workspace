import * as fs from 'fs';
import * as path from 'path';
import { Prospect } from './types';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER = { name: "Jordy Toofa — PACIFIK'AI", email: 'jordy@pacifikai.com' };
const DELAY_MS = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const PROSPECTS_FILE = path.join(DATA_DIR, 'prospects-enriched.json');

interface EmailPayload {
  prospect: Prospect;
  subject: string;
  htmlContent: string;
  tag: string;
}

// ─────────────────────────────────────────────
// Email HTML Generators
// ─────────────────────────────────────────────

export function generateEmailHTML(prospect: Prospect): string {
  const [v1, v2, v3] = prospect.prototype_urls;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#333;max-width:600px;margin:0 auto;padding:20px;">

<p>Bonjour,</p>

<p>Je suis Jordy Toofa, fondateur de <strong>PACIFIK'AI</strong>, agence digitale &agrave; Tahiti.</p>

<p>Dans le cadre de notre <strong>offre limit&eacute;e &agrave; 100 000 XPF</strong> (50 places), j'ai cr&eacute;&eacute; <strong>3 prototypes de site internet</strong> pour <strong>${prospect.name}</strong>. Jetez un oeil :</p>

<p>
&rarr; <a href="${v1}" style="color:#0D9488;text-decoration:none;font-weight:600;">Prototype 1 &mdash; Style sombre</a><br>
&rarr; <a href="${v2}" style="color:#0D9488;text-decoration:none;font-weight:600;">Prototype 2 &mdash; Style gold</a><br>
&rarr; <a href="${v3}" style="color:#0D9488;text-decoration:none;font-weight:600;">Prototype 3 &mdash; Style clair</a>
</p>

<p>Ce sont de vrais sites, navigables sur mobile et desktop.</p>

<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">

<p><strong>Bon &agrave; savoir</strong> &mdash; ce sont des <strong>prototypes de d&eacute;monstration</strong>, pas le produit final. Ils sont l&agrave; pour vous montrer le niveau de qualit&eacute; qu'on peut atteindre pour votre entreprise.</p>

<p>Si vous d&eacute;cidez de travailler avec nous, voici ce qu'il faut savoir :</p>

<p>
&bull; On peut <strong>partir d'un de ces prototypes</strong> et l'adapter &agrave; votre image<br>
&bull; Ou <strong>repartir compl&egrave;tement de z&eacute;ro</strong> selon vos id&eacute;es &mdash; c'est vous qui choisissez<br>
&bull; Vos textes, vos photos, vos couleurs &mdash; <strong>vous validez chaque &eacute;tape</strong><br>
&bull; <strong>Modifications illimit&eacute;es</strong> jusqu'&agrave; ce que le r&eacute;sultat vous convienne
</p>

<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">

<p style="font-size:16px;font-weight:700;color:#111;">L'offre : 100 000 XPF tout compris</p>

<p>
&check; Site sur mesure adapt&eacute; &agrave; <strong>${prospect.name}</strong><br>
&check; Responsive mobile + tablette<br>
&check; R&eacute;f&eacute;rencement Google (SEO)<br>
&check; Nom de domaine + h&eacute;bergement 1 an inclus<br>
&check; Livr&eacute; en 7 jours
</p>

<p style="font-size:13px;color:#666;">Paiement : acompte de 50 000 XPF au d&eacute;marrage, solde de 50 000 XPF &agrave; la livraison.</p>

<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">

<p>Int&eacute;ress&eacute; ? <strong>R&eacute;pondez directement &agrave; cet email</strong> et je vous envoie un devis personnalis&eacute; sous 24h, sans engagement.</p>

<p>Mauruuru,</p>

<p style="margin-top:24px;line-height:1.5;">
<strong>Jordy Toofa</strong><br>
<span style="color:#0D9488;font-weight:600;">PACIFIK'AI</span> &mdash; Agence Digitale<br>
<span style="color:#666;">+689 89 55 81 89</span><br>
<a href="mailto:jordy@pacifikai.com" style="color:#0D9488;text-decoration:none;">jordy@pacifikai.com</a>
</p>

</div>
</body>
</html>`;
}

export function generateRelanceJ3(prospect: Prospect): string {
  const [v1, v2, v3] = prospect.prototype_urls;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#333;max-width:600px;margin:0 auto;padding:20px;">

<p>Bonjour,</p>

<p>Je vous avais envoy&eacute; 3 propositions de site internet pour <strong>${prospect.name}</strong> il y a quelques jours.</p>

<p>Les voici &agrave; nouveau :</p>
<p>
&rarr; <a href="${v1}" style="color:#0D9488;text-decoration:none;font-weight:600;">Proposition 1</a><br>
&rarr; <a href="${v2}" style="color:#0D9488;text-decoration:none;font-weight:600;">Proposition 2</a><br>
&rarr; <a href="${v3}" style="color:#0D9488;text-decoration:none;font-weight:600;">Proposition 3</a>
</p>

<p>Avez-vous eu le temps d'y jeter un &oelig;il ?</p>

<p>Si vous avez des questions ou souhaitez des ajustements, je suis disponible.</p>

<p>Cordialement,<br>
<strong>Jordy Toofa</strong> &mdash; <span style="color:#0D9488;">PACIFIK'AI</span></p>

</div>
</body>
</html>`;
}

export function generateRelanceJ7(prospect: Prospect): string {
  const [v1] = prospect.prototype_urls;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#333;max-width:600px;margin:0 auto;padding:20px;">

<p>Bonjour,</p>

<p>Le saviez-vous ? <strong>85% des consommateurs</strong> recherchent une entreprise en ligne avant de la visiter.</p>

<p>Sans site internet, <strong>${prospect.name}</strong> perd des clients potentiels chaque jour.</p>

<p>Vos 3 propositions sont toujours disponibles :<br>
&rarr; <a href="${v1}" style="color:#0D9488;text-decoration:none;font-weight:600;">Voir les propositions</a></p>

<p><strong>100 000 XPF tout compris</strong>, livr&eacute; en 7 jours.</p>

<p>Cordialement,<br>
<strong>Jordy Toofa</strong> &mdash; <span style="color:#0D9488;">PACIFIK'AI</span></p>

</div>
</body>
</html>`;
}

export function generateBreakupJ14(prospect: Prospect): string {
  const [v1] = prospect.prototype_urls;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#333;max-width:600px;margin:0 auto;padding:20px;">

<p>Bonjour,</p>

<p>Je ne vous relancerai plus &mdash; je comprends que le timing n'est peut-&ecirc;tre pas le bon.</p>

<p>Vos 3 sites restent en ligne si vous changez d'avis :<br>
&rarr; <a href="${v1}" style="color:#0D9488;text-decoration:none;font-weight:600;">Voir les propositions</a></p>

<p>Bonne continuation avec <strong>${prospect.name}</strong> !</p>

<p><strong>Jordy Toofa</strong> &mdash; <span style="color:#0D9488;">PACIFIK'AI</span></p>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Brevo Send
// ─────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { prospect, subject, htmlContent, tag } = payload;

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: prospect.email!, name: prospect.name }],
      replyTo: { email: 'jordy@pacifikai.com' },
      subject,
      htmlContent,
      tags: [tag],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo ${res.status}: ${text}`);
  }

  return true;
}

// ─────────────────────────────────────────────
// Batch Operations
// ─────────────────────────────────────────────

export async function sendBatch(
  prospects: Prospect[],
  batchNumber: number,
  type: 'initial' | 'j3' | 'j7' | 'j14' = 'initial'
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const tagMap = {
    initial: `batch-${batchNumber}-initial`,
    j3: `batch-${batchNumber}-relance-j3`,
    j7: `batch-${batchNumber}-relance-j7`,
    j14: `batch-${batchNumber}-breakup-j14`,
  };

  const subjectMap = {
    initial: (p: Prospect) => `3 sites créés pour ${p.name}`,
    j3: (p: Prospect) => `Suite à mes propositions pour ${p.name}`,
    j7: (_p: Prospect) => `85% des clients PF cherchent en ligne avant de se déplacer`,
    j14: (_p: Prospect) => `Dernière fois que je vous écris`,
  };

  const htmlMap = {
    initial: generateEmailHTML,
    j3: generateRelanceJ3,
    j7: generateRelanceJ7,
    j14: generateBreakupJ14,
  };

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  ENVOI BATCH ${String(batchNumber).padStart(2, '0')} — ${type.toUpperCase().padEnd(10)} — ${prospects.length} emails  ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];

    try {
      await sendEmail({
        prospect,
        subject: subjectMap[type](prospect),
        htmlContent: htmlMap[type](prospect),
        tag: tagMap[type],
      });

      sent++;
      console.log(`  ✓ [${i + 1}/${prospects.length}] ${prospect.name} (${prospect.email})`);
    } catch (err: any) {
      failed++;
      console.error(`  ✗ [${i + 1}/${prospects.length}] ${prospect.name} — ${err.message}`);
    }

    // Delay between emails (skip after last)
    if (i < prospects.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`\n  ── Résultat : ${sent} envoyés, ${failed} échoués ──\n`);
  return { sent, failed };
}

export function previewBatch(
  prospects: Prospect[],
  batchNumber: number,
  type: 'initial' | 'j3' | 'j7' | 'j14' = 'initial'
): void {
  const subjectMap = {
    initial: (p: Prospect) => `3 sites créés pour ${p.name}`,
    j3: (p: Prospect) => `Suite à mes propositions pour ${p.name}`,
    j7: (_p: Prospect) => `85% des clients PF cherchent en ligne avant de se déplacer`,
    j14: (_p: Prospect) => `Dernière fois que je vous écris`,
  };

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  PREVIEW BATCH ${String(batchNumber).padStart(2, '0')} — ${type.toUpperCase().padEnd(10)} — ${prospects.length} emails    ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    console.log(`  ${String(i + 1).padStart(2)}. ${p.name}`);
    console.log(`      To:      ${p.email}`);
    console.log(`      Subject: ${subjectMap[type](p)}`);
    console.log(`      Sector:  ${p.sector} / ${p.subsector}`);
    console.log(`      ICP:     ${p.icp_score}`);
    console.log(`      URLs:    ${p.prototype_urls.length} prototypes`);
    if (p.prototype_urls.length > 0) {
      p.prototype_urls.forEach((url, j) => {
        console.log(`               v${j + 1}: ${url}`);
      });
    }
    console.log('');
  }

  console.log(`  ── ${prospects.length} emails prêts. Utilise --send pour envoyer. ──\n`);
}

// ─────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────

function loadProspects(): Prospect[] {
  if (!fs.existsSync(PROSPECTS_FILE)) {
    console.error(`✗ Fichier introuvable : ${PROSPECTS_FILE}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf-8'));
}

function filterByBatch(prospects: Prospect[], batchNumber: number): Prospect[] {
  return prospects.filter(
    (p) => p.batch === batchNumber && p.email !== null
  );
}

// ─────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');
  const isSend = args.includes('--send');
  const isRelance = args.includes('--relance');

  const batchIdx = args.indexOf('--batch');
  if (batchIdx === -1 || !args[batchIdx + 1]) {
    console.error('Usage:');
    console.error('  npx tsx send-emails.ts --preview --batch 1');
    console.error('  npx tsx send-emails.ts --send --batch 1');
    console.error('  npx tsx send-emails.ts --relance --type j3 --batch 1');
    process.exit(1);
  }
  const batchNumber = parseInt(args[batchIdx + 1], 10);

  let type: 'initial' | 'j3' | 'j7' | 'j14' = 'initial';
  if (isRelance) {
    const typeIdx = args.indexOf('--type');
    const typeVal = typeIdx !== -1 ? args[typeIdx + 1] : null;
    if (typeVal === 'j3' || typeVal === 'j7' || typeVal === 'j14') {
      type = typeVal;
    } else {
      console.error('--relance requires --type j3|j7|j14');
      process.exit(1);
    }
  }

  const allProspects = loadProspects();
  const batchProspects = filterByBatch(allProspects, batchNumber);

  if (batchProspects.length === 0) {
    console.log(`Aucun prospect trouvé pour le batch ${batchNumber}.`);
    process.exit(0);
  }

  if (isPreview || (!isSend && !isRelance)) {
    previewBatch(batchProspects, batchNumber, type);
    return;
  }

  if (isSend || isRelance) {
    if (!BREVO_API_KEY) {
      console.error('✗ BREVO_API_KEY manquante. Set env var avant envoi.');
      process.exit(1);
    }

    const result = await sendBatch(batchProspects, batchNumber, type);

    // Update statuses in source file
    const updatedProspects = allProspects.map((p) => {
      const match = batchProspects.find((bp) => bp.id === p.id);
      if (match && result.sent > 0) {
        return {
          ...p,
          status: type === 'initial' ? 'sent' : p.status,
          email_sent_at: type === 'initial' ? new Date().toISOString() : p.email_sent_at,
        };
      }
      return p;
    });

    fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(updatedProspects, null, 2));
    console.log(`  Prospects mis à jour dans ${PROSPECTS_FILE}`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
