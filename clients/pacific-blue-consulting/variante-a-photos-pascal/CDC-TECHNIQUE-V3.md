# CDC TECHNIQUE — PBC Variante A (dérivé du CDC v3 de Pascal)

> Source de vérité : `/tmp/PBC_Cahier_des_Charges_v3.docx` (33903 bytes, avril 2026)
> Ce document traduit chaque exigence du CDC client en spécification technique vérifiable.
> Légende : ✅ = conforme | ⚠️ = à faire | ❌ = non-conforme

---

## 0. DÉCISIONS GLOBALES

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 0.1 | Variante A (photos originales) | Projet = `variante-a-photos-pascal/` | ✅ |
| 0.2 | Arborescence : Accueil \| Offres \| Réalisations \| Le Cabinet \| Perspectives \| Contact | 6 routes dans `src/app/` : `/`, `/offres`, `/realisations`, `/le-cabinet`, `/perspectives`, `/contact` | ✅ |
| 0.3 | ❌ Expertise → Offres | `src/app/expertise/` supprimé | ✅ |
| 0.4 | ❌ Références → Réalisations | `src/app/references/` supprimé | ✅ |
| 0.5 | ❌ À propos → Le Cabinet | `src/app/a-propos/` supprimé | ✅ |
| 0.6 | Balise title = "Pacific Blue Consulting \| Architecte de projets complexes dans le Pacifique" | `layout.tsx` metadata.title.default | ✅ |
| 0.7 | Méta-description = texte exact CDC | `layout.tsx` metadata.description | ✅ |
| 0.8 | Footer description = texte exact CDC | `Footer.tsx` paragraphe description | ✅ |
| 0.9 | Schema.org ConsultingBusiness | `layout.tsx` JSON-LD | ✅ |

---

## 1. PAGE ACCUEIL (`src/app/page.tsx`)

### 1.1 Hero

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 1.1.1 | Sur-titre | "Cabinet de conseil indépendant - Polynésie française" | ✅ |
| 1.1.2 | Titre | "Architecte de projets complexes en milieu insulaire" | ✅ |
| 1.1.3 | Sous-titre | "Depuis 2017, Pacific Blue Consulting conçoit, structure et sécurise les projets qui transforment les territoires du Pacifique - du transport aérien à la souveraineté alimentaire, de la sécurité aéroportuaire aux infrastructures." | ✅ |
| 1.1.4 | Bouton 1 | "Découvrir nos réalisations" → `/realisations` | ✅ |
| 1.1.5 | Bouton 2 | "Échanger sur votre projet" → `/contact` | ✅ |
| 1.1.6 | 📷 Photo | FOTEA.png (vue aérienne atoll depuis avion) | ⚠️ PLACEHOLDER — photos non reçues |

### 1.2 Section 4 Territoires

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 1.2.1 | Titre section | "Quatre territoires d'intervention, une même exigence" | ✅ |
| 1.2.2 | Sous-titre section | "Nous intervenons là où la complexité réglementaire, géographique et humaine exige une expertise qui va au-delà du conseil classique." | ✅ |
| 1.2.3 | Carte 1 titre | "Mobilités & Transport aérien" | ✅ |
| 1.2.4 | Carte 1 sous-titre | "Créer, structurer et sécuriser les opérations aériennes" | ✅ |
| 1.2.5 | Carte 1 description | texte complet CDC (compagnies aériennes, certification, EASA...) | ✅ |
| 1.2.6 | 📷 Carte 1 | F-OTEA_Bora.JPG | ⚠️ PLACEHOLDER |
| 1.2.7 | Carte 2 titre | "Infrastructures & Territoires" | ✅ |
| 1.2.8 | Carte 2 sous-titre | "Concevoir les plateformes qui connectent les populations" | ✅ |
| 1.2.9 | Carte 2 description | texte complet CDC (aéroports, aérodromes, ports...) | ✅ |
| 1.2.10 | 📷 Carte 2 | RGI1.PNG | ⚠️ PLACEHOLDER |
| 1.2.11 | Carte 3 titre | "Environnement & Souveraineté" | ✅ |
| 1.2.12 | Carte 3 sous-titre | "Accompagner la transition écologique et la résilience des territoires" | ✅ |
| 1.2.13 | Carte 3 description | texte complet CDC (bilan carbone, biodiversité...) | ✅ |
| 1.2.14 | 📷 Carte 3 | Nuku_Hiva.jpg | ⚠️ PLACEHOLDER |
| 1.2.15 | Carte 4 titre | "Transformation & Compétences" | ✅ |
| 1.2.16 | Carte 4 sous-titre | "Structurer les organisations et développer les talents" | ✅ |
| 1.2.17 | Carte 4 description | texte complet CDC (formation cadres, coaching...) | ✅ |
| 1.2.18 | 📷 Carte 4 | À sourcer Unsplash "workshop team whiteboard" | ⚠️ PLACEHOLDER |
| 1.2.19 | Lien cartes | Chaque carte → `/offres#{ancre}` | ✅ |

