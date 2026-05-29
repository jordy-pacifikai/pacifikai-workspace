// GET public — catalogue actif pour la carte gwakatahiti.com/menu.
import { listActiveProducts, dbConfigured } from "@/lib/gwaka-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "https://gwakatahiti.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS });
}

export async function GET(): Promise<Response> {
  if (!dbConfigured()) {
    return Response.json({ products: [], error: "not_configured" }, { status: 200, headers: CORS });
  }
  try {
    const products = await listActiveProducts();
    return Response.json(
      { products },
      { status: 200, headers: { ...CORS, "Cache-Control": "public, max-age=10, s-maxage=10" } }
    );
  } catch (e) {
    console.error("[gwaka-catalogue]", e);
    return Response.json({ products: [], error: "fetch_failed" }, { status: 200, headers: CORS });
  }
}
