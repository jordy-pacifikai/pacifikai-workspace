import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Prospect } from './types';
import { previewBatch, sendBatch } from './send-emails';
import { syncProspects } from './sync-clickup';

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, 'output');
const PROSPECTS_FILE = path.join(DATA_DIR, 'prospects-enriched.json');
const BATCH_SIZE = 10;

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

function saveProspects(prospects: Prospect[]): void {
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));
}

function askConfirmation(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'envoie');
    });
  });
}

// ─────────────────────────────────────────────
// Site Generation (stub — delegates to generate-sites.ts)
// ─────────────────────────────────────────────

async function generateSitesForProspect(prospect: Prospect): Promise<string[]> {
  // Dynamic import to handle the case where generate-sites doesn't exist yet
  try {
    const { generateSitesForProspect: gen } = await import('./generate-sites');
    return gen(prospect);
  } catch {
    // Fallback: create placeholder output directories
    const slugDir = path.join(OUTPUT_DIR, prospect.slug);
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }

    const urls: string[] = [];
    for (const variant of ['v1', 'v2', 'v3']) {
      const filePath = path.join(slugDir, `${variant}.html`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `<!-- Placeholder: ${prospect.name} ${variant} -->\n<html><body><h1>${prospect.name}</h1></body></html>`);
      }
      urls.push(`https://pacifikai.com/demo/${prospect.slug}/${variant}`);
    }

    return urls;
  }
}

// ─────────────────────────────────────────────
// Run Batch
// ─────────────────────────────────────────────

async function runBatch(batchNumber: number, options: { send?: boolean; clickupListId?: string } = {}): Promise<void> {
  const allProspects = loadProspects();

  // Filter eligible prospects: enriched, has email, not yet batched
  const eligible = allProspects
    .filter((p) => p.status === 'enriched' && p.email !== null)
    .sort((a, b) => b.icp_score - a.icp_score);

  const offset = (batchNumber - 1) * BATCH_SIZE;
  const batchProspects = eligible.slice(offset, offset + BATCH_SIZE);

  if (batchProspects.length === 0) {
    console.log(`\n  Aucun prospect éligible pour le batch ${batchNumber}.`);
    console.log(`  Total éligibles : ${eligible.length} | Offset : ${offset}\n`);
    return;
  }

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  BATCH ${String(batchNumber).padStart(2, '0')} — GÉNÉRATION DE SITES                      ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  let sitesGenerated = 0;

  for (let i = 0; i < batchProspects.length; i++) {
    const prospect = batchProspects[i];

    // Assign batch number
    prospect.batch = batchNumber;

    // Generate 3 site variants
    try {
      const urls = await generateSitesForProspect(prospect);
      prospect.prototype_urls = urls;
      prospect.status = 'sites_ready';
      sitesGenerated += 3;
      console.log(`  ✓ [${i + 1}/${batchProspects.length}] ${prospect.name} (${prospect.sector}) — 3 variantes`);
    } catch (err: any) {
      console.error(`  ✗ [${i + 1}/${batchProspects.length}] ${prospect.name} — ${err.message}`);
    }
  }

  // Update source data
  const updatedAll = allProspects.map((p) => {
    const updated = batchProspects.find((bp) => bp.id === p.id);
    return updated || p;
  });
  saveProspects(updatedAll);

  // Summary
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  BATCH ${String(batchNumber).padStart(2, '0')} — RÉSUMÉ                                   ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  for (let i = 0; i < batchProspects.length; i++) {
    const p = batchProspects[i];
    console.log(`  ${String(i + 1).padStart(2)}. ${p.name} (${p.sector}) — ${p.email} — ICP: ${p.icp_score}`);
  }

  console.log(`\n  Sites générés : ${sitesGenerated} fichiers HTML`);
  console.log(`  Prêt pour déploiement Vercel puis envoi email.\n`);

  // Send mode
  if (options.send) {
    const readyProspects = batchProspects.filter((p) => p.status === 'sites_ready' && p.email);

    if (readyProspects.length === 0) {
      console.log('  Aucun prospect prêt pour envoi.');
      return;
    }

    // Preview
    previewBatch(readyProspects, batchNumber);

    // Ask for confirmation
    const confirmed = await askConfirmation('\n  Tape "envoie" pour confirmer l\'envoi : ');

    if (!confirmed) {
      console.log('\n  Envoi annulé.\n');
      return;
    }

    // Send emails
    const result = await sendBatch(readyProspects, batchNumber);

    // Update statuses
    if (result.sent > 0) {
      const finalProspects = loadProspects().map((p) => {
        const sent = readyProspects.find((rp) => rp.id === p.id);
        if (sent) {
          return {
            ...p,
            status: 'sent' as const,
            email_sent_at: new Date().toISOString(),
          };
        }
        return p;
      });
      saveProspects(finalProspects);

      // Sync ClickUp if list ID provided
      if (options.clickupListId) {
        console.log('\n  Synchronisation ClickUp...');
        const sentProspects = finalProspects.filter((p) => p.batch === batchNumber);
        await syncProspects(sentProspects, options.clickupListId);
      }
    }
  }
}

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────

