/**
 * master-cron.ts — Single scheduled task (free plan = 1 schedule max)
 * Runs every hour:
 *   - Check prospects with status='sent' for relance eligibility (J+3, J+7, J+14)
 *   - Every 6 hours (UTC hour % 6 === 0): sync Brevo email events
 */
import { schedules } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { sendRelance } from "./send-relance";
import { syncBrevoEvents } from "./sync-brevo-events";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function daysSince(dateStr: string): number {
  const sent = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

// -------------------------------------------------------------------
// Scheduled Task — every hour
// -------------------------------------------------------------------
export const masterCron = schedules.task({
  id: "master-cron",
  cron: "0 * * * *", // Every hour at minute 0
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
  },
  run: async (payload) => {
    const now = new Date(payload.timestamp);
    const utcHour = now.getUTCHours();
    const supabase = getSupabase();

    console.log(
      `Master cron fired at ${now.toISOString()} (UTC hour: ${utcHour})`
    );

    // ---------------------------------------------------------------
    // 1. Brevo event sync — every 6 hours (00, 06, 12, 18 UTC)
    // ---------------------------------------------------------------
    if (utcHour % 6 === 0) {
      console.log("Triggering Brevo events sync...");
      await syncBrevoEvents.trigger({});
    }

    // ---------------------------------------------------------------
    // 2. Relance check — all prospects with status='sent'
    // ---------------------------------------------------------------
    const { data: prospects, error } = await supabase
      .from("campaign_prospects")
      .select(
        "id, name, email, email_sent_at, relance_count, last_relance_type, status"
      )
      .eq("status", "sent")
      .not("email", "is", null)
      .not("email_sent_at", "is", null);

    if (error) {
      throw new Error(`Failed to fetch prospects: ${error.message}`);
    }

    if (!prospects || prospects.length === 0) {
      console.log("No prospects with status=sent found — nothing to relance");
      return {
        brevoSync: utcHour % 6 === 0,
        relancesTriggered: 0,
        prospectsChecked: 0,
      };
    }

    console.log(`Checking ${prospects.length} prospects for relance...`);

    let relancesTriggered = 0;

    for (const prospect of prospects) {
      const days = daysSince(prospect.email_sent_at!);
      const relanceCount = prospect.relance_count ?? 0;

      // J+14 — breakup email (3rd relance)
      if (days >= 14 && relanceCount < 3) {
        console.log(
          `${prospect.name}: ${days} days, relance ${relanceCount} -> triggering j14`
        );
        await sendRelance.trigger({
          prospectId: prospect.id,
          type: "j14",
        });
        relancesTriggered++;
        continue; // Only 1 relance per cycle per prospect
      }

      // J+7 — stats email (2nd relance)
      if (days >= 7 && relanceCount < 2) {
        console.log(
          `${prospect.name}: ${days} days, relance ${relanceCount} -> triggering j7`
        );
        await sendRelance.trigger({
          prospectId: prospect.id,
          type: "j7",
        });
        relancesTriggered++;
        continue;
      }

      // J+3 — soft reminder (1st relance)
      if (days >= 3 && relanceCount < 1) {
        console.log(
          `${prospect.name}: ${days} days, relance ${relanceCount} -> triggering j3`
        );
        await sendRelance.trigger({
          prospectId: prospect.id,
          type: "j3",
        });
        relancesTriggered++;
        continue;
      }
    }

    console.log(
      `Master cron done: ${relancesTriggered} relances triggered out of ${prospects.length} prospects`
    );

    return {
      brevoSync: utcHour % 6 === 0,
      relancesTriggered,
      prospectsChecked: prospects.length,
      timestamp: now.toISOString(),
    };
  },
});
