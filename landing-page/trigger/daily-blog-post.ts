import { schedules, task, retry, logger } from '@trigger.dev/sdk';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

// ─── Constants ───────────────────────────────────────────────────────
const AIRTABLE_BASE_ID = 'appF7pltUaQkOlKM5';
const AIRTABLE_BLOG_TABLE = 'tbllQuhvHL2Utu8mk';
const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
const BLOG_BASE_URL = 'https://pacifikai.com/blog?article=';

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
  const formula = encodeURIComponent(`{Status}="Ready"`);
  const sort = `sort[0][field]=Created&sort[0][direction]=asc`;
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
  const rawSources = fields.Sources || fields.Source_URLs || fields.URLs || '';
  if (Array.isArray(rawSources)) {
    sources = rawSources;
  } else if (typeof rawSources === 'string' && rawSources.trim()) {
    sources = rawSources.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    recordId: r.id,
    subject: (fields.Subject || fields.Sujet || fields.Title || fields.Name || '') as string,
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
  readingTime: string;
  metaDescription: string;
}

async function generateArticle(
  subject: string,
  scrapedContent: string,
  subjectCategory: string
): Promise<GeneratedArticle> {
  const anthropic = new Anthropic();

  const systemPrompt = `Tu es le redacteur du blog PACIFIK'AI, une agence d'automatisation IA basee en Polynesie francaise (Tahiti).
Tu ecris des articles pratiques, concrets, orientes business, en francais.
Ton style est professionnel mais accessible, avec des exemples concrets.
Tu dois TOUJOURS mentionner "Polynesie francaise" ou "Tahiti" au moins une fois pour le SEO local.
Les articles font ~800 mots.`;

  const userPrompt = `Ecris un article de blog sur le sujet suivant: "${subject}"

${subjectCategory ? `Categorie suggérée: ${subjectCategory}` : ''}

${scrapedContent ? `Voici des sources de reference (utilise-les pour enrichir l'article, ne copie pas):
---
${scrapedContent.slice(0, 12000)}
---` : 'Pas de sources disponibles. Base-toi sur tes connaissances.'}

Reponds UNIQUEMENT avec un objet JSON valide (sans bloc markdown), avec cette structure exacte:
{
  "title": "Titre accrocheur de l'article",
  "slug": "titre-en-minuscule-avec-tirets",
  "excerpt": "Resume en 1-2 phrases (max 160 caracteres)",
  "content": "<h2>...</h2><p>...</p>... (HTML complet de l'article, ~800 mots, avec h2, h3, p, ul/li, strong)",
  "category": "IA Business | Automatisation | Marketing IA | Tech | Productivite | Formation",
  "reading_time": "X min",
  "meta_description": "Description SEO (max 155 caracteres)"
}

Regles:
- Le content est en HTML (h2, h3, p, ul, li, strong, em). PAS de h1.
- Le slug ne contient que des lettres minuscules, chiffres et tirets
- L'article doit etre PRATIQUE: conseils actionnables, pas de theorie abstraite
- Mentionne "Polynesie francaise" ou "Tahiti" au moins 1 fois naturellement
- Category doit etre UNE des valeurs listees ci-dessus
- JAMAIS de comparatif entre concurrents (pas de "X vs Y")`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON — handle potential markdown code blocks
  const cleaned = text.replace(/^```json?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title,
    slug: parsed.slug.replace(/[^a-z0-9-]/g, '').slice(0, 80),
    excerpt: parsed.excerpt,
    content: parsed.content,
    category: parsed.category || 'IA Business',
    readingTime: parsed.reading_time || '4 min',
    metaDescription: parsed.meta_description || parsed.excerpt,
  };
}

// ─── Step 4: Write to Airtable ───────────────────────────────────────

async function writeArticle(article: GeneratedArticle): Promise<string> {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const data = await airtableFetch(AIRTABLE_BLOG_TABLE, {
    method: 'POST',
    body: JSON.stringify({
      records: [
        {
          fields: {
            Title: article.title,
            Slug: article.slug,
            Excerpt: article.excerpt,
            Content: article.content,
            Category: article.category,
            Status: 'Published',
            Publish_Date: now,
            Reading_Time: article.readingTime,
            Meta_Description: article.metaDescription,
          },
        },
      ],
    }),
  });

  const recordId = data.records?.[0]?.id;
  logger.info(`Article written to Airtable: ${recordId}`);
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

async function postToFacebook(article: GeneratedArticle): Promise<string | null> {
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

  const resp = await retry.fetch(
    `https://graph.facebook.com/v24.0/${pageId}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        link: articleUrl,
        access_token: pageToken,
      }),
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
    const { google } = await import('googleapis');
    const key = JSON.parse(keyJson);
    const auth = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );

    await auth.authorize();
    const url = `${BLOG_BASE_URL}${slug}`;

    const resp = await retry.fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
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
    logger.info('Step 3: Generating article with Claude...');
    const article = await generateArticle(
      subject.subject,
      scrapedContent,
      subject.category
    );
    logger.info(`Article generated: "${article.title}" (${article.category})`);

    // Step 4: Write to Airtable
    logger.info('Step 4: Writing article to Airtable...');
    const articleRecordId = await writeArticle(article);

    // Step 5: Mark subject as Used
    logger.info('Step 5: Marking subject as Used...');
    await markSubjectUsed(subject.recordId);

    // Step 6: Post to Facebook (if not comparatif)
    logger.info('Step 6: Posting to Facebook...');
    const fbPostId = await postToFacebook(article);

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
      airtableRecordId: articleRecordId,
      subjectRecordId: subject.recordId,
      facebookPostId: fbPostId,
      googleIndexed: indexed,
    };
  },
});
