import Script from "next/script";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import ServicesSection from "@/components/ui/ServicesSection";
import StatsSection from "@/components/ui/StatsSection";
import ProcessSection from "@/components/ui/ProcessSection";
import InfraSection from "@/components/ui/InfraSection";
import SolutionsSection from "@/components/ui/SolutionsSection";
import CompareSection from "@/components/ui/CompareSection";
import FAQSection from "@/components/ui/FAQSection";
import CTASection from "@/components/ui/CTASection";
import Footer from "@/components/ui/Footer";
import LeadMagnetPopup from "@/components/ui/LeadMagnetPopup";

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "PACIFIK'AI",
  alternateName: "PACIFIKAI",
  url: "https://pacifikai.com",
  logo: "https://pacifikai.com/assets/logo.png",
  image: "https://pacifikai.com/assets/og-image.png",
  description:
    "Agence digitale et intelligence artificielle à Papeete, Tahiti. Création de sites web, chatbots IA, automatisation, applications et conseil digital pour entreprises en Polynésie française.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Papeete",
    addressLocality: "Papeete",
    addressRegion: "Tahiti",
    postalCode: "98714",
    addressCountry: "PF",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -17.535,
    longitude: -149.5696,
  },
  telephone: "+689-89558189",
  email: "contact@pacifikai.com",
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "contact@pacifikai.com",
      contactType: "sales",
      availableLanguage: ["French", "English"],
    },
    {
      "@type": "ContactPoint",
      email: "contact@pacifikai.com",
      contactType: "customer service",
      availableLanguage: ["French", "English"],
    },
  ],
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Polynésie française",
      sameAs: "https://en.wikipedia.org/wiki/French_Polynesia",
    },
    { "@type": "City", name: "Papeete" },
    { "@type": "City", name: "Moorea" },
    { "@type": "City", name: "Bora Bora" },
  ],
  priceRange: "$$",
  currenciesAccepted: "XPF,EUR",
  paymentAccepted: "Virement bancaire, Carte bancaire",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services PACIFIK'AI",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Création de sites web et applications",
          description:
            "Sites internet professionnels, landing pages et applications sur mesure pour entreprises en Polynésie française",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Chatbots et agents IA",
          description:
            "Chatbots intelligents pour service client automatisé, disponibles 24/7 sur WhatsApp, Messenger et site web",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Automatisation des processus",
          description:
            "Automatisation des tâches répétitives : devis, factures, relances, onboarding client",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Extraction de documents IA",
          description:
            "Extraction automatique de données depuis PDF, formulaires et documents scannés",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Conseil digital et stratégie IA",
          description:
            "Accompagnement stratégique pour la transformation digitale des entreprises polynésiennes",
        },
      },
    ],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce qu'une agence digitale à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une agence digitale à Tahiti comme PACIFIK'AI accompagne les entreprises de Polynésie française dans leur transformation numérique : création de sites web, chatbots IA, automatisation des process, marketing digital et formation.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte un site internet en Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un site vitrine professionnel commence à 100 000 XPF avec PACIFIK'AI. Le tarif varie selon les fonctionnalités : chatbot IA, e-commerce, dashboard analytics. Chaque projet est sur mesure avec un devis détaillé gratuit.",
      },
    },
    {
      "@type": "Question",
      name: "Comment un chatbot IA peut aider mon entreprise à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un chatbot IA répond à vos clients 24/7 sur votre site et WhatsApp, qualifie les prospects, prend les rendez-vous et réduit votre charge de service client de 57% en moyenne.",
      },
    },
    {
      "@type": "Question",
      name: "L'intelligence artificielle est-elle accessible aux PME polynésiennes ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolument. Nos solutions démarrent à 100 000 XPF/mois et s'adaptent à la taille de votre entreprise. L'IA n'est plus réservée aux grandes entreprises — c'est un levier de compétitivité pour les PME.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la meilleure agence digitale en Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PACIFIK'AI est la première agence spécialisée en intelligence artificielle à Tahiti. Nous combinons expertise web, IA et connaissance du marché polynésien pour des solutions vraiment adaptées.",
      },
    },
    {
      "@type": "Question",
      name: "Par où commencer la digitalisation de son entreprise à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Envoyez-nous un email pour nous parler de votre projet. On échange sur vos besoins, on identifie les opportunités et on vous propose une approche personnalisée.",
      },
    },
    {
      "@type": "Question",
      name: "PACIFIK'AI intervient-il en dehors de Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, nous intervenons sur toute la Polynésie française (Moorea, Bora Bora, Raiatea...) et auprès d'entreprises francophones dans le Pacifique. Nos solutions sont 100% en ligne.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <ProcessSection />
        <SolutionsSection />
        <InfraSection />
        <CompareSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <LeadMagnetPopup />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
    </>
  );
}
