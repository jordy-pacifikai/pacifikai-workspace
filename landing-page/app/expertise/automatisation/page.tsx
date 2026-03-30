import type { Metadata } from "next";
import ExpertisePage from "@/components/ui/ExpertisePage";
import AutomationVisual from "@/components/ui/expertise-visuals/AutomationVisual";

export const metadata: Metadata = {
  title: "Zero Tache Manuelle — Automatisation IA | PACIFIK'AI",
  description:
    "Chaque minute passee a copier-coller, relancer ou saisir des donnees est une minute volee a votre business. On identifie vos goulots et on les elimine definitivement.",
};

const competencies = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Saisie repetitive",
    description:
      "Fiches clients, bons de commande, formulaires internes — tout ce que vos equipes retapent a la main chaque jour disparait. Les donnees circulent seules entre vos outils.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Relances oubliees",
    description:
      "Devis sans reponse, factures en retard, prospects qui refroidissent — plus rien ne tombe entre les mailles. Chaque relance part au bon moment, sans y penser.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Reporting manuel",
    description:
      "Fini les heures passees a consolider des chiffres dans un tableur. Vos rapports se generent et s'envoient tout seuls — chaque lundi matin, sans lever le petit doigt.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="9" />
      </svg>
    ),
    title: "Erreurs de copier-coller",
    description:
      "Un chiffre mal recopie, un email envoye au mauvais contact, une ligne oubliee — ces erreurs silencieuses vous coutent cher. On les rend impossibles.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    title: "Synchronisation inter-outils",
    description:
      "Votre CRM dit une chose, votre comptabilite une autre, votre agenda une troisieme. On connecte tout pour qu'une seule saisie mette a jour l'ensemble.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Taches nocturnes & week-end",
    description:
      "Imports de donnees a 6h, envois programes le dimanche, verifications de stock avant l'ouverture — vos processus critiques tournent meme quand personne n'est la.",
  },
];

const metrics = [
  { value: "40h", label: "Gagnees par mois" },
  { value: "0", label: "Erreur humaine" },
  { value: "+60%", label: "Productivite equipe" },
  { value: "150+", label: "Outils connectables" },
];

const process = [
  {
    step: "01",
    title: "Audit des processus",
    description:
      "On cartographie vos flux de travail actuels, identifies les taches repetitives et quantifions le temps perdu. Vous voyez immediatement le potentiel de gain.",
  },
  {
    step: "02",
    title: "Construction des workflows",
    description:
      "Conception et developpement de vos automatisations sur mesure. Chaque workflow est teste en profondeur avant d'etre connecte a vos outils de production.",
  },
  {
    step: "03",
    title: "Deploiement & monitoring",
    description:
      "Mise en production progressive avec formation de votre equipe. Suivi des performances, alertes automatiques et maintenance continue inclus.",
  },
];

const useCases = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Agence immobiliere — relances automatiques",
    description:
      "Avant : 2 personnes passaient 3h/jour a relancer les prospects par email et telephone. Maintenant : chaque lead recoit la bonne relance au bon moment, sans intervention.",
    result: "18h recuperees par semaine",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "PME distribution — zero ressaisie",
    description:
      "Avant : chaque bon de commande etait ressaisi dans 3 logiciels differents. Maintenant : une seule entree alimente le CRM, la facturation et le stock en temps reel.",
    result: "32h recuperees par mois",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Groupe hotelier — reporting sans effort",
    description:
      "Avant : le directeur passait son vendredi apres-midi a consolider les chiffres de 4 hotels. Maintenant : le rapport arrive dans sa boite chaque lundi a 7h, pret a lire.",
    result: "8h recuperees par semaine",
  },
];

export default function AutomatisationPage() {
  return (
    <ExpertisePage
      accentColor="indigo"
      badge="Vos processus tournent sans vous"
      title="Zero"
      titleHighlight="Tache Manuelle"
      description="Chaque minute passee a copier-coller, relancer ou saisir des donnees est une minute volee a votre business. On identifie ces goulots et on les elimine — definitivement."
      heroVisual={<AutomationVisual />}
      competencies={competencies}
      competenciesTitle="Ce qu'on elimine"
      metrics={metrics}
      process={process}
      useCases={useCases}
      useCasesTitle="Heures recuperees, pas promises"
      ctaTitle="Combien d'heures perdez-vous ?"
      ctaSubtitle="Audit gratuit de vos processus. On vous dit exactement combien de temps vous pouvez recuperer."
    />
  );
}
