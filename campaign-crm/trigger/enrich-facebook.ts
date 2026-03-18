/**
 * enrich-facebook.ts — Placeholder pour enrichissement Facebook d'un prospect
 * Sera connecte a Camoufox MCP dans une future iteration
 */
import { task } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// -------------------------------------------------------------------
// Task
// -------------------------------------------------------------------
export const enrichFacebook = task({
  id: "enrich-facebook",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 30_000,
    randomize: true,
  },
  run: async (payload: { prospectId: string }) => {
    const { prospectId } = payload;
    const supabase = getSupabase();

    // 1. Fetch prospect
    const { data: prospect, error: fetchErr } = await supabase
      .from("campaign_prospects")
      .select("id, name, city, facebook_url, facebook_page_name, facebook_page_likes")
      .eq("id", prospectId)
      .single();

    if (fetchErr || !prospect) {
      throw new Error(`Prospect ${prospectId} not found: ${fetchErr?.message}`);
    }

    // 2. If already enriched with Facebook data, skip
    if (prospect.facebook_url && prospect.facebook_page_name) {
      console.log(
        `Prospect ${prospect.name} already has Facebook data — skipping`
      );
      return {
        skipped: true,
        reason: "already_enriched",
        name: prospect.name,
      };
    }

    // 3. Placeholder — log manual search needed
    // Future: use Camoufox MCP to search Facebook and scrape page info
    const searchQuery = `${prospect.name} ${prospect.city ?? "Tahiti"}`;
    console.log(
      `Facebook enrichment for "${prospect.name}" — manual search needed: https://www.facebook.com/search/pages/?q=${encodeURIComponent(searchQuery)}`
    );

    // 4. Tag the prospect so we know enrichment was attempted
    const { data: current } = await supabase
      .from("campaign_prospects")
      .select("tags")
      .eq("id", prospectId)
      .single();

    const existingTags: string[] = current?.tags ?? [];
    if (!existingTags.includes("fb-enrich-pending")) {
      await supabase
        .from("campaign_prospects")
        .update({
          tags: [...existingTags, "fb-enrich-pending"],
          updated_at: new Date().toISOString(),
        })
        .eq("id", prospectId);
    }

    return {
      enriched: false,
      reason: "placeholder_manual_search_needed",
      name: prospect.name,
      searchUrl: `https://www.facebook.com/search/pages/?q=${encodeURIComponent(searchQuery)}`,
    };
  },
});
