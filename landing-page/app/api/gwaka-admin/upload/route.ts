// POST upload photo — passthrough vers Supabase Storage (PAS de sharp côté serveur).
// Le traitement image (auto-orient EXIF + WebP + resize) se fait côté navigateur
// (canvas) avant l'envoi → zéro dépendance native, zéro souci cross-platform Linux.
// Fallback : si le client envoie l'original (ex HEIC non décodable), on le stocke tel quel.
import { uploadCataloguePhoto } from "@/lib/gwaka-db";
import { requireWriteAccess } from "@/lib/gwaka-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "image/webp": "webp", "image/jpeg": "jpg", "image/jpg": "jpg",
  "image/png": "png", "image/heic": "heic", "image/heif": "heic",
};

function slugify(name: string): string {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 50) || "photo";
}

export async function POST(req: Request): Promise<Response> {
  const blocked = requireWriteAccess(req);
  if (blocked) return blocked;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "no file" }, { status: 400 });

    const type = (file.type || "image/webp").toLowerCase();
    if (!type.startsWith("image/")) return Response.json({ error: "not an image" }, { status: 415 });
    if (file.size > 15 * 1024 * 1024) return Response.json({ error: "file too large (max 15MB)" }, { status: 413 });

    const ext = EXT[type] || "webp";
    const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const base = slugify(file.name || "photo");
    const stamp = Math.random().toString(36).slice(2, 8);
    const filename = `gwaka-${base}-${stamp}.${ext}`;
    const publicUrl = await uploadCataloguePhoto(filename, buffer, contentType);

    return Response.json({ url: publicUrl, filename, bytes: buffer.length });
  } catch (e) {
    console.error("[gwaka-upload]", e);
    return Response.json({ error: "upload_failed" }, { status: 500 });
  }
}
