import * as fs from 'fs';
import * as path from 'path';
import { Prospect, SiteConfig, TemplateVariant, Sector, ColorPalette, FontPair, Counter, ProcessStep, SectorDefaults, slugify } from './types';
import { PALETTES, FONT_PAIRS, getPalettesForVariant, getGoogleFontsUrl } from './templates/palettes';
import { getDefaultsForSector } from './templates/sector-defaults';

// ── Constants ────────────────────────────────────────────────────────

const BASE_DIR = __dirname;
const TEMPLATES_DIR = path.join(BASE_DIR, 'templates');
const OUTPUT_DIR = path.join(BASE_DIR, 'output');

// ── Unsplash Stock Images by Sector ─────────────────────────────────
// Real HD images from Unsplash — no local files needed

const SECTOR_IMAGES: Record<Sector, { hero: string; gallery: string[]; about: string }> = {
  beauty: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521590832167-7228f0da2684?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop&q=80',
  },
  food: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop&q=80',
  },
  auto: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80',
  },
  health: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80',
  },
  sport: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80',
  },
  legal: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=600&fit=crop&q=80',
  },
  education: {
    hero: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop&q=80',
  },
  other: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80',
  },
};

const SECTOR_SERVICE_SUBTITLES: Record<Sector, string> = {
  beauty: 'Des prestations sur mesure pour sublimer votre beauté',
  food: 'Une carte pensée avec passion et des produits frais',
  auto: 'Des services complets pour votre véhicule',
  health: 'Des soins de qualité pour votre bien-être',
  sport: 'Des programmes adaptés à tous les niveaux',
  legal: 'Un accompagnement juridique complet',
  education: 'Des formations adaptées à vos objectifs',
  other: 'Des services professionnels de qualité',
};

// ── Hero Split ───────────────────────────────────────────────────────

function generateHeroSplit(name: string, subsector: string): { line1: string; line2: string } {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return { line1: name, line2: subsector };
  }

  // Common prefixes that should stay on line1 alone
  const prefixes = ['chez', 'le', 'la', 'les', 'au', 'aux', 'salon', 'garage', 'cabinet', 'centre', 'studio', 'atelier'];
  const firstLower = words[0].toLowerCase();

  if (prefixes.includes(firstLower) && words.length >= 2) {
    return { line1: words[0], line2: words.slice(1).join(' ') };
  }

  // For short names (2-3 words), split after first word
  if (words.length <= 3) {
    return { line1: words[0], line2: words.slice(1).join(' ') };
  }

  // For longer names, split roughly in half
  const mid = Math.ceil(words.length / 2);
  return { line1: words.slice(0, mid).join(' '), line2: words.slice(mid).join(' ') };
}

// ── Image Helpers ────────────────────────────────────────────────────

import { loadCachedImages, type ProspectImages } from './generate-images';

// Sector icons for legacy template service cards
const SECTOR_ICONS: Record<Sector, string[]> = {
  beauty: ['01', '02', '03', '04', '05', '06'],
  food: ['01', '02', '03', '04', '05', '06'],
  auto: ['01', '02', '03', '04', '05', '06'],
  health: ['01', '02', '03', '04', '05', '06'],
  sport: ['01', '02', '03', '04', '05', '06'],
  legal: ['01', '02', '03', '04', '05', '06'],
  education: ['01', '02', '03', '04', '05', '06'],
  other: ['01', '02', '03', '04', '05', '06'],
};

// Fallback Unsplash images if FAL images not yet generated
const FALLBACK_IMAGES: Record<Sector, ProspectImages> = {
  beauty: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521590832167-7228f0da2684?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop&q=80',
  },
  food: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop&q=80',
  },
  auto: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80',
  },
  health: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80',
  },
  sport: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80',
  },
  legal: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=600&fit=crop&q=80',
  },
  education: {
    hero: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop&q=80',
  },
  other: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop&q=80',
    ],
    about: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80',
  },
};

function loadScrapedPhotos(slug: string): ProspectImages | null {
  const scrapedPath = path.join(OUTPUT_DIR, slug, 'scraped-photos.json');
  if (fs.existsSync(scrapedPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
      // scraped-photos.json has { hero: [], gallery: [], about: [], all: [] }
      const hero = data.hero?.[0] || data.all?.[0];
      const gallery = data.gallery?.length >= 3 ? data.gallery : data.all?.slice(0, 6);
      const about = data.about?.[0] || data.all?.[1] || hero;
      if (hero && gallery?.length >= 3) {
        return { hero, gallery: gallery.slice(0, 6), about };
      }
    } catch { /* ignore parse errors */ }
  }
  return null;
}

