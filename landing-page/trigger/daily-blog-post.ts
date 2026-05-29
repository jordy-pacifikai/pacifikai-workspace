import { schedules, task, retry, logger } from '@trigger.dev/sdk';
import { z } from 'zod';

// ─── Constants ───────────────────────────────────────────────────────
const AIRTABLE_BASE_ID = 'appF7pltUaQkOlKM5';
const AIRTABLE_BLOG_TABLE = 'tbllQuhvHL2Utu8mk';
const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
const BLOG_BASE_URL = 'https://pacifikai.com/blog/';

// ─── Airtable Helpers ────────────────────────────────────────────────

async function airtableFetch(path: string, options: RequestInit = {}) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error('AIRTABLE_API_KEY not set');

  const url = path.startsWith('http') ? path : `${AIRTABLE_BASE_URL}/${path}`;
  const resp = await retry.fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    retry: { timeout: { maxAttempts: 3 } },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Airtable ${resp.status}: ${body}`);
  }
  return resp.json();
}

// ─── Find Research_Veille table ID ──────────────────────────────────

async function getResearchVeilleTableId(): Promise<string> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error('AIRTABLE_API_KEY not set');

  const resp = await retry.fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    { headers: { Authorization: `Bearer ${apiKey}` }, retry: { timeout: { maxAttempts: 3 } } }
  );

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Airtable Meta API ${resp.status}: ${body}`);
  }

  const data = await resp.json() as { tables: Array<{ id: string; name: string }> };
  const table = data.tables.find(
    (t) => t.name === 'Research_Veille' || t.name === 'Veille' || t.name.includes('Veille')
  );

  if (!table) {
    throw new Error(
      `Research_Veille table not found. Available: ${data.tables.map((t) => t.name).join(', ')}`
    );
  }

  logger.info(`Found Research_Veille table: ${table.name} (${table.id})`);
  return table.id;
}

// ─── Step 1: Pick a subject ──────────────────────────────────────────

interface VeilleSubject {
  recordId: string;
  subject: string;
  sources: string[];
  category: string;
  keywords: string[];
}

async function pickSubject(): Promise<VeilleSubject | null> {
  const tableId = await getResearchVeilleTableId();
  const formula = encodeURIComponent(`{Status}="New"`);
  const sort = `sort[0][field]=Found_Date&sort[0][direction]=asc`;
  const data = await airtableFetch(
    `${tableId}?filterByFormula=${formula}&${sort}&maxRecords=1`
  );

  if (!data.records || data.records.length === 0) {
    return null;
  }

  const r = data.records[0];
  const fields = r.fields as Record<string, unknown>;

  // Parse source URLs — could be a comma-separated string or array
  let sources: string[] = [];
  const rawSources = fields.Source_URLs || fields.Sources || fields.URLs || '';
  if (Array.isArray(rawSources)) {
    sources = rawSources;
  } else if (typeof rawSources === 'string' && rawSources.trim()) {
    sources = rawSources.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    recordId: r.id,
    subject: (fields.Topic || fields.Subject || fields.Sujet || fields.Title || fields.Name || '') as string,
    sources,
    category: (fields.Category || fields.Categorie || '') as string,
    keywords: Array.isArray(fields.Keywords)
      ? fields.Keywords
      : typeof fields.Keywords === 'string'
        ? fields.Keywords.split(',').map((k: string) => k.trim())
        : [],
  };
}

// ─── Step 2: Scrape sources ──────────────────────────────────────────

