import type { Article } from "./blog-data";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ogsimsfqwibcmotaeevb.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface SupabaseRow {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  status: string;
  publish_date: string | null;
  reading_time: number | null;
  meta_description: string | null;
  image_url: string | null;
}

export interface SupabaseArticle extends Article {
  source: "supabase";
}

function mapRow(r: SupabaseRow): SupabaseArticle {
  return {
    slug: r.slug,
    title: r.title,
    description: r.meta_description || r.excerpt || "",
    date: r.publish_date ? r.publish_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    category: r.category || "IA",
    content: r.content,
    readTime: r.reading_time ? `${r.reading_time} min` : undefined,
    image: r.image_url || undefined,
    source: "supabase",
  };
}

export async function fetchSupabaseArticles(): Promise<SupabaseArticle[]> {
  if (!SUPABASE_ANON_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/blog_articles?status=eq.published&order=publish_date.desc&limit=200`;
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 60 },
  });
  if (!resp.ok) return [];
  const rows = (await resp.json()) as SupabaseRow[];
  return rows.filter((r) => r.slug && r.title && r.content).map(mapRow);
}

export async function getSupabaseArticleBySlug(slug: string): Promise<SupabaseArticle | undefined> {
  if (!SUPABASE_ANON_KEY) return undefined;
  const url = `${SUPABASE_URL}/rest/v1/blog_articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`;
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 60 },
  });
  if (!resp.ok) return undefined;
  const rows = (await resp.json()) as SupabaseRow[];
  if (!rows.length) return undefined;
  return mapRow(rows[0]);
}