function getProspectImages(prospect: Prospect): ProspectImages {
  const slug = prospect.slug || slugify(prospect.name);

  // Priority 1: FAL-generated images (cached in output/{slug}/images.json)
  const cached = loadCachedImages(slug);
  if (cached && cached.hero) {
    return cached;
  }

  // Priority 2: Scraped real photos from websites/Facebook (output/{slug}/scraped-photos.json)
  const scraped = loadScrapedPhotos(slug);
  if (scraped) {
    return scraped;
  }

  // Priority 3: Scraped photos from DB enrichment
  if (prospect.photos_scraped && prospect.photos_scraped.length >= 6) {
    return {
      hero: prospect.photos_scraped[0],
      gallery: prospect.photos_scraped.slice(0, 6),
      about: prospect.photos_scraped[1] || prospect.photos_scraped[0],
    };
  }

  // Priority 4: Unsplash fallback by sector
  return FALLBACK_IMAGES[prospect.sector] || FALLBACK_IMAGES.other;
}

function getHeroImage(prospect: Prospect): string {
  return getProspectImages(prospect).hero;
}

function getGalleryImages(prospect: Prospect, count: number = 6): string[] {
  const imgs = getProspectImages(prospect);
  const gallery = [...imgs.gallery];

  // Fill if needed
  while (gallery.length < count) {
    gallery.push(gallery[gallery.length - 1] || imgs.hero);
  }
  return gallery.slice(0, count);
}

function getAboutImage(prospect: Prospect): string {
  return getProspectImages(prospect).about;
}

// ── Build SiteConfig ─────────────────────────────────────────────────

function buildSiteConfig(
  prospect: Prospect,
  variant: TemplateVariant,
  paletteIndex: number,
  fontIndex: number
): SiteConfig {
  const defaults = getDefaultsForSector(prospect.sector);
  const palettes = getPalettesForVariant(variant);
  const palette = palettes[paletteIndex % palettes.length];
  const fonts = FONT_PAIRS[fontIndex % FONT_PAIRS.length];

  const tagline = defaults.taglines[paletteIndex % defaults.taglines.length];
  const description = prospect.description || `${prospect.name} — ${tagline}. Situé à ${prospect.city}, nous vous accueillons avec passion et professionnalisme.`;

  const galleryImages = getGalleryImages(prospect);
  const aboutImage = getAboutImage(prospect);

  const siteConfig: any = {
    business_name: prospect.name,
    tagline,
    description,
    city: prospect.city,
    sector: prospect.sector,
    subsector: prospect.subsector || (prospect.sector.charAt(0).toUpperCase() + prospect.sector.slice(1)),
    email: prospect.email,
    phone: prospect.phone,
    variant,
    palette,
    fonts,
    hero_image: getHeroImage(prospect),
    gallery_images: galleryImages,
    counters: defaults.counters,
    process_steps: defaults.process_steps,
    testimonial: defaults.testimonial,
    marquee_words: defaults.marquee_words,
    cta_text: defaults.cta_text,
    cta_button: defaults.cta_button,
    nav_links: defaults.nav_links,
    _about_image: aboutImage,
  };

  return siteConfig as SiteConfig;
}

// ── Template-specific HTML generators ────────────────────────────────

function generateNavLinks(links: { label: string; href: string }[]): string {
  return links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join('\n    ');
}

function generateNavLinksList(links: { label: string; href: string }[]): string {
  return links
    .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
    .join('\n      ');
}

function generateMarqueeItems(words: string[]): string {
  // Duplicate for seamless scroll
  const items = [...words, ...words];
  return items
    .map((w) => `<span>${w}</span> <span class="sep">◆</span>`)
    .join(' ');
}

function generateGalleryItems(images: string[], businessName: string): string {
  return images
    .map(
      (img, i) =>
        `<div class="masonry-item"><img src="${img}" alt="${businessName} — Photo ${i + 1}" loading="lazy"></div>`
    )
    .join('\n      ');
}

function generateCounterItems(counters: Counter[]): string {
  return counters
    .map(
      (c) =>
        `<div class="counter-item">
      <div class="counter-num" data-target="${c.value}">${c.value}${c.suffix}</div>
      <div class="counter-label">${c.label}</div>
    </div>`
    )
    .join('\n    ');
}

