export const services = [
  "creation-site-web",
  "chatbot-ia",
  "automatisation",
  "application-mobile",
  "extraction-documents",
  "intelligence-artificielle",
  "marketing-digital",
  "conseil-digital",
] as const;

export const cities = [
  "papeete",
  "bora-bora",
  "moorea",
  "pirae",
  "punaauia",
  "faaa",
] as const;

export type Service = (typeof services)[number];
export type City = (typeof cities)[number];

export interface ServiceInfo {
  slug: Service;
  name: string;
  description: string;
  benefits: string[];
  servicePageSlug: string;
}

export interface CityInfo {
  slug: City;
  name: string;
  population: string;
  description: string;
  latitude: string;
  longitude: string;
}

export const serviceInfos: Record<Service, ServiceInfo> = {
  "creation-site-web": {
    slug: "creation-site-web",
    name: "Création de Site Web",
    description:
      "Sites web professionnels sur mesure, rapides et optimisés SEO. De la landing page au site e-commerce complet.",
    benefits: [
      "Design professionnel adapté à votre secteur",
      "Optimisation SEO locale pour être trouvé sur Google",
      "Site mobile-first, rapide et sécurisé",
      "Livraison en 2 à 4 semaines",
    ],
    servicePageSlug: "sites-web",
  },
  "chatbot-ia": {
    slug: "chatbot-ia",
    name: "Chatbot IA",
    description:
      "Assistants conversationnels intelligents disponibles 24h/24, 7j/7. Répondez automatiquement aux demandes clients sur WhatsApp, Messenger et votre site.",
    benefits: [
      "Disponibilité 24h/24, 7j/7 sans coût supplémentaire",
      "Répond en français et en tahitien",
      "Intégration WhatsApp, Messenger et site web",
      "Réduit jusqu'à 60% du temps de support client",
    ],
    servicePageSlug: "chatbots",
  },
  automatisation: {
    slug: "automatisation",
    name: "Automatisation",
    description:
      "Automatisez vos tâches répétitives : devis, factures, relances clients, reporting. Gagnez 10h par semaine en moyenne.",
    benefits: [
      "Économisez 10 à 20 heures de travail par semaine",
      "Zéro erreur humaine sur les tâches automatisées",
      "Connecte vos outils existants (CRM, comptabilité, email)",
      "ROI mesurable dès le premier mois",
    ],
    servicePageSlug: "automatisation",
  },
  "application-mobile": {
    slug: "application-mobile",
    name: "Application Mobile",
    description:
      "Applications mobiles sur mesure (PWA, iOS, Android) adaptées aux besoins des entreprises polynésiennes.",
    benefits: [
      "Compatible iOS et Android",
      "PWA pour une expérience native sans app store",
      "Interface en français et tahitien",
      "Maintenance et mises à jour incluses",
    ],
    servicePageSlug: "applications",
  },
  "extraction-documents": {
    slug: "extraction-documents",
    name: "Extraction de Documents",
    description:
      "Extrayez automatiquement les données de vos PDF, formulaires et documents scannés grâce à l'IA. Fini la saisie manuelle.",
    benefits: [
      "Traitement automatique de PDF, images et formulaires",
      "Précision supérieure à 95% sur les données extraites",
      "Intégration directe dans votre système de gestion",
      "Économisez des centaines d'heures de saisie manuelle",
    ],
    servicePageSlug: "extraction-documents",
  },
  "intelligence-artificielle": {
    slug: "intelligence-artificielle",
    name: "Intelligence Artificielle",
    description:
      "Solutions IA sur mesure pour les PME polynésiennes : analyse prédictive, recommandations personnalisées, traitement du langage naturel.",
    benefits: [
      "IA adaptée à votre secteur et vos données",
      "Insights actionnables en temps réel",
      "Formation de vos équipes incluse",
      "Support local en Polynésie française",
    ],
    servicePageSlug: "intelligence-artificielle",
  },
  "marketing-digital": {
    slug: "marketing-digital",
    name: "Marketing Digital",
    description:
      "Stratégies de marketing digital adaptées au marché polynésien : SEO local, Meta Ads, Google Ads, gestion des réseaux sociaux.",
    benefits: [
      "Visibilité locale sur Google et Facebook",
      "Ciblage précis des consommateurs polynésiens",
      "Campagnes publicitaires optimisées",
      "Reporting mensuel transparent",
    ],
    servicePageSlug: "marketing-digital",
  },
  "conseil-digital": {
    slug: "conseil-digital",
    name: "Conseil Digital",
    description:
      "Accompagnement stratégique pour votre transformation digitale. Audit, feuille de route, sélection d'outils et formation de vos équipes.",
    benefits: [
      "Audit complet de votre maturité digitale",
      "Feuille de route personnalisée sur 12 mois",
      "Sélection et intégration des meilleurs outils",
      "Accompagnement de vos équipes dans le changement",
    ],
    servicePageSlug: "conseil-digital",
  },
};

