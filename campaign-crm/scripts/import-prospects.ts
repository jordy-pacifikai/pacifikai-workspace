/**
 * Import batch 2 prospects (with email) into Supabase campaign_prospects table.
 * Run: npx tsx scripts/import-prospects.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzE1ODU0NiwiZXhwIjoyMDUyNzM0NTQ2fQ.GrHKbOq4tGS0pBLFXLkqKnF7TO78bQqYbsBmHPHvhBs';

const SOURCE_FILE = join(
  '/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK\'AI/prospection/data',
  'prospects-enriched.json'
);

// Raw prospect shape from the JSON source
interface RawProspect {
  id: string;
  name: string;
  slug: string;
  sector: string;
  subsector?: string | null;
  city?: string;
  island?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  description?: string | null;
  facebook_page_name?: string | null;
  facebook_page_likes?: number | null;
  facebook_messenger_sent?: boolean;
  icp_score?: number;
  status?: string;
  batch?: number | null;
  prototype_urls?: string[];
  email_sent_at?: string | null;
  email_opened_at?: string | null;
  replied_at?: string | null;
  devis_sent_at?: string | null;
  converted_at?: string | null;
  lost_at?: string | null;
  lost_reason?: string | null;
  relance_count?: number;
  last_relance_at?: string | null;
  last_relance_type?: string | null;
  notes?: string | null;
  tags?: string[];
}

function mapToDbRow(p: RawProspect) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sector: p.sector,
    subsector: p.subsector ?? null,
    city: p.city ?? 'Papeete',
    island: p.island ?? 'Tahiti',
    email: p.email ?? null,
    phone: p.phone ?? null,
    website: p.website ?? null,
    facebook_url: p.facebook_url ?? null,
    instagram_url: p.instagram_url ?? null,
    description: p.description ?? null,
    facebook_page_name: p.facebook_page_name ?? null,
    facebook_page_likes: p.facebook_page_likes ?? null,
    facebook_messenger_sent: p.facebook_messenger_sent ?? false,
    icp_score: p.icp_score ?? 50,
    status: p.status ?? 'new',
    batch: p.batch ?? null,
    prototype_urls: p.prototype_urls ?? [],
    email_sent_at: p.email_sent_at ?? null,
    email_opened_at: p.email_opened_at ?? null,
    replied_at: p.replied_at ?? null,
    devis_sent_at: p.devis_sent_at ?? null,
    converted_at: p.converted_at ?? null,
    lost_at: p.lost_at ?? null,
    lost_reason: p.lost_reason ?? null,
    relance_count: p.relance_count ?? 0,
    last_relance_at: p.last_relance_at ?? null,
    last_relance_type: p.last_relance_type ?? null,
    notes: p.notes ?? null,
    tags: p.tags ?? [],
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('Reading prospects-enriched.json...');
  const raw = readFileSync(SOURCE_FILE, 'utf-8');
  const allProspects: RawProspect[] = JSON.parse(raw);

  // Filter: batch=2 and email not null/empty
  const batch2 = allProspects.filter(
    (p) => p.batch === 2 && p.email && p.email.trim() !== ''
  );

  console.log(`Found ${batch2.length} batch-2 prospects with email.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const prospect of batch2) {
    const row = mapToDbRow(prospect);

    const { error } = await supabase
      .from('campaign_prospects')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error(`  [ERROR] ${prospect.name} (${prospect.id}): ${error.message}`);
      errorCount++;
    } else {
      console.log(
        `  [OK] ${prospect.name} | ${prospect.sector} | ${prospect.city} | ${prospect.email} | status: ${prospect.status}`
      );
      successCount++;
    }
  }

  console.log(
    `\nDone. ${successCount} upserted, ${errorCount} errors.`
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
