/**
 * enrich.ts — Enrich businesses from merged-businesses.json for the 100K Site Web pipeline
 *
 * Three modes:
 *   --prepare   Generate Firecrawl search queries (default)
 *   --process   Extract contacts from Firecrawl results JSON
 *   --csv       Import manual enrichment from CSV
 *   --stats     Show enrichment progress stats
 *
 * Usage:
 *   npx tsx enrich.ts --prepare --sectors beauty,food --limit 500
 *   npx tsx enrich.ts --process data/firecrawl-results.json
 *   npx tsx enrich.ts --csv data/manual-enrichment.csv
 *   npx tsx enrich.ts --stats
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Prospect, Sector, slugify, computeICPScore } from './types';

// ── Paths ──────────────────────────────────────────────────────────────────────

const SCRIPT_DIR = __dirname || path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(SCRIPT_DIR, 'data');
const MERGED_PATH = path.resolve(SCRIPT_DIR, '../../Tapiri/scraper/data/merged-businesses.json');
const QUERIES_PATH = path.join(DATA_DIR, 'enrichment-queries.json');
const PROSPECTS_PATH = path.join(DATA_DIR, 'prospects-enriched.json');
const PROGRESS_PATH = path.join(DATA_DIR, 'enrich-progress.json');

// ── Types ──────────────────────────────────────────────────────────────────────

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
}

interface EnrichmentQuery {
  id: string;
  name: string;
  query: string;
  sector: string;
  city: string;
}

interface FirecrawlResult {
  id: string;         // matches EnrichmentQuery.id
  name: string;
  results: Array<{
    url: string;
    title: string;
    description: string;
    content?: string;
  }>;
}

interface EnrichProgress {
  total: number;
  prepared: number;
  enriched: number;
  with_email: number;
  with_facebook: number;
  by_sector: Record<string, number>;
  last_updated: string;
}

interface ExtractedContacts {
  emails: string[];
  phones: string[];
  websites: string[];
  facebook: string | null;
  instagram: string | null;
}

// ── CLI Args ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

function getArg(name: string, def: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
}

// ── Core Functions ─────────────────────────────────────────────────────────────

function loadMergedBusinesses(sectors?: Sector[], limit?: number): RawBusiness[] {
  if (!fs.existsSync(MERGED_PATH)) {
    console.error(`File not found: ${MERGED_PATH}`);
    process.exit(1);
  }

  const raw: RawBusiness[] = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf-8'));
  console.log(`Loaded ${raw.length} businesses from merged-businesses.json`);

  // Deduplicate by name+city (case insensitive)
  const seen = new Set<string>();
  let deduped = raw.filter((b) => {
    const key = `${b.name.toLowerCase().trim()}|${(b.city || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`After dedup: ${deduped.length} unique businesses`);

  // Filter by sectors
  if (sectors && sectors.length > 0) {
    deduped = deduped.filter((b) => sectors.includes(b.sector as Sector));
    console.log(`After sector filter (${sectors.join(', ')}): ${deduped.length}`);
  }

  // Apply limit
  if (limit && limit > 0) {
    deduped = deduped.slice(0, limit);
  }

  return deduped;
}

function prepareQueries(businesses: RawBusiness[]): EnrichmentQuery[] {
  return businesses.map((b) => ({
    id: crypto.randomUUID(),
    name: b.name,
    query: `"${b.name}" ${b.city || ''} Tahiti email site contact`,
    sector: b.sector,
    city: b.city || '',
  }));
}

function extractContacts(text: string): ExtractedContacts {
  const emails: string[] = [];
  const phones: string[] = [];
  const websites: string[] = [];
  let facebook: string | null = null;
  let instagram: string | null = null;

  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailExclude = /noreply|example|sentry|webpack|wixpress|mailgun|sendgrid|mailer-daemon/i;
  let m: RegExpExecArray | null;
  while ((m = emailRegex.exec(text)) !== null) {
    if (!emailExclude.test(m[0]) && !emails.includes(m[0].toLowerCase())) {
      emails.push(m[0].toLowerCase());
    }
  }

  // Phones — PF format
  const phoneRegex = /(?:\+689\s?)?(?:40|87|89)\s?\d{2}\s?\d{2}\s?\d{2}/g;
  while ((m = phoneRegex.exec(text)) !== null) {
    const digits = m[0].replace(/[\s.()-]/g, '').replace(/^\+?689/, '');
    if (digits.length === 8 && /^(40|87|89)/.test(digits)) {
      const formatted = `+689${digits}`;
      if (!phones.includes(formatted)) {
        phones.push(formatted);
      }
    }
  }

  // URLs — extract all, then classify
  const urlRegex = /https?:\/\/[^\s"'<>,;)}\]]+/g;
  const socialExclude = /facebook\.com|instagram\.com|twitter\.com|tiktok\.com|youtube\.com|linkedin\.com|tripadvisor|google\.|yelp|pages-jaunes|pagesjaunes/i;
  const fbExclude = /\/(groups|sharer|share|login|events|hashtag|pages\/category)\//i;

  while ((m = urlRegex.exec(text)) !== null) {
    const url = m[0].replace(/[.,;:!?)}\]]+$/, ''); // strip trailing punctuation

    // Facebook
    if (!facebook && /facebook\.com\/[a-zA-Z0-9._-]+/.test(url) && !fbExclude.test(url)) {
      const fbMatch = url.match(/(https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._-]+)/);
      if (fbMatch) facebook = fbMatch[1].replace(/\/$/, '');
    }

    // Instagram
    if (!instagram && /instagram\.com\/[a-zA-Z0-9._-]+/.test(url)) {
      const igMatch = url.match(/(https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._-]+)/);
      if (igMatch) instagram = igMatch[1].replace(/\/$/, '');
    }

    // Website (not social media)
    if (!socialExclude.test(url) && !websites.includes(url)) {
      websites.push(url);
    }
  }

  return { emails, phones, websites, facebook, instagram };
}

function processResults(results: FirecrawlResult[], existingProspects: Map<string, Prospect>): Prospect[] {
  let enrichedCount = 0;

  for (const r of results) {
    const prospect = existingProspects.get(r.id);
    if (!prospect) continue;

    // Combine all text from results
    const allText = r.results
      .map((res) => `${res.title || ''} ${res.description || ''} ${res.url || ''} ${res.content || ''}`)
      .join(' ');

    const contacts = extractContacts(allText);

    // Merge — don't overwrite existing values
    if (!prospect.email && contacts.emails.length > 0) prospect.email = contacts.emails[0];
    if (!prospect.phone && contacts.phones.length > 0) prospect.phone = contacts.phones[0];
    if (!prospect.website && contacts.websites.length > 0) prospect.website = contacts.websites[0];
    if (!prospect.facebook_url && contacts.facebook) prospect.facebook_url = contacts.facebook;
    if (!prospect.instagram_url && contacts.instagram) prospect.instagram_url = contacts.instagram;

    // Description from first result with enough text
    if (!prospect.description) {
      const desc = r.results.find((res) => res.description && res.description.length > 30);
      if (desc) prospect.description = desc.description.slice(0, 300);
    }

    prospect.enrichment_source = 'firecrawl';
    prospect.icp_score = computeICPScore(prospect);
    if (prospect.email || prospect.facebook_url) enrichedCount++;
  }

  return Array.from(existingProspects.values());
}

function filterAndScore(prospects: Prospect[]): Prospect[] {
  return prospects
    .map((p) => {
      p.icp_score = computeICPScore(p);
      return p;
    })
    .filter((p) => p.email || p.facebook_url)
    .sort((a, b) => b.icp_score - a.icp_score);
}

function saveProspects(prospects: Prospect[], outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(prospects, null, 2), 'utf-8');
  console.log(`Saved ${prospects.length} prospects to ${outputPath}`);
}

function loadProgress(): EnrichProgress {
  if (fs.existsSync(PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
  }
  return {
    total: 0,
    prepared: 0,
    enriched: 0,
    with_email: 0,
    with_facebook: 0,
    by_sector: {},
    last_updated: new Date().toISOString(),
  };
}

function saveProgress(progress: EnrichProgress): void {
  progress.last_updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(PROGRESS_PATH), { recursive: true });
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
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

function loadExistingProspects(): Map<string, Prospect> {
  const map = new Map<string, Prospect>();
  if (fs.existsSync(PROSPECTS_PATH)) {
    const data: Prospect[] = JSON.parse(fs.readFileSync(PROSPECTS_PATH, 'utf-8'));
    for (const p of data) map.set(p.id, p);
  }
  return map;
}

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ''; });
    return row;
  });
}

// ── Commands ───────────────────────────────────────────────────────────────────

function cmdPrepare(): void {
  const sectorsArg = getArg('sectors', '');
  const sectors = sectorsArg ? (sectorsArg.split(',') as Sector[]) : undefined;
  const limit = parseInt(getArg('limit', '0')) || undefined;

  const businesses = loadMergedBusinesses(sectors, limit);
  const queries = prepareQueries(businesses);

  // Also create prospect stubs
  const existingProspects = loadExistingProspects();
  const nameIndex = new Map<string, string>(); // name|city -> id
  for (const [id, p] of existingProspects) {
    nameIndex.set(`${p.name.toLowerCase()}|${p.city.toLowerCase()}`, id);
  }

  let newCount = 0;
  const queryToProspect = new Map<string, string>(); // query.id -> prospect.id
  for (let i = 0; i < businesses.length; i++) {
    const b = businesses[i];
    const key = `${b.name.toLowerCase()}|${(b.city || '').toLowerCase()}`;
    let prospectId = nameIndex.get(key);
    if (!prospectId) {
      const prospect = rawToProspect(b);
      existingProspects.set(prospect.id, prospect);
      nameIndex.set(key, prospect.id);
      prospectId = prospect.id;
      newCount++;
    }
    queryToProspect.set(queries[i].id, prospectId);
    queries[i].id = prospectId; // align query ID with prospect ID
  }

  // Save
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(QUERIES_PATH, JSON.stringify(queries, null, 2), 'utf-8');
  saveProspects(Array.from(existingProspects.values()), PROSPECTS_PATH);

  // Update progress
  const progress = loadProgress();
  progress.total = existingProspects.size;
  progress.prepared = queries.length;
  const bySector: Record<string, number> = {};
  for (const q of queries) {
    bySector[q.sector] = (bySector[q.sector] || 0) + 1;
  }
  progress.by_sector = { ...progress.by_sector, ...bySector };
  saveProgress(progress);

  console.log(`\n=== Prepare Complete ===`);
  console.log(`Queries generated: ${queries.length} → ${QUERIES_PATH}`);
  console.log(`New prospects created: ${newCount}`);
  console.log(`Total prospects: ${existingProspects.size}`);
  console.log(`Sectors: ${Object.entries(bySector).map(([k, v]) => `${k}(${v})`).join(', ')}`);
}

function cmdProcess(): void {
  const resultsFile = getArg('process', '');
  if (!resultsFile || !fs.existsSync(resultsFile)) {
    console.error(`Results file not found: ${resultsFile}`);
    process.exit(1);
  }

  const results: FirecrawlResult[] = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
  console.log(`Loaded ${results.length} Firecrawl results from ${resultsFile}`);

  const prospects = loadExistingProspects();
  if (prospects.size === 0) {
    console.error('No existing prospects found. Run --prepare first.');
    process.exit(1);
  }

  processResults(results, prospects);

  const all = Array.from(prospects.values());
  const withEmail = all.filter((p) => p.email).length;
  const withFacebook = all.filter((p) => p.facebook_url).length;
  const enriched = all.filter((p) => p.enrichment_source).length;

  saveProspects(all, PROSPECTS_PATH);

  // Filtered/scored output
  const scored = filterAndScore(all);
  const scoredPath = path.join(DATA_DIR, 'prospects-scored.json');
  saveProspects(scored, scoredPath);

  // Update progress
  const progress = loadProgress();
  progress.enriched = enriched;
  progress.with_email = withEmail;
  progress.with_facebook = withFacebook;
  saveProgress(progress);

  // Top sector
  const sectorCounts: Record<string, number> = {};
  for (const p of scored) {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
  }
  const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];

  console.log(`\n=== Process Complete ===`);
  console.log(`Enriched ${enriched} prospects | ${withEmail} with email | ${withFacebook} with Facebook | Top sector: ${topSector ? `${topSector[0]}(${topSector[1]})` : 'none'}`);
}

function cmdCSV(): void {
  const csvFile = getArg('csv', '');
  if (!csvFile || !fs.existsSync(csvFile)) {
    console.error(`CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvFile, 'utf-8');
  const rows = parseCSV(content);
  console.log(`Loaded ${rows.length} rows from CSV`);

  const prospects = loadExistingProspects();
  const nameIndex = new Map<string, string>();
  for (const [id, p] of prospects) {
    nameIndex.set(`${p.name.toLowerCase()}|${p.city.toLowerCase()}`, id);
  }

  let updated = 0;
  let notFound = 0;

  for (const row of rows) {
    if (!row.name) continue;
    const key = `${row.name.toLowerCase()}|${(row.city || '').toLowerCase()}`;
    const prospectId = nameIndex.get(key);

    if (prospectId) {
      const p = prospects.get(prospectId)!;
      if (row.email && !p.email) p.email = row.email;
      if (row.phone && !p.phone) p.phone = row.phone;
      if (row.website && !p.website) p.website = row.website;
      if (row.facebook && !p.facebook_url) p.facebook_url = row.facebook;
      if (row.instagram && !p.instagram_url) p.instagram_url = row.instagram;
      p.enrichment_source = 'manual';
      p.icp_score = computeICPScore(p);
      updated++;
    } else {
      notFound++;
    }
  }

  saveProspects(Array.from(prospects.values()), PROSPECTS_PATH);

  console.log(`\n=== CSV Import Complete ===`);
  console.log(`Updated: ${updated} | Not found: ${notFound}`);
}

function cmdStats(): void {
  const progress = loadProgress();
  const prospects = loadExistingProspects();
  const all = Array.from(prospects.values());

  // Recompute live stats
  const withEmail = all.filter((p) => p.email).length;
  const withPhone = all.filter((p) => p.phone).length;
  const withWebsite = all.filter((p) => p.website).length;
  const withFacebook = all.filter((p) => p.facebook_url).length;
  const withInstagram = all.filter((p) => p.instagram_url).length;
  const enriched = all.filter((p) => p.enrichment_source).length;

  const sectorCounts: Record<string, number> = {};
  const sectorEnriched: Record<string, number> = {};
  for (const p of all) {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
    if (p.enrichment_source) sectorEnriched[p.sector] = (sectorEnriched[p.sector] || 0) + 1;
  }

  console.log(`\n=== Enrichment Stats ===`);
  console.log(`Total prospects: ${all.length}`);
  console.log(`Prepared queries: ${progress.prepared}`);
  console.log(`Enriched: ${enriched} (${all.length > 0 ? ((enriched / all.length) * 100).toFixed(1) : 0}%)`);
  console.log(`  Email: ${withEmail} | Phone: ${withPhone} | Website: ${withWebsite}`);
  console.log(`  Facebook: ${withFacebook} | Instagram: ${withInstagram}`);
  console.log(`\nBy sector:`);
  for (const [sector, count] of Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])) {
    const enr = sectorEnriched[sector] || 0;
    console.log(`  ${sector}: ${count} total, ${enr} enriched (${((enr / count) * 100).toFixed(0)}%)`);
  }
  console.log(`\nLast updated: ${progress.last_updated}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('=== PACIFIK\'AI — Business Enrichment Pipeline ===\n');

  if (hasFlag('stats')) {
    cmdStats();
  } else if (hasFlag('process')) {
    cmdProcess();
  } else if (hasFlag('csv')) {
    cmdCSV();
  } else if (hasFlag('prepare') || args.length === 0) {
    cmdPrepare();
  } else {
    console.log('Usage:');
    console.log('  npx tsx enrich.ts --prepare --sectors beauty,food --limit 500');
    console.log('  npx tsx enrich.ts --process data/firecrawl-results.json');
    console.log('  npx tsx enrich.ts --csv data/manual-enrichment.csv');
    console.log('  npx tsx enrich.ts --stats');
  }
}

main();
