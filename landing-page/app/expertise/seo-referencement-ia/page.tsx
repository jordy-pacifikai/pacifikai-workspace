import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import SEOVisual from "@/components/ui/expertise-visuals/SEOVisual";

export const metadata: Metadata = {
  title: "SEO & Referencement IA Tahiti | PACIFIK'AI",
  description:
    "Expertise SEO technique, GEO et referencement local en Polynesie francaise. Audit, optimisation et strategie pour etre visible sur Google et les moteurs IA.",
  openGraph: {
    title: "SEO & Referencement IA Tahiti | PACIFIK'AI",
    description:
      "Expertise SEO technique, GEO et referencement local en Polynesie francaise.",
    url: "https://pacifikai.com/expertise/seo-referencement-ia",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/expertise/seo-referencement-ia",
  },
};

/* ── Icons (inline SVG) ── */
const IconSearch = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconGlobe = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconPin = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconChart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconStar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconZap = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconHotel = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconShop = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconFork = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="5" x2="5" y2="7" />
    <line x1="19" y1="5" x2="19" y2="7" />
    <path d="M5 7a4 4 0 0 0 7 2.7A4 4 0 0 0 19 7" />
  </svg>
);

/* ── Page (Server Component — metadata export requires this) ── */
export default function SEOPage() {
  return (
    <ExpertisePage
      accentColor="lagoon"
      badge="Visibilite maximale sur Google et IA"
      title="SEO &"
      titleHighlight="Referencement IA"
      description="Votre entreprise merite d'etre trouvee. On optimise votre presence sur Google, les moteurs de recherche IA et les annuaires locaux — pour que vos clients en Polynesie francaise vous trouvent avant vos concurrents."
      heroVisual={<SEOVisual />}

      /* ── Competences ── */
      competenciesTitle="Nos competences SEO"
      competencies={[
        {
          icon: IconSearch,
          title: "SEO technique",
          description:
            "Structure du site, vitesse de chargement, Core Web Vitals, balisage schema.org et crawlabilite optimises pour les robots Google.",
        },
        {
          icon: IconGlobe,
          title: "GEO — Optimisation recherche IA",
          description:
            "Generative Engine Optimisation : votre contenu repond directement aux questions posees a ChatGPT, Perplexity et Google AI Overview.",
        },
        {
          icon: IconPin,
          title: "Local SEO Polynesie",
          description:
            "Google Business Profile, citations locales, avis clients et mots-cles geolocaux pour dominer les recherches a Papeete et en Polynesie.",
        },
        {
          icon: IconChart,
          title: "Audit SEO complet",
          description:
            "Analyse des opportunites, identification des freins techniques et mapping des mots-cles a fort potentiel pour votre marche.",
        },
        {
          icon: IconStar,
          title: "Contenu optimise IA",
          description:
            "Pages, articles et landing pages con\u00e7us pour se positionner : chaque mot a un role. Redaction SEO nativement optimisee.",
        },
        {
          icon: IconZap,
          title: "Indexation rapide Google",
          description:
            "Soumission via l'API d'indexation Google Instant pour une prise en compte en quelques heures plutot qu'en semaines.",
        },
      ]}

      /* ── Metriques ── */
      metrics={[
        { value: "Page 1",  label: "Positionnement Google" },
        { value: "+300%",   label: "Trafic organique" },
        { value: "95%",     label: "Taux d'indexation" },
        { value: "Top 3",   label: "Mots-cles locaux" },
      ]}

      /* ── Processus ── */
      process={[
        {
          step: "01",
          title: "Audit",
          description:
            "Analyse complete de votre site, de votre positionnement actuel et de vos concurrents locaux.",
        },
        {
          step: "02",
          title: "Optimisation",
          description:
            "Corrections techniques, creation de contenu optimise et mise en place des signaux locaux.",
        },
        {
          step: "03",
          title: "Suivi & Croissance",
          description:
            "Reporting mensuel, ajustements continus et extension vers de nouveaux mots-cles a mesure que vous progressez.",
        },
      ]}

      /* ── Cas concrets ── */
      useCasesTitle="Cas concrets en Polynesie"
      useCases={[
        {
          icon: IconHotel,
          title: "Hotel a Bora Bora",
          description:
            "Un etablissement invisible sur Google depasse ses concurrents sur les recherches 'hotel Bora Bora' et 'overwater bungalow Polynesie' grace a une refonte SEO complete.",
          result: "+410% de visites organiques en 4 mois",
        },
        {
          icon: IconShop,
          title: "E-commerce local",
          description:
            "Une boutique de produits artisanaux polynesiennes double ses ventes en ligne apres optimisation des fiches produits et creation d'un blog SEO local.",
          result: "x2.4 chiffre d'affaires en ligne",
        },
        {
          icon: IconFork,
          title: "Restaurant a Papeete",
          description:
            "Un restaurant du centre-ville apparait en 1ere position sur Google Maps et dans les resultats IA pour 'restaurant Papeete' apres optimisation Google Business Profile.",
          result: "1ere position locale en 6 semaines",
        },
      ]}

      /* ── CTA ── */
      ctaTitle="Pret a dominer les resultats de recherche ?"
      ctaSubtitle="Parlons de votre strategie SEO et de comment rendre votre entreprise visible la ou vos clients cherchent — Google, Maps et les moteurs IA."
    />
  );
}
