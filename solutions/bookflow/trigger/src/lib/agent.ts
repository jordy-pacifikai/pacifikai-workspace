import OpenAI from "openai";
import type { BusinessConfig } from "./config.js";
import { parseAllServices } from "./config.js";
import {
  loadOrCreateSession,
  updateSession,
  createAppointment,
  updateAppointmentGCalId,
  getClientAppointments,
  cancelActiveAppointment,
  getBookingsForDate,
  getBlockedSlotsForDate,
  getAllDayBlockedDates,
  searchKnowledgeBase,
  refreshGCalBlockedSlots,
} from "./supabase.js";
import { createGCalEvent, deleteGCalEvent, listGCalEvents } from "./gcal.js";
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

function buildSystemPrompt(config: BusinessConfig, today: string, channel = "whatsapp"): string {
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

  // Custom instructions from the business owner
  const customInstructions = (cfg.custom_instructions as string) ?? '';
  const customSection = customInstructions
    ? `\n\n## Instructions spéciales du professionnel\n${customInstructions}`
    : '';

  // Required fields before booking
  const requiredFields = (cfg.required_fields as string[]) ?? [];
  const fieldLabels: Record<string, string> = {
    phone: "numéro de téléphone",
    email: "adresse email",
    notes: "remarques ou notes",
  };
  const requiredFieldsSection = requiredFields.length > 0
    ? `\n\n## Informations à collecter AVANT de réserver\nAvant d'appeler \`book_appointment\`, tu DOIS avoir collecté ces informations :\n${requiredFields.map((f) => `- ${fieldLabels[f] ?? f}`).join("\n")}\nSi le client ne les a pas fournies, demande-les poliment.`
    : '';

  const chan = channelLabel(channel);
  const hasBooking = config.services.length > 0;

  // ── Règle anti-improvisation (commune aux 2 modes) ──
  const antiImprovisation = `
## RÈGLE FONDAMENTALE — NE JAMAIS INVENTER
- NE JAMAIS promettre, mentionner ou suggérer quoi que ce soit qui n'est pas explicitement dans ce prompt ou dans les résultats des outils
- NE JAMAIS mentionner : appel téléphonique, rappel par téléphone, confirmation par email, SMS de confirmation, délai de traitement, validation manuelle, devis, ou tout autre processus non décrit ici
- NE JAMAIS improviser des formules de politesse qui impliquent une action future (ex: "on vous recontactera", "vous recevrez un appel", "nous vous enverrons une confirmation")
- Si tu ne sais pas → utilise \`search_knowledge_base\`. Si toujours sans réponse → \`transfer_to_human\`. JAMAIS inventer.
- Tes seules sources d'information autorisées : ce prompt + les résultats des outils`;

  if (!hasBooking) {
    // ── Mode assistant conversationnel (sans réservation) ──
    return `Tu es l'assistant ${chan} de ${config.businessName}. Langue : ${language}. Ton : ${tone}.${greetingInstruction}
${antiImprovisation}

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

  // ── Mode complet avec réservation ──
  return `Tu es l'assistant ${chan} de ${config.businessName}. Langue : ${language}. Ton : ${tone}.${greetingInstruction}
${antiImprovisation}

## Langue
- Langue par défaut : ${language}
- Si le client écrit en anglais → réponds en anglais. En tahitien → réponds en tahitien.

## Services proposés
${services}

## Horaires d'ouverture
${hours}

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
8. Réponses COURTES (2-4 phrases max) — c'est ${chan}, pas un email
9. NE JAMAIS proposer de dates dans le passé. Date minimale : demain.
10. Date en texte ("lundi prochain", "demain") → convertis en YYYY-MM-DD avant d'appeler les outils

## PROCESSUS DE RÉSERVATION (ordre strict)
1. Client demande RDV → demande service + date/heure souhaitée
2. Appelle \`check_availability\`
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
        const nextDates = generateAvailableDates(config.openingHours, 3, allDayBlockedDates);
        return `Le commerce est fermé le ${date}.\n\nProchaines dates possibles :\n${nextDates.map((d) => `- ${d.label} (${d.value})`).join("\n")}`;
      }

      // Build list of occupied time ranges [startMins, endMins)
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
          // Legacy bookings without end_time — assume default slot duration
          bEnd = bStart + 30;
        }
        occupiedRanges.push({ start: bStart, end: bEnd });
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
        const nextDates = generateAvailableDates(config.openingHours, 3, allDayBlockedDates);
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

      // Calculate end_time from service duration
      const services = parseAllServices(config.services);
      const svc = services.find((s) => s.name.toLowerCase() === service.toLowerCase());
      const duration = svc?.duration ?? 30;
      const timeParts = time.split(":").map(Number);
      const startH = timeParts[0] ?? 0;
      const startM = timeParts[1] ?? 0;
      const endMins = startH * 60 + startM + duration;
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

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
          console.error("[GCal] Push failed:", err);
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
          console.error("[GCal] Delete failed:", err);
        }
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
    channel?: string;
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

  // Determine if booking mode is active (has services configured)
  const hasBooking = config.services.length > 0;

  // Filter tools based on booking mode
  const activeTools = hasBooking
    ? BOOKBOT_TOOLS
    : BOOKBOT_TOOLS.filter((t) =>
        ["search_knowledge_base", "transfer_to_human"].includes(
          t.function.name
        )
      );

  // Build messages for DeepSeek
  const systemPrompt = buildSystemPrompt(config, getTahitiDate(), payload.channel);
  // Inject known client name so LLM doesn't re-ask
  const clientNameHint = session.client_name
    ? `\n\n## Client actuel\nLe client s'appelle **${session.client_name}**. Ne lui redemande PAS son nom.`
    : "";
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt + clientNameHint },
    ...history,
  ];
  let finalReply = "";
  let toolWasCalled = false;
  let bookAppointmentCalled = false;
  const maxIterations = 5;

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 1024,
      tools: activeTools,
      messages,
    });

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
        const args = JSON.parse(toolCall.function.arguments || "{}");
        console.log(`[Agent] Tool call: ${toolCall.function.name}`, JSON.stringify(args));
        if (toolCall.function.name === "book_appointment") bookAppointmentCalled = true;
        const result = await executeTool(
          toolCall.function.name,
          args,
          payload.from,
          config
        );
        console.log(`[Agent] Tool result: ${toolCall.function.name}`, result.slice(0, 200));
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
          console.log("[Agent] GUARD: LLM confirmed booking without calling book_appointment — forcing retry");
          messages.push({ role: "assistant", content: finalReply });
          messages.push({
            role: "user",
            content: "SYSTÈME: Tu as confirmé un rendez-vous sans appeler l'outil book_appointment. Le rendez-vous N'A PAS été enregistré. Tu DOIS appeler book_appointment maintenant avec les informations du client pour sauvegarder le rendez-vous.",
          });
          continue;
        } else {
          // maxIterations reached — don't send false confirmation to client
          console.error("[Agent] GUARD: maxIterations reached without book_appointment call — replacing reply");
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
  const trimmedMessages = history.slice(-30);
  await updateSession(payload.from, config.businessId, "active", {
    context: { messages: trimmedMessages },
  });

  return (
    finalReply ||
    "Désolé, je n'ai pas pu traiter ta demande. Réessaie ou écris 'humain' pour parler à quelqu'un."
  );
}
