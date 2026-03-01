import OpenAI from "openai";
import type { BusinessConfig } from "./config.js";
import { parseAllServices } from "./config.js";
import {
  loadOrCreateSession,
  updateSession,
  createAppointment,
  cancelActiveAppointment,
  getBookingsForDate,
  searchKnowledgeBase,
} from "./supabase.js";
import { generateAvailableDates, generateTimeSlots } from "../utils/dates.js";
import type { Session } from "./supabase.js";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;

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
        "Confirme et crée un rendez-vous. IMPORTANT : tu DOIS avoir demandé confirmation au client AVANT d'appeler cet outil.",
      parameters: {
        type: "object",
        properties: {
          service: { type: "string", description: "Nom du service" },
          date: { type: "string", description: "Date au format YYYY-MM-DD" },
          time: { type: "string", description: "Heure au format HH:MM" },
          client_name: {
            type: "string",
            description: "Prénom ou nom du client",
          },
        },
        required: ["service", "date", "time", "client_name"],
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
  const now = new Date();
  const tahiti = new Date(
    now.toLocaleString("en-US", { timeZone: "Pacific/Tahiti" })
  );
  return `${tahiti.getFullYear()}-${String(tahiti.getMonth() + 1).padStart(2, "0")}-${String(tahiti.getDate()).padStart(2, "0")}`;
}