function showStats(): void {
  const prospects = loadProspects();

  const enriched = prospects.filter((p) => p.status !== 'new');
  const withEmail = enriched.filter((p) => p.email !== null);
  const withFacebook = enriched.filter((p) => p.facebook_url !== null);
  const sitesReady = prospects.filter((p) => ['sites_ready', 'sent', 'opened', 'replied', 'converted'].includes(p.status));
  const sent = prospects.filter((p) => ['sent', 'opened', 'replied', 'converted'].includes(p.status));
  const opened = prospects.filter((p) => ['opened', 'replied', 'converted'].includes(p.status));
  const replied = prospects.filter((p) => ['replied', 'converted'].includes(p.status));
  const converted = prospects.filter((p) => p.status === 'converted');

  const batchesUsed = new Set(prospects.filter((p) => p.batch !== null).map((p) => p.batch));
  const maxBatch = batchesUsed.size;
  const totalBatches = Math.ceil(withEmail.length / BATCH_SIZE);

  // Find next batch sector
  const nextEligible = prospects
    .filter((p) => p.status === 'enriched' && p.email !== null)
    .sort((a, b) => b.icp_score - a.icp_score);
  const nextOffset = maxBatch * BATCH_SIZE;
  const nextBatchProspects = nextEligible.slice(nextOffset, nextOffset + BATCH_SIZE);
  const nextSectors = [...new Set(nextBatchProspects.map((p) => p.sector))];
  const nextCities = [...new Set(nextBatchProspects.map((p) => p.city))];

  const pctOpen = sent.length > 0 ? Math.round((opened.length / sent.length) * 100) : 0;
  const pctReply = sent.length > 0 ? Math.round((replied.length / sent.length) * 100) : 0;
  const pctConvert = sent.length > 0 ? Math.round((converted.length / sent.length) * 100) : 0;

  console.log(`
╔══════════════════════════════════════════════════════╗
║  CAMPAGNE SITE WEB 100K — STATS                     ║
╚══════════════════════════════════════════════════════╝

  Total prospects enrichis : ${enriched.length.toLocaleString('fr-FR')}
    Avec email             : ${withEmail.length.toLocaleString('fr-FR')}
    Avec Facebook          : ${withFacebook.length.toLocaleString('fr-FR')}

  Batches traités : ${maxBatch}/${totalBatches}
    Sites générés  : ${sitesReady.length * 3}
    Emails envoyés : ${sent.length}
    Ouvertures     : ${opened.length} (${pctOpen}%)
    Réponses       : ${replied.length} (${pctReply}%)
    Conversions    : ${converted.length} (${pctConvert}%)
`);

  if (nextBatchProspects.length > 0) {
    console.log(`  Prochain batch : #${maxBatch + 1} (${nextBatchProspects.length} prospects — ${nextSectors.join(', ')} — ${nextCities.join(', ')})`);
  } else {
    console.log(`  Tous les prospects éligibles ont été traités.`);
  }

  console.log('');
}

// ─────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--stats')) {
    showStats();
    return;
  }

  const batchIdx = args.indexOf('--batch');
  if (batchIdx === -1 || !args[batchIdx + 1]) {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  RUN BATCH — Orchestrateur Prospection               ║
╚══════════════════════════════════════════════════════╝

Usage:
  npx tsx run-batch.ts --batch 1
    Génère 3 sites pour les 10 prochains prospects.

  npx tsx run-batch.ts --batch 1 --send
    Génère + envoie emails (après confirmation "envoie").

  npx tsx run-batch.ts --batch 1 --send --clickup-list XXX
    Génère + envoie + sync ClickUp.

  npx tsx run-batch.ts --stats
    Affiche les statistiques de la campagne.
    `);
    return;
  }

  const batchNumber = parseInt(args[batchIdx + 1], 10);
  const shouldSend = args.includes('--send');

  let clickupListId: string | undefined;
  const clickupIdx = args.indexOf('--clickup-list');
  if (clickupIdx !== -1 && args[clickupIdx + 1]) {
    clickupListId = args[clickupIdx + 1];
  }

  await runBatch(batchNumber, { send: shouldSend, clickupListId });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
