// Types for the 100K Site Web mass prospection pipeline

export type Sector = 'beauty' | 'food' | 'auto' | 'health' | 'sport' | 'legal' | 'education' | 'other';
export type ProspectStatus = 'new' | 'enriched' | 'sites_ready' | 'sent' | 'opened' | 'replied' | 'converted' | 'lost';
export type TemplateVariant = 'dark-bold' | 'warm-amber' | 'light-elegant';

export interface Prospect {
  // Identity
  id: string;
  name: string;
  slug: string;
  sector: Sector;
  subsector: string;

  // Location
  address: string | null;
  city: string;
  island: string;
  lat: number | null;
  lng: number | null;

  // Contact (from enrichment)
  email: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;

  // Media (from enrichment)
  logo_url: string | null;
  photos_scraped: string[];
  description: string | null;
  google_rating: number | null;

  // Pipeline
  has_website: boolean;
  enrichment_source: 'firecrawl' | 'camoufox' | 'manual' | null;
  icp_score: number;
  status: ProspectStatus;
  batch: number | null;
  prototype_urls: string[];
  clickup_task_id: string | null;

  // Tracking
  email_sent_at: string | null;
  email_opened_at: string | null;
  replied_at: string | null;

  // Source
  source: string;
  source_url: string | null;
}

export interface SiteConfig {
  // Business
  business_name: string;
  tagline: string;
  description: string;
  city: string;
  sector: Sector;
  subsector: string;

  // Contact
  email: string | null;
  phone: string | null;

  // Design
  variant: TemplateVariant;
  palette: ColorPalette;
  fonts: FontPair;

  // Content
  hero_image: string;
  gallery_images: string[];
  counters: Counter[];
  process_steps: ProcessStep[];
  testimonial: { quote: string; author: string } | null;
  marquee_words: string[];
  cta_text: string;
  cta_button: string;

  // Nav
  nav_links: { label: string; href: string }[];
}

export interface ColorPalette {
  name: string;
  bg: string;
  bg2: string;
  bg3: string;
  accent: string;
  text: string;
  dim: string;
  border: string;
}

export interface FontPair {
  display: string;       // Google Fonts display font
  body: string;          // Google Fonts body font
  display_family: string; // CSS font-family string
  body_family: string;
}

export interface Counter {
  value: number;
  suffix: string;
  label: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface SectorDefaults {
  taglines: string[];
  counters: Counter[];
  process_steps: ProcessStep[];
  marquee_words: string[];
  testimonial: { quote: string; author: string };
  cta_text: string;
  cta_button: string;
  nav_links: { label: string; href: string }[];
  preferred_variants: TemplateVariant[];
}

export interface BatchResult {
  batch_number: number;
  prospects: string[];        // prospect IDs
  sites_generated: number;
  sites_deployed: number;
  emails_sent: number;
  emails_failed: number;
  timestamp: string;
}

// Helper
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

export function computeICPScore(p: Partial<Prospect>): number {
  let score = 0;
  if (p.email) score += 30;
  if (['beauty', 'food', 'auto'].includes(p.sector || '')) score += 20;
  if (p.island === 'Tahiti') score += 15;
  if (p.website) score += 10;
  if (!p.website) score += 15;
  if (p.photos_scraped && p.photos_scraped.length > 0) score += 10;
  return score;
}
