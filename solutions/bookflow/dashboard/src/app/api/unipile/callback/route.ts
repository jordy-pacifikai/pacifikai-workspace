import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * POST /api/unipile/callback
 *
 * Called by Unipile after a client completes Hosted Auth.
 * Receives the new account_id and stores it in bookbot_businesses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessId = new URL(req.url).searchParams.get("business_id");

    if (!businessId) {
      logger.error("Unipile callback missing business_id", { action: "unipile_callback" });
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
    }

    const accountId = body.account_id ?? body.id;
    const provider = body.provider ?? "MESSENGER";

    if (!accountId) {
      logger.error("Unipile callback missing account_id", {
        action: "unipile_callback",
        body,
      });
      return NextResponse.json({ error: "Missing account_id" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { error } = await supabase
      .from("bookbot_businesses")
      .update({
        unipile_account_id: accountId,
        unipile_enabled: true,
        unipile_connected_at: new Date().toISOString(),
        unipile_provider: provider,
      })
      .eq("id", businessId);

    if (error) {
      logger.error("Unipile callback DB update failed", {
        action: "unipile_callback",
        error: error.message,
      });
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    logger.info("Unipile account connected", {
      action: "unipile_callback",
      businessId,
      accountId,
      provider,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile callback error", {
      action: "unipile_callback",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
