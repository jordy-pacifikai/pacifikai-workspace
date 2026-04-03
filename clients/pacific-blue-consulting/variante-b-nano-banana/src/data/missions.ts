export type Mission = {
  id: string;
  title: string;
  client: string;
  year: string;
  domain: Domain;
  description: string;
  location: string;
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
    benefit:
      "Pilotage fiabilisé d\'un programme multi‑acteurs d\'envergure, sécurisation des jalons techniques et financiers, meilleure cohérence entre partenaires et actions, et capacité accrue à atteindre les objectifs de souveraineté alimentaire et de valorisation des vivriers locaux à l\'échelle des 10 communes pilotes.",
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
    benefit:
      "Disposer d\'un dimensionnement fiable de la demande pour sécuriser les investissements d\'agro transformation, orienter les capacités de production et de conditionnement, et appuyer la montée en puissance de produits vivriers locaux dans la restauration scolaire et les autres marchés",
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
    benefit:
      "Positionnement stratégique de la Polynésie renforcé, feuille de route pour connectivité régionale, viabilité économique démontrée.",
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
    benefit:
      "Recueils modernes et modulaires, maintenance documentaire simplifiée, conformité opérationnelle maintenue, procédures à jour en continu.",
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
    benefit:
      "Manuels AFIS standardisés, cohérence informationnelle aéroportuaire améliorée, maintenance simplifiée, conformité opérationnelle continuée.",
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
    benefit:
      "Manuels de maintenance techniques standardisés, maintenance prédictive possible, interruptions réduites, disponibilité des systèmes améliorée, coûts d\'exploitation diminués.",
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
    benefit:
      "Documentation UAV complète et conforme, opérateurs qualifiés et certifiés, exploitation sécurisée des drones, missions d\'imagerie aérienne professionnelles et réglementaires.",
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
    benefit:
      "Impacts sécurité aéroportuaire identifiés en amont, risques minorés, modifications validées sécuritairement, conformité réglementaire maintenue.",
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
    benefit:
      "Stratégie drone clarifiée, cadre réglementaire défini, opportunités commerciales identifiées, feuille de route gouvernementale pour le secteur UAV.",
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
    benefit:
      "Outil de planification stratégique disponible, scénarios de desserte visualisables, decisions publiques aéronautiques mieux informées, résilience de la connectivité améliorée.",
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
    benefit:
      "Imagerie aérienne professionnelle et conforme, données visuelles d\'haute résolution, expertise en acquisition des donnés aériennes, rapports d\'inspection complets.",
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
    benefit:
      "Schéma directeur aéroportuaire défini, investissements futurs priorisés, développement touristique cohérent, connectivité régionale planifiée.",
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
    benefit:
      "Ecarts de conformité résorbés de manière économiquement viable, exploitations autorisées de manière pérenne, piste de Tetiaroa certifiée, activités touristiques aériennes pérennisées.",
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
    benefit:
      "Dispositif EIE/NIE modernisé et harmonisé, évaluations environnementales d\'meilleure qualité, projets d\'infrastructure mieux informés, conformité environnementale facilitée.",
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
    benefit:
      "Bilan carbone DAC-Pf établi, engagement climatique affirmé institutionnellement, feuille de route décarbonation adoptée, crédibilité de l\'institution sur RSE renforcée.",
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
    benefit:
      "Entrepreneurs outillés et confiants, entreprises créées sur fondations solides, taux de survie à 3 ans amélioré, structures juridiques optimisées, accès financement facilité.",
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
    benefit:
      "Vision intégrée des mobilités maritimes et aériennes, décisions d\'investissement mieux fondées et renforcement de la résilience de la connectivité insulaire au bénéfice des populations.",
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
    benefit:
      "Filière artisanale pandanus structurée, investissement public ciblé efficacement, emplois artisanaux locaux pérennisés, valorisation produits traditionnels augmentée, continuité de savoir-faire autochtone.",
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
      "Assistance maitrise d'ouvrage integrale : pilotage global du projet de creation de compagnie aerienne, coordination entre fondateurs/investisseurs/prestataires, gestion des risques, respect des calendriers et budgets.",
    location: "Polynesie francaise",
    benefit:
      "Projet mené à terme malgré complexité, calendrier et budgets respectés, risques anticipés et gérés, lancement compagnie réussi, opérations débutées conformément au plan.",
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
    benefit:
      "Compagnie alignée sur les exigences réglementaires en vigueur, processus internes consolidés, documentation et pratiques opérationnelles harmonisées, culture de sécurité renforcée au sein des équipes.",
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
    benefit:
      "Certifications de transport aérien maintenues, audits réussis, conformité EASA démontrée en continu, opérations certifiées.",
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
    benefit:
      "Dispositif SGS consolidé, culture de sécurité mieux partagée au sein des équipes et pilotage plus fin des enjeux de sécurité opérationnelle.",
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
    benefit:
      "Équipages formés et calibrés, opérations standardisées, sécurité des vols optimisée, processus de gestion des incidents structurés.",
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
    benefit:
      "Organisation plus lisible, fonctions RH mieux outillées, responsabilités mieux identifiées et contribution renforcée de la dimension managériale et RH au pilotage global de la compagnie.",
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
    benefit:
      "DSP Wallis & Futuna mis en place à terme, opérations robustes et sécurisées, continuité territoriale de Wallis & Futuna assurée, populations desservies régulièrement.",
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
    benefit:
      "Modèle économique validé auprès d\'investisseurs, structure financière de l\'entreprise clarifié, viabilité économique démontrée, mise en place commerciale guidée.",
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
    benefit:
      "Outils commerciaux disponibles pour prospection, clients potentiels informés sur offre différenciée, positionnement market clarifié, démarche commerciale lancée.",
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
    benefit:
      "Cahier des charges précis pour mise en œuvre, spécifications techniques validées, contractualisation avec constructeurs facilitée, qualité des réalisations assurée.",
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
    benefit:
      "Décideurs munis d\'analyse solide sur faisabilité, études ultérieures guidées, stratégie d\'investissement aéroportuaire validée, développement territorial envisageable.",
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
    benefit:
      "Projet d\'infrastructure territoriale étudié complètement, acceptabilité locale confirmée, dossiers administratifs prêts, vision stratégique de développement structurée.",
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
      "Processus complet de recrutement et qualification d'instructeurs Part-147 : selection de profils, formations en ligne (e-learning), examens de qualification et agrement EASA comme instructeurs certifies.",
    location: "Pacifique Sud",
    benefit:
      "Pool d\'instructeurs Part-147 qualifiés et agréés EASA, formations de qualité garantie, équipe pédagogique stable et professionnelle, reconnaissance EASA du centre confirmée.",
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
    benefit:
      "Étudiants munis de supports pédagogiques complets, formation reconnue, compétences de maintenance structurées, certifications EASA acquises à l\'issue.",
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
    benefit:
      "Dispositif de certification crédible et opérationnel, compagnies aériennes mieux informées et engagées, et valorisation des démarches environnementales auprès des clients et partenaires institutionnels.",
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
    benefit:
      "Processus de certification biodiversité robuste et pérenne, acceptabilité clients aériens améliorée, programme DIREN viable à long terme, impacts environnementaux réels démontrés.",
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
    benefit:
      "Réseau de cadres renforcé, compétences managériales développées, réussite accrue aux concours d\'accès (grades supérieurs, maîtrises de gestion publique), cohésion réseau professionnel.",
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
      "Formation de cadres publics et prives a la gestion de projet : fondamentaux (perimetre, delais, ressources, budget), methodes (Gantt, charge, risques), outils numeriques et preparation a la Licence de Gestion de Projet CNAM.",
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
      "Formation a la conduite du changement organisationnel : diagnostic, modeles de transformation (Kotter, Lewin), communication du changement, gestion de la resistance et engagement collectif.",
    location: "Polynesie francaise",
    benefit:
      "Managers outillés pour conduire transformations organisationnelles, changements mieux acceptés et intégrés, risques de blocage réduits, transitions réussies au sein des organisations.",
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
    benefit:
      "Compréhension contexte économique/politique/managérial renforcée, culture générale solidifiée, vision stratégique élargie, préparation aux postes de responsabilité facilitée.",
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
    benefit:
      "Apprenants accompagnés sur mesure, réussite à la Licence améliorée, insertion professionnelle facilitée, trajectoires de carrière accélérées.",
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
    benefit:
      "Sécurisation du déroulement des concours, sujets conformes au niveau attendu, corrections homogènes et traçables, bon déroulement des examens professionnels DGRH.",
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
    benefit:
      "Vision d\'ensemble de la conformité du réseau, priorités d\'amélioration clarifiées, stratégie de conformité définie, dossiers d\'autorités structurés.",
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
    benefit:
      "Certifications aéroportuaires à jour pour toutes les plateformes, opérations régulières autorisées, conformité réglementaire continuée, risque de suspension réduit.",
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
    benefit:
      "Inventaire sécurisé et transparent, pièces restituées régulièrement, responsabilité financière clarifiée.",
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
    benefit:
      "Nouvelle desserte lancée conformément à la réglementation, liaisons inter-îles sécurisées, acceptabilité DAC-Pf obtenue, populations insulaires desservies.",
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
    benefit:
      "Sécurité opérationnelle démontrée malgré terrain exigeant, acceptabilité DAC-Pf pour exploitation obtenue, opérations Marquises approuvées et sûres.",
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
    benefit:
      "Cadre politique clarifié, propositions de continuité territoriale validées, allocation des aides optimisée, connectivité inter-îles renforcée.",
  },
  // ──────────────────────────────────────────────
  // 5.1.2 — MOZ ULM Moorea (2021)
  // ──────────────────────────────────────────────
  {
    id: "moz-ulm-moorea",
    title: "Installation d'une activite ULM — Dossier de presentation et conformite — MOZ ULM Moorea",
    client: "MOZ ULM Polynesie",
    year: "2021",
    domain: "amo",
    description:
      "Assistance complete pour installation d'une base ULM a Moorea : redaction dossier de presentation, lettre de demande aupres de DAC-Pf, justification securite, conformite infrastructurelle et autorisations environnementales.",
    location: "Polynesie francaise",
    benefit:
      "Base ULM installée officiellement, activité lancée conformément à la réglementation, certifications obtenues, activités touristiques ULM pérennisées.",
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
    benefit:
      "Décision d\'exploitation fondée sur diagnostic solide, risques opérationnels identifiés, solutions d\'amélioration priorisées, investissements futurs orientés.",
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
    benefit:
      "Candidature complète et hautement crédible, différenciation concurrentielle démontrée, dossier structuré pour la sélection gouvernementale.",
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
    benefit:
      "Dossier de réponse à appel d\'offres renforcé, éléments techniques validés, dossier final compétitif.",
  },
  // ──────────────────────────────────────────────
  // 1.1.2 — Islands Airline structuration (2019)
  // ──────────────────────────────────────────────
  {
    id: "islands-airline-structuration",
    title: "Structuration complete d'une compagnie regionale — Islands Airline",
    client: "Islands Airline",
    year: "2019",
    domain: "documentation",
    description:
      "Accompagnement complet de la certification d'exploitation d'Islands Airline : redaction de 47 documents operationnels (MANEX A/B/C/D, MGN, MGS) et matrices de conformite pour obtention du CTA.",
    location: "Pacifique Sud",
    benefit:
      "CTA obtenu, opérations lancées sur bases solides, conformité réglementaire démontrée auprès de la DAC-Pf.",
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
    benefit:
      "Documentation opérationnelle complète et conforme, certification obtenue auprès de la DAC-Pf, opérations encadrées et sécurisées depuis le premier jour.",
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
    benefit:
      "Stratégie commerciale validée par les investisseurs, financement sécurisé, lancement commercial crédible et calendrier réaliste.",
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
    benefit:
      "Cadre d\'exploitation clarifié, conformité améliorée, continuité du service aérien préservée, risques opérationnels minimisés.",
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
    benefit:
      "Vision consolidée de la situation de la DAC-Pf, feuille de route partagée pour les ajustements organisationnels et renforcement de la gouvernance interne.",
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
    benefit:
      "Conformité réglementaire démontrée, opérations de maintenance sécurisées, risques de non-conformité maîtrisés, certifications à jour.",
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
    benefit:
      "Écarts de conformité résorbés, certifications maintenues, relation avec autorités améliorée, continuité opérationnelle garantie.",
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
    benefit:
      "Mise en place d\'un opérateur hélicoptère structuré et viable, capable de répondre aux besoins de transport, de tourisme et d\'évacuation sanitaire sur un territoire très dispersé, tout en optimisant les investissements, la mutualisation des moyens et la complémentarité avec les autres acteurs aériens.",
  },
];
