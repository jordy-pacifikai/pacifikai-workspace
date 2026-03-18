import * as fs from 'fs';
import * as path from 'path';
import { Prospect } from './types';

const CLICKUP_TOKEN = '198019652_0102396d048c5f49c64e0203991a05480b400892c1abc83367edfaabc7dd1c77';
const CLICKUP_BASE = 'https://api.clickup.com/api/v2';
const SPACE_ID = '90166323991';

const DATA_DIR = path.join(__dirname, 'data');
const PROSPECTS_FILE = path.join(DATA_DIR, 'prospects-enriched.json');

// ─────────────────────────────────────────────
// ClickUp API helpers
// ─────────────────────────────────────────────

async function clickupFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${CLICKUP_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': CLICKUP_TOKEN,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp ${res.status} ${endpoint}: ${text}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────

export async function createList(name: string, spaceId: string = SPACE_ID): Promise<string> {
  // ClickUp API: lists are created inside folders, or as folderless lists in a space
  // Using folderless list endpoint
  const data = await clickupFetch(`/space/${spaceId}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  console.log(`  ✓ Liste créée : "${name}" (ID: ${data.id})`);
  return data.id;
}

export async function createTask(prospect: Prospect, listId: string): Promise<string> {
  const description = [
    `Secteur: ${prospect.sector} | Sous-secteur: ${prospect.subsector}`,
    `Email: ${prospect.email || 'N/A'}`,
    `Téléphone: ${prospect.phone || 'N/A'}`,
    `Site: ${prospect.website || 'Aucun'}`,
    `Facebook: ${prospect.facebook_url || 'N/A'}`,
    '',
    'Prototypes:',
    ...prospect.prototype_urls.map((url, i) => `- v${i + 1}: ${url}`),
    '',
    `ICP Score: ${prospect.icp_score}`,
    `Batch: ${prospect.batch}`,
    `Ville: ${prospect.city} (${prospect.island})`,
  ].join('\n');

  const tags = [prospect.sector];
  if (prospect.batch) tags.push(`batch-${prospect.batch}`);

  const data = await clickupFetch(`/list/${listId}/task`, {
    method: 'POST',
    body: JSON.stringify({
      name: `${prospect.name} — ${prospect.city}`,
      description,
      status: 'to do',
      tags,
      priority: prospect.icp_score > 60 ? 2 : 3,
    }),
  });

  return data.id;
}

export async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  await clickupFetch(`/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function syncProspects(prospects: Prospect[], listId: string): Promise<void> {
  const toSync = prospects.filter((p) => !p.clickup_task_id);

  if (toSync.length === 0) {
    console.log('  Tous les prospects ont déjà un task ID ClickUp.');
    return;
  }

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  SYNC CLICKUP — ${toSync.length} prospects à créer         ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  let created = 0;
  let failed = 0;

  for (let i = 0; i < toSync.length; i++) {
    const prospect = toSync[i];

    try {
      const taskId = await createTask(prospect, listId);
      prospect.clickup_task_id = taskId;
      created++;
      console.log(`  ✓ [${i + 1}/${toSync.length}] ${prospect.name} → ${taskId}`);
    } catch (err: any) {
      failed++;
      console.error(`  ✗ [${i + 1}/${toSync.length}] ${prospect.name} — ${err.message}`);
    }

    // Small delay to respect rate limits (100 req/min)
    if (i < toSync.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }

  // Save updated prospects with task IDs
  const allProspects = loadProspects();
  const updated = allProspects.map((p) => {
    const synced = toSync.find((s) => s.id === p.id);
    if (synced && synced.clickup_task_id) {
      return { ...p, clickup_task_id: synced.clickup_task_id };
    }
    return p;
  });

  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(updated, null, 2));

  console.log(`\n  ── Résultat : ${created} créés, ${failed} échoués ──`);
  console.log(`  Prospects mis à jour dans ${PROSPECTS_FILE}\n`);
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

// ─────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--create-list')) {
    const listName = 'Site Web 100K — Prospection';
    const listId = await createList(listName);
    console.log(`\n  List ID: ${listId}`);
    console.log(`  Utilise: npx tsx sync-clickup.ts --sync --list-id ${listId}\n`);
    return;
  }

  if (args.includes('--sync')) {
    const listIdx = args.indexOf('--list-id');
    if (listIdx === -1 || !args[listIdx + 1]) {
      console.error('Usage: npx tsx sync-clickup.ts --sync --list-id XXX');
      process.exit(1);
    }
    const listId = args[listIdx + 1];
    const prospects = loadProspects();
    await syncProspects(prospects, listId);
    return;
  }

  if (args.includes('--update')) {
    const taskIdx = args.indexOf('--task-id');
    const statusIdx = args.indexOf('--status');

    if (taskIdx === -1 || !args[taskIdx + 1] || statusIdx === -1 || !args[statusIdx + 1]) {
      console.error('Usage: npx tsx sync-clickup.ts --update --task-id XXX --status "email sent"');
      process.exit(1);
    }

    const taskId = args[taskIdx + 1];
    const status = args[statusIdx + 1];

    try {
      await updateTaskStatus(taskId, status);
      console.log(`  ✓ Task ${taskId} → status "${status}"`);
    } catch (err: any) {
      console.error(`  ✗ ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // Default: show help
  console.log(`
╔══════════════════════════════════════════════╗
║  SYNC CLICKUP — Prospection Pipeline        ║
╚══════════════════════════════════════════════╝

Usage:
  npx tsx sync-clickup.ts --create-list
    Crée la liste "Site Web 100K — Prospection" dans ClickUp.
    Retourne le List ID.

  npx tsx sync-clickup.ts --sync --list-id XXX
    Synchronise tous les prospects sans task ID.
    Crée une tâche ClickUp pour chacun.

  npx tsx sync-clickup.ts --update --task-id XXX --status "email sent"
    Met à jour le statut d'une tâche existante.
  `);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
