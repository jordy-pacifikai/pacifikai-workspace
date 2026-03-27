import { schedules, logger } from "@trigger.dev/sdk";
import { sendReviewRequestTask } from "./send-review-request.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { createNotification } from "./lib/notify.js";
import { runDripCampaign } from "./drip-campaign.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ALERT_CHAT_ID ?? "1057670104";

interface CompletedAppointment {
  id: string;
  business_id: string;
  client_phone: string;
  client_name: string | null;
  client_email: string | null;
  service: string | null;
  appointment_date: string;
  time_slot: string;
  updated_at: string;
}

interface BusinessReviewConfig {
  id: string;
  review_auto_send: boolean | null;
  review_delay_hours: number | null;
}

/**
 * Auto-send review requests after completed appointments.
 *
 * Runs every 30 minutes. Finds appointments that:
 * - status = "completed"
 * - have a client_phone
 * - were completed 1.5–4h ago (based on updated_at)
 * - don't already have a review request in bookbot_review_requests
 *
 * Then triggers send-review-request for each eligible appointment.
 */
export const autoReviewRequest = schedules.task({
  id: "auto-review-request",
  cron: "10,40 * * * *", // :10 and :40 to stagger from reminders at :00/:30
  run: async () => {
    const now = new Date();

    // ── Meta token health check (every 30min) ──────────────────────────────
    try {
      const tokRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?meta_page_token=not.is.null&meta_page_token=neq.&select=id,name,meta_page_token,meta_page_name,meta_token_status`,
        { headers: supaHeaders() },
      );
      if (tokRes.ok) {
        const businesses: Array<{ id: string; name: string; meta_page_token: string; meta_page_name: string | null; meta_token_status: string | null }> = await tokRes.json();
        for (const biz of businesses) {
          const checkRes = await fetch(`https://graph.facebook.com/v24.0/me?access_token=${biz.meta_page_token}`);
          const checkData = await checkRes.json();
          if (checkData.error) {
            logger.error(`Meta token INVALID for ${biz.name} (${biz.meta_page_name})`, { businessId: biz.id, error: checkData.error.message });
            // Update token status in DB
            await fetch(
              `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`,
              {
                method: "PATCH",
                headers: supaHeaders(),
                body: JSON.stringify({ meta_token_status: "invalid" }),
              },
            );
            // Send Telegram alert (only on status change to avoid spam)
            if (TELEGRAM_BOT_TOKEN && biz.meta_token_status !== "invalid") {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: TELEGRAM_CHAT_ID,
                  text: `⚠️ Ve'a — Token Meta INVALIDE\nBusiness: ${biz.name}\nPage: ${biz.meta_page_name ?? "?"}\nErreur: ${checkData.error.message}\n\n→ Reconnecter sur vea.pacifikai.com/channels`,
                }),
              }).catch(() => {});
            }
            // Create in-app notification (only on status change)
            if (biz.meta_token_status !== "invalid") {
              await createNotification({
                businessId: biz.id,
                type: "cancellation",
                title: "Connexion Facebook expirée",
                message: "Le token de votre Page Facebook a expiré. Reconnectez-la dans Paramètres > Canaux pour que le chatbot fonctionne.",
                metadata: { page: biz.meta_page_name },
              });
            }
          } else {
            // Update token status to valid
            if (biz.meta_token_status !== "valid") {
              await fetch(
                `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${biz.id}`,
                {
                  method: "PATCH",
                  headers: supaHeaders(),
                  body: JSON.stringify({ meta_token_status: "valid" }),
                },
              );
            }
            logger.info(`Meta token OK for ${biz.name} (${checkData.name})`);
          }
        }
      }
    } catch (err) {
      logger.error("Meta token health check failed", { error: String(err) });
    }

    // Window: appointments completed 1.5h–4h ago
    const windowStart = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() - 1.5 * 60 * 60 * 1000);

    // 1. Fetch businesses with review_auto_send enabled (or null = default true)
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id,review_auto_send,review_delay_hours&or=(review_auto_send.is.null,review_auto_send.eq.true)`,
      { headers: supaHeaders() },
    );
    const businesses: BusinessReviewConfig[] = await bizRes.json();
    if (!Array.isArray(businesses) || businesses.length === 0) {
      return { sent: 0, reason: "no_eligible_businesses" };
    }

    const bizIds = businesses.map((b) => b.id);

    // 2. Fetch completed appointments in the time window
    const apptRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_appointments?status=eq.completed&client_phone=not.is.null&updated_at=gte.${windowStart.toISOString()}&updated_at=lte.${windowEnd.toISOString()}&business_id=in.(${bizIds.join(",")})&select=id,business_id,client_phone,client_name,client_email,service,appointment_date,time_slot,updated_at`,
      { headers: supaHeaders() },
    );
    const appointments: CompletedAppointment[] = await apptRes.json();
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return { sent: 0, reason: "no_completed_appointments" };
    }

    // 3. Check which appointments already have review requests
    const apptIds = appointments.map((a) => a.id);
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_review_requests?appointment_id=in.(${apptIds.join(",")})&select=appointment_id`,
      { headers: supaHeaders() },
    );
    const existingReviews: Array<{ appointment_id: string }> = await existingRes.json();
    const alreadySent = new Set(
      Array.isArray(existingReviews) ? existingReviews.map((r) => r.appointment_id) : [],
    );

    // 4. Trigger review requests for eligible appointments
    let sentCount = 0;
    for (const appt of appointments) {
      if (alreadySent.has(appt.id)) continue;

      try {
        await sendReviewRequestTask.trigger({
          appointmentId: appt.id,
          businessId: appt.business_id,
          clientPhone: appt.client_phone,
          clientName: appt.client_name,
          clientEmail: appt.client_email ?? undefined,
        });
        sentCount++;
        logger.info(`Auto-review triggered for ${appt.client_name ?? appt.client_phone}`, {
          appointmentId: appt.id,
          business: appt.business_id,
        });
      } catch (err) {
        logger.error(`Failed to trigger auto-review for appointment ${appt.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info(`Auto-review: ${sentCount} review requests triggered from ${appointments.length} completed appointments`);

    // ── Drip campaign (~hourly — merged from vea-drip-campaign schedule) ──
    // This task runs at :10 and :40. Run drip only on :10 pass = effectively hourly.
    if (now.getMinutes() < 30) {
      try {
        const dripResult = await runDripCampaign();
        logger.info("Drip campaign (merged)", dripResult);
      } catch (err) {
        logger.error("Drip campaign failed", { error: err instanceof Error ? err.message : String(err) });
      }
    }

    return { sent: sentCount, checked: appointments.length, alreadyHadReview: alreadySent.size };
  },
});