function generateProcessSteps(steps: ProcessStep[]): string {
  return steps
    .map(
      (s, i) =>
        `<div class="step">
      <div class="step-num">${String(i + 1).padStart(2, '0')}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>`
    )
    .join('\n      ');
}

function generateServiceCards(
  images: string[],
  steps: ProcessStep[],
  sector: Sector,
  variant: TemplateVariant
): string {
  const icons = SECTOR_ICONS[sector] || SECTOR_ICONS.other;

  if (variant === 'warm-amber') {
    return steps
      .map(
        (step, i) =>
          `<div class="card">
      <img src="${images[i] || images[0]}" alt="${step.title}" loading="lazy">
      <div class="card-body">
        <h3>${step.title}</h3>
        <p>${step.description}</p>
      </div>
    </div>`
      )
      .join('\n    ');
  }

  // light-elegant: service cards with icons
  return steps
    .map(
      (step, i) =>
        `<div class="service-card">
      <div class="icon">${icons[i % icons.length]}</div>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    </div>`
    )
    .join('\n    ');
}

function generateStatsItems(counters: Counter[]): string {
  return counters
    .map(
      (c) =>
        `<div class="stat">
      <div class="stat-num" data-target="${c.value}">${c.value}${c.suffix}</div>
      <div class="stat-label">${c.label}</div>
    </div>`
    )
    .join('\n      ');
}

// warm-amber uses .num class
function generateWarmStatsItems(counters: Counter[]): string {
  return counters
    .map(
      (c) =>
        `<div class="stat">
      <div class="num" data-target="${c.value}">${c.value}${c.suffix}</div>
      <div class="stat-label">${c.label}</div>
    </div>`
    )
    .join('\n      ');
}

function generateGalleryImages(images: string[], businessName: string): string {
  return images
    .map(
      (img, i) =>
        `<img src="${img}" alt="${businessName} — Photo ${i + 1}" loading="lazy" class="reveal">`
    )
    .join('\n      ');
}

// ── Render Template ──────────────────────────────────────────────────

