export type Mission = {
  id: string;
  title: string;
  client: string;
  year: string;
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
  | "formation"
  | "documentation"
  | "securite"
  | "drones"
  | "artisanat";

export const domainLabels: Record<Domain, string> = {
  aviation: "Aviation civile",
  aeroports: "Aeroports & Infrastructures",
  environnement: "Environnement & Biodiversite",
  etudes: "Etudes strategiques",
  amo: "AMO & Pilotage",
  formation: "Formation & Management",
  documentation: "Documentation & Certification",
  securite: "Securite aerienne",
  drones: "Drones & Nouvelles technologies",
  artisanat: "Developpement territorial & Artisanat",
};

export const domainColors: Record<Domain, string> = {
  aviation: "bg-steel-50 text-steel-600",
  aeroports: "bg-navy-50 text-navy-400",
  environnement: "bg-emerald-50 text-emerald-700",
  etudes: "bg-gold-50 text-gold-600",
  amo: "bg-warm-50 text-warm-600",
  formation: "bg-sky-50 text-sky-700",
  documentation: "bg-slate-50 text-slate-600",
  securite: "bg-red-50 text-red-600",
  drones: "bg-violet-50 text-violet-600",
  artisanat: "bg-amber-50 text-amber-700",
};

export const missions: Mission[] = [
  // ──────────────────────────────────────────────
  // 5.2.2 — TAVIVAT AMO (2025-2030)
  // ──────────────────────────────────────────────
  {
    id: "tavivat-dag-pilotage",
    title: "Assistance au pilotage du projet TAVIVAT — Phase de realisation",
    client: "Direction de l'Agriculture (DAG)",
    year: "2025-2030",
    domain: "amo",
    description:
      "Assistance operationnelle et strategique au pilotage de la phase de realisation du projet TAVIVAT, demonstrateur territorial de transition agro-ecologique vivriere et d'agro-transformation, incluant outils de planification, animation de coordination et rapports d'avancement.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 5.1.4 — Etude de marche vivriers locaux (2025-2026)
  // ──────────────────────────────────────────────
  {
    id: "etude-marche-vivriers-dag",
    title: "Etude de marche des nouveaux produits alimentaires a base de vivriers locaux",
    client: "Direction de l'Agriculture (DAG)",
    year: "2025-2026",
    domain: "etudes",
    description:
      "Etude de marche complete pour de nouveaux produits alimentaires a base de vivriers locaux (taro, manioc, uru, patate douce, banane) dans le cadre du projet TAVIVAT, ciblant restauration scolaire, hotellerie-restauration et grande distribution.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.2.5 — Ligne Pacifique Sud (2025)
  // ──────────────────────────────────────────────
  {
    id: "ligne-pacifique-sud-seac",
    title: "Etude ligne aerienne Tahiti — Iles Cook — Tonga — Samoa — Fidji",
    client: "Service d'Etat de l'Aviation Civile en Polynesie francaise",
    year: "2025",
    domain: "etudes",
    description:
      "Etude de faisabilite pour l'ouverture et l'exploitation d'une ligne aerienne regionale reliant Tahiti aux Iles Cook, Tonga, Samoa et Fidji, visant une meilleure connectivite et integration economique des Etats insulaires du Pacifique.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 1.4.4 — RCO SSLIA (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "rco-sslia-dac-pf",
    title: "Creation d'une nouvelle generation de RCO SSLIA",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Creation d'une nouvelle generation de Recueils de Consignes Operationnelles pour les pompiers d'aerodromes (SSLIA), avec concept innovant de document Master et base de donnees centralisee des procedures.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.4.5 — Manuels AFIS (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-afis-dac-pf",
    title: "Creation des Manuels d'Exploitation AFIS",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Creation des Manuels d'Exploitation pour les services AFIS (Aerodrome Flight Information Service) avec concept Master et base de donnees des procedures d'information aeronautique, exploitables sur tous les aerodromes polynesiens.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.4.6 — Manuels Maintenance electrotechniques (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-maintenance-electrotechniques-dac-pf",
    title: "Creation des Manuels de Maintenance des assets electrotechniques",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Creation de manuels techniques et de maintenance pour l'ensemble des assets electrotechniques geres par la DAC-Pf (systemes d'information, equipements aeroportuaires, transmissions), avec concept Master pour maintenance predictive.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.4.7 — Manuels UAV (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-exploitation-uav",
    title: "Realisation de manuels d'exploitation UAV",
    client: "Operateur prive / DGEE (Service audiovisuel)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Redaction complete de manuels d'exploitation pour drones/UAV incluant procedures de vol, maintenance, consignes de securite, procedures d'urgence et conformite reglementaire francaise/europeenne.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.5.3 — EISA DAC-Pf (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "eisa-dac-pf",
    title: "Etudes d'Impacts sur la Securite Aeroportuaire (EISA)",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "securite",
    description:
      "Realisation d'etudes d'impacts sur la securite aeroportuaire pour diverses modifications operationnelles ou infrastructurelles sur les plateformes aeroportuaires polynesiennes, avec cartographie des risques et recommandations d'attenuation.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.6.1 — Etude drones PF (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "etude-drones-polynesie",
    title: "Etude d'exploration des opportunites de deploiement des drones en Polynesie francaise",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Etude strategique exploratoire sur les opportunites de deploiement des drones/UAV en Polynesie francaise : usages civils, cadre reglementaire europeen applicable, enjeux securite aerienne, modeles economiques d'exploitation et recommandations de politique publique.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.6.2 — Outil modelisation desserte (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "outil-modelisation-desserte",
    title: "Outil de modelisation de la desserte en Polynesie francaise",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Developpement d'un outil de simulation permettant de modeliser la desserte aerienne inter-iles en fonction de parametres variables (flottes, capacites, frequences, couts, connectivite). Aide a la decision strategique pour optimisation de la continuite territoriale.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.6.3 — Imagerie aerienne telepilote (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "imagerie-aerienne-telepilote",
    title: "Missions d'imagerie aerienne par telepilote",
    client: "Pacific Blue Consulting (interne)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Missions d'imagerie aerienne professionnelle avec materiel DJI pour clients institutionnels et prives : surveillance d'infrastructures aeroportuaires, cartographie, inspection et documentation visuelle, realisees par le president de PBC, telepilote qualifie.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 2.2.1 — Schema amenagement Moorea/Huahine (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "schema-amenagement-moorea-huahine",
    title: "Schema d'amenagement des aeroports de Moorea et Huahine",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Elaboration d'un schema directeur d'amenagement aeroportuaire pour les plateformes insulaires de Moorea et Huahine : analyse des besoins, schemas d'evolution, priorites d'infrastructure et modeles d'exploitation.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 2.2.2 — Air Tetiaroa conformite piste (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "air-tetiaroa-conformite-piste",
    title: "Accompagnement a la levee des non-conformites de la piste de Tetiaroa",
    client: "Tahiti Beachcomber SA (Air Tetiaroa)",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Accompagnement strategique pour resolution des ecarts de conformite sur la piste d'atterrissage de Tetiaroa, incluant strategie d'adaptation reglementaire, etudes de securite demonstratives et optimisation des investissements aeroportuaires.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 3.1.3 — Actualisation EIE/NIE (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "actualisation-eie-nie",
    title: "Actualisation du dispositif d'evaluation environnementale (EIE – NIE)",
    client: "Direction de l'Environnement (DAE-Pf)",
    year: "2024-2025",
    domain: "environnement",
    description:
      "Actualisation complete du dispositif d'Etudes d'Impacts sur l'Environnement et Notices d'Impacts Environnementaux en Polynesie francaise : revision des criteres, processus, harmonisation avec normes internationales et formation des evaluateurs.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 3.2.1 — Bilan carbone DAC-Pf (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "bilan-carbone-dac-pf",
    title: "Bilan carbone DAC-Pf et feuille de route decarbonation",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "environnement",
    description:
      "Evaluation complete du bilan carbone institutionnel de la DAC-Pf et elaboration d'une feuille de route ambitieuse de decarbonation avec objectifs chiffres, actions prioritaires et metriques de suivi.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.3.2 — Accompagnement creation entreprises (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "accompagnement-creation-entreprises",
    title: "Accompagnement a la creation d'entreprises individuelles ou de societes",
    client: "Divers entrepreneurs / Service de Developpement Economique",
    year: "2024-2025",
    domain: "formation",
    description:
      "Accompagnement global de porteurs de projets en creation d'entreprise : faisabilite economique, montage juridique/fiscal, business plan, financement, immatriculation et coaching entrepreneurial intensif.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 5.1.3 — Province Iles Loyaute DPA (2024-2029)
  // ──────────────────────────────────────────────
  {
    id: "province-iles-loyaute-ports-aeroports",
    title: "Appui strategique integre ports et aeroports — Iles Loyaute (DPA)",
    client: "Province des Iles Loyaute — Direction des Ports et Aeroports (DPA)",
    year: "2024-2029",
    domain: "amo",
    description:
      "Accompagnement pluriannuel de la DPA sur l'ensemble du spectre portuaire et aeroportuaire de la Province des Iles Loyaute : appui technique continu, analyses strategiques, renforcement de competences, schema directeur insulaire des infrastructures et gouvernance partagee.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 6.1.1 — Sechoir a pandanus (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "sechoir-pandanus-artisanat",
    title: "Etude de faisabilite pour un sechoir a pandanus",
    client: "Service de l'Artisanat Traditionnel",
    year: "2024-2025",
    domain: "artisanat",
    description:
      "Etude de faisabilite technique, economique et organisationnelle pour la creation d'une infrastructure mutualisee de sechage du pandanus destinee aux artisans traditionnels polynesiens : dimensionnement equipement, modele economique et impact emplois artisanaux.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.1.3 — Air Bora Bora structuration (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "air-bora-bora-structuration",
    title: "Structuration d'une compagnie aerienne startup — Creation Air Bora Bora",
    client: "Air Bora Bora",
    year: "2020-2023",
    domain: "aviation",
    description:
      "Creation complete d'une compagnie aerienne startup : structuration juridique (SAS), immatriculation, business plan, strategie commerciale et programme de vols (liaisons Moorea/atolls), gestion de projet et coordination calendrier lancement.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 5.2.1 — AMO Air Bora Bora (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "amo-air-bora-bora",
    title: "AMO globale pour projet Air Bora Bora",
    client: "Air Bora Bora",
    year: "2020-2023",
    domain: "amo",
    description:
      "Assistance maitrise d'ouvrage integrale : pilotage global du projet de creation de compagnie aerienne, coordination entre fondateurs/investisseurs/prestataires, gestion des risques, respect des calendriers et budgets.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.1.4 — Air Loyaute structuration (2019-2023)
  // ──────────────────────────────────────────────
  {
    id: "air-loyaute-modernisation",
    title: "Structuration et modernisation d'Air Loyaute",
    client: "Air Loyaute",
    year: "2019-2023",
    domain: "aviation",
    description:
      "Accompagnement pluriannuel d'Air Loyaute dans l'evolution de son organisation et de ses referentiels techniques et operationnels : mise a jour des dossiers de conformite (CTA, Part-145, Part-M, Part-CAMO), renforcement du SGS, structuration RH et actualisation des procedures.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 1.3.5 — Dossiers conformite Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "conformite-certification-air-loyaute",
    title: "Dossiers conformite et certification — Audits internes et externes — Air Loyaute",
    client: "Air Loyaute",
    year: "2020-2023",
    domain: "aviation",
    description:
      "Gestion complete des dossiers de conformite et certification : CTA, Part-145, Part-M, Part-CAMO, Part-OPS. Preparation et accompagnement des audits internes et externes (autorites et auditeurs tiers).",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 1.3.6 — SGS Air Loyaute (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "sgs-air-loyaute",
    title: "Systeme de gestion de la securite (SGS) — Renforcement — Air Loyaute",
    client: "Air Loyaute",
    year: "2021-2023",
    domain: "securite",
    description:
      "Accompagnement dans le renforcement du SGS : consolidation des processus de retour d'experience, animation des instances SGS (SAG, SRB), definition et suivi d'indicateurs de securite operationnelle, soutien aux audits internes.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 1.4.2 — Procedures operationnelles Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "procedures-operationnelles-air-loyaute",
    title: "Procedures operationnelles et gestion des operations vol — Air Loyaute",
    client: "Air Loyaute",
    year: "2020-2023",
    domain: "documentation",
    description:
      "Redaction et mise a jour continue des procedures operationnelles completes : procedures de vol normal et anormal, approches, procedures d'urgence, manuel de vol des equipages, procedures de maintenance en ligne et gestion des deroutements.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 4.3.1 — Organisation RH Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "organisation-rh-air-loyaute",
    title: "Organisation & fonction RH — Structuration et appui managerial — Air Loyaute",
    client: "Air Loyaute",
    year: "2020-2023",
    domain: "formation",
    description:
      "Accompagnement dans l'evolution de l'organisation interne et de la fonction RH : clarification des responsabilites, analyse des processus decisionnels, structuration des processus RH et appui a la mise en place d'outils de pilotage des effectifs.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 5.1.1 — DSP Wallis & Futuna Air Loyaute (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "dsp-wallis-futuna-air-loyaute",
    title: "Mise en place DSP Wallis & Futuna — Air Loyaute",
    client: "Air Loyaute",
    year: "2021-2023",
    domain: "etudes",
    description:
      "Assistance strategique et operationnelle pour la mise en place d'un Dispositif de Service Public Wallis & Futuna : strategie operationnelle, configuration flotte, definition procedures, contrats et accompagnement des premiers vols.",
    location: "Wallis et Futuna",
  },
  // ──────────────────────────────────────────────
  // 2.3.1 — Terciel modele economique (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroports-marins-terciel",
    title: "Modele economique pour societe d'aeroports marins innovants — Terciel SAS",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Elaboration du modele economique detaille pour Terciel SAS : description des services, identification des segments clients, modeles de revenus (landing fees, services a l'aeronef, carburant), pricing et scenarios financiers.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 2.3.2 — Brochure Terciel (2022)
  // ──────────────────────────────────────────────
  {
    id: "brochure-terciel",
    title: "Brochure commerciale et presentation des produits aeroportuaires — Terciel",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Redaction d'une brochure commerciale professionnelle presentant la proposition de valeur de Terciel : services innovants d'aeroports marins/flottants, avantages competitifs, offre standard et vision strategique.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 2.3.3 — Cahier des charges Terciel (2022)
  // ──────────────────────────────────────────────
  {
    id: "cahier-charges-terciel",
    title: "Cahier des charges — Aeroports marins et flottants — Terciel",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Redaction d'un cahier des charges fonctionnel et technique pour la conception et construction de plateformes aeroportuaires marines et flottantes innovantes : specifications techniques marines, normes de securite, capacites d'accueil.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 2.1.4 — Lifou Wanaham (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroport-lifou-wanaham",
    title: "Etude de faisabilite — Classification aeroport international de Lifou (Wanaham)",
    client: "Terciel / Lifou",
    year: "2022",
    domain: "aeroports",
    description:
      "Etude approfondie de faisabilite pour la classification de la plateforme de Lifou (Wanaham) comme aeroport international : analyse des contraintes techniques, reglementaires, commerciales, scenarios d'investissement et modele economique.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 2.1.5 — Aeroport Hmelek Lifou (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroport-hmelek-lifou",
    title: "Etude de creation d'un aeroport ouvert a la CAP — Hmelek, Lifou",
    client: "Province des Iles Loyaute / Lifou",
    year: "2022",
    domain: "aeroports",
    description:
      "Etude de faisabilite technique, reglementaire et socio-economique pour la creation d'une plateforme aeroportuaire ouverte a la circulation aerienne publique (CAP) sur les terres de la tribu de Hmelek, incluant concertation locale et conformite fonciere.",
    location: "Nouvelle-Caledonie",
  },
  // ──────────────────────────────────────────────
  // 4.2.1 — Centre Part-147 Air Formation (2022)
  // ──────────────────────────────────────────────
  {
    id: "centre-part147-air-formation",
    title: "Mise en place cles en main d'un centre Part-147 — Air Formation",
    client: "Air Formation",
    year: "2022",
    domain: "formation",
    description:
      "Creation complete d'un centre de formation Part-147 agree par l'EASA pour la formation en maintenance aeronautique : conception infrastructure, obtention agrement, organisation pedagogique, recrutement equipe et lancement formations.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 4.2.2 — Instructeurs Part-147 Air Formation (2022)
  // ──────────────────────────────────────────────
  {
    id: "instructeurs-part147-air-formation",
    title: "Recrutement et qualification d'instructeurs Part-147 — Air Formation",
    client: "Air Formation",
    year: "2022",
    domain: "formation",
    description:
      "Processus complet de recrutement et qualification d'instructeurs Part-147 : selection de profils, formations en ligne (e-learning), examens de qualification et agrement EASA comme instructeurs certifies.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 4.2.3 — Livrets MTOE Air Formation (2022)
  // ──────────────────────────────────────────────
  {
    id: "livrets-mtoe-air-formation",
    title: "Livrets et supports de formation aeronautique (MTOE) — Air Formation",
    client: "Air Formation",
    year: "2022",
    domain: "formation",
    description:
      "Redaction complete de livrets et supports pedagogiques pour la formation aeronautique MTOE : contenus theoriques, etudes de cas, exercices pratiques et documentation conforme aux standards EASA.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 3.1.1 — Certification biodiversite (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "certification-biodiversite-deploiement",
    title: "Certification biodiversite — Developpement, deploiement et promotion",
    client: "DIREN (Direction de l'Environnement)",
    year: "2021-2023",
    domain: "environnement",
    description:
      "Conception, mise en place et promotion du dispositif de certification 'Entreprise protegeant la biodiversite' en Polynesie francaise : elaboration des criteres, processus de certification et animation d'ateliers aupres des compagnies aeriennes.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 3.1.2 — Certification biodiversite analyse (2021)
  // ──────────────────────────────────────────────
  {
    id: "certification-biodiversite-analyse",
    title: "Certification biodiversite — Analyse et amelioration du processus",
    client: "DIREN (Direction de l'Environnement)",
    year: "2021",
    domain: "environnement",
    description:
      "Phase 3 du projet : analyse critique du processus de certification biodiversite, cartographie des risques de securite et de viabilite du programme, propositions d'amelioration pour robustesse, acceptabilite compagnies et viabilite financiere.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.1 — Formations CNAM Club Managers (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formations-cnam-club-managers",
    title: "Missions de formation CNAM — Club des Managers",
    client: "CNAM (Conservatoire National des Arts et Metiers)",
    year: "2021-2022",
    domain: "formation",
    description:
      "Animation du Club des Managers du CNAM Polynesie francaise : sessions de travail collectif reunissant cadres publics et prives autour de themes de gestion de projet, conduite du changement, management strategique et networking.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.2 — Ateliers codev CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "ateliers-codeveloppement-cnam",
    title: "Ateliers de codeveloppement — Club des Managers",
    client: "CNAM (Conservatoire National des Arts et Metiers)",
    year: "2021-2022",
    domain: "formation",
    description:
      "Animation de seances de codeveloppement professionnel reunissant des cadres autour de situations reelles de management, selon une methode structuree d'intelligence collective avec alternance des roles client/consultant.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.3 — Formation Gestion de Projet CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formation-gestion-projet-cnam",
    title: "Formation Gestion de Projet — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Formation de cadres publics et prives a la gestion de projet : fondamentaux (perimetre, delais, ressources, budget), methodes (Gantt, charge, risques), outils numeriques et preparation a la Licence de Gestion de Projet CNAM.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.4 — Formation Conduite du Changement CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formation-conduite-changement-cnam",
    title: "Formation Conduite du Changement — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Formation a la conduite du changement organisationnel : diagnostic, modeles de transformation (Kotter, Lewin), communication du changement, gestion de la resistance et engagement collectif.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.5 — Formation Culture Generale CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formation-culture-generale-cnam",
    title: "Formation Culture Generale, Economique et Manageriale — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Formation a la culture generale economique, manageriale et institutionnelle : contexte economique polynesien, principes de gestion publique, strategie d'entreprise, tendances sectorielles et enjeux de gouvernance.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.6 — Tutoring Licence Management CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "tutoring-licence-management-cnam",
    title: "Tutoring — Preparation Licence Management — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Accompagnement personnalise (tutoring) d'etudiants CNAM dans leur preparation a la Licence de Gestion et Management : coaching individualise, accompagnement memoire, preparation examen et suivi insertion professionnelle.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 4.1.7 — Concours DGRH (2020-2022)
  // ──────────────────────────────────────────────
  {
    id: "concours-dgrh",
    title: "Concours DGRH — Elaboration de sujets et correction de copies",
    client: "CNAM / DGRH Polynesie francaise",
    year: "2020-2022",
    domain: "formation",
    description:
      "Elaboration de sujets d'epreuves d'admissibilite et correction des copies pour l'examen professionnel d'acces au grade d'ingenieur en chef (Lot 4 des concours DGRH), incluant production de sujets principaux et de secours.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 2.1.2 — Diagnostic aerodromes polynesiens (2021)
  // ──────────────────────────────────────────────
  {
    id: "diagnostic-aerodromes-polynesiens",
    title: "Diagnostic de conformite du reseau d'aerodromes polynesiens",
    client: "MLA (Aerodromes)",
    year: "2021",
    domain: "aeroports",
    description:
      "Audit complet de conformite reglementaire pour l'ensemble du reseau d'aerodromes polynesiens geres par MLA : analyse des constats d'autorite, identification des ecarts et plan d'actions hierarchise.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 2.1.3 — Certification aeroports par aerodrome (2021)
  // ──────────────────────────────────────────────
  {
    id: "certification-aeroports-aerodrome",
    title: "Certification des aeroports — Dossiers par aerodrome",
    client: "MLA (Aerodromes)",
    year: "2021",
    domain: "aeroports",
    description:
      "Preparation et redaction de dossiers de certification pour chaque aerodrome du reseau : documentation technique, declaration de conformite et soumission aupres de la DGAC pour obtention/maintien des certifications d'exploitation.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.3.4 — Pieces detachees Twin-Otter (2021)
  // ──────────────────────────────────────────────
  {
    id: "pieces-detachees-twin-otter",
    title: "Gestion des pieces detachees Twin-Otter reintegrees",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2021",
    domain: "aviation",
    description:
      "Inventaire detaille et gestion administrative des pieces detachees de l'aeronef Twin-Otter F-OIQF reintegrees en Polynesie francaise suite a un rapatriement, avec rapport d'inventaire et tracabilite complete.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.4.3 — TAC desserte inter-iles (2021)
  // ──────────────────────────────────────────────
  {
    id: "tac-desserte-inter-iles",
    title: "Mise en place desserte inter-iles — Documentation et conformite — Tahiti Air Charter",
    client: "Tahiti Air Charter (TAC)",
    year: "2021",
    domain: "documentation",
    description:
      "Mise en place operationnelle complete d'une nouvelle desserte inter-iles (Marquises) : redaction du Manuel d'Exploitation, MANEX, procedures operationnelles specifiques terrain, documentation de conformite DAC-Pf et lettres d'approbation.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.5.1 — Etude securite Marquises TAC (2021)
  // ──────────────────────────────────────────────
  {
    id: "etude-securite-marquises-tac",
    title: "Etude de securite — Exploitation inter-iles en archipel montagneux — Marquises",
    client: "Tahiti Air Charter (TAC)",
    year: "2021",
    domain: "securite",
    description:
      "Etude de securite specifique pour l'exploitation aerienne en terrain montagneux des Marquises : cartographie des risques terrain, facteurs meteorologiques, trajectoires de vol critiques, evaluation de l'acceptabilite securite et recommandations.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.5.2 — Continuite territoriale aerienne (2021)
  // ──────────────────────────────────────────────
  {
    id: "continuite-territoriale-aerienne",
    title: "Continuite territoriale aerienne interinsulaire — Cadre et propositions",
    client: "Ministere des Transports / MLA (Aerodromes)",
    year: "2021",
    domain: "securite",
    description:
      "Presentation du cadre reglementaire et strategique de la continuite territoriale aerienne pour les liaisons inter-iles, avec propositions de renforcement du dispositif d'aide publique et modeles economiques optimises.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 5.1.2 — MOZ ULM Moorea (2021)
  // ──────────────────────────────────────────────
  {
    id: "moz-ulm-moorea",
    title: "Installation d'une activite ULM — Dossier de presentation et conformite — MOZ ULM Moorea",
    client: "MOZ ULM Polynesie",
    year: "2021",
    domain: "etudes",
    description:
      "Assistance complete pour installation d'une base ULM a Moorea : redaction dossier de presentation, lettre de demande aupres de DAC-Pf, justification securite, conformite infrastructurelle et autorisations environnementales.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 2.1.1 — Diagnostic Aratika (2020)
  // ──────────────────────────────────────────────
  {
    id: "diagnostic-aratika",
    title: "Diagnostic et plans d'amelioration — Exploitation piste aeroport insulaire (Aratika)",
    client: "Dexios / Aratika",
    year: "2020",
    domain: "aeroports",
    description:
      "Audit operationnel approfondi de la plateforme aeroportuaire d'Aratika (sud) : analyse des infrastructures, aspects sol, capacites operationnelles, identification des vulnerabilites et recommandations de preconisations.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.2.3 — Vinci Airports candidature Faa'a (2020)
  // ──────────────────────────────────────────────
  {
    id: "vinci-airports-candidature",
    title: "Appui strategique candidature Vinci Airports — Concession Faa'a",
    client: "Vinci Airports",
    year: "2020",
    domain: "etudes",
    description:
      "Support complet de la candidature de Vinci Airports a la concession d'exploitation de Tahiti-Faa'a : production de 5 notes techniques (trafic, OSP, certification, surete, benchmarking international).",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.2.4 — Etudes thematiques Vinci Airports (2020)
  // ──────────────────────────────────────────────
  {
    id: "vinci-airports-etudes-thematiques",
    title: "Etudes thematiques complementaires — Developpement aeroportuaire — Vinci Airports",
    client: "Vinci Airports",
    year: "2020",
    domain: "etudes",
    description:
      "Etudes de support technique et commerciale pour la candidature Tahiti-Faa'a : travaux de maintenance aeroportuaire, regimes de taxation aeroportuaire et elements techniques pour appel d'offres.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.1.2 — Islands Airline structuration (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-structuration",
    title: "Structuration complete d'une compagnie regionale — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "aviation",
    description:
      "Accompagnement complet de la certification d'exploitation d'Islands Airline : redaction de 47 documents operationnels (MANEX A/B/C/D, MGN, MGS) et matrices de conformite pour obtention du CTA.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 1.4.1 — Certification documentation Islands Airline (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-documentation",
    title: "Certification et documentation operationnelle — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "documentation",
    description:
      "Redaction integrale de 47 documents operationnels pour certification d'exploitation : MANEX A (Politique generale), MANEX B (Procedures), MANEX C (Securite), MANEX D (Techniques), MGN, MGS et matrices de conformite reglementaire.",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 1.2.2 — Business plan Islands Airline (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-business-plan",
    title: "Business plan et modele economique — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "etudes",
    description:
      "Preparation strategique et financiere complete d'Islands Airline : modele economique detaille, programmes de vols, structure financiere et partenariats (notamment avec TASC pour la maintenance).",
    location: "Pacifique Sud",
  },
  // ──────────────────────────────────────────────
  // 1.2.1 — Optimisation helicopteres TNH (2019)
  // ──────────────────────────────────────────────
  {
    id: "optimisation-helicopteres-tnh",
    title: "Optimisation et securisation d'exploitations helicopteres en Polynesie",
    client: "Tahiti Nui Helicopters",
    year: "2019",
    domain: "aviation",
    description:
      "Analyse des operations helicopteres TNH sur deux bases (Pago/Bora Bora, Taravao) : identification complete des ecarts reglementaires et operationnels, propositions de solutions pour conformite EASA.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.3.1 — Audit organisationnel DAC-Pf (2019)
  // ──────────────────────────────────────────────
  {
    id: "audit-organisationnel-dac-pf",
    title: "Audit organisationnel — Direction de l'Aviation Civile de Polynesie francaise",
    client: "Ministere des Transports (DAC-Pf)",
    year: "2019",
    domain: "aviation",
    description:
      "Audit reglementaire et diagnostic organisationnel de la DAC-Pf : analyse des processus et de l'organisation, identification des axes de progres et proposition d'un plan d'actions pour accompagner l'evolution de la structure.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.3.2 — Audit Part-145 Part-M TASC (2019)
  // ──────────────────────────────────────────────
  {
    id: "audit-part145-partm-tasc",
    title: "Audit de conformite Part-145 et Part-M — TASC",
    client: "TASC (Tahiti Air Services Corporation)",
    year: "2019",
    domain: "aviation",
    description:
      "Audit complet de conformite au reglement Part-145 (maintenance d'aeronefs) et Part-M (proprietaire exploitant), conformement au reglement EASA 1321/2014.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.3.3 — Plan d'actions conformite TASC (2019)
  // ──────────────────────────────────────────────
  {
    id: "plan-actions-conformite-tasc",
    title: "Plan d'actions conformite — TASC",
    client: "TASC (Tahiti Air Services Corporation)",
    year: "2019",
    domain: "aviation",
    description:
      "Developpement et mise en place d'un plan d'actions complet pour la resolution des ecarts de conformite releves lors des audits menes par les autorites de l'aviation civile (2019-2021) : calendrier d'amelioration, responsabilites et suivi d'execution.",
    location: "Polynesie francaise",
  },
  // ──────────────────────────────────────────────
  // 1.1.1 — Tahiti Nui Helicopters (2017-2018)
  // ──────────────────────────────────────────────
  {
    id: "tahiti-nui-helicopters",
    title: "Creation et structuration de Tahiti Nui Helicopters",
    client: "Partenaires ATN / HBG",
    year: "2017-2018",
    domain: "aviation",
    description:
      "Conception et structuration completes de la nouvelle compagnie d'helicopteres Tahiti Nui Helicopters : etude des missions (transport passagers, evacuations sanitaires, travail aerien), choix des machines, organisation de la maintenance, modele economique et plan de demarrage.",
    location: "Polynesie francaise",
  },
];
