export type Intent =
  | "reservation"
  | "annulation"
  | "faq"
  | "greeting"
  | "remerciement"
  | "modification"
  | "reclamation"
  | "autre";

export interface ClassifyResult {
  intent: Intent;
  confidence: "high" | "medium" | "low";
}

const VALID_INTENTS: Intent[] = [
  "reservation", "annulation", "faq", "greeting",
  "remerciement", "modification", "reclamation", "autre",
];

// --- Keyword maps (order = priority) ---

const KEYWORD_MAP: [Intent, string[]][] = [
  ["reservation", [
    "rdv", "rendez-vous", "reserver", "réserver", "reservation", "réservation",
    "prendre rdv", "résa", "créneau", "creneau", "dispo", "disponible",
    "place", "booking", "libre", "quand", "prochain créneau",
    "tu peux me caler", "j'aimerais venir", "c'est possible",
    "tu as de la place",
  ]],
  ["annulation", [
    "annuler", "cancel", "supprimer", "decommander", "décommander",
    "plus besoin", "finalement non", "je viens plus", "empêché",
  ]],
  ["modification", [
    "changer", "décaler", "reporter", "autre créneau", "autre date",
    "plutôt", "finalement", "décaler le rdv", "modifier",
  ]],
  ["reclamation", [
    "problème", "pas content", "nul", "plainte", "rembourser",
    "arnaque", "scandale", "inadmissible", "honteux",
  ]],
  ["remerciement", [
    "merci", "parfait", "super", "top", "génial", "nickel", "c'est bon",
    "au revoir", "bonne journée", "à bientôt", "mauruuru", "nana",
  ]],
  ["faq", [
    "prix", "tarif", "combien", "coute", "coûte", "horaire", "heure",
    "ouvert", "adresse", "parking", "info", "c'est quoi",
    "comment ça marche", "vous faites quoi", "proposition",
    "carte", "menu", "paiement", "cb",
  ]],
  ["greeting", [
    "bonjour", "salut", "hello", "bonsoir", "coucou", "ia ora na",
    "maeva", "ça va", "hey", "yo", "bsr", "bjr",
  ]],
];

// --- Regex patterns for compound expressions ---

const REGEX_MAP: [Intent, RegExp][] = [
  ["reservation", /je\s+(?:voudrais?|veux|souhaite|aimerais)\s+(?:prendre|avoir|fixer|poser)\s+(?:un\s+)?(?:rdv|rendez[- ]?vous|créneau|creneau)/],
  ["reservation", /(?:demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+(?:matin|aprem|après[- ]midi|soir)\s+(?:ça|ca)\s+(?:irait|va|marche)/],
  ["annulation", /(?:je\s+)?(?:pourrai|peux|viendrai)\s+(?:pas|plus)/],
  ["modification", /(?:je\s+veux|possible\s+de)\s+changer\s+(?:l['']?heure|la\s+date|le\s+créneau)/],
];

// --- Matching helpers ---

function matchKeywords(msg: string, words: string[]): boolean {
  return words.some((w) => msg.includes(w));
}

function classifyLocal(msg: string): ClassifyResult | null {
  // Keywords (high confidence)
  for (const [intent, words] of KEYWORD_MAP) {
    if (matchKeywords(msg, words)) return { intent, confidence: "high" };
  }
  // Regex patterns (high confidence)
  for (const [intent, rx] of REGEX_MAP) {
    if (rx.test(msg)) return { intent, confidence: "high" };
  }
  return null;
}

// --- DeepSeek fallback with few-shot examples ---

const DEEPSEEK_PROMPT = `Tu classes l'intention d'un message client. Réponds UNIQUEMENT par un mot parmi: reservation, annulation, faq, greeting, remerciement, modification, reclamation, autre.

Exemples:
"demain matin ça irait" → reservation
"finalement je pourrai pas" → annulation
"c'est combien la coupe" → faq
"mauruuru beaucoup" → remerciement
"je veux changer l'heure" → modification`;

async function classifyWithDeepSeek(message: string): Promise<ClassifyResult> {
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 20,
        temperature: 0,
        messages: [
          { role: "system", content: DEEPSEEK_PROMPT },
          { role: "user", content: message },
        ],
      }),
    });

    const data: { choices?: { message?: { content?: string } }[] } =
      await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? "autre")
      .trim()
      .toLowerCase() as Intent;

    const intent = VALID_INTENTS.includes(raw) ? raw : "autre";
    return { intent, confidence: "medium" };
  } catch {
    return { intent: "autre", confidence: "low" };
  }
}

// --- Public API ---

/** Full classification with confidence scoring. */
export async function classifyIntentWithConfidence(
  message: string,
  buttonPayload: string | null,
): Promise<ClassifyResult> {
  if (buttonPayload === "book_now" || buttonPayload) {
    return { intent: "reservation", confidence: "high" };
  }

  const msg = message.toLowerCase();

  const local = classifyLocal(msg);
  if (local) return local;

  return classifyWithDeepSeek(message);
}

/** Backward-compatible wrapper — returns bare Intent. */
export async function classifyIntent(
  message: string,
  buttonPayload: string | null,
): Promise<Intent> {
  const { intent } = await classifyIntentWithConfidence(message, buttonPayload);
  return intent;
}
