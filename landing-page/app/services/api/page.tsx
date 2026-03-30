import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceAPIVisual from "@/components/ui/service-visuals/ServiceAPIVisual";

export const metadata: Metadata = {
  title: "Intégrations API à Tahiti | PACIFIK'AI — Connectez vos Outils Polynésie",
  description:
    "Intégrations API sur-mesure à Tahiti : CRM, facturation, calendrier, messaging. Un écosystème unifié pour entreprises en Polynésie française.",
  openGraph: {
    title: "Intégrations API à Tahiti | PACIFIK'AI",
    description:
      "Intégrations API sur-mesure à Tahiti : CRM, facturation, calendrier, messaging.",
    url: "https://pacifikai.com/services/api",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/api",
  },
};

const ICON_MAP = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_CONNECT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ICON_SYNC = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
);

const ICON_ZERO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const ICON_APPS = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ICON_SPEED = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_ERROR = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_CRM = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ICON_CAL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ICON_PMS = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function ApiPage() {
  return (
    <ServicePage
      badge="0 saisie manuelle"
      title="Intégrations"
      titleHighlight="API"
      description="Connexion de tous vos outils : CRM, facturation, calendrier, messaging — un écosystème unifié où tout communique automatiquement."
      heroVisual={<ServiceAPIVisual />}
      heroStat="0 saisie manuelle"
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_MAP,
          title: "Cartographie",
          description:
            "On identifie tous vos outils et les flux de données entre eux.",
        },
        {
          number: "Étape 02",
          icon: ICON_CONNECT,
          title: "Connexion",
          description:
            "On connecte vos APIs : CRM ↔ Facturation ↔ Email ↔ Calendrier.",
        },
        {
          number: "Étape 03",
          icon: ICON_SYNC,
          title: "Synchronisation",
          description:
            "Vos données circulent en temps réel entre tous vos outils, sans intervention.",
        },
      ]}
      stepsTitle="Comment ça marche"
      stepsSubtitle="De la cartographie à la synchronisation complète de votre écosystème."
      metrics={[
        { icon: ICON_ZERO, value: "0", label: "Saisie manuelle" },
        { icon: ICON_APPS, value: "+500", label: "Applications connectables" },
        { icon: ICON_SPEED, value: "< 1s", label: "Temps de sync entre outils" },
        { icon: ICON_ERROR, value: "-90%", label: "Erreurs de double saisie", barPercent: 90 },
      ]}
      metricsTitle="Chiffres clés"
      useCases={[
        {
          icon: ICON_CRM,
          title: "CRM ↔ Facturation",
          description:
            "Un nouveau client dans votre CRM ? La facture est générée automatiquement dans QuickBooks. Le paiement reçu met à jour le statut du deal.",
        },
        {
          icon: ICON_CAL,
          title: "Calendrier ↔ Email",
          description:
            "Un rendez-vous pris en ligne ? Confirmation email envoyée, rappel SMS J-1, compte-rendu post-meeting automatique.",
        },
        {
          icon: ICON_PMS,
          title: "PMS ↔ Channel Manager",
          description:
            "Vos réservations hôtelières synchronisées en temps réel entre booking.com, Expedia et votre PMS. Zéro overbooking.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Des intégrations concrètes pour éliminer la double saisie."
      faqs={[
        {
          question: "Quelles APIs pouvez-vous intégrer ?",
          answer:
            "Toute application avec une API REST ou webhook : Salesforce, HubSpot, QuickBooks, Xero, Google Workspace, Microsoft 365, Shopify, WooCommerce, et des centaines d'autres.",
        },
        {
          question: "Que faire si mon logiciel n'a pas d'API ?",
          answer:
            "On peut souvent contourner via import/export automatisé, scraping structuré ou connexion base de données directe. On évalue au cas par cas.",
        },
        {
          question: "Les données sont-elles synchronisées en temps réel ?",
          answer:
            "Oui, pour les intégrations webhook. Pour les autres, on peut configurer des synchronisations toutes les minutes, heures ou jours selon vos besoins.",
        },
        {
          question: "Que se passe-t-il en cas de panne d'un outil tiers ?",
          answer:
            "Les données sont mises en file d'attente et synchronisées dès le retour en ligne. Aucune donnée n'est perdue. Vous êtes notifié en cas d'interruption.",
        },
      ]}
      ctaFinalTitle="Prêt à unifier vos outils ?"
      ctaFinalSubtitle="Contactez-nous pour une cartographie gratuite de votre écosystème."
    />
  );
}
