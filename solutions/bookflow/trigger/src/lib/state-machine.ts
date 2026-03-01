import type { BusinessConfig } from "./config.js";
import { parseService, parseAllServices } from "./config.js";
import type { Session } from "./supabase.js";
import { createAppointment, cancelActiveAppointment } from "./supabase.js";
import { classifyIntent } from "./classifier.js";
import {
  generateAvailableDates,
  generateTimeSlots,
  type DateOption,
  type TimeSlot,
} from "../utils/dates.js";

export interface StateResult {
  reply: string;
  newState: string;
  sessionUpdates: Record<string, unknown>;
}

interface Payload {
  from: string;
  message: string;
  buttonPayload: string | null;
}

export async function processState(
  session: Session,
  payload: Payload,
  config: BusinessConfig
): Promise<StateResult> {
  switch (session.state) {
    case "idle":
      return handleIdle(session, payload, config);
    case "service_selection":
      return handleServiceSelection(session, payload, config);
    case "date_selection":
      return handleDateSelection(session, payload, config);
    case "time_selection":
      return handleTimeSelection(session, payload, config);
    case "confirmation":
      return handleConfirmation(session, payload, config);
    default:
      return handleIdle(session, payload, config);
  }
}

// ─── IDLE ──────────────────────────────────────────────

async function handleIdle(
  _session: Session,
  payload: Payload,
  config: BusinessConfig
): Promise<StateResult> {
  const intent = await classifyIntent(payload.message, payload.buttonPayload);

  switch (intent) {
    case "reservation":
      return sendServiceList(config);
    case "annulation":
      return handleCancellation(payload.from, config);
    case "faq":
      return handleFaq(payload.message, config);
    case "greeting":
      return handleGreeting(config);
    default:
      return {
        reply:
          "Je vais transmettre votre demande a notre equipe. Quelqu'un vous recontactera rapidement.",
        newState: "idle",
        sessionUpdates: {},
      };
  }
}

function sendServiceList(config: BusinessConfig): StateResult {
  const services = parseAllServices(config.services);
  let reply = `Bienvenue chez ${config.businessName} !\n\nQuel service souhaitez-vous ?\n\n`;
  services.forEach((s, i) => {
    reply += `${i + 1}. ${s.name} (${s.duration} min — ${s.price.toLocaleString()} XPF)\n`;
  });
  reply += `\nRepondez avec le numero du service.`;

  return { reply, newState: "service_selection", sessionUpdates: {} };
}

async function handleCancellation(
  phone: string,
  config: BusinessConfig
): Promise<StateResult> {
  const result = await cancelActiveAppointment(phone, config.businessId);
  const reply = result.found
    ? `Votre RDV du ${result.details} a ete annule.\n\nN'hesitez pas a reprendre RDV quand vous le souhaitez !`
    : "Je n'ai pas trouve de RDV actif a votre nom. Vous pouvez prendre un nouveau RDV en repondant 'RDV'.";

  return { reply, newState: "idle", sessionUpdates: {} };
}

async function handleFaq(
  message: string,
  config: BusinessConfig
): Promise<StateResult> {
  const services = parseAllServices(config.services);
  const serviceList = services
    .map((s) => `${s.name}: ${s.duration}min, ${s.price.toLocaleString()} XPF`)
    .join("\n");
  const hours = Object.entries(config.openingHours)
    .map(([day, h]) => `${day}: ${h}`)
    .join(", ");

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 300,
        messages: [
          { role: "system", content: `Tu es l'assistant WhatsApp de ${config.businessName}. Reponds en 2-3 phrases max, en francais.\n\nServices:\n${serviceList}\n\nHoraires: ${hours}\n\nSi tu ne connais pas la reponse, dis "Je vais verifier avec l'equipe et revenir vers vous."` },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      "Je vais verifier avec l'equipe et revenir vers vous.";
    return { reply, newState: "idle", sessionUpdates: {} };
  } catch {
    return {
      reply: "Je vais verifier avec l'equipe et revenir vers vous.",
      newState: "idle",
      sessionUpdates: {},
    };
  }
}

function handleGreeting(config: BusinessConfig): StateResult {
  return {
    reply: `Ia ora na ! Bienvenue chez ${config.businessName}.\n\nJe suis votre assistant de reservation. Comment puis-je vous aider ?\n\n1. Prendre un RDV\n2. Voir nos services et tarifs\n3. Annuler un RDV\n\nRepondez avec le numero ou ecrivez votre demande.`,
    newState: "idle",
    sessionUpdates: {},
  };
}

// ─── SERVICE SELECTION ─────────────────────────────────

function handleServiceSelection(
  _session: Session,
  payload: Payload,
  config: BusinessConfig
): StateResult {
  const input = payload.buttonPayload ?? payload.message;
  const services = config.services;

  let selectedService: string | undefined;
  const num = parseInt(input, 10);
  if (num >= 1 && num <= services.length) {
    selectedService = services[num - 1];
  } else {
    selectedService = services.find((s) => {
      const name = s.split("|")[0]?.toLowerCase() ?? "";
      return (
        input.toLowerCase().includes(name) ||
        name.includes(input.toLowerCase())
      );
    });
  }

  if (!selectedService) {
    return {
      reply: `Je n'ai pas compris votre choix. Repondez avec un numero entre 1 et ${services.length}.`,
      newState: "service_selection",
      sessionUpdates: {},
    };
  }

  const service = parseService(selectedService);
  const dates = generateAvailableDates(config.openingHours);

  let reply = `${service.name} — parfait !\n\nQuel jour vous convient ?\n\n`;
  dates.forEach((d, i) => {
    reply += `${i + 1}. ${d.label}\n`;
  });
  reply += `\nRepondez avec le numero.`;

  return {
    reply,
    newState: "date_selection",
    sessionUpdates: {
      selected_service: selectedService,
      context: JSON.stringify({ available_dates: dates }),
    },
  };
}

