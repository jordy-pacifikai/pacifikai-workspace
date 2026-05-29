// GET status — état de l'accès admin (compte à rebours période gratuite).
// Renvoie {authed, expired, daysLeft, freeUntil}. Sert au bandeau + écran de verrou côté UI.
import { accessStatus } from "@/lib/gwaka-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const s = accessStatus(req);
  if (!s.authed) return Response.json({ authed: false }, { status: 401 });
  return Response.json({
    authed: true,
    expired: s.expired,
    daysLeft: s.daysLeft,
    freeUntil: s.freeUntilMs ? new Date(s.freeUntilMs).toISOString() : null,
  });
}
