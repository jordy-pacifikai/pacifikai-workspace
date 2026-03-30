import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import WebPremiumVisual from "@/components/ui/expertise-visuals/WebPremiumVisual";

export const metadata: Metadata = {
  title: "Sites Haute Conversion | PACIFIK'AI",
  description:
    "Sites web haute conversion : design Awwwards-level et architecture UX data-driven pour transformer vos visiteurs en clients. Résultats mesurés, pas estimés.",
};

/* ── Inline SVG icons ── */

const IconBrush = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.07" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1 3.5 1 1.1 0 1.9-.98 2.5-2 .63-1.05.16-4.04-.96-4.04z" />
  </svg>
);

const IconSparkles = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const IconZap = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconTarget = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconLayers = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12" />
    <path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17" />
  </svg>
);

const IconBarChart = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconHotel = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
    <path d="M3 22H21" />
    <path d="M9 22V12h6v10" />
    <path d="M9 7V3" />
    <path d="M15 7V3" />
  </svg>
);

const IconCalendar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconMegaphone = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);

export default function SitesWebPremiumPage() {
  return (
    <ExpertisePage
      accentColor="purple"
      badge="Design qui convertit, pas qui decore"
      title="Sites"
      titleHighlight="Haute Conversion"
      description="Chaque pixel a un objectif. Nos sites combinent design Awwwards-level et architecture UX data-driven pour transformer vos visiteurs en clients — pas juste les impressionner."
      heroVisual={<WebPremiumVisual />}
      competenciesTitle="Ce qui fait la difference"
      competencies={[
        {
          icon: IconTarget,
          title: "Architecture de persuasion",
          description:
            "Chaque section suit un framework de conversion éprouvé : hiérarchie visuelle, social proof, urgence et CTA stratégiques placés au bon moment du parcours.",
        },
        {
          icon: IconSparkles,
          title: "Micro-interactions qui guident",
          description:
            "Animations subtiles et feedback visuel qui dirigent l'attention vers l'action — pas de décoration gratuite, chaque mouvement a un but.",
        },
        {
          icon: IconBrush,
          title: "A/B testing natif",
          description:
            "Infrastructure de test intégrée dès le build. Variantes de headlines, CTA, layouts testées en continu pour maximiser chaque point de conversion.",
        },
        {
          icon: IconZap,
          title: "Vitesse obsessionnelle (<1s)",
          description:
            "Chaque 100ms de chargement en moins = +1% de conversion. Core Web Vitals parfaits, lazy loading intelligent, code splitté au pixel près.",
        },
        {
          icon: IconBarChart,
          title: "Analytics intégrés",
          description:
            "Tracking granulaire des parcours utilisateur, heatmaps, funnel analysis et dashboards temps réel pour piloter les optimisations par la data.",
        },
        {
          icon: IconLayers,
          title: "Progressive disclosure",
          description:
            "L'information se révèle au bon moment. Pas de surcharge cognitive — chaque écran montre exactement ce qu'il faut pour passer à l'étape suivante.",
        },
      ]}
      metrics={[
        { value: "100/100", label: "Score Lighthouse" },
        { value: "<1.5s",   label: "Temps de chargement" },
        { value: "+200%",   label: "Taux de conversion" },
        { value: "0",       label: "Template utilisé" },
      ]}
      process={[
        {
          step: "01",
          title: "Design sur mesure",
          description:
            "Immersion dans votre univers de marque, maquettes pixel-perfect et validation visuelle avant la première ligne de code.",
        },
        {
          step: "02",
          title: "Développement premium",
          description:
            "Intégration rigoureuse des animations, optimisation des performances et tests sur l'ensemble des navigateurs et appareils.",
        },
        {
          step: "03",
          title: "Déploiement & suivi",
          description:
            "Mise en ligne sécurisée, indexation optimisée et suivi de la performance pour garantir des résultats durables.",
        },
      ]}
      useCasesTitle="Conversions mesurees, pas estimees"
      useCases={[
        {
          icon: IconHotel,
          title: "Site vitrine luxe hôtel",
          description:
            "Galeries immersives, réservation en ligne fluide et storytelling visuel pour incarner une expérience haut de gamme dès la première visite.",
          result: "+180% de réservations directes",
        },
        {
          icon: IconCalendar,
          title: "Portail réservation activités",
          description:
            "Plateforme de réservation multi-activités avec disponibilités en temps réel, paiement intégré et interface pensée pour la conversion.",
          result: "Taux d'abandon réduit de 60%",
        },
        {
          icon: IconMegaphone,
          title: "Landing page campagne marketing",
          description:
            "Page d'atterrissage ultra-optimisée, A/B testée et orientée performance pour maximiser les leads sur chaque campagne publicitaire.",
          result: "Coût par lead divisé par 3",
        },
      ]}
      ctaTitle="Un site qui travaille pour vous"
      ctaSubtitle="Pas un site vitrine. Un outil de conversion. Parlons de vos objectifs business."
    />
  );
}
