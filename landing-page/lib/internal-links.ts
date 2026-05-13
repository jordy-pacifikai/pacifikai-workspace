/**
 * Internal Linking Engine — PACIFIK'AI SEO
 * Système de maillage interne automatique entre les 146+ pages du site.
 * Chaque page affiche 3-5 liens contextuels vers des pages sémantiquement proches.
 */

export interface LinkNode {
  url: string;
  title: string;
  keywords: string[];
  type: "service" | "expertise" | "seo" | "blog" | "static";
}

const linkGraph: LinkNode[] = [
  // --- Services ---
  { url: "/services/chatbots", title: "Chatbot IA sur mesure", keywords: ["chatbot", "ia", "assistant", "messenger", "whatsapp", "conversationnel", "support", "client"], type: "service" },
  { url: "/services/landing-pages", title: "Création de sites web", keywords: ["site", "web", "landing", "page", "vitrine", "ecommerce", "design", "responsive"], type: "service" },
  { url: "/services/apps", title: "Applications web & mobiles", keywords: ["application", "mobile", "pwa", "ios", "android", "app", "dashboard"], type: "service" },
  { url: "/services/workflows", title: "Automatisation des processus", keywords: ["automatisation", "workflow", "processus", "integration", "connecteur", "api"], type: "service" },
  { url: "/services/documents", title: "Extraction de documents IA", keywords: ["extraction", "document", "pdf", "ocr", "formulaire", "scan", "donnees"], type: "service" },
  { url: "/services/api", title: "Intégrations API", keywords: ["api", "integration", "crm", "synchronisation", "connecteur"], type: "service" },
  { url: "/services/marketing", title: "Marketing digital", keywords: ["marketing", "digital", "seo", "ads", "facebook", "google", "campagne", "publicite"], type: "service" },
  { url: "/services/conseil", title: "Conseil en transformation digitale", keywords: ["conseil", "strategie", "transformation", "digitale", "audit", "accompagnement"], type: "service" },

  // --- Expertise ---
  { url: "/expertise/chatbots-ia", title: "IA Conversationnelle 24/7", keywords: ["chatbot", "ia", "conversationnel", "nlp", "multi-canal", "whatsapp"], type: "expertise" },
  { url: "/expertise/sites-web-premium", title: "Sites Haute Conversion", keywords: ["site", "web", "conversion", "design", "ux", "awwwards", "premium"], type: "expertise" },
  { url: "/expertise/automatisation", title: "Automatisation IA", keywords: ["automatisation", "processus", "workflow", "zero", "tache", "manuelle"], type: "expertise" },
  { url: "/expertise/contenu-ia", title: "Production Contenu x10", keywords: ["contenu", "ia", "video", "image", "voix", "avatar", "production", "studio"], type: "expertise" },
  { url: "/expertise/marketing-acquisition", title: "Growth & Acquisition IA", keywords: ["marketing", "acquisition", "growth", "campagne", "ciblage", "predictif", "ads"], type: "expertise" },
  { url: "/expertise/seo-referencement-ia", title: "SEO & Référencement IA", keywords: ["seo", "referencement", "google", "ranking", "local", "geo", "indexation"], type: "expertise" },
  { url: "/expertise/strategie-digitale", title: "Transformation Digitale", keywords: ["strategie", "transformation", "digitale", "audit", "feuille", "route", "accompagnement"], type: "expertise" },

  // --- Blog (articles majeurs) ---
  { url: "/blog/agence-digitale-tahiti-guide", title: "Guide complet : agence digitale à Tahiti", keywords: ["agence", "digitale", "tahiti", "guide", "polynesie"], type: "blog" },
  { url: "/blog/chatbot-ia-polynesie", title: "Chatbot IA en Polynésie", keywords: ["chatbot", "ia", "polynesie", "entreprise", "whatsapp"], type: "blog" },
  { url: "/blog/creation-site-internet-tahiti", title: "Créer un site internet à Tahiti", keywords: ["site", "internet", "tahiti", "creation", "web", "prix"], type: "blog" },
  { url: "/blog/prix-site-web-polynesie", title: "Prix d'un site web en Polynésie", keywords: ["prix", "site", "web", "polynesie", "tarif", "cout", "budget"], type: "blog" },
  { url: "/blog/intelligence-artificielle-polynesie", title: "L'IA en Polynésie française", keywords: ["intelligence", "artificielle", "polynesie", "entreprise", "pme"], type: "blog" },
  { url: "/blog/automatisation-entreprise-tahiti", title: "Automatiser son entreprise à Tahiti", keywords: ["automatisation", "entreprise", "tahiti", "processus", "gain"], type: "blog" },
  { url: "/blog/automatisation-ia-entreprise-polynesie", title: "Automatisation IA pour entreprises PF", keywords: ["automatisation", "ia", "entreprise", "polynesie", "workflow"], type: "blog" },
  { url: "/blog/marketing-digital-tahiti", title: "Marketing digital à Tahiti", keywords: ["marketing", "digital", "tahiti", "facebook", "google", "ads"], type: "blog" },
  { url: "/blog/digitalisation-entreprise-tahiti", title: "Digitalisation des entreprises à Tahiti", keywords: ["digitalisation", "entreprise", "tahiti", "transformation", "numerique"], type: "blog" },
  { url: "/blog/transformation-digitale-polynesie-francaise", title: "Transformation digitale en PF", keywords: ["transformation", "digitale", "polynesie", "francaise", "strategie"], type: "blog" },
  { url: "/blog/application-mobile-polynesie", title: "Applications mobiles en Polynésie", keywords: ["application", "mobile", "polynesie", "pwa", "ios", "android"], type: "blog" },
  { url: "/blog/agences-digitales-tahiti-comparatif", title: "Comparatif agences digitales Tahiti", keywords: ["agences", "digitales", "tahiti", "comparatif", "meilleure"], type: "blog" },
  { url: "/blog/agence-ia-tahiti", title: "Agence IA à Tahiti : guide 2026", keywords: ["agence", "ia", "tahiti", "intelligence", "artificielle", "chatbot", "automatisation"], type: "blog" },
  { url: "/blog/referencement-seo-tahiti", title: "Référencement SEO à Tahiti", keywords: ["referencement", "seo", "tahiti", "google", "ranking", "local", "polynesie"], type: "blog" },
  { url: "/blog/developpeur-web-polynesie", title: "Développeur web en Polynésie", keywords: ["developpeur", "web", "polynesie", "freelance", "agence", "site", "tahiti"], type: "blog" },

  // --- Pages statiques ---
  { url: "/tarifs", title: "Nos tarifs", keywords: ["tarif", "prix", "cout", "budget", "devis", "offre"], type: "static" },
  { url: "/contact", title: "Nous contacter", keywords: ["contact", "devis", "email", "rendez-vous", "gratuit"], type: "static" },
  { url: "/agence-digitale-tahiti", title: "Agence digitale à Tahiti", keywords: ["agence", "digitale", "tahiti", "polynesie", "equipe", "apropos"], type: "static" },
  { url: "/calculateur-roi", title: "Calculateur de ROI", keywords: ["calculateur", "roi", "retour", "investissement", "economie", "gain"], type: "static" },
  { url: "/offre-site-web", title: "Offre site web 100K XPF", keywords: ["offre", "site", "web", "100k", "xpf", "promotion", "special"], type: "static" },
  { url: "/creation-site-web-tahiti", title: "Création de site web à Tahiti", keywords: ["creation", "site", "web", "tahiti", "internet", "vitrine", "ecommerce", "design", "polynesie"], type: "static" },
  { url: "/application-mobile-tahiti", title: "Application mobile à Tahiti", keywords: ["application", "mobile", "tahiti", "pwa", "dashboard", "portail", "app", "polynesie"], type: "static" },
  { url: "/marketing-automatise-tahiti", title: "Marketing automatisé à Tahiti", keywords: ["marketing", "automatise", "tahiti", "email", "ads", "sms", "digital", "polynesie"], type: "static" },
];

