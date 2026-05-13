import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceAppVisual from "@/components/ui/service-visuals/ServiceAppVisual";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getOptimalLinks } from "@/lib/internal-links";

export const metadata: Metadata = {
  title: "Applications Web & Mobile à Tahiti | PACIFIK'AI — Développement Polynésie",
  description:
    "Développement d'applications web et mobiles à Tahiti : dashboards, portails clients, apps métier sur-mesure alimentés par l'IA. Polynésie française.",
  openGraph: {
    title: "Applications Web & Mobile à Tahiti | PACIFIK'AI",
    description:
      "Développement d'applications web et mobiles à Tahiti : dashboards, portails clients, apps métier sur-mesure.",
    url: "https://pacifikai.com/services/apps",
    locale: "fr_PF",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/apps",
  },
};

const ICON_DESIGN = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const ICON_DEV = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ICON_AI = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="6" y="14" width="12" height="8" rx="2" />
    <path d="M12 10v4" />
  </svg>
);

const ICON_CUSTOM = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_DELIVERY = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_UPTIME = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_TASKS = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ICON_DASHBOARD = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ICON_PORTAL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ICON_BOOKING = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const relatedLinks = getOptimalLinks("/services/apps", "service", ["application", "mobile", "dashboard", "portail", "pwa"]);

export default function AppsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema("Applications Web & Mobile", "Développement d'applications web et mobiles à Tahiti : dashboards, portails clients, apps métier sur-mesure alimentés par l'IA. Polynésie française.", "https://pacifikai.com/services/apps")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Services", url: "https://pacifikai.com/services" }, { name: "Applications Web & Mobile", url: "https://pacifikai.com/services/apps" }])) }} />
      <ServicePage
      badge="Sur-mesure 100%"
      title="Applications"
      titleHighlight="Web & Mobile"
      description="Dashboards, portails clients, apps métier — conçus sur-mesure et alimentés par l'IA. Des outils qui travaillent pour vous."
      heroVisual={<ServiceAppVisual />}
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_DESIGN,
          title: "Conception",
          description:
            "On conçoit l'interface avec vous : wireframes, design, expérience utilisateur optimale.",
        },
        {
          number: "Étape 02",
          icon: ICON_DEV,
          title: "Développement",
          description:
            "On développe votre application avec les technologies les plus performantes (Next.js, React, TypeScript).",
        },
        {
          number: "Étape 03",
          icon: ICON_AI,
          title: "IA intégrée",
          description:
            "L'IA est intégrée nativement : suggestions intelligentes, automatisations, analytics avancés.",
        },
      ]}
      stepsTitle="3 étapes, votre app est en ligne"
      stepsSubtitle="De la conception au déploiement, on gère tout."
      metrics={[
        { icon: ICON_CUSTOM, value: "100%", label: "Sur-mesure adapté à vos besoins" },
        { icon: ICON_DELIVERY, value: "2-4 sem", label: "Délai de livraison typique" },
        { icon: ICON_UPTIME, value: "99.9%", label: "Uptime garanti", barPercent: 99 },
        { icon: ICON_TASKS, value: "-60%", label: "Réduction des tâches manuelles", barPercent: 60 },
      ]}
      metricsTitle="Des résultats concrets"
      useCases={[
        {
          icon: ICON_DASHBOARD,
          title: "Dashboard KPI",
          description:
            "Tableau de bord temps réel pour suivre vos indicateurs clés. Ventes, réservations, satisfaction client — tout en un coup d'œil avec alertes IA.",
        },
        {
          icon: ICON_PORTAL,
          title: "Portail client",
          description:
            "Espace client sécurisé où vos clients suivent leurs commandes, factures et historique. Moins d'appels au support, plus de satisfaction.",
        },
        {
          icon: ICON_BOOKING,
          title: "App de réservation",
          description:
            "Système de réservation en ligne intégré à votre calendrier et votre facturation. L'IA gère les créneaux et les confirmations.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Des applications métier pensées pour les entreprises de Polynésie."
      faqs={[
        {
          question: "Quelle est la différence avec un site web classique ?",
          answer:
            "Une application web est interactive et connectée à vos données en temps réel. Elle remplace des processus manuels et s'adapte aux actions de l'utilisateur.",
        },
        {
          question: "Quel budget prévoir ?",
          answer:
            "Une application simple (dashboard, portail) démarre à 300 000 XPF. Une application complexe avec intégrations multiples est devisée sur mesure.",
        },
        {
          question: "Les applications fonctionnent-elles sur mobile ?",
          answer:
            "Oui, toutes nos applications sont responsive et optimisées mobile. On peut aussi développer des PWA (Progressive Web App) installables sur smartphone.",
        },
        {
          question: "Qui maintient l'application après livraison ?",
          answer:
            "Nous proposons des contrats de maintenance mensuels qui couvrent les mises à jour, la sécurité et les évolutions mineures.",
        },
      ]}
      ctaFinalTitle="Prêt à créer votre application sur-mesure ?"
      ctaFinalSubtitle="Contactez-nous pour discuter de votre projet."
    />
    <RelatedLinks links={relatedLinks} />
    </>
  );
}
