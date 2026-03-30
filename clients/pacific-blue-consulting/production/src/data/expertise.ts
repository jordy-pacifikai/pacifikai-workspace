export type ExpertiseItem = {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  details: string[];
  examples: string[];
};

export const expertises: ExpertiseItem[] = [
  {
    id: "aviation",
    title: "Aviation Civile & Compagnies Aeriennes",
    shortTitle: "Aviation civile",
    icon: "plane",
    description:
      "Accompagnement des operateurs aeriens : creation de compagnie, structuration operationnelle, certification et conformite reglementaire.",
    details: [
      "Creation et structuration de compagnies aeriennes",
      "Obtention du Certificat de Transporteur Aerien (CTA)",
      "Production de documentation operationnelle reglementaire",
      "Modernisation et restructuration de compagnies existantes",
    ],
    examples: [
      "Creation et structuration de Tahiti Nui Helicopters",
      "Certification Islands Airline — Obtention du CTA",
    ],
  },
  {
    id: "aeroports",
    title: "Aeroports & Infrastructures Aeroportuaires",
    shortTitle: "Aeroports",
    icon: "building",
    description:
      "Planification, developpement et audit des infrastructures aeroportuaires, des aerodromes insulaires aux plates-formes internationales.",
    details: [
      "Schemas directeurs aeroportuaires",
      "Diagnostic de conformite reglementaire et technique",
      "Etudes de faisabilite et de classification",
      "Modeles economiques pour infrastructures innovantes",
    ],
    examples: [
      "Schema d'amenagement des aeroports de Moorea et Huahine",
      "Etude de classification internationale de l'aeroport de Lifou",
    ],
  },
  {
    id: "environnement",
    title: "Environnement, Biodiversite & Bilan Carbone",
    shortTitle: "Environnement",
    icon: "leaf",
    description:
      "Expertise environnementale : bilans carbone, certification biodiversite, evaluation environnementale et feuilles de route de decarbonation.",
    details: [
      "Bilans carbone et feuilles de route de decarbonation",
      "Certification biodiversite insulaire",
      "Actualisation des dispositifs d'evaluation environnementale",
    ],
    examples: [
      "Bilan carbone DAC-PF et feuille de route decarbonation",
      "Developpement d'une certification biodiversite insulaire",
    ],
  },
  {
    id: "etudes",
    title: "Etudes Strategiques & Modelisation Economique",
    shortTitle: "Etudes strategiques",
    icon: "chart",
    description:
      "Analyses strategiques et etudes de faisabilite pour eclairer les decisions publiques et privees dans le transport aerien.",
    details: [
      "Etudes de faisabilite technico-economique",
      "Appui strategique aux candidatures de concession",
      "Etudes de liaisons aeriennes regionales",
    ],
    examples: [
      "Appui strategique candidature Vinci Airports — Concession Faa'a",
      "Etude de faisabilite liaison Tahiti - Iles Cook - Tonga - Samoa - Fidji",
    ],
  },
  {
    id: "amo",
    title: "AMO & Pilotage de Projets Complexes",
    shortTitle: "AMO & Pilotage",
    icon: "compass",
    description:
      "Assistance a maitrise d'ouvrage et pilotage de projets techniques, de la phase de conception a la livraison.",
    details: [
      "Pilotage de projet et coordination des parties prenantes",
      "Appui strategique integre (ports et aeroports)",
      "Accompagnement en certification ISO (9001, 14001, 45001)",
      "Mise en place de dossiers ICPE",
    ],
    examples: [
      "AMO globale Air Bora Bora",
      "Appui strategique integre ports et aeroports — Iles Loyaute",
    ],
  },
  {
    id: "formation",
    title: "Formation & Management",
    shortTitle: "Formation",
    icon: "users",
    description:
      "Conception et animation de formations professionnelles pour les acteurs du secteur aerien et du service public.",
    details: [
      "Formation au management et conduite du changement",
      "Creation de centres de formation aeronautique agrees (Part-147)",
    ],
    examples: [
      "Formations CNAM — Club des Managers",
      "Centre Part-147 cles en main — Air Formation",
    ],
  },
];
