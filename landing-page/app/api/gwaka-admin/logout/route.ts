// POST logout — efface le cookie de session.
import { clearCookieHeader } from "@/lib/gwaka-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": clearCookieHeader() },
  });
}
