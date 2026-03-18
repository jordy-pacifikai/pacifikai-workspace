/**
 * sync-brevo-events.ts — Synchronise les events Brevo (delivered, opened, clicked)
 * vers campaign_email_events + update prospect.email_opened_at
 */
import { task } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface BrevoEvent {
  email: string;
  date: string;
  messageId: string;
  event: string;
  subject?: string;
  tag?: string;
  ip?: string;
  link?: string;
}

interface BrevoEventsResponse {
  events: BrevoEvent[];
}

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
export const syncBrevoEvents = task({
  id: "sync-brevo-events",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 3_000,
    maxTimeoutInMs: 30_000,
    randomize: true,
  },
  run: async (_payload?: Record<string, unknown>) => {
    const supabase = getSupabase();
    const brevoKey = process.env.BREVO_API_KEY!;

    let offset = 0;
    const limit = 100;
    let totalProcessed = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let hasMore = true;

    while (hasMore) {
      // 1. Fetch events from Brevo
      const url = new URL("https://api.brevo.com/v3/smtp/statistics/events");
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("days", "7");

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "api-key": brevoKey,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Brevo events API error ${res.status}: ${errBody}`);
      }

      const data = (await res.json()) as BrevoEventsResponse;
      const events = data.events ?? [];

      if (events.length === 0) {
        hasMore = false;
        break;
      }

      // 2. Filter for campaign-related events (tag starts with "batch-")
      const campaignEvents = events.filter(
        (e) => e.tag && e.tag.startsWith("batch-")
      );

      for (const evt of campaignEvents) {
        // Find prospect by email
        const { data: prospect } = await supabase
          .from("campaign_prospects")
          .select("id, name, email_opened_at")
          .eq("email", evt.email)
          .single();

        if (!prospect) {
          continue; // Not a campaign prospect
        }

        // Check if we already logged this exact event (dedup by messageId + event type)
        const { data: existing } = await supabase
          .from("campaign_email_events")
          .select("id")
          .eq("prospect_id", prospect.id)
          .eq("brevo_message_id", evt.messageId)
          .eq("event_type", evt.event)
          .limit(1);

        if (existing && existing.length > 0) {
          continue; // Already logged
        }

        // 3. Process by event type
        switch (evt.event) {
          case "delivered":
            await supabase.from("campaign_email_events").insert({
              prospect_id: prospect.id,
              event_type: "delivered",
              email_type: evt.tag ?? "unknown",
              subject: evt.subject ?? null,
              brevo_message_id: evt.messageId,
              metadata: { ip: evt.ip, date: evt.date },
            });
            totalDelivered++;
            break;

          case "opened":
          case "uniqueOpened":
            await supabase.from("campaign_email_events").insert({
              prospect_id: prospect.id,
              event_type: "opened",
              email_type: evt.tag ?? "unknown",
              subject: evt.subject ?? null,
              brevo_message_id: evt.messageId,
              metadata: { ip: evt.ip, date: evt.date },
            });

            // Update prospect email_opened_at (only first open)
            if (!prospect.email_opened_at) {
              await supabase
                .from("campaign_prospects")
                .update({
                  email_opened_at: evt.date,
                  status: "opened",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", prospect.id);
            }
            totalOpened++;
            break;

          case "click":
            await supabase.from("campaign_email_events").insert({
              prospect_id: prospect.id,
              event_type: "clicked",
              email_type: evt.tag ?? "unknown",
              subject: evt.subject ?? null,
              brevo_message_id: evt.messageId,
              metadata: { ip: evt.ip, link: evt.link, date: evt.date },
            });
            totalClicked++;
            break;

          default:
            // bounce, spam, etc. — log but don't update status
            await supabase.from("campaign_email_events").insert({
              prospect_id: prospect.id,
              event_type: evt.event,
              email_type: evt.tag ?? "unknown",
              subject: evt.subject ?? null,
              brevo_message_id: evt.messageId,
              metadata: { ip: evt.ip, date: evt.date },
            });
            break;
        }

        totalProcessed++;
      }

      // Paginate — if we got a full page, there might be more
      if (events.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }

      // Safety: max 10 pages (1000 events)
      if (offset >= 1000) {
        hasMore = false;
      }
    }

    console.log(
      `Brevo sync complete: ${totalProcessed} events (${totalDelivered} delivered, ${totalOpened} opened, ${totalClicked} clicked)`
    );

    return {
      totalProcessed,
      totalDelivered,
      totalOpened,
      totalClicked,
    };
  },
});
