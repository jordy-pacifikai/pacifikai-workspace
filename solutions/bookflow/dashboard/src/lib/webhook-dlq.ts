import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * Insert a webhook event into the dead letter queue.
 * Returns the event ID on success, null on failure (non-blocking).
 */
export async function insertWebhookEvent(
  businessId: string,
  channel: string,
  payload: Record<string, unknown>,
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("bookbot_webhook_events")
      .insert({
        business_id: businessId,
        channel,
        payload,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      logger.error("DLQ insert failed", { action: "webhook_dlq", channel, error: error.message });
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    logger.error("DLQ insert exception", { action: "webhook_dlq", channel, error: String(err) });
    return null;
  }
}

/**
 * Mark a webhook event as successfully processed.
 */
export async function markWebhookProcessed(eventId: string): Promise<void> {
  try {
    await supabaseAdmin()
      .from("bookbot_webhook_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventId);
  } catch (err) {
    logger.error("DLQ mark processed failed", { action: "webhook_dlq", eventId, error: String(err) });
  }
}

/**
 * Mark a webhook event as failed with an error message.
 */
export async function markWebhookFailed(eventId: string, errorMessage: string): Promise<void> {
  try {
    await supabaseAdmin()
      .from("bookbot_webhook_events")
      .update({
        status: "failed",
        error_message: errorMessage.slice(0, 1000),
      })
      .eq("id", eventId);
  } catch (err) {
    logger.error("DLQ mark failed error", { action: "webhook_dlq", eventId, error: String(err) });
  }
}
