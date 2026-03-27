import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { createNotification } from "./lib/notify.js";
import type { BusinessConfig } from "./lib/config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface Business {
  id: string;
  name: string;
  config: Record<string, unknown>;
  phone?: string;
  twilio_sid?: string;
  twilio_token?: string;
  twilio_from?: string;
  phone_number_id?: string;
  meta_access_token?: string;
  timezone?: string;
  booking_slug?: string;
}

/**
 * Sends an instant WhatsApp confirmation to the client right after booking.
 * Triggered fire-and-forget from the booking POST endpoint.
 */
export const sendConfirmationWhatsApp = schemaTask({
  id: "send-confirmation-whatsapp",
  retry: { maxAttempts: 1 }, // not idempotent — don't retry to avoid duplicate sends
  schema: z.object({
    appointmentId: z.string().uuid(),
    businessId: z.string().uuid(),
    clientPhone: z.string(),
    clientName: z.string(),
    service: z.string(),
    appointmentDate: z.string(), // YYYY-MM-DD
    timeSlot: z.string(), // HH:MM
  }),
  run: async (payload) => {
    // 1. Fetch business details for WhatsApp credentials
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${payload.businessId}&select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
      { headers: supaHeaders() },
    );
    const bizData = await bizRes.json();
    const biz: Business | null = Array.isArray(bizData) && bizData.length > 0 ? bizData[0] : null;

    if (!biz) {
      logger.error("Business not found for WhatsApp confirmation", {
        businessId: payload.businessId,
      });
      return { sent: false, reason: "business_not_found" };
    }

    const cfg = (biz.config ?? {}) as Record<string, unknown>;
    const businessConfig: BusinessConfig = {
      businessId: biz.id,
      businessName: biz.name ?? "",
      services: [],
      openingHours: {},
      timezone: biz.timezone ?? "Pacific/Tahiti",
      humanPhone: (cfg.human_phone as string) ?? (biz.phone as string) ?? "",
      provider: biz.phone_number_id ? "meta" : "twilio",
      twilioSid: biz.twilio_sid,
      twilioToken: biz.twilio_token,
      twilioFrom: biz.twilio_from,
      metaPhoneNumberId: biz.phone_number_id,
      metaAccessToken: biz.meta_access_token,
      chatbotConfig: cfg,
    };

    // 2. Format the date in French
    const dateObj = new Date(payload.appointmentDate + "T12:00:00");
    const dateFr = dateObj.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // 3. Build reschedule link
    const bookingSlug = biz.booking_slug ?? payload.businessId;
    const rescheduleLink = `https://vea.pacifikai.com/book/${bookingSlug}/reschedule?appointment_id=${payload.appointmentId}`;

    // 4. Compose and send WhatsApp message
    const businessName = biz.name ?? "Votre prestataire";
    const name = payload.clientName || "Bonjour";
    const service = payload.service || "votre rendez-vous";

    const msg = `${name}, ton RDV est confirmé !\n\n` +
      `📋 ${service}\n` +
      `📅 ${dateFr}\n` +
      `🕐 ${payload.timeSlot}\n` +
      `📍 ${businessName}\n\n` +
      `Besoin de modifier ? ${rescheduleLink}\n\n` +
      `À bientôt !`;

    try {
      await sendWhatsApp(payload.clientPhone, msg, businessConfig);
    } catch (err) {
      logger.error("WhatsApp confirmation send failed", {
        appointmentId: payload.appointmentId,
        to: payload.clientPhone,
        error: err instanceof Error ? err.message : String(err),
      });
      return { sent: false, reason: "send_failed" };
    }

    logger.info("WhatsApp confirmation sent", {
      appointmentId: payload.appointmentId,
      to: payload.clientPhone,
      business: businessName,
    });

    // Create in-app notification for business owner
    await createNotification({
      businessId: payload.businessId,
      type: "new_booking",
      title: `Nouveau RDV : ${payload.clientName || "Client"}`,
      message: `${payload.clientName || "Client"} a réservé ${service} le ${dateFr} à ${payload.timeSlot}`,
      metadata: { appointmentId: payload.appointmentId, clientPhone: payload.clientPhone },
    });

    return { sent: true, to: payload.clientPhone };
  },
});
