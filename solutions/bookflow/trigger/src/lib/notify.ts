import { logger } from "@trigger.dev/sdk";
import { supaHeaders } from "./supabase-headers.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export type NotificationType =
  | "new_booking"
  | "cancellation"
  | "review"
  | "no_show"
  | "campaign_complete"
  | "waitlist_update"
  | "gcal_disconnected";

/**
 * Insert a notification into bookbot_notifications.
 * Fire-and-forget — never throws.
 */
export async function createNotification(opts: {
  businessId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_notifications`, {
      method: "POST",
      headers: { ...supaHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({
        business_id: opts.businessId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        is_read: false,
        metadata: opts.metadata ?? {},
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.warn(`Notification insert failed: ${res.status} ${body}`);
    }
  } catch (err) {
    logger.warn(`Notification insert error: ${err}`);
  }
}
