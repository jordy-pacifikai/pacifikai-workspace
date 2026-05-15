import { NextResponse } from "next/server";

const SITE_URL = "https://pacificblueconsulting.org";

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
