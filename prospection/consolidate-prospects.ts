/**
 * consolidate-prospects.ts — Merge all enrichment sources, deduplicate, push to Supabase
 *
 * Usage:
 *   npx tsx consolidate-prospects.ts --merge        # Merge all data sources
 *   npx tsx consolidate-prospects.ts --stats         # Show stats
 *   npx tsx consolidate-prospects.ts --push          # Push to Supabase
 *   npx tsx consolidate-prospects.ts --merge --push  # Full pipeline
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Prospect, Sector, slugify, computeICPScore } from './types';

// ── Config ──────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
const MERGED_PATH = path.resolve(__dirname, '../../Tapiri/scraper/data/merged-businesses.json');
const OUTPUT_PATH = path.join(DATA_DIR, 'prospects-consolidated.json');

const SUPABASE_URL = 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIzNjc0NiwiZXhwIjoyMDg0ODEyNzQ2fQ.SERVICE_KEY_PLACEHOLDER';

// ── Types ───────────────────────────────────────────────────────────────────────

interface ScrapedEntry {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  category?: string | null;
  subcategory?: string | null;
  sector?: string | null;
  subsector?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  source?: string;
  source_url?: string | null;
}

interface MergedBusiness {
  name: string;
  sector: string;
  subsector: string;
  city: string;
  island: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  source: string;
  source_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // Levenshtein for short strings
  if (na.length < 5 || nb.length < 5) return false;
  const distance = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return distance / maxLen < 0.2; // 80% similarity
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function mapCategoryToSector(category: string): Sector {
  const cat = (category || '').toLowerCase();
  if (/beaut|coiff|esth|spa|ongl|tatou|barb|maquill|epil|cil/.test(cat)) return 'beauty';
  if (/restaurant|roulotte|snack|traiteur|boulan|pizza|food|café|poisson|glacier|patiss/.test(cat)) return 'food';
  if (/auto|garage|mecani|carross|pneu|lavage|location.*voiture|piece/.test(cat)) return 'auto';
  if (/sant|medec|dentist|pharma|kine|optic|infirm/.test(cat)) return 'health';
  if (/sport|fitness|gym|surf|plonge|yoga|danse/.test(cat)) return 'sport';
  if (/avoca|notair|juridiq|droit|huiss/.test(cat)) return 'legal';
  if (/ecole|forma|enseignem|creche|garde/.test(cat)) return 'education';
  return 'other';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    !email.includes('example.com') &&
    !email.includes('test@') &&
    !email.includes('noreply') &&
    !email.includes('no-reply');
}

function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9+]/g, '');
  if (digits.length < 6) return null;
  // PF format
  if (digits.startsWith('689') || digits.startsWith('+689')) {
    return '+689 ' + digits.replace(/^\+?689/, '').replace(/(\d{2})(\d{2})(\d{2})(\d{2})?/, '$1 $2 $3 $4').trim();
  }
  if (digits.startsWith('40') || digits.startsWith('87') || digits.startsWith('89')) {
    return '+689 ' + digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})?/, '$1 $2 $3 $4').trim();
  }
  return phone.trim();
}

function guessCityFromAddress(address: string): string {
  const cities = ['Papeete', 'Faa\'a', 'Punaauia', 'Pirae', 'Arue', 'Mahina', 'Paea', 'Papara',
    'Moorea', 'Bora Bora', 'Raiatea', 'Tahaa', 'Huahine', 'Rangiroa', 'Fakarava',
    'Taravao', 'Teva I Uta', 'Mataiea'];
  const lower = (address || '').toLowerCase();
  for (const city of cities) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return 'Tahiti';
}

// ── Load Sources ────────────────────────────────────────────────────────────────

function loadJsonSafe(filepath: string): any[] {
  if (!fs.existsSync(filepath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    console.error(`  ⚠ Failed to parse ${path.basename(filepath)}`);
    return [];
  }
}

function loadAllSources(): ScrapedEntry[] {
  const sources: ScrapedEntry[] = [];
  const files = [
    'rendez-vous-pf-raw.json',
    'ddg-beauty-results.json',
    'ddg-food-auto-results.json',
    'enriched-batch-beauty-1.json',
    'enriched-batch-beauty-2.json',
    'enriched-batch-beauty-3.json',
    'firecrawl-batch-1.json',
  ];

  for (const file of files) {
    const data = loadJsonSafe(path.join(DATA_DIR, file));
    if (data.length > 0) {
      console.log(`  ✓ ${file}: ${data.length} entries`);
      sources.push(...data);
    }
  }

  return sources;
}

// ── Merge & Deduplicate ─────────────────────────────────────────────────────────

function mergeAll(): Prospect[] {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  CONSOLIDATION — Merge & Deduplicate         ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // 1. Load merged businesses (base)
  let baseBiz: MergedBusiness[] = [];
  if (fs.existsSync(MERGED_PATH)) {
    baseBiz = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf-8'));
    console.log(`  Base: ${baseBiz.length} businesses from Tapiri`);
  }

  // 2. Load all scraped sources
  console.log('\n  Loading scraped sources...');
  const scraped = loadAllSources();
  console.log(`  Total scraped entries: ${scraped.length}`);

  // 3. Build enrichment map (name -> contact data)
  const enrichMap = new Map<string, ScrapedEntry[]>();
  for (const entry of scraped) {
    if (!entry.name) continue;
    const key = normalize(entry.name);
    if (!enrichMap.has(key)) enrichMap.set(key, []);
    enrichMap.get(key)!.push(entry);
  }

  // 4. Enrich base businesses with scraped data
  const prospects: Prospect[] = [];
  const matched = new Set<string>();
  let enrichedCount = 0;

  for (const biz of baseBiz) {
    const key = normalize(biz.name);
    const enrichments = enrichMap.get(key);

    const prospect: Prospect = {
      id: crypto.randomUUID(),
      name: biz.name,
      slug: slugify(biz.name),
      sector: biz.sector as Sector,
      subsector: biz.subsector || '',
      address: biz.address,
      city: biz.city,
      island: biz.island || 'Tahiti',
      lat: biz.lat,
      lng: biz.lng,
      email: biz.email,
      phone: biz.phone,
      website: biz.website,
      facebook_url: biz.facebook_url,
      instagram_url: biz.instagram_url,
      logo_url: null,
      photos_scraped: [],
      description: null,
      google_rating: null,
      has_website: !!biz.website,
      enrichment_source: null,
      icp_score: 0,
      status: 'new',
      batch: null,
      prototype_urls: [],
      clickup_task_id: null,
      email_sent_at: null,
      email_opened_at: null,
      replied_at: null,
      source: biz.source,
      source_url: biz.source_url,
    };

    if (enrichments) {
      matched.add(key);
      for (const e of enrichments) {
        if (e.email && isValidEmail(e.email) && !prospect.email) {
          prospect.email = e.email;
          prospect.enrichment_source = (e.source as any) || 'scraped';
        }
        if (e.phone && !prospect.phone) {
          prospect.phone = normalizePhone(e.phone);
        }
        if (e.website && !prospect.website) {
          prospect.website = e.website;
          prospect.has_website = true;
        }
        if (e.facebook_url && !prospect.facebook_url) {
          prospect.facebook_url = e.facebook_url;
        }
      }
      if (prospect.email || prospect.phone) enrichedCount++;
    }

    prospect.icp_score = computeICPScore(prospect);
    if (prospect.email) prospect.status = 'enriched';

    prospects.push(prospect);
  }

  // 5. Add scraped entries NOT matched to base (new businesses)
  let newCount = 0;
  for (const [key, entries] of enrichMap) {
    if (matched.has(key)) continue;

    const best = entries.reduce((a, b) => {
      const scoreA = (a.email ? 3 : 0) + (a.phone ? 1 : 0) + (a.website ? 1 : 0);
      const scoreB = (b.email ? 3 : 0) + (b.phone ? 1 : 0) + (b.website ? 1 : 0);
      return scoreB > scoreA ? b : a;
    });

    if (!best.email || !isValidEmail(best.email)) continue; // Only add new ones with email

    const sector = best.sector
      ? best.sector as Sector
      : mapCategoryToSector(best.category || best.subcategory || '');

    const prospect: Prospect = {
      id: crypto.randomUUID(),
      name: best.name,
      slug: slugify(best.name),
      sector,
      subsector: best.subsector || best.subcategory || '',
      address: best.address || null,
      city: best.city || guessCityFromAddress(best.address || ''),
      island: 'Tahiti',
      lat: null,
      lng: null,
      email: best.email,
      phone: best.phone ? normalizePhone(best.phone) : null,
      website: best.website || null,
      facebook_url: best.facebook_url || null,
      instagram_url: null,
      logo_url: null,
      photos_scraped: [],
      description: null,
      google_rating: null,
      has_website: !!best.website,
      enrichment_source: (best.source as any) || 'scraped',
      icp_score: 0,
      status: 'enriched',
      batch: null,
      prototype_urls: [],
      clickup_task_id: null,
      email_sent_at: null,
      email_opened_at: null,
      replied_at: null,
      source: best.source || 'scraped',
      source_url: best.source_url || null,
    };

    prospect.icp_score = computeICPScore(prospect);
    prospects.push(prospect);
    newCount++;
  }

  // 6. Sort by ICP score desc
  prospects.sort((a, b) => b.icp_score - a.icp_score);

  // 7. Save
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prospects, null, 2));

  console.log(`\n  ── Résultats ──`);
  console.log(`  Total prospects:     ${prospects.length}`);
  console.log(`  Enrichis (contact):  ${enrichedCount} (matched)`);
  console.log(`  Nouveaux (scraped):  ${newCount}`);
  console.log(`  Avec email:          ${prospects.filter(p => p.email).length}`);
  console.log(`  Avec téléphone:      ${prospects.filter(p => p.phone).length}`);
  console.log(`  ICP > 50:            ${prospects.filter(p => p.icp_score > 50).length}`);
  console.log(`  Saved: ${OUTPUT_PATH}\n`);

  return prospects;
}

// ── Push to Supabase ────────────────────────────────────────────────────────────

async function pushToSupabase(prospects: Prospect[]): Promise<void> {
  const withEmail = prospects.filter(p => p.email);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  PUSH SUPABASE — prospection_prospects        ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`  ${withEmail.length} prospects avec email à pousser\n`);

  const BATCH_SIZE = 50;
  let pushed = 0;
  let failed = 0;

  for (let i = 0; i < withEmail.length; i += BATCH_SIZE) {
    const batch = withEmail.slice(i, i + BATCH_SIZE);

    const rows = batch.map(p => ({
      name: p.name,
      slug: p.slug,
      sector: p.sector,
      subsector: p.subsector || null,
      city: p.city,
      description: p.description,
      email: p.email,
      phone: p.phone,
      website: p.website,
      facebook_url: p.facebook_url,
      logo_url: p.logo_url,
      photos_scraped: p.photos_scraped || [],
      fal_images: null,
      icp_score: p.icp_score,
      status: 'enriched',
      batch: p.batch,
      prototype_urls: p.prototype_urls || [],
      clickup_task_id: p.clickup_task_id,
      tapiri_id: null,
      enrichment_source: p.enrichment_source,
    }));

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/prospection_prospects`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(rows),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`  ✗ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${res.status} — ${text.substring(0, 200)}`);
        failed += batch.length;
      } else {
        pushed += batch.length;
        console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} prospects poussés`);
      }
    } catch (err: any) {
      console.error(`  ✗ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${err.message}`);
      failed += batch.length;
    }

    // Rate limit
    if (i + BATCH_SIZE < withEmail.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`\n  ── Résultat Supabase ──`);
  console.log(`  Poussés: ${pushed}`);
  console.log(`  Échoués: ${failed}\n`);
}

// ── Stats ───────────────────────────────────────────────────────────────────────

function showStats(): void {
  const filepath = OUTPUT_PATH;
  if (!fs.existsSync(filepath)) {
    console.log('  ✗ Aucun fichier consolidé. Lance --merge d\'abord.');
    return;
  }

  const prospects: Prospect[] = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  STATS — Prospects Consolidés                ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`  Total: ${prospects.length}`);
  console.log(`  Avec email: ${prospects.filter(p => p.email).length}`);
  console.log(`  Avec téléphone: ${prospects.filter(p => p.phone).length}`);
  console.log(`  Avec site web: ${prospects.filter(p => p.website).length}`);
  console.log(`  Avec Facebook: ${prospects.filter(p => p.facebook_url).length}`);

  console.log('\n  Par secteur:');
  const bySector: Record<string, { total: number; email: number }> = {};
  for (const p of prospects) {
    if (!bySector[p.sector]) bySector[p.sector] = { total: 0, email: 0 };
    bySector[p.sector].total++;
    if (p.email) bySector[p.sector].email++;
  }
  for (const [s, v] of Object.entries(bySector).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`    ${s}: ${v.total} total, ${v.email} emails`);
  }

  console.log('\n  Par statut:');
  const byStatus: Record<string, number> = {};
  for (const p of prospects) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  }
  for (const [s, c] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${s}: ${c}`);
  }

  console.log('\n  Top 10 ICP scores:');
  const top = prospects.filter(p => p.email).slice(0, 10);
  for (const p of top) {
    console.log(`    ${p.icp_score} | ${p.name} | ${p.sector} | ${p.city} | ${p.email}`);
  }
  console.log('');
}

// ── CLI ─────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--merge')) {
    const prospects = mergeAll();
    if (args.includes('--push')) {
      await pushToSupabase(prospects);
    }
    return;
  }

  if (args.includes('--push')) {
    if (!fs.existsSync(OUTPUT_PATH)) {
      console.error('  ✗ Fichier consolidé introuvable. Lance --merge d\'abord.');
      process.exit(1);
    }
    const prospects: Prospect[] = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    await pushToSupabase(prospects);
    return;
  }

  if (args.includes('--stats')) {
    showStats();
    return;
  }

  console.log(`
╔══════════════════════════════════════════════╗
║  CONSOLIDATE PROSPECTS                       ║
╚══════════════════════════════════════════════╝

Usage:
  npx tsx consolidate-prospects.ts --merge
    Merge toutes les sources (Tapiri + scraped) → prospects-consolidated.json

  npx tsx consolidate-prospects.ts --stats
    Affiche les statistiques des prospects consolidés

  npx tsx consolidate-prospects.ts --push
    Push vers Supabase (prospects avec email uniquement)

  npx tsx consolidate-prospects.ts --merge --push
    Full pipeline : merge + push
  `);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
