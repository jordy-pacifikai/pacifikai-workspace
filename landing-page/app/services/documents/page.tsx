import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceDocumentVisual from "@/components/ui/service-visuals/ServiceDocumentVisual";

export const metadata: Metadata = {
  title: "Extraction de Documents IA à Tahiti | PACIFIK'AI — OCR Polynésie",
  description:
    "Extraction automatique de documents par IA à Tahiti : factures, bons de commande, relevés bancaires. Plus de saisie manuelle pour entreprises en Polynésie française.",
  openGraph: {
    title: "Extraction de Documents IA à Tahiti | PACIFIK'AI",
    description:
      "Extraction automatique de documents par IA à Tahiti : factures, bons de commande, relevés bancaires.",
    url: "https://pacifikai.com/services/documents",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/documents",
  },
};

const ICON_UPLOAD = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
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

const ICON_EXPORT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ICON_SPEED = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_ACCURACY = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_ZERO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const ICON_TIME = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ICON_INVOICE = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ICON_ORDER = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M4 6h16l-2 14H6z" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
);

const ICON_BANK = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default function DocumentsPage() {
  return (
    <ServicePage
      badge="Extraction en 5 secondes"
      title="Extraction de"
      titleHighlight="Documents IA"
      description="L'IA lit vos factures, bons de commande et relevés bancaires. Elle extrait les données automatiquement — plus de saisie manuelle."
      heroVisual={<ServiceDocumentVisual />}
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_UPLOAD,
          title: "Upload",
          description:
            "Envoyez vos documents (PDF, images, emails) — par email, drive ou upload direct.",
        },
        {
          number: "Étape 02",
          icon: ICON_AI,
          title: "Analyse IA",
          description:
            "L'IA identifie le type de document et extrait les données clés automatiquement.",
        },
        {
          number: "Étape 03",
          icon: ICON_EXPORT,
          title: "Export",
          description:
            "Les données sont envoyées dans votre logiciel de compta, votre CRM ou votre tableur.",
        },
      ]}
      stepsTitle="3 étapes simples pour automatiser l'extraction"
      stepsSubtitle="De l'envoi du document au résultat dans votre système."
      metrics={[
        { icon: ICON_SPEED, value: "10x", label: "Plus rapide que la saisie manuelle" },
        { icon: ICON_ACCURACY, value: "99%", label: "Précision d'extraction", barPercent: 99 },
        { icon: ICON_ZERO, value: "0", label: "Saisie manuelle requise" },
        { icon: ICON_TIME, value: "5s", label: "Traitement par document" },
      ]}
      metricsTitle="Des résultats mesurables dès le premier mois"
      useCases={[
        {
          icon: ICON_INVOICE,
          title: "Factures fournisseurs",
          description:
            "Recevez une facture par email, l'IA l'analyse et envoie les données dans votre compta. Montant, date, TVA, fournisseur — tout extrait en 5 secondes.",
        },
        {
          icon: ICON_ORDER,
          title: "Bons de commande",
          description:
            "Vos bons de commande sont scannés et les lignes produits, quantités et prix sont extraits pour votre ERP automatiquement.",
        },
        {
          icon: ICON_BANK,
          title: "Relevés bancaires",
          description:
            "Importez vos relevés bancaires, l'IA catégorise chaque transaction et prépare le rapprochement bancaire.",
        },
      ]}
      useCasesTitle="Cas d'usage en Polynésie"
      useCasesSubtitle="Des solutions concrètes pour les entreprises polynésiennes."
      faqs={[
        {
          question: "Quels formats de documents sont supportés ?",
          answer:
            "PDF, images (JPG, PNG), emails, Word et Excel. L'IA gère aussi bien les documents scannés que les fichiers numériques.",
        },
        {
          question: "Quelle est la précision d'extraction ?",
          answer:
            "99% de précision sur les documents standards. Pour les documents complexes ou manuscrits, une validation humaine rapide est possible.",
        },
        {
          question: "Avec quels logiciels de comptabilité ça s'intègre ?",
          answer:
            "QuickBooks, Xero, Sage, et tout logiciel avec une API ou import CSV. On peut aussi envoyer les données directement dans Google Sheets ou Excel.",
        },
        {
          question: "Mes documents sont-ils sécurisés ?",
          answer:
            "Oui, vos documents sont chiffrés en transit et au repos. Nous n'utilisons jamais vos données pour entraîner des modèles.",
        },
      ]}
      ctaFinalTitle="Prêt à éliminer la saisie manuelle ?"
      ctaFinalSubtitle="Contactez-nous pour une démo avec vos propres documents."
    />
  );
}
