import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { loadOrCreateSession, loadBusinessConfig } from "./lib/supabase.js";
import { runBookingAgent } from "./lib/agent.js";
import { sendWhatsApp } from "./lib/whatsapp.js";

import { supaHeaders } from "./lib/supabase-headers.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

async function checkAndIncrementConversation(
  businessId: string,
): Promise<{ allowed: boolean; plan: string; count: number; limit: number }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_conversation_count`, {
    method: "POST",
    headers: supaHeaders(),
    body: JSON.stringify({ biz_id: businessId }),
  });
  const data = await res.json();

  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    logger.error("RPC increment_conversation_count failed", { status: res.status, data });
    return { allowed: false, plan: "unknown", count: 0, limit: 0 };
  }

  const row = data[0];
  return {
    allowed: row.allowed,
    plan: row.plan,
    count: row.new_count,
    limit: row.limit_val,
  };
}

export const bookbotHandler = schemaTask({
  id: "bookbot-whatsapp-handler",
  schema: z.object({
    from: z.string(),
    message: z.string(),
    buttonPayload: z.string().nullable(),
    messageType: z.enum(["text", "button", "interactive"]),
    businessId: z.string().uuid(),
    channel: z.enum(["whatsapp", "messenger", "instagram"]).optional(),
    senderName: z.string().optional(),
    pageAccessToken: z.string().optional(),
  }),
  retry: {
    maxAttempts: 1, // No retries — agent + sendWhatsApp are not idempotent (would re-send messages)
  },
  run: async (payload) => {
    logger.info("Ve'a incoming", {
      from: payload.from,
      message: payload.message.substring(0, 50),
      type: payload.messageType,
    });

    // Load business config from Supabase
    const config = await loadBusinessConfig(payload.businessId);
    if (!config) {
      logger.error("Business not found", { businessId: payload.businessId });
      return { error: "business_not_found" };
    }

    // Check plan limits
    const quota = await checkAndIncrementConversation(payload.businessId);
    if (!quota.allowed) {
      logger.warn("Plan limit reached", {
        businessId: payload.businessId,
        plan: quota.plan,
        count: quota.count,
        limit: quota.limit,
      });

      const limitMsg =
        "Désolé, le nombre maximum de conversations pour ce mois a été atteint. " +
        "Contactez le responsable pour passer au plan supérieur. Merci de votre compréhension !";

      await sendWhatsApp(payload.from, limitMsg, config);
      return { error: "plan_limit_reached", plan: quota.plan };
    }

    // Load or create session
    const session = await loadOrCreateSession(payload.from, payload.businessId);
    logger.info("Session loaded", {
      state: session.state,
      phone: payload.from,
      quota: `${quota.count}/${quota.limit}`,
    });

    // If we have a sender name from Messenger/IG, store it in session + DB
    if (payload.senderName && !session.client_name) {
      session.client_name = payload.senderName;
      await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_sessions?id=eq.${session.id}`,
        {
          method: "PATCH",
          headers: supaHeaders(),
          body: JSON.stringify({ client_name: payload.senderName }),
        },
      );
      logger.info("Stored sender name from social", { name: payload.senderName });
    }

    // Run conversational AI agent (Claude tool_use loop)
    const reply = await runBookingAgent(
      session,
      {
        from: payload.from,
        message: payload.message,
        buttonPayload: payload.buttonPayload,
        channel: payload.channel,
      },
      config
    );

    logger.info("Agent reply", {
      phone: payload.from,
      replyLength: reply.length,
    });

    // Send reply
    await sendWhatsApp(payload.from, reply, config);

    return { reply, previousState: session.state, quota };
  },
});
