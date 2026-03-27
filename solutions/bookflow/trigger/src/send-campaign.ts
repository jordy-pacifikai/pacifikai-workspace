import { schemaTask, logger, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { sendWhatsApp } from "./lib/whatsapp.js";
import { supaHeaders } from "./lib/supabase-headers.js";
import { buildBusinessConfig } from "./lib/config.js";
import type { BusinessRow } from "./lib/config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface CampaignRow {
  id: string;
  business_id: string;
  name: string;
  message_template: string;
  segment_type: string;
  segment_value: string | null;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
}

interface ClientRow {
  id: string;
  name: string;
  phone: string;
  tags: string[] | null;
}

function buildSegmentFilter(segmentType: string, segmentValue: string | null): string {
  const now = new Date();

  switch (segmentType) {
    case "inactive_30d": {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      return `&or=(last_visit_at.lt.${cutoff},last_visit_at.is.null)`;
    }
    case "inactive_60d": {
      const cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
      return `&or=(last_visit_at.lt.${cutoff},last_visit_at.is.null)`;
    }
    case "no_show":
      // no_show_count column doesn't exist — return impossible filter to produce 0 recipients
      // This prevents sending to ALL clients. TODO: implement proper no-show tracking
      return "&id=eq.00000000-0000-0000-0000-000000000000";
    case "new_clients": {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      return `&created_at=gte.${cutoff}`;
    }
    case "custom_tag":
      if (segmentValue && /^[a-zA-Z0-9_-]{1,50}$/.test(segmentValue)) {
        return `&tags=cs.{${encodeURIComponent(segmentValue)}}`;
      }
      if (segmentValue) {
        logger.warn("Invalid custom_tag format, sending to all clients", { segmentValue });
      }
      return "";
    case "all":
    default:
      return "";
  }
}

function replaceVariables(
  template: string,
  clientName: string,
  businessName: string,
  bookingUrl: string,
): string {
  return template
    .replace(/\{nom\}/g, clientName || "Bonjour")
    .replace(/\{business\}/g, businessName)
    .replace(/\{lien_booking\}/g, bookingUrl);
}

async function updateCampaign(
  campaignId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_campaigns?id=eq.${campaignId}`,
    {
      method: "PATCH",
      headers: supaHeaders(),
      body: JSON.stringify(fields),
    },
  );
}

export const sendCampaignTask = schemaTask({
  id: "send-whatsapp-campaign",
  schema: z.object({
    campaignId: z.string().uuid(),
    businessId: z.string().uuid(),
  }),
  retry: {
    maxAttempts: 1,
  },
  onFailure: async ({ payload }) => {
    // Reset campaign from "sending" back to "failed" so it doesn't stay stuck forever
    logger.error(`Campaign task crashed, resetting ${payload.campaignId} to failed`);
    await updateCampaign(payload.campaignId, {
      status: "failed",
      updated_at: new Date().toISOString(),
    });
  },
  run: async ({ campaignId, businessId }) => {
    // 1. Atomic lock: transition draft→sending (prevents double-send race)
    const lockRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_campaigns?id=eq.${campaignId}&status=eq.draft`,
      {
        method: "PATCH",
        headers: { ...supaHeaders(), Prefer: "return=representation" },
        body: JSON.stringify({ status: "sending" }),
      },
    );
    const locked: CampaignRow[] = await lockRes.json();
    if (!Array.isArray(locked) || locked.length === 0) {
      // Either not found or already processing
      logger.warn(`Campaign ${campaignId} not in draft status or not found, skipping`);
      return { error: "already_processed" };
    }
    const campaign = locked[0]!;

    // 2. Fetch business
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=id,name,config,phone,twilio_sid,twilio_token,twilio_from,phone_number_id,meta_access_token,timezone,booking_slug`,
      { headers: supaHeaders() },
    );
    const businesses: BusinessRow[] = await bizRes.json();
    const biz = businesses?.[0];

    if (!biz) {
      await updateCampaign(campaignId, { status: "failed" });
      logger.error(`Business ${businessId} not found`);
      return { error: "business_not_found" };
    }

    const businessConfig = buildBusinessConfig(biz);
    const bookingUrl = `https://vea.pacifikai.com/book/${biz.booking_slug ?? biz.id}`;

    // 3. Fetch clients matching segment
    const segmentFilter = buildSegmentFilter(campaign.segment_type, campaign.segment_value);
    const clientsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_clients?business_id=eq.${businessId}&phone=not.is.null&marketing_opt_out=eq.false&select=id,name,phone,tags${segmentFilter}`,
      { headers: supaHeaders() },
    );
    const clients: ClientRow[] = await clientsRes.json();

    if (!Array.isArray(clients) || clients.length === 0) {
      await updateCampaign(campaignId, {
        status: "sent",
        total_recipients: 0,
        sent_count: 0,
        sent_at: new Date().toISOString(),
      });
      logger.info(`Campaign ${campaignId}: no recipients found`);
      return { sent: 0, total: 0 };
    }

    // 4. Update recipient count (status already set to 'sending' by atomic lock above)
    await updateCampaign(campaignId, {
      total_recipients: clients.length,
    });

    logger.info(`Campaign ${campaignId}: sending to ${clients.length} clients`);

    // 5. Send messages with rate limiting
    let sentCount = 0;
    let failedCount = 0;

    for (const client of clients) {
      const message = replaceVariables(
        campaign.message_template,
        client.name,
        biz.name,
        bookingUrl,
      ) + "\n\n_Repondez STOP pour ne plus recevoir de messages promotionnels._";

      try {
        await sendWhatsApp(client.phone, message, businessConfig);
        sentCount++;
        logger.info(`Sent to ${client.phone} (${client.name})`);
      } catch (err) {
        failedCount++;
        logger.error(`Failed to send to ${client.phone}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }

      // Update counts incrementally every 10 messages
      if ((sentCount + failedCount) % 10 === 0) {
        await updateCampaign(campaignId, {
          sent_count: sentCount,
          failed_count: failedCount,
        });
      }

      // Rate limit: 1 message per second
      if (sentCount + failedCount < clients.length) {
        await wait.for({ seconds: 1 });
      }
    }

    // 6. Final update
    await updateCampaign(campaignId, {
      status: failedCount === clients.length ? "failed" : "sent",
      sent_count: sentCount,
      failed_count: failedCount,
      sent_at: new Date().toISOString(),
    });

    logger.info(
      `Campaign ${campaignId} complete: ${sentCount} sent, ${failedCount} failed out of ${clients.length}`,
    );

    return { sent: sentCount, failed: failedCount, total: clients.length };
  },
});

