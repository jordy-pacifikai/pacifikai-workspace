import { schedules, logger } from "@trigger.dev/sdk";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { buildBusinessConfig } from "./lib/config.js";
import type { BusinessRow } from "./lib/config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface AbandonedSession {
  id: string;
  phone: string;
  business_id: string;
  selected_service: string | null;
  client_name: string | null;
  updated_at: string;
}

/**
 * Abandoned booking recovery — runs every 4 hours.
 *
 * Finds chatbot sessions where the client selected a service but never
 * completed the booking (no matching appointment in the last 6h).
 * Sends a single WhatsApp nudge with a rebooking link.
 *
 * Window: sessions updated 2h-6h ago (gives client time to finish, avoids old sessions).
 * Safety: only sends once per session (marks recovery_sent_at).
 */
export const recoverAbandonedBookings = schedules.task({
  id: "recover-abandoned-bookings",
  cron: "30 2,6,10,14,18,22 * * *", // Every 4h at :30 (staggered from other crons)
  run: async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    // Find sessions with selected_service but no recent appointment
    // and recovery_sent_at IS NULL (not yet nudged)
    const sessRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_sessions?selected_service=not.is.null&updated_at=gte.${windowStart}&updated_at=lte.${windowEnd}&select=id,phone,business_id,selected_service,client_name,updated_at`,
      { headers: supaHeaders() },
    );
    const sessions: AbandonedSession[] = await sessRes.json();

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { recovered: 0, checked: 0 };
    }

    logger.info(`Found ${sessions.length} potential abandoned sessions`);

    // Group by business to batch-load configs
    const byBusiness = new Map<string, AbandonedSession[]>();
    for (const s of sessions) {
      const arr = byBusiness.get(s.business_id) ?? [];
      arr.push(s);
      byBusiness.set(s.business_id, arr);
    }

    let totalSent = 0;
    let totalChecked = 0;

    for (const [businessId, bizSessions] of byBusiness) {
      // Load business config
      const bizRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
        { headers: supaHeaders() },
      );
      const bizRows: BusinessRow[] = await bizRes.json();
      const biz = bizRows?.[0];
      if (!biz) continue;

      const businessConfig = buildBusinessConfig(biz);
      const slug = biz.booking_slug ?? biz.id;
      const bookingUrl = `https://vea.pacifikai.com/book/${slug}`;

      for (const session of bizSessions) {
        totalChecked++;

        // Check if this client already completed a booking recently (last 6h)
        const apptRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(session.phone)}&business_id=eq.${businessId}&created_at=gte.${windowStart}&status=in.(confirmed,pending)&select=id&limit=1`,
          { headers: supaHeaders() },
        );
        const appts = await apptRes.json();
        if (Array.isArray(appts) && appts.length > 0) {
          // Client actually completed booking — not abandoned
          continue;
        }

        // Check if recovery already sent for this session (via context field)
        const ctxRes = await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_sessions?id=eq.${session.id}&select=context`,
          { headers: supaHeaders() },
        );
        const ctxRows = await ctxRes.json();
        const ctx = (Array.isArray(ctxRows) && ctxRows[0]?.context) || {};
        if (ctx.recovery_sent_at) continue;

        // Send recovery message
        const name = session.client_name || "Bonjour";
        const service = session.selected_service || "votre rendez-vous";
        const message = `${name}, tu n'as pas finalisé ta réservation pour ${service} chez ${biz.name}. Le créneau est peut-être encore dispo ! Reprends ici : ${bookingUrl}`;

        try {
          await sendWhatsApp(session.phone, message, businessConfig);
          totalSent++;
          logger.info(`Recovery message sent`, { phone: session.phone, service: session.selected_service });

          // Mark as sent to prevent re-sending
          await fetch(
            `${SUPABASE_URL}/rest/v1/bookbot_sessions?id=eq.${session.id}`,
            {
              method: "PATCH",
              headers: supaHeaders(),
              body: JSON.stringify({
                context: { ...ctx, recovery_sent_at: new Date().toISOString() },
              }),
            },
          );
        } catch (err) {
          logger.error(`Recovery send failed`, {
            phone: session.phone,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    logger.info(`Abandoned booking recovery complete`, { sent: totalSent, checked: totalChecked });
    return { recovered: totalSent, checked: totalChecked };
  },
});
