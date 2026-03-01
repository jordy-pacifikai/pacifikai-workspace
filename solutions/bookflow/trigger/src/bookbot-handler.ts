import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { loadOrCreateSession, loadBusinessConfig } from "./lib/supabase.js";
import { runBookingAgent } from "./lib/agent.js";
import { sendWhatsApp } from "./lib/whatsapp.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Plan conversation limits
const PLAN_LIMITS: Record<string, number> = {
  essentiel: 200,
  business: 500,
  premium: 999999,
};

function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function checkAndIncrementConversation(
  businessId: string,
): Promise<{ allowed: boolean; plan: string; count: number; limit: number }> {
  // Get current count and plan
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=plan,conversation_count,billing_cycle_start`,
    { headers: supaHeaders() },
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return { allowed: false, plan: "unknown", count: 0, limit: 0 };
  }

  const biz = data[0];
  const plan = biz.plan ?? "essentiel";
  const limit = PLAN_LIMITS[plan] ?? 200;
  const count = biz.conversation_count ?? 0;

  // Check if billing cycle needs reset (monthly)
  const cycleStart = new Date(biz.billing_cycle_start ?? Date.now());
  const now = new Date();
  const daysSinceReset = (now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceReset >= 30) {
    // Reset counter
    await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}`,
      {
        method: "PATCH",
        headers: supaHeaders(),
        body: JSON.stringify({
          conversation_count: 1,
          billing_cycle_start: now.toISOString(),
        }),
      },
    );
    return { allowed: true, plan, count: 1, limit };
  }

  if (count >= limit) {
    return { allowed: false, plan, count, limit };
  }

  // Increment
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}`,
    {
      method: "PATCH",
      headers: supaHeaders(),
      body: JSON.stringify({
        conversation_count: count + 1,
      }),
    },
  );

  return { allowed: true, plan, count: count + 1, limit };
}

export const bookbotHandler = schemaTask({
  id: "bookbot-whatsapp-handler",
  schema: z.object({
    from: z.string(),
    message: z.string(),
    buttonPayload: z.string().nullable(),
    messageType: z.enum(["text", "button", "interactive"]),
    businessId: z.string().uuid(),
  }),
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 15000,
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

    // Run conversational AI agent (Claude tool_use loop)
    const reply = await runBookingAgent(
      session,
      {
        from: payload.from,
        message: payload.message,
        buttonPayload: payload.buttonPayload,
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
