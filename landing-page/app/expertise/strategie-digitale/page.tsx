import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import StrategieVisual from "@/components/ui/expertise-visuals/StrategieVisual";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Transformation Digitale | PACIFIK'AI",
  description:
    "Pas un PowerPoint de 80 pages. Une transformation concrete : audit, priorisation, execution et mesure. Votre entreprise sort transformee, pas juste conseillee. PACIFIK'AI en Polynesie francaise.",
  alternates: {
    canonical: "https://pacifikai.com/expertise/strategie-digitale",
  },
  openGraph: {
    title: "Transformation Digitale | PACIFIK'AI",
    description: "Strategie de transformation digitale pour entreprises en Polynesie francaise.",
    url: "https://pacifikai.com/expertise/strategie-digitale",
    locale: "fr_PF",
    type: "website",
  },
};

const competencies = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Diagnostic 360° en 48h",
    description:
      "Pas 3 mois d'audit. En 48 heures, on cartographie vos processus, vos outils, vos points de friction et vos opportunites. Vous recevez un plan d'action clair et priorise.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Priorisation par ROI",
    description:
      "Chaque action est classee par impact business et effort requis. On attaque les quick wins d'abord pour generer des resultats visibles rapidement et financer la suite.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Execution rapide",
    description:
      "Pas 6 mois de planification. On passe a l'action en semaines, pas en trimestres. Sprints courts, livrables concrets, iterations rapides — votre transformation avance chaque semaine.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Formation equipes integree",
    description:
      "On ne fait pas juste pour vous — on fait avec vous. Vos equipes sont formees au fil de la transformation pour etre autonomes une fois le projet termine.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Mesure d'impact continue",
    description:
      "KPIs definis des le depart, tableaux de bord en temps reel. Vous voyez exactement ce qui fonctionne, ce qui doit etre ajuste et le ROI genere a chaque etape.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Accompagnement post-lancement",
    description:
      "La transformation ne s'arrete pas au deploiement. Suivi post-lancement, optimisations continues et support reactif pour s'assurer que les resultats durent.",
  },
];

const metrics = [
  { value: "48h", label: "Diagnostic complet" },
  { value: "92%", label: "Taux de satisfaction" },
  { value: "3 mois", label: "Retour sur investissement" },
  { value: "100%", label: "Equipes formees" },
];

const process = [
  {
    step: "01",
    title: "Diagnostic",
    description:
      "Session de travail approfondie pour comprendre votre activite, vos objectifs et vos contraintes. Analyse de l'existant et identification des leviers de croissance prioritaires.",
  },
  {
    step: "02",
    title: "Recommandations",
    description:
      "Livraison d'un rapport detaille avec les actions prioritaires, les outils recommandes et les estimations de ROI. Une feuille de route claire et actoinnable.",
  },
  {
    step: "03",
    title: "Accompagnement",
    description:
      "Suivi de l'execution sur la duree souhaitee. Points reguliers, ajustements de cap et support direct pour s'assurer que chaque action produit les resultats attendus.",
  },
];

const useCases = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "PME : du papier au digital",
    description:
      "Une PME locale gerait tout sur papier et Excel. En 6 semaines : CRM, facturation automatisee, prise de RDV en ligne et formation complete de l'equipe.",
    result: "-40% de temps administratif",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Hotel : experience client repensee",
    description:
      "Un hotel 4 etoiles a digitalise son parcours client : reservation, check-in, communication et avis. Moins de friction, plus de satisfaction, meilleur taux de retour.",
    result: "+25% avis positifs",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Commerce : vente omnicanale",
    description:
      "Un commerce physique a lance sa presence en ligne : site e-commerce, click & collect, reseaux sociaux synchronises et tableau de bord unifie pour piloter les ventes.",
    result: "+35% de chiffre d'affaires",
  },
];

export default function StrategieDigitalePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema("Transformation Digitale", "Pas un PowerPoint de 80 pages. Une transformation concrete : audit, priorisation, execution et mesure. Votre entreprise sort transformee.", "https://pacifikai.com/expertise/strategie-digitale")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Expertise", url: "https://pacifikai.com/expertise" }, { name: "Transformation Digitale", url: "https://pacifikai.com/expertise/strategie-digitale" }])) }} />
      <ExpertisePage
      accentColor="orange"
      badge="De la vision aux resultats concrets"
      title="Transformation"
      titleHighlight="Digitale"
      description="Pas un PowerPoint de 80 pages qui finit dans un tiroir. Une transformation concrete : on audite, on priorise, on execute et on mesure. Votre entreprise sort transformee, pas juste conseillee."
      heroVisual={<StrategieVisual />}
      competencies={competencies}
      competenciesTitle="Notre methode de transformation"
      metrics={metrics}
      process={process}
      useCases={useCases}
      useCasesTitle="Transformations realisees"
      ctaTitle="Pret a transformer votre entreprise ?"
      ctaSubtitle="Premier diagnostic gratuit. On vous dit exactement par ou commencer et quel ROI attendre."
    />
    </>
  );
}
