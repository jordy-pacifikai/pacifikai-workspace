import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import ChatbotVisual from "@/components/ui/expertise-visuals/ChatbotVisual";

export const metadata: Metadata = {
  title: "IA Conversationnelle 24/7 | PACIFIK'AI",
  description:
    "Nous concevons des assistants IA qui comprennent le contexte, parlent plusieurs langues et s'integrent nativement a WhatsApp, Messenger et votre site. Une intelligence qui convertit, pas un simple chatbot.",
};

const competencies = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 6v6l4 2" />
        <path d="M2 12h2M20 12h2M12 2v2M12 20v2" />
      </svg>
    ),
    title: "NLP avance & comprehension contextuelle",
    description:
      "Nos assistants ne matchent pas des mots-cles — ils comprennent l'intention, le contexte et les nuances. Moins de frustration, plus de conversions.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Fine-tuning sur vos donnees metier",
    description:
      "Chaque assistant est entraine sur votre base de connaissances, vos produits et votre ton. Il parle comme un membre de votre equipe, pas comme un robot.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h4" />
      </svg>
    ),
    title: "Integration multi-canal native",
    description:
      "WhatsApp, Messenger, widget site web — un seul cerveau, deploye partout. Vos clients choisissent leur canal, l'experience reste identique.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Analyse de sentiment en temps reel",
    description:
      "L'IA detecte la frustration, l'urgence ou l'interet d'achat dans chaque message et adapte son ton et ses reponses en consequence.",
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
    title: "Escalade intelligente vers l'humain",
    description:
      "L'assistant sait quand il atteint ses limites. Il transfere la conversation a votre equipe avec tout le contexte, sans faire repeter le client.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "A/B testing des conversations",
    description:
      "On teste differents scripts, tons et parcours conversationnels pour identifier ce qui convertit le mieux. Optimisation continue, basee sur la data.",
  },
];

const metrics = [
  { value: "24/7", label: "Disponibilite" },
  { value: "<3s", label: "Temps de reponse" },
  { value: "78%", label: "Resolution automatique" },
  { value: "+45%", label: "Taux de conversion" },
];

const process = [
  {
    step: "01",
    title: "Personnalisation",
    description:
      "On analyse vos besoins, vos canaux et votre base de connaissances pour configurer un assistant adapte a votre activite.",
  },
  {
    step: "02",
    title: "Deploiement",
    description:
      "Integration sur vos plateformes existantes en quelques jours. Tests complets avant la mise en production.",
  },
  {
    step: "03",
    title: "Apprentissage continu",
    description:
      "L'assistant s'ameliore avec chaque conversation. Tableaux de bord et rapports mensuels pour suivre les performances.",
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
    title: "Concierge hotelier WhatsApp",
    description:
      "Assistant multilingue (FR/EN/ES) deploye sur WhatsApp pour un hotel de Bora Bora. Gestion des demandes, confirmations d'arrivee et recommandations d'activites — sans intervention humaine.",
    result: "65% de demandes traitees automatiquement",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    title: "SAV Messenger — commerce de detail",
    description:
      "IA conversationnelle sur Messenger avec detection de sentiment. Escalade automatique vers un humain quand la frustration est detectee, resolution autonome sinon.",
    result: "92% de resolution sans humain",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Qualification leads — cabinet de services",
    description:
      "Widget IA sur site web qui qualifie les visiteurs en posant les bonnes questions, collecte leurs coordonnees et planifie directement un rendez-vous dans l'agenda.",
    result: "+40% de prises de rendez-vous qualifies",
  },
];

export default function ChatbotsIAPage() {
  return (
    <ExpertisePage
      accentColor="accent"
      badge="IA conversationnelle multi-canal"
      title="IA Conversationnelle"
      titleHighlight="24/7"
      description="Nous concevons des assistants IA qui comprennent le contexte, parlent plusieurs langues et s'integrent nativement a WhatsApp, Messenger et votre site. Pas un simple chatbot — une intelligence qui convertit."
      heroVisual={<ChatbotVisual />}
      competencies={competencies}
      competenciesTitle="Pourquoi nos chatbots convertissent mieux"
      metrics={metrics}
      process={process}
      useCases={useCases}
      useCasesTitle="Resultats mesures chez nos clients"
      ctaTitle="Votre assistant IA, pret en 7 jours"
      ctaSubtitle="De la conception au deploiement, on s'occupe de tout. Vous n'avez qu'a valider."
    />
  );
}