async function scrapeSources(urls: string[], subject: string): Promise<string> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not set');

  // If no URLs, search for content
  let targetUrls = urls.slice(0, 3);
  if (targetUrls.length === 0) {
    logger.info(`No source URLs — searching Firecrawl for: ${subject}`);
    const searchResp = await retry.fetch(
      'https://api.firecrawl.dev/v1/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${subject} intelligence artificielle entreprise`,
          limit: 3,
        }),
        retry: { timeout: { maxAttempts: 3 } },
      }
    );

    if (searchResp.ok) {
      const searchData = await searchResp.json() as {
        success: boolean;
        data: Array<{ url: string; markdown?: string }>;
      };
      if (searchData.success && searchData.data?.length > 0) {
        // Search results already include content
        const contents = searchData.data
          .map((r) => r.markdown || '')
          .filter(Boolean)
          .join('\n\n---\n\n');
        if (contents.length > 200) {
          logger.info(`Got ${searchData.data.length} search results with content`);
          return contents.slice(0, 15000);
        }
        targetUrls = searchData.data.map((r) => r.url);
      }
    }
  }

  if (targetUrls.length === 0) {
    logger.warn('No sources found — article will be generated from Claude knowledge only');
    return '';
  }

  // Scrape each URL
  const results: string[] = [];
  for (const url of targetUrls) {
    try {
      logger.info(`Scraping: ${url}`);
      const resp = await retry.fetch(
        'https://api.firecrawl.dev/v1/scrape',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
          retry: { timeout: { maxAttempts: 2 } },
        }
      );

      if (resp.ok) {
        const data = await resp.json() as {
          success: boolean;
          data: { markdown?: string };
        };
        if (data.success && data.data?.markdown) {
          results.push(data.data.markdown.slice(0, 5000));
        }
      }
    } catch (err) {
      logger.warn(`Failed to scrape ${url}: ${err}`);
    }
  }

  return results.join('\n\n---\n\n');
}

// ─── Step 3: Generate article ────────────────────────────────────────

interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readingTime: number;
  metaDescription: string;
}

async function generateArticle(
  subject: string,
  scrapedContent: string,
  subjectCategory: string
): Promise<GeneratedArticle> {
  // Article generation via Claude Sonnet 4.6 (OpenRouter) — best quality FR + knowledge à jour
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) throw new Error('OPENROUTER_API_KEY not set');

  // ─── CONTEXTE TEMPOREL DYNAMIQUE ─────────────────────────────────────
  // CRITIQUE : DeepSeek a une knowledge cutoff dans le passé et écrit "en 2024" par défaut.
  // On injecte la date courante explicitement pour éviter les articles obsolètes le jour de publication.
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.toLocaleDateString('fr-FR', { month: 'long', timeZone: 'Pacific/Tahiti' });
  const currentDateFr = now.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Pacific/Tahiti',
  });

  const systemPrompt = `Tu es le rédacteur du blog PACIFIK'AI, une agence d'automatisation IA basée en Polynésie française (Tahiti).

═══ DATE DE PUBLICATION (CRITIQUE) ═══
Nous sommes le **${currentDateFr}**. L'année courante est **${currentYear}**. Le mois est **${currentMonth} ${currentYear}**.

RÈGLE TEMPORELLE ABSOLUE :
- JAMAIS écrire "en 2024", "en 2025" ou toute année antérieure à ${currentYear} comme si c'était l'année actuelle ou future. C'est du passé.
- Pour parler du présent → écris "en ${currentYear}", "aujourd'hui", "actuellement", "${currentMonth} ${currentYear}".
- Pour parler de l'historique → contextualise : "depuis 2022", "lancé en 2023", "historiquement", "il y a 2 ans".
- Si le SUJET ou les SOURCES mentionnent "2024" ou "2025" comme année courante → REMETS À JOUR vers "${currentYear}". Le contenu doit refléter ${currentYear}, pas du contenu daté.
- Le slug et le titre NE DOIVENT JAMAIS contenir "2024", "2025" ou autre année passée. Si tu mentionnes une année dans le titre, c'est ${currentYear}.
- Tendances, stats, prévisions : si la source dit "en 2024 X%", reformule "en ${currentYear}, plusieurs études rapportent que X%" ou supprime la précision si non vérifiable.

STYLE
- Français impeccable, professionnel mais accessible, ton direct sans bullshit marketing
- ~800 mots, articles PRATIQUES avec conseils actionnables (pas de théorie abstraite)
- Mentionne "Polynésie française" ou "Tahiti" 1× naturellement pour le SEO local

RÈGLE ABSOLUE — VÉRACITÉ :
Tu n'INVENTES JAMAIS de faits. Si un chiffre, une stat, une étude, un nom d'entreprise, ou un cas d'usage n'apparaît PAS dans les sources fournies, tu ne l'écris PAS. Préfère :
- "Plusieurs entreprises rapportent que..." plutôt qu'un faux "73% des entreprises..."
- Un exemple générique "un acteur du retail" plutôt qu'inventer "Carrefour a gagné 8M€..."
- Des conseils méthodologiques plutôt que des fausses success stories chiffrées
Si les sources sont vides ou pauvres, écris un article méthodologique (étapes, pratiques, questions à se poser) au lieu de meubler avec des inventions.`;

  const userPrompt = `DATE D'AUJOURD'HUI : ${currentDateFr} (année ${currentYear})

SUJET : "${subject}"
${subjectCategory ? `\nCATÉGORIE : ${subjectCategory}` : ''}

${scrapedContent ? `SOURCES DE RÉFÉRENCE (utilise CES faits-là uniquement, paraphrase, ne copie pas) :
NOTE : si les sources mentionnent "en 2024" ou "en 2025" comme année courante, c'est du contenu OBSOLÈTE. Reformule au présent ${currentYear} ou retire la précision temporelle.
---
${scrapedContent.slice(0, 12000)}
---` : `SOURCES : aucune source scrappée disponible.
→ Écris un article MÉTHODOLOGIQUE (étapes, pratiques, framework, questions à se poser).
→ N'INVENTE PAS de chiffres, d'études, de noms d'entreprises, de cas concrets datés.
→ Reste en généralités vérifiables et concepts génériques.
→ Si tu mentionnes une année, c'est ${currentYear} (pas 2024, pas 2025).`}