function renderTemplate(templateHtml: string, config: SiteConfig): string {
  const heroSplit = generateHeroSplit(config.business_name, config.subsector);
  const descriptionShort =
    config.description.length > 150
      ? config.description.substring(0, 147) + '...'
      : config.description;

  // Common replacements (all templates)
  let html = templateHtml
    .replace(/\{\{BUSINESS_NAME\}\}/g, config.business_name)
    .replace(/\{\{SUBSECTOR\}\}/g, config.subsector)
    .replace(/\{\{CITY\}\}/g, config.city)
    .replace(/\{\{TAGLINE\}\}/g, config.tagline)
    .replace(/\{\{DESCRIPTION\}\}/g, config.description)
    .replace(/\{\{GOOGLE_FONTS_URL\}\}/g, getGoogleFontsUrl(config.fonts))
    .replace(/\{\{COLOR_BG\}\}/g, config.palette.bg)
    .replace(/\{\{COLOR_BG2\}\}/g, config.palette.bg2)
    .replace(/\{\{COLOR_BG3\}\}/g, config.palette.bg3)
    .replace(/\{\{COLOR_ACCENT\}\}/g, config.palette.accent)
    .replace(/\{\{COLOR_TEXT\}\}/g, config.palette.text)
    .replace(/\{\{COLOR_DIM\}\}/g, config.palette.dim)
    .replace(/\{\{COLOR_BORDER\}\}/g, config.palette.border)
    .replace(/\{\{FONT_BODY\}\}/g, config.fonts.body_family)
    .replace(/\{\{FONT_DISPLAY\}\}/g, config.fonts.display_family)
    .replace(/\{\{HERO_IMAGE\}\}/g, config.hero_image)
    .replace(/\{\{HERO_LINE1\}\}/g, heroSplit.line1)
    .replace(/\{\{HERO_LINE2\}\}/g, heroSplit.line2)
    .replace(/\{\{CTA_TEXT\}\}/g, config.cta_text)
    .replace(/\{\{CTA_BUTTON\}\}/g, config.cta_button)
    .replace(/\{\{EMAIL\}\}/g, config.email || 'contact@example.com')
    .replace(/\{\{TESTIMONIAL_QUOTE\}\}/g, config.testimonial?.quote || '')
    .replace(/\{\{TESTIMONIAL_AUTHOR\}\}/g, config.testimonial?.author || '')
    .replace(/\{\{DESCRIPTION_SHORT\}\}/g, descriptionShort)
    .replace(/\{\{PHONE\}\}/g, config.phone || '')
    .replace(/\{\{BG\}\}/g, config.palette.bg)
    .replace(/\{\{BG2\}\}/g, config.palette.bg2)
    .replace(/\{\{BG3\}\}/g, config.palette.bg3)
    .replace(/\{\{ACCENT\}\}/g, config.palette.accent)
    .replace(/\{\{TEXT\}\}/g, config.palette.text)
    .replace(/\{\{DIM\}\}/g, config.palette.dim)
    .replace(/\{\{BORDER\}\}/g, config.palette.border)
    .replace(/\{\{DISPLAY_FONT\}\}/g, config.fonts.display)
    .replace(/\{\{BODY_FONT\}\}/g, config.fonts.body)
    .replace(/\{\{DISPLAY_FAMILY\}\}/g, config.fonts.display_family)
    .replace(/\{\{BODY_FAMILY\}\}/g, config.fonts.body_family);

  // Individual gallery image placeholders (used by new premium templates)
  for (let i = 0; i < 6; i++) {
    const imgUrl = config.gallery_images[i] || config.hero_image;
    html = html.replace(new RegExp(`\\{\\{GALLERY_${i + 1}\\}\\}`, 'g'), imgUrl);
  }

  // Counter individual placeholders
  for (let i = 0; i < 3; i++) {
    const c = config.counters[i] || { value: 0, suffix: '', label: '' };
    html = html
      .replace(new RegExp(`\\{\\{COUNTER_${i + 1}_VALUE\\}\\}`, 'g'), String(c.value))
      .replace(new RegExp(`\\{\\{COUNTER_${i + 1}_SUFFIX\\}\\}`, 'g'), c.suffix)
      .replace(new RegExp(`\\{\\{COUNTER_${i + 1}_LABEL\\}\\}`, 'g'), c.label);
  }

  // Step individual placeholders
  for (let i = 0; i < 3; i++) {
    const s = config.process_steps[i] || { title: '', description: '' };
    html = html
      .replace(new RegExp(`\\{\\{STEP_${i + 1}_TITLE\\}\\}`, 'g'), s.title)
      .replace(new RegExp(`\\{\\{STEP_${i + 1}_DESC\\}\\}`, 'g'), s.description);
  }

  // dark-bold specific
  html = html
    .replace(/\{\{NAV_LINKS\}\}/g, generateNavLinks(config.nav_links))
    .replace(
      /\{\{MARQUEE_WORDS\}\}/g,
      generateMarqueeItems(config.marquee_words)
    )
    .replace(
      /\{\{GALLERY_ITEMS\}\}/g,
      generateGalleryItems(config.gallery_images, config.business_name)
    )
    .replace(/\{\{COUNTER_ITEMS\}\}/g, generateCounterItems(config.counters))
    .replace(
      /\{\{ABOUT_TITLE\}\}/g,
      `${config.business_name} — ${config.subsector}`
    )
    .replace(
      /\{\{ABOUT_IMAGE\}\}/g,
      (config as any)._about_image || config.gallery_images[1] || config.hero_image
    )
    .replace(
      /\{\{PROCESS_STEPS\}\}/g,
      generateProcessSteps(config.process_steps)
    );

  // warm-amber specific
  html = html
    .replace(
      /\{\{NAV_LINKS_LIST\}\}/g,
      generateNavLinksList(config.nav_links)
    )
    .replace(
      /\{\{SERVICE_CARDS\}\}/g,
      generateServiceCards(
        config.gallery_images,
        config.process_steps,
        config.sector,
        config.variant
      )
    )
    .replace(
      /\{\{STATS_ITEMS\}\}/g,
      config.variant === 'warm-amber'
        ? generateWarmStatsItems(config.counters)
        : generateStatsItems(config.counters)
    )
    .replace(
      /\{\{GALLERY_IMAGES\}\}/g,
      generateGalleryImages(config.gallery_images, config.business_name)
    )
    .replace(
      /\{\{EMAIL_DISPLAY\}\}/g,
      config.email || 'Contactez-nous'
    )
    .replace(
      /\{\{PHONE_DISPLAY\}\}/g,
      config.phone || ''
    )
    .replace(
      /\{\{SERVICES_SUBTITLE\}\}/g,
      SECTOR_SERVICE_SUBTITLES[config.sector] || SECTOR_SERVICE_SUBTITLES.other
    );

  // light-elegant specific
  html = html.replace(
    /\{\{SERVICES_TITLE\}\}/g,
    'Ce que nous proposons'
  );

  return html;
}

