import {
  sendWhatsApp
} from "../../../../../../../../chunk-53YBH57J.mjs";
import {
  logger,
  schemaTask
} from "../../../../../../../../chunk-G5XPZL6L.mjs";
import "../../../../../../../../chunk-LQDRVYE2.mjs";
import {
  runBookingAgent
} from "../../../../../../../../chunk-PI6QB4QI.mjs";
import "../../../../../../../../chunk-EUXJSKKR.mjs";
import {
  loadBusinessConfig,
  loadOrCreateSession
} from "../../../../../../../../chunk-UNIV7FH3.mjs";
import "../../../../../../../../chunk-LQVT3GI2.mjs";
import "../../../../../../../../chunk-TYSZGBBI.mjs";
import {
  external_exports
} from "../../../../../../../../chunk-ALSC375A.mjs";
import {
  __name,
  init_esm
} from "../../../../../../../../chunk-DB4FHRYB.mjs";

// src/bookbot-handler.ts
init_esm();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var PLAN_LIMITS = {
  essentiel: 200,
  business: 500,
  premium: 999999
};
function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
}
__name(supaHeaders, "supaHeaders");
async function checkAndIncrementConversation(businessId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&select=plan,conversation_count,billing_cycle_start`,
    { headers: supaHeaders() }
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return { allowed: false, plan: "unknown", count: 0, limit: 0 };
  }
  const biz = data[0];
  const plan = biz.plan ?? "essentiel";
  const limit = PLAN_LIMITS[plan] ?? 200;
  const count = biz.conversation_count ?? 0;
  const cycleStart = new Date(biz.billing_cycle_start ?? Date.now());
  const now = /* @__PURE__ */ new Date();
  const daysSinceReset = (now.getTime() - cycleStart.getTime()) / (1e3 * 60 * 60 * 24);
  if (daysSinceReset >= 30) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}`,
      {
        method: "PATCH",
        headers: supaHeaders(),
        body: JSON.stringify({
          conversation_count: 1,
          billing_cycle_start: now.toISOString()
        })
      }
    );
    return { allowed: true, plan, count: 1, limit };
  }
  if (count >= limit) {
    return { allowed: false, plan, count, limit };
  }
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}`,
    {
      method: "PATCH",
      headers: supaHeaders(),
      body: JSON.stringify({
        conversation_count: count + 1
      })
    }
  );
  return { allowed: true, plan, count: count + 1, limit };
}
__name(checkAndIncrementConversation, "checkAndIncrementConversation");
var bookbotHandler = schemaTask({
  id: "bookbot-whatsapp-handler",
  schema: external_exports.object({
    from: external_exports.string(),
    message: external_exports.string(),
    buttonPayload: external_exports.string().nullable(),
    messageType: external_exports.enum(["text", "button", "interactive"]),
    businessId: external_exports.string().uuid()
  }),
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1e3,
    maxTimeoutInMs: 15e3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    logger.info("Ve'a incoming", {
      from: payload.from,
      message: payload.message.substring(0, 50),
      type: payload.messageType
    });
    const config = await loadBusinessConfig(payload.businessId);
    if (!config) {
      logger.error("Business not found", { businessId: payload.businessId });
      return { error: "business_not_found" };
    }
    const quota = await checkAndIncrementConversation(payload.businessId);
    if (!quota.allowed) {
      logger.warn("Plan limit reached", {
        businessId: payload.businessId,
        plan: quota.plan,
        count: quota.count,
        limit: quota.limit
      });
      const limitMsg = "Désolé, le nombre maximum de conversations pour ce mois a été atteint. Contactez le responsable pour passer au plan supérieur. Merci de votre compréhension !";
      await sendWhatsApp(payload.from, limitMsg, config);
      return { error: "plan_limit_reached", plan: quota.plan };
    }
    const session = await loadOrCreateSession(payload.from, payload.businessId);
    logger.info("Session loaded", {
      state: session.state,
      phone: payload.from,
      quota: `${quota.count}/${quota.limit}`
    });
    const reply = await runBookingAgent(
      session,
      {
        from: payload.from,
        message: payload.message,
        buttonPayload: payload.buttonPayload
      },
      config
    );
    logger.info("Agent reply", {
      phone: payload.from,
      replyLength: reply.length
    });
    await sendWhatsApp(payload.from, reply, config);
    return { reply, previousState: session.state, quota };
  }, "run")
});
export {
  bookbotHandler
};
//# sourceMappingURL=bookbot-handler.mjs.map
