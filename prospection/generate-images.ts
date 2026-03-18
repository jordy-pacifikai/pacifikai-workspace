/**
 * generate-images.ts — FAL nano-banana-2 image generation for prospect sites
 *
 * Generates 8 HD images per prospect:
 *   - 1 hero (16:9, 2K)
 *   - 6 gallery (4:3, 1K)
 *   - 1 about/team (4:3, 1K)
 *
 * Usage:
 *   npx tsx generate-images.ts --prospect '{"name":"Salon Kantuta","sector":"beauty","subsector":"Coiffure","city":"Papeete"}'
 *   npx tsx generate-images.ts --file data/prospects-enriched.json --index 0
 *   npx tsx generate-images.ts --file data/prospects-enriched.json --batch 0-9
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Prospect, Sector } from './types';
import { slugify } from './types';

// ── FAL Config ──────────────────────────────────────────────────────

const FAL_API_KEY = '9102132e-c96f-4bbb-a46e-292df3fb9cf0:9767817e4125b901e283dfb12b8478c7';
const FAL_ENDPOINT = 'https://queue.fal.run/fal-ai/nano-banana-2';
const FAL_EDIT_ENDPOINT = 'https://queue.fal.run/fal-ai/nano-banana-2/edit';

const BASE_DIR = __dirname;
const OUTPUT_DIR = path.join(BASE_DIR, 'output');

// ── Sector-specific prompts ─────────────────────────────────────────

const SECTOR_PROMPTS: Record<Sector, {
  hero: string;
  gallery: string[];
  about: string;
}> = {
  beauty: {
    hero: 'Photo editoriale luxueuse: interieur d\'un salon de beaute haut de gamme a Tahiti, eclairage doux naturel filtrant par de grandes vitres, fauteuils elegants, miroirs dores, plantes tropicales, atmosphere zen et raffinee. Qualite Vogue magazine.',
    gallery: [
      'Photo professionnelle: coiffeuse polynésienne stylisant les cheveux d\'une cliente, geste elegant, salon lumineux, reflets dans le miroir. Style editorial beaute.',
      'Photo macro: produits de beaute premium alignes sur une etagere en marbre blanc, flacons elegants, fleurs de tiare, eclairage studio doux.',
      'Photo interieur: espace de soin facial dans un salon de beaute tropical, lit de massage blanc, serviettes roulees, orchidees, lumiere tamisee relaxante.',
      'Photo professionnelle: mains de manucure travaillant sur des ongles, vernis colore, table de travail elegante, eclairage precis.',
      'Photo ambiance: comptoir d\'accueil d\'un salon de beaute chic, comptoir en bois clair, plantes vertes, bouquets de fleurs tropicales, sourire de bienvenue.',
      'Photo detail: cheveux ondules brillants apres coiffage, reflets dores, fond flou de salon, qualite publicitaire.',
    ],
    about: 'Portrait professionnel: equipe de 3 estheticiennes souriantes en tenue noire elegante, debout devant leur salon de beaute tropical a Tahiti, lumiere doree du coucher de soleil.',
  },
  food: {
    hero: 'Photo gastronomique premium: interieur d\'un restaurant polynesien chaleureux le soir, tables dressees avec nappes blanches, lumieres suspendues chaleureuses, terrasse vue sur le lagon, palmiers, ambiance romantique. Qualite Michelin.',
    gallery: [
      'Photo culinaire haut de gamme: poisson cru a la tahitienne dans un bol en noix de coco, lait de coco, citron vert, oignons, presentation artistique, fond bois tropical.',
      'Photo culinaire: brochettes de mahi-mahi grillees sur un plat en ceramique artisanale, accompagnees de riz et legumes colores, eclairage chaud lateral.',
      'Photo ambiance: bar a cocktails polynesien avec boissons tropicales colorees, verres givres, tranche d\'ananas, comptoir en bambou, lumieres tamisees.',
      'Photo culinaire: dessert tropical, tarte au coco et fruits de la passion, assiette blanche, sauce coulis, micro herbes, presentation gastronomique.',
      'Photo reportage: cuisinier polynesien en action dans sa cuisine ouverte, flammes du grill, geste precis, concentration, arriere-plan de restaurant anime.',
      'Photo ambiance: terrasse de restaurant sous les etoiles a Tahiti, tables eclairees aux bougies, vue sur le lagon nocturne, palmiers silhouettes.',
    ],
    about: 'Portrait professionnel: chef cuisinier polynesien en tenue blanche, bras croises, souriant fierement devant son restaurant a Tahiti, cuisine visible en arriere-plan.',
  },
  auto: {
    hero: 'Photo editoriale: interieur d\'un garage automobile moderne et organise a Tahiti, eclairage LED professionnel, voiture sur pont elevateur, outils ranges, sol epoxy brillant. Propre et professionnel.',
    gallery: [
      'Photo professionnelle: mecanicien concentre diagnostiquant le moteur d\'une voiture avec un outil electronique, eclairage d\'atelier precis.',
      'Photo detail: mains de mecanicien changeant des plaquettes de frein, gants noirs, precision, pieces neuves visibles.',
      'Photo ambiance: zone d\'accueil clients d\'un garage moderne, comptoir propre, ecran affichant les services, atmosphere professionnelle.',
      'Photo reportage: alignement de voitures dans un garage spacieux, pont elevateur, outils professionnels, eclairage industriel.',
      'Photo detail: pneus neufs alignes dans une zone de stockage propre, marques visibles, organisation impeccable.',
      'Photo professionnelle: mecanicien remettant les cles a un client satisfait devant son vehicule repare, sourires, garage en arriere-plan.',
    ],
    about: 'Portrait professionnel: equipe de 4 mecaniciens en uniforme propre, debout devant leur garage a Tahiti, bras croises, sourires confiants, vehicules en arriere-plan.',
  },
  health: {
    hero: 'Photo medicale premium: cabinet medical moderne et lumineux a Tahiti, mobilier blanc, grande fenetre avec vue tropicale, plantes vertes, atmosphere sereine et rassurante. Qualite brochure medicale.',
    gallery: [
      'Photo professionnelle: medecin en consultation avec un patient, bureau moderne, ordinateur, stethoscope, communication bienveillante.',
      'Photo detail: equipement medical moderne dans une salle de consultation lumineuse, ecran, instruments, proprete impeccable.',
      'Photo ambiance: salle d\'attente medicale chaleureuse, sieges confortables, magazines, plantes, reception accueillante.',
      'Photo professionnelle: pharmacie ou laboratoire organise, flacons ranges, eclairage precis, blouse blanche.',
      'Photo detail: mains de soignant avec gants, geste precis de soin, equipement sterile, atmosphere de confiance.',
      'Photo ambiance: facade d\'un cabinet medical a Tahiti, entree accueillante, panneau professionnel, vegetation tropicale.',
    ],
    about: 'Portrait professionnel: equipe medicale de 3 personnes en blouse blanche, souriants, dans leur cabinet a Tahiti, equipement medical moderne en arriere-plan.',
  },
  sport: {
    hero: 'Photo dynamique: interieur d\'une salle de sport moderne a Tahiti, equipements de musculation, sols en caoutchouc, grandes vitres avec vue tropicale, eclairage energique. Atmosphere motivante.',
    gallery: [
      'Photo action: coach sportif polynesien dirigeant une seance de group fitness, energie, mouvement, salle moderne.',
      'Photo ambiance: zone de musculation avec halteres et machines, eclairage motivant, miroirs, sol propre.',
      'Photo action: cours de yoga au lever du soleil sur une terrasse a Tahiti, tapis colores, ocean en arriere-plan, serenite.',
      'Photo detail: equipements de crossfit ranges, cordes, kettlebells, pneus, ambiance raw et intense.',
      'Photo ambiance: espace detente post-entrainement, smoothie bar, fruits tropicaux, atmosphere decontractee.',
      'Photo action: personne faisant du surf ou du paddle a Tahiti, eau turquoise, effort physique, liberte.',
    ],
    about: 'Portrait professionnel: coach sportif polynesien muscle en tenue sportive, souriant, debout dans sa salle de sport a Tahiti, equipements en arriere-plan.',
  },
  legal: {
    hero: 'Photo editoriale: cabinet d\'avocats elegant a Tahiti, bureau en bois noble, etageres de livres juridiques, lumiere naturelle par grandes fenetres, plante verte, atmosphere serieuse et raffinee.',
    gallery: [
      'Photo professionnelle: avocat en reunion avec des clients, documents sur la table, gestes de conseil, bureau elegant.',
      'Photo detail: livres de droit alignes sur une etagere en bois noble, reliures en cuir, eclairage bibliotheque.',
      'Photo ambiance: salle de reunion d\'un cabinet juridique, table ovale, chaises en cuir, ecran de presentation.',
      'Photo detail: signature de document juridique, stylo elegant, mains professionnelles, papier officiel.',
      'Photo ambiance: accueil d\'un cabinet d\'avocats, secretaire souriante, mobilier professionnel, discret et rassurant.',
      'Photo editoriale: facade d\'un cabinet d\'avocats a Tahiti, plaque professionnelle, entree elegante, architecture coloniale.',
    ],
    about: 'Portrait professionnel: avocat en costume sombre, debout dans son cabinet a Tahiti, livres de droit en arriere-plan, regard confiant et bienveillant.',
  },
  education: {
    hero: 'Photo lumineuse: salle de classe moderne a Tahiti, bureau de professeur, tableau interactif, chaises colorees, grande fenetre avec vue tropicale, atmosphere studieuse et accueillante.',
    gallery: [
      'Photo reportage: professeur enseignant a des eleves attentifs, tableau blanc, interaction dynamique, salle lumineuse.',
      'Photo ambiance: bibliotheque scolaire avec etageres de livres, espace lecture confortable, lumiere naturelle, plantes.',
      'Photo action: eleves travaillant sur ordinateurs portables, salle informatique moderne, concentration.',
      'Photo ambiance: cour d\'ecole tropicale a Tahiti, arbres, bancs, eleves discutant, atmosphere detendue.',
      'Photo detail: fournitures scolaires colorees sur un bureau, cahiers, crayons, creativite.',
      'Photo evenement: ceremonie de remise de diplomes, toges, sourires, fierte, drapeaux polynesiens.',
    ],
    about: 'Portrait professionnel: equipe pedagogique souriante devant leur etablissement a Tahiti, tenues professionnelles, batiment scolaire en arriere-plan.',
  },
  other: {
    hero: 'Photo editoriale: espace de bureau moderne et lumineux a Tahiti, mobilier contemporain, grandes fenetres avec vue tropicale, plantes vertes, atmosphere professionnelle et accueillante.',
    gallery: [
      'Photo professionnelle: reunion d\'equipe dans un bureau moderne, discussion animee, ordinateurs, tableau blanc.',
      'Photo ambiance: espace de coworking tropical, bureaux partages, plantes, lumiere naturelle, productivite.',
      'Photo detail: poignee de main professionnelle, accord commercial, bureau elegant en arriere-plan.',
      'Photo ambiance: facade d\'un commerce professionnel a Tahiti, enseigne, entree accueillante, vegetation.',
      'Photo reportage: professionnel au telephone dans son bureau, geste explicatif, ecran d\'ordinateur, concentration.',
      'Photo ambiance: salle de conference avec vue sur le lagon, presentation en cours, audience attentive.',
    ],
    about: 'Portrait professionnel: chef d\'entreprise polynesien en tenue business casual, souriant dans son bureau a Tahiti, plantes et vue tropicale en arriere-plan.',
  },
};

// ── FAL API Helpers ─────────────────────────────────────────────────

interface FalImage {
  url: string;
  content_type: string;
}

interface FalResponse {
  images: FalImage[];
  seed: number;
}

interface FalQueueResponse {
  status_url: string;
  response_url: string;
  request_id: string;
}

async function submitToFal(prompt: string, aspectRatio: string, resolution: string, referenceImageUrl?: string): Promise<FalQueueResponse> {
  const endpoint = referenceImageUrl ? FAL_EDIT_ENDPOINT : FAL_ENDPOINT;

  const payload: Record<string, unknown> = {
    prompt,
    num_images: 1,
    aspect_ratio: aspectRatio,
    resolution,
    output_format: 'jpeg',
    safety_tolerance: 4,
    negative_prompt: 'flou, basse qualite, moche, filigrane, texte anglais, english text, watermark, logo, deformed',
  };

  if (referenceImageUrl) {
    payload.image_urls = [referenceImageUrl];
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FAL queue error (${res.status}): ${err}`);
  }

  return res.json();
}

async function pollFalResult(queueData: FalQueueResponse, maxWait: number = 120000): Promise<FalResponse> {
  const start = Date.now();
  const statusUrl = queueData.status_url;
  const responseUrl = queueData.response_url;

  while (Date.now() - start < maxWait) {
    // Check status first
    const statusRes = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${FAL_API_KEY}` },
    });

    if (!statusRes.ok) {
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

    const status = await statusRes.json();

    if (status.status === 'COMPLETED') {
      // Now fetch the result
      const resultRes = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      });

      if (resultRes.ok) {
        return resultRes.json();
      }

      const err = await resultRes.text();
      throw new Error(`FAL result fetch error (${resultRes.status}): ${err}`);
    }

    if (status.status === 'FAILED') {
      throw new Error(`FAL generation failed: ${JSON.stringify(status)}`);
    }

    // Still IN_QUEUE or IN_PROGRESS — wait and retry
    await new Promise(r => setTimeout(r, 3000));
  }

  throw new Error('FAL generation timed out');
}

async function generateImage(prompt: string, aspectRatio: string = '4:3', resolution: string = '1K', referenceImageUrl?: string): Promise<string> {
  const queue = await submitToFal(prompt, aspectRatio, resolution, referenceImageUrl);
  const result = await pollFalResult(queue);

  if (!result.images || result.images.length === 0) {
    throw new Error('FAL returned no images');
  }

  return result.images[0].url;
}

// ── Load scraped photos for /edit reference ─────────────────────────

interface ScrapedPhotos {
  hero: string[];
  gallery: string[];
  about: string[];
  all: string[];
  cover_photo?: string[];
  profile_picture?: string[];
}

/** Filter URLs to keep only direct image URLs (fbcdn, googleusercontent, .jpg, .png, .webp) */
function isDirectImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  // Facebook CDN direct images
  if (url.includes('fbcdn.net')) return true;
  // Google images
  if (url.includes('googleusercontent.com')) return true;
  // Direct image file extensions
  if (/\.(jpe?g|png|webp|gif|bmp|avif)(\?|$)/i.test(url)) return true;
  // fal.media generated images
  if (url.includes('fal.media')) return true;
  // Reject facebook.com/photo pages, generic URLs without image extension
  return false;
}

