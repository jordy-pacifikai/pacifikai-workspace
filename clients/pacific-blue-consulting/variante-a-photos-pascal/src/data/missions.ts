export type GeoTerritory = "Polynesie francaise" | "Nouvelle-Caledonie" | "Pacifique Sud" | "Wallis et Futuna";

export const geoTerritoryLabels: Record<GeoTerritory, string> = {
  "Polynesie francaise": "Polynésie française",
  "Nouvelle-Caledonie": "Nouvelle-Calédonie",
  "Pacifique Sud": "Pacifique Sud",
  "Wallis et Futuna": "Wallis et Futuna",
};

export type Mission = {
  id: string;
  title: string;
  client: string;
  year: string;
  domain: Domain;
  description: string;
  location: GeoTerritory;
  benefit: string;
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
  aeroports: "Aéroports & Infrastructures",
  environnement: "Environnement & Biodiversité",
  etudes: "Études stratégiques",
  amo: "AMO & Pilotage",
  formation: "Formation & Management",
  documentation: "Documentation & Certification",
  securite: "Sécurité aérienne",
  drones: "Drones & Nouvelles technologies",
  artisanat: "Développement territorial & Artisanat",
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
    title: "Assistance au pilotage du projet TAVIVAT — Phase de réalisation",
    client: "Direction de l'Agriculture (DAG)",
    year: "2025-2030",
    domain: "amo",
    description:
      "Assistance opérationnelle et stratégique au pilotage de la phase de réalisation du projet TAVIVAT, démonstrateur territorial de transition agro-écologique vivrière et d'agro-transformation, incluant outils de planification, animation de coordination et rapports d'avancement.",
    location: "Polynesie francaise",
    benefit:
      "Pilotage fiabilisé d\'un programme multi‑acteurs d\'envergure, sécurisation des jalons techniques et financiers, meilleure cohérence entre partenaires et actions, et capacité accrue à atteindre les objectifs de souveraineté alimentaire et de valorisation des vivriers locaux à l\'échelle des 10 communes pilotes.",
  },
  // ──────────────────────────────────────────────
  // 5.1.4 — Etude de marche vivriers locaux (2025-2026)
  // ──────────────────────────────────────────────
  {
    id: "etude-marche-vivriers-dag",
    title: "Étude de marché des nouveaux produits alimentaires à base de vivriers locaux",
    client: "Direction de l'Agriculture (DAG)",
    year: "2025-2026",
    domain: "etudes",
    description:
      "Étude de marché complète pour de nouveaux produits alimentaires à base de vivriers locaux (taro, manioc, uru, patate douce, banane) dans le cadre du projet TAVIVAT, ciblant restauration scolaire, hôtellerie-restauration et grande distribution.",
    location: "Polynesie francaise",
    benefit:
      "Disposer d\'un dimensionnement fiable de la demande pour sécuriser les investissements d\'agro transformation, orienter les capacités de production et de conditionnement, et appuyer la montée en puissance de produits vivriers locaux dans la restauration scolaire et les autres marchés",
  },
  // ──────────────────────────────────────────────
  // 1.2.5 — Ligne Pacifique Sud (2025)
  // ──────────────────────────────────────────────
  {
    id: "ligne-pacifique-sud-seac",
    title: "Étude ligne aérienne Tahiti — Îles Cook — Tonga — Samoa — Fidji",
    client: "Service d'État de l'Aviation Civile en Polynésie française",
    year: "2025",
    domain: "etudes",
    description:
      "Étude de faisabilité pour l'ouverture et l'exploitation d'une ligne aérienne régionale reliant Tahiti aux Îles Cook, Tonga, Samoa et Fidji, visant une meilleure connectivité et intégration économique des États insulaires du Pacifique.",
    location: "Pacifique Sud",
    benefit:
      "Positionnement stratégique de la Polynésie renforcé, feuille de route pour connectivité régionale, viabilité économique démontrée.",
  },
  // ──────────────────────────────────────────────
  // 1.4.4 — RCO SSLIA (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "rco-sslia-dac-pf",
    title: "Création d'une nouvelle génération de RCO SSLIA",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Création d'une nouvelle génération de Recueils de Consignes Opérationnelles pour les pompiers d'aérodromes (SSLIA), avec concept innovant de document Master et base de données centralisée des procédures.",
    location: "Polynesie francaise",
    benefit:
      "Recueils modernes et modulaires, maintenance documentaire simplifiée, conformité opérationnelle maintenue, procédures à jour en continu.",
  },
  // ──────────────────────────────────────────────
  // 1.4.5 — Manuels AFIS (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-afis-dac-pf",
    title: "Création des Manuels d'Exploitation AFIS",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Création des Manuels d'Exploitation pour les services AFIS (Aerodrome Flight Information Service) avec concept Master et base de données des procédures d'information aéronautique, exploitables sur tous les aérodromes polynésiens.",
    location: "Polynesie francaise",
    benefit:
      "Manuels AFIS standardisés, cohérence informationnelle aéroportuaire améliorée, maintenance simplifiée, conformité opérationnelle continuée.",
  },
  // ──────────────────────────────────────────────
  // 1.4.6 — Manuels Maintenance electrotechniques (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-maintenance-electrotechniques-dac-pf",
    title: "Création des Manuels de Maintenance des assets électrotechniques",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Création de manuels techniques et de maintenance pour l'ensemble des assets électrotechniques gérés par la DAC-Pf (systèmes d'information, équipements aéroportuaires, transmissions), avec concept Master pour maintenance prédictive.",
    location: "Polynesie francaise",
    benefit:
      "Manuels de maintenance techniques standardisés, maintenance prédictive possible, interruptions réduites, disponibilité des systèmes améliorée, coûts d\'exploitation diminués.",
  },
  // ──────────────────────────────────────────────
  // 1.4.7 — Manuels UAV (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "manuels-exploitation-uav",
    title: "Réalisation de manuels d'exploitation UAV",
    client: "Opérateur privé / DGEE (Service audiovisuel)",
    year: "2024-2025",
    domain: "documentation",
    description:
      "Rédaction complète de manuels d'exploitation pour drones/UAV incluant procédures de vol, maintenance, consignes de sécurité, procédures d'urgence et conformité réglementaire française/européenne.",
    location: "Polynesie francaise",
    benefit:
      "Documentation UAV complète et conforme, opérateurs qualifiés et certifiés, exploitation sécurisée des drones, missions d\'imagerie aérienne professionnelles et réglementaires.",
  },
  // ──────────────────────────────────────────────
  // 1.5.3 — EISA DAC-Pf (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "eisa-dac-pf",
    title: "Études d'Impacts sur la Sécurité Aéroportuaire (EISA)",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "securite",
    description:
      "Réalisation d'études d'impacts sur la sécurité aéroportuaire pour diverses modifications opérationnelles ou infrastructurelles sur les plateformes aéroportuaires polynésiennes, avec cartographie des risques et recommandations d'atténuation.",
    location: "Polynesie francaise",
    benefit:
      "Impacts sécurité aéroportuaire identifiés en amont, risques minorés, modifications validées sécuritairement, conformité réglementaire maintenue.",
  },
  // ──────────────────────────────────────────────
  // 1.6.1 — Etude drones PF (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "etude-drones-polynesie",
    title: "Étude d'exploration des opportunités de déploiement des drones en Polynésie française",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Étude stratégique exploratoire sur les opportunités de déploiement des drones/UAV en Polynésie française : usages civils, cadre réglementaire européen applicable, enjeux sécurité aérienne, modèles économiques d'exploitation et recommandations de politique publique.",
    location: "Polynesie francaise",
    benefit:
      "Stratégie drone clarifiée, cadre réglementaire défini, opportunités commerciales identifiées, feuille de route gouvernementale pour le secteur UAV.",
  },
  // ──────────────────────────────────────────────
  // 1.6.2 — Outil modelisation desserte (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "outil-modelisation-desserte",
    title: "Outil de modélisation de la desserte en Polynésie française",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Développement d'un outil de simulation permettant de modéliser la desserte aérienne inter-îles en fonction de paramètres variables (flottes, capacités, fréquences, coûts, connectivité). Aide à la décision stratégique pour optimisation de la continuité territoriale.",
    location: "Polynesie francaise",
    benefit:
      "Outil de planification stratégique disponible, scénarios de desserte visualisables, decisions publiques aéronautiques mieux informées, résilience de la connectivité améliorée.",
  },
  // ──────────────────────────────────────────────
  // 1.6.3 — Imagerie aerienne telepilote (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "imagerie-aerienne-telepilote",
    title: "Missions d'imagerie aérienne par télépilote",
    client: "Pacific Blue Consulting (interne)",
    year: "2024-2025",
    domain: "drones",
    description:
      "Missions d'imagerie aérienne professionnelle avec matériel DJI pour clients institutionnels et privés : surveillance d'infrastructures aéroportuaires, cartographie, inspection et documentation visuelle, réalisées par le président de PBC, télépilote qualifié.",
    location: "Polynesie francaise",
    benefit:
      "Imagerie aérienne professionnelle et conforme, données visuelles d\'haute résolution, expertise en acquisition des donnés aériennes, rapports d\'inspection complets.",
  },
  // ──────────────────────────────────────────────
  // 2.2.1 — Schema amenagement Moorea/Huahine (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "schema-amenagement-moorea-huahine",
    title: "Schéma d'aménagement des aéroports de Moorea et Huahine",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Élaboration d'un schéma directeur d'aménagement aéroportuaire pour les plateformes insulaires de Moorea et Huahine : analyse des besoins, schémas d'évolution, priorités d'infrastructure et modèles d'exploitation.",
    location: "Polynesie francaise",
    benefit:
      "Schéma directeur aéroportuaire défini, investissements futurs priorisés, développement touristique cohérent, connectivité régionale planifiée.",
  },
  // ──────────────────────────────────────────────
  // 2.2.2 — Air Tetiaroa conformite piste (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "air-tetiaroa-conformite-piste",
    title: "Accompagnement à la levée des non-conformités de la piste de Tetiaroa",
    client: "Tahiti Beachcomber SA (Air Tetiaroa)",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Accompagnement stratégique pour résolution des écarts de conformité sur la piste d'atterrissage de Tetiaroa, incluant stratégie d'adaptation réglementaire, études de sécurité démonstratives et optimisation des investissements aéroportuaires.",
    location: "Polynesie francaise",
    benefit:
      "Écarts de conformité résorbés de manière économiquement viable, exploitations autorisées de manière pérenne, piste de Tetiaroa certifiée, activités touristiques aériennes pérennisées.",
  },
  // ──────────────────────────────────────────────
  // 3.1.3 — Actualisation EIE/NIE (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "actualisation-eie-nie",
    title: "Actualisation du dispositif d'évaluation environnementale (EIE – NIE)",
    client: "Direction de l'Environnement (DAE-Pf)",
    year: "2024-2025",
    domain: "environnement",
    description:
      "Actualisation complète du dispositif d'Études d'Impacts sur l'Environnement et Notices d'Impacts Environnementaux en Polynésie française : révision des critères, processus, harmonisation avec normes internationales et formation des évaluateurs.",
    location: "Polynesie francaise",
    benefit:
      "Dispositif EIE/NIE modernisé et harmonisé, évaluations environnementales d\'meilleure qualité, projets d\'infrastructure mieux informés, conformité environnementale facilitée.",
  },
  // ──────────────────────────────────────────────
  // 3.2.1 — Bilan carbone DAC-Pf (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "bilan-carbone-dac-pf",
    title: "Bilan carbone DAC-Pf et feuille de route décarbonation",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2024-2025",
    domain: "environnement",
    description:
      "Évaluation complète du bilan carbone institutionnel de la DAC-Pf et élaboration d'une feuille de route ambitieuse de décarbonation avec objectifs chiffrés, actions prioritaires et métriques de suivi.",
    location: "Polynesie francaise",
    benefit:
      "Bilan carbone DAC-Pf établi, engagement climatique affirmé institutionnellement, feuille de route décarbonation adoptée, crédibilité de l\'institution sur RSE renforcée.",
  },
  // ──────────────────────────────────────────────
  // 4.3.2 — Accompagnement creation entreprises (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "accompagnement-creation-entreprises",
    title: "Accompagnement à la création d'entreprises individuelles ou de sociétés",
    client: "Divers entrepreneurs / Service de Développement Économique",
    year: "2024-2025",
    domain: "formation",
    description:
      "Accompagnement global de porteurs de projets en création d'entreprise : faisabilité économique, montage juridique/fiscal, business plan, financement, immatriculation et coaching entrepreneurial intensif.",
    location: "Polynesie francaise",
    benefit:
      "Entrepreneurs outillés et confiants, entreprises créées sur fondations solides, taux de survie à 3 ans amélioré, structures juridiques optimisées, accès financement facilité.",
  },
  // ──────────────────────────────────────────────
  // 5.1.3 — Province Iles Loyaute DPA (2024-2029)
  // ──────────────────────────────────────────────
  {
    id: "province-iles-loyaute-ports-aeroports",
    title: "Appui stratégique intégré ports et aéroports — Îles Loyauté (DPA)",
    client: "Province des Îles Loyauté — Direction des Ports et Aéroports (DPA)",
    year: "2024-2029",
    domain: "amo",
    description:
      "Accompagnement pluriannuel de la DPA sur l'ensemble du spectre portuaire et aéroportuaire de la Province des Îles Loyauté : appui technique continu, analyses stratégiques, renforcement de compétences, schéma directeur insulaire des infrastructures et gouvernance partagée.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Vision intégrée des mobilités maritimes et aériennes, décisions d\'investissement mieux fondées et renforcement de la résilience de la connectivité insulaire au bénéfice des populations.",
  },
  // ──────────────────────────────────────────────
  // 6.1.1 — Sechoir a pandanus (2024-2025)
  // ──────────────────────────────────────────────
  {
    id: "sechoir-pandanus-artisanat",
    title: "Étude de faisabilité pour un séchoir à pandanus",
    client: "Service de l'Artisanat Traditionnel",
    year: "2024-2025",
    domain: "artisanat",
    description:
      "Étude de faisabilité technique, économique et organisationnelle pour la création d'une infrastructure mutualisée de séchage du pandanus destinée aux artisans traditionnels polynésiens : dimensionnement équipement, modèle économique et impact emplois artisanaux.",
    location: "Polynesie francaise",
    benefit:
      "Filière artisanale pandanus structurée, investissement public ciblé efficacement, emplois artisanaux locaux pérennisés, valorisation produits traditionnels augmentée, continuité de savoir-faire autochtone.",
  },
  // ──────────────────────────────────────────────
  // 1.1.3 — Air Bora Bora structuration (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "air-bora-bora-structuration",
    title: "Structuration d'une compagnie aérienne startup — Création Air Bora Bora",
    client: "Air Bora Bora",
    year: "2020-2023",
    domain: "aviation",
    description:
      "Création complète d'une compagnie aérienne startup : structuration juridique (SAS), immatriculation, business plan, stratégie commerciale et programme de vols (liaisons Moorea/atolls), gestion de projet et coordination calendrier lancement.",
    location: "Polynesie francaise",
    benefit:
      "Structure juridique et financière validée, stratégie commerciale crédible, projets menés à terme, lancement réussi avec partenariats établis.",
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
      "Assistance maîtrise d'ouvrage intégrale : pilotage global du projet de création de compagnie aérienne, coordination entre fondateurs/investisseurs/prestataires, gestion des risques, respect des calendriers et budgets.",
    location: "Polynesie francaise",
    benefit:
      "Projet mené à terme malgré complexité, calendrier et budgets respectés, risques anticipés et gérés, lancement compagnie réussi, opérations débutées conformément au plan.",
  },
  // ──────────────────────────────────────────────
  // 1.1.4 — Air Loyaute structuration (2019-2023)
  // ──────────────────────────────────────────────
  {
    id: "air-loyaute-modernisation",
    title: "Structuration et modernisation d'Air Loyauté",
    client: "Air Loyauté",
    year: "2019-2023",
    domain: "aviation",
    description:
      "Accompagnement pluriannuel d'Air Loyauté dans l'évolution de son organisation et de ses référentiels techniques et opérationnels : mise à jour des dossiers de conformité (CTA, Part-145, Part-M, Part-CAMO), renforcement du SGS, structuration RH et actualisation des procédures.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Compagnie alignée sur les exigences réglementaires en vigueur, processus internes consolidés, documentation et pratiques opérationnelles harmonisées, culture de sécurité renforcée au sein des équipes.",
  },
  // ──────────────────────────────────────────────
  // 1.3.5 — Dossiers conformite Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "conformite-certification-air-loyaute",
    title: "Dossiers conformité et certification — Audits internes et externes — Air Loyauté",
    client: "Air Loyauté",
    year: "2020-2023",
    domain: "aviation",
    description:
      "Gestion complète des dossiers de conformité et certification : CTA, Part-145, Part-M, Part-CAMO, Part-OPS. Préparation et accompagnement des audits internes et externes (autorités et auditeurs tiers).",
    location: "Nouvelle-Caledonie",
    benefit:
      "Certifications de transport aérien maintenues, audits réussis, conformité EASA démontrée en continu, opérations certifiées.",
  },
  // ──────────────────────────────────────────────
  // 1.3.6 — SGS Air Loyaute (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "sgs-air-loyaute",
    title: "Système de gestion de la sécurité (SGS) — Renforcement — Air Loyauté",
    client: "Air Loyauté",
    year: "2021-2023",
    domain: "securite",
    description:
      "Accompagnement dans le renforcement du SGS : consolidation des processus de retour d'expérience, animation des instances SGS (SAG, SRB), définition et suivi d'indicateurs de sécurité opérationnelle, soutien aux audits internes.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Dispositif SGS consolidé, culture de sécurité mieux partagée au sein des équipes et pilotage plus fin des enjeux de sécurité opérationnelle.",
  },
  // ──────────────────────────────────────────────
  // 1.4.2 — Procedures operationnelles Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "procedures-operationnelles-air-loyaute",
    title: "Procédures opérationnelles et gestion des opérations vol — Air Loyauté",
    client: "Air Loyauté",
    year: "2020-2023",
    domain: "documentation",
    description:
      "Rédaction et mise à jour continue des procédures opérationnelles complètes : procédures de vol normal et anormal, approches, procédures d'urgence, manuel de vol des équipages, procédures de maintenance en ligne et gestion des déroutements.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Équipages formés et calibrés, opérations standardisées, sécurité des vols optimisée, processus de gestion des incidents structurés.",
  },
  // ──────────────────────────────────────────────
  // 4.3.1 — Organisation RH Air Loyaute (2020-2023)
  // ──────────────────────────────────────────────
  {
    id: "organisation-rh-air-loyaute",
    title: "Organisation & fonction RH — Structuration et appui managérial — Air Loyauté",
    client: "Air Loyauté",
    year: "2020-2023",
    domain: "formation",
    description:
      "Accompagnement dans l'évolution de l'organisation interne et de la fonction RH : clarification des responsabilités, analyse des processus décisionnels, structuration des processus RH et appui à la mise en place d'outils de pilotage des effectifs.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Organisation plus lisible, fonctions RH mieux outillées, responsabilités mieux identifiées et contribution renforcée de la dimension managériale et RH au pilotage global de la compagnie.",
  },
  // ──────────────────────────────────────────────
  // 5.1.1 — DSP Wallis & Futuna Air Loyaute (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "dsp-wallis-futuna-air-loyaute",
    title: "Mise en place DSP Wallis & Futuna — Air Loyauté",
    client: "Air Loyauté",
    year: "2021-2023",
    domain: "etudes",
    description:
      "Assistance stratégique et opérationnelle pour la mise en place d'un Dispositif de Service Public Wallis & Futuna : stratégie opérationnelle, configuration flotte, définition procédures, contrats et accompagnement des premiers vols.",
    location: "Wallis et Futuna",
    benefit:
      "DSP Wallis & Futuna mis en place à terme, opérations robustes et sécurisées, continuité territoriale de Wallis & Futuna assurée, populations desservies régulièrement.",
  },
  // ──────────────────────────────────────────────
  // 2.3.1 — Terciel modele economique (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroports-marins-terciel",
    title: "Modèle économique pour société d'aéroports marins innovants — Terciel SAS",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Élaboration du modèle économique détaillé pour Terciel SAS : description des services, identification des segments clients, modèles de revenus (landing fees, services à l'aéronef, carburant), pricing et scénarios financiers.",
    location: "Pacifique Sud",
    benefit:
      "Modèle économique validé auprès d\'investisseurs, structure financière de l\'entreprise clarifié, viabilité économique démontrée, mise en place commerciale guidée.",
  },
  // ──────────────────────────────────────────────
  // 2.3.2 — Brochure Terciel (2022)
  // ──────────────────────────────────────────────
  {
    id: "brochure-terciel",
    title: "Brochure commerciale et présentation des produits aéroportuaires — Terciel",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Rédaction d'une brochure commerciale professionnelle présentant la proposition de valeur de Terciel : services innovants d'aéroports marins/flottants, avantages compétitifs, offre standard et vision stratégique.",
    location: "Pacifique Sud",
    benefit:
      "Outils commerciaux disponibles pour prospection, clients potentiels informés sur offre différenciée, positionnement market clarifié, démarche commerciale lancée.",
  },
  // ──────────────────────────────────────────────
  // 2.3.3 — Cahier des charges Terciel (2022)
  // ──────────────────────────────────────────────
  {
    id: "cahier-charges-terciel",
    title: "Cahier des charges — Aéroports marins et flottants — Terciel",
    client: "Terciel SAS",
    year: "2022",
    domain: "aeroports",
    description:
      "Rédaction d'un cahier des charges fonctionnel et technique pour la conception et construction de plateformes aéroportuaires marines et flottantes innovantes : spécifications techniques marines, normes de sécurité, capacités d'accueil.",
    location: "Pacifique Sud",
    benefit:
      "Cahier des charges précis pour mise en œuvre, spécifications techniques validées, contractualisation avec constructeurs facilitée, qualité des réalisations assurée.",
  },
  // ──────────────────────────────────────────────
  // 2.1.4 — Lifou Wanaham (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroport-lifou-wanaham",
    title: "Étude de faisabilité — Classification aéroport international de Lifou (Wanaham)",
    client: "Terciel / Lifou",
    year: "2022",
    domain: "aeroports",
    description:
      "Étude approfondie de faisabilité pour la classification de la plateforme de Lifou (Wanaham) comme aéroport international : analyse des contraintes techniques, réglementaires, commerciales, scénarios d'investissement et modèle économique.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Décideurs munis d\'analyse solide sur faisabilité, études ultérieures guidées, stratégie d\'investissement aéroportuaire validée, développement territorial envisageable.",
  },
  // ──────────────────────────────────────────────
  // 2.1.5 — Aeroport Hmelek Lifou (2022)
  // ──────────────────────────────────────────────
  {
    id: "aeroport-hmelek-lifou",
    title: "Étude de création d'un aéroport ouvert à la CAP — Hmelek, Lifou",
    client: "Province des Îles Loyauté / Lifou",
    year: "2022",
    domain: "aeroports",
    description:
      "Étude de faisabilité technique, réglementaire et socio-économique pour la création d'une plateforme aéroportuaire ouverte à la circulation aérienne publique (CAP) sur les terres de la tribu de Hmelek, incluant concertation locale et conformité foncière.",
    location: "Nouvelle-Caledonie",
    benefit:
      "Projet d\'infrastructure territoriale étudié complètement, acceptabilité locale confirmée, dossiers administratifs prêts, vision stratégique de développement structurée.",
  },
  // ──────────────────────────────────────────────
  // 4.2.1 — Centre Part-147 Air Formation (2022)
  // ──────────────────────────────────────────────
  {
    id: "centre-part147-air-formation",
    title: "Mise en place clés en main d'un centre Part-147 — Air Formation",
    client: "Air Formation",
    year: "2022",
    domain: "formation",
    description:
      "Création complète d'un centre de formation Part-147 agréé par l'EASA pour la formation en maintenance aéronautique : conception infrastructure, obtention agrément, organisation pédagogique, recrutement équipe et lancement formations.",
    location: "Pacifique Sud",
    benefit:
      "Centre Part-147 agréé opérationnel, filière de formation aéronautique locale établie, promos d\'étudiants certifiés, capacité technique régionale de maintenance renforcée.",
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
      "Processus complet de recrutement et qualification d'instructeurs Part-147 : sélection de profils, formations en ligne (e-learning), examens de qualification et agrément EASA comme instructeurs certifiés.",
    location: "Pacifique Sud",
    benefit:
      "Pool d\'instructeurs Part-147 qualifiés et agréés EASA, formations de qualité garantie, équipe pédagogique stable et professionnelle, reconnaissance EASA du centre confirmée.",
  },
  // ──────────────────────────────────────────────
  // 4.2.3 — Livrets MTOE Air Formation (2022)
  // ──────────────────────────────────────────────
  {
    id: "livrets-mtoe-air-formation",
    title: "Livrets et supports de formation aéronautique (MTOE) — Air Formation",
    client: "Air Formation",
    year: "2022",
    domain: "formation",
    description:
      "Rédaction complète de livrets et supports pédagogiques pour la formation aéronautique MTOE : contenus théoriques, études de cas, exercices pratiques et documentation conforme aux standards EASA.",
    location: "Pacifique Sud",
    benefit:
      "Étudiants munis de supports pédagogiques complets, formation reconnue, compétences de maintenance structurées, certifications EASA acquises à l\'issue.",
  },
  // ──────────────────────────────────────────────
  // 3.1.1 — Certification biodiversite (2021-2023)
  // ──────────────────────────────────────────────
  {
    id: "certification-biodiversite-deploiement",
    title: "Certification biodiversité — Développement, déploiement et promotion",
    client: "DIREN (Direction de l'Environnement)",
    year: "2021-2023",
    domain: "environnement",
    description:
      "Conception, mise en place et promotion du dispositif de certification 'Entreprise protégeant la biodiversité' en Polynésie française : élaboration des critères, processus de certification et animation d'ateliers auprès des compagnies aériennes.",
    location: "Polynesie francaise",
    benefit:
      "Dispositif de certification crédible et opérationnel, compagnies aériennes mieux informées et engagées, et valorisation des démarches environnementales auprès des clients et partenaires institutionnels.",
  },
  // ──────────────────────────────────────────────
  // 3.1.2 — Certification biodiversite analyse (2021)
  // ──────────────────────────────────────────────
  {
    id: "certification-biodiversite-analyse",
    title: "Certification biodiversité — Analyse et amélioration du processus",
    client: "DIREN (Direction de l'Environnement)",
    year: "2021",
    domain: "environnement",
    description:
      "Phase 3 du projet : analyse critique du processus de certification biodiversité, cartographie des risques de sécurité et de viabilité du programme, propositions d'amélioration pour robustesse, acceptabilité compagnies et viabilité financière.",
    location: "Polynesie francaise",
    benefit:
      "Processus de certification biodiversité robuste et pérenne, acceptabilité clients aériens améliorée, programme DIREN viable à long terme, impacts environnementaux réels démontrés.",
  },
  // ──────────────────────────────────────────────
  // 4.1.1 — Formations CNAM Club Managers (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formations-cnam-club-managers",
    title: "Missions de formation CNAM — Club des Managers",
    client: "CNAM (Conservatoire National des Arts et Métiers)",
    year: "2021-2022",
    domain: "formation",
    description:
      "Animation du Club des Managers du CNAM Polynésie française : sessions de travail collectif réunissant cadres publics et privés autour de thèmes de gestion de projet, conduite du changement, management stratégique et networking.",
    location: "Polynesie francaise",
    benefit:
      "Réseau de cadres renforcé, compétences managériales développées, réussite accrue aux concours d\'accès (grades supérieurs, maîtrises de gestion publique), cohésion réseau professionnel.",
  },
  // ──────────────────────────────────────────────
  // 4.1.2 — Ateliers codev CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "ateliers-codeveloppement-cnam",
    title: "Ateliers de codéveloppement — Club des Managers",
    client: "CNAM (Conservatoire National des Arts et Métiers)",
    year: "2021-2022",
    domain: "formation",
    description:
      "Animation de séances de codéveloppement professionnel réunissant des cadres autour de situations réelles de management, selon une méthode structurée d'intelligence collective avec alternance des rôles client/consultant.",
    location: "Polynesie francaise",
    benefit:
      "Prise de recul sur les pratiques managériales, solutions co‑construites et immédiatement actionnables, renforcement du soutien entre pairs et développement durable de la posture de manager‑coach",
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
      "Formation de cadres publics et privés à la gestion de projet : fondamentaux (périmètre, délais, ressources, budget), méthodes (Gantt, charge, risques), outils numériques et préparation à la Licence de Gestion de Projet CNAM.",
    location: "Polynesie francaise",
    benefit:
      "Cadres formés et certifiés en gestion de projet, projets institutionnels/privés mieux structurés et livrés, efficacité managériale augmentée, employabilité des participants renforcée.",
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
      "Formation à la conduite du changement organisationnel : diagnostic, modèles de transformation (Kotter, Lewin), communication du changement, gestion de la résistance et engagement collectif.",
    location: "Polynesie francaise",
    benefit:
      "Managers outillés pour conduire transformations organisationnelles, changements mieux acceptés et intégrés, risques de blocage réduits, transitions réussies au sein des organisations.",
  },
  // ──────────────────────────────────────────────
  // 4.1.5 — Formation Culture Generale CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "formation-culture-generale-cnam",
    title: "Formation Culture Générale, Économique et Managériale — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Formation à la culture générale économique, managériale et institutionnelle : contexte économique polynésien, principes de gestion publique, stratégie d'entreprise, tendances sectorielles et enjeux de gouvernance.",
    location: "Polynesie francaise",
    benefit:
      "Compréhension contexte économique/politique/managérial renforcée, culture générale solidifiée, vision stratégique élargie, préparation aux postes de responsabilité facilitée.",
  },
  // ──────────────────────────────────────────────
  // 4.1.6 — Tutoring Licence Management CNAM (2021-2022)
  // ──────────────────────────────────────────────
  {
    id: "tutoring-licence-management-cnam",
    title: "Tutoring — Préparation Licence Management — CNAM",
    client: "CNAM",
    year: "2021-2022",
    domain: "formation",
    description:
      "Accompagnement personnalisé (tutoring) d'étudiants CNAM dans leur préparation à la Licence de Gestion et Management : coaching individualisé, accompagnement mémoire, préparation examen et suivi insertion professionnelle.",
    location: "Polynesie francaise",
    benefit:
      "Apprenants accompagnés sur mesure, réussite à la Licence améliorée, insertion professionnelle facilitée, trajectoires de carrière accélérées.",
  },
  // ──────────────────────────────────────────────
  // 4.1.7 — Concours DGRH (2020-2022)
  // ──────────────────────────────────────────────
  {
    id: "concours-dgrh",
    title: "Concours DGRH — Élaboration de sujets et correction de copies",
    client: "CNAM / DGRH Polynésie française",
    year: "2020-2022",
    domain: "formation",
    description:
      "Élaboration de sujets d'épreuves d'admissibilité et correction des copies pour l'examen professionnel d'accès au grade d'ingénieur en chef (Lot 4 des concours DGRH), incluant production de sujets principaux et de secours.",
    location: "Polynesie francaise",
    benefit:
      "Sécurisation du déroulement des concours, sujets conformes au niveau attendu, corrections homogènes et traçables, bon déroulement des examens professionnels DGRH.",
  },
  // ──────────────────────────────────────────────
  // 2.1.2 — Diagnostic aerodromes polynesiens (2021)
  // ──────────────────────────────────────────────
  {
    id: "diagnostic-aerodromes-polynesiens",
    title: "Diagnostic de conformité du réseau d'aérodromes polynésiens",
    client: "MLA (Aérodromes)",
    year: "2021",
    domain: "aeroports",
    description:
      "Audit complet de conformité réglementaire pour l'ensemble du réseau d'aérodromes polynésiens gérés par MLA : analyse des constats d'autorité, identification des écarts et plan d'actions hiérarchisé.",
    location: "Polynesie francaise",
    benefit:
      "Vision d\'ensemble de la conformité du réseau, priorités d\'amélioration clarifiées, stratégie de conformité définie, dossiers d\'autorités structurés.",
  },
  // ──────────────────────────────────────────────
  // 2.1.3 — Certification aeroports par aerodrome (2021)
  // ──────────────────────────────────────────────
  {
    id: "certification-aeroports-aerodrome",
    title: "Certification des aéroports — Dossiers par aérodrome",
    client: "MLA (Aérodromes)",
    year: "2021",
    domain: "aeroports",
    description:
      "Préparation et rédaction de dossiers de certification pour chaque aérodrome du réseau : documentation technique, déclaration de conformité et soumission auprès de la DGAC pour obtention/maintien des certifications d'exploitation.",
    location: "Polynesie francaise",
    benefit:
      "Certifications aéroportuaires à jour pour toutes les plateformes, opérations régulières autorisées, conformité réglementaire continuée, risque de suspension réduit.",
  },
  // ──────────────────────────────────────────────
  // 1.3.4 — Pieces detachees Twin-Otter (2021)
  // ──────────────────────────────────────────────
  {
    id: "pieces-detachees-twin-otter",
    title: "Gestion des pièces détachées Twin-Otter réintégrées",
    client: "Direction de l'Aviation Civile (DAC-Pf)",
    year: "2021",
    domain: "aviation",
    description:
      "Inventaire détaillé et gestion administrative des pièces détachées de l'aéronef Twin-Otter F-OIQF réintégrées en Polynésie française suite à un rapatriement, avec rapport d'inventaire et traçabilité complète.",
    location: "Polynesie francaise",
    benefit:
      "Inventaire sécurisé et transparent, pièces restituées régulièrement, responsabilité financière clarifiée.",
  },
  // ──────────────────────────────────────────────
  // 1.4.3 — TAC desserte inter-iles (2021)
  // ──────────────────────────────────────────────
  {
    id: "tac-desserte-inter-iles",
    title: "Mise en place desserte inter-îles — Documentation et conformité — Tahiti Air Charter",
    client: "Tahiti Air Charter (TAC)",
    year: "2021",
    domain: "documentation",
    description:
      "Mise en place opérationnelle complète d'une nouvelle desserte inter-îles (Marquises) : rédaction du Manuel d'Exploitation, MANEX, procédures opérationnelles spécifiques terrain, documentation de conformité DAC-Pf et lettres d'approbation.",
    location: "Polynesie francaise",
    benefit:
      "Nouvelle desserte lancée conformément à la réglementation, liaisons inter-îles sécurisées, acceptabilité DAC-Pf obtenue, populations insulaires desservies.",
  },
  // ──────────────────────────────────────────────
  // 1.5.1 — Etude securite Marquises TAC (2021)
  // ──────────────────────────────────────────────
  {
    id: "etude-securite-marquises-tac",
    title: "Étude de sécurité — Exploitation inter-îles en archipel montagneux — Marquises",
    client: "Tahiti Air Charter (TAC)",
    year: "2021",
    domain: "securite",
    description:
      "Étude de sécurité spécifique pour l'exploitation aérienne en terrain montagneux des Marquises : cartographie des risques terrain, facteurs météorologiques, trajectoires de vol critiques, évaluation de l'acceptabilité sécurité et recommandations.",
    location: "Polynesie francaise",
    benefit:
      "Sécurité opérationnelle démontrée malgré terrain exigeant, acceptabilité DAC-Pf pour exploitation obtenue, opérations Marquises approuvées et sûres.",
  },
  // ──────────────────────────────────────────────
  // 1.5.2 — Continuite territoriale aerienne (2021)
  // ──────────────────────────────────────────────
  {
    id: "continuite-territoriale-aerienne",
    title: "Continuité territoriale aérienne interinsulaire — Cadre et propositions",
    client: "Ministère des Transports / MLA (Aérodromes)",
    year: "2021",
    domain: "securite",
    description:
      "Présentation du cadre réglementaire et stratégique de la continuité territoriale aérienne pour les liaisons inter-îles, avec propositions de renforcement du dispositif d'aide publique et modèles économiques optimisés.",
    location: "Polynesie francaise",
    benefit:
      "Cadre politique clarifié, propositions de continuité territoriale validées, allocation des aides optimisée, connectivité inter-îles renforcée.",
  },
  // ──────────────────────────────────────────────
  // 5.1.2 — MOZ ULM Moorea (2021)
  // ──────────────────────────────────────────────
  {
    id: "moz-ulm-moorea",
    title: "Installation d'une activité ULM — Dossier de présentation et conformité — MOZ ULM Moorea",
    client: "MOZ ULM Polynésie",
    year: "2021",
    domain: "amo",
    description:
      "Assistance complète pour installation d'une base ULM à Moorea : rédaction dossier de présentation, lettre de demande auprès de DAC-Pf, justification sécurité, conformité infrastructurelle et autorisations environnementales.",
    location: "Polynesie francaise",
    benefit:
      "Base ULM installée officiellement, activité lancée conformément à la réglementation, certifications obtenues, activités touristiques ULM pérennisées.",
  },
  // ──────────────────────────────────────────────
  // 2.1.1 — Diagnostic Aratika (2020)
  // ──────────────────────────────────────────────
  {
    id: "diagnostic-aratika",
    title: "Diagnostic et plans d'amélioration — Exploitation piste aéroport insulaire (Aratika)",
    client: "Dexios / Aratika",
    year: "2020",
    domain: "aeroports",
    description:
      "Audit opérationnel approfondi de la plateforme aéroportuaire d'Aratika (sud) : analyse des infrastructures, aspects sol, capacités opérationnelles, identification des vulnérabilités et recommandations de préconisations.",
    location: "Polynesie francaise",
    benefit:
      "Décision d\'exploitation fondée sur diagnostic solide, risques opérationnels identifiés, solutions d\'amélioration priorisées, investissements futurs orientés.",
  },
  // ──────────────────────────────────────────────
  // 1.2.3 — Vinci Airports candidature Faa'a (2020)
  // ──────────────────────────────────────────────
  {
    id: "vinci-airports-candidature",
    title: "Appui stratégique candidature Vinci Airports — Concession Faa'a",
    client: "Vinci Airports",
    year: "2020",
    domain: "etudes",
    description:
      "Support complet de la candidature de Vinci Airports à la concession d'exploitation de Tahiti-Faa'a : production de 5 notes techniques (trafic, OSP, certification, sûreté, benchmarking international).",
    location: "Polynesie francaise",
    benefit:
      "Candidature complète et hautement crédible, différenciation concurrentielle démontrée, dossier structuré pour la sélection gouvernementale.",
  },
  // ──────────────────────────────────────────────
  // 1.2.4 — Etudes thematiques Vinci Airports (2020)
  // ──────────────────────────────────────────────
  {
    id: "vinci-airports-etudes-thematiques",
    title: "Études thématiques complémentaires — Développement aéroportuaire — Vinci Airports",
    client: "Vinci Airports",
    year: "2020",
    domain: "etudes",
    description:
      "Études de support technique et commerciale pour la candidature Tahiti-Faa'a : travaux de maintenance aéroportuaire, régimes de taxation aéroportuaire et éléments techniques pour appel d'offres.",
    location: "Polynesie francaise",
    benefit:
      "Dossier de réponse à appel d\'offres renforcé, éléments techniques validés, dossier final compétitif.",
  },
  // ──────────────────────────────────────────────
  // 1.1.2 — Islands Airline structuration (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-structuration",
    title: "Structuration complète d'une compagnie régionale — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "documentation",
    description:
      "Accompagnement complet de la certification d'exploitation d'Islands Airline : rédaction de 47 documents opérationnels (MANEX A/B/C/D, MGN, MGS) et matrices de conformité pour obtention du CTA.",
    location: "Pacifique Sud",
    benefit:
      "CTA obtenu, opérations lancées sur bases solides, conformité réglementaire démontrée auprès de la DAC-Pf.",
  },
  // ──────────────────────────────────────────────
  // 1.4.1 — Certification documentation Islands Airline (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-documentation",
    title: "Certification et documentation opérationnelle — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "documentation",
    description:
      "Rédaction intégrale de 47 documents opérationnels pour certification d'exploitation : MANEX A (Politique générale), MANEX B (Procédures), MANEX C (Sécurité), MANEX D (Techniques), MGN, MGS et matrices de conformité réglementaire.",
    location: "Pacifique Sud",
    benefit:
      "Documentation opérationnelle complète et conforme, certification obtenue auprès de la DAC-Pf, opérations encadrées et sécurisées depuis le premier jour.",
  },
  // ──────────────────────────────────────────────
  // 1.2.2 — Business plan Islands Airline (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-business-plan",
    title: "Business plan et modèle économique — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "etudes",
    description:
      "Préparation stratégique et financière complète d'Islands Airline : modèle économique détaillé, programmes de vols, structure financière et partenariats (notamment avec TASC pour la maintenance).",
    location: "Pacifique Sud",
    benefit:
      "Stratégie commerciale validée par les investisseurs, financement sécurisé, lancement commercial crédible et calendrier réaliste.",
  },
  // ──────────────────────────────────────────────
  // 1.2.1 — Optimisation helicopteres TNH (2019)
  // ──────────────────────────────────────────────
  {
    id: "optimisation-helicopteres-tnh",
    title: "Optimisation et sécurisation d'exploitations hélicoptères en Polynésie",
    client: "Tahiti Nui Helicopters",
    year: "2019",
    domain: "aviation",
    description:
      "Analyse des opérations hélicoptères TNH sur deux bases (Pago/Bora Bora, Taravao) : identification complète des écarts réglementaires et opérationnels, propositions de solutions pour conformité EASA.",
    location: "Polynesie francaise",
    benefit:
      "Cadre d\'exploitation clarifié, conformité améliorée, continuité du service aérien préservée, risques opérationnels minimisés.",
  },
  // ──────────────────────────────────────────────
  // 1.3.1 — Audit organisationnel DAC-Pf (2019)
  // ──────────────────────────────────────────────
  {
    id: "audit-organisationnel-dac-pf",
    title: "Audit organisationnel — Direction de l'Aviation Civile de Polynésie française",
    client: "Ministère des Transports (DAC-Pf)",
    year: "2019",
    domain: "aviation",
    description:
      "Audit réglementaire et diagnostic organisationnel de la DAC-Pf : analyse des processus et de l'organisation, identification des axes de progrès et proposition d'un plan d'actions pour accompagner l'évolution de la structure.",
    location: "Polynesie francaise",
    benefit:
      "Vision consolidée de la situation de la DAC-Pf, feuille de route partagée pour les ajustements organisationnels et renforcement de la gouvernance interne.",
  },
  // ──────────────────────────────────────────────
  // 1.3.2 — Audit Part-145 Part-M TASC (2019)
  // ──────────────────────────────────────────────
  {
    id: "audit-part145-partm-tasc",
    title: "Audit de conformité Part-145 et Part-M — TASC",
    client: "TASC (Tahiti Air Services Corporation)",
    year: "2019",
    domain: "aviation",
    description:
      "Audit complet de conformité au règlement Part-145 (maintenance d'aéronefs) et Part-M (propriétaire exploitant), conformément au règlement EASA 1321/2014.",
    location: "Polynesie francaise",
    benefit:
      "Conformité réglementaire démontrée, opérations de maintenance sécurisées, risques de non-conformité maîtrisés, certifications à jour.",
  },
  // ──────────────────────────────────────────────
  // 1.3.3 — Plan d'actions conformite TASC (2019)
  // ──────────────────────────────────────────────
  {
    id: "plan-actions-conformite-tasc",
    title: "Plan d'actions conformité — TASC",
    client: "TASC (Tahiti Air Services Corporation)",
    year: "2019",
    domain: "aviation",
    description:
      "Développement et mise en place d'un plan d'actions complet pour la résolution des écarts de conformité relevés lors des audits menés par les autorités de l'aviation civile (2019-2021) : calendrier d'amélioration, responsabilités et suivi d'exécution.",
    location: "Polynesie francaise",
    benefit:
      "Écarts de conformité résorbés, certifications maintenues, relation avec autorités améliorée, continuité opérationnelle garantie.",
  },
  // ──────────────────────────────────────────────
  // 1.1.1 — Tahiti Nui Helicopters (2017-2018)
  // ──────────────────────────────────────────────
  {
    id: "tahiti-nui-helicopters",
    title: "Création et structuration de Tahiti Nui Helicopters",
    client: "Partenaires ATN / HBG",
    year: "2017-2018",
    domain: "aviation",
    description:
      "Conception et structuration complètes de la nouvelle compagnie d'hélicoptères Tahiti Nui Helicopters : étude des missions (transport passagers, évacuations sanitaires, travail aérien), choix des machines, organisation de la maintenance, modèle économique et plan de démarrage.",
    location: "Polynesie francaise",
    benefit:
      "Mise en place d\'un opérateur hélicoptère structuré et viable, capable de répondre aux besoins de transport, de tourisme et d\'évacuation sanitaire sur un territoire très dispersé, tout en optimisant les investissements, la mutualisation des moyens et la complémentarité avec les autres acteurs aériens.",
  },
  // ──────────────────────────────────────────────
  // Nouveaux clients CDC v3
  // ──────────────────────────────────────────────
  {
    id: "commune-moorea-route-aeroport",
    title: "Étude route aéroport Temae",
    client: "Commune de Moorea",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Étude de la route d'accès à l'aéroport de Temae à Moorea, incluant l'analyse des flux, la sécurité routière et l'intégration avec le schéma d'aménagement aéroportuaire.",
    location: "Polynesie francaise",
    benefit:
      "Amélioration de l'accessibilité et de la sécurité de l'aéroport de Moorea, meilleure fluidité des flux passagers et fret.",
  },
  {
    id: "eisa-etik-adt",
    title: "EISA pour Etik Pf / Air Tahiti",
    client: "Etik Pf / Air Tahiti",
    year: "2024-2025",
    domain: "securite",
    description:
      "Réalisation d'études d'impact sur la sécurité aéroportuaire (EISA) pour les travaux menés par Etik Pf et Air Tahiti sur les plateformes polynésiennes.",
    location: "Polynesie francaise",
    benefit:
      "Travaux aéroportuaires sécurisés, conformité aux exigences nationales et européennes, risques résiduels maîtrisés.",
  },
  {
    id: "formation-hsf",
    title: "Formation gestion de projet",
    client: "HSF",
    year: "2024-2025",
    domain: "formation",
    description:
      "Formation en gestion de projet pour les équipes de HSF, incluant méthodologie, outils de planification et suivi, et conduite du changement.",
    location: "Polynesie francaise",
    benefit:
      "Équipes formées et autonomes en gestion de projet, meilleure exécution des projets internes.",
  },
  {
    id: "ias-accompagnement",
    title: "Accompagnement opérationnel IAS",
    client: "IAS",
    year: "2024-2025",
    domain: "aviation",
    description:
      "Accompagnement opérationnel de la compagnie aérienne IAS, incluant conformité réglementaire et appui à l'exploitation.",
    location: "Polynesie francaise",
    benefit:
      "Opérations conformes et sécurisées, continuité d'exploitation assurée.",
  },
  {
    id: "kroma-prod-imagerie",
    title: "Imagerie aérienne professionnelle",
    client: "Kroma Prod",
    year: "2024-2025",
    domain: "drones",
    description:
      "Missions d'imagerie aérienne professionnelle par drone pour Kroma Prod, incluant captation vidéo et photo aérienne haute résolution.",
    location: "Polynesie francaise",
    benefit:
      "Contenus visuels aériens de qualité professionnelle pour productions audiovisuelles.",
  },
  {
    id: "commune-hiva-oa",
    title: "Accompagnement projet infrastructure",
    client: "Commune de Hiva Oa",
    year: "2024-2025",
    domain: "aeroports",
    description:
      "Accompagnement de la Commune de Hiva Oa sur ses projets d'infrastructure aéroportuaire aux Marquises.",
    location: "Polynesie francaise",
    benefit:
      "Infrastructure adaptée aux contraintes marquisiennes, meilleure desserte de l'île.",
  },
];
