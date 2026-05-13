import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@trigger.dev/sdk";
import type { BusinessConfig } from "./config.js";
import { parseAllServices } from "./config.js";
import { computeEndTime } from "./time-utils.js";
import {
  loadOrCreateSession,
  updateSession,
  createAppointment,
  updateAppointmentGCalId,
  getClientAppointments,
  cancelActiveAppointment,
  rescheduleAppointment,
  getBookingsForDate,
  getBlockedSlotsForDate,
  getAllDayBlockedDates,
  searchKnowledgeBase,
  refreshGCalBlockedSlots,
  getClientHints,
  getUpcomingClosures,
} from "./supabase.js";
import { createGCalEvent, deleteGCalEvent, listGCalEvents } from "./gcal.js";
import { generateAvailableDates, generateTimeSlots } from "../utils/dates.js";
import { supaHeaders } from "./supabase-headers.js";
import type { Session } from "./supabase.js";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const SUPABASE_URL = process.env.SUPABASE_URL!;

const DEEPSEEK_TIMEOUT_MS = 8000;

const FALLBACK_MESSAGE =
  "Désolé, notre assistant est momentanément indisponible. Veuillez réessayer dans quelques instants.";

/** Call a fallback LLM via OpenAI-compatible API (same pattern as MANA chatbot).
 *  Cascade: Gemini Flash (free) → Groq Llama (free) → Claude Haiku (paid) → gives up.
 *  Gemini/Groq use OpenAI-compatible format. Claude Haiku uses native Anthropic SDK. */
