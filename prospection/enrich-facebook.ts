/**
 * enrich-facebook.ts — Mass enrichment via Camoufox Facebook search
 *
 * Strategy: Search each business on Facebook, scrape About page for email/phone
 *
 * Usage:
 *   npx tsx enrich-facebook.ts --sectors beauty,food --limit 500 --concurrency 3
 *   npx tsx enrich-facebook.ts --all --limit 2000
 *   npx tsx enrich-facebook.ts --stats
 *   npx tsx enrich-facebook.ts --push-supabase
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Prospect, Sector, slugify, computeICPScore } from './types';

// ── Config ──────────────────────────────────────────────────────────────────────

const SCRIPT_DIR = __dirname;
const DATA_DIR = path.join(SCRIPT_DIR, 'data');
const MERGED_PATH = path.resolve(SCRIPT_DIR, '../../Tapiri/scraper/data/merged-businesses.json');
const PROSPECTS_PATH = path.join(DATA_DIR, 'prospects-enriched.json');
const PROGRESS_PATH = path.join(DATA_DIR, 'enrich-facebook-progress.json');

const CAMOUFOX_BASE = 'http://localhost:38821';
const SUPABASE_URL = 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// ── Types ───────────────────────────────────────────────────────────────────────

interface RawBusiness {
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

interface EnrichResult {
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  description: string | null;
  source: 'facebook' | 'google' | 'none';
}

interface Progress {
  total_businesses: number;
  processed: number;
  enriched: number;
  with_email: number;
  with_phone: number;
  with_facebook: number;
  by_sector: Record<string, { total: number; enriched: number }>;
  last_batch_at: string;
  errors: number;
}

// ── CLI ─────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const hasFlag = (f: string) => args.includes(`--${f}`);
const getArg = (f: string, def: string) => {
  const i = args.indexOf(`--${f}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

// ── Camoufox API ────────────────────────────────────────────────────────────────

async function camoufoxCall(tool: string, params: Record<string, any>): Promise<any> {
  const res = await fetch(`${CAMOUFOX_BASE}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, params }),
  });
  if (!res.ok) throw new Error(`Camoufox ${res.status}: ${await res.text()}`);
  return res.json();
}

async function webSearch(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    const res = await camoufoxCall('web_search', { query, max_results: 5 });
    return res.results || [];
  } catch {
    return [];
  }
}

async function createTab(url?: string): Promise<string> {
  const res = await camoufoxCall('create_tab', url ? { url } : {});
  return res.tabId;
}

async function navigateAndSnapshot(tabId: string, url: string): Promise<string> {
  const res = await camoufoxCall('navigate_and_snapshot', { tabId, url, timeout: 15000 });
  return res.snapshot || '';
}

async function closeTab(tabId: string): Promise<void> {
  try { await camoufoxCall('close_tab', { tabId }); } catch {}
}

async function getPageHtml(tabId: string): Promise<string> {
  try {
    const res = await camoufoxCall('camofox_get_page_html', { tabId });
    return res.html || '';
  } catch {
    return '';
  }
}

// ── Extraction helpers ──────────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EMAIL_EXCLUDE = /noreply|example|sentry|webpack|wixpress|mailgun|sendgrid|mailer-daemon|facebook|fbcdn|meta\.com/i;
const PHONE_REGEX = /(?:\+689\s?)?(?:40|87|89)\s?\d{2}\s?\d{2}\s?\d{2}/g;
const FB_PAGE_REGEX = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)/;

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) || [];
  return [...new Set(matches.map(e => e.toLowerCase()).filter(e => !EMAIL_EXCLUDE.test(e)))];
}

function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_REGEX) || [];
  return [...new Set(matches.map(m => {
    const digits = m.replace(/[\s.()-]/g, '').replace(/^\+?689/, '');
    return digits.length === 8 && /^(40|87|89)/.test(digits) ? `+689${digits}` : '';
  }).filter(Boolean))];
}

function extractFacebookUrl(text: string): string | null {
  const exclude = /\/(groups|sharer|share|login|events|hashtag|pages\/category|photo|story|watch|reel|help|policies)/i;
  const urls = text.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._-]+/g) || [];
  for (const url of urls) {
    if (!exclude.test(url) && !/facebook\.com\/(facebook|meta|marketplace|gaming|watch)$/i.test(url)) {
      return url.replace(/\/$/, '');
    }
  }
  return null;
}

function extractInstagramUrl(text: string): string | null {
  const match = text.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._-]+)/);
  if (match && !['explore', 'accounts', 'about', 'legal', 'p', 'reel'].includes(match[1])) {
    return match[0].replace(/\/$/, '');
  }
  return null;
}

function extractWebsite(text: string): string | null {
  const socialExclude = /facebook\.com|instagram\.com|twitter\.com|tiktok\.com|youtube\.com|linkedin\.com|tripadvisor|google\.|yelp|pages-jaunes|pagesjaunes|ispf\.pf/i;
  const urls = text.match(/https?:\/\/[^\s"'<>,;)}\]]+/g) || [];
  for (const url of urls) {
    const clean = url.replace(/[.,;:!?)}\]]+$/, '');
    if (!socialExclude.test(clean) && clean.length > 10) return clean;
  }
  return null;
}

// ── Enrichment Logic ────────────────────────────────────────────────────────────

async function enrichViaGoogleSearch(name: string, city: string): Promise<EnrichResult> {
  const result: EnrichResult = { name, email: null, phone: null, website: null, facebook_url: null, instagram_url: null, description: null, source: 'none' };

  // Search Google via Camoufox
  const query = `"${name}" ${city || ''} Tahiti Polynésie contact email`;
  const searchResults = await webSearch(query);

  if (searchResults.length === 0) return result;

  const allText = searchResults.map(r => `${r.title} ${r.snippet} ${r.url}`).join(' ');

  const emails = extractEmails(allText);
  const phones = extractPhones(allText);
  const fbUrl = extractFacebookUrl(allText);
  const igUrl = extractInstagramUrl(allText);
  const website = extractWebsite(allText);

  if (emails.length > 0) result.email = emails[0];
  if (phones.length > 0) result.phone = phones[0];
  if (fbUrl) result.facebook_url = fbUrl;
  if (igUrl) result.instagram_url = igUrl;
  if (website) result.website = website;

  // Get description from first result
  const desc = searchResults.find(r => r.snippet && r.snippet.length > 30);
  if (desc) result.description = desc.snippet.slice(0, 300);

  if (result.email || result.phone || result.facebook_url) result.source = 'google';

  return result;
}

async function enrichViaFacebookAbout(fbUrl: string): Promise<{ email: string | null; phone: string | null }> {
  let tabId: string | null = null;
  try {
    const aboutUrl = fbUrl.replace(/\/$/, '') + '/about';
    tabId = await createTab(aboutUrl);

    // Wait for page to load
    await new Promise(r => setTimeout(r, 3000));

    const html = await getPageHtml(tabId);

    const emails = extractEmails(html);
    const phones = extractPhones(html);

    return {
      email: emails.length > 0 ? emails[0] : null,
      phone: phones.length > 0 ? phones[0] : null,
    };
  } catch {
    return { email: null, phone: null };
  } finally {
    if (tabId) await closeTab(tabId);
  }
}

async function enrichBusiness(name: string, city: string): Promise<EnrichResult> {
  // Step 1: Google search
  const result = await enrichViaGoogleSearch(name, city);

  // Step 2: If we found Facebook but no email, scrape the About page
  if (result.facebook_url && !result.email) {
    const fbData = await enrichViaFacebookAbout(result.facebook_url);
    if (fbData.email) result.email = fbData.email;
    if (fbData.phone && !result.phone) result.phone = fbData.phone;
  }

  return result;
}

// ── Data Management ─────────────────────────────────────────────────────────────

function loadMergedBusinesses(sectors?: Sector[], limit?: number): RawBusiness[] {
  const raw: RawBusiness[] = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf-8'));

  // Dedup by name+city
  const seen = new Set<string>();
  let filtered = raw.filter(b => {
    const key = `${b.name.toLowerCase().trim()}|${(b.city || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (sectors?.length) {
    filtered = filtered.filter(b => sectors.includes(b.sector as Sector));
  }

  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

function loadExistingProspects(): Map<string, Prospect> {
  const map = new Map<string, Prospect>();
  if (fs.existsSync(PROSPECTS_PATH)) {
    const data: Prospect[] = JSON.parse(fs.readFileSync(PROSPECTS_PATH, 'utf-8'));
    for (const p of data) map.set(`${p.name.toLowerCase()}|${p.city.toLowerCase()}`, p);
  }
  return map;
}

function rawToProspect(b: RawBusiness): Prospect {
  return {
    id: crypto.randomUUID(),
    name: b.name,
    slug: slugify(b.name),
    sector: (b.sector || 'other') as Sector,
    subsector: b.subsector || '',
    address: b.address || null,
    city: b.city || '',
    island: b.island || 'Tahiti',
    lat: b.lat || null,
    lng: b.lng || null,
    email: null,
    phone: null,
    website: null,
    facebook_url: null,
    instagram_url: null,
    logo_url: null,
    photos_scraped: [],
    description: null,
    google_rating: null,
    has_website: false,
    enrichment_source: null,
    icp_score: 0,
    status: 'new',
    batch: null,
    prototype_urls: [],
    clickup_task_id: null,
    email_sent_at: null,
    email_opened_at: null,
    replied_at: null,
    source: b.source || 'merged',
    source_url: b.source_url || null,
  };
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
  }
  return {
    total_businesses: 0, processed: 0, enriched: 0,
    with_email: 0, with_phone: 0, with_facebook: 0,
    by_sector: {}, last_batch_at: '', errors: 0,
  };
}

function saveProgress(p: Progress): void {
  p.last_batch_at = new Date().toISOString();
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(p, null, 2));
}

// ── Push to Supabase ────────────────────────────────────────────────────────────

async function pushToSupabase(prospects: Prospect[]): Promise<void> {
  const enriched = prospects.filter(p => p.email || p.phone || p.facebook_url);
  console.log(`\nPushing ${enriched.length} enriched prospects to Supabase...`);

  let inserted = 0;
  let errors = 0;

  for (const p of enriched) {
    const row = {
      name: p.name,
      slug: p.slug,
      sector: p.sector,
      subsector: p.subsector || null,
      city: p.city || null,
      description: p.description || null,
      email: p.email || null,
      phone: p.phone || null,
      website: p.website || null,
      facebook_url: p.facebook_url || null,
      icp_score: computeICPScore(p),
      status: 'enriched',
      tapiri_id: p.source_url || null,
      enrichment_source: p.enrichment_source || null,
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/prospection_prospects`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      });

      if (res.ok) {
        inserted++;
      } else {
        const err = await res.text();
        if (!err.includes('duplicate')) {
          errors++;
          if (errors <= 3) console.error(`  ✗ ${p.name}: ${err}`);
        }
      }
    } catch (e: any) {
      errors++;
      if (errors <= 3) console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  console.log(`  ✓ Inserted: ${inserted} | Errors: ${errors}`);
}

// ── Main Commands ───────────────────────────────────────────────────────────────

async function cmdEnrich(): Promise<void> {
  const sectorsArg = getArg('sectors', '');
  const sectors = sectorsArg ? sectorsArg.split(',') as Sector[] : undefined;
  const limit = parseInt(getArg('limit', '500'));
  const concurrency = parseInt(getArg('concurrency', '2'));

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  ENRICHISSEMENT MASSIF — Camoufox Google + Facebook  ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  const businesses = loadMergedBusinesses(sectors, limit);
  console.log(`Businesses chargés: ${businesses.length} (sectors: ${sectors?.join(', ') || 'all'})`);

  const existingProspects = loadExistingProspects();
  console.log(`Prospects existants: ${existingProspects.size}`);

  const progress = loadProgress();
  progress.total_businesses = businesses.length;

  // Process in chunks
  const chunkSize = concurrency;
  let processed = 0;
  let enriched = 0;
  let withEmail = 0;
  let withPhone = 0;
  let withFacebook = 0;
  let errors = 0;

  const allProspects: Prospect[] = [];

  for (let i = 0; i < businesses.length; i += chunkSize) {
    const chunk = businesses.slice(i, i + chunkSize);

    const results = await Promise.allSettled(
      chunk.map(b => enrichBusiness(b.name, b.city || ''))
    );

    for (let j = 0; j < chunk.length; j++) {
      const b = chunk[j];
      const key = `${b.name.toLowerCase()}|${(b.city || '').toLowerCase()}`;

      // Get or create prospect
      let prospect = existingProspects.get(key);
      if (!prospect) {
        prospect = rawToProspect(b);
        existingProspects.set(key, prospect);
      }

      if (results[j].status === 'fulfilled') {
        const r = results[j].value;

        if (r.email && !prospect.email) prospect.email = r.email;
        if (r.phone && !prospect.phone) prospect.phone = r.phone;
        if (r.website && !prospect.website) { prospect.website = r.website; prospect.has_website = true; }
        if (r.facebook_url && !prospect.facebook_url) prospect.facebook_url = r.facebook_url;
        if (r.instagram_url && !prospect.instagram_url) prospect.instagram_url = r.instagram_url;
        if (r.description && !prospect.description) prospect.description = r.description;

        if (r.source !== 'none') {
          prospect.enrichment_source = r.source === 'facebook' ? 'camoufox' : 'firecrawl';
          prospect.status = 'enriched';
          enriched++;
        }

        if (prospect.email) withEmail++;
        if (prospect.phone) withPhone++;
        if (prospect.facebook_url) withFacebook++;
      } else {
        errors++;
      }

      prospect.icp_score = computeICPScore(prospect);
      allProspects.push(prospect);
      processed++;
    }

    // Progress log every 10
    if (processed % 10 === 0 || processed === businesses.length) {
      const pct = ((processed / businesses.length) * 100).toFixed(1);
      console.log(`  [${processed}/${businesses.length}] ${pct}% | enriched: ${enriched} | email: ${withEmail} | phone: ${withPhone} | fb: ${withFacebook} | errors: ${errors}`);
    }

    // Rate limit: 1.5s between chunks
    if (i + chunkSize < businesses.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Save results
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROSPECTS_PATH, JSON.stringify(allProspects, null, 2));

  // Update progress
  progress.processed = processed;
  progress.enriched = enriched;
  progress.with_email = withEmail;
  progress.with_phone = withPhone;
  progress.with_facebook = withFacebook;
  progress.errors = errors;

  const sectorStats: Record<string, { total: number; enriched: number }> = {};
  for (const p of allProspects) {
    if (!sectorStats[p.sector]) sectorStats[p.sector] = { total: 0, enriched: 0 };
    sectorStats[p.sector].total++;
    if (p.enrichment_source) sectorStats[p.sector].enriched++;
  }
  progress.by_sector = sectorStats;
  saveProgress(progress);

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  RÉSULTATS`);
  console.log(`══════════════════════════════════════════`);
  console.log(`  Total traité: ${processed}`);
  console.log(`  Enrichis: ${enriched} (${((enriched / processed) * 100).toFixed(1)}%)`);
  console.log(`  Avec email: ${withEmail}`);
  console.log(`  Avec phone: ${withPhone}`);
  console.log(`  Avec Facebook: ${withFacebook}`);
  console.log(`  Erreurs: ${errors}`);
  console.log(`  Sauvegardé: ${PROSPECTS_PATH}\n`);

  for (const [sector, stats] of Object.entries(sectorStats).sort((a, b) => b[1].enriched - a[1].enriched)) {
    console.log(`  ${sector}: ${stats.enriched}/${stats.total} enrichis`);
  }
}

function cmdStats(): void {
  const progress = loadProgress();
  const prospects: Prospect[] = fs.existsSync(PROSPECTS_PATH)
    ? JSON.parse(fs.readFileSync(PROSPECTS_PATH, 'utf-8'))
    : [];

  const withEmail = prospects.filter(p => p.email).length;
  const withPhone = prospects.filter(p => p.phone).length;
  const withFb = prospects.filter(p => p.facebook_url).length;
  const withAny = prospects.filter(p => p.email || p.phone || p.facebook_url).length;
  const enriched = prospects.filter(p => p.enrichment_source).length;

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  ENRICHMENT STATS                    ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
  console.log(`  Total prospects: ${prospects.length}`);
  console.log(`  Enrichis: ${enriched} (${prospects.length ? ((enriched / prospects.length) * 100).toFixed(1) : 0}%)`);
  console.log(`  Email: ${withEmail} | Phone: ${withPhone} | Facebook: ${withFb}`);
  console.log(`  Au moins 1 contact: ${withAny}`);

  if (Object.keys(progress.by_sector).length > 0) {
    console.log(`\n  Par secteur:`);
    for (const [s, stats] of Object.entries(progress.by_sector).sort((a, b) => b[1].enriched - a[1].enriched)) {
      console.log(`    ${s}: ${stats.enriched}/${stats.total} enrichis`);
    }
  }

  console.log(`\n  Dernière MAJ: ${progress.last_batch_at || 'jamais'}\n`);

  // Top 10 prospects by ICP score
  const top = [...prospects].sort((a, b) => b.icp_score - a.icp_score).slice(0, 10);
  if (top.length > 0) {
    console.log(`  Top 10 ICP score:`);
    for (const p of top) {
      console.log(`    ${p.icp_score.toString().padStart(3)} | ${p.name.padEnd(35)} | ${p.email || p.phone || 'no contact'}`);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (hasFlag('stats')) {
    cmdStats();
  } else if (hasFlag('push-supabase')) {
    const prospects: Prospect[] = JSON.parse(fs.readFileSync(PROSPECTS_PATH, 'utf-8'));
    await pushToSupabase(prospects);
  } else if (hasFlag('sectors') || hasFlag('all') || hasFlag('limit')) {
    await cmdEnrich();
  } else {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  ENRICHISSEMENT MASSIF — Facebook + Google           ║
╚══════════════════════════════════════════════════════╝

Usage:
  npx tsx enrich-facebook.ts --sectors beauty,food --limit 500
  npx tsx enrich-facebook.ts --all --limit 2000
  npx tsx enrich-facebook.ts --stats
  npx tsx enrich-facebook.ts --push-supabase
    `);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
