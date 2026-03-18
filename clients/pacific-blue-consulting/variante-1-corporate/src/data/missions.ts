export type Mission = {
  id: string;
  title: string;
  client: string;
  year: number;
  domain: Domain;
  description: string;
  results: string[];
  duration: string;
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
    id: "bilan-carbone-dac",
    title: "Bilan Carbone de l'Aviation Civile en Polynesie francaise",
    client: "Direction de l'Aviation Civile PF",
    year: 2023,
    domain: "environnement",
    description:
      "Realisation du premier bilan carbone complet de l'aviation civile polynesienne, couvrant les vols domestiques et internationaux, les infrastructures aeroportuaires et les activites connexes.",
    results: [
      "Inventaire exhaustif des emissions GES du secteur aerien PF",
      "Plan de reduction des emissions a horizon 2030",
      "Recommandations pour la compensation carbone locale",
    ],
    duration: "8 mois",
    location: "Polynesie francaise",
  },
  {
    id: "certification-compagnie",
    title: "Accompagnement a la Certification d'une Compagnie Aerienne",
    client: "Confidentiel",
    year: 2022,
    domain: "aviation",
    description:
      "Assistance technique complete pour l'obtention du Certificat de Transporteur Aerien (CTA) d'une nouvelle compagnie regionale, de la constitution du dossier a l'audit final.",
    results: [
      "CTA obtenu dans les delais impartis",
      "Manuel d'exploitation valide par l'autorite competente",
      "Formation des equipes aux standards OACI",
    ],
    duration: "12 mois",
    location: "Pacifique Sud",
  },
  {
    id: "schema-aeroportuaire",
    title: "Schema Directeur des Aerodromes des Iles Sous-le-Vent",
    client: "Gouvernement de la Polynesie francaise",
    year: 2023,
    domain: "aeroports",
    description:
      "Elaboration du schema directeur a 20 ans des infrastructures aeroportuaires des Iles Sous-le-Vent, incluant la modelisation du trafic et l'etude d'impact environnemental.",
    results: [
      "Schema directeur adopte par le conseil des ministres",
      "Projection du trafic passagers et fret a horizon 2045",
      "Plan d'investissement de 12 milliards XPF",
    ],
    duration: "10 mois",
    location: "Iles Sous-le-Vent",
  },
  {
    id: "desserte-marquises",
    title: "Etude de Desserte Aerienne des Iles Marquises",
    client: "Direction des Transports Terrestres",
    year: 2021,
    domain: "etudes",
    description:
      "Etude de faisabilite technico-economique pour l'amelioration de la desserte aerienne des Marquises, incluant l'analyse des besoins en connectivite et la modelisation de la demande.",
    results: [
      "Modelisation economique de 3 scenarios de desserte",
      "Identification des investissements aeroportuaires requis",
      "Cadre de la delegation de service public optimise",
    ],
    duration: "6 mois",
    location: "Iles Marquises",
  },
  {
    id: "audit-securite-aeroport",
    title: "Audit de Securite et de Surete de l'Aeroport International",
    client: "ADT (Aeroport de Tahiti)",
    year: 2024,
    domain: "aeroports",
    description:
      "Audit complet des dispositifs de securite et de surete de l'aeroport de Tahiti-Faa'a, conformement aux standards OACI et aux reglementations europeennes.",
    results: [
      "Rapport d'audit avec 47 points de conformite evalues",
      "Plan d'action correctif priorise",
      "Formation du personnel aux nouvelles procedures",
    ],
    duration: "4 mois",
    location: "Tahiti",
  },
  {
    id: "continuite-territoriale",
    title: "Analyse de la Continuite Territoriale Aerienne",
    client: "Haut-Commissariat de la Republique",
    year: 2020,
    domain: "etudes",
    description:
      "Etude approfondie des enjeux de continuite territoriale aerienne en Polynesie francaise, territoire de 5 millions de km2 avec 48 iles habitees.",
    results: [
      "Cartographie complete des flux aeriens domestiques",
      "Propositions de reforme des obligations de service public",
      "Benchmark avec les dispositifs ultramarins comparables",
    ],
    duration: "7 mois",
    location: "Polynesie francaise",
  },
  {
    id: "biodiversite-aeroport",
    title: "Plan de Gestion de la Biodiversite Aeroportuaire",
    client: "Confidentiel",
    year: 2024,
    domain: "environnement",
    description:
      "Elaboration d'un plan de gestion de la faune et de la flore sur et autour des emprises aeroportuaires, integrant la prevention du risque animalier et la preservation des especes endemiques.",
    results: [
      "Inventaire faunistique et floristique sur 3 aerodromes",
      "Protocole de prevention du peril animalier",
      "Plan de preservation des especes protegees",
    ],
    duration: "5 mois",
    location: "Nouvelle-Caledonie",
  },
  {
    id: "amo-extension-piste",
    title: "AMO Extension de Piste d'un Aerodrome Insulaire",
    client: "Commune de Rangiroa",
    year: 2022,
    domain: "amo",
    description:
      "Assistance a maitrise d'ouvrage pour le projet d'extension de la piste de l'aerodrome de Rangiroa, permettant l'accueil d'aeronefs de plus grande capacite.",
    results: [
      "Pilotage du projet de la phase APS a la reception",
      "Respect du budget previsionnel (+/- 3%)",
      "Livraison dans les delais contractuels",
    ],
    duration: "18 mois",
    location: "Rangiroa, Tuamotu",
  },
  {
    id: "formation-management",
    title: "Formation en Management de Projets Aeroportuaires",
    client: "To70 Aviation Consultancy",
    year: 2023,
    domain: "formation",
    description:
      "Conception et animation d'un programme de formation au management de projets aeroportuaires pour les cadres de la fonction publique polynesienne.",
    results: [
      "24 cadres formes sur 3 sessions",
      "Taux de satisfaction de 96%",
      "Mise en place d'une communaute de pratiques",
    ],
    duration: "3 mois",
    location: "Tahiti",
  },
  {
    id: "modelisation-trafic",
    title: "Modelisation Economique du Trafic Aerien Post-Covid",
    client: "Direction de l'Aviation Civile PF",
    year: 2021,
    domain: "etudes",
    description:
      "Modelisation des scenarios de reprise du trafic aerien en Polynesie francaise apres la pandemie, avec analyse des impacts sur l'economie locale et le tourisme.",
    results: [
      "Modele predictif a 5 ans avec 3 scenarios",
      "Analyse d'impact sur 12 secteurs economiques",
      "Recommandations pour le plan de relance aerien",
    ],
    duration: "4 mois",
    location: "Polynesie francaise",
  },
];