function buildSystemPrompt(config: BusinessConfig, today: string): string {
  const services = parseAllServices(config.services)
    .map(
      (s) =>
        `- ${s.name} (${s.duration} min, ${s.price.toLocaleString("fr-FR")} XPF)`
    )
    .join("\n");

  const dayLabels: Record<string, string> = {
    mon: "Lundi",
    tue: "Mardi",
    wed: "Mercredi",
    thu: "Jeudi",
    fri: "Vendredi",
    sat: "Samedi",
    sun: "Dimanche",
  };

  const hours = Object.entries(config.openingHours)
    .map(([day, h]) => `${dayLabels[day] ?? day}: ${h}`)
    .join("\n");

  // Tone from chatbot config
  const cfg = config.chatbotConfig ?? {};
  const tone =
    cfg.tone === "formel"
      ? "formel et professionnel"
      : cfg.tone === "decontracte"
        ? "décontracté et amical"
        : 'chaleureux et accueillant, utilise "Ia ora na" pour saluer';

  // Language preference
  const langMap: Record<string, string> = {
    fr: "français",
    en: "anglais",
    tah: "tahitien (reo Māʼohi)",
  };
  const language = langMap[(cfg.language as string) ?? "fr"] ?? "français";

  // Custom greeting
  const greeting = (cfg.greeting as string) ?? "";
  const greetingInstruction = greeting
    ? `\n- Quand un client te salue, utilise cette formule de bienvenue : "${greeting}"`
    : "";

  return `Tu es l'assistant WhatsApp de ${config.businessName}. Tu parles en ${language}, ton ${tone}. Tu es basé en Polynésie française.

## Ton rôle
- Aider les clients à prendre rendez-vous, répondre à leurs questions, gérer les annulations
- Tu es un assistant amical, pas un robot. Adapte ton ton au client.${greetingInstruction}

## Services proposés
${services}

## Horaires d'ouverture
${hours}

## Aujourd'hui
${today} (timezone: ${config.timezone})

## Règles OBLIGATOIRES
1. TOUJOURS utiliser \`check_availability\` avant de proposer un créneau — NE JAMAIS inventer de disponibilité
2. TOUJOURS demander confirmation explicite au client ("C'est bon pour toi ?" ou "Je confirme ?") AVANT d'appeler \`book_appointment\`
3. Demander le prénom du client avant de réserver
4. Si une question est hors de tes compétences ou que le client demande un humain, utilise \`transfer_to_human\`
5. Utilise \`search_knowledge_base\` pour les questions spécifiques (politique annulation, parking, produits, etc.)
6. Réponses COURTES (2-4 phrases max) — c'est WhatsApp, pas un email
7. Si le client te salue, présente-toi brièvement et demande comment tu peux aider
8. NE JAMAIS proposer de dates dans le passé. La date minimale est demain.
9. Si le client donne une date en texte ("lundi prochain", "demain"), convertis en YYYY-MM-DD avant d'appeler les outils
10. Tu DOIS répondre en ${language} — c'est la langue configurée par le commerce`;
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
        return "Aucune information trouvée dans la base de connaissances pour cette question.";
      }
      return results
        .map((r) => `[${r.title}] ${r.chunk_text}`)
        .join("\n\n");
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

      // Get existing bookings for that date
      const bookings = await getBookingsForDate(config.businessId, date);
      const takenTimes = new Set(bookings.map((b) => b.time_slot));

      // Filter out taken slots
      const available = allSlots.filter((s) => !takenTimes.has(s.value));

      if (available.length === 0) {
        // Suggest next available dates
        const nextDates = generateAvailableDates(config.openingHours, 3);
        return `Aucun créneau disponible le ${date} pour ${serviceName}.\n\nProchaines dates possibles :\n${nextDates.map((d) => `- ${d.label} (${d.value})`).join("\n")}`;
      }

      return `Créneaux disponibles le ${date} pour ${serviceName} (${duration} min) :\n${available.map((s) => `- ${s.label}`).join("\n")}`;
    }

    case "book_appointment": {
      const service = input.service as string;
      const date = input.date as string;
      const time = input.time as string;
      const clientName = input.client_name as string;

      await createAppointment({
        businessId: config.businessId,
        clientPhone,
        service,
        date,
        time,
      });

      // Update session with client name
      await updateSession(clientPhone, config.businessId, "active", {
        client_name: clientName,
      });

      return `Rendez-vous confirmé !\n- Service : ${service}\n- Date : ${date}\n- Heure : ${time}\n- Client : ${clientName}`;
    }

    case "cancel_appointment": {
      const result = await cancelActiveAppointment(
        clientPhone,
        config.businessId
      );
      if (!result.found) {
        return "Aucun rendez-vous actif trouvé pour ce numéro.";
      }
      return `Rendez-vous annulé : ${result.details}`;
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
  },
  config: BusinessConfig
): Promise<string> {
  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });

  // Restore conversation history from session context
  const ctx = session.context as Record<string, unknown>;
  const history: OpenAI.ChatCompletionMessageParam[] =
    (ctx?.messages as OpenAI.ChatCompletionMessageParam[]) ?? [];

  // Add the user's new message
  const userText = payload.buttonPayload ?? payload.message;
  history.push({ role: "user", content: userText });

  // Build messages for DeepSeek
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(config, getTahitiDate()) },
    ...history,
  ];
  let finalReply = "";
  const maxIterations = 5;

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 1024,
      tools: BOOKBOT_TOOLS,
      messages,
    });

    const choice = response.choices[0];
    if (!choice) break;

    const msg = choice.message;

    if (choice.finish_reason === "tool_calls" && msg.tool_calls?.length) {
      // Add assistant message with tool calls to conversation
      messages.push(msg);

      // Execute each tool call and add results
      for (const toolCall of msg.tool_calls) {
        if (toolCall.type !== "function") continue;
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await executeTool(
          toolCall.function.name,
          args,
          payload.from,
          config
        );
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      // Final text response
      finalReply = msg.content ?? "";

      // Add assistant response to history for persistence
      // We store without the system prompt (re-injected each time)
      history.push({ role: "assistant", content: finalReply });
      break;
    }
  }

  // Persist updated conversation history (truncate to last 30 messages to avoid bloat)
  const trimmedMessages = history.slice(-30);
  await updateSession(payload.from, config.businessId, "active", {
    context: { messages: trimmedMessages },
  });

  return (
    finalReply ||
    "Désolé, je n'ai pas pu traiter ta demande. Réessaie ou écris 'humain' pour parler à quelqu'un."
  );
}
