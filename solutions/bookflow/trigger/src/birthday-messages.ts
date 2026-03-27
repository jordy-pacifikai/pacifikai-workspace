import { schedules, logger } from "@trigger.dev/sdk";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { buildBusinessConfig } from "./lib/config.js";
import type { BusinessRow } from "./lib/config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  birthday_msg_sent_at: string | null;
}

/**
 * Birthday messages — runs daily at 8:00 AM Tahiti time (18:00 UTC).
 *
 * For each business with birthday_messages enabled, finds clients whose
 * birthday matches today's month+day and sends a warm WhatsApp wish
 * with a rebooking link and -10% offer.
 */
export const sendBirthdayMessages = schedules.task({
  id: "send-birthday-messages",
  cron: "0 18 * * *", // 8:00 AM Pacific/Tahiti
  retry: { maxAttempts: 2, factor: 2, minTimeoutInMs: 5000 },
  run: async () => {
    // 1. Fetch all businesses
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
      { headers: supaHeaders() },
    );
    const businesses: BusinessRow[] = await bizRes.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return { sent: 0, businesses: 0 };
    }

    // Today's month and day (Tahiti timezone)
    const now = new Date();
    const tahitiDate = now.toLocaleDateString("en-CA", { timeZone: "Pacific/Tahiti" }); // YYYY-MM-DD
    const parts = tahitiDate.split("-");
    const todayMonth = parseInt(parts[1] ?? "0", 10);
    const todayDay = parseInt(parts[2] ?? "0", 10);

    // 11 months ago cutoff for birthday_msg_sent_at
    const elevenMonthsAgo = new Date(now.getTime() - 11 * 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalSent = 0;
    let bizCount = 0;

    for (const biz of businesses) {
      const cfg = (biz.config ?? {}) as Record<string, unknown>;

      // Skip businesses that disabled birthday messages
      if (cfg.birthday_messages === false) continue;

      // 2. Find clients with a birthday matching today's month+day
      //    Filter: birthday is not null, client has a phone
      const clientRes = await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_clients?business_id=eq.${biz.id}&birthday=not.is.null&phone=not.is.null&marketing_opt_out=eq.false&select=id,name,phone,birthday,birthday_msg_sent_at`,
        { headers: supaHeaders() },
      );
      const clients: BirthdayClient[] = await clientRes.json();

      if (!Array.isArray(clients) || clients.length === 0) continue;

      // Filter by month+day match (any year) and sent_at check
      const birthdayClients = clients.filter((c) => {
        if (!c.birthday || !c.phone) return false;

        const bParts = c.birthday.split("-");
        if (parseInt(bParts[1] ?? "0", 10) !== todayMonth || parseInt(bParts[2] ?? "0", 10) !== todayDay) {
          return false;
        }

        // Skip if already sent within last 11 months
        if (c.birthday_msg_sent_at) {
          const sentAt = new Date(c.birthday_msg_sent_at);
          if (sentAt.toISOString() > elevenMonthsAgo) return false;
        }

        return true;
      });

      if (birthdayClients.length === 0) continue;

      const businessConfig = buildBusinessConfig(biz);
      const slug = biz.booking_slug ?? biz.id;
      const bookingUrl = `https://vea.pacifikai.com/book/${slug}`;
      let bizSent = 0;

      for (const client of birthdayClients) {
        const firstName = client.name.split(" ")[0] || client.name;
        const message =
          `Joyeux anniversaire ${firstName} ! 🎂 Toute l'equipe de ${biz.name} vous souhaite une excellente journee. ` +
          `Pour celebrer, profitez de -10% sur votre prochain rendez-vous : ${bookingUrl}`;

        try {
          await sendWhatsApp(client.phone, message, businessConfig);

          // Update birthday_msg_sent_at
          await fetch(
            `${SUPABASE_URL}/rest/v1/bookbot_clients?id=eq.${client.id}`,
            {
              method: "PATCH",
              headers: { ...supaHeaders(), Prefer: "return=minimal" },
              body: JSON.stringify({ birthday_msg_sent_at: new Date().toISOString() }),
            },
          );

          bizSent++;
          logger.info(`Birthday message sent to ${client.name} (${client.phone}) for ${biz.name}`);
        } catch (err) {
          logger.error(`Failed birthday message for ${client.name} at ${biz.name}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      totalSent += bizSent;
      if (bizSent > 0) bizCount++;
    }

    logger.info(`Birthday messages: ${totalSent} sent across ${bizCount} businesses`);
    return { sent: totalSent, businesses: bizCount };
  },
});
