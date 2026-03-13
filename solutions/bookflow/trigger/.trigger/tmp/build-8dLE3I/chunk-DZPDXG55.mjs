import {
  __name,
  init_esm
} from "./chunk-VMIWEUEA.mjs";

// src/lib/classifier.ts
init_esm();
var RESERVATION_WORDS = [
  "rdv",
  "rendez-vous",
  "reserver",
  "réserver",
  "reservation",
  "réservation",
  "prendre",
  "créneau",
  "creneau",
  "dispo",
  "disponible",
  "place",
  "booking"
];
var CANCEL_WORDS = ["annuler", "cancel", "supprimer", "decommander"];
var FAQ_WORDS = [
  "prix",
  "tarif",
  "combien",
  "coute",
  "coûte",
  "horaire",
  "heure",
  "ouvert",
  "adresse",
  "ou",
  "où",
  "parking",
  "info"
];
var GREETING_WORDS = [
  "bonjour",
  "salut",
  "hello",
  "bonsoir",
  "coucou",
  "ia ora na"
];
function matchKeywords(msg, words) {
  return words.some((w) => msg.includes(w));
}
__name(matchKeywords, "matchKeywords");
async function classifyIntent(message, buttonPayload) {
  if (buttonPayload === "book_now" || buttonPayload) {
    return "reservation";
  }
  const msg = message.toLowerCase();
  if (matchKeywords(msg, RESERVATION_WORDS)) return "reservation";
  if (matchKeywords(msg, CANCEL_WORDS)) return "annulation";
  if (matchKeywords(msg, FAQ_WORDS)) return "faq";
  if (matchKeywords(msg, GREETING_WORDS)) return "greeting";
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 50,
        messages: [
          { role: "system", content: "Classify this message intent. Reply ONLY with one word: reservation, annulation, faq, greeting, or autre." },
          { role: "user", content: message }
        ]
      })
    });
    const data = await res.json();
    const intent = (data.choices?.[0]?.message?.content ?? "autre").trim().toLowerCase();
    const valid = [
      "reservation",
      "annulation",
      "faq",
      "greeting",
      "autre"
    ];
    return valid.includes(intent) ? intent : "autre";
  } catch {
    return "autre";
  }
}
__name(classifyIntent, "classifyIntent");

export {
  classifyIntent
};
//# sourceMappingURL=chunk-DZPDXG55.mjs.map
