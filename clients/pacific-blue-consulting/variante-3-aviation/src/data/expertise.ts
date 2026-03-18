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
      "Accompagnement global des operateurs aeriens : de la creation de compagnie a l'optimisation des operations, en passant par la certification et la conformite reglementaire.",
    details: [
      "Obtention et renouvellement du Certificat de Transporteur Aerien (CTA)",
      "Redaction et mise a jour des manuels d'exploitation (MANEX, MEL, CDL)",
      "Audit des systemes de gestion de la securite (SGS/SMS)",
      "Optimisation des reseaux de routes et des programmes de vols",
      "Analyse de viabilite economique et business plans aeriens",
      "Relations avec les autorites de tutelle (DGAC, OACI, AESA)",
    ],
    examples: [
      "Certification d'une nouvelle compagnie regionale dans le Pacifique",
      "Audit SMS pour un transporteur aerien polynesien",
    ],
  },
  {
    id: "aeroports",
    title: "Aeroports & Infrastructures Aeroportuaires",
    shortTitle: "Aeroports",
    icon: "building",
    description:
      "Expertise en planification, developpement et gestion des infrastructures aeroportuaires, des aerodromes insulaires aux plates-formes internationales.",
    details: [
      "Schemas directeurs aeroportuaires a 10, 20 et 30 ans",
      "Etudes de capacite et de dimensionnement des terminaux",
      "Audits de securite et de surete aeroportuaire",
      "Conception des procedures d'approche et de depart",
      "Gestion des risques et plans de secours aerodrome",
      "Conformite aux standards OACI (Annexes 9, 14, 17)",
    ],
    examples: [
      "Schema directeur des aerodromes des Iles Sous-le-Vent",
      "Audit de securite de l'aeroport de Tahiti-Faa'a",
    ],
  },
  {
    id: "environnement",
    title: "Environnement, Biodiversite & Bilan Carbone",
    shortTitle: "Environnement",
    icon: "leaf",
    description:
      "Expertise environnementale appliquee au secteur aerien et aux territoires insulaires : bilans carbone, plans de gestion de la biodiversite, strategies de decarbonation.",
    details: [
      "Bilans carbone sectoriels (methodologie ADEME et GHG Protocol)",
      "Strategies de decarbonation et plans de transition energetique",
      "Gestion de la faune aeroportuaire et prevention du peril animalier",
      "Etudes d'impact environnemental de projets aeronautiques",
      "Preservation de la biodiversite endemique sur sites aeroportuaires",
      "Compensation carbone et credits carbone locaux",
    ],
    examples: [
      "Premier bilan carbone de l'aviation civile en Polynesie francaise",
      "Plan de gestion de la biodiversite pour 3 aerodromes caledoniens",
    ],
  },
  {
    id: "etudes",
    title: "Etudes Strategiques & Modelisation Economique",
    shortTitle: "Etudes strategiques",
    icon: "chart",
    description:
      "Analyses strategiques et modelisations economiques pour eclairer les decisions publiques et privees dans les domaines du transport aerien et de l'amenagement territorial.",
    details: [
      "Etudes de faisabilite technico-economique",
      "Modelisation de la demande et prevision du trafic",
      "Analyse des obligations de service public (OSP)",
      "Benchmarking international et retours d'experience",
      "Continuite territoriale et desserte des iles isolees",
      "Etudes de marche et positionnement strategique",
    ],
    examples: [
      "Modelisation economique du trafic aerien post-Covid",
      "Analyse de la continuite territoriale aerienne en PF",
    ],
  },
  {
    id: "amo",
    title: "AMO & Pilotage de Projets Complexes",
    shortTitle: "AMO & Pilotage",
    icon: "compass",
    description:
      "Assistance a maitrise d'ouvrage et pilotage de bout en bout de projets techniques complexes, de la phase de conception a la livraison.",
    details: [
      "Cadrage et definition des besoins",
      "Pilotage de projet (planning, budget, risques)",
      "Redaction des cahiers des charges et specifications",
      "Suivi de la conception et de la realisation",
      "Coordination des parties prenantes multiples",
      "Controle qualite et reception des ouvrages",
    ],
    examples: [
      "AMO extension de piste d'un aerodrome insulaire",
      "Pilotage de la refonte des systemes de navigation aerienne",
    ],
  },
  {
    id: "formation",
    title: "Formation & Management",
    shortTitle: "Formation",
    icon: "users",
    description:
      "Conception et animation de formations professionnelles et de programmes de renforcement des competences pour les acteurs du secteur aerien et du service public.",
    details: [
      "Formation au management de projets aeroportuaires",
      "Sensibilisation a la securite et a la surete aerienne",
      "Ateliers de conduite du changement",
      "Coaching de dirigeants et de cadres",
      "Transfert de competences et montee en capacite des equipes",
      "Animation de seminaires et de conferences specialisees",
    ],
    examples: [
      "Programme de formation pour 24 cadres de la fonction publique",
      "Seminaire de management pour les equipes aeroportuaires",
    ],
  },
];