// ─── DATE SELECTION ────────────────────────────────────

function handleDateSelection(
  session: Session,
  payload: Payload,
  config: BusinessConfig
): StateResult {
  const input = payload.buttonPayload ?? payload.message;
  const ctx = session.context as { available_dates?: DateOption[] };
  const dates = ctx.available_dates ?? [];

  const num = parseInt(input, 10);
  const selectedDate = num >= 1 && num <= dates.length ? dates[num - 1] : undefined;

  if (!selectedDate) {
    return {
      reply: `Repondez avec un numero entre 1 et ${dates.length}.`,
      newState: "date_selection",
      sessionUpdates: {},
    };
  }

  const service = parseService(session.selected_service ?? "Service|30|0");
  const slots = generateTimeSlots(
    config.openingHours,
    selectedDate.value,
    service.duration
  );

  let reply = `${selectedDate.label} — c'est note !\n\nA quelle heure ?\n\n`;
  slots.forEach((s, i) => {
    reply += `${i + 1}. ${s.label}\n`;
  });
  reply += `\nRepondez avec le numero.`;

  return {
    reply,
    newState: "time_selection",
    sessionUpdates: {
      selected_date: selectedDate.value,
      context: JSON.stringify({
        ...ctx,
        available_slots: slots,
        selected_date_label: selectedDate.label,
      }),
    },
  };
}

// ─── TIME SELECTION ────────────────────────────────────

function handleTimeSelection(
  session: Session,
  payload: Payload,
  config: BusinessConfig
): StateResult {
  const input = payload.buttonPayload ?? payload.message;
  const ctx = session.context as {
    available_slots?: TimeSlot[];
    selected_date_label?: string;
  };
  const slots = ctx.available_slots ?? [];
  const dateLabel = ctx.selected_date_label ?? session.selected_date ?? "";

  const num = parseInt(input, 10);
  const selectedSlot = num >= 1 && num <= slots.length ? slots[num - 1] : undefined;

  if (!selectedSlot) {
    return {
      reply: `Repondez avec un numero entre 1 et ${slots.length}.`,
      newState: "time_selection",
      sessionUpdates: {},
    };
  }

  const service = parseService(session.selected_service ?? "Service|30|0");

  let reply = `Recapitulatif de votre RDV\n\n`;
  reply += `${config.businessName}\n`;
  reply += `${service.name}\n`;
  reply += `${dateLabel}\n`;
  reply += `${selectedSlot.label}\n`;
  if (service.price) reply += `${service.price.toLocaleString()} XPF\n`;
  reply += `\n1. Confirmer\n2. Modifier\n3. Annuler\n\nRepondez avec le numero.`;

  return {
    reply,
    newState: "confirmation",
    sessionUpdates: {
      selected_time: selectedSlot.value,
      context: JSON.stringify({
        ...ctx,
        selected_time_label: selectedSlot.label,
      }),
    },
  };
}

// ─── CONFIRMATION ──────────────────────────────────────

async function handleConfirmation(
  session: Session,
  payload: Payload,
  config: BusinessConfig
): Promise<StateResult> {
  const input = (payload.buttonPayload ?? payload.message).toLowerCase();
  const ctx = session.context as {
    selected_date_label?: string;
    selected_time_label?: string;
  };

  const CONFIRM = ["1", "confirmer", "oui", "ok", "yes", "confirm"];
  const MODIFY = ["2", "modifier", "changer", "modify"];
  const CANCEL = ["3", "annuler", "cancel", "non"];

  const resetUpdates = {
    state: "idle",
    selected_service: null,
    selected_date: null,
    selected_time: null,
    context: "{}",
  };

  if (CONFIRM.some((w) => input.includes(w))) {
    const service = parseService(session.selected_service ?? "");

    await createAppointment({
      businessId: config.businessId,
      clientPhone: payload.from,
      service: service.name,
      date: session.selected_date ?? "",
      time: session.selected_time ?? "",
    });

    const dateLabel = ctx.selected_date_label ?? session.selected_date ?? "";
    const timeLabel = ctx.selected_time_label ?? session.selected_time ?? "";

    return {
      reply: `RDV confirme !\n\n${config.businessName}\n${service.name}\n${dateLabel} a ${timeLabel}\n\nVous recevrez un rappel la veille. A bientot !`,
      newState: "idle",
      sessionUpdates: resetUpdates,
    };
  }

  if (MODIFY.some((w) => input.includes(w))) {
    return {
      reply: "Pas de souci ! Reprenons depuis le debut.\n\nQuel service souhaitez-vous ?",
      newState: "service_selection",
      sessionUpdates: {
        selected_service: null,
        selected_date: null,
        selected_time: null,
        context: "{}",
      },
    };
  }

  if (CANCEL.some((w) => input.includes(w))) {
    return {
      reply: "RDV annule. N'hesitez pas a reprendre RDV quand vous le souhaitez !",
      newState: "idle",
      sessionUpdates: resetUpdates,
    };
  }

  return {
    reply: "Repondez avec 1 (Confirmer), 2 (Modifier) ou 3 (Annuler).",
    newState: "confirmation",
    sessionUpdates: {},
  };
}
