// GWAKA admin — auth par mot de passe + cookie de session signé (HMAC).
// Aucune dépendance externe : crypto natif Node.

import crypto from "crypto";

const SECRET = process.env.GWAKA_SESSION_SECRET || "gwaka-dev-secret-change-me";
const PASSWORD = process.env.GWAKA_ADMIN_PASSWORD || "";
export const GWAKA_COOKIE = "gwaka_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export function passwordConfigured(): boolean {
  return Boolean(PASSWORD);
}

export function checkPassword(input: string): boolean {
  if (!PASSWORD) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Crée un token signé : base64(payload).hmac */
export function createSession(): string {
  const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [b64, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(b64, "base64url").toString());
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

// ── Période d'accès gratuit (timer) ────────────────────────────────────────
// GWAKA_ADMIN_FREE_UNTIL = date ISO (ex "2026-08-29"). Passé cette date, l'ÉDITION
// admin est verrouillée (lecture seule + paywall) tant que le client n'a pas payé.
// Le site PUBLIC (/api/gwaka-catalogue) n'est JAMAIS affecté — il reste en ligne.
// Non défini = aucune expiration (fail-open, l'admin reste pleinement utilisable).
export function freeUntilMs(): number | null {
  const raw = (process.env.GWAKA_ADMIN_FREE_UNTIL || "").trim();
  if (!raw) return null;
  const t = Date.parse(raw.length === 10 ? `${raw}T23:59:59-10:00` : raw); // jour plein heure Tahiti
  return Number.isFinite(t) ? t : null;
}

export interface GwakaAccess {
  authed: boolean;
  expired: boolean;
  freeUntilMs: number | null;
  daysLeft: number | null;
}

export function accessStatus(req: Request): GwakaAccess {
  const authed = isAuthed(req);
  const until = freeUntilMs();
  const now = Date.now();
  const expired = until !== null && now > until;
  const daysLeft = until !== null ? Math.max(0, Math.ceil((until - now) / 86_400_000)) : null;
  return { authed, expired, freeUntilMs: until, daysLeft };
}

/** Garde d'écriture : null si l'action est permise, sinon la Response à renvoyer. */
export function requireWriteAccess(req: Request): Response | null {
  if (!isAuthed(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (freeUntilMs() !== null && Date.now() > (freeUntilMs() as number)) {
    return Response.json(
      { error: "access_expired", message: "Période d'accès gratuit terminée. Contacte PACIFIK'AI pour réactiver l'édition." },
      { status: 402 },
    );
  }
  return null;
}

export function sessionCookieHeader(token: string): string {
  return `${GWAKA_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearCookieHeader(): string {
  return `${GWAKA_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Lit le cookie depuis le header Cookie brut d'une Request. */
export function isAuthed(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|; )${GWAKA_COOKIE}=([^;]+)`));
  return verifySession(m ? decodeURIComponent(m[1]) : undefined);
}
