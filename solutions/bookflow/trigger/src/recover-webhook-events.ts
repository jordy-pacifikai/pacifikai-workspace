import { schedules, logger } from "@trigger.dev/sdk";
import { supaHeaders } from "./lib/supabase-headers.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const TRIGGER_API_URL = process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";

interface WebhookEvent {
  id: string;
  business_id: string;
  channel: string;
  payload: Record<string, unknown>;
  status: string;
  retry_count: number;
}

/**
 * Recovery cron for dead letter queue.
 * Runs every 5 minutes, retries pending/failed webhook events (max 5 attempts, 24h window).
 */
export const recoverWebhookEvents = schedules.task({
  id: "recover-webhook-events",
  cron: "*/5 * * * *",
  run: async () => {
    // Fetch recoverable events: pending or failed, under retry limit, within 24h
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_webhook_events?status=in.(pending,failed)&retry_count=lt.5&created_at=gt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}&order=created_at.asc&limit=50`,
      { headers: supaHeaders() },
    );

    const events: WebhookEvent[] = await res.json();
    if (!Array.isArray(events) || events.length === 0) {
      logger.info("[DLQ Recovery] No events to recover");
      return { recovered: 0, failed: 0 };
    }

    logger.info(`[DLQ Recovery] Found ${events.length} events to process`);

    let recovered = 0;
    let failed = 0;

    const triggerKey = process.env.TRIGGER_SECRET_KEY;
    if (!triggerKey) {
      logger.error("[DLQ Recovery] TRIGGER_SECRET_KEY not set");
      return { recovered: 0, failed: 0, error: "missing_key" };
    }

    for (const event of events) {
      try {
        // Increment retry count first
        await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_webhook_events?id=eq.${event.id}`,
          {
            method: "PATCH",
            headers: supaHeaders(),
            body: JSON.stringify({
              retry_count: event.retry_count + 1,
            }),
          },
        );

        // Re-trigger the bookbot handler
        const triggerRes = await fetch(
          `${TRIGGER_API_URL}/api/v1/tasks/bookbot-whatsapp-handler/trigger`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ payload: event.payload }),
          },
        );

        if (triggerRes.ok) {
          // Mark as recovered
          await fetch(
            `${SUPABASE_URL}/rest/v1/bookbot_webhook_events?id=eq.${event.id}`,
            {
              method: "PATCH",
              headers: supaHeaders(),
              body: JSON.stringify({
                status: "recovered",
                processed_at: new Date().toISOString(),
              }),
            },
          );
          recovered++;
          logger.info("[DLQ Recovery] Event recovered", { eventId: event.id, channel: event.channel });
        } else {
          const detail = await triggerRes.text().catch(() => "unknown");
          await fetch(
            `${SUPABASE_URL}/rest/v1/bookbot_webhook_events?id=eq.${event.id}`,
            {
              method: "PATCH",
              headers: supaHeaders(),
              body: JSON.stringify({
                status: "failed",
                error_message: `HTTP ${triggerRes.status}: ${detail.slice(0, 500)}`,
              }),
            },
          );
          failed++;
          logger.warn("[DLQ Recovery] Event retry failed", { eventId: event.id, status: triggerRes.status });
        }
      } catch (err) {
        failed++;
        logger.error("[DLQ Recovery] Exception processing event", { eventId: event.id, error: String(err) });
        // Mark error
        await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_webhook_events?id=eq.${event.id}`,
          {
            method: "PATCH",
            headers: supaHeaders(),
            body: JSON.stringify({
              status: "failed",
              error_message: String(err).slice(0, 500),
            }),
          },
        ).catch(() => {});
      }
    }

    logger.info("[DLQ Recovery] Complete", { recovered, failed });
    return { recovered, failed };
  },
});
