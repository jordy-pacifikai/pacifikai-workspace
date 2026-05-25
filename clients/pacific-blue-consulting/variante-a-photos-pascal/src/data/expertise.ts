export type ExpertiseItem = {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  value: string;
  details: string[];
  examples: string[];
};

export const expertises: ExpertiseItem[] = [
  {
    id: "etudes-strategie",
    title: "Études & Stratégie",
    shortTitle: "Études",
    icon: "chart",
    description:
      "Expertise en analyse de faisabilité, modélisation économique, études de marché, définition de positionnement et élaboration de schémas directeurs pour des projets aériens, d'infrastructures et environnementaux.",
    value:
      "Vision stratégique structurée, décisions d'investissement mieux fondées, modèles économiques testés et trajectoires de développement clarifiées (opérationnelles, territoriales et environnementales).",
    details: [
      "Analyses de faisabilité technico-économique",
      "Modélisation économique et business plans",
      "Études de marché sectorielles",
      "Schémas directeurs aéroportuaires et territoriaux",
      "Positionnement stratégique et trajectoires de développement",
      "Stratégies de concession et candidatures",
      "Études de liaisons aériennes régionales",
      "Stratégies de décarbonation et drones (UAV)",
      "Outils de modélisation de la desserte aérienne",
      "Accompagnement stratégique pluriannuel",
    ],
    examples: [
      "Création et structuration de Tahiti Nui Helicopters",
      "Création et Business plan d'Islands Airline",
      "Stratégie de concession pour Vinci Airports",
      "Modèle économique pour Terciel (aéroports marins)",
      "Études de faisabilité à Lifou (classification internationale et création d'un aérodrome à Hmelek)",
      "Conception du dispositif de certification biodiversité en Polynésie",
      "Continuité territoriale aérienne interinsulaire",
      "Étude de marché des nouveaux produits alimentaires à base de vivriers locaux (DAG, projet TAVIVAT)",
      "Outil de modélisation de la desserte pour la DAC-Pf",
      "Étude de ligne aérienne régionale Tahiti - États insulaires du Pacifique",
      "Travaux sur la décarbonation et les drones (stratégie UAV, bilan carbone, feuille de route)",
      "Schéma d'aménagement des plateformes aéroportuaires de Moorea et Huahine",
      "Accompagnement stratégique pluriannuel de la Province des Îles Loyauté (DPA) sur les ports et aéroports",
    ],
  },
  {
    id: "audits-conformite",
    title: "Audits & Conformité",
    shortTitle: "Audits",
    icon: "plane",
    description:
      "Réalisation d'audits complets et d'appuis à la mise en conformité des activités aériennes, de maintenance et d'infrastructures, dans le cadre des réglementations EASA (Part-145, Part-M, Part-OPS, Part-CAMO), de la certification aéroportuaire et des dispositifs environnementaux.",
    value:
      "Risques mieux maîtrisés, conformité démontrée auprès des autorités, certifications obtenues et maintenues, continuité des opérations sécurisée.",
    details: [
      "Audits réglementaires des autorités de l'aviation civile",
      "Audits de conformité Part-145 et Part-M (maintenance)",
      "Plans d'actions conformité pour exploitants aériens",
      "Diagnostic et certification du réseau d'aérodromes",
      "Dossiers de certification et audits internes/externes",
      "Accompagnement conformité Part-OPS et Part-CAMO",
      "Actualisation des dispositifs d'évaluation environnementale (EIE/NIE)",
      "Gestion des pièces détachées et réintégration",
      "Certification ISO 9001, 14001, 45001",
      "Dossiers ICPE et plans de prévention des risques",
    ],
    examples: [
      "Audit réglementaire DAC-Pf",
      "Audits Part-145/Part-M de TASC",
      "Diagnostic et certification du réseau d'aérodromes MLA",
      "Dossiers conformité et certification Air Loyauté",
      "Accompagnement conformité de TAC",
      "Actualisation du dispositif EIE/NIE pour la DAC-Pf",
    ],
  },
  {
    id: "documentation-certification",
    title: "Documentation & Certification",
    shortTitle: "Documentation",
    icon: "document",
    description:
      "Rédaction et structuration de manuels, procédures, matrices de conformité et cahiers des charges techniques pour les compagnies, les aéroports, les organismes de formation et les autorités.",
    value:
      "Dispositifs documentaires complets et évolutifs, conformité structurée, opérations encadrées et maintenance facilitée.",
    details: [
      "Manuels d'exploitation (MANEX) et documentation opérationnelle",
      "Procédures opérationnelles et gestion des opérations vol",
      "Recueils SSLIA et manuels AFIS",
      "Manuels de maintenance des assets électrotechniques",
      "Manuels d'exploitation UAV",
      "Cahiers des charges techniques pour infrastructures innovantes",
      "Matrices de conformité réglementaire",
      "Documentation MEL (Minimum Equipment List)",
    ],
    examples: [
      "MANEX et documentation d'Islands Airline (47 documents)",
      "MEL et MANEX de TAC",
      "Procédures opérationnelles d'Air Loyauté",
      "Recueils SSLIA et AFIS de la DAC-Pf",
      "Manuels de maintenance des assets électrotechniques",
      "Manuels UAV",
      "Cahier des charges pour aéroports marins Terciel",
    ],
  },
  {
    id: "formation-concours",
    title: "Formation & Concours",
    shortTitle: "Formation",
    icon: "users",
    description:
      "Conception et animation de formations managériales et techniques, développement de contenus pédagogiques, accompagnement individuel (tutoring) et contribution à des concours et examens professionnels.",
    value:
      "Compétences renforcées, certifications obtenues, capacités internes structurées et trajectoires professionnelles ou entrepreneuriales sécurisées.",
    details: [
      "Formation au management et conduite du changement",
      "Gestion de projet et culture générale économique et managériale",
      "Ateliers de codéveloppement",
      "Tutoring individuel et préparation diplômes",
      "Création de centres de formation aéronautique agréés (Part-147)",
      "Recrutement et qualification d'instructeurs Part-147",
      "Supports pédagogiques et livrets de formation (MTOE)",
      "Élaboration de sujets et correction de concours professionnels",
      "Accompagnement à la création d'entreprises",
    ],
    examples: [
      "Programmes CNAM — Club des Managers",
      "Formation Gestion de Projet — CNAM",
      "Formation Conduite du Changement — CNAM",
      "Formation Culture Générale, Économique et Managériale — CNAM",
      "Tutoring — Préparation Licence Management — CNAM",
      "Centre Part-147 clé en main — Air Formation",
      "Recrutement et qualification d'instructeurs Part-147 — Air Formation",
      "Livrets et supports de formation aéronautique (MTOE) — Air Formation",
      "Concours DGRH — Élaboration de sujets et correction de copies",
      "Accompagnement à la création d'entreprises individuelles ou de sociétés",
    ],
  },
  {
    id: "amo-projets",
    title: "AMO & Projets",
    shortTitle: "AMO",
    icon: "compass",
    description:
      "Assistance à maîtrise d'ouvrage pour des projets complexes : cadrage, planification, coordination multi-acteurs, suivi des risques et appui à la décision.",
    value:
      "Projets menés à terme dans des contextes exigeants, calendriers tenus, coordination fluidifiée et atteinte des objectifs stratégiques des maîtres d'ouvrage.",
    details: [
      "Cadrage et planification de projets complexes",
      "Coordination multi-acteurs et parties prenantes",
      "Suivi des risques et appui à la décision",
      "Appui à la candidature de concessions aéroportuaires",
      "Pilotage de projets hélicoptères et redéploiement",
      "Mise en place de dessertes aériennes inter-îles",
      "Schémas d'aménagement aéroportuaires",
      "Accompagnement DSP (Délégation de Service Public)",
      "Appui stratégique intégré ports et aéroports",
    ],
    examples: [
      "Appui à la candidature de concession de Tahiti-Faa'a pour Vinci Airports",
      "Projets hélicoptères (Marquises, redéploiement)",
      "Mise en place de la desserte TAC inter-îles",
      "AMO globale Air Bora Bora",
      "Base ULM de Moorea (MOZ ULM)",
      "DSP Wallis & Futuna",
      "Schémas d'aménagement aéroportuaires",
      "Appui stratégique intégré ports et aéroports — Province des Îles Loyauté (DPA)",
      "Assistance au pilotage du projet TAVIVAT — DAG",
    ],
  },
  {
    id: "creation-structuration",
    title: "Création / Structuration",
    shortTitle: "Création",
    icon: "building",
    description:
      "Appui à la création ou à la structuration d'entités : compagnies aériennes, centres de formation, sociétés d'infrastructures ou activités nouvelles.",
    value:
      "Structures conçues sur des bases solides, organisations opérationnelles prêtes à l'emploi et modèles économiques soutenables.",
    details: [
      "Création et structuration de compagnies aériennes",
      "Structuration de compagnies aériennes startup",
      "Modernisation et restructuration de compagnies existantes",
      "Mise en place de centres de formation agréés",
      "Définition de modèles économiques et structures innovantes",
      "Obtention du Certificat de Transport Aérien (CTA)",
      "Organisations opérationnelles prêtes à l'emploi",
    ],
    examples: [
      "Création et structuration de Tahiti Nui Helicopters",
      "Création et structuration d'Islands Airline",
      "Création et structuration d'Air Bora Bora",
      "Mise en place du centre de formation Part-147 Air Formation",
      "Définition du modèle et de la structure Terciel (aéroports marins)",
      "Structuration et modernisation d'Air Loyauté (Nouméa)",
    ],
  },
  {
    id: "gestion-securite",
    title: "Gestion de la Sécurité",
    shortTitle: "Sécurité",
    icon: "shield",
    description:
      "Renforcement des dispositifs de gestion de la sécurité : SGS, cartographie des risques, études de sécurité ciblées et évaluations d'impacts sur la sécurité aéroportuaire.",
    value:
      "Dispositifs sécurité plus robustes, meilleure maîtrise des risques opérationnels et démonstration de conformité aux attentes des autorités.",
    details: [
      "Systèmes de Gestion de la Sécurité (SGS)",
      "Cartographie et analyse des risques opérationnels",
      "Études de sécurité pour exploitations en archipels montagneux",
      "Continuité territoriale aérienne et cadre sécuritaire",
      "Études d'Impacts sur la Sécurité Aéroportuaire (EISA)",
      "Démonstration de conformité aux exigences des autorités",
    ],
    examples: [
      "Renforcement du SGS Air Loyauté",
      "Études de sécurité pour TAC aux Marquises",
      "Travaux sur la continuité territoriale aérienne",
      "Études d'Impacts sur la Sécurité Aéroportuaire (EISA) pour la DAC-Pf",
    ],
  },
  {
    id: "organisation-management",
    title: "Organisation & Management",
    shortTitle: "Organisation",
    icon: "users",
    description:
      "Diagnostics organisationnels, structuration de fonctions clés (notamment RH), optimisation de processus et accompagnement managérial.",
    value:
      "Organisations plus lisibles, responsabilités clarifiées, processus mieux maîtrisés et management renforcé au service de la performance globale.",
    details: [
      "Diagnostics organisationnels complets",
      "Structuration de la fonction RH",
      "Optimisation de processus internes",
      "Accompagnement et appui managérial",
      "Plans d'actions de management",
      "Gestion de projet et coordination",
      "Animation de clubs de managers",
      "Coaching professionnel et executive coaching",
    ],
    examples: [
      "Organisation et fonction RH Air Loyauté — structuration et appui managérial",
      "Audit organisationnel et plan d'actions de management",
      "Gestion de projet pour Air Bora Bora",
      "Animation du Club des managers CNAM",
    ],
  },
];