function loadScrapedPhotosForEdit(slug: string): ScrapedPhotos | null {
  const scrapedPath = path.join(OUTPUT_DIR, slug, 'scraped-photos.json');
  if (!fs.existsSync(scrapedPath)) return null;

  try {
    const data = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
    const filterImgs = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return arr && typeof arr === 'string' && isDirectImageUrl(arr) ? [arr] : [];
      return arr.filter(isDirectImageUrl);
    };
    return {
      hero: filterImgs(data.hero),
      gallery: filterImgs(data.gallery),
      about: filterImgs(data.about),
      all: filterImgs(data.all),
      cover_photo: filterImgs(data.cover_photo),
      profile_picture: filterImgs(data.profile_picture),
    };
  } catch {
    return null;
  }
}

// ── Main Generation ─────────────────────────────────────────────────

export interface ProspectImages {
  hero: string;
  gallery: string[];
  about: string;
}

export async function generateImagesForProspect(prospect: Partial<Prospect>): Promise<ProspectImages> {
  const sector = prospect.sector || 'other';
  const name = prospect.name || 'Business';
  const city = prospect.city || 'Papeete';
  const subsector = prospect.subsector || '';
  const slug = prospect.slug || slugify(name);

  const prompts = SECTOR_PROMPTS[sector] || SECTOR_PROMPTS.other;
  const scraped = loadScrapedPhotosForEdit(slug);
  const hasRefs = scraped && scraped.all.length > 0;

  const personalize = (p: string) => {
    return p
      .replace(/a Tahiti/g, `a ${city}, Tahiti`)
      .replace(/polynesien/g, `polynesien de ${city}`);
  };

  console.log(`\n🎨 Generating images for ${name} (${sector}/${subsector}, ${city})`);
  if (hasRefs) {
    console.log(`   📸 Using ${scraped!.all.length} scraped photos as /edit references`);
  } else {
    console.log(`   🖌️  Text-to-image (no scraped photos found)`);
  }
  console.log('   JPEG output, 1K resolution for fast loading\n');

  const images: ProspectImages = {
    hero: '',
    gallery: [],
    about: '',
  };

  // Pick reference images from scraped data
  const heroRef = hasRefs
    ? (scraped!.cover_photo?.[0] || scraped!.hero[0] || scraped!.all[0])
    : undefined;
  const aboutRef = hasRefs
    ? (scraped!.about[0] || scraped!.profile_picture?.[0] || scraped!.all[1] || scraped!.all[0])
    : undefined;
  const galleryRefs = hasRefs ? scraped!.gallery.slice(0, 6) : [];
  // Pad gallery refs from all if not enough
  if (hasRefs && galleryRefs.length < 6) {
    const remaining = scraped!.all.filter(url => url !== heroRef && url !== aboutRef && !galleryRefs.includes(url));
    while (galleryRefs.length < 6 && remaining.length > 0) {
      galleryRefs.push(remaining.shift()!);
    }
  }

  // Hero — 16:9, 1K (was 2K — optimized for speed)
  const heroLabel = heroRef ? 'Hero (16:9, /edit)' : 'Hero (16:9, txt2img)';
  process.stdout.write(`   [1/8] ${heroLabel}...`);
  try {
    const enhancePrompt = heroRef
      ? `Professional premium photo of ${name}, ${subsector || sector} business in ${city}, Tahiti. ${personalize(prompts.hero)} Enhance lighting, colors, and composition. Keep the original subject and setting.`
      : personalize(prompts.hero);
    images.hero = await generateImage(enhancePrompt, '16:9', '1K', heroRef);
    console.log(' ✓');
  } catch (e) {
    console.log(` ✗ ${(e as Error).message}`);
    images.hero = '';
  }

  // Gallery — 6 images, 4:3, 1K
  for (let i = 0; i < 6; i++) {
    const ref = galleryRefs[i] || undefined;
    const label = ref ? `Gallery ${i + 1} (/edit)` : `Gallery ${i + 1} (txt2img)`;
    process.stdout.write(`   [${i + 2}/8] ${label}...`);
    try {
      const enhancePrompt = ref
        ? `Professional premium photo of ${name}, ${subsector || sector} in ${city}, Tahiti. ${personalize(prompts.gallery[i])} Enhance quality, lighting, and colors. Keep the original subject.`
        : personalize(prompts.gallery[i]);
      const url = await generateImage(enhancePrompt, '4:3', '1K', ref);
      images.gallery.push(url);
      console.log(' ✓');
    } catch (e) {
      console.log(` ✗ ${(e as Error).message}`);
      images.gallery.push('');
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // About — 4:3, 1K
  const aboutLabel = aboutRef ? 'About (/edit)' : 'About (txt2img)';
  process.stdout.write(`   [8/8] ${aboutLabel}...`);
  try {
    const enhancePrompt = aboutRef
      ? `Professional portrait photo of the team at ${name}, ${subsector || sector} in ${city}, Tahiti. ${personalize(prompts.about)} Enhance quality, lighting, warmth. Keep the original people and setting.`
      : personalize(prompts.about);
    images.about = await generateImage(enhancePrompt, '4:3', '1K', aboutRef);
    console.log(' ✓');
  } catch (e) {
    console.log(` ✗ ${(e as Error).message}`);
    images.about = '';
  }

  // Save URLs to JSON for reuse
  const outDir = path.join(OUTPUT_DIR, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const imagesPath = path.join(outDir, 'images.json');
  fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));
  console.log(`\n   ✅ Images saved to ${imagesPath}`);

  return images;
}

// ── Load cached images if they exist ────────────────────────────────

export function loadCachedImages(slug: string): ProspectImages | null {
  const imagesPath = path.join(OUTPUT_DIR, slug, 'images.json');
  if (fs.existsSync(imagesPath)) {
    try {
      return JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

// ── CLI Entry ───────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log("  npx tsx generate-images.ts --prospect '{\"name\":\"Salon Kantuta\",\"sector\":\"beauty\",\"subsector\":\"Coiffure\",\"city\":\"Papeete\"}'");
    console.log('  npx tsx generate-images.ts --file data/prospects-enriched.json --index 0');
    console.log('  npx tsx generate-images.ts --file data/prospects-enriched.json --batch 0-9');
    process.exit(0);
  }

  const prospectIdx = args.indexOf('--prospect');
  const fileIdx = args.indexOf('--file');

  if (prospectIdx !== -1 && args[prospectIdx + 1]) {
    const prospect = JSON.parse(args[prospectIdx + 1]);
    if (!prospect.slug) prospect.slug = slugify(prospect.name);
    await generateImagesForProspect(prospect);
  } else if (fileIdx !== -1 && args[fileIdx + 1]) {
    const filePath = path.resolve(args[fileIdx + 1]);
    const data: Prospect[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const batchIdx = args.indexOf('--batch');
    const indexIdx = args.indexOf('--index');

    const force = args.includes('--force');

    if (batchIdx !== -1 && args[batchIdx + 1]) {
      const [start, end] = args[batchIdx + 1].split('-').map(Number);
      for (let i = start; i <= Math.min(end, data.length - 1); i++) {
        const slug = data[i].slug || slugify(data[i].name);
        if (!force) {
          const cached = loadCachedImages(slug);
          if (cached && cached.hero) {
            console.log(`⏩ Skipping ${data[i].name} — images already cached (use --force to regenerate)`);
            continue;
          }
        }
        await generateImagesForProspect(data[i]);
      }
    } else if (indexIdx !== -1 && args[indexIdx + 1] !== undefined) {
      const idx = parseInt(args[indexIdx + 1], 10);
      await generateImagesForProspect(data[idx]);
    } else {
      await generateImagesForProspect(data[0]);
    }
  }
}

if (process.argv[1]?.endsWith('generate-images.ts')) {
  main().catch(console.error);
}