export const cityInfos: Record<City, CityInfo> = {
  papeete: {
    slug: "papeete",
    name: "Papeete",
    population: "26 000",
    description:
      "capitale administrative et économique de la Polynésie française",
    latitude: "-17.5353",
    longitude: "-149.5696",
  },
  "bora-bora": {
    slug: "bora-bora",
    name: "Bora Bora",
    population: "10 600",
    description: "île emblématique du tourisme de luxe polynésien",
    latitude: "-16.5004",
    longitude: "-151.7415",
  },
  moorea: {
    slug: "moorea",
    name: "Moorea",
    population: "17 000",
    description: "île touristique à 17 km de Papeete",
    latitude: "-17.5309",
    longitude: "-149.8294",
  },
  pirae: {
    slug: "pirae",
    name: "Pirae",
    population: "14 000",
    description: "commune résidentielle et commerciale de l'agglomération de Papeete",
    latitude: "-17.5198",
    longitude: "-149.5398",
  },
  punaauia: {
    slug: "punaauia",
    name: "Punaauia",
    population: "25 000",
    description: "commune dynamique à l'ouest de Papeete",
    latitude: "-17.6143",
    longitude: "-149.6152",
  },
  faaa: {
    slug: "faaa",
    name: "Faaa",
    population: "29 000",
    description: "commune la plus peuplée de Polynésie française, siège de l'aéroport international",
    latitude: "-17.5537",
    longitude: "-149.6066",
  },
};

export interface SeoPageData {
  slug: string;
  service: ServiceInfo;
  city: CityInfo;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  faq: Array<{ question: string; answer: string }>;
  relatedServices: string[];
  relatedCities: string[];
}

export function buildSeoPageData(slug: string): SeoPageData | null {
  const parts = slug.split("-");

  let matchedService: Service | null = null;
  let matchedCity: City | null = null;

  for (const service of services) {
    if (slug.startsWith(service + "-")) {
      matchedService = service;
      const citySlug = slug.slice(service.length + 1) as City;
      if (cities.includes(citySlug)) {
        matchedCity = citySlug;
      }
      break;
    }
  }

  if (!matchedService || !matchedCity) return null;

  const service = serviceInfos[matchedService];
  const city = cityInfos[matchedCity];

  const faq = buildFaq(service, city);
  const relatedServices = services
    .filter((s) => s !== matchedService)
    .map((s) => `${s}-${matchedCity}`);
  const relatedCities = cities
    .filter((c) => c !== matchedCity)
    .map((c) => `${matchedService}-${c}`);

  return {
    slug,
    service,
    city,
    h1: `${service.name} à ${city.name}`,
    metaTitle: `${service.name} à ${city.name} | PACIFIK'AI — Agence IA Tahiti`,
    metaDescription: `${service.name} à ${city.name}, ${city.description}. PACIFIK'AI vous accompagne dans votre transformation digitale. Devis gratuit sous 24h.`,
    faq,
    relatedServices,
    relatedCities,
  };
}

