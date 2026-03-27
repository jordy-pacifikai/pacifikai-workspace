import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { loadBusinessConfig } from "./lib/supabase.js";
import { supaHeaders } from "./lib/supabase-headers.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export const followupAppointmentTask = schemaTask({
  id: "followup-appointment",
  schema: z.object({
    appointmentId: z.string().uuid(),
    businessId: z.string().uuid(),
    clientPhone: z.string(),
    clientName: z.string().nullable(),
    bookingUrl: z.string().optional(), // Deprecated: now reconstructed server-side
  }),
  retry: { maxAttempts: 2 },
  run: async (payload) => {
    const { appointmentId, businessId, clientPhone, clientName } = payload;

    // 1. Vérifier que l'appointment existe et que followup_sent_at IS NULL (éviter double envoi)
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&followup_sent_at=is.null&select=id`,
      { headers: supaHeaders() }
    );
    const rows = await checkRes.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      logger.info(`followup-appointment: skipped (already sent or not found)`, { appointmentId });
      return { skipped: true };
    }

    // 2. Charger config business (provider WhatsApp, credentials)
    const config = await loadBusinessConfig(businessId);
    if (!config) {
      throw new Error(`Business config not found for ${businessId}`);
    }

    // 3. Reconstruct booking URL server-side (never trust caller-supplied URL)
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=booking_slug`,
      { headers: supaHeaders() },
    );
    const bizRows = await bizRes.json();
    const slug = (Array.isArray(bizRows) && bizRows[0]?.booking_slug) || businessId;
    const bookingUrl = `https://vea.pacifikai.com/book/${slug}`;

    // 4. Fetch client visit count for personalized message
    let totalVisits = 0;
    try {
      const clientRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_clients?phone=eq.${encodeURIComponent(clientPhone)}&business_id=eq.${businessId}&select=total_visits`,
        { headers: supaHeaders() },
      );
      const clientRows = await clientRes.json();
      if (Array.isArray(clientRows) && clientRows[0]?.total_visits) {
        totalVisits = clientRows[0].total_visits;
      }
    } catch {
      // Non-blocking — send message without visit count
    }

    // 5. Construire et envoyer le message WhatsApp
    const name = clientName?.trim() || "";
    const loyaltyNote = totalVisits >= 5
      ? ` Tu en es à ta ${totalVisits}e visite, merci pour ta fidélité !`
      : totalVisits >= 2
        ? ` Ravi de te revoir pour ta ${totalVisits}e visite !`
        : "";
    const message = `Merci ${name} pour ta visite !${loyaltyNote} 😊 Ton prochain rendez-vous en 1 clic : ${bookingUrl}`;

    await sendWhatsApp(clientPhone, message, config);
    logger.info(`followup-appointment: WhatsApp sent to ${clientPhone}`, { appointmentId });

    // 6. Marquer followup_sent_at = now() — conditionnel pour éviter race condition
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}&followup_sent_at=is.null`,
      {
        method: "PATCH",
        headers: { ...supaHeaders(), Prefer: "return=headers-only" },
        body: JSON.stringify({ followup_sent_at: new Date().toISOString() }),
      }
    );

    const range = patchRes.headers.get("content-range");
    const total = range?.split("/")[1];
    const marked = patchRes.ok && total !== "0";
    logger.info(`followup-appointment: marked followup_sent_at`, { appointmentId, marked });

    return { sent: true, marked };
  },
});