// ── Main: Generate 3 sites per prospect ──────────────────────────────

export function generateSitesForProspect(prospect: Prospect, prospectIndex: number = 0): string[] {
  const defaults = getDefaultsForSector(prospect.sector);
  const variants = defaults.preferred_variants;
  const slug = prospect.slug || slugify(prospect.name);
  const outputPaths: string[] = [];

  process.stdout.write(`Generating sites for ${prospect.name}...`);

  for (let i = 0; i < 3; i++) {
    const variant = variants[i];
    const paletteIndex = (prospectIndex + i) % 10;
    const fontIndex = (prospectIndex + i) % FONT_PAIRS.length;

    const config = buildSiteConfig(prospect, variant, paletteIndex, fontIndex);

    // Read template
    const templatePath = path.join(TEMPLATES_DIR, `${variant}.html`);
    if (!fs.existsSync(templatePath)) {
      console.error(` [ERROR] Template not found: ${templatePath}`);
      continue;
    }
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    // Render
    const rendered = renderTemplate(templateHtml, config);

    // Write output
    const outDir = path.join(OUTPUT_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, `v${i + 1}.html`);
    fs.writeFileSync(outPath, rendered, 'utf-8');
    outputPaths.push(outPath);

    process.stdout.write(` v${i + 1} ✓`);
  }

  console.log('');
  return outputPaths;
}

// ── Batch Generation ─────────────────────────────────────────────────

export function generateBatch(prospects: Prospect[]): void {
  console.log(`\n=== Generating sites for ${prospects.length} prospects ===\n`);
  let total = 0;

  for (let i = 0; i < prospects.length; i++) {
    const paths = generateSitesForProspect(prospects[i], i);
    total += paths.length;
  }

  console.log(`\n=== Done: ${total} sites generated ===\n`);
}

// ── CLI Entry Point ──────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log("  npx tsx generate-sites.ts --prospect '{\"name\":\"Salon Kantuta\",\"sector\":\"beauty\",\"city\":\"Papeete\",...}'");
    console.log('  npx tsx generate-sites.ts --file data/prospects-enriched.json --index 0');
    console.log('  npx tsx generate-sites.ts --file data/prospects-enriched.json --all');
    process.exit(0);
  }

  const prospectIdx = args.indexOf('--prospect');
  const fileIdx = args.indexOf('--file');

  if (prospectIdx !== -1 && args[prospectIdx + 1]) {
    // Single prospect from JSON string
    try {
      const prospect: Prospect = JSON.parse(args[prospectIdx + 1]);
      if (!prospect.slug) prospect.slug = slugify(prospect.name);
      if (!prospect.photos_scraped) prospect.photos_scraped = [];
      if (!prospect.prototype_urls) prospect.prototype_urls = [];
      const paths = generateSitesForProspect(prospect);
      console.log('Output files:');
      paths.forEach((p) => console.log(`  ${p}`));
    } catch (e) {
      console.error('Invalid JSON for --prospect:', (e as Error).message);
      process.exit(1);
    }
  } else if (fileIdx !== -1 && args[fileIdx + 1]) {
    // From file
    const filePath = path.resolve(args[fileIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const data: Prospect[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const indexArg = args.indexOf('--index');
    const allArg = args.includes('--all');

    if (allArg) {
      generateBatch(data);
    } else if (indexArg !== -1 && args[indexArg + 1] !== undefined) {
      const idx = parseInt(args[indexArg + 1], 10);
      if (idx < 0 || idx >= data.length) {
        console.error(`Index ${idx} out of range (0-${data.length - 1})`);
        process.exit(1);
      }
      const paths = generateSitesForProspect(data[idx], idx);
      console.log('Output files:');
      paths.forEach((p) => console.log(`  ${p}`));
    } else {
      // Default: first prospect
      const paths = generateSitesForProspect(data[0], 0);
      console.log('Output files:');
      paths.forEach((p) => console.log(`  ${p}`));
    }
  } else {
    console.error('Provide --prospect or --file argument');
    process.exit(1);
  }
}

// Run CLI if executed directly
const isDirectExecution =
  typeof require !== 'undefined' && require.main === module;

if (isDirectExecution || process.argv[1]?.endsWith('generate-sites.ts')) {
  main();
}
