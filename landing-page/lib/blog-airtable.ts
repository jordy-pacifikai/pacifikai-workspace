import type { Article } from "./blog-data";

const AIRTABLE_BASE_ID = "appF7pltUaQkOlKM5";
const AIRTABLE_BLOG_TABLE = "tbllQuhvHL2Utu8mk";

interface AirtableRecord {
  id: string;
  fields: {
    Title?: string;
    Slug?: string;
    Excerpt?: string;
    Content?: string;
    Category?: string;
    Status?: string;
    Publish_Date?: string;
    Reading_Time?: number;
    Meta_Description?: string;
    Hero_Image?: string;
  };
}

export interface AirtableArticle extends Article {
  source: "airtable";
}

async function fetchPage(offset?: string): Promise<{ records: AirtableRecord[]; offset?: string }> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) return { records: [] };

  const params = new URLSearchParams({
    filterByFormula: '{Status}="Published"',
    "sort[0][field]": "Publish_Date",
    "sort[0][direction]": "desc",
    pageSize: "100",
  });
  if (offset) params.set("offset", offset);

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BLOG_TABLE}?${params.toString()}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 60 },
  });
  if (!resp.ok) return { records: [] };
  return (await resp.json()) as { records: AirtableRecord[]; offset?: string };
}

export async function fetchAirtableArticles(): Promise<AirtableArticle[]> {
  const all: AirtableRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    all.push(...page.records);
    cursor = page.offset;
  } while (cursor);

  return all
    .filter((r) => r.fields.Slug && r.fields.Title && r.fields.Content)
    .map((r) => ({
      slug: r.fields.Slug!,
      title: r.fields.Title!,
      description: r.fields.Meta_Description || r.fields.Excerpt || "",
      date: r.fields.Publish_Date || new Date().toISOString().slice(0, 10),
      category: r.fields.Category || "IA",
      content: r.fields.Content!,
      readTime: r.fields.Reading_Time ? `${r.fields.Reading_Time} min` : undefined,
      image: r.fields.Hero_Image,
      source: "airtable" as const,
    }));
}

export async function getAirtableArticleBySlug(slug: string): Promise<AirtableArticle | undefined> {
  const all = await fetchAirtableArticles();
  return all.find((a) => a.slug === slug);
}
