import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { loadOrCreateSession, loadBusinessConfig } from "./lib/supabase.js";
import { runBookingAgent } from "./lib/agent.js";
import { sendWhatsApp, sendWhatsAppButtons, sendWhatsAppList, markAsRead, sendTypingIndicator, supportsInteractive } from "./lib/whatsapp.js";
import type { BusinessConfig } from "./lib/config.js";

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

/**
 * Detect structured patterns in the agent reply and send as interactive message.
 * Returns true if an interactive message was sent, false if plain text fallback needed.
 *
 * Patterns detected:
 * 1. Time slot list: "Créneaux disponibles le ... :\n- 9h00\n- 9h30\n..."
 * 2. Confirmation prompt ending with "?" after a proposal
 * 3. Service list: "- Service: 30 min, 3 000 XPF\n..."
 */
async function trySendInteractive(
  to: string,
  reply: string,
  config: BusinessConfig,
): Promise<boolean> {
  try {
    // Pattern 1: Time slot list (from check_availability)
    // Accent-insensitive: LLM may output "Créneaux" or "Creneaux"
    const slotMatch = reply.match(
      /^(.*?Cr[eéè]neaux disponibles.*?:)\n((?:- \d{1,2}h\d{2}\n?)+)/si,
    );
    if (slotMatch) {
      const headerText = slotMatch[1]!.trim();
      const slots = [...slotMatch[2]!.matchAll(/- (\d{1,2}h\d{2})/g)]
        .map((m) => m[1]!)
        .slice(0, 10); // WhatsApp list max 10

      if (slots.length > 0 && slots.length <= 10) {
        await sendWhatsAppList(
          to,
          headerText,
          "Choisir un créneau",
          slots.map((s) => ({
            id: `slot_${s.replace("h", ":")}`,
            title: s,
          })),
          config,
        );
        return true;
      }
    }

    // Pattern 2: Confirmation question (ends with "?" and mentions a time/service)
    // Accent-insensitive: LLM may output "réserve"/"reserve", "ça"/"ca"
    const confirmMatch = reply.match(
      /^(.*(?:confirme|bon pour toi|r[eé]serve|on confirme|[cç]a te va|d'accord)\s*\?)\s*$/is,
    );
    if (confirmMatch) {
      await sendWhatsAppButtons(
        to,
        reply.trim(),
        [
          { id: "confirm_yes", title: "Oui, je confirme ✅" },
          { id: "confirm_no", title: "Non, changer" },
        ],
        config,
      );
      return true;
    }

    // Pattern 3: Next available dates suggestion
    const dateMatch = reply.match(
      /^(.*?dates possibles.*?:)\n((?:- .+\n?)+)/s,
    );
    if (dateMatch) {
      const headerText = dateMatch[1]!.trim();
      const dates = [...dateMatch[2]!.matchAll(/- (.+?) \((\d{4}-\d{2}-\d{2})\)/g)]
        .map((m) => ({ label: m[1]!, value: m[2]! }))
        .slice(0, 3);

      if (dates.length > 0 && dates.length <= 3) {
        await sendWhatsAppButtons(
          to,
          headerText,
          dates.map((d) => ({
            id: `date_${d.value}`,
            title: d.label.slice(0, 20),
          })),
          config,
        );
        return true;
      }
    }
    // Pattern 4: Service list (from list_services tool)
    const serviceMatch = reply.match(
      /^((?:- .+:\s*\d+\s*min,\s*[\d\s]+XPF\n?){2,})/s,
    );
    if (serviceMatch) {
      const services = [...serviceMatch[1]!.matchAll(/- (.+?):\s*(\d+)\s*min,\s*([\d\s]+XPF)/g)]
        .map((m) => ({
          name: m[1]!.trim(),
          duration: m[2]!,
          price: m[3]!.trim(),
        }))
        .slice(0, 10);

      if (services.length >= 2) {
        await sendWhatsAppList(
          to,
          "Voici nos services disponibles. Lequel t'intéresse ?",
          "Voir les services",
          services.map((s) => ({
            id: `svc_${s.name.slice(0, 50)}`,
            title: s.name.slice(0, 24),
            description: `${s.duration} min — ${s.price}`,
          })),
          config,
        );
        return true;
      }
    }
  } catch (err) {
    // Fallback to plain text on any error
    logger.warn("[Interactive] Failed, falling back to text", { error: String(err) });
  }
  return false;
}

export const bookbotHandler = schemaTask({
  id: "bookbot-whatsapp-handler",
  schema: z.object({
    from: z.string(),
    message: z.string(),
    buttonPayload: z.string().nullable(),
    messageType: z.enum(["text", "button", "interactive"]),
    businessId: z.string().uuid(),
    channel: z.enum(["whatsapp", "messenger", "instagram", "unipile_messenger", "unipile_instagram", "bridge_messenger"]).optional(),
    senderName: z.string().optional(),
    pageAccessToken: z.string().optional(),
    messageId: z.string().optional(),
    unipileChatId: z.string().optional(),
    unipileAccountId: z.string().optional(),
    bridgeThreadId: z.string().optional(),
    bridgeSenderId: z.string().optional(),
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

    // Mark incoming message as read (blue checks) + show typing indicator
    if (payload.messageId && payload.channel === "whatsapp") {
      await markAsRead(payload.messageId, config);
    }
    await sendTypingIndicator(payload.from, config, payload.pageAccessToken);

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

    // If we have a sender name from Messenger/IG, sanitize + store in session + DB
    if (payload.senderName && !session.client_name) {
      // Strip control chars, limit length, remove potential injection patterns
      const safeName = payload.senderName
        .replace(/[\x00-\x1f\x7f]/g, "")
        .replace(/[<>{}[\]]/g, "")
        .trim()
        .slice(0, 50);
      if (safeName.length > 0) {
        session.client_name = safeName;
        await fetch(
          `${SUPABASE_URL}/rest/v1/bookbot_sessions?id=eq.${session.id}`,
          {
            method: "PATCH",
            headers: supaHeaders(),
            body: JSON.stringify({ client_name: safeName }),
          },
        );
        logger.info("Stored sender name from social", { name: safeName });
      }
    }

    // Translate interactive button/list payloads to natural language
    // When user taps a WhatsApp button/list item, message=title (human-readable), buttonPayload=id (machine)
    // Prefer the human-readable title; use payload ID only when message is empty
    const effectiveMessage = payload.message || payload.buttonPayload || "";
    const effectivePayload = payload.buttonPayload;

    // Run conversational AI agent (DeepSeek tool_use loop)
    const agentStart = Date.now();
    const reply = await runBookingAgent(
      session,
      {
        from: payload.from,
        message: effectiveMessage,
        buttonPayload: effectivePayload,
        channel: payload.channel,
      },
      config
    );
    const agentLatencyMs = Date.now() - agentStart;

    logger.info("Agent reply", {
      phone: payload.from,
      replyLength: reply.length,
      agentLatencyMs,
    });

    // Guard: never send empty/null reply to client
    if (!reply || reply.trim().length === 0) {
      logger.error("Agent returned empty reply", { phone: payload.from, agentLatencyMs });
      const fallback = "Désolé, une erreur technique s'est produite. Réessayez dans quelques secondes.";
      await sendWhatsApp(payload.from, fallback, config, payload.pageAccessToken);
      return { reply: fallback, previousState: session.state, quota, error: "empty_reply" };
    }

    // Send reply with interactive elements when possible (WhatsApp only)
    const channel = supportsInteractive(payload.from);
    if (channel === "whatsapp") {
      const sent = await trySendInteractive(payload.from, reply, config);
      if (!sent) {
        await sendWhatsApp(payload.from, reply, config, payload.pageAccessToken);
      }
    } else {
      await sendWhatsApp(payload.from, reply, config, payload.pageAccessToken);
    }

    return { reply, previousState: session.state, quota };
  },
});