### 1.3 Missions Emblématiques (NOUVELLE SECTION)

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 1.3.1 | Position | Entre 4 cartes et "Pourquoi nous" | ✅ |
| 1.3.2 | Titre | "Des projets qui ont changé la donne" | ✅ |
| 1.3.3 | Sous-titre | "Plus de 60 missions réalisées depuis 2017. En voici quelques-unes qui illustrent notre manière de travailler." | ✅ |
| 1.3.4 | Mission 1 | [Mobilités] TNH (2017-2018) "Créer un opérateur hélicoptère de A à Z" 📷 TNH.png | ✅ texte / ⚠️ photo |
| 1.3.5 | Mission 2 | [Infrastructures] Province Loyauté (2024-2029) "Accompagnement intégré ports et aéroports" 📷 Aratika.jpg | ✅ texte / ⚠️ photo |
| 1.3.6 | Mission 3 | [Mobilités] 10 EISA (2024-2025) "Sécuriser les travaux aéroportuaires du Pacifique" 📷 RGI1.PNG | ✅ texte / ⚠️ photo |
| 1.3.7 | Mission 4 | [Environnement] TAVIVAT (2025-2030) "Souveraineté alimentaire - piloter la transition" 📷 Taro.jpg | ✅ texte / ⚠️ photo |
| 1.3.8 | Mission 5 | [Environnement] DIREN (2021-2023) "Inventer un dispositif de certification" 📷 Nuku_Hiva.jpg | ✅ texte / ⚠️ photo |
| 1.3.9 | Mission 6 | [Mobilités] Pacifique Sud (2025) "Connecter les États insulaires du Pacifique" 📷 RGI3.JPG | ✅ texte / ⚠️ photo |

### 1.4 Chiffres Clés

| # | Exigence CDC | Valeur attendue | Status |
|---|---|---|---|
| 1.4.1 | ❌ "8 Domaines" → | "8 Années d'activité" | ✅ |
| 1.4.2 | ❌ "3 Territoires" → | "4 Territoires du Pacifique" | ✅ |
| 1.4.3 | ➡ | "60+ Missions" | ✅ |
| 1.4.4 | ➡ | "100% Indépendant" | ✅ |

### 1.5 Section "Pourquoi nous"

| # | Exigence CDC | Status |
|---|---|---|
| 1.5.1 | ➡ Structure générale conservée | ✅ |
| 1.5.2 | Lien "Découvrir le cabinet" → `/le-cabinet` (pas `/a-propos`) | ✅ |

### 1.6 Bloc Clients

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 1.6.1 | Titre | "Ils nous font confiance" | ✅ |
| 1.6.2 | Format | Logos en grille, PNG fond transparent. Noms en texte si logo indisponible | ⚠️ EN COURS — logos en téléchargement |
| 1.6.3 | INSTITUTIONNELS | DAC-Pf, DGAC/SEAC-Pf, Ministère des Transports, DIREN, DAG, Province des Îles Loyauté, Commune de Moorea, Commune de Hiva Oa, DGEE, Gouvernement PF (10) | ✅ données |
| 1.6.4 | COMPAGNIES AÉRIENNES | Air Loyauté, ATN/TNH, Air Bora Bora (City Pf), Islands Airline, IAS, TAC, TASC (7) | ✅ données |
| 1.6.5 | GRANDS GROUPES | Vinci Airports, Pacific Beachcomber/Air Tetiaroa, Terciel, Dexios, Etik Pf/AdT (5) | ✅ données |
| 1.6.6 | FORMATION | CNAM, HSF (2) | ✅ données |
| 1.6.7 | AUTRES | Kroma Prod, SAT (Service Artisanat Traditionnel), TGW, MOZ ULM (4) | ✅ données |