Réponds UNIQUEMENT avec un objet JSON valide (pas de bloc markdown), structure exacte :
{
  "title": "Titre accrocheur, factuel, ~70 caractères",
  "slug": "titre-en-minuscule-avec-tirets",
  "excerpt": "Résumé en 1-2 phrases (max 160 caractères)",
  "content": "<h2>...</h2><p>...</p>... (HTML, ~800 mots, h2 h3 p ul li strong em — PAS de h1)",
  "category": "IA | Automatisation | Tendances IA | Guides Pratiques | Cas Concrets | Education | Focus Polynésie | Actualités IA | Opinion",
  "reading_time": 4,
  "meta_description": "Description SEO (max 155 caractères)"
}

CONTRAINTES :
- Slug : minuscules, chiffres, tirets uniquement. JAMAIS d'année passée dans le slug ("2024", "2025" interdits). Si année nécessaire → "${currentYear}".
- Title : JAMAIS d'année passée. Si année nécessaire → "${currentYear}". JAMAIS de "en 2024" ou "en 2025" dans le titre.
- Category : EXACTEMENT une valeur ci-dessus (accents inclus)
- reading_time : ENTIER (4, pas "4 min")
- JAMAIS de comparatif "X vs Y" entre concurrents nommés
- JAMAIS de faux chiffres ("87% des PME...", "Étude Gartner 2024...") sans source explicite ci-dessus
- JAMAIS de fausses citations ni de faux noms de dirigeants
- Si tu doutes d'un fait → reformule en généralité ou supprime`;

  const resp = await retry.fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pacifikai.com',
      'X-Title': 'PACIFIK\'AI Blog Cron',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.6',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
    retry: { timeout: { maxAttempts: 3 } },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`OpenRouter (Claude Sonnet 4.6) ${resp.status}: ${body}`);
  }

  const data = await resp.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices?.[0]?.message?.content || '';

  // Parse JSON — handle potential markdown code blocks
  const cleaned = text.replace(/^```json?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  // ─── DEFENSE IN DEPTH — sanitise stale years in title/slug ──────────
  // Even with the prompt rule, DeepSeek occasionally leaks "en 2024" / "2024" into title/slug.
  // Strip any year that's strictly older than currentYear from title and slug to avoid stale posts.
  const staleYearPattern = /\b(20[0-2]\d)\b/g;
  let cleanTitle: string = parsed.title || '';
  cleanTitle = cleanTitle.replace(staleYearPattern, (m: string) => {
    const y = parseInt(m, 10);
    return y < currentYear ? String(currentYear) : m;
  });
  // Also remove patterns like "en 2024 ?" → "en {currentYear} ?", "en 2024 :" → "en {currentYear} :"
  cleanTitle = cleanTitle.replace(/\ben (20\d\d)\b/gi, (_m: string, y: string) => {
    return parseInt(y, 10) < currentYear ? `en ${currentYear}` : _m;
  });

  let cleanSlug: string = (parsed.slug || '').replace(/[^a-z0-9-]/g, '').slice(0, 80);
  cleanSlug = cleanSlug.replace(staleYearPattern, (m: string) => {
    const y = parseInt(m, 10);
    return y < currentYear ? String(currentYear) : m;
  });

  if (cleanTitle !== parsed.title) {
    logger.warn(`Title sanitised for stale year: "${parsed.title}" → "${cleanTitle}"`);
  }
  if (cleanSlug !== (parsed.slug || '')) {
    logger.warn(`Slug sanitised for stale year: "${parsed.slug}" → "${cleanSlug}"`);
  }

  return {
    title: cleanTitle,
    slug: cleanSlug,
    excerpt: parsed.excerpt,
    content: parsed.content,
    category: parsed.category || 'IA',
    readingTime: typeof parsed.reading_time === 'number'
      ? parsed.reading_time
      : parseInt(String(parsed.reading_time || '4').replace(/\D/g, ''), 10) || 4,
    metaDescription: parsed.meta_description || parsed.excerpt,
  };
}

// ─── Step 3b: Generate hero image (Nano Banana Pro via FAL.ai) ───────

async function generateHeroImage(article: GeneratedArticle): Promise<string | null> {
  const falKey = process.env.FAL_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!falKey || !supabaseUrl || !supabaseKey) {
    logger.warn('FAL_API_KEY/SUPABASE env vars missing — skipping hero image');
    return null;
  }

  // Strip HTML + extract first ~300 chars of article body to inform the visual brief
  const bodyPlain = article.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);

  const prompt = `Cinematic photorealistic editorial hero image, 16:9 wide, for a French Polynesian AI agency blog.

═══ ARTICLE CONTEXT (your job: interpret this into a visual metaphor that HOOKS the reader) ═══
TITLE: "${article.title}"
EXCERPT: ${article.excerpt}
OPENING: ${bodyPlain}

═══ CRITICAL — VISUAL HOOK MANDATORY ═══
This image must stop the thumb mid-scroll on Facebook. Not a generic tropical postcard. It must:
1. Have ONE clear focal point a viewer immediately understands (a metaphor of the article's KEY insight, not just its topic)
2. Tell a micro-story: tension, transformation, or surprising juxtaposition (e.g. ancient + future, small + vast, fragile + powerful)
3. Make the viewer curious enough to read the headline overlay

Example metaphors that work for AI topics:
- "Choosing the right LLM" → 3 different glowing artefacts on a pirogue, the captain reaches for one
- "AI reducing carbon footprint" → coral reef visibly regenerating around a softly humming underwater data node
- "Chatbot serving 60% of bookings" → a single warm-lit reception bungalow with a queue of golden light-trails (each = a guest)
- "Generative AI 200B market" → a fisherman pulling up a net full of glowing gold particles instead of fish

DO NOT default to "person + lagoon + hologram floating above hand" if the article is not about choices/decisions.
The metaphor must match THIS article's actual angle, not a template.

═══ BRAND VISUAL DNA (always present, but as SETTING, not subject) ═══
- French Polynesian landscape: turquoise lagoon, volcanic mountains, palm trees, coral reefs, or aerial island view
- Twilight / blue hour atmosphere: deep navy-cyan sky, dark teal ocean
- Warm golden accent lights (lanterns, bungalows, embers) — scattered, never dominant
- Subtle tech element integrated naturally (glowing wireframe, holographic gold, neon teal data lines) — only if the metaphor calls for it

═══ STYLE ═══
- Photorealistic editorial photography, National Geographic / Apple film campaign quality
- Cinematic depth of field, atmospheric haze, volumetric light
- Color palette: deep teal/cyan (#0B3D4A → #14b8a6) dominant + warm gold/amber (#F5C542 → #f97066) accents
- Composition with breathing room (top OR bottom) for headline overlay
- High dynamic range, soft contrast, premium feel

═══ STRICT EXCLUSIONS ═══
- NO text, words, letters, logos in the image
- NO abstract 3D designy renders, NO geometric primitives floating in void
- NO human faces close-up (silhouettes / hands fine)
- NO stock-photo clichés (gears, robots, anatomical brains, light bulbs, generic data charts, glowing globes)
- NO pure duotone graphic design — must be a real photographic scene

Generate the image now.`;

  // 1. Submit to FAL queue
  const submitResp = await retry.fetch('https://queue.fal.run/fal-ai/nano-banana-pro', {
    method: 'POST',
    headers: {
      Authorization: `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '16:9',
      num_images: 1,
    }),
    retry: { timeout: { maxAttempts: 2 } },
  });

  if (!submitResp.ok) {
    logger.error(`FAL submit failed: ${submitResp.status} ${await submitResp.text()}`);
    return null;
  }

  const submitData = await submitResp.json() as {
    request_id: string;
    status_url: string;
    response_url: string;
  };
  logger.info(`FAL request queued: ${submitData.request_id}`);

  // 2. Poll status until COMPLETED (max ~60s)
  let attempts = 0;
  const maxAttempts = 20;
  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusResp = await retry.fetch(submitData.status_url, {
      headers: { Authorization: `Key ${falKey}` },
      retry: { timeout: { maxAttempts: 2 } },
    });
    if (statusResp.ok) {
      const s = await statusResp.json() as { status: string };
      if (s.status === 'COMPLETED') break;
      if (s.status === 'FAILED') {
        logger.error('FAL generation FAILED');
        return null;
      }
    }
    attempts++;
  }
  if (attempts >= maxAttempts) {
    logger.error('FAL generation timed out');
    return null;
  }

  // 3. Fetch result + download image
  const resultResp = await retry.fetch(submitData.response_url, {
    headers: { Authorization: `Key ${falKey}` },
    retry: { timeout: { maxAttempts: 2 } },
  });
  if (!resultResp.ok) {
    logger.error(`FAL result fetch failed: ${resultResp.status}`);
    return null;
  }
  const resultData = await resultResp.json() as {
    images?: Array<{ url: string; content_type?: string }>;
  };
  const falImageUrl = resultData.images?.[0]?.url;
  if (!falImageUrl) {
    logger.error('FAL result missing image URL');
    return null;
  }
  const mimeType = resultData.images?.[0]?.content_type || 'image/png';
  const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';

  const dlResp = await retry.fetch(falImageUrl, { retry: { timeout: { maxAttempts: 2 } } });
  if (!dlResp.ok) {
    logger.error(`FAL CDN download failed: ${dlResp.status}`);
    return null;
  }
  const buffer = Buffer.from(await dlResp.arrayBuffer());

  // Upload to Supabase Storage
  const objectPath = `${article.slug}.${ext}`;
  const uploadResp = await retry.fetch(
    `${supabaseUrl}/storage/v1/object/blog-images/${objectPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer,
      retry: { timeout: { maxAttempts: 2 } },
    }
  );

  if (!uploadResp.ok) {
    logger.error(`Supabase upload failed: ${uploadResp.status} ${await uploadResp.text()}`);
    return null;
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${objectPath}`;
  logger.info(`Hero image uploaded: ${publicUrl}`);
  return publicUrl;
}

