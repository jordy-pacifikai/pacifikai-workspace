"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";

/**
 * SourceTracer — activated via ?sources in URL
 * Scans the ENTIRE DOM (header, main, footer) and auto-injects
 * data-source attributes by matching text content.
 */

type SourceEntry = {
  match: string;
  type: "catalogue" | "flyer" | "editorial" | "derived";
  source: string;
  quote: string;
  /** Optional: only match on specific pages */
  page?: string;
};

// ============================================================
// SOURCE MAP — every text element mapped to its source
// ============================================================
const SOURCE_MAP: SourceEntry[] = [
  // ─── NAVIGATION / MENUS ───
  { match: "Pacific Blue", type: "catalogue", source: "Catalogue des Missions, page de couverture", quote: "Pacific Blue Consulting — Cabinet de conseil indépendant basé en Polynésie française" },
  { match: "Accueil", type: "editorial", source: "Structure éditoriale du site", quote: "Page d'accueil synthétisant les chiffres clés (45+ missions, 4 territoires) et les 18 partenaires issus du Catalogue des Missions" },
  { match: "Expertise", type: "catalogue", source: "Catalogue, chapitre 7 'Synthèse par famille d'offre' (pp. 33-35)", quote: "Le catalogue documente 8 expertises distinctes : Études & Stratégie, Audits & Conformité, Documentation & Certification, Formation & Concours, AMO & Projets, Création / Structuration, Gestion de la Sécurité, Organisation & Management" },
  { match: "Références", type: "catalogue", source: "Catalogue, chapitres 1 à 6 (pp. 8-32) — 61 fiches missions", quote: "61 missions détaillées avec client, année, domaine, description et bénéfice client. Chaque fiche constitue une référence factuelle du cabinet" },
  { match: "À propos", type: "catalogue", source: "Catalogue, Introduction (pp. 5-7) + Conclusion (p. 36)", quote: "Introduction du catalogue : biographie de Pascal Bazer-Bachi, présentation du cabinet, identité visuelle (coquillage/spirale), mentions légales SAS" },
  { match: "Contact", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "Coordonnées du cabinet : contact@pacificblueconsulting.org / +689-87-747-284 / PK 17,900 Côté Mer, Punaauia" },
  { match: "Nous contacter", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "Adresse email, téléphone et localisation extraits des mentions légales du catalogue" },
  // Dropdown submenu items
  { match: "Aviation civile", type: "catalogue", source: "Catalogue, chapitre 1 'Opérations et Compagnies aériennes' (pp. 8-18)", quote: "28 missions aviation documentées : structuration compagnies (TNH, Islands Airline, Air Bora Bora, Air Loyauté), études stratégiques, audits conformité, documentation opérationnelle, sécurité, drones" },
  { match: "Compagnies aériennes", type: "catalogue", source: "Catalogue, section 1.1 'Structuration de compagnies' (pp. 8-9)", quote: "4 compagnies structurées : Tahiti Nui Helicopters (2017-18), Islands Airline (2019), Air Bora Bora (2020-23), Air Loyauté (2019-23)" },
  { match: "Aéroports", type: "catalogue", source: "Catalogue, chapitre 2 'Aéroports et Infrastructures' (pp. 19-22)", quote: "Aratika, réseau d'aérodromes polynésiens, Lifou (Wanaham), Hmelek, schémas Moorea/Huahine, Air Tetiaroa, aéroports marins Terciel" },
  { match: "Aéroports & Infrastructures", type: "catalogue", source: "Catalogue, chapitre 2 'Aéroports et Infrastructures' (pp. 19-22)", quote: "Diagnostics pistes, conformité réseau, certification aérodromes, schémas aménagement Moorea/Huahine, faisabilité Lifou, aéroports marins Terciel" },
  { match: "Environnement", type: "catalogue", source: "Catalogue, chapitre 3 'Environnement & Biodiversité' (pp. 23-24)", quote: "4 missions : certification biodiversité (3 sous-missions : déploiement, analyse, amélioration — sections 3.1.1-3.1.3), bilan carbone DAC-Pf et feuille de route décarbonation (section 3.2.1)" },
  { match: "Biodiversité", type: "catalogue", source: "Catalogue, section 3.1 (p. 23)", quote: "Certification biodiversité — Développement, déploiement et promotion du dispositif en Polynésie française" },
  { match: "bilan carbone", type: "catalogue", source: "Catalogue, section 3.2 (p. 24)", quote: "Évaluation du bilan carbone de la DAC-Pf et élaboration d'une feuille de route pour la décarbonation" },
  { match: "Études stratégiques", type: "catalogue", source: "Catalogue, chapitre 5 'Études, Stratégie & AMO' (pp. 29-31)", quote: "DSP Wallis & Futuna, ULM Moorea, Province des Iles Loyauté (DPA), étude de marché vivriers locaux (DAG), AMO Air Bora Bora, pilotage TAVIVAT" },
  { match: "Outil de modélisation de la desserte", type: "catalogue", source: "Catalogue, section 1.6.2 (p. 18)", quote: "Outil de modélisation de la desserte en Polynésie française — création d'un modèle pour la DAC-Pf" },
  { match: "AMO & Pilotage", type: "catalogue", source: "Catalogue, section 5.2 'Assistance à maîtrise d'ouvrage' (p. 31)", quote: "AMO globale pour projet Air Bora Bora + Assistance au pilotage du projet TAVIVAT pour la DAG" },
  { match: "Projets complexes", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Le cabinet intervient sur l'ensemble du cycle de vie des projets : études stratégiques, AMO, modélisation économique, mise en conformité réglementaire..." },
  { match: "Formation", type: "catalogue", source: "Catalogue, chapitre 4 'Formation & Management' (pp. 25-28)", quote: "10 missions : Club des Managers CNAM, gestion de projet, conduite du changement, Part-147 Air Formation, tutoring licence, concours DGRH, création d'entreprises" },
  { match: "Management", type: "catalogue", source: "Catalogue, section 4.3 'Organisation, RH et accompagnement' (p. 28)", quote: "Organisation & fonction RH Air Loyauté, accompagnement à la création d'entreprises, coaching" },
  { match: "Missions aviation", type: "catalogue", source: "Catalogue, chapitre 1 (pp. 8-18)", quote: "28 missions détaillées couvrant structuration, études, audits, documentation, sécurité et drones" },
  { match: "Missions environnement", type: "catalogue", source: "Catalogue, chapitre 3 (pp. 23-24)", quote: "Certification biodiversité (3 missions), EIE/NIE DIREN, bilan carbone et décarbonation DAC-Pf" },
  { match: "Missions AMO", type: "catalogue", source: "Catalogue, chapitre 5 (pp. 29-31)", quote: "DSP W&F, ULM Moorea, Province Iles Loyauté, marché vivriers DAG, AMO Air Bora Bora, TAVIVAT" },
  { match: "Toutes les références", type: "catalogue", source: "Catalogue des Missions, chapitres 1 à 6 (pp. 8-32)", quote: "61 fiches missions structurées par domaine, chacune avec client, année, description détaillée et bénéfice client" },

  // ─── HOMEPAGE ───
  { match: "Cabinet de conseil indépendant", type: "flyer", source: "Flyer PBC, page 1, bandeau supérieur", quote: "Pacific Blue Consulting — Cabinet de conseil indépendant" },
  { match: "Votre boussole dans un monde complexe", type: "flyer", source: "Flyer PBC, page 1, slogan principal sous le logo", quote: "Votre boussole dans un monde complexe — slogan figurant sur le flyer officiel du cabinet" },
  { match: "Plus de 60 missions réalisées en Polynésie", type: "catalogue", source: "Catalogue, table des matières + comptage des 61 fiches", quote: "61 missions individuelles documentées dans le catalogue, réparties dans 6 chapitres couvrant aviation, aéroports, environnement, formation, études/AMO et artisanat" },
  { match: "Conseil en stratégie, aéronautique", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting est un cabinet de conseil indépendant [...] dans les secteurs du transport, des infrastructures, de l'énergie, de l'environnement et des services publics" },
  { match: "Missions réalisées", type: "catalogue", source: "Catalogue, comptage des fiches missions (pp. 8-32)", quote: "61 fiches missions individuelles documentées dans le Catalogue des Missions PBC" },
  { match: "Domaines d'expertise", type: "catalogue", source: "Catalogue, chapitre 7 'Synthèse par famille d'offre' (pp. 33-35)", quote: "8 familles d'expertise : Études & Stratégie, Audits & Conformité, Documentation & Certification, Formation & Concours, AMO & Projets, Création / Structuration, Gestion de la Sécurité, Organisation & Management" },
  { match: "Territoires couverts", type: "catalogue", source: "Catalogue, localisation des 61 missions", quote: "4 territoires documentés : Polynésie française (siège, majorité des missions), Nouvelle-Calédonie (Air Loyauté, Lifou, DPA), Wallis & Futuna (DSP), Pacifique Sud (liaison régionale Iles Cook/Tonga/Samoa/Fidji)" },
  { match: "Cabinet de conseil indépendant", type: "catalogue", source: "Catalogue, mentions légales (p. 7) + Flyer page 1", quote: "Cabinet de conseil indépendant — statut SAS, capital initial de 200 000 FCFP (mentions légales catalogue)" },
  { match: "Sur mesure", type: "editorial", source: "Rédaction éditoriale inspirée du Catalogue, Introduction (p. 5)", quote: "Synthèse éditoriale de la phrase du catalogue : 'une compréhension fine des réalités insulaires et des contextes multipartenaires'" },
  { match: "Innovation", type: "catalogue", source: "Catalogue, section 1.6 'Drones, modélisation et nouvelles technologies' (p. 18) + section 2.3 'Aéroports marins' (p. 22)", quote: "Drones/UAV en Polynésie, outil de modélisation de la desserte, missions d'imagerie aérienne par télépilote, aéroports marins innovants Terciel" },
  { match: "Conformité EASA", type: "catalogue", source: "Catalogue, sections 1.3.2 à 1.3.5 (pp. 12-13)", quote: "Audit de conformité Part-145 et Part-M (TASC), dossiers conformité et certification Air Loyauté, mise à jour CTA, Part-145, Part-M, Part-CAMO" },
  { match: "manuels MANEX", type: "catalogue", source: "Catalogue, section 1.4.1 (p. 14)", quote: "Certification et documentation opérationnelle Islands Airline — 47 documents opérationnels (MANEX A/B/C/D, MGN, MGS) et matrices de conformité pour CTA" },
  { match: "Drones et imagerie aérienne", type: "catalogue", source: "Catalogue, section 1.6 (p. 18)", quote: "Exploration des opportunités de déploiement des drones en PF, outil de modélisation de la desserte, missions d'imagerie aérienne par télépilote" },
  { match: "Une expertise multisectorielle", type: "editorial", source: "Rédaction éditoriale basée sur le Catalogue, chapitre 7 (pp. 33-35)", quote: "Titre éditorial reflétant les 8 expertises transversales documentées dans la synthèse du catalogue" },
  { match: "De l'aviation civile à l'environnement", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "...dans les secteurs du transport, des infrastructures, de l'énergie, de l'environnement et des services publics" },
  { match: "Depuis 2017, Pacific Blue Consulting accompagne", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting est un cabinet de conseil indépendant [...] qui accompagne les acteurs publics et privés dans leurs projets de transformation, d'investissement et de structuration" },
  { match: "Un partenaire de confiance", type: "editorial", source: "Rédaction éditoriale basée sur les relations pluriannuelles du Catalogue", quote: "Air Loyauté accompagnée de 2019 à 2023 (7+ missions), CNAM (5 formations), DAC-Pf (10+ missions sur toute la période)" },
  // Partners
  { match: "Air Loyauté", type: "catalogue", source: "Catalogue, sections 1.1.4, 1.3.5-1.3.6, 1.4.2, 4.3.1 (pp. 9, 13-14, 28)", quote: "7+ missions : structuration/modernisation (2019-23), audits Part-145/M, dossiers conformité CTA, SGS, procédures opérationnelles, organisation RH" },
  { match: "Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10)", quote: "Appui stratégique à une candidature de concession aéroportuaire majeure — Tahiti-Faa'a pour Vinci Airports (2020)" },
  { match: "Aviation Civile (DAC-PF)", type: "catalogue", source: "Catalogue, sections 1.3.1, 1.4.4-1.4.6, 1.5.3, 1.6.2, 2.2.1, 3.2.1 (pp. 12-24)", quote: "10+ missions : audit réglementaire, SSLIA nouvelle génération, manuels AFIS, maintenance électrotechnique, EISA, modélisation desserte, schémas aménagement, bilan carbone" },
  { match: "CNAM", type: "catalogue", source: "Catalogue, sections 4.1.1 à 4.1.6 (pp. 25-26)", quote: "Club des Managers, gestion de projet, conduite du changement, culture générale économique et managériale, tutoring licence management" },
  { match: "DIREN", type: "catalogue", source: "Catalogue, section 3.1.3 (p. 23)", quote: "Direction de l'Environnement — Actualisation du dispositif d'évaluation environnementale (EIE/NIE) en Polynésie française" },
  { match: "Terciel", type: "catalogue", source: "Catalogue, sections 2.3.1 à 2.3.3 (p. 22)", quote: "3 missions Terciel SAS : modèle économique aéroports marins, brochure commerciale, cahier des charges aéroports marins et flottants" },
  { match: "Province des Iles Loyauté", type: "catalogue", source: "Catalogue, section 5.1.3 (p. 29)", quote: "Province des Iles Loyauté — Appui stratégique intégré ports et aéroports (DPA), convention pluriannuelle" },
  { match: "Air Bora Bora", type: "catalogue", source: "Catalogue, sections 1.1.3 et 5.2.1 (pp. 9, 31)", quote: "Création compagnie startup (2020-23) : structuration juridique SAS, business plan, stratégie commerciale, programme de vols + AMO globale" },
  { match: "Islands Airline", type: "catalogue", source: "Catalogue, sections 1.1.2 et 1.2.2 (pp. 8, 10)", quote: "Structuration complète (2019) : 47 documents opérationnels (MANEX A/B/C/D, MGN, MGS), CTA obtenu + business plan et modèle économique" },
  { match: "Tahiti Air Charter", type: "catalogue", source: "Catalogue, sections 1.4.3 et 1.5.1 (pp. 14, 17)", quote: "Mise en place desserte inter-iles Marquises — documentation conformité + étude de sécurité exploitation en archipel montagneux" },
  { match: "TASC", type: "catalogue", source: "Catalogue, section 1.3.2 (p. 12)", quote: "Audit de conformité Part-145 et Part-M — Exploitant maintenance TASC" },
  { match: "Air Formation", type: "catalogue", source: "Catalogue, sections 4.2.1 à 4.2.3 (p. 27)", quote: "3 missions : mise en place centre Part-147 clés en main (infrastructure + agrément), recrutement/qualification instructeurs, livrets et supports de formation MTOE" },
  { match: "Tahiti Beachcomber", type: "catalogue", source: "Catalogue, section 2.2.2 (p. 21)", quote: "Tahiti Beachcomber SA — Air Tetiaroa : Accompagnement à la levée des non-conformités de la piste de Tetiaroa" },
  { match: "Direction de l'Agriculture", type: "catalogue", source: "Catalogue, sections 5.1.4 et 5.2.2 (pp. 30-31)", quote: "Étude de marché des nouveaux produits alimentaires à base de vivriers locaux (projet TAVIVAT) + assistance au pilotage de la phase de réalisation" },
  { match: "Aérodromes", type: "catalogue", source: "Catalogue, sections 2.1.1 à 2.1.5 (pp. 19-20)", quote: "Diagnostic piste Aratika, diagnostic conformité réseau polynésien, certification par aérodrome, faisabilité Lifou (Wanaham), création aéroport Hmelek" },
  { match: "Ministère des Transports", type: "catalogue", source: "Catalogue, section 1.5.2 (p. 17)", quote: "Continuité territoriale aérienne interinsulaire — cadre et propositions" },
  { match: "Service de l'Artisanat", type: "catalogue", source: "Catalogue, chapitre 6, section 6.1.1 (p. 32)", quote: "Étude de faisabilité pour un séchoir à pandanus — Service de l'Artisanat Traditionnel" },
  { match: "MOZ ULM", type: "catalogue", source: "Catalogue, section 5.1.2 (p. 29)", quote: "Installation d'une activité ULM — Dossier de présentation et conformité — MOZ ULM Moorea" },

  // ─── A PROPOS ───
  { match: "Un cabinet né de l'expérience", type: "editorial", source: "Rédaction éditoriale inspirée du Catalogue, Introduction (p. 5)", quote: "Titre éditorial basé sur le parcours documenté de Pascal Bazer-Bachi : 30+ ans d'expérience, création de multiples organisations" },
  { match: "accompagne les acteurs publics et privés dans leurs projets de transformation", type: "catalogue", source: "Catalogue, Introduction (p. 5), 1er paragraphe", quote: "Pacific Blue Consulting est un cabinet de conseil indépendant [...] qui accompagne les acteurs publics et privés dans leurs projets de transformation, d'investissement et de structuration" },
  { match: "transport, des infrastructures, de l'énergie, de l'environnement", type: "catalogue", source: "Catalogue, Introduction (p. 5), 1er paragraphe", quote: "...en particulier dans les secteurs du transport, des infrastructures, de l'énergie, de l'environnement et des services publics" },
  { match: "plus de trente années d'expérience", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "Pacific Blue Consulting s'appuie sur plus de trente années d'expérience de direction et de pilotage de systèmes complexes, en Europe et dans le Pacifique" },
  { match: "aviation civile, les systèmes satellitaires", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "Pascal a exercé des responsabilités de premier plan dans l'aviation civile, les systèmes satellitaires, la régulation, l'exploitation d'aéroports" },
  { match: "en Europe et dans le Pacifique", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "...plus de trente années d'expérience [...] en Europe et dans le Pacifique" },
  { match: "fonctions de haut niveau", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (après Conclusion)", quote: "Il a occupé des fonctions de haut niveau dans l'administration et au sein d'opérateurs techniques" },
  { match: "créer plusieurs structures de conseil", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (après Conclusion)", quote: "...avant de créer plusieurs structures de conseil et d'ingénierie" },
  { match: "Chevalier de l'Ordre National du Mérite", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (après Conclusion)", quote: "Chevalier de l'Ordre National du Mérite — reconnaissance de l'engagement au service de l'intérêt général" },
  { match: "intérêt général", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (après Conclusion)", quote: "Engagement reconnu au service de l'intérêt général et de la modernisation des organisations publiques et privées" },
  { match: "Coach professionnel et executive coach", type: "catalogue", source: "Catalogue, section 'Ce que PBC apporte à vos équipes' (après Conclusion)", quote: "Coach professionnel et executive coach accrédité — accompagnement de dirigeants, cadres et porteurs de projets" },
  { match: "gestion des risques industriels", type: "catalogue", source: "Catalogue, section 'L'ADN du fondateur' (après Conclusion)", quote: "Formé au management, à la gestion des risques industriels et au coaching professionnel" },
  // Timeline
  { match: "Fondation de Pacific Blue Consulting", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Fondé en 2017 par Pascal BAZER-BACHI" },
  { match: "Tahiti Nui Helicopters", type: "catalogue", source: "Catalogue, section 1.1.1 (p. 8) — Client: Partenaires ATN, 2017-2018", quote: "Conception et structuration complètes de la nouvelle compagnie d'hélicoptères Tahiti Nui Helicopters, à partir d'une analyse stratégique détaillée du redéploiement de l'activité hélicoptère en Polynésie française" },
  { match: "modernisation d'Air Loyauté", type: "catalogue", source: "Catalogue, section 1.1.4 (p. 9) — Client: Air Loyauté, 2019-2023", quote: "Accompagnement pluriannuel d'Air Loyauté, compagnie régionale de Nouvelle-Calédonie, dans l'évolution de son organisation et de ses référentiels techniques et opérationnels" },
  { match: "candidature Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10) — 2020", quote: "Appui stratégique à une candidature de concession aéroportuaire majeure — Tahiti-Faa'a pour Vinci Airports" },
  { match: "Desserte inter-iles Marquises", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14) — Client: Tahiti Air Charter", quote: "Mise en place desserte inter-iles — Documentation et conformité — Tahiti Air Charter aux Marquises" },
  { match: "Part-147", type: "catalogue", source: "Catalogue, section 4.2.1 (p. 27) — Client: Air Formation", quote: "Mise en place clés en main d'un centre Part-147 — infrastructure et agrément — Air Formation" },
  { match: "aéroports de Moorea et Huahine", type: "catalogue", source: "Catalogue, section 2.2.1 (p. 21) — Client: DAC-Pf", quote: "Élaboration d'un schéma d'aménagement des plateformes aéroportuaires de Moorea et Huahine pour la DAC-Pf" },
  { match: "Bilan carbone", type: "catalogue", source: "Catalogue, section 3.2.1 (p. 24) — Client: DAC-Pf", quote: "Évaluation du bilan carbone de la DAC-Pf et élaboration d'une feuille de route pour la décarbonation" },
  { match: "aéroports marins", type: "catalogue", source: "Catalogue, section 2.3 (p. 22) — Client: Terciel SAS", quote: "Modèle économique, brochure commerciale et cahier des charges pour aéroports marins innovants et flottants" },
  { match: "liaison aérienne régionale", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Marché d'étude — Ligne aérienne Tahiti – Iles Cook – Tonga – Samoa – Fidji" },
  { match: "Iles Cook", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Ligne aérienne Tahiti – Iles Cook – Tonga – Samoa – Fidji" },
  // Values
  { match: "Plus de 30 missions réalisées dans le secteur aérien", type: "catalogue", source: "Catalogue, chapitres 1 et 2 (pp. 8-22) — comptage", quote: "30+ missions dans les domaines aviation et aéroports : structuration compagnies, audits, documentation, sécurité, drones, schémas aménagement" },
  { match: "certification biodiversité", type: "catalogue", source: "Catalogue, section 3.1 (p. 23)", quote: "Certification biodiversité — Développement, déploiement et promotion du dispositif de certification en Polynésie française" },
  // Territories
  { match: "Polynésie française", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "Siège social : PK 17,900 CÔTÉ MER — PUNAAUIA — POLYNÉSIE FRANÇAISE. Majorité des 61 missions réalisées sur ce territoire" },
  { match: "Nouvelle-Calédonie", type: "catalogue", source: "Catalogue, sections 1.1.4, 1.3.5-1.3.6, 5.1.3 (pp. 9, 13, 29)", quote: "Air Loyauté (Nouméa, 2019-2023), étude faisabilité Lifou (Wanaham/Hmelek), Province des Iles Loyauté (DPA, appui stratégique ports et aéroports)" },
  { match: "Wallis et Futuna", type: "catalogue", source: "Catalogue, section 5.1.1 (p. 29) — Client: Air Loyauté", quote: "Mise en place DSP Wallis & Futuna — Assistance stratégique et opérationnelle" },
  { match: "Pacifique Sud", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Marché d'étude — Ligne aérienne Tahiti – Iles Cook – Tonga – Samoa – Fidji, étude de faisabilité d'une liaison régionale" },
  // Legal
  { match: "SAS au capital de 200 000 FCFP", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "PACIFIC BLUE CONSULTING est une Société par Actions Simplifiée, au capital initial de 200 000 FCFP" },
  { match: "PK 17,900", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "Adresse du siège social : PK 17,900 CÔTÉ MER — PUNAAUIA — POLYNÉSIE FRANÇAISE" },
  { match: "G28823", type: "catalogue", source: "Catalogue, mentions légales (p. 7)", quote: "Numéro Tahiti : G28823" },
  // Logo symbolique
  { match: "coquillage stylisé", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "L'identité visuelle de Pacific Blue Consulting prolonge cette vision : elle naît d'un coquillage stylisé dont la spirale s'ouvre et s'agrandit à mesure qu'elle se déploie" },

  // ─── EXPERTISE (data from expertise.ts) ───
  { match: "Études & Stratégie", type: "catalogue", source: "Catalogue, synthèse expertise 1 (p. 33) + sections 1.2, 5.1", quote: "Faisabilité, modélisation économique, études de marché, schémas directeurs, positionnement stratégique, stratégies de concession, liaisons aériennes régionales, décarbonation et drones" },
  { match: "Audits & Conformité", type: "catalogue", source: "Catalogue, synthèse expertise 2 (p. 33) + section 1.3 (pp. 12-13)", quote: "Audits réglementaires aviation civile, conformité Part-145/Part-M (maintenance), plans d'actions conformité, certification aérodromes, Part-OPS, Part-CAMO, EIE/NIE" },
  { match: "Documentation & Certification", type: "catalogue", source: "Catalogue, synthèse expertise 3 (p. 34) + section 1.4 (pp. 14-16)", quote: "MANEX (47 docs Islands Airline), procédures opérationnelles, RCO SSLIA, manuels AFIS, maintenance électrotechnique, manuels UAV, cahiers des charges, matrices de conformité, MEL" },
  { match: "Formation & Concours", type: "catalogue", source: "Catalogue, synthèse expertise 4 (p. 34) + chapitre 4 (pp. 25-28)", quote: "Management et conduite du changement, gestion de projet, codéveloppement, tutoring, centres Part-147 agréés, instructeurs, supports MTOE, concours DGRH, création d'entreprises" },
  { match: "AMO & Projets", type: "catalogue", source: "Catalogue, synthèse expertise 5 (p. 34) + section 5.2 (p. 31)", quote: "Cadrage et planification, coordination multi-acteurs, suivi des risques, candidatures concessions, pilotage projets hélicoptères, dessertes inter-iles, schémas aménagement, DSP, appui stratégique intégré" },
  { match: "Création / Structuration", type: "catalogue", source: "Catalogue, synthèse expertise 6 (p. 34) + section 1.1 (pp. 8-9)", quote: "TNH, Islands Airline, Air Bora Bora, Air Loyauté — création compagnies, centres de formation agréés, modèles économiques innovants, CTA, organisations opérationnelles" },
  { match: "Gestion de la Sécurité", type: "catalogue", source: "Catalogue, synthèse expertise 7 (p. 35) + section 1.5 (p. 17)", quote: "SGS Air Loyauté, sécurité exploitation Marquises (TAC), continuité territoriale aérienne, EISA pour la DAC-Pf, démonstration de conformité autorités" },
  { match: "Organisation & Management", type: "catalogue", source: "Catalogue, synthèse expertise 8 (p. 35) + section 4.3 (p. 28)", quote: "Diagnostics organisationnels, structuration fonction RH (Air Loyauté), optimisation processus, plans d'actions management, coaching professionnel et executive coaching" },
  { match: "Analyses de faisabilité", type: "catalogue", source: "Catalogue, synthèse Études (p. 33)", quote: "Analyses de faisabilité technico-économique" },
  { match: "Modélisation économique et business plans", type: "catalogue", source: "Catalogue, synthèse Études (p. 33)", quote: "Modélisation économique et business plans" },
  { match: "Création et structuration de Tahiti Nui Helicopters", type: "catalogue", source: "Catalogue, section 1.1.1 (p. 8) — Partenaires ATN, 2017-2018", quote: "Conception et structuration complètes de la nouvelle compagnie d'hélicoptères TNH : analyse stratégique, choix des machines, bases, maintenance, modèle économique, gouvernance, plan de démarrage" },
  { match: "Stratégie de concession pour Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10) — 2020", quote: "Appui stratégique à une candidature de concession aéroportuaire majeure — Tahiti-Faa'a" },
  { match: "MANEX et documentation d'Islands Airline", type: "catalogue", source: "Catalogue, section 1.4.1 (p. 14) — Islands Airline, 2019", quote: "47 documents opérationnels : MANEX A/B/C/D, MGN, MGS, matrices de conformité pour obtention du CTA" },
  { match: "Audit réglementaire DAC-Pf", type: "catalogue", source: "Catalogue, section 1.3.1 (p. 12)", quote: "Audit organisationnel — Direction de l'Aviation Civile de Polynésie française" },
  { match: "Diagnostic et certification du réseau", type: "catalogue", source: "Catalogue, sections 2.1.2-2.1.3 (p. 19)", quote: "Diagnostic de conformité du réseau d'aérodromes polynésiens + certification des aéroports par aérodrome" },
  { match: "Programmes CNAM", type: "catalogue", source: "Catalogue, section 4.1.1 (p. 25)", quote: "Missions de formation CNAM — Club des Managers" },
  { match: "Renforcement du SGS", type: "catalogue", source: "Catalogue, section 1.3.6 (p. 13) — Air Loyauté", quote: "Système de gestion de la sécurité (SGS) — Renforcement et accompagnement — Air Loyauté" },
  { match: "EIE/NIE pour la DIREN", type: "catalogue", source: "Catalogue, section 3.1.3 (p. 23)", quote: "Direction de l'Environnement — Actualisation du dispositif d'évaluation environnementale (EIE/NIE) en Polynésie française" },
  { match: "DSP Wallis", type: "catalogue", source: "Catalogue, section 5.1.1 (p. 29) — Air Loyauté", quote: "Mise en place DSP Wallis & Futuna — Assistance stratégique et opérationnelle" },

  // ─── EXPERTISE PAGE — hero + descriptions ───
  { match: "Fort de plus de 30 ans d'expérience", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "plus de trente années d'expérience de direction et de pilotage de systèmes complexes dans l'aviation civile" },
  { match: "Des compétences au service de vos ambitions", type: "editorial", source: "Rédaction éditoriale", quote: "Titre éditorial pour la page Expertise" },
  { match: "palette d'expertises complémentaires", type: "catalogue", source: "Catalogue, chapitre 7 'Synthèse par famille d'offre' (pp. 33-35)", quote: "8 domaines d'expertise documentés couvrant la chaîne complète : études, audits, documentation, formation, AMO, création, sécurité, management" },
  { match: "Nos interventions", type: "catalogue", source: "Catalogue, listes de détails par expertise", quote: "Chaque expertise liste ses types d'intervention dans le catalogue" },
  { match: "Exemples de missions", type: "catalogue", source: "Catalogue, exemples par expertise", quote: "Chaque expertise liste ses missions réalisées dans le catalogue" },
  { match: "Discuter de votre projet", type: "editorial", source: "Rédaction éditoriale", quote: "CTA éditorial" },
  { match: "Vous avez un projet en tête", type: "editorial", source: "Rédaction éditoriale", quote: "CTA de fin de page éditorial" },
  { match: "Expertise en analyse de faisabilité", type: "catalogue", source: "Catalogue, expertise Études & Stratégie, description", quote: "Expertise en analyse de faisabilité, modélisation économique, études de marché..." },
  { match: "Réalisation d'audits complets", type: "catalogue", source: "Catalogue, expertise Audits & Conformité, description", quote: "Réalisation d'audits complets et d'appuis à la mise en conformité des activités aériennes..." },
  { match: "Rédaction et structuration de manuels", type: "catalogue", source: "Catalogue, expertise Documentation & Certification, description", quote: "Rédaction et structuration de manuels, procédures, matrices de conformité..." },
  { match: "Conception et animation de formations", type: "catalogue", source: "Catalogue, expertise Formation & Concours, description", quote: "Conception et animation de formations managériales et techniques..." },
  { match: "Assistance à maîtrise d'ouvrage", type: "catalogue", source: "Catalogue, expertise AMO & Projets, description", quote: "Assistance à maîtrise d'ouvrage pour des projets complexes : cadrage, planification, coordination..." },
  { match: "Appui à la création ou à la structuration", type: "catalogue", source: "Catalogue, expertise Création / Structuration, description", quote: "Appui à la création ou à la structuration d'entités : compagnies aériennes, centres de formation..." },
  { match: "Renforcement des dispositifs de gestion", type: "catalogue", source: "Catalogue, expertise Gestion de la Sécurité, description", quote: "Renforcement des dispositifs de gestion de la sécurité : SGS, cartographie des risques..." },
  { match: "Diagnostics organisationnels", type: "catalogue", source: "Catalogue, expertise Organisation & Management, description", quote: "Diagnostics organisationnels, structuration de fonctions clés, optimisation de processus..." },
  // Expertise details (from expertise.ts)
  { match: "Études de marché sectorielles", type: "catalogue", source: "Catalogue, Études details", quote: "Études de marché sectorielles" },
  { match: "Schémas directeurs aéroportuaires", type: "catalogue", source: "Catalogue, Études details", quote: "Schémas directeurs aéroportuaires et territoriaux" },
  { match: "Stratégies de concession", type: "catalogue", source: "Catalogue, Études details", quote: "Stratégies de concession et candidatures" },
  { match: "Études de liaisons aériennes régionales", type: "catalogue", source: "Catalogue, Études details", quote: "Études de liaisons aériennes régionales" },
  { match: "Stratégies de décarbonation et drones", type: "catalogue", source: "Catalogue, synthèse Études (p. 33)", quote: "Travaux sur la décarbonation et les drones (stratégie UAV, bilan carbone, feuille de route)" },
  { match: "Outils de modélisation de la desserte", type: "catalogue", source: "Catalogue, synthèse Études (p. 33)", quote: "Outil de modélisation de la desserte pour la DAC-Pf" },
  { match: "Accompagnement stratégique pluriannuel", type: "catalogue", source: "Catalogue, Études details + mission DPA", quote: "Accompagnement stratégique pluriannuel de la Province des Iles Loyauté" },
  { match: "Audits réglementaires des autorités", type: "catalogue", source: "Catalogue, Audits details", quote: "Audits réglementaires des autorités de l'aviation civile" },
  { match: "Audits de conformité Part-145", type: "catalogue", source: "Catalogue, Audits details", quote: "Audits de conformité Part-145 et Part-M (maintenance)" },
  { match: "Manuels d'exploitation (MANEX)", type: "catalogue", source: "Catalogue, Documentation details", quote: "Manuels d'exploitation (MANEX) et documentation opérationnelle" },
  { match: "Recueils SSLIA", type: "catalogue", source: "Catalogue, Documentation details", quote: "Recueils SSLIA et manuels AFIS" },
  { match: "Manuels d'exploitation UAV", type: "catalogue", source: "Catalogue, Documentation details", quote: "Manuels d'exploitation UAV" },
  { match: "Formation au management", type: "catalogue", source: "Catalogue, Formation details", quote: "Formation au management et conduite du changement" },
  { match: "Ateliers de codéveloppement", type: "catalogue", source: "Catalogue, Formation details", quote: "Ateliers de codéveloppement" },
  { match: "Tutoring individuel", type: "catalogue", source: "Catalogue, Formation details", quote: "Tutoring individuel et préparation diplômes" },
  { match: "Création de centres de formation", type: "catalogue", source: "Catalogue, Formation details", quote: "Création de centres de formation aéronautique agréés (Part-147)" },
  { match: "Élaboration de sujets et correction", type: "catalogue", source: "Catalogue, Formation details", quote: "Élaboration de sujets et correction de concours professionnels" },
  { match: "Cadrage et planification", type: "catalogue", source: "Catalogue, AMO details", quote: "Cadrage et planification de projets complexes" },
  { match: "Coordination multi-acteurs", type: "catalogue", source: "Catalogue, AMO details", quote: "Coordination multi-acteurs et parties prenantes" },
  { match: "Pilotage de projets hélicoptères", type: "catalogue", source: "Catalogue, AMO details", quote: "Pilotage de projets hélicoptères et redéploiement" },
  { match: "Accompagnement DSP", type: "catalogue", source: "Catalogue, AMO details", quote: "Accompagnement DSP (Délégation de Service Public)" },
  { match: "Création et structuration de compagnies", type: "catalogue", source: "Catalogue, Création details", quote: "Création et structuration de compagnies aériennes" },
  { match: "Obtention du Certificat de Transport", type: "catalogue", source: "Catalogue, Création details", quote: "Obtention du Certificat de Transport Aérien (CTA)" },
  { match: "Systèmes de Gestion de la Sécurité", type: "catalogue", source: "Catalogue, Sécurité details", quote: "Systèmes de Gestion de la Sécurité (SGS)" },
  { match: "Cartographie et analyse des risques", type: "catalogue", source: "Catalogue, Sécurité details", quote: "Cartographie et analyse des risques opérationnels" },
  { match: "Études d'Impacts sur la Sécurité", type: "catalogue", source: "Catalogue, Sécurité details", quote: "Études d'Impacts sur la Sécurité Aéroportuaire (EISA)" },
  { match: "Structuration de la fonction RH", type: "catalogue", source: "Catalogue, Organisation details", quote: "Structuration de la fonction RH" },
  { match: "Coaching professionnel et executive coaching", type: "catalogue", source: "Catalogue, Organisation details + bio Pascal", quote: "Coaching professionnel et executive coaching" },
  // Expertise examples (missions)
  { match: "Création et Business plan d'Islands Airline", type: "catalogue", source: "Catalogue, sections 1.1.2 et 1.2.2 (pp. 8, 10)", quote: "Création et Business plan d'Islands Airline" },
  { match: "Modèle économique pour Terciel", type: "catalogue", source: "Catalogue, section 2.3.1 (p. 22)", quote: "Modèle économique pour Terciel (aéroports marins)" },
  { match: "Études de faisabilité à Lifou", type: "catalogue", source: "Catalogue, sections 2.1.4-2.1.5 (pp. 19-20)", quote: "Études de faisabilité à Lifou (classification internationale et création d'un aéroport à Hmelek)" },
  { match: "Conception du dispositif de certification biodiversité", type: "catalogue", source: "Catalogue, section 3.1.1 (p. 23)", quote: "Conception du dispositif de certification biodiversité en Polynésie" },
  { match: "Continuité territoriale aérienne", type: "catalogue", source: "Catalogue, section 1.5.2 (p. 17)", quote: "Continuité territoriale aérienne interinsulaire" },
  { match: "Étude de marché des nouveaux produits alimentaires", type: "catalogue", source: "Catalogue, section 5.1.4 (p. 30)", quote: "Étude de marché des nouveaux produits alimentaires à base de vivriers locaux (DAG, projet TAVIVAT)" },
  { match: "Étude de ligne aérienne régionale", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Étude de ligne aérienne régionale Tahiti - États insulaires du Pacifique" },
  { match: "Audits Part-145/Part-M de TASC", type: "catalogue", source: "Catalogue, section 1.3.2 (p. 12)", quote: "Audits Part-145/Part-M de TASC" },
  { match: "Dossiers conformité et certification Air Loyauté", type: "catalogue", source: "Catalogue, sections 1.3.5-1.3.6 (p. 13)", quote: "Dossiers conformité et certification Air Loyauté" },
  { match: "Accompagnement conformité de TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14) — Tahiti Air Charter", quote: "Accompagnement conformité de TAC (Tahiti Air Charter)" },
  { match: "MEL et MANEX de TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14)", quote: "MEL et MANEX de TAC" },
  { match: "Procédures opérationnelles d'Air Loyauté", type: "catalogue", source: "Catalogue, section 1.4.2 (p. 14)", quote: "Procédures opérationnelles d'Air Loyauté" },
  { match: "Recueils SSLIA et AFIS de la DAC-Pf", type: "catalogue", source: "Catalogue, sections 1.4.4-1.4.5 (pp. 15-16)", quote: "Recueils SSLIA et AFIS de la DAC-Pf" },
  { match: "Cahier des charges pour aéroports marins", type: "catalogue", source: "Catalogue, section 2.3.3 (p. 22)", quote: "Cahier des charges pour aéroports marins Terciel" },
  { match: "Formation Gestion de Projet", type: "catalogue", source: "Catalogue, section 4.1.3 (p. 25)", quote: "Formation Gestion de Projet — CNAM" },
  { match: "Formation Conduite du Changement", type: "catalogue", source: "Catalogue, section 4.1.4 (p. 26)", quote: "Formation Conduite du Changement — CNAM" },
  { match: "Centre Part-147 clés en main", type: "catalogue", source: "Catalogue, section 4.2.1 (p. 27)", quote: "Centre Part-147 clés en main — Air Formation" },
  { match: "Concours DGRH", type: "catalogue", source: "Catalogue, section 4.1.7 (p. 26)", quote: "Concours DGRH — Élaboration de sujets et correction de copies" },
  { match: "Appui à la candidature de concession", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10)", quote: "Appui à la candidature de concession de Tahiti-Faa'a pour Vinci Airports" },
  { match: "Mise en place de la desserte TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14)", quote: "Mise en place de la desserte TAC inter-iles" },
  { match: "AMO globale Air Bora Bora", type: "catalogue", source: "Catalogue, section 5.2.1 (p. 31)", quote: "AMO globale Air Bora Bora" },
  { match: "Base ULM de Moorea", type: "catalogue", source: "Catalogue, section 5.1.2 (p. 29)", quote: "Base ULM de Moorea (MOZ ULM)" },
  { match: "Organisation et fonction RH Air Loyauté", type: "catalogue", source: "Catalogue, section 4.3.1 (p. 28)", quote: "Organisation et fonction RH Air Loyauté — structuration et appui managérial" },
  { match: "Club des managers CNAM", type: "catalogue", source: "Catalogue, section 4.1.1 (p. 25)", quote: "Animation du Club des managers CNAM" },
  { match: "Études de sécurité pour TAC", type: "catalogue", source: "Catalogue, section 1.5.1 (p. 17)", quote: "Études de sécurité pour TAC aux Marquises" },

  // ─── A PROPOS — sections editoriales ───
  { match: "Une histoire d'expertise et d'engagement", type: "editorial", source: "Rédaction éditoriale", quote: "Titre de la timeline, éditorial basé sur le parcours documenté" },
  { match: "Nos axes de différenciation", type: "editorial", source: "Rédaction éditoriale", quote: "Titre éditorial pour la section valeurs" },
  { match: "Le coquillage, symbole de Pacific Blue", type: "editorial", source: "Rédaction éditoriale culturelle", quote: "Symbolique du logo PBC — référence au pu polynésien" },
  { match: "Un réseau d'experts mobilisables", type: "editorial", source: "Rédaction éditoriale", quote: "Description éditoriale de l'écosystème de partenaires PBC" },
  { match: "interlocuteur unique et responsable", type: "editorial", source: "Rédaction éditoriale", quote: "Positionnement éditorial du cabinet" },
  { match: "soixante missions conduites depuis 2017", type: "catalogue", source: "Catalogue, section biographique (après Conclusion)", quote: "Au fil de plus de soixante missions conduites depuis 2017" },
  { match: "Au cœur du Pacifique", type: "catalogue", source: "Catalogue, zones d'intervention", quote: "Missions documentées en PF, NC, W&F et Pacifique Sud" },
  { match: "Présent en Polynésie française depuis 2017", type: "catalogue", source: "Catalogue, date création", quote: "Cabinet créé en 2017 à Punaauia, PF" },
  { match: "Envie de travailler ensemble", type: "editorial", source: "Rédaction éditoriale", quote: "CTA éditorial de fin de page" },
  { match: "Structuration complète", type: "catalogue", source: "Catalogue, expertise Création/Structuration", quote: "De la création d'entités à la certification et opérations" },
  { match: "Partenariats long terme", type: "catalogue", source: "Catalogue, Conclusion (p. 36)", quote: "Relations multi-ans avec Air Loyauté, CNAM, DIREN, DAC-Pf, démontrant confiance et impact" },
  { match: "Accompagnement de croissance", type: "catalogue", source: "Catalogue, expertises Études + AMO + Création", quote: "Business plans, stratégie, gestion de projets, AMO" },
  { match: "RSE et environnement", type: "catalogue", source: "Catalogue, missions environnement", quote: "Certification biodiversité, bilan carbone, feuille de route décarbonation" },
  { match: "Formation et compétences", type: "catalogue", source: "Catalogue, expertise Formation", quote: "Part-147, management, compliance, tutoring" },
  { match: "Technologie et innovation", type: "catalogue", source: "Catalogue, missions drones/innovation", quote: "Drones/UAV, modélisation, outils décisionnels, aéroports marins" },
  { match: "Expertise aéronautique", type: "catalogue", source: "Catalogue, Conclusion (p. 36)", quote: "Plus de 57% du portefeuille couvre l'aérien (compagnies, aéroports, conformité EASA)" },

  // ─── CONTACT — textes page ───
  { match: "Parlons de votre projet", type: "editorial", source: "Rédaction éditoriale", quote: "Titre éditorial page contact" },
  { match: "nous soumettre un projet", type: "editorial", source: "Rédaction éditoriale", quote: "Description éditoriale du formulaire" },
  { match: "Coordonnées", type: "catalogue", source: "Catalogue, page de garde + mentions légales", quote: "Email, téléphone et adresse issus du catalogue" },
  { match: "Nos domaines", type: "catalogue", source: "Catalogue, 8 expertises", quote: "Les 8 expertises listées dans le catalogue" },
  { match: "Conseil stratégique et performance", type: "derived", source: "Dérivé des expertises du catalogue", quote: "Synthèse des expertises Études & Stratégie + Organisation & Management" },
  { match: "Transition écologique et RSE", type: "catalogue", source: "Catalogue, missions environnement", quote: "Certification biodiversité, EIE/NIE, bilan carbone" },
  { match: "Formation et développement des compétences", type: "catalogue", source: "Catalogue, expertise Formation & Concours", quote: "CNAM, Part-147, tutoring, concours" },
  { match: "Certification ISO", type: "flyer", source: "Flyer PBC, liste des services", quote: "Conseil et accompagnement en certification ISO (9001, 14001, 45001)" },

  // ─── REFERENCES — textes page ───
  { match: "Sélection d'interventions réalisées", type: "catalogue", source: "Catalogue, 61 missions", quote: "Missions réalisées en PF, NC et Pacifique Sud" },
  { match: "Votre projet pourrait figurer ici", type: "editorial", source: "Rédaction éditoriale", quote: "CTA éditorial de fin de page" },

  // ─── FOOTER ───
  { match: "Pacific Blue Consulting", type: "catalogue", source: "Catalogue, page de garde", quote: "Pacific Blue Consulting" },
  { match: "Votre boussole", type: "flyer", source: "Flyer page 1, slogan", quote: "Votre boussole dans un monde complexe" },

  // ─── CONTACT ───
  { match: "contact@pacificblueconsulting.org", type: "catalogue", source: "Catalogue, coordonnées", quote: "contact@pacificblueconsulting.org" },
  { match: "+689 87 747 284", type: "catalogue", source: "Catalogue, coordonnées + Flyer (Mobile : 87-747-284, préfixe +689 ajouté)", quote: "Mobile : 87-747-284 (flyer) — préfixe international +689 ajouté pour le site" },
  { match: "Punaauia", type: "catalogue", source: "Catalogue, adresse siège", quote: "PK 17,900 Côté Mer, Punaauia" },

  // ─── REFERENCES ───
  { match: "Des missions concrètes depuis 2017", type: "catalogue", source: "Catalogue, 61 missions", quote: "Toutes les fiches missions sont sourcées du Catalogue des Missions PBC" },
  { match: "8 domaines au service du Pacifique", type: "catalogue", source: "Catalogue, 8 expertises", quote: "Études, Audits, Documentation, Formation, AMO, Création, Sécurité, Organisation" },
  { match: "Nos missions depuis 2017", type: "catalogue", source: "Catalogue, historique", quote: "61 missions depuis la création du cabinet en 2017" },

  // ─── MISSING ENTRIES (identified by audit) ───
  { match: "Pascal Bazer-Bachi", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (après Conclusion)", quote: "Fondateur et président de Pacific Blue Consulting, Pascal BAZER-BACHI met au service de ses clients plus de trente années d'expérience de direction et de pilotage de systèmes complexes" },
  { match: "Fondateur", type: "catalogue", source: "Catalogue, Introduction (p. 5) + section biographique (après Conclusion)", quote: "Fondé en 2017 par Pascal BAZER-BACHI" },
  { match: "Prendre rendez-vous", type: "editorial", source: "Rédaction éditoriale — CTA principal", quote: "Appel à l'action invitant les prospects à contacter le cabinet" },
  { match: "Découvrir nos expertises", type: "editorial", source: "Rédaction éditoriale — CTA secondaire", quote: "Redirige vers la page Expertise détaillant les 8 domaines du catalogue" },
  { match: "Ils nous font confiance", type: "catalogue", source: "Catalogue, chapitres 1 à 6 — clients récurrents", quote: "18 partenaires documentés dans les 61 fiches missions : DAC-Pf, Air Loyauté, CNAM, Terciel, Vinci Airports, DIREN, Air Formation..." },
  { match: "Un projet ? Une question ?", type: "editorial", source: "Rédaction éditoriale — CTA de fin de page", quote: "Invitation éditoriale à prendre contact avec le cabinet" },
  { match: "Acteurs publics, compagnies aériennes, entreprises privées", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting accompagne les acteurs publics et privés dans leurs projets de transformation" },
  { match: "Notre écosystème", type: "catalogue", source: "Catalogue, section 'Un écosystème d'experts mobilisables' (après Conclusion)", quote: "Pacific Blue Consulting intervient comme interlocuteur unique et responsable de la qualité des missions, tout en s'appuyant sur un écosystème d'experts et de structures partenaires" },
  { match: "Tous droits réservés", type: "editorial", source: "Mention légale éditoriale", quote: "Copyright standard du site web" },
];

const TYPE_STYLES = {
  catalogue: { bg: "#ecfdf5", text: "#047857", label: "Catalogue des Missions", dot: "#10b981" },
  flyer: { bg: "#eff6ff", text: "#1d4ed8", label: "Flyer PBC", dot: "#3b82f6" },
  editorial: { bg: "#fffbeb", text: "#b45309", label: "Rédaction éditoriale", dot: "#f59e0b" },
  derived: { bg: "#faf5ff", text: "#7c3aed", label: "Dérivé des sources", dot: "#8b5cf6" },
};

let isAnnotating = false;

/** Walk the DOM and annotate elements whose text matches source entries */
function annotateDOM(): number {
  if (typeof document === "undefined") return 0;
  isAnnotating = true;
  // Remove old annotations first to avoid duplicates on re-run
  document.querySelectorAll("[data-source-traced]").forEach((el) => {
    el.removeAttribute("data-source");
    el.removeAttribute("data-source-traced");
  });

  // Sort by match length DESC so we match most specific first
  const sorted = [...SOURCE_MAP].sort((a, b) => b.match.length - a.match.length);

  const tags = "h1,h2,h3,h4,h5,p,span,a,li,td,th,label,button,div";
  const candidates = document.querySelectorAll(tags);
  let count = 0;

  candidates.forEach((el) => {
    // Skip elements that already have annotation or are part of the tracer UI
    if (el.getAttribute("data-source")) return;
    if ((el as HTMLElement).closest("#source-tracer-ui")) return;

    // Get DIRECT text content (not from children)
    const directText = getDirectText(el);
    if (directText.length < 3) return;

    for (const entry of sorted) {
      if (directText.includes(entry.match)) {
        el.setAttribute("data-source", `${entry.type}|${entry.source}|${entry.quote}`);
        el.setAttribute("data-source-traced", "1");
        count++;
        break; // one annotation per element
      }
    }
  });

  isAnnotating = false;
  return count;
}

/** Get text content directly owned by this element, not from nested children */
function getDirectText(el: Element): string {
  let text = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    }
    // Also include text from inline elements (span, strong, em, a)
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      if (["span", "strong", "em", "b", "i", "a", "mark"].includes(tag)) {
        text += node.textContent || "";
      }
    }
  });
  return text.trim();
}

// ─── INNER COMPONENT (needs Suspense for useSearchParams) ───
function SourceTracerInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Persist sources mode: once ?sources is used, it stays active across navigation
  const [isActive, setIsActive] = useState(false);
  const [annotatedCount, setAnnotatedCount] = useState(0);
  useEffect(() => {
    try {
      if (searchParams.get("sources") !== null) {
        sessionStorage.setItem("pbc-sources", "1");
        setIsActive(true);
      } else if (sessionStorage.getItem("pbc-sources") === "1") {
        setIsActive(true);
      }
    } catch {}
  }, [searchParams]);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: "editorial",
    source: "",
    quote: "",
  });

  const handleOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest("[data-source]") as HTMLElement | null;
    if (!el || el.closest("#source-tracer-ui")) return;

    const raw = el.getAttribute("data-source") || "";
    const [type = "editorial", source = "", quote = ""] = raw.split("|");
    const rect = el.getBoundingClientRect();

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      type,
      source,
      quote,
    });
  }, []);

  const handleOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest("[data-source]");
    if (!el) return;
    // Check if we're moving to a child of the same annotated element
    const related = e.relatedTarget as HTMLElement | null;
    if (related && el.contains(related)) return;
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Annotate DOM when active, on route change, and after hydration
  useEffect(() => {
    if (!isActive) return;

    const run = () => setAnnotatedCount(annotateDOM());
    // Run multiple times to catch late-rendered content (GSAP, lazy load)
    run();
    const timers = [
      setTimeout(run, 300),
      setTimeout(run, 800),
      setTimeout(run, 2000),
      setTimeout(run, 4000),
    ];

    // Observe new DOM nodes (skip mutations caused by our own annotations)
    const observer = new MutationObserver(() => {
      if (isAnnotating) return;
      setTimeout(run, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [isActive, pathname]);

  // Inject styles + listeners
  useEffect(() => {
    if (!isActive) return;

    document.getElementById("source-tracer-css")?.remove();
    const style = document.createElement("style");
    style.id = "source-tracer-css";
    style.textContent = `
      [data-source] {
        position: relative !important;
        cursor: help !important;
      }
      [data-source]:hover {
        background: rgba(212, 175, 55, 0.12) !important;
        outline: 2px dashed rgba(212, 175, 55, 0.6) !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }
      [data-source]::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: repeating-linear-gradient(
          90deg,
          rgba(212,175,55,0.5) 0px,
          rgba(212,175,55,0.5) 4px,
          transparent 4px,
          transparent 8px
        );
        pointer-events: none;
      }
      @keyframes st-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    document.addEventListener("mouseover", handleOver, true);
    document.addEventListener("mouseout", handleOut, true);

    return () => {
      style.remove();
      document.removeEventListener("mouseover", handleOver, true);
      document.removeEventListener("mouseout", handleOut, true);
    };
  }, [isActive, handleOver, handleOut]);

  // Position tooltip
  useEffect(() => {
    if (!tooltip.visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    const pad = 16;

    let left = tooltip.x - rect.width / 2;
    if (left < pad) left = pad;
    if (left + rect.width > window.innerWidth - pad) left = window.innerWidth - pad - rect.width;

    let top = tooltip.y - rect.height - 14;
    if (top < pad) top = tooltip.y + 40;
    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - pad - rect.height;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [tooltip]);

  if (!isActive) return null;

  const typeInfo = TYPE_STYLES[tooltip.type as keyof typeof TYPE_STYLES] || TYPE_STYLES.editorial;

  return (
    <div id="source-tracer-ui">
      {/* Badge top-right */}
      <div style={{
        position: "fixed", top: 80, right: 16, zIndex: 9999,
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 18px", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)",
        color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 999,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)", border: "1px solid rgba(212,175,55,0.4)",
        letterSpacing: "0.03em",
      }}>
        <span style={{ width: 10, height: 10, background: "#d4af37", borderRadius: "50%", animation: "st-pulse 2s infinite" }} />
        MODE SOURCES
      </div>

      {/* Legend bottom-right */}
      <div style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 9999,
        padding: "16px 18px", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)",
        borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        border: "1px solid rgba(0,0,0,0.06)", fontSize: 12, maxWidth: 240,
      }}>
        <p style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1e293b", marginBottom: 12 }}>
          Sources
        </p>
        {Object.entries(TYPE_STYLES).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: val.dot, flexShrink: 0 }} />
            <span style={{ color: "#64748b" }}>{val.label}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8" }}>Éléments annotés</span>
          <span style={{ fontWeight: 800, color: "#1e293b" }}>{annotatedCount || "..."}</span>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: "fixed", zIndex: 10000, pointerEvents: "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          opacity: tooltip.visible ? 1 : 0,
          transform: tooltip.visible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        <div style={{
          background: "#fff", borderRadius: 16,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
          padding: 16, maxWidth: 420, minWidth: 280,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: typeInfo.dot }} />
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: typeInfo.text }}>
              {typeInfo.label}
            </span>
          </div>

          {tooltip.source && (
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6, lineHeight: 1.4 }}>
              {tooltip.source}
            </p>
          )}

          {tooltip.quote && (
            <div style={{ background: typeInfo.bg, borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
              <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, fontStyle: "italic" }}>
                &laquo;&nbsp;{tooltip.quote}&nbsp;&raquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SourceTracer() {
  return (
    <Suspense fallback={null}>
      <SourceTracerInner />
    </Suspense>
  );
}
