// POST login admin — password → cookie de session signé.
import { checkPassword, createSession, sessionCookieHeader, passwordConfigured, freeUntilMs } from "@/lib/gwaka-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate-limit anti brute-force : 8 tentatives / 5 min par IP (reset au redeploy, acceptable).
const WINDOW = 5 * 60 * 1000;
const MAX = 8;
const attempts = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = attempts.get(ip);
  if (!e || now > e.reset) { attempts.set(ip, { count: 1, reset: now + WINDOW }); return false; }
  e.count++;
  return e.count > MAX;
}

export async function POST(req: Request): Promise<Response> {
  if (!passwordConfigured()) {
    return Response.json({ ok: false, error: "Admin non configuré (mot de passe manquant)" }, { status: 503 });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Trop de tentatives. Patiente une minute." }, { status: 429 });
  }
  let password = "";
  try {
    const body = await req.json();
    password = String(body.password || "");
  } catch {
    return Response.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  if (!checkPassword(password)) {
    return Response.json({ ok: false, error: "Mot de passe incorrect" }, { status: 401 });
  }
  const token = createSession();
  const until = freeUntilMs();
  const now = Date.now();
  const body = {
    ok: true,
    expired: until !== null && now > until,
    daysLeft: until !== null ? Math.max(0, Math.ceil((until - now) / 86_400_000)) : null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": sessionCookieHeader(token) },
  });
}
