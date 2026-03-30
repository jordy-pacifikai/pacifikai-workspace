import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAccess } from "@/lib/auth";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const UNIPILE_DSN = process.env.UNIPILE_DSN ?? "";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vea.pacifikai.com";

const connectSchema = z.object({
  businessId: z.string().uuid(),
  provider: z.enum(["MESSENGER", "INSTAGRAM"]).default("MESSENGER"),
});

/**
 * POST /api/unipile/connect
 *
 * Generates a Unipile Hosted Auth link for a client to connect
 * their Messenger or Instagram account.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`unipile-connect:${ip}`, {
    interval: 60_000,
    limit: 10,
  });
  if (!success) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = connectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { businessId, provider } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UNIPILE_DSN || !UNIPILE_API_KEY) {
      logger.error("Unipile credentials not configured", { action: "unipile_connect" });
      return NextResponse.json(
        { error: "Unipile non configure sur ce serveur" },
        { status: 500 },
      );
    }

    const res = await fetch(`${UNIPILE_DSN}/api/v1/hosted/accounts/link`, {
      method: "POST",
      headers: {
        "X-API-KEY": UNIPILE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create",
        api_url: UNIPILE_DSN,
        providers: [provider],
        success_redirect_url: `${SITE_URL}/channels?unipile_connected=true&business_id=${businessId}`,
        failure_redirect_url: `${SITE_URL}/channels?unipile_error=connection_failed`,
        notify_url: `${SITE_URL}/api/unipile/callback?business_id=${businessId}`,
        name: `vea_${businessId}`,
        expiresOn: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      logger.error("Unipile hosted auth link failed", {
        action: "unipile_connect",
        status: res.status,
        data,
      });
      return NextResponse.json(
        { error: "Impossible de generer le lien de connexion Unipile" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    logger.error("Unipile connect error", {
      action: "unipile_connect",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