### 1.7 Bloc Partenaires (NOUVEAU)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 1.7.1 | Bloc distinct, visuellement différencié | Section séparée avec bg différent | ✅ |
| 1.7.2 | Titre | "Nos partenaires" | ✅ |
| 1.7.3 | Sous-titre | "Un réseau d'expertise pour des interventions intégrées" | ✅ |
| 1.7.4 | 12 partenaires | To70, Tamau Conseil, Etik Polynésie, CGX Aero, PenUAS, BIM Pearl, Magis, Birds Conseil, Pacific Sud Survey (PSS), Delta Polynesia, L2L Prévention, Milanamos | ✅ données |
| 1.7.5 | NB exclusion | Ironetik, Terciel, TPB, ISS = PAS dans partenaires (sociétés Pascal → Le Cabinet) | ✅ |

### 1.8 CTA Bas de Page

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 1.8.1 | Titre | "Votre prochain projet mérite une conversation." | ✅ |
| 1.8.2 | Sous-titre | "Collectivités, opérateurs aériens, entreprises, porteurs de projets - nous sommes à votre écoute." | ✅ |
| 1.8.3 | 📷 Photo | IMG_E8221.JPG (ponton bois vers lagon) | ⚠️ PLACEHOLDER |

---

## 2. PAGE OFFRES (`src/app/offres/page.tsx`)

### 2.0 En-tête

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 2.0.1 | URL | `/offres` | ✅ |
| 2.0.2 | Titre | "Nos offres" | ✅ |
| 2.0.3 | Sous-titre | "Quatre territoires d'intervention, une même promesse : comprendre votre contexte, structurer votre projet, et vous accompagner jusqu'à la mise en œuvre." | ✅ |
| 2.0.4 | 📷 Bandeau | aratika-nouveau-village-vue-avion.jpg | ⚠️ PLACEHOLDER (bg navy) |
| 2.0.5 | Navigation sticky | 4 ancres : #mobilites, #infrastructures, #environnement, #transformation | ✅ |

### 2.1 Mobilités & Transport aérien

| # | Exigence CDC | Fichier source | Status |
|---|---|---|---|
| 2.1.1 | Ancre | `#mobilites` | ✅ |
| 2.1.2 | Titre | "Mobilités & Transport aérien" | ✅ |
| 2.1.3 | Sous-titre | "Créer, structurer et sécuriser les opérations aériennes" | ✅ |
| 2.1.4 | Notre approche | 3 paragraphes EXACTS du CDC (lignes 148-150) | ✅ `territories.ts` |
| 2.1.5 | Ce que cela couvre | 11 items EXACTS du CDC (lignes 152-162) | ✅ `territories.ts` |
| 2.1.6 | Focus EISA et Sûreté | 3 paragraphes EXACTS du CDC (lignes 164-166) | ✅ `territories.ts` |
| 2.1.7 | Missions clés | 10 missions EXACTES du CDC (lignes 168-177) | ✅ `territories.ts` |
| 2.1.8 | Résultat pour vous | Texte EXACT CDC (lignes 178-179) | ✅ `territories.ts` |

### 2.2 Infrastructures & Territoires

| # | Exigence CDC | Fichier source | Status |
|---|---|---|---|
| 2.2.1 | Ancre | `#infrastructures` | ✅ |
| 2.2.2 | Titre | "Infrastructures & Territoires" | ✅ |
| 2.2.3 | Sous-titre | "Concevoir les plateformes qui connectent les populations" | ✅ |
| 2.2.4 | Notre approche | 2 paragraphes EXACTS du CDC (lignes 184-185) | ✅ |
| 2.2.5 | ❌ PAS de "Ce que cela couvre" | CDC ne fournit PAS cette section pour Infra | ✅ (supprimé) |
| 2.2.6 | ❌ PAS de "Focus" | CDC ne fournit PAS cette section pour Infra | ✅ |
| 2.2.7 | Missions clés | 7 missions EXACTES du CDC (lignes 187-193) | ✅ |
| 2.2.8 | ❌ PAS de "Résultat pour vous" | CDC ne fournit PAS cette section pour Infra | ✅ (supprimé) |

### 2.3 Environnement & Souveraineté

| # | Exigence CDC | Fichier source | Status |
|---|---|---|---|
| 2.3.1 | Ancre | `#environnement` | ✅ |
| 2.3.2 | Titre | "Environnement & Souveraineté" | ✅ |
| 2.3.3 | Sous-titre | "Accompagner la transition écologique et la résilience des territoires" | ✅ |
| 2.3.4 | Notre approche | 2 paragraphes EXACTS du CDC (lignes 198-199) | ✅ |
| 2.3.5 | ❌ PAS de "Ce que cela couvre" | CDC ne fournit PAS cette section pour Env | ✅ (supprimé) |
| 2.3.6 | ❌ PAS de "Focus" | | ✅ |
| 2.3.7 | Missions clés | 6 missions EXACTES du CDC (lignes 201-206) | ✅ |
| 2.3.8 | ❌ PAS de "Résultat pour vous" | CDC ne fournit PAS cette section pour Env | ✅ (supprimé) |

