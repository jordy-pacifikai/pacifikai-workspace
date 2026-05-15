import { NextResponse } from "next/server";

const SITE_URL = "https://pacificblueconsulting.org";

const PAGES = [
  { path: "", priority: "1.0" },
  { path: "/le-cabinet", priority: "0.9" },
  { path: "/offres", priority: "0.9" },
  { path: "/realisations", priority: "0.9" },
  { path: "/perspectives", priority: "0.7" },
  { path: "/contact", priority: "0.8" },
];

export async function GET() {
  const now = new Date().toISOString();
  const urls = PAGES.map((page) => {
    const frUrl = `${SITE_URL}${page.path || "/"}`;
    const enUrl = `${SITE_URL}/en${page.path}`;
    const altLinks = [
      `<xhtml:link rel="alternate" hreflang="fr" href="${frUrl}" />`,
      `<xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}" />`,
    ].join("\n    ");

    return [
      `  <url>
    <loc>${frUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
    ${altLinks}
  </url>`,
      `  <url>
    <loc>${enUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
    ${altLinks}
  </url>`,
    ].join("\n");
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new NextResponse(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
