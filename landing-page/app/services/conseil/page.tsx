import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceConseilVisual from "@/components/ui/service-visuals/ServiceConseilVisual";

export const metadata: Metadata = {
  title: "Conseil & Formation IA à Tahiti | PACIFIK'AI — Stratégie Digitale Polynésie",
  description:
    "Conseil en intelligence artificielle et formation IA à Tahiti. Audit de processus, stratégie digitale et accompagnement pour entreprises en Polynésie française.",
  openGraph: {
    title: "Conseil & Formation IA à Tahiti | PACIFIK'AI",
    description:
      "Conseil en intelligence artificielle et formation IA à Tahiti. Audit et stratégie digitale.",
    url: "https://pacifikai.com/services/conseil",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/conseil",
  },
};

const ICON_AUDIT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_STRAT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20V8" />
    <path d="M22 4v16" />
  </svg>
);

const ICON_TRAIN = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_ROI = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_WINS = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_TEAM = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_COSTS = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ICON_PROCESS = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ICON_ROADMAP = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const ICON_WORKSHOP = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default function ConseilPage() {
  return (
    <ServicePage
      badge="ROI en 30 jours"
      title="Conseil &"
      titleHighlight="Formation IA"
      description="Audit de vos processus, stratégie IA personnalisée et formation de vos équipes. Devenez autonomes dans l'utilisation de l'IA."
      heroVisual={<ServiceConseilVisual />}
      ctaLabel="Discutons de votre projet"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_AUDIT,
          title: "Audit",
          description:
            "On analyse vos processus actuels, identifie les quick wins et les opportunités d'automatisation IA.",
        },
        {
          number: "Étape 02",
          icon: ICON_STRAT,
          title: "Stratégie",
          description:
            "On construit votre feuille de route IA : priorités, technologies, budget, planning.",
        },
        {
          number: "Étape 03",
          icon: ICON_TRAIN,
          title: "Formation",
          description:
            "On forme vos équipes à utiliser les outils IA au quotidien pour être autonomes.",
        },
      ]}
      stepsTitle="3 étapes vers l'autonomie IA"
      stepsSubtitle="De l'audit à la formation, on vous accompagne jusqu'à l'autonomie complète."
      metrics={[
        { icon: ICON_ROI, value: "30 j", label: "Premier ROI visible" },
        { icon: ICON_WINS, value: "5-10", label: "Quick wins identifiés par audit" },
        { icon: ICON_TEAM, value: "100%", label: "Équipes formées et autonomes", barPercent: 100 },
        { icon: ICON_COSTS, value: "-40%", label: "Coûts opérationnels après 6 mois", barPercent: 40 },
      ]}
      metricsTitle="Des résultats concrets et mesurables"
      useCases={[
        {
          icon: ICON_PROCESS,
          title: "Audit processus",
          description:
            "On passe 2 jours dans votre entreprise. On observe, on mesure, on identifie les 5-10 tâches qui peuvent être automatisées immédiatement.",
        },
        {
          icon: ICON_ROADMAP,
          title: "Stratégie IA",
          description:
            "Votre feuille de route IA sur 12 mois : quels outils déployer, dans quel ordre, avec quel budget. Pas de buzzwords, que du concret.",
        },
        {
          icon: ICON_WORKSHOP,
          title: "Formation équipes",
          description:
            "Workshops pratiques : vos équipes apprennent à utiliser ChatGPT, les chatbots, les workflows. Exercices sur leurs vrais cas d'usage.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Un accompagnement adapté à votre niveau de maturité IA."
      faqs={[
        {
          question: "Faut-il être technique pour bénéficier du conseil ?",
          answer:
            "Non, c'est précisément l'inverse. Nous traduisons les enjeux IA en langage business et actions concrètes. Aucune connaissance technique requise.",
        },
        {
          question: "Combien coûte un audit ?",
          answer:
            "Un audit d'une journée commence à 50 000 XPF. Il inclut le rapport détaillé, les recommandations prioritaires et une session de restitution.",
        },
        {
          question: "La formation peut-elle se faire à distance ?",
          answer:
            "Oui, nous proposons des formations en présentiel à Papeete et en visioconférence pour les autres îles. Les supports restent accessibles après la formation.",
        },
        {
          question: "Accompagnez-vous aussi des petites structures ?",
          answer:
            "Oui, nous travaillons avec des entreprises de toutes tailles. Pour les TPE, nous proposons des formules adaptées à partir d'une demi-journée.",
        },
      ]}
      ctaFinalTitle="Prêt à accélérer avec l'IA ?"
      ctaFinalSubtitle="Écrivez-nous pour discuter de vos besoins et voir comment on peut vous aider."
    />
  );
}
