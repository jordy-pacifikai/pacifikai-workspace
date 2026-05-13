import type { BusinessConfig } from "./config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

interface ReadinessResult {
  ready: boolean;
  missing: string[];
}

/**
 * Check if a business has minimum data configured for the AI agent.
 * Blocks AI from running if essential data is missing (avoids hallucinations).
 */
export async function checkBusinessReadiness(
  config: BusinessConfig,
): Promise<ReadinessResult> {
  const missing: string[] = [];

  // Must have at least 1 service
  if (!config.services || config.services.length === 0) {
    missing.push("services");
  }

  // Must have opening hours configured (at least 1 day)
  const hoursKeys = Object.keys(config.openingHours ?? {});
  if (hoursKeys.length === 0) {
    missing.push("horaires");
  }

  // Must have at least 1 knowledge doc OR a custom system prompt
  const hasCustomPrompt = !!(config.chatbotConfig as Record<string, unknown>)?.ai_system_prompt;
  if (!hasCustomPrompt) {
    const kbCount = await countKnowledgeDocs(config.businessId);
    if (kbCount === 0) {
      missing.push("base de connaissances");
    }
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

async function countKnowledgeDocs(businessId: string): Promise<number> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_knowledge?business_id=eq.${businessId}&select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "count=exact",
        },
      },
    );
    const countHeader = res.headers.get("content-range");
    if (countHeader) {
      // Format: "0-0/5" or "*/0"
      const total = countHeader.split("/")[1];
      return total ? parseInt(total, 10) : 0;
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

/** Human-readable message for clients when AI is not ready */
export function notReadyMessage(businessName: string, missing: string[]): string {
  return (
    `Merci pour votre message ! L'assistant de ${businessName} est en cours de configuration. ` +
    `Un membre de l'équipe vous répondra très bientôt.`
  );
}
