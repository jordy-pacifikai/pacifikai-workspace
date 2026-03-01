export type Intent =
  | "reservation"
  | "annulation"
  | "faq"
  | "greeting"
  | "autre";

const RESERVATION_WORDS = [
  "rdv", "rendez-vous", "reserver", "réserver", "reservation",
  "réservation", "prendre", "créneau", "creneau", "dispo",
  "disponible", "place", "booking",
];

const CANCEL_WORDS = ["annuler", "cancel", "supprimer", "decommander"];

const FAQ_WORDS = [
  "prix", "tarif", "combien", "coute", "coûte", "horaire",
  "heure", "ouvert", "adresse", "ou", "où", "parking", "info",
];

const GREETING_WORDS = [
  "bonjour", "salut", "hello", "bonsoir", "coucou", "ia ora na",
];

function matchKeywords(msg: string, words: string[]): boolean {
  return words.some((w) => msg.includes(w));
}

export async function classifyIntent(
  message: string,
  buttonPayload: string | null
): Promise<Intent> {
  // Button tap = direct reservation
  if (buttonPayload === "book_now" || buttonPayload) {
    return "reservation";
  }

  const msg = message.toLowerCase();

  // Keyword matching (70% of messages, zero AI cost)
  if (matchKeywords(msg, RESERVATION_WORDS)) return "reservation";
  if (matchKeywords(msg, CANCEL_WORDS)) return "annulation";
  if (matchKeywords(msg, FAQ_WORDS)) return "faq";
  if (matchKeywords(msg, GREETING_WORDS)) return "greeting";

  // Fallback: DeepSeek for ambiguous messages
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 50,
        messages: [
          { role: "system", content: "Classify this message intent. Reply ONLY with one word: reservation, annulation, faq, greeting, or autre." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();
    const intent = (
      data.choices?.[0]?.message?.content ?? "autre"
    ).trim().toLowerCase() as Intent;

    const valid: Intent[] = [
      "reservation", "annulation", "faq", "greeting", "autre",
    ];
    return valid.includes(intent) ? intent : "autre";
  } catch {
    return "autre";
  }
}
