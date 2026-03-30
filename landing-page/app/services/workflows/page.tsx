import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceWorkflowVisual from "@/components/ui/service-visuals/ServiceWorkflowVisual";

export const metadata: Metadata = {
  title: "Automatisation IA à Tahiti | PACIFIK'AI — Workflows Polynésie",
  description:
    "Automatisation des processus par IA à Tahiti : réservations, facturation, relances. Connectez vos applications et gagnez 85% de temps. Entreprises Polynésie française.",
  openGraph: {
    title: "Automatisation IA à Tahiti | PACIFIK'AI",
    description:
      "Automatisation des processus par IA à Tahiti : réservations, facturation, relances.",
    url: "https://pacifikai.com/services/workflows",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/workflows",
  },
};

const ICON_AUDIT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_IMPL = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ICON_RESULTS = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ICON_TIME = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ICON_NONSTOP = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_SETUP = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_PROD = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_HOTEL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ICON_DOC = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ICON_MAIL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);

export default function WorkflowsPage() {
  return (
    <ServicePage
      badge="85% de temps gagné en moyenne"
      title="Automatisation de"
      titleHighlight="Workflows"
      description="Connectez vos applications, automatisez vos processus. Réservations, commandes, facturation, relances — laissez l'IA faire le travail répétitif."
      heroVisual={<ServiceWorkflowVisual />}
      heroStat="85% de temps gagné en moyenne"
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_AUDIT,
          title: "Audit",
          description:
            "On analyse vos processus actuels pour identifier les tâches répétitives et les quick wins.",
        },
        {
          number: "Étape 02",
          icon: ICON_IMPL,
          title: "Implémentation",
          description:
            "On connecte vos outils (CRM, facturation, email) avec des workflows IA automatisés.",
        },
        {
          number: "Étape 03",
          icon: ICON_RESULTS,
          title: "Résultats",
          description:
            "Vos processus tournent 24/7 sans intervention, avec rapports de performance en temps réel.",
        },
      ]}
      stepsTitle="Comment ça marche"
      stepsSubtitle="De l'audit à l'automatisation complète, on gère tout."
      metrics={[
        { icon: ICON_TIME, value: "85%", label: "Temps gagné sur les tâches répétitives", barPercent: 85 },
        { icon: ICON_NONSTOP, value: "24/7", label: "Fonctionnement continu sans pause" },
        { icon: ICON_SETUP, value: "10 min", label: "Temps moyen de setup d'un workflow" },
        { icon: ICON_PROD, value: "+300%", label: "Productivité des équipes", barPercent: 75 },
      ]}
      metricsTitle="Chiffres clés"
      useCases={[
        {
          icon: ICON_HOTEL,
          title: "Réservations hôtelières",
          description:
            "Synchronisation automatique entre booking.com, le PMS et la facturation. Zéro double saisie.",
        },
        {
          icon: ICON_DOC,
          title: "Facturation automatique",
          description:
            "Génération et envoi automatique des factures à partir des bons de commande reçus.",
        },
        {
          icon: ICON_MAIL,
          title: "Relances clients",
          description:
            "Emails et SMS de rappel envoyés automatiquement selon le statut du dossier.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Des automatisations concrètes pour les entreprises de Polynésie."
      faqs={[
        {
          question: "Quels outils pouvez-vous connecter ?",
          answer:
            "Nous connectons plus de 500 applications : CRM (HubSpot, Pipedrive), facturation (QuickBooks, Xero), email (Gmail, Outlook), calendrier, messagerie (WhatsApp, Messenger), et bien plus.",
        },
        {
          question: "Combien de temps pour mettre en place un workflow ?",
          answer:
            "Un workflow simple prend 1 à 3 jours. Une infrastructure complète avec plusieurs workflows connectés prend 1 à 2 semaines.",
        },
        {
          question: "Est-ce que ça fonctionne avec mes outils existants ?",
          answer:
            "Oui, nous nous adaptons à votre stack technique actuelle. Pas besoin de changer vos outils, on les connecte entre eux.",
        },
        {
          question: "Que se passe-t-il si un workflow échoue ?",
          answer:
            "Chaque workflow a des alertes automatiques et des mécanismes de fallback. Vous êtes notifié immédiatement et on intervient sous 24h.",
        },
      ]}
      ctaFinalTitle="Prêt à automatiser vos processus ?"
      ctaFinalSubtitle="Écrivez-nous pour discuter de vos besoins en automatisation."
    />
  );
}
