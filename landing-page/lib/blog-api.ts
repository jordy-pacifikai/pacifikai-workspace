/**
 * blog-api.ts — Dynamic article fetching with Supabase + static fallback
 *
 * Priority:
 *   1. Supabase `blog_articles` table (populated by Trigger.dev daily-blog-post workflow)
 *   2. Static `lib/blog-data.ts` as fallback when Supabase is unavailable or not configured
 *
 * ISR: Next.js revalidates the Supabase response every 3600 seconds (1 hour).
 * New articles published by the workflow become live within the next revalidation cycle.
 */

import type { Article } from './blog-data';

// Shape of a row returned by Supabase REST API for blog_articles
interface BlogArticleRow {
  slug: string;
  title: string;
  description: string;
  date: string;       // ISO date string: "2026-03-27"
  category: string;
  read_time: string;
  content: string;
  image: string | null;
  published: boolean;
  created_at: string;
}

function rowToArticle(row: BlogArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    category: row.category,
    readTime: row.read_time,
    image: row.image ?? 'linear-gradient(135deg, #080c14 0%, #0d1424 50%, rgba(249,112,102,0.08) 100%)',
    content: row.content,
  };
}

async function getStaticFallback(): Promise<Article[]> {
  const { articles } = await import('./blog-data');
  return articles;
}

/**
 * Fetch all published articles, ordered by date descending.
 * Falls back to static data on any error or missing env vars.
 */
export async function fetchArticles(): Promise<Article[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return getStaticFallback();
  }

  try {
    const resp = await fetch(
      `${url}/rest/v1/blog_articles?published=eq.true&order=date.desc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        // ISR: revalidate every hour so new Trigger.dev articles appear quickly
        next: { revalidate: 3600 },
      }
    );

    if (!resp.ok) {
      console.error(`[blog-api] Supabase fetch failed: ${resp.status}`);
      return getStaticFallback();
    }

    const rows = (await resp.json()) as BlogArticleRow[];

    // If Supabase returned an empty table, fall back to static seed data
    if (!Array.isArray(rows) || rows.length === 0) {
      return getStaticFallback();
    }

    return rows.map(rowToArticle);
  } catch (err) {
    console.error('[blog-api] Supabase error, falling back to static data:', err);
    return getStaticFallback();
  }
}

/**
 * Fetch a single article by slug.
 * Falls back to static data on any error or missing env vars.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | undefined> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    const { getArticleBySlug } = await import('./blog-data');
    return getArticleBySlug(slug);
  }

  try {
    const resp = await fetch(
      `${url}/rest/v1/blog_articles?slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!resp.ok) {
      const { getArticleBySlug } = await import('./blog-data');
      return getArticleBySlug(slug);
    }

    const rows = (await resp.json()) as BlogArticleRow[];
    if (!Array.isArray(rows) || rows.length === 0) {
      const { getArticleBySlug } = await import('./blog-data');
      return getArticleBySlug(slug);
    }

    return rowToArticle(rows[0]);
  } catch {
    const { getArticleBySlug } = await import('./blog-data');
    return getArticleBySlug(slug);
  }
}
