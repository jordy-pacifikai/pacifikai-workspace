/**
 * regen-batch.ts — Regenerate sites for a batch using AI/scraped images
 *
 * Reads prospects from a JSON file (exported from Supabase), regenerates
 * all 3 HTML variants using the best available images (FAL > scraped > Unsplash).
 *
 * Usage:
 *   npx tsx regen-batch.ts --file data/batch-1.json
 *   npx tsx regen-batch.ts --file data/batch-1.json --slug platinium-coiffure
 */

import * as fs from 'fs';
import * as path from 'path';
import { Prospect, slugify } from './types';
import { generateSitesForProspect } from './generate-sites';
import { loadCachedImages } from './generate-images';

const OUTPUT_DIR = path.join(__dirname, 'output');

function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf('--file');
  const slugIdx = args.indexOf('--slug');

  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.log('Usage: npx tsx regen-batch.ts --file data/batch-1.json [--slug specific-slug]');
    process.exit(0);
  }

  const filePath = path.resolve(args[fileIdx + 1]);
  const prospects: Prospect[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const filterSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  console.log(`\n=== Regenerating ${filterSlug ? '1' : prospects.length} prospect(s) ===\n`);

  let total = 0;
  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    if (!p.slug) p.slug = slugify(p.name);
    if (!p.photos_scraped) p.photos_scraped = [];
    if (!p.prototype_urls) p.prototype_urls = [];

    if (filterSlug && p.slug !== filterSlug) continue;

    // Check image source
    const cached = loadCachedImages(p.slug);
    const scrapedPath = path.join(OUTPUT_DIR, p.slug, 'scraped-photos.json');
    const hasScraped = fs.existsSync(scrapedPath);

    const source = cached?.hero ? 'FAL AI' : hasScraped ? 'Scraped photos' : 'Unsplash stock';
    console.log(`  ${p.name} → images: ${source}`);

    const paths = generateSitesForProspect(p, i);
    total += paths.length;
  }

  console.log(`\n=== Done: ${total} sites regenerated ===\n`);
}

main();