// ─── Step 4: Write to Supabase ───────────────────────────────────────

async function writeArticle(article: GeneratedArticle, heroImage: string | null): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
  }

  const now = new Date().toISOString();

  const row = {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    status: 'published',
    publish_date: now,
    reading_time: article.readingTime,
    meta_description: article.metaDescription,
    image_url: heroImage,
  };

  // Upsert by slug (idempotent if cron fires twice for same subject)
  const resp = await retry.fetch(
    `${supabaseUrl}/rest/v1/blog_articles?on_conflict=slug`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify([row]),
      retry: { timeout: { maxAttempts: 3 } },
    }
  );

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Supabase ${resp.status}: ${body}`);
  }

  const rows = (await resp.json()) as Array<{ id: string }>;
  const recordId = rows[0]?.id || article.slug;
  logger.info(`Article written to Supabase: ${recordId}`);
  return recordId;
}

// ─── Step 5: Mark subject as Used ────────────────────────────────────

async function markSubjectUsed(recordId: string): Promise<void> {
  const veilleTableId = await getResearchVeilleTableId();
  await airtableFetch(`${veilleTableId}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: { Status: 'Used' },
    }),
  });
  logger.info(`Subject ${recordId} marked as Used`);
}

// ─── Step 6: Post to Facebook ────────────────────────────────────────

