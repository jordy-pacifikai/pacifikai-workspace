import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceChatbotVisual from "@/components/ui/service-visuals/ServiceChatbotVisual";

export const metadata: Metadata = {
  title: "Chatbots & Agents IA à Tahiti | PACIFIK'AI — Polynésie française",
  description:
    "Chatbots et agents IA à Tahiti, disponibles 24/7 sur WhatsApp, Messenger et votre site web. Service client automatisé pour entreprises en Polynésie française.",
  openGraph: {
    title: "Chatbots & Agents IA à Tahiti | PACIFIK'AI",
    description:
      "Chatbots et agents IA à Tahiti, disponibles 24/7 sur WhatsApp, Messenger et votre site web.",
    url: "https://pacifikai.com/services/chatbots",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/chatbots",
  },
};

const ICON_PERSONALIZE = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_DEPLOY = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);

const ICON_LEARN = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ICON_CLOCK = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_BOLT = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_CHECK = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_BAR = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const ICON_HOTEL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ICON_MSG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ICON_FAQ = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ChatbotsPage() {
  return (
    <ServicePage
      badge="24/7 disponible, 0 attente"
      title="Chatbots &"
      titleHighlight="Agents IA"
      description="Assistants virtuels disponibles 24/7 sur WhatsApp, Messenger ou votre site web. Ils répondent, réservent et vendent — pendant que vous dormez."
      heroVisual={<ServiceChatbotVisual />}
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_PERSONALIZE,
          title: "Personnalisation",
          description:
            "On définit la personnalité, le ton et les connaissances de votre agent IA selon votre activité.",
        },
        {
          number: "Étape 02",
          icon: ICON_DEPLOY,
          title: "Déploiement",
          description:
            "On l'installe sur WhatsApp, Messenger, ou directement sur votre site en quelques heures.",
        },
        {
          number: "Étape 03",
          icon: ICON_LEARN,
          title: "Apprentissage",
          description:
            "L'agent s'améliore avec chaque conversation grâce à l'IA — plus il répond, plus il devient précis.",
        },
      ]}
      stepsTitle="3 étapes, votre agent est en ligne"
      stepsSubtitle="De la conception au déploiement, on gère tout."
      metrics={[
        { icon: ICON_CLOCK, value: "24/7", label: "Disponibilité permanente" },
        { icon: ICON_BOLT, value: "< 3s", label: "Temps de réponse moyen" },
        { icon: ICON_CHECK, value: "78%", label: "Résolution sans humain", barPercent: 78 },
        { icon: ICON_BAR, value: "+45%", label: "Augmentation des conversions", barPercent: 45 },
      ]}
      metricsTitle="Un ROI mesurable dès le premier mois"
      useCases={[
        {
          icon: ICON_HOTEL,
          title: "Concierge hôtelier WhatsApp",
          description:
            "Votre chatbot répond aux questions des touristes en français, anglais et tahitien. Réservations, activités, room service — tout en automatique.",
        },
        {
          icon: ICON_MSG,
          title: "SAV Messenger",
          description:
            "Les clients de votre commerce posent leurs questions sur Messenger. L'IA répond instantanément avec votre catalogue et vos tarifs.",
        },
        {
          icon: ICON_FAQ,
          title: "FAQ intelligent site web",
          description:
            "Un widget sur votre site web qui répond aux questions fréquentes, qualifie les leads et prend les rendez-vous.",
        },
      ]}
      useCasesTitle="Pensé pour la Polynésie"
      useCasesSubtitle="Des solutions concrètes adaptées aux entreprises locales."
      faqs={[
        {
          question: "Sur quelles plateformes fonctionne le chatbot ?",
          answer:
            "WhatsApp Business, Facebook Messenger, Instagram DM, Telegram, et widget intégré à votre site web. On peut aussi le connecter à des SMS.",
        },
        {
          question: "Le chatbot peut-il parler plusieurs langues ?",
          answer:
            "Oui, nos agents IA sont multilingues. Français, anglais, et on peut ajouter le tahitien ou toute autre langue.",
        },
        {
          question: "Comment le chatbot connaît mon entreprise ?",
          answer:
            "On l'alimente avec vos documents, FAQ, catalogues et procédures. Il répond uniquement avec vos informations, jamais d'hallucination.",
        },
        {
          question: "Peut-il transférer vers un humain ?",
          answer:
            "Oui, si la question dépasse ses compétences, il transfère automatiquement vers votre équipe avec le contexte complet de la conversation.",
        },
      ]}
      ctaFinalTitle="Prêt à avoir un assistant IA 24/7 ?"
      ctaFinalSubtitle="Contactez-nous pour une démo personnalisée."
    />
  );
}
