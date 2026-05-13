import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import MarketingVisual from "@/components/ui/expertise-visuals/MarketingVisual";
import { generateServiceSchema, generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Growth & Acquisition IA | PACIFIK'AI",
  description:
    "Campagnes pilotees par l'IA : ciblage predictif, creatifs generes automatiquement, budgets optimises en temps reel. Chaque franc investi est tracke.",
  alternates: {
    canonical: "https://pacifikai.com/expertise/marketing-acquisition",
  },
  openGraph: {
    title: "Growth & Acquisition IA | PACIFIK'AI",
    description: "Marketing digital et acquisition pilotee par l'IA en Polynesie francaise.",
    url: "https://pacifikai.com/expertise/marketing-acquisition",
    locale: "fr_PF",
    type: "website",
  },
};

const competencies = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Creatifs generes par IA",
    description:
      "Jusqu'a 10 variantes visuelles par jour, generees et testees automatiquement. Les creatifs gagnants sont amplifies, les autres remplaces — sans intervention manuelle.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Ciblage predictif",
    description:
      "L'IA analyse vos donnees clients pour identifier les profils a plus forte valeur. Vos campagnes touchent les bonnes personnes avant meme qu'elles ne cherchent.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Attribution multi-touch",
    description:
      "Chaque point de contact est tracke et pondere. Vous savez exactement quel canal, quel message et quel creatif a converti — pas de zone grise.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Budget auto-optimise",
    description:
      "L'IA redistribue votre budget en temps reel entre les canaux et campagnes les plus performants. Fini les budgets figes qui gaspillent sur des canaux morts.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "A/B testing automatise",
    description:
      "Titres, visuels, audiences, pages de destination — tout est teste en continu. Les variantes gagnantes prennent le relais automatiquement, sans attendre vos validations.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
        <path d="M2 20h20" />
      </svg>
    ),
    title: "Reporting temps reel",
    description:
      "Tableaux de bord mis a jour en continu avec les KPIs qui comptent : CAC, ROAS, LTV, taux de conversion par etape. Des decisions basees sur la donnee, pas le feeling.",
  },
];

const metrics = [
  { value: "x3", label: "ROAS moyen" },
  { value: "+150%", label: "Leads qualifies" },
  { value: "-40%", label: "Cout d'acquisition" },
  { value: "A/B", label: "Testing continu" },
];

const process = [
  {
    step: "01",
    title: "Strategie & ciblage",
    description:
      "Analyse de votre marche, de vos concurrents et de votre audience cible. Definition des canaux prioritaires, des messages cles et des budgets optimaux.",
  },
  {
    step: "02",
    title: "Execution campagnes",
    description:
      "Lancement des campagnes sur les canaux selectionnes. Creatifs, copies, pages de destination et sequences email — tout est cree et deploye pour vous.",
  },
  {
    step: "03",
    title: "Optimisation & scale",
    description:
      "Analyse des performances en continu. Les campagnes gagnantes sont amplifiees, les moins performantes ajustees ou coupees. Reporting mensuel detaille.",
  },
];

const useCases = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
      </svg>
    ),
    title: "Lancement produit en Polynesie",
    description:
      "L'IA genere 10 variantes de creatifs et teste les audiences en parallele. Le ciblage predictif identifie les segments les plus reactifs en 48h au lieu de 3 semaines.",
    result: "+180% de ventes en 6 semaines",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Acquisition touristes internationaux",
    description:
      "Campagnes multi-marches avec creatifs adaptes par pays et budget redistribue automatiquement vers les zones geographiques les plus rentables.",
    result: "x2.8 ROAS sur 3 marches",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Scale e-commerce local",
    description:
      "Attribution multi-touch pour identifier les parcours qui convertissent. L'IA optimise les encheres et les budgets pour reduire le cout d'acquisition de 40%.",
    result: "-40% CAC en 90 jours",
  },
];

export default function MarketingAcquisitionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema("Growth & Acquisition IA", "Campagnes pilotees par l IA : ciblage predictif, creatifs generes automatiquement, budgets optimises en temps reel.", "https://pacifikai.com/expertise/marketing-acquisition")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Expertise", url: "https://pacifikai.com/expertise" }, { name: "Growth & Acquisition IA", url: "https://pacifikai.com/expertise/marketing-acquisition" }])) }} />
      <ExpertisePage
      accentColor="emerald"
      badge="L'IA qui accelere votre croissance"
      title="Growth &"
      titleHighlight="Acquisition IA"
      description="Fini le marketing au doigt mouille. Nos campagnes sont pilotees par l'IA : ciblage predictif, creatifs generes automatiquement, budgets optimises en temps reel. Chaque franc investi est tracke."
      heroVisual={<MarketingVisual />}
      competencies={competencies}
      competenciesTitle="L'IA dans chaque levier"
      metrics={metrics}
      process={process}
      useCases={useCases}
      useCasesTitle="ROI mesure, pas estime"
      ctaTitle="Arretez de deviner, commencez a scaler"
      ctaSubtitle="On analyse vos canaux existants et on vous montre ou l'IA peut multiplier vos resultats."
    />
    </>
  );
}
