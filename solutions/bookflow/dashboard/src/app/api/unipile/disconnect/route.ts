import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireBusinessAccess } from "@/lib/auth";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const UNIPILE_DSN = process.env.UNIPILE_DSN ?? "";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";

const disconnectSchema = z.object({ businessId: z.string().uuid() });

/**
 * POST /api/unipile/disconnect
 *
 * Disconnects the Unipile account from a business.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`unipile-disconnect:${ip}`, {
    interval: 60_000,
    limit: 10,
  });
  if (!success) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const parsed = disconnectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { businessId } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    const { data: business } = await supabase
      .from("bookbot_businesses")
      .select("unipile_account_id")
      .eq("id", businessId)
      .single();

    if (business?.unipile_account_id && UNIPILE_DSN && UNIPILE_API_KEY) {
      await fetch(`${UNIPILE_DSN}/api/v1/accounts/${business.unipile_account_id}`, {
        method: "DELETE",
        headers: { "X-API-KEY": UNIPILE_API_KEY },
      }).catch(() => {});
    }

    const { error } = await supabase
      .from("bookbot_businesses")
      .update({
        unipile_account_id: null,
        unipile_enabled: false,
        unipile_connected_at: null,
        unipile_provider: null,
      })
      .eq("id", businessId);

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la deconnexion" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile disconnect error", {
      action: "unipile_disconnect",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
