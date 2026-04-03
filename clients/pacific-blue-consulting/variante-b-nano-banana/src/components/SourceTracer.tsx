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
  { match: "Pacific Blue", type: "catalogue", source: "Catalogue des Missions, page de couverture", quote: "Pacific Blue Consulting — Cabinet de conseil independant base en Polynesie francaise" },
  { match: "Accueil", type: "editorial", source: "Structure editoriale du site", quote: "Page d'accueil synthetisant les chiffres cles (60+ missions, 8 expertises, 4 territoires) et les 18 partenaires issus du Catalogue des Missions" },
  { match: "Expertise", type: "catalogue", source: "Catalogue, chapitre 7 'Synthese par famille d'offre' (pp. 33-35)", quote: "Le catalogue documente 8 expertises distinctes : Etudes & Strategie, Audits & Conformite, Documentation & Certification, Formation & Concours, AMO & Projets, Creation / Structuration, Gestion de la Securite, Organisation & Management" },
  { match: "References", type: "catalogue", source: "Catalogue, chapitres 1 a 6 (pp. 8-32) — 61 fiches missions", quote: "61 missions detaillees avec client, annee, domaine, description et benefice client. Chaque fiche constitue une reference factuelle du cabinet" },
  { match: "A propos", type: "catalogue", source: "Catalogue, Introduction (pp. 5-7) + Conclusion (p. 36)", quote: "Introduction du catalogue : biographie de Pascal Bazer-Bachi, presentation du cabinet, identite visuelle (coquillage/spirale), mentions legales SAS" },
  { match: "Contact", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "Coordonnees du cabinet : pacificblueconsulting@zoho.com / +689-87-747-284 / PK 17,900 Cote Mer, Punaauia" },
  { match: "Nous contacter", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "Adresse email, telephone et localisation extraits des mentions legales du catalogue" },
  // Dropdown submenu items
  { match: "Aviation civile", type: "catalogue", source: "Catalogue, chapitre 1 'Operations et Compagnies aeriennes' (pp. 8-18)", quote: "28 missions aviation documentees : structuration compagnies (TNH, Islands Airline, Air Bora Bora, Air Loyaute), etudes strategiques, audits conformite, documentation operationnelle, securite, drones" },
  { match: "Compagnies aeriennes", type: "catalogue", source: "Catalogue, section 1.1 'Structuration de compagnies' (pp. 8-9)", quote: "4 compagnies structurees : Tahiti Nui Helicopters (2017-18), Islands Airline (2019), Air Bora Bora (2020-23), Air Loyaute (2019-23)" },
  { match: "Aeroports", type: "catalogue", source: "Catalogue, chapitre 2 'Aeroports et Infrastructures' (pp. 19-22)", quote: "Aratika, reseau d'aerodromes polynesiens, Lifou (Wanaham), Hmelek, schemas Moorea/Huahine, Air Tetiaroa, aeroports marins Terciel" },
  { match: "Aeroports & Infrastructures", type: "catalogue", source: "Catalogue, chapitre 2 'Aeroports et Infrastructures' (pp. 19-22)", quote: "Diagnostics pistes, conformite reseau, certification aerodromes, schemas amenagement Moorea/Huahine, faisabilite Lifou, aeroports marins Terciel" },
  { match: "Environnement", type: "catalogue", source: "Catalogue, chapitre 3 'Environnement & Biodiversite' (pp. 23-24)", quote: "4 missions : certification biodiversite (3 sous-missions : deploiement, analyse, amelioration — sections 3.1.1-3.1.3), bilan carbone DAC-Pf et feuille de route decarbonation (section 3.2.1)" },
  { match: "Biodiversite", type: "catalogue", source: "Catalogue, section 3.1 (p. 23)", quote: "Certification biodiversite — Developpement, deploiement et promotion du dispositif en Polynesie francaise" },
  { match: "bilan carbone", type: "catalogue", source: "Catalogue, section 3.2 (p. 24)", quote: "Evaluation du bilan carbone de la DAC-Pf et elaboration d'une feuille de route pour la decarbonation" },
  { match: "Etudes strategiques", type: "catalogue", source: "Catalogue, chapitre 5 'Etudes, Strategie & AMO' (pp. 29-31)", quote: "DSP Wallis & Futuna, ULM Moorea, Province des Iles Loyaute (DPA), etude de marche vivriers locaux (DAG), AMO Air Bora Bora, pilotage TAVIVAT" },
  { match: "Outil de modelisation de la desserte", type: "catalogue", source: "Catalogue, section 1.6.2 (p. 18)", quote: "Outil de modelisation de la desserte en Polynesie francaise — creation d'un modele pour la DAC-Pf" },
  { match: "AMO & Pilotage", type: "catalogue", source: "Catalogue, section 5.2 'Assistance a maitrise d'ouvrage' (p. 31)", quote: "AMO globale pour projet Air Bora Bora + Assistance au pilotage du projet TAVIVAT pour la DAG" },
  { match: "Projets complexes", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Le cabinet intervient sur l'ensemble du cycle de vie des projets : etudes strategiques, AMO, modelisation economique, mise en conformite reglementaire..." },
  { match: "Formation", type: "catalogue", source: "Catalogue, chapitre 4 'Formation & Management' (pp. 25-28)", quote: "10 missions : Club des Managers CNAM, gestion de projet, conduite du changement, Part-147 Air Formation, tutoring licence, concours DGRH, creation d'entreprises" },
  { match: "Management", type: "catalogue", source: "Catalogue, section 4.3 'Organisation, RH et accompagnement' (p. 28)", quote: "Organisation & fonction RH Air Loyaute, accompagnement a la creation d'entreprises, coaching" },
  { match: "Missions aviation", type: "catalogue", source: "Catalogue, chapitre 1 (pp. 8-18)", quote: "28 missions detaillees couvrant structuration, etudes, audits, documentation, securite et drones" },
  { match: "Missions environnement", type: "catalogue", source: "Catalogue, chapitre 3 (pp. 23-24)", quote: "Certification biodiversite (3 missions), EIE/NIE DIREN, bilan carbone et decarbonation DAC-Pf" },
  { match: "Missions AMO", type: "catalogue", source: "Catalogue, chapitre 5 (pp. 29-31)", quote: "DSP W&F, ULM Moorea, Province Iles Loyaute, marche vivriers DAG, AMO Air Bora Bora, TAVIVAT" },
  { match: "Toutes les references", type: "catalogue", source: "Catalogue des Missions, chapitres 1 a 6 (pp. 8-32)", quote: "61 fiches missions structurees par domaine, chacune avec client, annee, description detaillee et benefice client" },

  // ─── HOMEPAGE ───
  { match: "Cabinet de conseil independant", type: "flyer", source: "Flyer PBC, page 1, bandeau superieur", quote: "Pacific Blue Consulting — Cabinet de conseil independant" },
  { match: "Votre boussole dans un monde complexe", type: "flyer", source: "Flyer PBC, page 1, slogan principal sous le logo", quote: "Votre boussole dans un monde complexe — slogan figurant sur le flyer officiel du cabinet" },
  { match: "Plus de 60 missions realisees en Polynesie", type: "catalogue", source: "Catalogue, table des matieres + comptage des 61 fiches", quote: "61 missions individuelles documentees dans le catalogue, reparties dans 6 chapitres couvrant aviation, aeroports, environnement, formation, etudes/AMO et artisanat" },
  { match: "Conseil en strategie, aeronautique", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting est un cabinet de conseil independant [...] dans les secteurs du transport, des infrastructures, de l'energie, de l'environnement et des services publics" },
  { match: "Missions realisees", type: "catalogue", source: "Catalogue, comptage des fiches missions (pp. 8-32)", quote: "61 fiches missions individuelles documentees dans le Catalogue des Missions PBC" },
  { match: "Domaines d'expertise", type: "catalogue", source: "Catalogue, chapitre 7 'Synthese par famille d'offre' (pp. 33-35)", quote: "8 familles d'expertise : Etudes & Strategie, Audits & Conformite, Documentation & Certification, Formation & Concours, AMO & Projets, Creation / Structuration, Gestion de la Securite, Organisation & Management" },
  { match: "Territoires couverts", type: "catalogue", source: "Catalogue, localisation des 61 missions", quote: "4 territoires documentes : Polynesie francaise (siege, majorite des missions), Nouvelle-Caledonie (Air Loyaute, Lifou, DPA), Wallis & Futuna (DSP), Pacifique Sud (liaison regionale Iles Cook/Tonga/Samoa/Fidji)" },
  { match: "Cabinet de conseil independant", type: "catalogue", source: "Catalogue, mentions legales (p. 7) + Flyer page 1", quote: "Cabinet de conseil independant — statut SAS, capital initial de 200 000 FCFP (mentions legales catalogue)" },
  { match: "Sur mesure", type: "editorial", source: "Redaction editoriale inspiree du Catalogue, Introduction (p. 5)", quote: "Synthese editoriale de la phrase du catalogue : 'une comprehension fine des realites insulaires et des contextes multipartenaires'" },
  { match: "Innovation", type: "catalogue", source: "Catalogue, section 1.6 'Drones, modelisation et nouvelles technologies' (p. 18) + section 2.3 'Aeroports marins' (p. 22)", quote: "Drones/UAV en Polynesie, outil de modelisation de la desserte, missions d'imagerie aerienne par telepilote, aeroports marins innovants Terciel" },
  { match: "Conformite EASA", type: "catalogue", source: "Catalogue, sections 1.3.2 a 1.3.5 (pp. 12-13)", quote: "Audit de conformite Part-145 et Part-M (TASC), dossiers conformite et certification Air Loyaute, mise a jour CTA, Part-145, Part-M, Part-CAMO" },
  { match: "manuels MANEX", type: "catalogue", source: "Catalogue, section 1.4.1 (p. 14)", quote: "Certification et documentation operationnelle Islands Airline — 47 documents operationnels (MANEX A/B/C/D, MGN, MGS) et matrices de conformite pour CTA" },
  { match: "Drones et imagerie aerienne", type: "catalogue", source: "Catalogue, section 1.6 (p. 18)", quote: "Exploration des opportunites de deploiement des drones en PF, outil de modelisation de la desserte, missions d'imagerie aerienne par telepilote" },
  { match: "Une expertise multisectorielle", type: "editorial", source: "Redaction editoriale basee sur le Catalogue, chapitre 7 (pp. 33-35)", quote: "Titre editorial refletant les 8 expertises transversales documentees dans la synthese du catalogue" },
  { match: "De l'aviation civile a l'environnement", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "...dans les secteurs du transport, des infrastructures, de l'energie, de l'environnement et des services publics" },
  { match: "Depuis 2017, Pacific Blue Consulting accompagne", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting est un cabinet de conseil independant [...] qui accompagne les acteurs publics et prives dans leurs projets de transformation, d'investissement et de structuration" },
  { match: "Un partenaire de confiance", type: "editorial", source: "Redaction editoriale basee sur les relations pluriannuelles du Catalogue", quote: "Air Loyaute accompagnee de 2019 a 2023 (7+ missions), CNAM (5 formations), DAC-Pf (10+ missions sur toute la periode)" },
  // Partners
  { match: "Air Loyaute", type: "catalogue", source: "Catalogue, sections 1.1.4, 1.3.5-1.3.6, 1.4.2, 4.3.1 (pp. 9, 13-14, 28)", quote: "7+ missions : structuration/modernisation (2019-23), audits Part-145/M, dossiers conformite CTA, SGS, procedures operationnelles, organisation RH" },
  { match: "Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10)", quote: "Appui strategique a une candidature de concession aeroportuaire majeure — Tahiti-Faa'a pour Vinci Airports (2020)" },
  { match: "Aviation Civile (DAC-PF)", type: "catalogue", source: "Catalogue, sections 1.3.1, 1.4.4-1.4.6, 1.5.3, 1.6.2, 2.2.1, 3.2.1 (pp. 12-24)", quote: "10+ missions : audit reglementaire, SSLIA nouvelle generation, manuels AFIS, maintenance electrotechnique, EISA, modelisation desserte, schemas amenagement, bilan carbone" },
  { match: "CNAM", type: "catalogue", source: "Catalogue, sections 4.1.1 a 4.1.6 (pp. 25-26)", quote: "Club des Managers, gestion de projet, conduite du changement, culture generale economique et manageriale, tutoring licence management" },
  { match: "DIREN", type: "catalogue", source: "Catalogue, section 3.1.3 (p. 23)", quote: "Direction de l'Environnement — Actualisation du dispositif d'evaluation environnementale (EIE/NIE) en Polynesie francaise" },
  { match: "Terciel", type: "catalogue", source: "Catalogue, sections 2.3.1 a 2.3.3 (p. 22)", quote: "3 missions Terciel SAS : modele economique aeroports marins, brochure commerciale, cahier des charges aeroports marins et flottants" },
  { match: "Province des Iles Loyaute", type: "catalogue", source: "Catalogue, section 5.1.3 (p. 29)", quote: "Province des Iles Loyaute — Appui strategique integre ports et aeroports (DPA), convention pluriannuelle" },
  { match: "Air Bora Bora", type: "catalogue", source: "Catalogue, sections 1.1.3 et 5.2.1 (pp. 9, 31)", quote: "Creation compagnie startup (2020-23) : structuration juridique SAS, business plan, strategie commerciale, programme de vols + AMO globale" },
  { match: "Islands Airline", type: "catalogue", source: "Catalogue, sections 1.1.2 et 1.2.2 (pp. 8, 10)", quote: "Structuration complete (2019) : 47 documents operationnels (MANEX A/B/C/D, MGN, MGS), CTA obtenu + business plan et modele economique" },
  { match: "Tahiti Air Charter", type: "catalogue", source: "Catalogue, sections 1.4.3 et 1.5.1 (pp. 14, 17)", quote: "Mise en place desserte inter-iles Marquises — documentation conformite + etude de securite exploitation en archipel montagneux" },
  { match: "TASC", type: "catalogue", source: "Catalogue, section 1.3.2 (p. 12)", quote: "Audit de conformite Part-145 et Part-M — Exploitant maintenance TASC" },
  { match: "Air Formation", type: "catalogue", source: "Catalogue, sections 4.2.1 a 4.2.3 (p. 27)", quote: "3 missions : mise en place centre Part-147 cles en main (infrastructure + agrement), recrutement/qualification instructeurs, livrets et supports de formation MTOE" },
  { match: "Tahiti Beachcomber", type: "catalogue", source: "Catalogue, section 2.2.2 (p. 21)", quote: "Tahiti Beachcomber SA — Air Tetiaroa : Accompagnement a la levee des non-conformites de la piste de Tetiaroa" },
  { match: "Direction de l'Agriculture", type: "catalogue", source: "Catalogue, sections 5.1.4 et 5.2.2 (pp. 30-31)", quote: "Etude de marche des nouveaux produits alimentaires a base de vivriers locaux (projet TAVIVAT) + assistance au pilotage de la phase de realisation" },
  { match: "Aerodromes", type: "catalogue", source: "Catalogue, sections 2.1.1 a 2.1.5 (pp. 19-20)", quote: "Diagnostic piste Aratika, diagnostic conformite reseau polynesien, certification par aerodrome, faisabilite Lifou (Wanaham), creation aeroport Hmelek" },
  { match: "Ministere des Transports", type: "catalogue", source: "Catalogue, section 1.5.2 (p. 17)", quote: "Continuite territoriale aerienne interinsulaire — cadre et propositions" },
  { match: "Service de l'Artisanat", type: "catalogue", source: "Catalogue, chapitre 6, section 6.1.1 (p. 32)", quote: "Etude de faisabilite pour un sechoir a pandanus — Service de l'Artisanat Traditionnel" },
  { match: "MOZ ULM", type: "catalogue", source: "Catalogue, section 5.1.2 (p. 29)", quote: "Installation d'une activite ULM — Dossier de presentation et conformite — MOZ ULM Moorea" },

  // ─── A PROPOS ───
  { match: "Un cabinet ne de l'experience", type: "editorial", source: "Redaction editoriale inspiree du Catalogue, Introduction (p. 5)", quote: "Titre editorial base sur le parcours documente de Pascal Bazer-Bachi : 30+ ans d'experience, creation de multiples organisations" },
  { match: "accompagne les acteurs publics et prives dans leurs projets de transformation", type: "catalogue", source: "Catalogue, Introduction (p. 5), 1er paragraphe", quote: "Pacific Blue Consulting est un cabinet de conseil independant [...] qui accompagne les acteurs publics et prives dans leurs projets de transformation, d'investissement et de structuration" },
  { match: "transport, des infrastructures, de l'energie, de l'environnement", type: "catalogue", source: "Catalogue, Introduction (p. 5), 1er paragraphe", quote: "...en particulier dans les secteurs du transport, des infrastructures, de l'energie, de l'environnement et des services publics" },
  { match: "plus de trente annees d'experience", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "Pacific Blue Consulting s'appuie sur plus de trente annees d'experience de direction et de pilotage de systemes complexes, en Europe et dans le Pacifique" },
  { match: "aviation civile, les systemes satellitaires", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "Pascal a exerce des responsabilites de premier plan dans l'aviation civile, les systemes satellitaires, la regulation, l'exploitation d'aeroports" },
  { match: "en Europe et dans le Pacifique", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "...plus de trente annees d'experience [...] en Europe et dans le Pacifique" },
  { match: "fonctions de haut niveau", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (apres Conclusion)", quote: "Il a occupe des fonctions de haut niveau dans l'administration et au sein d'operateurs techniques" },
  { match: "creer plusieurs structures de conseil", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (apres Conclusion)", quote: "...avant de creer plusieurs structures de conseil et d'ingenierie" },
  { match: "Chevalier de l'Ordre National du Merite", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (apres Conclusion)", quote: "Chevalier de l'Ordre National du Merite — reconnaissance de l'engagement au service de l'interet general" },
  { match: "interet general", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (apres Conclusion)", quote: "Engagement reconnu au service de l'interet general et de la modernisation des organisations publiques et privees" },
  { match: "Coach professionnel et executive coach", type: "catalogue", source: "Catalogue, section 'Ce que PBC apporte a vos equipes' (apres Conclusion)", quote: "Coach professionnel et executive coach accredite — accompagnement de dirigeants, cadres et porteurs de projets" },
  { match: "gestion des risques industriels", type: "catalogue", source: "Catalogue, section 'L'ADN du fondateur' (apres Conclusion)", quote: "Forme au management, a la gestion des risques industriels et au coaching professionnel" },
  // Timeline
  { match: "Fondation de Pacific Blue Consulting", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Fonde en 2017 par Pascal BAZER-BACHI" },
  { match: "Tahiti Nui Helicopters", type: "catalogue", source: "Catalogue, section 1.1.1 (p. 8) — Client: Partenaires ATN, 2017-2018", quote: "Conception et structuration completes de la nouvelle compagnie d'helicopteres Tahiti Nui Helicopters, a partir d'une analyse strategique detaillee du redeploiement de l'activite helicoptere en Polynesie francaise" },
  { match: "modernisation d'Air Loyaute", type: "catalogue", source: "Catalogue, section 1.1.4 (p. 9) — Client: Air Loyaute, 2019-2023", quote: "Accompagnement pluriannuel d'Air Loyaute, compagnie regionale de Nouvelle-Caledonie, dans l'evolution de son organisation et de ses referentiels techniques et operationnels" },
  { match: "candidature Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10) — 2020", quote: "Appui strategique a une candidature de concession aeroportuaire majeure — Tahiti-Faa'a pour Vinci Airports" },
  { match: "Desserte inter-iles Marquises", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14) — Client: Tahiti Air Charter", quote: "Mise en place desserte inter-iles — Documentation et conformite — Tahiti Air Charter aux Marquises" },
  { match: "Part-147", type: "catalogue", source: "Catalogue, section 4.2.1 (p. 27) — Client: Air Formation", quote: "Mise en place cles en main d'un centre Part-147 — infrastructure et agrement — Air Formation" },
  { match: "aeroports de Moorea et Huahine", type: "catalogue", source: "Catalogue, section 2.2.1 (p. 21) — Client: DAC-Pf", quote: "Elaboration d'un schema d'amenagement des plateformes aeroportuaires de Moorea et Huahine pour la DAC-Pf" },
  { match: "Bilan carbone", type: "catalogue", source: "Catalogue, section 3.2.1 (p. 24) — Client: DAC-Pf", quote: "Evaluation du bilan carbone de la DAC-Pf et elaboration d'une feuille de route pour la decarbonation" },
  { match: "aeroports marins", type: "catalogue", source: "Catalogue, section 2.3 (p. 22) — Client: Terciel SAS", quote: "Modele economique, brochure commerciale et cahier des charges pour aeroports marins innovants et flottants" },
  { match: "liaison aerienne regionale", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Marche d'etude — Ligne aerienne Tahiti – Iles Cook – Tonga – Samoa – Fidji" },
  { match: "Iles Cook", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Ligne aerienne Tahiti – Iles Cook – Tonga – Samoa – Fidji" },
  // Values
  { match: "Plus de 30 missions realisees dans le secteur aerien", type: "catalogue", source: "Catalogue, chapitres 1 et 2 (pp. 8-22) — comptage", quote: "30+ missions dans les domaines aviation et aeroports : structuration compagnies, audits, documentation, securite, drones, schemas amenagement" },
  { match: "certification biodiversite", type: "catalogue", source: "Catalogue, section 3.1 (p. 23)", quote: "Certification biodiversite — Developpement, deploiement et promotion du dispositif de certification en Polynesie francaise" },
  // Territories
  { match: "Polynesie francaise", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "Siege social : PK 17,900 COTE MER — PUNAAUIA — POLYNESIE FRANCAISE. Majorite des 61 missions realisees sur ce territoire" },
  { match: "Nouvelle-Caledonie", type: "catalogue", source: "Catalogue, sections 1.1.4, 1.3.5-1.3.6, 5.1.3 (pp. 9, 13, 29)", quote: "Air Loyaute (Noumea, 2019-2023), etude faisabilite Lifou (Wanaham/Hmelek), Province des Iles Loyaute (DPA, appui strategique ports et aeroports)" },
  { match: "Wallis et Futuna", type: "catalogue", source: "Catalogue, section 5.1.1 (p. 29) — Client: Air Loyaute", quote: "Mise en place DSP Wallis & Futuna — Assistance strategique et operationnelle" },
  { match: "Pacifique Sud", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Marche d'etude — Ligne aerienne Tahiti – Iles Cook – Tonga – Samoa – Fidji, etude de faisabilite d'une liaison regionale" },
  // Legal
  { match: "SAS au capital de 200 000 FCFP", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "PACIFIC BLUE CONSULTING est une Societe par Actions Simplifiee, au capital initial de 200 000 FCFP" },
  { match: "PK 17,900", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "Adresse du siege social : PK 17,900 COTE MER — PUNAAUIA — POLYNESIE FRANCAISE" },
  { match: "G28823", type: "catalogue", source: "Catalogue, mentions legales (p. 7)", quote: "Numero Tahiti : G28823" },
  // Logo symbolique
  { match: "coquillage stylise", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "L'identite visuelle de Pacific Blue Consulting prolonge cette vision : elle nait d'un coquillage stylise dont la spirale s'ouvre et s'agrandit a mesure qu'elle se deploie" },

  // ─── EXPERTISE (data from expertise.ts) ───
  { match: "Etudes & Strategie", type: "catalogue", source: "Catalogue, synthese expertise 1 (p. 33) + sections 1.2, 5.1", quote: "Faisabilite, modelisation economique, etudes de marche, schemas directeurs, positionnement strategique, strategies de concession, liaisons aeriennes regionales, decarbonation et drones" },
  { match: "Audits & Conformite", type: "catalogue", source: "Catalogue, synthese expertise 2 (p. 33) + section 1.3 (pp. 12-13)", quote: "Audits reglementaires aviation civile, conformite Part-145/Part-M (maintenance), plans d'actions conformite, certification aerodromes, Part-OPS, Part-CAMO, EIE/NIE" },
  { match: "Documentation & Certification", type: "catalogue", source: "Catalogue, synthese expertise 3 (p. 34) + section 1.4 (pp. 14-16)", quote: "MANEX (47 docs Islands Airline), procedures operationnelles, RCO SSLIA, manuels AFIS, maintenance electrotechnique, manuels UAV, cahiers des charges, matrices de conformite, MEL" },
  { match: "Formation & Concours", type: "catalogue", source: "Catalogue, synthese expertise 4 (p. 34) + chapitre 4 (pp. 25-28)", quote: "Management et conduite du changement, gestion de projet, codeveloppement, tutoring, centres Part-147 agrees, instructeurs, supports MTOE, concours DGRH, creation d'entreprises" },
  { match: "AMO & Projets", type: "catalogue", source: "Catalogue, synthese expertise 5 (p. 34) + section 5.2 (p. 31)", quote: "Cadrage et planification, coordination multi-acteurs, suivi des risques, candidatures concessions, pilotage projets helicopteres, dessertes inter-iles, schemas amenagement, DSP, appui strategique integre" },
  { match: "Creation / Structuration", type: "catalogue", source: "Catalogue, synthese expertise 6 (p. 34) + section 1.1 (pp. 8-9)", quote: "TNH, Islands Airline, Air Bora Bora, Air Loyaute — creation compagnies, centres de formation agrees, modeles economiques innovants, CTA, organisations operationnelles" },
  { match: "Gestion de la Securite", type: "catalogue", source: "Catalogue, synthese expertise 7 (p. 35) + section 1.5 (p. 17)", quote: "SGS Air Loyaute, securite exploitation Marquises (TAC), continuite territoriale aerienne, EISA pour la DAC-Pf, demonstration de conformite autorites" },
  { match: "Organisation & Management", type: "catalogue", source: "Catalogue, synthese expertise 8 (p. 35) + section 4.3 (p. 28)", quote: "Diagnostics organisationnels, structuration fonction RH (Air Loyaute), optimisation processus, plans d'actions management, coaching professionnel et executive coaching" },
  { match: "Analyses de faisabilite", type: "catalogue", source: "Catalogue, synthese Etudes (p. 33)", quote: "Analyses de faisabilite technico-economique" },
  { match: "Modelisation economique et business plans", type: "catalogue", source: "Catalogue, synthese Etudes (p. 33)", quote: "Modelisation economique et business plans" },
  { match: "Creation et structuration de Tahiti Nui Helicopters", type: "catalogue", source: "Catalogue, section 1.1.1 (p. 8) — Partenaires ATN, 2017-2018", quote: "Conception et structuration completes de la nouvelle compagnie d'helicopteres TNH : analyse strategique, choix des machines, bases, maintenance, modele economique, gouvernance, plan de demarrage" },
  { match: "Strategie de concession pour Vinci Airports", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10) — 2020", quote: "Appui strategique a une candidature de concession aeroportuaire majeure — Tahiti-Faa'a" },
  { match: "MANEX et documentation d'Islands Airline", type: "catalogue", source: "Catalogue, section 1.4.1 (p. 14) — Islands Airline, 2019", quote: "47 documents operationnels : MANEX A/B/C/D, MGN, MGS, matrices de conformite pour obtention du CTA" },
  { match: "Audit reglementaire DAC-Pf", type: "catalogue", source: "Catalogue, section 1.3.1 (p. 12)", quote: "Audit organisationnel — Direction de l'Aviation Civile de Polynesie francaise" },
  { match: "Diagnostic et certification du reseau", type: "catalogue", source: "Catalogue, sections 2.1.2-2.1.3 (p. 19)", quote: "Diagnostic de conformite du reseau d'aerodromes polynesiens + certification des aeroports par aerodrome" },
  { match: "Programmes CNAM", type: "catalogue", source: "Catalogue, section 4.1.1 (p. 25)", quote: "Missions de formation CNAM — Club des Managers" },
  { match: "Renforcement du SGS", type: "catalogue", source: "Catalogue, section 1.3.6 (p. 13) — Air Loyaute", quote: "Systeme de gestion de la securite (SGS) — Renforcement et accompagnement — Air Loyaute" },
  { match: "EIE/NIE pour la DIREN", type: "catalogue", source: "Catalogue, section 3.1.3 (p. 23)", quote: "Direction de l'Environnement — Actualisation du dispositif d'evaluation environnementale (EIE/NIE) en Polynesie francaise" },
  { match: "DSP Wallis", type: "catalogue", source: "Catalogue, section 5.1.1 (p. 29) — Air Loyaute", quote: "Mise en place DSP Wallis & Futuna — Assistance strategique et operationnelle" },

  // ─── EXPERTISE PAGE — hero + descriptions ───
  { match: "Fort de plus de 30 ans d'experience", type: "catalogue", source: "Catalogue, Introduction (p. 5), 2e paragraphe", quote: "plus de trente annees d'experience de direction et de pilotage de systemes complexes dans l'aviation civile" },
  { match: "Des competences au service de vos ambitions", type: "editorial", source: "Redaction editoriale", quote: "Titre editorial pour la page Expertise" },
  { match: "palette d'expertises complementaires", type: "catalogue", source: "Catalogue, chapitre 7 'Synthese par famille d'offre' (pp. 33-35)", quote: "8 domaines d'expertise documentes couvrant la chaine complete : etudes, audits, documentation, formation, AMO, creation, securite, management" },
  { match: "Nos interventions", type: "catalogue", source: "Catalogue, listes de details par expertise", quote: "Chaque expertise liste ses types d'intervention dans le catalogue" },
  { match: "Exemples de missions", type: "catalogue", source: "Catalogue, exemples par expertise", quote: "Chaque expertise liste ses missions realisees dans le catalogue" },
  { match: "Discuter de votre projet", type: "editorial", source: "Redaction editoriale", quote: "CTA editorial" },
  { match: "Vous avez un projet en tete", type: "editorial", source: "Redaction editoriale", quote: "CTA de fin de page editorial" },
  { match: "Expertise en analyse de faisabilite", type: "catalogue", source: "Catalogue, expertise Etudes & Strategie, description", quote: "Expertise en analyse de faisabilite, modelisation economique, etudes de marche..." },
  { match: "Realisation d'audits complets", type: "catalogue", source: "Catalogue, expertise Audits & Conformite, description", quote: "Realisation d'audits complets et d'appuis a la mise en conformite des activites aeriennes..." },
  { match: "Redaction et structuration de manuels", type: "catalogue", source: "Catalogue, expertise Documentation & Certification, description", quote: "Redaction et structuration de manuels, procedures, matrices de conformite..." },
  { match: "Conception et animation de formations", type: "catalogue", source: "Catalogue, expertise Formation & Concours, description", quote: "Conception et animation de formations manageriales et techniques..." },
  { match: "Assistance a maitrise d'ouvrage", type: "catalogue", source: "Catalogue, expertise AMO & Projets, description", quote: "Assistance a maitrise d'ouvrage pour des projets complexes : cadrage, planification, coordination..." },
  { match: "Appui a la creation ou a la structuration", type: "catalogue", source: "Catalogue, expertise Creation / Structuration, description", quote: "Appui a la creation ou a la structuration d'entites : compagnies aeriennes, centres de formation..." },
  { match: "Renforcement des dispositifs de gestion", type: "catalogue", source: "Catalogue, expertise Gestion de la Securite, description", quote: "Renforcement des dispositifs de gestion de la securite : SGS, cartographie des risques..." },
  { match: "Diagnostics organisationnels", type: "catalogue", source: "Catalogue, expertise Organisation & Management, description", quote: "Diagnostics organisationnels, structuration de fonctions cles, optimisation de processus..." },
  // Expertise details (from expertise.ts)
  { match: "Etudes de marche sectorielles", type: "catalogue", source: "Catalogue, Etudes details", quote: "Etudes de marche sectorielles" },
  { match: "Schemas directeurs aeroportuaires", type: "catalogue", source: "Catalogue, Etudes details", quote: "Schemas directeurs aeroportuaires et territoriaux" },
  { match: "Strategies de concession", type: "catalogue", source: "Catalogue, Etudes details", quote: "Strategies de concession et candidatures" },
  { match: "Etudes de liaisons aeriennes regionales", type: "catalogue", source: "Catalogue, Etudes details", quote: "Etudes de liaisons aeriennes regionales" },
  { match: "Strategies de decarbonation et drones", type: "catalogue", source: "Catalogue, synthese Etudes (p. 33)", quote: "Travaux sur la decarbonation et les drones (strategie UAV, bilan carbone, feuille de route)" },
  { match: "Outils de modelisation de la desserte", type: "catalogue", source: "Catalogue, synthese Etudes (p. 33)", quote: "Outil de modelisation de la desserte pour la DAC-Pf" },
  { match: "Accompagnement strategique pluriannuel", type: "catalogue", source: "Catalogue, Etudes details + mission DPA", quote: "Accompagnement strategique pluriannuel de la Province des Iles Loyaute" },
  { match: "Audits reglementaires des autorites", type: "catalogue", source: "Catalogue, Audits details", quote: "Audits reglementaires des autorites de l'aviation civile" },
  { match: "Audits de conformite Part-145", type: "catalogue", source: "Catalogue, Audits details", quote: "Audits de conformite Part-145 et Part-M (maintenance)" },
  { match: "Manuels d'exploitation (MANEX)", type: "catalogue", source: "Catalogue, Documentation details", quote: "Manuels d'exploitation (MANEX) et documentation operationnelle" },
  { match: "Recueils SSLIA", type: "catalogue", source: "Catalogue, Documentation details", quote: "Recueils SSLIA et manuels AFIS" },
  { match: "Manuels d'exploitation UAV", type: "catalogue", source: "Catalogue, Documentation details", quote: "Manuels d'exploitation UAV" },
  { match: "Formation au management", type: "catalogue", source: "Catalogue, Formation details", quote: "Formation au management et conduite du changement" },
  { match: "Ateliers de codeveloppement", type: "catalogue", source: "Catalogue, Formation details", quote: "Ateliers de codeveloppement" },
  { match: "Tutoring individuel", type: "catalogue", source: "Catalogue, Formation details", quote: "Tutoring individuel et preparation diplomes" },
  { match: "Creation de centres de formation", type: "catalogue", source: "Catalogue, Formation details", quote: "Creation de centres de formation aeronautique agrees (Part-147)" },
  { match: "Elaboration de sujets et correction", type: "catalogue", source: "Catalogue, Formation details", quote: "Elaboration de sujets et correction de concours professionnels" },
  { match: "Cadrage et planification", type: "catalogue", source: "Catalogue, AMO details", quote: "Cadrage et planification de projets complexes" },
  { match: "Coordination multi-acteurs", type: "catalogue", source: "Catalogue, AMO details", quote: "Coordination multi-acteurs et parties prenantes" },
  { match: "Pilotage de projets helicopteres", type: "catalogue", source: "Catalogue, AMO details", quote: "Pilotage de projets helicopteres et redeploiement" },
  { match: "Accompagnement DSP", type: "catalogue", source: "Catalogue, AMO details", quote: "Accompagnement DSP (Delegation de Service Public)" },
  { match: "Creation et structuration de compagnies", type: "catalogue", source: "Catalogue, Creation details", quote: "Creation et structuration de compagnies aeriennes" },
  { match: "Obtention du Certificat de Transport", type: "catalogue", source: "Catalogue, Creation details", quote: "Obtention du Certificat de Transport Aerien (CTA)" },
  { match: "Systemes de Gestion de la Securite", type: "catalogue", source: "Catalogue, Securite details", quote: "Systemes de Gestion de la Securite (SGS)" },
  { match: "Cartographie et analyse des risques", type: "catalogue", source: "Catalogue, Securite details", quote: "Cartographie et analyse des risques operationnels" },
  { match: "Etudes d'Impacts sur la Securite", type: "catalogue", source: "Catalogue, Securite details", quote: "Etudes d'Impacts sur la Securite Aeroportuaire (EISA)" },
  { match: "Structuration de la fonction RH", type: "catalogue", source: "Catalogue, Organisation details", quote: "Structuration de la fonction RH" },
  { match: "Coaching professionnel et executive coaching", type: "catalogue", source: "Catalogue, Organisation details + bio Pascal", quote: "Coaching professionnel et executive coaching" },
  // Expertise examples (missions)
  { match: "Creation et Business plan d'Islands Airline", type: "catalogue", source: "Catalogue, sections 1.1.2 et 1.2.2 (pp. 8, 10)", quote: "Creation et Business plan d'Islands Airline" },
  { match: "Modele economique pour Terciel", type: "catalogue", source: "Catalogue, section 2.3.1 (p. 22)", quote: "Modele economique pour Terciel (aeroports marins)" },
  { match: "Etudes de faisabilite a Lifou", type: "catalogue", source: "Catalogue, sections 2.1.4-2.1.5 (pp. 19-20)", quote: "Etudes de faisabilite a Lifou (classification internationale et creation d'un aeroport a Hmelek)" },
  { match: "Conception du dispositif de certification biodiversite", type: "catalogue", source: "Catalogue, section 3.1.1 (p. 23)", quote: "Conception du dispositif de certification biodiversite en Polynesie" },
  { match: "Continuite territoriale aerienne", type: "catalogue", source: "Catalogue, section 1.5.2 (p. 17)", quote: "Continuite territoriale aerienne interinsulaire" },
  { match: "Etude de marche des nouveaux produits alimentaires", type: "catalogue", source: "Catalogue, section 5.1.4 (p. 30)", quote: "Etude de marche des nouveaux produits alimentaires a base de vivriers locaux (DAG, projet TAVIVAT)" },
  { match: "Etude de ligne aerienne regionale", type: "catalogue", source: "Catalogue, section 1.2.5 (p. 11)", quote: "Etude de ligne aerienne regionale Tahiti - Etats insulaires du Pacifique" },
  { match: "Audits Part-145/Part-M de TASC", type: "catalogue", source: "Catalogue, section 1.3.2 (p. 12)", quote: "Audits Part-145/Part-M de TASC" },
  { match: "Dossiers conformite et certification Air Loyaute", type: "catalogue", source: "Catalogue, sections 1.3.5-1.3.6 (p. 13)", quote: "Dossiers conformite et certification Air Loyaute" },
  { match: "Accompagnement conformite de TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14) — Tahiti Air Charter", quote: "Accompagnement conformite de TAC (Tahiti Air Charter)" },
  { match: "MEL et MANEX de TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14)", quote: "MEL et MANEX de TAC" },
  { match: "Procedures operationnelles d'Air Loyaute", type: "catalogue", source: "Catalogue, section 1.4.2 (p. 14)", quote: "Procedures operationnelles d'Air Loyaute" },
  { match: "Recueils SSLIA et AFIS de la DAC-Pf", type: "catalogue", source: "Catalogue, sections 1.4.4-1.4.5 (pp. 15-16)", quote: "Recueils SSLIA et AFIS de la DAC-Pf" },
  { match: "Cahier des charges pour aeroports marins", type: "catalogue", source: "Catalogue, section 2.3.3 (p. 22)", quote: "Cahier des charges pour aeroports marins Terciel" },
  { match: "Formation Gestion de Projet", type: "catalogue", source: "Catalogue, section 4.1.3 (p. 25)", quote: "Formation Gestion de Projet — CNAM" },
  { match: "Formation Conduite du Changement", type: "catalogue", source: "Catalogue, section 4.1.4 (p. 26)", quote: "Formation Conduite du Changement — CNAM" },
  { match: "Centre Part-147 cles en main", type: "catalogue", source: "Catalogue, section 4.2.1 (p. 27)", quote: "Centre Part-147 cles en main — Air Formation" },
  { match: "Concours DGRH", type: "catalogue", source: "Catalogue, section 4.1.7 (p. 26)", quote: "Concours DGRH — Elaboration de sujets et correction de copies" },
  { match: "Appui a la candidature de concession", type: "catalogue", source: "Catalogue, section 1.2.3 (p. 10)", quote: "Appui a la candidature de concession de Tahiti-Faa'a pour Vinci Airports" },
  { match: "Mise en place de la desserte TAC", type: "catalogue", source: "Catalogue, section 1.4.3 (p. 14)", quote: "Mise en place de la desserte TAC inter-iles" },
  { match: "AMO globale Air Bora Bora", type: "catalogue", source: "Catalogue, section 5.2.1 (p. 31)", quote: "AMO globale Air Bora Bora" },
  { match: "Base ULM de Moorea", type: "catalogue", source: "Catalogue, section 5.1.2 (p. 29)", quote: "Base ULM de Moorea (MOZ ULM)" },
  { match: "Organisation et fonction RH Air Loyaute", type: "catalogue", source: "Catalogue, section 4.3.1 (p. 28)", quote: "Organisation et fonction RH Air Loyaute — structuration et appui managerial" },
  { match: "Club des managers CNAM", type: "catalogue", source: "Catalogue, section 4.1.1 (p. 25)", quote: "Animation du Club des managers CNAM" },
  { match: "Etudes de securite pour TAC", type: "catalogue", source: "Catalogue, section 1.5.1 (p. 17)", quote: "Etudes de securite pour TAC aux Marquises" },

  // ─── A PROPOS — sections editoriales ───
  { match: "Une histoire d'expertise et d'engagement", type: "editorial", source: "Redaction editoriale", quote: "Titre de la timeline, editorial base sur le parcours documente" },
  { match: "Nos axes de differenciation", type: "editorial", source: "Redaction editoriale", quote: "Titre editorial pour la section valeurs" },
  { match: "Le coquillage, symbole de Pacific Blue", type: "editorial", source: "Redaction editoriale culturelle", quote: "Symbolique du logo PBC — reference au pu polynesien" },
  { match: "Un reseau d'experts mobilisables", type: "editorial", source: "Redaction editoriale", quote: "Description editoriale de l'ecosysteme de partenaires PBC" },
  { match: "interlocuteur unique et responsable", type: "editorial", source: "Redaction editoriale", quote: "Positionnement editorial du cabinet" },
  { match: "soixante missions conduites depuis 2017", type: "catalogue", source: "Catalogue, section biographique (apres Conclusion)", quote: "Au fil de plus de soixante missions conduites depuis 2017" },
  { match: "Au coeur du Pacifique", type: "catalogue", source: "Catalogue, zones d'intervention", quote: "Missions documentees en PF, NC, W&F et Pacifique Sud" },
  { match: "Present en Polynesie francaise depuis 2017", type: "catalogue", source: "Catalogue, date creation", quote: "Cabinet cree en 2017 a Punaauia, PF" },
  { match: "Envie de travailler ensemble", type: "editorial", source: "Redaction editoriale", quote: "CTA editorial de fin de page" },
  { match: "Structuration complete", type: "catalogue", source: "Catalogue, expertise Creation/Structuration", quote: "De la creation d'entites a la certification et operations" },
  { match: "Partenariats long terme", type: "catalogue", source: "Catalogue, Conclusion (p. 36)", quote: "Relations multi-ans avec Air Loyaute, CNAM, DIREN, DAC-Pf, demontrant confiance et impact" },
  { match: "Accompagnement de croissance", type: "catalogue", source: "Catalogue, expertises Etudes + AMO + Creation", quote: "Business plans, strategie, gestion de projets, AMO" },
  { match: "RSE et environnement", type: "catalogue", source: "Catalogue, missions environnement", quote: "Certification biodiversite, bilan carbone, feuille de route decarbonation" },
  { match: "Formation et competences", type: "catalogue", source: "Catalogue, expertise Formation", quote: "Part-147, management, compliance, tutoring" },
  { match: "Technologie et innovation", type: "catalogue", source: "Catalogue, missions drones/innovation", quote: "Drones/UAV, modelisation, outils decisionnels, aeroports marins" },
  { match: "Expertise aeronautique", type: "catalogue", source: "Catalogue, Conclusion (p. 36)", quote: "Plus de 57% du portefeuille couvre l'aerien (compagnies, aeroports, conformite EASA)" },

  // ─── CONTACT — textes page ───
  { match: "Parlons de votre projet", type: "editorial", source: "Redaction editoriale", quote: "Titre editorial page contact" },
  { match: "nous soumettre un projet", type: "editorial", source: "Redaction editoriale", quote: "Description editoriale du formulaire" },
  { match: "Coordonnees", type: "catalogue", source: "Catalogue, page de garde + mentions legales", quote: "Email, telephone et adresse issus du catalogue" },
  { match: "Nos domaines", type: "catalogue", source: "Catalogue, 8 expertises", quote: "Les 8 expertises listees dans le catalogue" },
  { match: "Conseil strategique et performance", type: "derived", source: "Derive des expertises du catalogue", quote: "Synthese des expertises Etudes & Strategie + Organisation & Management" },
  { match: "Transition ecologique et RSE", type: "catalogue", source: "Catalogue, missions environnement", quote: "Certification biodiversite, EIE/NIE, bilan carbone" },
  { match: "Formation et developpement des competences", type: "catalogue", source: "Catalogue, expertise Formation & Concours", quote: "CNAM, Part-147, tutoring, concours" },
  { match: "Certification ISO", type: "flyer", source: "Flyer PBC, liste des services", quote: "Conseil et accompagnement en certification ISO (9001, 14001, 45001)" },

  // ─── REFERENCES — textes page ───
  { match: "Selection d'interventions realisees", type: "catalogue", source: "Catalogue, 61 missions", quote: "Missions realisees en PF, NC et Pacifique Sud" },
  { match: "Votre projet pourrait figurer ici", type: "editorial", source: "Redaction editoriale", quote: "CTA editorial de fin de page" },

  // ─── FOOTER ───
  { match: "Pacific Blue Consulting", type: "catalogue", source: "Catalogue, page de garde", quote: "Pacific Blue Consulting" },
  { match: "Votre boussole", type: "flyer", source: "Flyer page 1, slogan", quote: "Votre boussole dans un monde complexe" },

  // ─── CONTACT ───
  { match: "pacificblueconsulting@zoho.com", type: "catalogue", source: "Catalogue, coordonnees", quote: "pacificblueconsulting@zoho.com" },
  { match: "+689 87 747 284", type: "catalogue", source: "Catalogue, coordonnees + Flyer (Mobile : 87-747-284, prefixe +689 ajoute)", quote: "Mobile : 87-747-284 (flyer) — prefixe international +689 ajoute pour le site" },
  { match: "Punaauia", type: "catalogue", source: "Catalogue, adresse siege", quote: "PK 17,900 Cote Mer, Punaauia" },

  // ─── REFERENCES ───
  { match: "Des missions concretes depuis 2017", type: "catalogue", source: "Catalogue, 61 missions", quote: "Toutes les fiches missions sont sourcees du Catalogue des Missions PBC" },
  { match: "8 domaines au service du Pacifique", type: "catalogue", source: "Catalogue, 8 expertises", quote: "Etudes, Audits, Documentation, Formation, AMO, Creation, Securite, Organisation" },
  { match: "Nos missions depuis 2017", type: "catalogue", source: "Catalogue, historique", quote: "61 missions depuis la creation du cabinet en 2017" },

  // ─── MISSING ENTRIES (identified by audit) ───
  { match: "Pascal Bazer-Bachi", type: "catalogue", source: "Catalogue, section 'Qui est Pascal BAZER-BACHI ?' (apres Conclusion)", quote: "Fondateur et president de Pacific Blue Consulting, Pascal BAZER-BACHI met au service de ses clients plus de trente annees d'experience de direction et de pilotage de systemes complexes" },
  { match: "Fondateur", type: "catalogue", source: "Catalogue, Introduction (p. 5) + section biographique (apres Conclusion)", quote: "Fonde en 2017 par Pascal BAZER-BACHI" },
  { match: "Prendre rendez-vous", type: "editorial", source: "Redaction editoriale — CTA principal", quote: "Appel a l'action invitant les prospects a contacter le cabinet" },
  { match: "Decouvrir nos expertises", type: "editorial", source: "Redaction editoriale — CTA secondaire", quote: "Redirige vers la page Expertise detaillant les 8 domaines du catalogue" },
  { match: "Ils nous font confiance", type: "catalogue", source: "Catalogue, chapitres 1 a 6 — clients recurrents", quote: "18 partenaires documentes dans les 61 fiches missions : DAC-Pf, Air Loyaute, CNAM, Terciel, Vinci Airports, DIREN, Air Formation..." },
  { match: "Un projet ? Une question ?", type: "editorial", source: "Redaction editoriale — CTA de fin de page", quote: "Invitation editoriale a prendre contact avec le cabinet" },
  { match: "Acteurs publics, compagnies aeriennes, entreprises privees", type: "catalogue", source: "Catalogue, Introduction (p. 5)", quote: "Pacific Blue Consulting accompagne les acteurs publics et prives dans leurs projets de transformation" },
  { match: "Notre ecosysteme", type: "catalogue", source: "Catalogue, section 'Un ecosysteme d'experts mobilisables' (apres Conclusion)", quote: "Pacific Blue Consulting intervient comme interlocuteur unique et responsable de la qualite des missions, tout en s'appuyant sur un ecosysteme d'experts et de structures partenaires" },
  { match: "Tous droits reserves", type: "editorial", source: "Mention legale editoriale", quote: "Copyright standard du site web" },
];

const TYPE_STYLES = {
  catalogue: { bg: "#ecfdf5", text: "#047857", label: "Catalogue des Missions", dot: "#10b981" },
  flyer: { bg: "#eff6ff", text: "#1d4ed8", label: "Flyer PBC", dot: "#3b82f6" },
  editorial: { bg: "#fffbeb", text: "#b45309", label: "Redaction editoriale", dot: "#f59e0b" },
  derived: { bg: "#faf5ff", text: "#7c3aed", label: "Derive des sources", dot: "#8b5cf6" },
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
          <span style={{ color: "#94a3b8" }}>Elements annotes</span>
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