async function callFallbackLLM(
  messages: OpenAI.ChatCompletionMessageParam[],
  tools: OpenAI.ChatCompletionTool[]
): Promise<OpenAI.ChatCompletion | null> {
  const providers = [
    ...(GEMINI_API_KEY
      ? [{
          name: "Gemini Flash",
          url: "https://generativelanguage.googleapis.com/v1beta/chat/completions",
          key: GEMINI_API_KEY,
          model: "gemini-2.5-flash",
        }]
      : []),
    ...(GROQ_API_KEY
      ? [{
          name: "Groq Llama",
          url: "https://api.groq.com/openai/v1/chat/completions",
          key: GROQ_API_KEY,
          model: "llama-3.3-70b-versatile",
        }]
      : []),
  ];

  for (const provider of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          max_tokens: 1024,
          messages,
          tools: tools.length > 0 ? tools : undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        logger.warn(`[Agent] ${provider.name} fallback HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as OpenAI.ChatCompletion;
      if (data.choices?.[0]) {
        logger.info(`[Agent] ${provider.name} fallback succeeded`);
        return data;
      }
    } catch (err) {
      logger.warn(`[Agent] ${provider.name} fallback error: ${String(err)}`);
    }
  }

  // Last resort: Claude Haiku via Anthropic SDK
  if (ANTHROPIC_API_KEY) {
    try {
      logger.info("[Agent] Trying Claude Haiku fallback");
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

      // Convert OpenAI messages to Anthropic format
      const systemMsg = messages.find((m) => m.role === "system");
      const nonSystemMsgs = messages.filter((m) => m.role !== "system");
      const anthropicMessages: Anthropic.MessageParam[] = nonSystemMsgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: (typeof m.content === "string" ? m.content : "") || "",
        }));

      // Ensure messages alternate and start with user
      if (anthropicMessages.length === 0 || anthropicMessages[0]!.role !== "user") {
        anthropicMessages.unshift({ role: "user", content: "Bonjour" });
      }

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: typeof systemMsg?.content === "string" ? systemMsg.content : "",
        messages: anthropicMessages,
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        logger.info("[Agent] Claude Haiku fallback succeeded");
        // Convert Anthropic response to OpenAI ChatCompletion format
        return {
          id: response.id,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: "claude-haiku-4-5-20251001",
          choices: [{
            index: 0,
            message: { role: "assistant", content: textBlock.text },
            finish_reason: "stop",
            logprobs: null,
          }],
          usage: {
            prompt_tokens: response.usage?.input_tokens ?? 0,
            completion_tokens: response.usage?.output_tokens ?? 0,
            total_tokens: (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
          },
        } as OpenAI.ChatCompletion;
      }
    } catch (err) {
      logger.warn(`[Agent] Claude Haiku fallback error: ${String(err)}`);
    }
  }

  return null;
}

/** Sanitize user-provided instructions before injecting into LLM system prompt */
function sanitizeInstruction(raw: string, businessId?: string): string {
  const sanitized = raw
    .slice(0, 500) // hard cap length
    .replace(/##\s/g, "") // strip markdown headers that could override sections
    .replace(/\bignore\b.{0,40}\b(?:previous|above|system)\b/gi, "")
    .replace(/\bforget\b.{0,40}\binstructions\b/gi, "")
    .replace(/\byou\s+are\s+now\b/gi, "")
    .replace(/\bnew\s+instructions?\b/gi, "")
    .trim();
  if (sanitized.length < raw.trim().slice(0, 500).length) {
    logger.warn("Prompt injection patterns stripped from business instructions", {
      businessId,
      originalLength: raw.length,
      strippedLength: raw.length - sanitized.length,
    });
  }
  return sanitized;
}

const BOOKBOT_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description:
        "Cherche dans la base de connaissances du commerce (FAQ, politiques, détails services, informations pratiques). Utilise cet outil pour répondre aux questions spécifiques du client.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "La question ou le sujet à rechercher",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_services",
      description:
        "Liste tous les services disponibles avec leurs prix et durées. Appelle cet outil quand le client demande ce qui est proposé.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description:
        "Vérifie les créneaux disponibles pour un service à une date donnée. Prend en compte les RDV existants pour ne proposer que les créneaux réellement libres.",
      parameters: {
        type: "object",
        properties: {
          service_name: {
            type: "string",
            description: "Le nom du service demandé",
          },
          date: {
            type: "string",
            description: "La date au format YYYY-MM-DD",
          },
        },
        required: ["service_name", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description:
        "Crée et enregistre un rendez-vous dans la base de données. Appelle cet outil DÈS QUE le client a confirmé (dit oui/ok/parfait). Sans cet appel, le rendez-vous n'est PAS sauvegardé.",
      parameters: {
        type: "object",
        properties: {
          service: { type: "string", description: "Nom du service" },
          date: { type: "string", description: "Date au format YYYY-MM-DD" },
          time: { type: "string", description: "Heure au format HH:MM" },
          client_name: { type: "string", description: "Prénom ou nom du client" },
          client_phone: { type: "string", description: "Numéro de téléphone du client (si collecté)" },
          client_email: { type: "string", description: "Email du client (si collecté)" },
          client_notes: { type: "string", description: "Notes ou remarques du client (si collecté)" },
        },
        required: ["service", "date", "time", "client_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_appointments",
      description:
        "Récupère les rendez-vous à venir du client (confirmés ou en attente). Utilise cet outil AVANT de proposer un nouveau créneau pour vérifier si le client a déjà un RDV.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description:
        "Annule le prochain rendez-vous confirmé du client. Demande confirmation avant d'annuler.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_appointment",
      description:
        "Déplace le prochain rendez-vous confirmé du client vers une nouvelle date/heure. Vérifie d'abord la disponibilité avec check_availability, puis appelle cet outil.",
      parameters: {
        type: "object",
        properties: {
          new_date: { type: "string", description: "Nouvelle date au format YYYY-MM-DD" },
          new_time: { type: "string", description: "Nouvelle heure au format HH:MM" },
        },
        required: ["new_date", "new_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_next_available",
      description:
        "Trouve le prochain créneau disponible pour un service, sans que le client ait besoin de choisir une date. Idéal quand le client dit 'quand est le prochain créneau' ou veut réserver au plus vite.",
      parameters: {
        type: "object",
        properties: {
          service_name: {
            type: "string",
            description: "Le nom du service demandé",
          },
        },
        required: ["service_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "transfer_to_human",
      description:
        "Transfère la conversation à un humain quand la demande dépasse tes capacités ou que le client le demande explicitement.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Raison du transfert",
          },
        },
        required: ["reason"],
      },
    },
  },
];

function getTahitiDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    timeZone: "Pacific/Tahiti",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTahitiDateISO(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Tahiti",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // "YYYY-MM-DD"
}

function channelLabel(channel: string): string {
  switch (channel) {
    case "messenger": return "Messenger";
    case "instagram": return "Instagram";
    default: return "WhatsApp";
  }
}

async function buildSystemPrompt(config: BusinessConfig, today: string, channel = "whatsapp"): Promise<string> {
  const parsedServices = parseAllServices(config.services);
  const servicesText = parsedServices
    .map((s) => `- ${s.name} (${s.duration} min, ${s.price.toLocaleString("fr-FR")} XPF)`)
    .join("\n");

  const dayLabels: Record<string, string> = {
    mon: "Lundi", tue: "Mardi", wed: "Mercredi", thu: "Jeudi",
    fri: "Vendredi", sat: "Samedi", sun: "Dimanche",
  };

  const hoursMap: Record<string, string> = {};
  for (const [day, h] of Object.entries(config.openingHours)) {
    hoursMap[dayLabels[day] ?? day] = h as string;
  }
  const hoursText = Object.entries(hoursMap).map(([d, h]) => `${d}: ${h}`).join("\n");

  // Fetch upcoming closures (next 30 days)
  let closures: { date: string; label?: string }[] = [];
  try {
    closures = await getUpcomingClosures(config.businessId, 30);
  } catch { /* non-blocking */ }

  // ── Structured business data block (source of truth) ──
  const businessData = {
    nom: config.businessName,
    services: parsedServices.map((s) => ({ nom: s.name, duree_min: s.duration, prix_xpf: s.price })),
    horaires: hoursMap,
    fermetures_prochaines: closures.map((c) => c.label ? `${c.date} (${c.label})` : c.date),
    timezone: config.timezone,
  };

  // Tone from chatbot config
  const cfg = config.chatbotConfig ?? {};
  const tone =
    cfg.tone === "formel"
      ? "formel et professionnel"
      : cfg.tone === "decontracte"
        ? "décontracté et amical"
        : 'chaleureux et accueillant, utilise "Ia ora na" pour saluer';

  const langMap: Record<string, string> = { fr: "français", en: "anglais", tah: "tahitien (reo Māʼohi)" };
  const language = langMap[(cfg.language as string) ?? "fr"] ?? "français";

  const greeting = (cfg.greeting as string) ?? "";
  const greetingInstruction = greeting
    ? `\n- Quand un client te salue, utilise cette formule de bienvenue : "${greeting}"`
    : "";

  const rawCustomInstructions = (cfg.custom_instructions as string) ?? '';
  const customInstructions = sanitizeInstruction(rawCustomInstructions, config.businessId);
  const customSection = customInstructions
    ? `\n\n## Instructions spéciales du professionnel\n${customInstructions}`
    : '';

  const requiredFields = (cfg.required_fields as string[]) ?? [];
  const fieldLabels: Record<string, string> = { phone: "numéro de téléphone", email: "adresse email", notes: "remarques ou notes" };
  const requiredFieldsSection = requiredFields.length > 0
    ? `\n\n## Informations à collecter AVANT de réserver\nAvant d'appeler \`book_appointment\`, tu DOIS avoir collecté ces informations :\n${requiredFields.map((f) => `- ${fieldLabels[f] ?? f}`).join("\n")}\nSi le client ne les a pas fournies, demande-les poliment.`
    : '';

  const chan = channelLabel(channel);
  const hasBooking = config.services.length > 0;

  // ── Données entreprise structurées (SOURCE DE VERITE) ──
  const dataBlock = `
## DONNEES_ENTREPRISE (SOURCE DE VERITE — NE JAMAIS CONTREDIRE)
\`\`\`json
${JSON.stringify(businessData, null, 2)}
\`\`\``;

  // ── Règle anti-improvisation renforcée ──
  const antiImprovisation = `
## REGLE ABSOLUE — PERIMETRE DE REPONSE
Tu ne possèdes AUCUNE connaissance propre sur cette entreprise.
Tes SEULES sources autorisées sont :
1. Le bloc DONNEES_ENTREPRISE ci-dessus (horaires, services, prix, fermetures)
2. Les résultats des outils (\`search_knowledge_base\`, \`check_availability\`, etc.)
3. Les informations fournies par le client dans la conversation

Si une information n'est dans AUCUNE de ces sources :
→ Utilise \`search_knowledge_base\` pour chercher
→ Si toujours sans réponse → "Je n'ai pas cette information" + \`transfer_to_human\`

NE JAMAIS :
- Inventer un prix, un horaire, un service, un délai, une politique
- Mentionner : appel téléphonique, rappel, confirmation par email/SMS, devis, validation manuelle
- Improviser des formules qui impliquent une action future ("on vous recontactera", "vous recevrez...")`;

  // ── Fermetures si existantes ──
  const closuresSection = closures.length > 0
    ? `\n\n## Fermetures exceptionnelles à venir\n${closures.map((c) => `- ${c.date}${c.label ? ` (${c.label})` : ''}`).join("\n")}\nSi un client demande un RDV sur une de ces dates → informer de la fermeture et proposer une autre date.`
    : '';

  if (!hasBooking) {
    return `Tu es l'assistant ${chan} de ${config.businessName}. Langue : ${language}. Ton : ${tone}.${greetingInstruction}
${dataBlock}
${antiImprovisation}${closuresSection}

## Langue
- Langue par défaut : ${language}
- Si le client écrit en anglais → réponds en anglais. En tahitien → réponds en tahitien.

## Aujourd'hui
${today} (timezone: ${config.timezone})

## Règles OBLIGATOIRES
1. Utilise \`search_knowledge_base\` pour toute question spécifique au business
2. Question hors compétence ou client demande un humain → \`transfer_to_human\`
3. Réponses COURTES (2-4 phrases max) — c'est ${chan}, pas un email
4. Tu ne gères PAS de rendez-vous. Si le client en demande → \`transfer_to_human\`
5. Accueil : présente-toi comme l'assistant de ${config.businessName} et demande comment aider${customSection}`;
  }

  return `Tu es l'assistant ${chan} de ${config.businessName}. Langue : ${language}. Ton : ${tone}.${greetingInstruction}
${dataBlock}
${antiImprovisation}${closuresSection}

## Langue
- Langue par défaut : ${language}
- Si le client écrit en anglais → réponds en anglais. En tahitien → réponds en tahitien.

## Services proposés
${servicesText}

## Horaires d'ouverture
${hoursText}

## Aujourd'hui
${today} (timezone: ${config.timezone})

## Règles OBLIGATOIRES
1. TOUJOURS utiliser \`check_availability\` avant de proposer un créneau — NE JAMAIS inventer de disponibilité
2. TOUJOURS demander confirmation explicite ("C'est bon pour toi ?" ou "Je confirme ?") AVANT d'appeler \`book_appointment\`
3. Quand le client CONFIRME (dit "oui", "ok", "c'est bon", "parfait"...), appelle \`book_appointment\` IMMÉDIATEMENT. NE JAMAIS dire "confirmé" sans avoir appelé l'outil.
4. Demander le prénom du client avant de réserver (sauf si déjà connu)
5. Quand le client veut un RDV → d'abord \`get_my_appointments\` pour vérifier s'il en a déjà un
6. Question hors compétence ou client demande un humain → \`transfer_to_human\`
7. Questions spécifiques (annulation, parking, produits...) → \`search_knowledge_base\`
8. Pour déplacer un RDV existant → \`check_availability\` sur le nouveau créneau puis \`reschedule_appointment\`
9. Réponses COURTES (2-4 phrases max) — c'est ${chan}, pas un email
10. NE JAMAIS proposer de dates dans le passé. Date minimale : demain.
11. Date en texte ("lundi prochain", "demain") → convertis en YYYY-MM-DD avant d'appeler les outils
12. Si un client demande un RDV sur une date de fermeture exceptionnelle → informer et proposer une autre date

## PROCESSUS DE RÉSERVATION (ordre strict)
1. Client demande RDV → demande quel service. Si le client ne précise PAS de date, utilise \`get_next_available\` pour proposer le prochain créneau directement.
2. Si le client a une date en tête → appelle \`check_availability\`
3. Propose le créneau disponible + demande confirmation
4. Client confirme → appelle \`book_appointment\` IMMÉDIATEMENT
5. Après \`book_appointment\`, envoie EXACTEMENT ce message (adapte les valeurs) :
   "✅ RDV confirmé !
   [Service] — [Date lisible] à [Heure]
   À bientôt chez ${config.businessName} !"
   NE PAS ajouter d'autres phrases. NE PAS mentionner d'appel, email, SMS ou autre contact.

## SCRIPTS FIXES (utilise exactement ces formules)
- Après annulation réussie : "✅ Ton rendez-vous a bien été annulé. N'hésite pas si tu veux en reprendre un !"
- Après annulation — aucun RDV trouvé : "Je ne trouve pas de rendez-vous actif pour toi. Si tu penses que c'est une erreur, je peux te mettre en contact avec l'équipe."
- Après déplacement réussi : "✅ Ton rendez-vous a bien été déplacé ! [nouvelles date et heure]. À bientôt !"
- Pour déplacer un RDV : utilise d'abord \`check_availability\` pour le nouveau créneau, puis \`reschedule_appointment\`
- Après \`transfer_to_human\` : "Je te mets en contact avec l'équipe de ${config.businessName}. À très vite !"
- Question sans réponse dans la base : "Je n'ai pas cette information, mais l'équipe de ${config.businessName} pourra t'aider directement."${requiredFieldsSection}${customSection}`;
}

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  clientPhone: string,
  config: BusinessConfig
): Promise<string> {
  switch (name) {
    case "search_knowledge_base": {
      const query = input.query as string;
      const results = await searchKnowledgeBase(config.businessId, query);
      if (results.length === 0) {
        return "Aucune information trouvée dans la base de connaissances pour cette question. Utilise transfer_to_human si le client insiste.";
      }
      return results
        .map((r) => {
          const source = r.title
            ? `[Source: ${r.title}${r.category ? ` — ${r.category}` : ""}]`
            : "[Source: base de connaissances]";
          return `${source}\n${r.chunk_text}`;
        })
        .join("\n\n---\n\n");
    }

    case "list_services": {
      const services = parseAllServices(config.services);
      return services
        .map(
          (s) =>
            `- ${s.name}: ${s.duration} min, ${s.price.toLocaleString("fr-FR")} XPF`
        )
        .join("\n");
    }

    case "check_availability": {
      const serviceName = input.service_name as string;
      const date = input.date as string;

      // Validate date is not in the past
      const todayISO = getTahitiDateISO();
      if (date <= todayISO) {
        return `La date ${date} est dans le passé ou aujourd'hui. Propose une date à partir de demain.`;
      }

      // On-demand GCal refresh for near-future dates (within 2 days)
      // This reduces the 15-min stale window for imminent bookings
      if (config.gcalRefreshToken && config.gcalCalendarId) {
        try {
          const requestedDate = new Date(date + "T00:00:00");
          const twoDaysFromNow = new Date();
          twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
          if (requestedDate <= twoDaysFromNow) {
            // Use business timezone offset (Tahiti = UTC-10) for GCal query bounds
            const tz = config.timezone || "Pacific/Tahiti";
            const dayStartLocal = new Date(`${date}T00:00:00`);
            const dayEndLocal = new Date(`${date}T23:59:59`);
            // Get UTC offset for the business timezone
            const offsetMs = dayStartLocal.getTime() - new Date(dayStartLocal.toLocaleString("en-US", { timeZone: tz })).getTime();
            const dayStart = new Date(dayStartLocal.getTime() - offsetMs).toISOString();
            const dayEnd = new Date(dayEndLocal.getTime() - offsetMs).toISOString();
            const freshEvents = await listGCalEvents(
              config.gcalRefreshToken,
              config.gcalCalendarId,
              dayStart,
              dayEnd
            );
            await refreshGCalBlockedSlots(
              config.businessId,
              date,
              freshEvents,
              config.timezone
            );
          }
        } catch {
          // GCal refresh is best-effort — fall back to cached blocked slots
        }
      }

      // Find the service to get duration
      const services = parseAllServices(config.services);
      const service = services.find(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase()
      );
      const duration = service?.duration ?? 30;

      // Generate all possible slots from opening hours
      const allSlots = generateTimeSlots(
        config.openingHours,
        date,
        duration,
        20
      );

      // Get existing bookings + blocked slots for that date
      const bookings = await getBookingsForDate(config.businessId, date);
      const blockedSlots = await getBlockedSlotsForDate(config.businessId, date);

      // Get all-day blocked dates for suggestions
      const allDayBlockedDates = await getAllDayBlockedDates(config.businessId);

      // If entire day is blocked, return closed message
      if (blockedSlots.some((b) => b.all_day)) {
        const nextDates = generateAvailableDates(config.openingHours, 3, allDayBlockedDates, config.timezone);
        return `Le commerce est fermé le ${date}.\n\nProchaines dates possibles :\n${nextDates.map((d) => `- ${d.label} (${d.value})`).join("\n")}`;
      }

      // Build list of occupied time ranges [startMins, endMins)
      const bufferMin = Math.max(0, Math.min(60, Number((config.chatbotConfig ?? {}).buffer_minutes) || 0));
      const occupiedRanges: { start: number; end: number }[] = [];

      // Add bookings (use end_time if available, else estimate with default 30 min)
      for (const b of bookings) {
        const bParts = b.time_slot.split(":").map(Number);
        const bStart = (bParts[0] ?? 0) * 60 + (bParts[1] ?? 0);
        let bEnd: number;
        if (b.end_time) {
          const eParts = b.end_time.split(":").map(Number);
          bEnd = (eParts[0] ?? 0) * 60 + (eParts[1] ?? 0);
        } else {
          bEnd = bStart + 30;
        }
        occupiedRanges.push({ start: bStart, end: bEnd + bufferMin });
      }

      // Add blocked time ranges
      for (const block of blockedSlots) {
        if (block.time_from && block.time_to) {
          const fromParts = block.time_from.split(":").map(Number);
          const toParts = block.time_to.split(":").map(Number);
          occupiedRanges.push({
            start: (fromParts[0] ?? 0) * 60 + (fromParts[1] ?? 0),
            end: (toParts[0] ?? 0) * 60 + (toParts[1] ?? 0),
          });
        }
      }

      // Filter out slots that would overlap with any occupied range
      const available = allSlots.filter((s) => {
        const sParts = s.value.split(":").map(Number);
        const slotStart = (sParts[0] ?? 0) * 60 + (sParts[1] ?? 0);
        const slotEnd = slotStart + duration;
        // Check overlap: two ranges [a,b) and [c,d) overlap if a < d && c < b
        return !occupiedRanges.some((r) => slotStart < r.end && r.start < slotEnd);
      });

      if (available.length === 0) {
        // Suggest next available dates (skip all-day blocked dates)
        const nextDates = generateAvailableDates(config.openingHours, 3, allDayBlockedDates, config.timezone);
        return `Aucun créneau disponible le ${date} pour ${serviceName}.\n\nProchaines dates possibles :\n${nextDates.map((d) => `- ${d.label} (${d.value})`).join("\n")}`;
      }

      return `Créneaux disponibles le ${date} pour ${serviceName} (${duration} min) :\n${available.map((s) => `- ${s.label}`).join("\n")}`;
    }

    case "book_appointment": {
      const service = input.service as string;
      const date = input.date as string;
      const time = input.time as string;
      const clientName = input.client_name as string;
      const clientEmail = (input.client_email as string) || undefined;
      const clientNotes = (input.client_notes as string) || undefined;
      const clientPhoneCollected = (input.client_phone as string) || undefined;

      // Calculate end_time from service duration (capped at 23:59)
      const services = parseAllServices(config.services);
      const svc = services.find((s) => s.name.toLowerCase() === service.toLowerCase());
      const duration = svc?.duration ?? 30;
      const endTime = computeEndTime(time, duration);

      const appointmentId = await createAppointment({
        businessId: config.businessId,
        clientPhone: clientPhoneCollected || clientPhone,
        clientName: clientName || undefined,
        clientEmail,
        clientNotes,
        service,
        date,
        time,
        endTime,
      });

      // Push to Google Calendar if connected
      if (appointmentId && config.gcalRefreshToken && config.gcalCalendarId) {
        try {
          const startDT = `${date}T${time}:00`;
          const endDT = `${date}T${endTime}:00`;

          const eventId = await createGCalEvent({
            refreshToken: config.gcalRefreshToken,
            calendarId: config.gcalCalendarId,
            summary: `${service} — ${clientName}`,
            startDateTime: startDT,
            endDateTime: endDT,
            description: `RDV via Ve'a · ${clientPhone}`,
            timezone: config.timezone,
          });
          await updateAppointmentGCalId(appointmentId, eventId);
        } catch (err) {
          // GCal push is best-effort — don't fail the booking
          logger.error("[GCal] Push failed", { error: String(err) });
        }
      }

      // Update session with client name
      await updateSession(clientPhone, config.businessId, "active", {
        client_name: clientName,
      });

      return `Rendez-vous confirmé !\n- Service : ${service}\n- Date : ${date}\n- Heure : ${time}\n- Client : ${clientName}`;
    }

    case "get_my_appointments": {
      const appointments = await getClientAppointments(clientPhone, config.businessId);
      if (appointments.length === 0) {
        return "Aucun rendez-vous à venir trouvé pour ce client.";
      }
      return `Rendez-vous à venir :\n${appointments.map(
        (a) => `- ${a.service} le ${a.appointment_date} à ${a.time_slot} (${a.status})`
      ).join("\n")}`;
    }

    case "cancel_appointment": {
      const result = await cancelActiveAppointment(
        clientPhone,
        config.businessId
      );
      if (!result.found) {
        return "Aucun rendez-vous actif trouvé pour ce numéro.";
      }
      // Delete from Google Calendar if connected
      if (result.gcalEventId && config.gcalRefreshToken && config.gcalCalendarId) {
        try {
          await deleteGCalEvent(config.gcalRefreshToken, config.gcalCalendarId, result.gcalEventId);
        } catch (err) {
          logger.error("[GCal] Delete failed", { error: String(err) });
        }
      }
      return `Rendez-vous annulé : ${result.details}`;
    }

    case "reschedule_appointment": {
      const newDate = input.new_date as string;
      const newTime = input.new_time as string;
      // Pre-fetch appointment to get its actual service, then look up correct duration
      const allSvcs = parseAllServices(config.services);
      const defaultDuration = allSvcs[0]?.duration ?? 60;
      const reschedResult = await rescheduleAppointment(
        clientPhone,
        config.businessId,
        newDate,
        newTime,
        defaultDuration,
        allSvcs,
      );
      if (!reschedResult.found) {
        return "Aucun rendez-vous actif trouvé à déplacer.";
      }
      // Update Google Calendar if connected
      if (reschedResult.gcalEventId && config.gcalRefreshToken && config.gcalCalendarId) {
        try {
          // Delete old event and create new one (simplest approach for GCal)
          await deleteGCalEvent(config.gcalRefreshToken, config.gcalCalendarId, reschedResult.gcalEventId);
        } catch (err) {
          logger.error("[GCal] Delete old event failed during reschedule", { error: String(err) });
        }
      }
      return `Rendez-vous déplacé : ${reschedResult.details}`;
    }

    case "get_next_available": {
      const serviceName = input.service_name as string;
      const services = parseAllServices(config.services);
      const service = services.find(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase()
      );
      const duration = service?.duration ?? 30;

      // Search the next 14 days for the first available slot
      const allDayBlockedDates = await getAllDayBlockedDates(config.businessId);
      const candidates = generateAvailableDates(config.openingHours, 14, allDayBlockedDates, config.timezone);

      for (const candidate of candidates) {
        const date = candidate.value;
        const allSlots = generateTimeSlots(config.openingHours, date, duration, 20);
        if (allSlots.length === 0) continue;

        const bookings = await getBookingsForDate(config.businessId, date);
        const blockedSlots = await getBlockedSlotsForDate(config.businessId, date);

        if (blockedSlots.some((b) => b.all_day)) continue;

        const bufferMin = Math.max(0, Math.min(60, Number((config.chatbotConfig ?? {}).buffer_minutes) || 0));
        const occupiedRanges: { start: number; end: number }[] = [];

        for (const b of bookings) {
          const bParts = b.time_slot.split(":").map(Number);
          const bStart = (bParts[0] ?? 0) * 60 + (bParts[1] ?? 0);
          let bEnd: number;
          if (b.end_time) {
            const eParts = b.end_time.split(":").map(Number);
            bEnd = (eParts[0] ?? 0) * 60 + (eParts[1] ?? 0);
          } else {
            bEnd = bStart + 30;
          }
          occupiedRanges.push({ start: bStart, end: bEnd + bufferMin });
        }

        for (const block of blockedSlots) {
          if (block.time_from && block.time_to) {
            const fromParts = block.time_from.split(":").map(Number);
            const toParts = block.time_to.split(":").map(Number);
            occupiedRanges.push({
              start: (fromParts[0] ?? 0) * 60 + (fromParts[1] ?? 0),
              end: (toParts[0] ?? 0) * 60 + (toParts[1] ?? 0),
            });
          }
        }

        const available = allSlots.filter((s) => {
          const sParts = s.value.split(":").map(Number);
          const slotStart = (sParts[0] ?? 0) * 60 + (sParts[1] ?? 0);
          const slotEnd = slotStart + duration;
          return !occupiedRanges.some((r) => slotStart < r.end && r.start < slotEnd);
        });

        if (available.length > 0) {
          return `Prochain créneau disponible pour ${serviceName} : ${candidate.label} à ${available[0]!.label} (${duration} min). On confirme ?`;
        }
      }

      return `Aucun créneau disponible dans les 14 prochains jours pour ${serviceName}. Contactez-nous directement.`;
    }

    case "transfer_to_human": {
      const reason = input.reason as string;
      return `Transfert demandé. Raison : ${reason}. Le numéro du responsable est ${config.humanPhone}.`;
    }

    default:
      return `Outil inconnu: ${name}`;
  }
}

export async function runBookingAgent(
  session: Session,
  payload: {
    from: string;
    message: string;
    buttonPayload: string | null;
    channel?: string;
  },
  config: BusinessConfig
): Promise<string> {
  const agentStartMs = Date.now();
  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
    timeout: DEEPSEEK_TIMEOUT_MS,
  });

  // Restore conversation history from session context
  const ctx = session.context as Record<string, unknown>;
  const history: OpenAI.ChatCompletionMessageParam[] =
    (ctx?.messages as OpenAI.ChatCompletionMessageParam[]) ?? [];

  // Add the user's new message
  // Prefer message (human-readable title) over buttonPayload (machine ID)
  const userText = payload.message || payload.buttonPayload || "";
  history.push({ role: "user", content: userText });

  // Determine if booking mode is active (has services configured)
  const hasBooking = config.services.length > 0;

  // Filter tools based on booking mode
  const activeTools = hasBooking
    ? BOOKBOT_TOOLS
    : BOOKBOT_TOOLS.filter((t) =>
        ["search_knowledge_base", "transfer_to_human"].includes(
          (t as { function: { name: string } }).function.name
        )
      );

  // Build messages for DeepSeek
  const systemPrompt = await buildSystemPrompt(config, getTahitiDate(), payload.channel);

  // Inject known client context so LLM doesn't re-ask and can suggest their usual service
  let clientContext = "";
  if (session.client_name) {
    clientContext += `\n\n## Client actuel\nLe client s'appelle **${session.client_name}**. Ne lui redemande PAS son nom.`;
  }

  // Inject previous conversation summary (from stale session reset)
  const prevSummary = (session.context as Record<string, unknown>)?.previous_summary;
  if (prevSummary && typeof prevSummary === "string") {
    clientContext += `\n\n## Contexte précédent\n${prevSummary}\nTiens-en compte pour la continuité, mais ne le cite pas explicitement.`;
  }

  // Fetch returning client hints (last_service, visit count, last appointment, owner notes)
  try {
    const hints = await getClientHints(payload.from, config.businessId);
    if (hints) {
      if (hints.lastService) {
        clientContext += `\nC'est un client fidèle (${hints.totalVisits || 1} visite${(hints.totalVisits || 1) > 1 ? "s" : ""}). Son dernier service : **${hints.lastService}**. Propose-lui ce service par défaut ("Comme d'habitude, ${hints.lastService} ?") tout en offrant de choisir autre chose.`;
      }
      if (hints.lastAppointmentDate) {
        clientContext += `\nDernier RDV : ${hints.lastAppointmentDate}.`;
      }
      if (hints.ownerNotes) {
        clientContext += `\nNotes du propriétaire sur ce client : ${hints.ownerNotes}`;
      }
    }
  } catch {
    // Non-blocking — hints are optional
  }

  // NOTE: messenger_prospects.agent_instructions removed from system prompt (security risk:
  // sender_id is untrusted external input, sanitizeInstruction is trivially bypassed).
  // Business-owner instructions go through chatbotConfig.custom_instructions instead.

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt + clientContext },
    ...history,
  ];
  let finalReply = "";
  let toolWasCalled = false;
  let bookAppointmentCalled = false;
  const toolsUsed: string[] = [];
  const maxIterations = 5;

  for (let i = 0; i < maxIterations; i++) {
    let response: OpenAI.ChatCompletion;
    try {
      response = await client.chat.completions.create({
        model: "deepseek-chat",
        max_tokens: 1024,
        tools: activeTools,
        messages,
      });
    } catch (deepseekError) {
      logger.warn("[Agent] DeepSeek failed, trying Gemini/Groq fallback", {
        error: String(deepseekError),
      });
      const fallbackResponse = await callFallbackLLM(messages, activeTools);
      if (!fallbackResponse) {
        logger.error("[Agent] All LLM providers failed (DeepSeek + Gemini + Groq + Claude Haiku)");
        return FALLBACK_MESSAGE;
      }
      response = fallbackResponse;
    }

    const choice = response.choices[0];
    if (!choice) break;

    const msg = choice.message;

    if (msg.tool_calls?.length) {
      toolWasCalled = true;
      // Add assistant message with tool calls to conversation
      messages.push(msg);

      // Execute each tool call and add results
      for (const toolCall of msg.tool_calls) {
        if (toolCall.type !== "function") continue;
        let args: Record<string, unknown>;
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          logger.error("[Agent] Malformed tool call JSON", {
            tool: toolCall.function.name,
            raw: (toolCall.function.arguments || "").slice(0, 200),
          });
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Erreur: arguments invalides. Reformule la demande.",
          });
          continue;
        }
        logger.info(`[Agent] Tool call: ${toolCall.function.name}`, { args });
        if (!toolsUsed.includes(toolCall.function.name)) toolsUsed.push(toolCall.function.name);
        if (toolCall.function.name === "book_appointment") bookAppointmentCalled = true;
        const result = await executeTool(
          toolCall.function.name,
          args,
          payload.from,
          config
        );
        logger.info(`[Agent] Tool result: ${toolCall.function.name}`, { result: result.slice(0, 200) });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      // Final text response
      finalReply = msg.content ?? "";

      // GUARD: Detect when DeepSeek says "confirmed" without calling book_appointment
      const confirmPattern = /(?:confirmé|réservé|rendez-vous est confirmé|c'est réservé|booking confirmed|appointment confirmed)/i;
      if (hasBooking && !bookAppointmentCalled && confirmPattern.test(finalReply)) {
        if (i < maxIterations - 1) {
          logger.warn("[Agent] GUARD: LLM confirmed booking without calling book_appointment — forcing retry");
          messages.push({ role: "assistant", content: finalReply });
          messages.push({
            role: "user",
            content: "SYSTÈME: Tu as confirmé un rendez-vous sans appeler l'outil book_appointment. Le rendez-vous N'A PAS été enregistré. Tu DOIS appeler book_appointment maintenant avec les informations du client pour sauvegarder le rendez-vous.",
          });
          continue;
        } else {
          // maxIterations reached — don't send false confirmation to client
          logger.error("[Agent] GUARD: maxIterations reached without book_appointment call — replacing reply");
          finalReply = "Désolé, je n'ai pas pu enregistrer le rendez-vous. Peux-tu réessayer en me donnant le service, la date et l'heure souhaités ?";
        }
      }

      // Add assistant response to history for persistence
      // We store without the system prompt (re-injected each time)
      history.push({ role: "assistant", content: finalReply });
      break;
    }
  }

  // Persist updated conversation history (truncate to last 30 messages to avoid bloat)
  if (history.length > 30) {
    logger.warn(`[Agent] Conversation history truncated from ${history.length} to 30 messages`, {
      phone: payload.from,
      businessId: config.businessId,
      dropped: history.length - 30,
    });
  }
  const trimmedMessages = history.slice(-30);
  await updateSession(payload.from, config.businessId, "active", {
    context: { messages: trimmedMessages },
  });

  const effectiveReply = finalReply ||
    "Désolé, je n'ai pas pu traiter ta demande. Réessaie ou écris 'humain' pour parler à quelqu'un.";

  // Log AI interaction for hallucination monitoring
  try {
    const confidence = classifyConfidence(effectiveReply, toolsUsed, toolWasCalled);
    await logAiInteraction({
      businessId: config.businessId,
      phone: payload.from,
      channel: payload.channel,
      userMessage: userText,
      assistantReply: effectiveReply,
      confidence,
      toolsUsed,
      latencyMs: Date.now() - agentStartMs,
    });
  } catch {
    // Non-blocking — logging must never break the reply
  }

  return effectiveReply;
}