/**
 * Retourne les pages les plus pertinentes pour une page donnée.
 * Scoring basé sur le nombre de keywords communs.
 */
export function getRelatedLinks(
  currentUrl: string,
  pageKeywords: string[],
  limit = 5
): LinkNode[] {
  const normalizedKeywords = pageKeywords.map((k) => k.toLowerCase());

  return linkGraph
    .filter((node) => node.url !== currentUrl)
    .map((node) => {
      const score = node.keywords.filter((k) =>
        normalizedKeywords.some(
          (pk) => pk.includes(k) || k.includes(pk)
        )
      ).length;
      return { ...node, score };
    })
    .filter((n) => (n as LinkNode & { score: number }).score > 0)
    .sort((a, b) => (b as LinkNode & { score: number }).score - (a as LinkNode & { score: number }).score)
    .slice(0, limit);
}

/**
 * Retourne les liens liés par TYPE (même section du site).
 * Utile pour les barres "Voir aussi" en bas de section.
 */
export function getRelatedByType(
  currentUrl: string,
  type: LinkNode["type"],
  limit = 4
): LinkNode[] {
  return linkGraph
    .filter((node) => node.url !== currentUrl && node.type === type)
    .slice(0, limit);
}

/**
 * Retourne un mix de liens : 2 du même type + 3 sémantiquement proches.
 * Pattern optimal pour le SEO interne.
 */
export function getOptimalLinks(
  currentUrl: string,
  currentType: LinkNode["type"],
  pageKeywords: string[],
): LinkNode[] {
  const sameType = getRelatedByType(currentUrl, currentType, 2);
  const semantic = getRelatedLinks(currentUrl, pageKeywords, 5)
    .filter((n) => !sameType.some((s) => s.url === n.url))
    .slice(0, 3);
  return [...sameType, ...semantic];
}
