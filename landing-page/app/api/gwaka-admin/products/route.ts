// GET (liste complète) + POST (création) — protégé par session admin.
import { listAllProducts, createProduct } from "@/lib/gwaka-db";
import { isAuthed, requireWriteAccess } from "@/lib/gwaka-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAT_LABELS: Record<string, string> = {
  sales: "Salés", toasts: "Toasts", wraps: "Wraps", salades: "Salades",
  plateaux: "Plateaux", sushis: "Sushis", mini: "Mini Salés",
  brunch: "Brunch & Box", sucres: "Sucrés", boissons: "Boissons",
};

export async function GET(req: Request): Promise<Response> {
  if (!isAuthed(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    return Response.json({ products: await listAllProducts() });
  } catch (e) {
    console.error("[gwaka-admin]", e); return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  const blocked = requireWriteAccess(req);
  if (blocked) return blocked;
  try {
    const b = await req.json();
    const slug = String(b.categorie_slug || "sales");
    const product = {
      categorie_slug: slug,
      categorie_label: CAT_LABELS[slug] || slug,
      nom: String(b.nom || "Nouveau produit").slice(0, 120),
      description: String(b.description || "").slice(0, 300),
      image: String(b.image || ""),
      vegetarien: Boolean(b.vegetarien),
      ordre: Number.isFinite(b.ordre) ? Number(b.ordre) : 999,
      actif: b.actif === undefined ? true : Boolean(b.actif),
    };
    return Response.json({ product: await createProduct(product) });
  } catch (e) {
    console.error("[gwaka-admin]", e); return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
