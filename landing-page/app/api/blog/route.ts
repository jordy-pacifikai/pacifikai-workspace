const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appF7pltUaQkOlKM5';
const AIRTABLE_BLOG_TABLE = 'tbllQuhvHL2Utu8mk';
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BLOG_TABLE}`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AirtableFields {
  Title?: string;
  Slug?: string;
  Excerpt?: string;
  Content?: string;
  Category?: string;
  Format?: string;
  Publish_Date?: string;
  Hero_Image?: string;
  Reading_Time?: string;
  Meta_Description?: string;
  Sources?: string;
}

interface AirtableRecord {
  id: string;
  fields: AirtableFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function listArticles() {
  const formula = encodeURIComponent(`{Status}="Published"`);
  const fields = ['Title', 'Slug', 'Excerpt', 'Category', 'Format', 'Publish_Date', 'Hero_Image', 'Reading_Time'];
  const fieldParams = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

  const url = `${AIRTABLE_URL}?filterByFormula=${formula}&sort[0][field]=Publish_Date&sort[0][direction]=desc&${fieldParams}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Airtable error: ${resp.status} ${err}`);
  }

  const data = await resp.json() as AirtableResponse;

  return data.records.map(r => ({
    title: r.fields.Title || '',
    slug: r.fields.Slug || '',
    excerpt: r.fields.Excerpt || '',
    category: r.fields.Category || '',
    format: r.fields.Format || '',
    published_date: r.fields.Publish_Date || '',
    featured_image: r.fields.Hero_Image || '',
    reading_time: r.fields.Reading_Time || ''
  }));
}

async function getArticle(slug: string) {
  const formula = encodeURIComponent(`AND({Slug}="${slug}",{Status}="Published")`);
  const url = `${AIRTABLE_URL}?filterByFormula=${formula}&maxRecords=1`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Airtable error: ${resp.status} ${err}`);
  }

  const data = await resp.json() as AirtableResponse;

  if (!data.records || data.records.length === 0) {
    return null;
  }

  const r = data.records[0];
  return {
    title: r.fields.Title || '',
    slug: r.fields.Slug || '',
    excerpt: r.fields.Excerpt || '',
    content: r.fields.Content || '',
    category: r.fields.Category || '',
    author: "PACIFIK'AI",
    published_date: r.fields.Publish_Date || '',
    featured_image: r.fields.Hero_Image || '',
    reading_time: r.fields.Reading_Time || '',
    meta_description: r.fields.Meta_Description || '',
    sources: r.fields.Sources || ''
  };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(request: Request): Promise<Response> {
  const cacheHeaders = {
    ...CORS_HEADERS,
    'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
  };

  if (!AIRTABLE_API_KEY) {
    return Response.json({ error: 'AIRTABLE_API_KEY not configured' }, { status: 500, headers: cacheHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');

    if (action === 'list') {
      const articles = await listArticles();
      return Response.json({ articles }, { headers: cacheHeaders });
    }

    if (action === 'article' && slug) {
      const article = await getArticle(slug);
      if (!article) {
        return Response.json({ error: 'Article not found' }, { status: 404, headers: cacheHeaders });
      }
      return Response.json({ article }, { headers: cacheHeaders });
    }

    return Response.json(
      { error: 'Invalid action. Use ?action=list or ?action=article&slug=xxx' },
      { status: 400, headers: cacheHeaders }
    );
  } catch (error) {
    console.error('Blog API error:', error);
    return Response.json(
      { error: 'Internal server error', detail: (error as Error).message },
      { status: 500, headers: cacheHeaders }
    );
  }
}