async function postToFacebook(article: GeneratedArticle, heroImage: string | null): Promise<string | null> {
  // Skip comparatifs
  if (article.category === 'Comparatif') {
    logger.info('Category is Comparatif — skipping Facebook post');
    return null;
  }

  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_TOKEN;
  if (!pageId || !pageToken) {
    logger.warn('FB_PAGE_ID or FB_PAGE_TOKEN not set — skipping Facebook post');
    return null;
  }

  const articleUrl = `${BLOG_BASE_URL}${article.slug}`;
  const message = `📝 ${article.title}\n\n${article.excerpt}\n\n👉 ${articleUrl}\n\n#IA #PACIFIKAI #Tahiti #IntelligenceArtificielle`;

  // If we have a hero image, post as photo (image + caption with link) — far better engagement.
  // Else fall back to /feed (link with OG auto-preview).
  const endpoint = heroImage ? `${pageId}/photos` : `${pageId}/feed`;
  const body: Record<string, unknown> = heroImage
    ? { url: heroImage, caption: message, access_token: pageToken }
    : { message, link: articleUrl, access_token: pageToken };

  const resp = await retry.fetch(
    `https://graph.facebook.com/v24.0/${endpoint}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      retry: { timeout: { maxAttempts: 2 } },
    }
  );

  if (!resp.ok) {
    const body = await resp.text();
    logger.error(`Facebook post failed: ${resp.status} ${body}`);
    return null;
  }

  const data = await resp.json() as { id: string };
  logger.info(`Facebook post created: ${data.id}`);
  return data.id;
}

// ─── Step 7: Google Indexing API ─────────────────────────────────────

async function submitToGoogleIndexing(slug: string): Promise<boolean> {
  const keyJson = process.env.GOOGLE_INDEXING_KEY;
  if (!keyJson) {
    logger.warn('GOOGLE_INDEXING_KEY not set — skipping indexing');
    return false;
  }

  try {
    const key = JSON.parse(keyJson) as { client_email: string; private_key: string };
    const crypto = await import('node:crypto');

    // Build JWT manually (RS256) — no googleapis dep needed
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claims = {
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };
    const b64url = (obj: object) =>
      Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    const signingInput = `${b64url(header)}.${b64url(claims)}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signingInput);
    const signature = signer
      .sign(key.private_key)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const jwt = `${signingInput}.${signature}`;

    // Exchange JWT for access token
    const tokenResp = await retry.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      retry: { timeout: { maxAttempts: 2 } },
    });
    if (!tokenResp.ok) {
      logger.error(`Google OAuth token exchange failed: ${tokenResp.status} ${await tokenResp.text()}`);
      return false;
    }
    const tokenData = await tokenResp.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    const url = `${BLOG_BASE_URL}${slug}`;
    const resp = await retry.fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          type: 'URL_UPDATED',
        }),
        retry: { timeout: { maxAttempts: 2 } },
      }
    );

    if (!resp.ok) {
      const body = await resp.text();
      logger.error(`Google Indexing failed: ${resp.status} ${body}`);
      return false;
    }

    logger.info(`Google Indexing submitted: ${url}`);
    return true;
  } catch (err) {
    logger.error(`Google Indexing error: ${err}`);
    return false;
  }
}

