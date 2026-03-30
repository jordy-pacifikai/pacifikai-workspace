import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceMarketingVisual from "@/components/ui/service-visuals/ServiceMarketingVisual";

export const metadata: Metadata = {
  title: "Marketing Digital Automatisé à Tahiti | PACIFIK'AI — IA Polynésie",
  description:
    "Marketing digital automatisé par IA à Tahiti : newsletters, réseaux sociaux, emails de relance. Votre marketing en pilote automatique en Polynésie française.",
  openGraph: {
    title: "Marketing Digital Automatisé à Tahiti | PACIFIK'AI",
    description:
      "Marketing digital automatisé par IA à Tahiti : newsletters, réseaux sociaux, emails de relance.",
    url: "https://pacifikai.com/services/marketing",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/marketing",
  },
};

const ICON_STRATEGY = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20V8" />
    <path d="M22 4v16" />
  </svg>
);

const ICON_CREATE = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ICON_PUBLISH = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ICON_ENGAGE = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ICON_CLOCK = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_VOLUME = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ICON_EMAIL = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);

const ICON_NEWSLETTER = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);

const ICON_SOCIAL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ICON_SEQ = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function MarketingPage() {
  return (
    <ServicePage
      badge="Auto-pilot actif"
      title="Marketing"
      titleHighlight="Automatisé"
      description="Newsletters, posts réseaux sociaux, emails de relance — générés et publiés automatiquement par l'IA. Votre marketing tourne en pilote automatique."
      heroVisual={<ServiceMarketingVisual />}
      heroStat="+45% d'engagement en moyenne"
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_STRATEGY,
          title: "Stratégie",
          description:
            "On définit vos objectifs, votre audience et votre calendrier éditorial.",
        },
        {
          number: "Étape 02",
          icon: ICON_CREATE,
          title: "Création IA",
          description:
            "L'IA génère vos contenus : newsletters, posts sociaux, emails de relance, visuels.",
        },
        {
          number: "Étape 03",
          icon: ICON_PUBLISH,
          title: "Publication auto",
          description:
            "Tout est programmé et publié automatiquement aux meilleurs horaires.",
        },
      ]}
      stepsTitle="3 étapes, votre marketing tourne tout seul"
      stepsSubtitle="De la stratégie à la publication, on automatise tout."
      metrics={[
        { icon: ICON_ENGAGE, value: "+45%", label: "Engagement moyen", barPercent: 45 },
        { icon: ICON_CLOCK, value: "10h/sem", label: "Temps gagné sur le contenu" },
        { icon: ICON_VOLUME, value: "x3", label: "Volume de contenu publié" },
        { icon: ICON_EMAIL, value: "78%", label: "Taux d'ouverture emails IA", barPercent: 78 },
      ]}
      metricsTitle="Chiffres clés"
      useCases={[
        {
          icon: ICON_NEWSLETTER,
          title: "Newsletters automatiques",
          description:
            "Votre newsletter hebdomadaire générée par l'IA avec vos actualités, promotions et conseils — envoyée automatiquement à votre base.",
        },
        {
          icon: ICON_SOCIAL,
          title: "Posts réseaux sociaux",
          description:
            "L'IA crée et publie vos posts Facebook, Instagram et LinkedIn. Visuels, captions et hashtags optimisés pour votre audience.",
        },
        {
          icon: ICON_SEQ,
          title: "Email séquences",
          description:
            "Séquences d'emails de bienvenue, relance panier, anniversaire — déclenchées automatiquement selon le comportement client.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Des automatisations marketing concrètes pour votre entreprise."
      faqs={[
        {
          question: "L'IA peut-elle écrire dans mon style ?",
          answer:
            "Oui, on entraîne l'IA sur vos contenus existants pour qu'elle respecte votre ton, votre vocabulaire et votre style de communication.",
        },
        {
          question: "Quels réseaux sociaux sont supportés ?",
          answer:
            "Facebook, Instagram, LinkedIn, et X (Twitter). On peut aussi automatiser TikTok et YouTube Shorts sur demande.",
        },
        {
          question: "Puis-je valider les contenus avant publication ?",
          answer:
            "Oui, un workflow de validation est disponible. Vous recevez les contenus par email ou Slack avant publication, avec un clic pour approuver.",
        },
        {
          question: "Comment l'IA connaît mon entreprise ?",
          answer:
            "On l'alimente avec vos documents, site web, historique de posts, et vos directives éditoriales. Elle apprend et s'améliore en continu.",
        },
      ]}
      ctaFinalTitle="Prêt à automatiser votre marketing ?"
      ctaFinalSubtitle="Contactez-nous pour une démo de votre marketing en pilote automatique."
    />
  );
}
