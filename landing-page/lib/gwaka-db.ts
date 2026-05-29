// GWAKA catalogue — Supabase REST helpers (service_role, server-side only).
// Pattern aligné sur lib/blog-supabase.ts : REST fetch, pas de SDK.

const URL = process.env.GWAKA_SUPABASE_URL || "https://aaitnegjnhjwnthcmsnr.supabase.co";
const SERVICE_KEY = process.env.GWAKA_SUPABASE_SERVICE_KEY || "";
const REST = `${URL}/rest/v1/gwaka_products`;

export interface GwakaProduct {
  id: string;
  categorie_slug: string;
  categorie_label: string;
  nom: string;
  description: string;
  image: string;
  vegetarien: boolean;
  ordre: number;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export function dbConfigured(): boolean {
  return Boolean(SERVICE_KEY);
}

/** Public : produits actifs uniquement, triés par catégorie + ordre. */
export async function listActiveProducts(): Promise<GwakaProduct[]> {
  const res = await fetch(`${REST}?actif=eq.true&order=ordre.asc&select=*`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase list failed: ${res.status}`);
  return res.json();
}

/** Admin : tous les produits (actifs + inactifs). */
export async function listAllProducts(): Promise<GwakaProduct[]> {
  const res = await fetch(`${REST}?order=categorie_slug.asc,ordre.asc&select=*`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase listAll failed: ${res.status}`);
  return res.json();
}

export async function createProduct(p: Partial<GwakaProduct>): Promise<GwakaProduct> {
  const res = await fetch(REST, {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify([p]),
  });
  if (!res.ok) throw new Error(`Supabase create failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0];
}

export async function updateProduct(id: string, patch: Partial<GwakaProduct>): Promise<GwakaProduct> {
  const res = await fetch(`${REST}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0];
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${REST}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Supabase delete failed: ${res.status}`);
}

/** Upload un fichier image vers le bucket public gwaka-catalogue. Retourne l'URL publique. */
export async function uploadCataloguePhoto(filename: string, buffer: Buffer, contentType = "image/webp"): Promise<string> {
  const path = `uploads/${filename}`;
  const res = await fetch(`${URL}/storage/v1/object/gwaka-catalogue/${path}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  // URL publique
  return `${URL}/storage/v1/object/public/gwaka-catalogue/${path}`;
}
