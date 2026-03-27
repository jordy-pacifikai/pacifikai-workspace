import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { buildBusinessConfig } from "./lib/config.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import type { BusinessRow } from "./lib/config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

/**
 * Send a WhatsApp notification to a waitlist client.
 * Triggered from dashboard /api/waitlist/notify or from process-waitlist cron.
 */
export const notifyWaitlistWhatsapp = schemaTask({
  id: "notify-waitlist-whatsapp",
  retry: { maxAttempts: 1 }, // don't retry to avoid duplicate messages
  schema: z.object({
    businessId: z.string().uuid(),
    clientPhone: z.string(),
    message: z.string(),
  }),
  run: async (payload) => {
    // Fetch business for WhatsApp config
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${payload.businessId}&select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
      { headers: supaHeaders() },
    );
    const bizData = await bizRes.json();
    const biz: BusinessRow | null = Array.isArray(bizData) && bizData.length > 0 ? bizData[0] : null;

    if (!biz) {
      logger.error("Business not found for waitlist notification", { businessId: payload.businessId });
      return { sent: false, reason: "business_not_found" };
    }

    const config = buildBusinessConfig(biz);

    try {
      await sendWhatsApp(payload.clientPhone, payload.message, config);
    } catch (err) {
      logger.error("Waitlist WhatsApp send failed", {
        to: payload.clientPhone,
        error: err instanceof Error ? err.message : String(err),
      });
      return { sent: false, reason: "send_failed" };
    }

    logger.info("Waitlist WhatsApp notification sent", {
      to: payload.clientPhone,
      business: biz.name,
    });

    return { sent: true, to: payload.clientPhone };
  },
});