// ── Hallucination Monitoring ──────────────────────────────

type Confidence = "grounded" | "no_kb_match" | "fallback" | "transfer";

function classifyConfidence(
  reply: string,
  toolsUsed: string[],
  anyToolCalled: boolean,
): Confidence {
  // Transfer to human
  if (toolsUsed.includes("transfer_to_human")) return "transfer";

  // "Je n'ai pas cette info" pattern = no KB match
  const noInfoPattern = /je n'ai pas (cette|l'|cette info|d'info)|pas d'information|aucune information|pas trouvé dans/i;
  if (noInfoPattern.test(reply)) return "no_kb_match";

  // Fallback messages (LLM failure or empty)
  if (reply.includes("Réessaie") && reply.includes("humain")) return "fallback";
  if (reply.includes("erreur technique")) return "fallback";

  // KB was searched = grounded (tools provided data)
  if (toolsUsed.includes("search_knowledge_base")) return "grounded";

  // Other tools used (booking, availability) = grounded
  if (anyToolCalled) return "grounded";

  // Pure text response without tools — could be grounded from system prompt data
  return "grounded";
}

const SUPABASE_URL_AGENT = process.env.SUPABASE_URL!;

async function logAiInteraction(params: {
  businessId: string;
  phone: string;
  channel?: string;
  userMessage: string;
  assistantReply: string;
  confidence: Confidence;
  toolsUsed: string[];
  latencyMs: number;
}): Promise<void> {
  await fetch(`${SUPABASE_URL_AGENT}/rest/v1/bookbot_ai_logs`, {
    method: "POST",
    headers: supaHeaders(),
    body: JSON.stringify({
      business_id: params.businessId,
      phone: params.phone,
      channel: params.channel ?? null,
      user_message: params.userMessage.slice(0, 2000),
      assistant_reply: params.assistantReply.slice(0, 5000),
      confidence: params.confidence,
      tools_used: params.toolsUsed,
      latency_ms: params.latencyMs,
    }),
  });
}
