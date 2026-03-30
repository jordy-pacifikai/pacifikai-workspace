const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appF7pltUaQkOlKM5';
const AIRTABLE_BLOG_TABLE = 'tbllQuhvHL2Utu8mk';
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BLOG_TABLE}`;

const SITE = 'https://pacifikai.com';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/blog', priority: '0.9', changefreq: 'daily' },
  { loc: '/services/workflows', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/chatbots', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/apps', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/documents', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/marketing', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/api', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/landing-pages', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/conseil', priority: '0.8', changefreq: 'monthly' },
];

async function fetchPublishedArticles() {
  if (!AIRTABLE_API_KEY) return [];

  const formula = encodeURIComponent(`{Status}="Published"`);
  const fields = ['Slug', 'Publish_Date'].map(f => `fields[]=${encodeURIComponent(f)}`).join('&');
  const url = `${AIRTABLE_URL}?filterByFormula=${formula}&sort[0][field]=Publish_Date&sort[0][direction]=desc&${fields}`;

  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!resp.ok) return [];

  const data = await resp.json();
  return data.records.map(r => ({
    slug: r.fields.Slug || '',
    date: r.fields.Publish_Date || ''
  })).filter(a => a.slug);
}

function buildSitemap(articles) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const page of STATIC_PAGES) {
    xml += `  <url>
    <loc>${SITE}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  for (const article of articles) {
    const lastmod = article.date || today;
    xml += `  <url>
    <loc>${SITE}/blog/article?slug=${encodeURIComponent(article.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const articles = await fetchPublishedArticles();
    const xml = buildSitemap(articles);
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    const xml = buildSitemap([]);
    return res.status(200).send(xml);
  }
}