// ─── Main Scheduled Task ─────────────────────────────────────────────

export const dailyBlogPost = schedules.task({
  id: 'daily-blog-post',
  cron: '0 16 * * *', // 16h UTC = 6h Tahiti (UTC-10)
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  run: async () => {
    logger.info('=== Daily Blog Post — Start ===');

    // Step 1: Pick a subject
    logger.info('Step 1: Picking a subject from Research_Veille...');
    const subject = await pickSubject();

    if (!subject) {
      logger.info('No subjects with Status="Ready" found. Skipping.');
      return { status: 'skipped', reason: 'no_subjects_available' };
    }

    logger.info(`Subject picked: "${subject.subject}" (${subject.recordId})`);
    logger.info(`Sources: ${subject.sources.length > 0 ? subject.sources.join(', ') : 'none'}`);

    // Step 2: Scrape sources
    logger.info('Step 2: Scraping sources...');
    const scrapedContent = await scrapeSources(subject.sources, subject.subject);
    logger.info(`Scraped content length: ${scrapedContent.length} chars`);

    // Step 3: Generate article
    logger.info('Step 3: Generating article with Claude Sonnet 4.6 (OpenRouter)...');
    const article = await generateArticle(
      subject.subject,
      scrapedContent,
      subject.category
    );
    logger.info(`Article generated: "${article.title}" (${article.category})`);

    // Step 3b: Generate hero image (Nano Banana 3 via OpenRouter)
    logger.info('Step 3b: Generating hero image (Nano Banana 3)...');
    const heroImage = await generateHeroImage(article);
    logger.info(`Hero image: ${heroImage ?? 'skipped'}`);

    // Step 4: Write to Airtable
    logger.info('Step 4: Writing article to Airtable...');
    const articleRecordId = await writeArticle(article, heroImage);

    // Step 5: Mark subject as Used
    logger.info('Step 5: Marking subject as Used...');
    await markSubjectUsed(subject.recordId);

    // Step 6: Post to Facebook (if not comparatif)
    logger.info('Step 6: Posting to Facebook...');
    const fbPostId = await postToFacebook(article, heroImage);

    // Step 7: Submit to Google Indexing
    logger.info('Step 7: Submitting to Google Indexing API...');
    const indexed = await submitToGoogleIndexing(article.slug);

    const articleUrl = `${BLOG_BASE_URL}${article.slug}`;
    logger.info('=== Daily Blog Post — Complete ===');
    logger.info(`Article URL: ${articleUrl}`);

    return {
      status: 'published',
      title: article.title,
      slug: article.slug,
      category: article.category,
      url: articleUrl,
      heroImage,
      airtableRecordId: articleRecordId,
      subjectRecordId: subject.recordId,
      facebookPostId: fbPostId,
      googleIndexed: indexed,
    };
  },
});
