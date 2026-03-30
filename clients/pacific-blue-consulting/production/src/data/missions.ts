export type Mission = {
  id: string;
  title: string;
  client: string;
  year: number;
  domain: Domain;
  description: string;
  location: string;
};

export type Domain =
  | "aviation"
  | "aeroports"
  | "environnement"
  | "etudes"
  | "amo"
  | "formation";

export const domainLabels: Record<Domain, string> = {
  aviation: "Aviation civile",
  aeroports: "Aeroports & Infrastructures",
  environnement: "Environnement & Carbone",
  etudes: "Etudes strategiques",
  amo: "AMO & Pilotage",
  formation: "Formation & Management",
};

export const domainColors: Record<Domain, string> = {
  aviation: "bg-steel-50 text-steel-600",
  aeroports: "bg-navy-50 text-navy-400",
  environnement: "bg-emerald-50 text-emerald-700",
  etudes: "bg-gold-50 text-gold-600",
  amo: "bg-warm-50 text-warm-600",
  formation: "bg-sky-50 text-sky-700",
};

export const missions: Mission[] = [
  {
    id: "tahiti-nui-helicopters",
    title: "Creation et structuration de Tahiti Nui Helicopters",
    client: "ATN / HBG",
    year: 2018,
    domain: "aviation",
    description:
      "Accompagnement a la creation et a la structuration d'une nouvelle entite helicoptere en Polynesie francaise.",
    location: "Polynesie francaise",
  },
  {
    id: "islands-airline-certification",
    title: "Certification Islands Airline — Obtention du CTA",
    client: "Islands Airline",
    year: 2019,
    domain: "aviation",
    description:
      "Assistance technique pour l'obtention du Certificat de Transporteur Aerien (CTA), incluant la production de la documentation operationnelle reglementaire.",
    location: "Pacifique Sud",
  },
  {
    id: "air-bora-bora-structuration",
    title: "Structuration d'Air Bora Bora — Startup compagnie aerienne",
    client: "Air Bora Bora",
    year: 2020,
    domain: "aviation",
    description:
      "Structuration d'une nouvelle compagnie aerienne regionale, couvrant les dimensions reglementaires, operationnelles et commerciales.",
    location: "Polynesie francaise",
  },
  {
    id: "air-loyaute-modernisation",
    title: "Structuration et modernisation d'Air Loyaute",
    client: "Air Loyaute",
    year: 2019,
    domain: "aviation",
    description:
      "Accompagnement strategique et operationnel de la restructuration et de la modernisation d'Air Loyaute en Nouvelle-Caledonie.",
    location: "Nouvelle-Caledonie",
  },
  {
    id: "vinci-airports-candidature",
    title: "Appui strategique candidature Vinci Airports — Concession Faa'a",
    client: "Vinci Airports",
    year: 2020,
    domain: "etudes",
    description:
      "Assistance strategique et technique dans le cadre de la candidature de Vinci Airports pour la concession de l'aeroport international de Tahiti-Faa'a.",
    location: "Tahiti",
  },
  {
    id: "ligne-pacifique-sud-seac",
    title: "Etude ligne aerienne Tahiti — Iles Cook — Tonga — Samoa — Fidji",
    client: "SEAC-PF",
    year: 2025,
    domain: "etudes",
    description:
      "Etude de faisabilite pour la creation d'une ligne aerienne regionale reliant la Polynesie francaise aux archipels du Pacifique Sud.",
    location: "Pacifique Sud",
  },
  {
    id: "schema-amenagement-moorea-huahine",
    title: "Schema d'amenagement des aeroports de Moorea et Huahine",
    client: "Direction de l'Aviation Civile PF (DAC-PF)",
    year: 2021,
    domain: "aeroports",
    description:
      "Elaboration des schemas d'amenagement des aerodromes de Moorea et Huahine pour le compte de la DAC-PF.",
    location: "Iles du Vent, Polynesie francaise",
  },
  {
    id: "diagnostic-aerodromes-polynesiens",
    title: "Diagnostic de conformite du reseau d'aerodromes polynesiens",
    client: "Direction de l'Aviation Civile PF (DAC-PF)",
    year: 2022,
    domain: "aeroports",
    description:
      "Audit de conformite reglementaire et technique du reseau d'aerodromes de Polynesie francaise.",
    location: "Polynesie francaise",
  },
  {
    id: "aeroport-lifou-wanaham",
    title: "Etude de faisabilite — Classification aeroport international de Lifou",
    client: "Province des Iles Loyaute (Wanaham)",
    year: 2023,
    domain: "aeroports",
    description:
      "Etude de faisabilite pour la reclassification de l'aeroport de Lifou en aeroport international.",
    location: "Lifou, Nouvelle-Caledonie",
  },
  {
    id: "aeroports-marins-terciel",
    title: "Modele economique pour aeroports marins innovants",
    client: "Terciel SAS",
    year: 2024,
    domain: "aeroports",
    description:
      "Conception d'un modele economique pour le developpement d'aeroports marins innovants.",
    location: "France",
  },
  {
    id: "bilan-carbone-dac-pf",
    title: "Bilan carbone DAC-PF et feuille de route decarbonation",
    client: "Direction de l'Aviation Civile PF (DAC-PF)",
    year: 2024,
    domain: "environnement",
    description:
      "Realisation du bilan carbone de la DAC-PF et elaboration d'une feuille de route de decarbonation.",
    location: "Polynesie francaise",
  },
  {
    id: "certification-biodiversite",
    title: "Developpement d'une certification biodiversite insulaire",
    client: "Confidentiel",
    year: 2023,
    domain: "environnement",
    description:
      "Conception et deploiement d'un referentiel de certification biodiversite adapte au contexte insulaire du Pacifique.",
    location: "Pacifique Sud",
  },
  {
    id: "evaluation-environnementale-direction",
    title: "Actualisation du dispositif d'evaluation environnementale",
    client: "Direction de l'Environnement",
    year: 2022,
    domain: "environnement",
    description:
      "Actualisation du dispositif reglementaire et methodologique d'evaluation environnementale.",
    location: "Polynesie francaise",
  },
  {
    id: "formations-cnam-club-managers",
    title: "Formations CNAM — Club des Managers",
    client: "Club des Managers / CNAM",
    year: 2022,
    domain: "formation",
    description:
      "Conception et animation de formations en management et conduite du changement pour le Club des Managers.",
    location: "Polynesie francaise",
  },
  {
    id: "centre-part147-air-formation",
    title: "Centre Part-147 cles en main — Air Formation",
    client: "Air Formation",
    year: 2021,
    domain: "formation",
    description:
      "Accompagnement a la creation d'un centre de formation aeronautique agree Part-147.",
    location: "Pacifique Sud",
  },
  {
    id: "amo-air-bora-bora",
    title: "AMO globale Air Bora Bora",
    client: "Air Bora Bora",
    year: 2021,
    domain: "amo",
    description:
      "Assistance a maitrise d'ouvrage couvrant l'ensemble des dimensions du projet Air Bora Bora.",
    location: "Polynesie francaise",
  },
  {
    id: "tavivat-dag-pilotage",
    title: "Assistance au pilotage du projet TAVIVAT",
    client: "Direction des Affaires Generales (DAG)",
    year: 2023,
    domain: "amo",
    description:
      "Assistance au pilotage et a la coordination du projet TAVIVAT pour la DAG.",
    location: "Polynesie francaise",
  },
  {
    id: "province-iles-loyaute-ports-aeroports",
    title: "Appui strategique integre ports et aeroports — Iles Loyaute",
    client: "Province des Iles Loyaute",
    year: 2022,
    domain: "amo",
    description:
      "Appui strategique portant sur le developpement coordonne des infrastructures portuaires et aeroportuaires des Iles Loyaute.",
    location: "Iles Loyaute, Nouvelle-Caledonie",
  },
];