function buildFaq(
  service: ServiceInfo,
  city: CityInfo
): Array<{ question: string; answer: string }> {
  const faqs: Record<Service, Array<{ question: string; answer: string }>> = {
    "creation-site-web": [
      {
        question: `Combien coûte un site web à ${city.name} ?`,
        answer: `Le prix d'un site web professionnel à ${city.name} varie de 150 000 XPF pour une landing page à plus de 500 000 XPF pour un site e-commerce complet. PACIFIK'AI propose des devis gratuits adaptés à votre budget et vos objectifs.`,
      },
      {
        question: `Combien de temps faut-il pour créer un site web à ${city.name} ?`,
        answer: `La création d'un site web prend généralement 2 à 4 semaines selon la complexité. Les projets e-commerce ou portails complexes peuvent prendre 6 à 8 semaines. Nous vous donnons un calendrier précis dès le devis.`,
      },
      {
        question: `Mon site sera-t-il visible sur Google à ${city.name} ?`,
        answer: `Oui, nous optimisons tous nos sites pour le SEO local à ${city.name} et en Polynésie française. Votre site sera structuré pour apparaître en tête des résultats Google pour votre secteur et votre zone géographique.`,
      },
    ],
    "chatbot-ia": [
      {
        question: `Un chatbot IA peut-il parler tahitien à ${city.name} ?`,
        answer: `Oui, nos chatbots sont conçus pour répondre en français et en tahitien, deux langues essentielles pour les entreprises de ${city.name}. Nous pouvons également intégrer l'anglais pour les clients touristiques.`,
      },
      {
        question: `Sur quels canaux puis-je déployer mon chatbot à ${city.name} ?`,
        answer: `Votre chatbot peut être déployé sur votre site web, WhatsApp Business, Facebook Messenger et Instagram Direct. Ces quatre canaux couvrent l'essentiel des interactions digitales des consommateurs polynésiens.`,
      },
      {
        question: `Quel est le ROI d'un chatbot pour une PME de ${city.name} ?`,
        answer: `Nos clients à ${city.name} et en Polynésie française constatent une réduction de 40 à 60% du temps passé en support client, soit une économie de 5 à 15h par semaine. Le ROI est généralement atteint en 2 à 3 mois.`,
      },
    ],
    automatisation: [
      {
        question: `Quels processus peut-on automatiser pour une entreprise à ${city.name} ?`,
        answer: `Les processus les plus courants à automatiser pour les PME de ${city.name} sont : la génération de devis, la facturation, les relances clients, l'onboarding, les rapports hebdomadaires et la publication sur les réseaux sociaux.`,
      },
      {
        question: `Faut-il changer nos logiciels pour automatiser nos processus ?`,
        answer: `Non, nous connectons vos outils existants (comptabilité, CRM, email, Excel) entre eux. Notre approche n'impose pas de changement de logiciel — nous construisons les ponts entre vos systèmes actuels.`,
      },
      {
        question: `En combien de temps voit-on les résultats de l'automatisation à ${city.name} ?`,
        answer: `Les premiers gains de temps sont visibles dès la première semaine de mise en production. En moyenne, nos clients à ${city.name} gagnent 10 à 20 heures par semaine dès le premier mois.`,
      },
    ],
    "application-mobile": [
      {
        question: `Faut-il développer une app native ou une PWA pour le marché de ${city.name} ?`,
        answer: `Pour la majorité des cas à ${city.name}, une PWA (Progressive Web App) suffit et coûte 3 à 4 fois moins cher qu'une app native. Elle est installable sur iOS et Android, fonctionne hors ligne et ne nécessite pas de passage par l'App Store.`,
      },
      {
        question: `Quel est le budget pour une application mobile à ${city.name} ?`,
        answer: `Une PWA professionnelle à ${city.name} commence à partir de 250 000 XPF. Une application native iOS + Android démarre autour de 600 000 XPF. Nous recommandons toujours la solution adaptée à votre cas d'usage.`,
      },
      {
        question: `Comment maintenir mon application mobile après le lancement à ${city.name} ?`,
        answer: `PACIFIK'AI propose des contrats de maintenance mensuels incluant les mises à jour, la surveillance des performances et les corrections de bugs. Nos équipes sont basées en Polynésie française pour un support réactif.`,
      },
    ],
    "extraction-documents": [
      {
        question: `Quels types de documents peuvent être traités par l'IA à ${city.name} ?`,
        answer: `Notre système extrait les données de PDF (contrats, factures, bons de commande), de formulaires papier scannés, d'images et de documents Word. Il traite aussi bien les documents en français qu'en tahitien.`,
      },
      {
        question: `Quelle est la précision de l'extraction automatique pour les entreprises de ${city.name} ?`,
        answer: `Notre système atteint une précision supérieure à 95% sur les documents standards. Pour les documents spécifiques à votre secteur, nous entraînons le modèle sur vos propres données pour optimiser la précision.`,
      },
      {
        question: `Comment s'intègre l'extraction IA dans notre système actuel à ${city.name} ?`,
        answer: `Nous connectons le système d'extraction à vos outils existants : ERP, comptabilité, CRM ou tableurs Excel. Les données extraites sont automatiquement versées dans vos bases sans saisie manuelle.`,
      },
    ],
    "intelligence-artificielle": [
      {
        question: `L'IA est-elle adaptée aux PME de ${city.name} ?`,
        answer: `Absolument. Les PME de ${city.name} bénéficient de l'IA pour automatiser des tâches chronophages, améliorer le service client et optimiser leurs coûts. Les solutions que nous déployons sont calibrées pour des budgets PME.`,
      },
      {
        question: `Faut-il des compétences techniques pour utiliser l'IA à ${city.name} ?`,
        answer: `Non. PACIFIK'AI conçoit des interfaces simples et forme vos équipes. L'objectif est que vos collaborateurs de ${city.name} puissent utiliser les outils IA au quotidien sans connaissances techniques.`,
      },
      {
        question: `Combien coûte une solution IA sur mesure pour une entreprise de ${city.name} ?`,
        answer: `Les projets IA pour les PME de ${city.name} démarrent autour de 200 000 XPF pour des solutions ciblées (chatbot, automatisation). Des projets plus complexes (IA prédictive, analyse de données) se situent entre 500 000 et 2 000 000 XPF.`,
      },
    ],
    "marketing-digital": [
      {
        question: `Quels canaux marketing fonctionnent le mieux à ${city.name} ?`,
        answer: `À ${city.name}, Facebook et Instagram dominent avec plus de 80% de pénétration. Le SEO local sur Google est essentiel pour être trouvé par les habitants. Google Ads complète le dispositif pour une visibilité immédiate.`,
      },
      {
        question: `Quel budget prévoir pour le marketing digital à ${city.name} ?`,
        answer: `Un budget minimal efficace à ${city.name} démarre autour de 50 000 XPF par mois (gestion de campagnes + budget publicitaire inclus). Pour des résultats accélérés, nous recommandons 100 000 à 200 000 XPF mensuels.`,
      },
      {
        question: `En combien de temps voit-on les résultats d'une campagne digitale à ${city.name} ?`,
        answer: `Les résultats SEO prennent 3 à 6 mois pour se consolider. Les campagnes payantes (Google Ads, Meta Ads) génèrent des résultats dès la première semaine. Nous mesurons toutes les actions et vous reportons chaque mois.`,
      },
    ],
    "conseil-digital": [
      {
        question: `Par où commencer sa transformation digitale à ${city.name} ?`,
        answer: `Tout commence par un audit de maturité digitale. PACIFIK'AI évalue vos processus actuels, identifie les opportunités d'amélioration et vous présente une feuille de route priorisée par ROI pour votre entreprise à ${city.name}.`,
      },
      {
        question: `Combien coûte un accompagnement conseil digital à ${city.name} ?`,
        answer: `Nos missions de conseil commencent par un audit gratuit. L'accompagnement structuré sur 3 à 12 mois se situe entre 150 000 et 500 000 XPF selon la durée et la profondeur d'intervention.`,
      },
      {
        question: `PACIFIK'AI accompagne-t-il aussi les entreprises dans les îles proches de ${city.name} ?`,
        answer: `Oui, nous accompagnons les entreprises dans toute la Polynésie française, en présentiel à ${city.name} et dans les îles, et à distance pour les atolls éloignés. Notre équipe se déplace pour les phases clés du projet.`,
      },
    ],
  };

  return faqs[service.slug] || [];
}