### 2.4 Transformation & Compétences

| # | Exigence CDC | Fichier source | Status |
|---|---|---|---|
| 2.4.1 | Ancre | `#transformation` | ✅ |
| 2.4.2 | Titre | "Transformation & Compétences" | ✅ |
| 2.4.3 | Sous-titre | "Structurer les organisations et développer les talents" | ✅ |
| 2.4.4 | Notre approche | 2 paragraphes EXACTS du CDC (lignes 211-212) | ✅ |
| 2.4.5 | ❌ PAS de "Ce que cela couvre" | CDC ne fournit PAS cette section pour Transfo | ✅ (supprimé) |
| 2.4.6 | ❌ PAS de "Focus" | | ✅ |
| 2.4.7 | Missions clés | 5 missions EXACTES du CDC (lignes 214-218) | ✅ |
| 2.4.8 | Résultat pour vous | Texte EXACT CDC (lignes 219-220) | ✅ |

### 2.5 CTA Fin de Page

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 2.5.1 | Phrase 1 | "Vous avez un projet dans ce domaine ? Parlons-en." | ✅ |
| 2.5.2 | Phrase 2 | "Chaque contexte est unique - notre première contribution est de vous aider à le clarifier." | ✅ |

---

## 3. PAGE RÉALISATIONS (`src/app/realisations/page.tsx`)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 3.1 | URL | `/realisations` | ✅ |
| 3.2 | Titre | "Nos réalisations" | ✅ |
| 3.3 | Sous-titre | "Plus de 60 missions réalisées en Polynésie française, Nouvelle-Calédonie et dans le Pacifique. Des projets concrets, des résultats mesurables." | ✅ |
| 3.4 | 📷 Bandeau | RGI3.JPG (passe d'atoll) | ⚠️ PLACEHOLDER (bg navy) |
| 3.5 | NIVEAU 1 : Success Stories | 5-6 success stories (textes à venir) → placeholder "À venir" | ✅ |
| 3.6 | NIVEAU 2 : Liste complète | 61+ missions, format existant conservé | ✅ (67 missions) |
| 3.7 | ➡ Filtres par catégorie | Filtre par domaine conservé | ✅ |
| 3.8 | ✅ Filtre par territoire géographique | PF, NC, Pacifique Sud, Wallis-Futuna | ✅ |
| 3.9 | ✅ Nouveaux clients/missions | Commune Moorea, Etik/AdT, HSF, IAS, Kroma Prod, Commune Hiva Oa | ✅ |
| 3.10 | CTA | "Votre projet pourrait être le prochain. Discutons de vos enjeux et construisons ensemble." | ✅ |

---

## 4. PAGE LE CABINET (`src/app/le-cabinet/page.tsx`)

### 4.1 Manifeste PBC (NOUVEAU)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 4.1.1 | Position | Avant le portrait, premier contenu | ✅ |
| 4.1.2 | Style | Pleine largeur, Georgia, espacement généreux (line-height: 1.85) | ✅ |
| 4.1.3 | Paragraphe 1 | "Dans un territoire où chaque île est un monde..." | ✅ EXACT |
| 4.1.4 | Paragraphe 2 | "Pacific Blue Consulting est né de cette conviction..." | ✅ EXACT |
| 4.1.5 | Paragraphe 3 | "Depuis 2017, nous créons des compagnies aériennes..." | ✅ EXACT |
| 4.1.6 | Paragraphe 4 | "Notre méthode n'a rien de mystérieux..." | ✅ EXACT |
| 4.1.7 | Paragraphe 5 | "Aucun de nos projets ne repart jamais de zéro..." | ✅ EXACT |

### 4.2 Portrait Pascal (REMPLACÉ)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 4.2.1 | ❌ Ancien texte | Supprimé | ✅ |
| 4.2.2 | Paragraphe 1 | "Trente années dans l'aviation civile..." (CNES, DGAC, EGNOS, DAC-Pf, 43 aéroports, TSA) | ✅ EXACT |
| 4.2.3 | Paragraphe 2 | "De ce parcours, Pascal a tiré une conviction..." | ✅ EXACT |
| 4.2.4 | Paragraphe 3 | "Titulaire d'une qualification EASA Form-4..." (10 EISA) | ✅ EXACT |
| 4.2.5 | Paragraphe 4 | "Chevalier de l'Ordre National du Mérite..." (Terciel, Ironetik, ISS) | ✅ EXACT |
| 4.2.6 | Paragraphe 5 | "Télépilote qualifié..." | ✅ EXACT |
| 4.2.7 | Citation | "« Je conçois le conseil comme un levier de montée en compétences... »" | ✅ EXACT |
| 4.2.8 | Style citation | Encadré, border-left gold | ✅ |
| 4.2.9 | 📷 Portrait | Nouvelle photo pro (à organiser). En attendant : photo actuelle | ✅ `pascal-fondateur.jpg` |

### 4.3 Écosystème (REMPLACÉ)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 4.3.1 | Titre | "Un interlocuteur unique, un réseau d'experts mobilisables" | ✅ |
| 4.3.2 | Texte intro | "Pacific Blue Consulting est votre interlocuteur unique..." | ✅ EXACT |
| 4.3.3 | Ironetik | "Laboratoire d'essai et expertise technique" | ✅ |
| 4.3.4 | Terciel | "Aéroports bleus entièrement flottants - Prix « Or Bleu » 2023" | ✅ |
| 4.3.5 | ISS | "Gestion de projets d'infrastructures publiques" | ✅ |

### 4.4 Sections Conservées

| # | Exigence CDC | Status |
|---|---|---|
| 4.4.1 | ➡ Timeline | ✅ |
| 4.4.2 | ➡ Coquillage | ✅ |
| 4.4.3 | ➡ Zones d'intervention | ✅ (SVG map + 4 zones) |
| 4.4.4 | ➡ Impact territorial | ✅ (4 cartes) |
| 4.4.5 | ➡ Ce que PBC apporte | ✅ (restauré — 2 paragraphes) |
| 4.4.6 | ➡ Mentions légales | ✅ (SAS, capital, PK, N° Tahiti) |

---

## 5. PAGE PERSPECTIVES (`src/app/perspectives/page.tsx`)

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 5.1 | URL | `/perspectives` | ✅ |
| 5.2 | Titre | "Perspectives" | ✅ |
| 5.3 | Sous-titre | "Analyses, notes de position et réflexions sur les sujets que nous connaissons - pour alimenter le débat et éclairer les décisions." | ✅ EXACT |
| 5.4 | Sujet 1 | "L'avenir de la desserte inter-îles : scénarios 2030" | ✅ |
| 5.5 | Sujet 2 | "Drones civils dans le Pacifique" | ✅ |
| 5.6 | Sujet 3 | "EISA : retour d'expérience sur la sécurisation des travaux aéroportuaires" | ✅ |
| 5.7 | Sujet 4 | "Sécurité et sûreté : vers une approche intégrée des risques" | ✅ |
| 5.8 | Sujet 5 | "Vivriers locaux et souveraineté alimentaire" | ✅ |
| 5.9 | Format | Page statique, badge "À venir" sur chaque sujet | ✅ |

---

## 6. PAGE CONTACT (`src/app/contact/page.tsx`)

| # | Exigence CDC | Contenu exact attendu | Status |
|---|---|---|---|
| 6.1 | ➡ Structure générale | Conservée (formulaire + sidebar coordonnées) | ✅ |
| 6.2 | Titre | "Parlons de votre projet" | ✅ |
| 6.3 | Sous-titre | "Une question, un appel d'offres, une idée à explorer - nous sommes à votre écoute. Premier échange sans engagement." | ✅ EXACT |
| 6.4 | Menu déroulant domaines | Mobilités & Transport aérien, Infrastructures & Territoires, Environnement & Souveraineté, Transformation & Compétences, Autre | ✅ |
| 6.5 | 📷 Bandeau | BN2T_TOA-2.jpg (avion Tetiaroa avec cocotiers) | ⚠️ PLACEHOLDER (air-tetiaroa.jpg) |

---

## 7. NAVIGATION (`src/components/Header.tsx`)

| # | Exigence CDC | Spécification technique | Status |
|---|---|---|---|
| 7.1 | ❌ Mega-menu 8 sous-items | Supprimé | ✅ |
| 7.2 | Menu Offres | 4 items : Mobilités, Infrastructures, Environnement, Transformation | ✅ |
| 7.3 | ❌ "A propos" | → "Le Cabinet" | ✅ |
| 7.4 | ✅ "Perspectives" | Ajouté au menu | ✅ |
| 7.5 | ➡ "Nous contacter" | Bouton CTA conservé → `/contact` | ✅ |
| 7.6 | Mega-menu left panel | "4 territoires au service du Pacifique" | ✅ |
| 7.7 | Menu mobile | Même structure simplifiée avec accordéons | ✅ |

---

## 8. DATA LAYER

### territories.ts

| # | Vérification | Status |
|---|---|---|
| 8.1 | 4 territoires (mobilites, infrastructures, environnement, transformation) | ✅ |
| 8.2 | Mobilités : approach (3 para) + coverage (11 items) + focus (3 para) + missions (10) + result | ✅ |
| 8.3 | Infrastructures : approach (2 para) + missions (7). PAS de coverage, PAS de focus, PAS de result | ✅ |
| 8.4 | Environnement : approach (2 para) + missions (6). PAS de coverage, PAS de focus, PAS de result | ✅ |
| 8.5 | Transformation : approach (2 para) + missions (5) + result. PAS de coverage, PAS de focus | ✅ |

### clients.ts

| # | Vérification | Status |
|---|---|---|
| 8.6 | 5 catégories : institutionnels, compagnies, grands-groupes, formation, autres | ✅ |
| 8.7 | 28 clients total (10+7+5+2+4) | ✅ |
| 8.8 | 12 partenaires | ✅ |
| 8.9 | Logos PNG fond transparent pour clients | ⚠️ EN COURS |
| 8.10 | Logos PNG fond transparent pour partenaires | ⚠️ EN COURS |
| 8.11 | Fallback texte si logo indisponible | ✅ code prêt |

### missions-emblematiques.ts

| # | Vérification | Status |
|---|---|---|
| 8.12 | 6 missions avec territory tag | ✅ |
| 8.13 | Titres EXACTS du CDC | ✅ |

### missions.ts

| # | Vérification | Status |
|---|---|---|
| 8.14 | 67+ missions totales | ✅ |
| 8.15 | Filtre par domaine | ✅ |
| 8.16 | Filtre par territoire géographique | ✅ |
| 8.17 | Nouveaux clients ajoutés | ✅ |

---

## ANNEXE A — PHOTOS ATTENDUES (non reçues)

| Fichier | Usage | Emplacement actuel (placeholder) |
|---|---|---|
| FOTEA.png | Hero accueil | istock-531907847.jpg |
| F-OTEA_Bora.JPG | Carte Mobilités | pbc-cockpit.jpg |
| RGI1.PNG | Carte Infrastructures + Mission EISA | pbc-aeroport.jpg / drone-pf-1.jpg |
| Nuku_Hiva.jpg | Carte Environnement + Mission DIREN | pbc-foret.jpg / pbc-corail.jpg |
| TNH.png | Mission TNH | istock-1141905690.jpg |
| Aratika.jpg | Mission Loyauté | istock-1321897221.jpg |
| Taro.jpg | Mission TAVIVAT | drone-pf-3.jpg |
| RGI3.JPG | Mission Pacifique Sud + Bandeau Réalisations | pbc-hero.jpg |
| IMG_E8221.JPG | CTA accueil | istock-975717824.jpg |
| BN2T_TOA-2.jpg | Bandeau Contact | air-tetiaroa.jpg |
| aratika-nouveau-village-vue-avion.jpg | Bandeau Offres | (bg navy, pas d'image) |
| Unsplash workshop | Carte Transformation | pbc-consulting.jpg |
| Portrait pro Pascal | Le Cabinet | pascal-fondateur.jpg |

**Action requise** : quand Pascal envoie les photos, remplacer chaque placeholder par le bon fichier dans `/public/images/`.

---

## ANNEXE B — CONTRAINTES TECHNIQUES

| Règle | Détail |
|---|---|
| Aucune photo dupliquée | Chaque image unique sur le site (vérifié) |
| Textes fond beige = copier-coller | Tous les textes marqués "fond beige" dans le CDC sont reproduits EXACTEMENT |
| Logos PNG fond transparent | Grille clients + grille partenaires |
| Noms en texte si logo indisponible | Fallback dans le composant Image/texte |
| Build TypeScript clean | `npm run build` → 0 erreur |
| Toutes routes 200 | Smoke test 6/6 routes |
| Pas de deploy prod | Preview Vercel uniquement en attendant validation |

---

**Dernière vérification** : 2026-04-06
**Branch** : `pbc-cdc-v3`
**Preview** : `pbc-variante-a.vercel.app`
