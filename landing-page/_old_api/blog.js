const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appF7pltUaQkOlKM5';
const AIRTABLE_BLOG_TABLE = 'tbllQuhvHL2Utu8mk';
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BLOG_TABLE}`;

async function listArticles() {
  const formula = encodeURIComponent(`{Status}="Published"`);
  const fields = ['Title', 'Slug', 'Excerpt', 'Category', 'Format', 'Publish_Date', 'Hero_Image', 'Reading_Time'];
  const fieldParams = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

  const url = `${AIRTABLE_URL}?filterByFormula=${formula}&sort[0][field]=Publish_Date&sort[0][direction]=desc&${fieldParams}`;

  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Airtable error: ${resp.status} ${err}`);
  }

  const data = await resp.json();

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

async function getArticle(slug) {
  const formula = encodeURIComponent(`AND({Slug}="${slug}",{Status}="Published")`);
  const url = `${AIRTABLE_URL}?filterByFormula=${formula}&maxRecords=1`;

  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Airtable error: ${resp.status} ${err}`);
  }

  const data = await resp.json();

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
    author: 'PACIFIK\'AI',
    published_date: r.fields.Publish_Date || '',
    featured_image: r.fields.Hero_Image || '',
    reading_time: r.fields.Reading_Time || '',
    meta_description: r.fields.Meta_Description || '',
    sources: r.fields.Sources || ''
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ error: 'AIRTABLE_API_KEY not configured' });
  }

  try {
    const { action, slug } = req.query;

    if (action === 'list') {
      const articles = await listArticles();
      return res.status(200).json({ articles });
    }

    if (action === 'article' && slug) {
      const article = await getArticle(slug);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      return res.status(200).json({ article });
    }

    return res.status(400).json({ error: 'Invalid action. Use ?action=list or ?action=article&slug=xxx' });
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
