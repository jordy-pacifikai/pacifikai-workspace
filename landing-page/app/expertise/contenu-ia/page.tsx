import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import ContenuVisual from "@/components/ui/expertise-visuals/ContenuVisual";

export const metadata: Metadata = {
  title: "Production Contenu x10 | PACIFIK'AI",
  description:
    "Images, videos, voix off, avatars — produits en serie avec une qualite studio. Ce qui prenait une semaine prend maintenant une journee. Volume studio, delai startup.",
};

const competencies = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "IA generative maitrisee",
    description:
      "Images, videos, voix off, avatars — nos modeles produisent du contenu studio-quality en minutes. Pas de templates generiques : chaque visuel est cree sur mesure pour votre marque.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: "Multi-format simultane",
    description:
      "Un seul brief, tous les formats : posts Instagram, stories, reels, bannieres web, newsletters, videos promo. Tout sort en parallele, pas les uns apres les autres.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Coherence de marque garantie",
    description:
      "Couleurs, typographies, ton de voix — notre moteur de coherence verifie chaque livrable avant sortie. 40 posts ou 400, votre identite reste intacte.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Localisation automatique",
    description:
      "Francais, anglais, tahitien — chaque contenu est adapte et traduit automatiquement. Touchez vos audiences locales et internationales sans effort supplementaire.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Production en batch",
    description:
      "30 visuels en une journee, pas en un mois. Notre pipeline traite les commandes en serie — vous recevez des lots complets, prets a publier, avec un rythme de production industriel.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Controle qualite integre",
    description:
      "Chaque contenu passe par notre systeme de verification automatique avant livraison. Resolution, cadrage, lisibilite, coherence — rien ne sort sans validation.",
  },
];

const metrics = [
  { value: "x10", label: "Productivite contenu" },
  { value: "90%", label: "Reduction des couts" },
  { value: "24h", label: "Delai de livraison" },
  { value: "Multi-format", label: "Images, videos, audio" },
];

const process = [
  {
    step: "01",
    title: "Brief creatif",
    description:
      "Vous decrivez vos besoins, votre charte graphique et vos objectifs. On definit ensemble les formats, les tonalites et les volumes de contenu a produire.",
  },
  {
    step: "02",
    title: "Generation IA",
    description:
      "Notre pipeline IA produit les contenus en serie : images, videos, audio et textes. Chaque livrable est verifie et ajuste pour correspondre a vos standards.",
  },
  {
    step: "03",
    title: "Validation & Publication",
    description:
      "Vous validez les contenus via une interface simple. On gere la publication sur vos canaux ou vous livre les fichiers prets a l'emploi.",
  },
];

const useCases = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "30 visuels en 48h pour un resort",
    description:
      "Un hotel de Moorea avait besoin de visuels pour ses campagnes Meta Ads et Instagram. En 48 heures, on a livre 30 images publicitaires et 5 videos promotionnelles — ce qui aurait pris 3 semaines a une agence classique.",
    result: "x12 de volume produit",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Contenu trilingue sans studio",
    description:
      "Une societe de plongee devait toucher des clients francais, americains et japonais. On a produit des videos avec voix off dans 3 langues — meme qualite, meme identite visuelle, zero studio d'enregistrement.",
    result: "3 langues, 1 pipeline",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "60 posts/mois sans community manager",
    description:
      "Un commerce local publiait 4 posts par mois, faute de temps. On a mis en place un pipeline de production automatise : 60 contenus par mois — visuels, textes et stories — livres prets a publier chaque semaine.",
    result: "x15 de frequence de publication",
  },
];

export default function ContenuIAPage() {
  return (
    <ExpertisePage
      accentColor="gold"
      badge="Volume studio, delai startup"
      title="Production Contenu"
      titleHighlight="x10"
      description="Images, videos, voix off, avatars — produits en serie avec une qualite studio. Ce qui prenait une semaine prend maintenant une journee. Votre concurrent publie 4 posts par mois ? Vous en publiez 40."
      heroVisual={<ContenuVisual />}
      competencies={competencies}
      competenciesTitle="Notre pipeline de production"
      metrics={metrics}
      process={process}
      useCases={useCases}
      useCasesTitle="Volume reel, pas theorique"
      ctaTitle="Passez en mode production"
      ctaSubtitle="Dites-nous vos besoins en contenu. On vous montre ce qu'on peut produire en 48h."
    />
  );
}
