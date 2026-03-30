import type { Metadata } from "next";
import ServicePage from "@/components/ui/ServicePage";
import ServiceWebVisual from "@/components/ui/service-visuals/ServiceWebVisual";

export const metadata: Metadata = {
  title: "Création de Sites Internet à Tahiti | PACIFIK'AI — Sites Web Polynésie",
  description:
    "Création de sites internet à Tahiti : sites vitrines, pages de vente, e-commerce et blogs. Design moderne et optimisé SEO pour entreprises en Polynésie française.",
  openGraph: {
    title: "Création de Sites Internet à Tahiti | PACIFIK'AI",
    description:
      "Création de sites internet à Tahiti : sites vitrines, pages de vente, e-commerce et blogs.",
    url: "https://pacifikai.com/services/landing-pages",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://pacifikai.com/services/landing-pages",
  },
};

const ICON_DESIGN = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5" />
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_CONTENT = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ICON_LAUNCH = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);

const ICON_CONVERT = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ICON_SPEED = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ICON_SCORE = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ICON_SEO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ICON_SALE = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ICON_VITRINE = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const ICON_BLOG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function LandingPagesPage() {
  return (
    <ServicePage
      badge="Conversion x3"
      title="Landing Pages &"
      titleHighlight="Sites Web"
      description="Sites vitrines, pages de vente, blogs — design moderne et contenu généré par l'IA. Convertissez vos visiteurs en clients."
      heroVisual={<ServiceWebVisual />}
      ctaLabel="Demander un devis"
      steps={[
        {
          number: "Étape 01",
          icon: ICON_DESIGN,
          title: "Design",
          description:
            "On crée un design unique qui reflète votre marque et optimisé pour la conversion.",
        },
        {
          number: "Étape 02",
          icon: ICON_CONTENT,
          title: "Contenu IA",
          description:
            "L'IA génère vos textes, optimise le SEO et crée des visuels percutants.",
        },
        {
          number: "Étape 03",
          icon: ICON_LAUNCH,
          title: "Mise en ligne",
          description:
            "Hébergement rapide, nom de domaine, certificat SSL — tout est inclus et opérationnel.",
        },
      ]}
      stepsTitle="3 étapes, votre site est en ligne"
      stepsSubtitle="Du design au déploiement, on gère tout."
      metrics={[
        { icon: ICON_CONVERT, value: "x3", label: "Conversion vs template standard" },
        { icon: ICON_SPEED, value: "< 2s", label: "Temps de chargement" },
        { icon: ICON_SCORE, value: "100", label: "Score Google PageSpeed" },
        { icon: ICON_SEO, value: "+65%", label: "Trafic organique après 3 mois", barPercent: 65 },
      ]}
      metricsTitle="Des résultats mesurables"
      useCases={[
        {
          icon: ICON_SALE,
          title: "Page de vente",
          description:
            "Landing page optimisée pour vendre vos formations, produits ou services. Copywriting IA, témoignages, et tunnel de conversion intégré.",
        },
        {
          icon: ICON_VITRINE,
          title: "Site vitrine",
          description:
            "Votre présence en ligne professionnelle : votre histoire, vos services, vos réalisations. Design moderne qui impressionne vos prospects.",
        },
        {
          icon: ICON_BLOG,
          title: "Blog SEO",
          description:
            "Blog alimenté par l'IA qui publie du contenu optimisé pour Google. Attirez du trafic qualifié en pilote automatique.",
        },
      ]}
      useCasesTitle="Cas d'usage"
      useCasesSubtitle="Des sites web pensés pour convertir, pas juste pour être beaux."
      faqs={[
        {
          question: "Combien coûte un site web ?",
          answer:
            "Nos sites web démarrent à partir de 100 000 XPF pour un site vitrine. Le prix varie selon la complexité, le nombre de pages et les fonctionnalités intégrées.",
        },
        {
          question: "Combien de temps pour livrer un site ?",
          answer:
            "Un site vitrine standard est livré en 5 à 10 jours ouvrés. Un site plus complexe avec des fonctionnalités avancées prend 2 à 4 semaines.",
        },
        {
          question: "Le contenu est-il inclus ?",
          answer:
            "Oui, l'IA génère les textes de votre site en fonction de votre activité et de vos objectifs. Vous validez et on affine ensemble.",
        },
        {
          question: "Que se passe-t-il après la livraison ?",
          answer:
            "Nous assurons la maintenance technique et les mises à jour de sécurité. Vous pouvez modifier votre contenu en toute autonomie via un CMS simple.",
        },
      ]}
      ctaFinalTitle="Prêt à avoir un site qui convertit ?"
      ctaFinalSubtitle="Contactez-nous pour discuter de votre projet."
    />
  );
}
