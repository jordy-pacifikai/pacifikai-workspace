# PACIFIK'AI - Mémoire Globale

> **Instructions**: Ce fichier contient l'index des clients et les patterns techniques partagés.
> Pour les détails d'un client spécifique → `clients/{nom-client}/MEMORY.md`

---

## Vue d'ensemble

**Projet**: PACIFIK'AI - Agence automatisation IA
**Objectif**: "100K Project" - Services B2B haute valeur
**Marché**: PME Polynésie française

### Format Emails
- **Ouverture**: Ia ora na
- **Fermeture**: Mauruuru

---

## Index Clients

| Client | Type | Status | Mémoire |
|--------|------|--------|---------|
| **Air Tahiti Nui** | Aérien international | Prospect Hot | [clients/air-tahiti-nui/MEMORY.md](clients/air-tahiti-nui/MEMORY.md) |
| **Air Tahiti** | Aérien inter-îles | Démo prête | [clients/air-tahiti/MEMORY.md](clients/air-tahiti/MEMORY.md) |

**Template nouveau client**: [clients/_template-client/MEMORY.md](clients/_template-client/MEMORY.md)

---

## Solutions Développées (avant clients)

| Solution | Secteur | Status | Dossier |
|----------|---------|--------|---------|
| **BookFlow** | Beauté/Bien-être | 🔄 En cours | [solutions/bookflow/](solutions/bookflow/) |
| Chatbot Hôtels (RAG) | Hôtellerie | ✅ Fonctionnel | - |
| Extraction Documents Comptables | Comptabilité | ✅ Fonctionnel | - |
| Prise de Commandes Importateurs | Import/Distribution | ✅ Fonctionnel | - |
| Réservations Restaurants | Restauration | 🔄 Test/Debug | - |

### BookFlow - SaaS Prise de RDV
- **Stack**: React Native + Expo + Supabase
- **Cible**: Coiffeurs, ongles, coachs, estheticiennes
- **Pricing**: Freemium (concurrent Fresha)
- **Entree**: `solutions/bookflow/MASTER.md`
- **Supabase**: celwaekgtxknzwyjrjym (Singapore)
- **Status Sprint 1**: 90% (manque WatermelonDB)
- **Ecrans**: 24 crees (auth, client, pro, onboarding)
- **Hooks**: 5 (auth, business, services, clients, appointments)
- **Test**: `cd solutions/bookflow/app && npx expo start --web`

---

## Stack Technique Partagée

### MCP Servers

| MCP | Usage |
|-----|-------|
| `mcp__n8n-mcp__*` | API n8n (créer/modifier workflows) |
| `mcp__MCP_DOCKER__browser_*` | Playwright (UI n8n) |
| `mcp__supabase__*` | Base de données PostgreSQL |

### Credentials n8n (partagés)

| Service | Credential ID |
|---------|---------------|
| Supabase | `ZXsTUa2CdHjOfidM` |
| Google Gemini | `xERpPocwVwoOc0v1` |
| Anthropic | `RZBAWo1xbQsFLpUH` |

### n8n Instance

```
URL: https://n8n.srv1140766.hstgr.cloud
Email: jordybanks@mail.com
Password: Sennosen2258#
```

### Supabase

```
Host: ogsimsfqwibcmotaeevb.supabase.co
Connexion: GitHub (jordybanks@mail.com)
```

### Airtable PACIFIK'AI

```
Base ID: appF7pltUaQkOlKM5
API Key: patOOpXRc... (dans AIRTABLE_CONFIG du dashboard)
```

| Table | ID | Usage |
|-------|-----|-------|
| CRM | `tbluw05otXoESeQkz` | Prospects |
| Tasks | `tblOqUUWT2ExGfjGw` | Tâches opérationnelles |
| Roadmap | - | Milestones business |
| Content Calendar | - | Posts Facebook |

**Champs CRM:**
- Entreprise, Contact, Email, Téléphone, Poste
- Secteur, Status, Priorité, Valeur, Date, Notes

### Claude API

```
Model: claude-sonnet-4-5-20250929
API Key: [RÉVOQUÉE - Remplacer dans dashboard/index.html]
```

**IMPORTANT**: Claude Haiku banni. Minimum = Sonnet 4.5

---

## Patterns n8n Réutilisables

### RÈGLE CRITIQUE: Sync Airtable
**À chaque création d'asset** (landing page, workflow, démo, fichier):
1. Créer l'asset
2. **IMMÉDIATEMENT** mettre à jour Airtable (table CRM, champ Assets ou notes)
3. Le dashboard PACIFIK'AI doit refléter les changements en temps réel

### Création workflow avec IA

```
1. mcp__n8n-mcp__n8n_create_workflow (structure)
2. Si connexions AI complexes → Playwright browser pour configurer
3. mcp__n8n-mcp__n8n_validate_workflow
4. Test webhook
5. **AIRTABLE**: Mettre à jour le prospect avec le nouvel asset
```

### Paramètres obligatoires update_full_workflow

```javascript
n8n_update_full_workflow({
  id: "workflowId",        // REQUIS
  name: "Workflow Name",   // REQUIS (sinon erreur)
  intent: "Description",   // Recommandé
  nodes: [...],
  connections: {...}
})
```

### Embedding RAG Pattern

1. Table Supabase: `{prefix}_faq_embeddings` (content, metadata, embedding VECTOR(768))
2. Index: `ivfflat (embedding vector_cosine_ops)`
3. Fonction RPC: `match_{prefix}_faq`
4. Workflow ingestion: Manual Trigger → Prepare Docs → Vector Store + Gemini Embeddings

---

## Facebook Auto-Post (PACIFIK'AI)

**Workflow**: `hZotr6emniXBXMO4`
**Schedule**: Lun/Mer/Ven à 8h (Tahiti)
**Page ID**: `935123186355701`

Architecture:
```
RSS Feeds → Filter 48h → Claude Sonnet (post) → Claude Haiku (image prompt)
→ Fal.ai Nano Banana Pro → Watermark → Facebook Graph API → Airtable log
```

**Token Facebook**: Permanent (généré via échange de tokens)

---

## Décisions Globales

| Date | Décision |
|------|----------|
| 2026-01-27 | Triggers réalistes dans n8n-visualizer (Schedule pour Build 3/4) |
| 2026-01-27 | Sender Brevo configuré pour newsletter@pacifikai.com |
| 2026-01-26 | Structure clients/ par dossier (scalabilité) |
| 2026-01-24 | PostgreSQL simple > Vector Store pour déduplication |
| 2026-01-23 | Positionnement = automatisation business globale (pas juste chatbots) |

---

## Base Airtable PACIFIK'AI (business)

**Base ID**: `appF7pltUaQkOlKM5`

| Table | Usage |
|-------|-------|
| Roadmap | Milestones business |
| Tasks | Tâches opérationnelles |
| Content Calendar | Posts Facebook |
| CRM | Prospects |

---

## Certifications en cours

- [ ] Google AI Essentials
- [ ] Microsoft AI-900 (Azure AI Fundamentals)
- [ ] DeepLearning.AI

---

## Session 2026-01-27

### Modifications ATN Demo
- Fix workflow newsletter: sender Brevo `newsletter@pacifikai.com` configuré
- n8n-visualizer: Build 3 → Schedule "Tous les lundis 9h" (création articles)
- n8n-visualizer: Build 4 → Schedule "Tous les jours 8h" (analyse KPIs)
- Animations de démo mises à jour avec messages de triggers réalistes

### Landing Page PACIFIK'AI - PRÊT EN PRODUCTION

- **URL Production**: https://pacifikai.com
- **Vercel Project**: jordybanks-projects/landing-page
- **Fichier**: `landing-page/index.html` (single-file, ~960 lignes)
- **Logo**: `landing-page/assets/logo.png`
- **Favicon**: `landing-page/assets/favicon.png` (PROFILE avec dégradé bleu/jaune)

**Design (FINAL)**:
- Dark theme bleu (#0a0a12) + accent bleu (#3b82f6)
- Orbe secondaire dorée (#f59e0b) - match favicon
- Animation neural network canvas (particules bleues connectées)
- Orbes flottantes + grille subtle
- Font: Audiowide (logo) + Plus Jakarta Sans (body)
- Responsive (mobile-ready)

**Sections**:
1. Hero avec particules animées
2. Statement (phrase d'accroche)
3. Processus (5 étapes cards)
4. Services (4 cards principales + 4 mini)
5. CTA contact (jordy@pacifikai.com)
6. Footer (Facebook + contact)

**Status**: LIVE ET PRÊT

---

## Session 2026-01-28

### Air Tahiti Nui - Dashboard & Workflows

**Tous les 15 builds n8n sont maintenant ACTIFS**

| Build | Nom | Status | Notes |
|-------|-----|--------|-------|
| 1 | Concierge IA Multilingue | ✅ Actif | Conversations client multilingues |
| 2 | Newsletter Generator | ✅ Actif | Génération newsletters personnalisées |
| 3 | SEO Content Factory | ✅ Actif | Articles optimisés SEO+GEO |
| 4 | ROI Analyst | ✅ Actif | Analyse performance par route |
| 5 | Booking Assistant | ✅ Actif | Assistant réservation intelligent |
| 6 | Social Monitor | ✅ Actif | Surveillance réseaux sociaux |
| 7 | Competitor Intel | ✅ Actif | Veille concurrentielle prix |
| 8 | Flight Notifier | ✅ Actif | Alertes retards/annulations |
| 9 | Review Responder | ✅ Actif | Réponses avis clients |
| 10 | Upsell Engine | ✅ Actif | Offres personnalisées |
| 11 | Dashboard API | ✅ Actif | API centrale dashboard |
| 12 | Content Scheduler | ✅ Actif | Planification éditoriale |
| 13 | AI Assistant | ✅ Actif | ChatWidget dashboard (fix OpenAI→Anthropic) |
| 14 | Report Generator | ✅ Actif | Génération rapports (fix OpenAI→Anthropic) |
| 15 | Smart Generator | ✅ Actif | Génération intelligente contenu |

**Correction technique Build 13 & 14**:
- Nodes IA utilisaient type `openAi` avec credentials Anthropic
- Fix: Changé type vers `@n8n/n8n-nodes-langchain.anthropic`
- Credentials: `tD0vpSdF6v2vHqFp` (Anthropic account)

### Dashboard Next.js

**Fichier créé**: `dashboard-app/DASHBOARD_PRESENTATION.html`
- Présentation complète des 15 pages
- Statut des 15 workflows n8n
- 10 idées d'amélioration documentées

**Idées d'amélioration prioritaires**:
1. 🔴 **HAUTE**: Données temps réel (remplacer démo par APIs réelles)
2. 🔴 **HAUTE**: Graphiques interactifs (Chart.js/Recharts)
3. 🔴 **HAUTE**: Authentification multi-niveaux
4. ✅ **FAIT**: Chat IA amélioré - Intégration Claude API avec contexte entreprise
5. 🟠 **MOYENNE**: Notifications push WebSocket
6. 🟠 **MOYENNE**: PWA Mobile
7. 🟠 **MOYENNE**: Export PDF/Excel
8. 🟠 **MOYENNE**: Intégration calendrier externe
9. 🟢 **BASSE**: Mode sombre
10. 🟢 **BASSE**: A/B Testing newsletters

### Dashboard PACIFIK'AI CRM - Améliorations

**Nouvelles fonctionnalités ajoutées**:
- Notifications temps réel avec badge et panel
- Timeline d'activité par prospect
- Recherche globale Cmd+K
- Menu contextuel (clic droit sur prospects)
- Vue Analytics avec funnel
- Mode Focus pour tâches quotidiennes

**Corrections**:
- Fix URL encoding pour ouverture fichiers (accents, espaces)
- Fix COWAN MOTOR assets (noms fichiers corrects)
- Fix clic prospects (ondblclick → onclick)

### Système Mémoire Partagée Claude Code + Dashboard

**Fichier créé**: `CONTEXT.md`
- Contient tout le contexte PACIFIK'AI
- Lu par Claude Code (via MEMORY.md)
- Intégré dans le system prompt du chatbot dashboard

**Chatbot dashboard amélioré**:
- Utilise maintenant Claude API (claude-sonnet-4)
- System prompt avec contexte entreprise complet
- Fallback vers traitement local si API indisponible
- Historique conversation maintenu (6 derniers messages)
- Données CRM injectées dynamiquement (stats, prospects hot, rappels)
- **Detection automatique des intentions**: "J'ai appelé Cowan Motor, ils sont intéressés" → met à jour status + priorité + note automatique

### Module Content Calendar (Facebook)

**Nouvel onglet "Content"** dans le dashboard avec:
- **Calendrier mensuel** montrant les posts planifiés/publiés
- **Création de posts** avec 3 types:
  - Actu IA (news du secteur)
  - Cas Client (success stories fictives réalistes)
  - Conseil (tips pour entrepreneurs)
- **Génération IA** via Claude API directement dans le dashboard
- **Planification** avec date et heure
- **Liste des posts** avec filtres (tous/planifiés/publiés)
- **Déclenchement manuel** du workflow n8n Facebook

**Workflow Facebook**: `hZotr6emniXBXMO4`
- RSS → Claude Sonnet → Claude Haiku → FAL.ai → Facebook
- Status: Inactif (à activer quand prêt)

### COWAN MOTOR - Prospection

**Status**: Email envoye, en attente de reponse

**Assets crees**:
- `COWAN MOTOR/proposition-commerciale.html` - Proposition complete 6 modules
- `COWAN MOTOR/signature-email.html` - Signature email PACIFIK'AI
- `COWAN MOTOR/script-appel.md` - Script appel telephonique
- `COWAN MOTOR/email-prospection.md` - Templates emails

**Historique**:
- 2026-01-28: Email envoye avec proposition en PJ (attente reponse)

**Prochaine action**: Relance J+2 si pas de reponse

### Session 34 - Fix Chatbot + Edition Contact

**Corrections chatbot:**
- Model ID corrigé: `claude-sonnet-4-5-20250929` (l'ancien était invalide)
- System prompt réécrit pour meilleure compréhension langage naturel
- Fallback local si API échoue
- Logs console `[Claude API]` pour debug

**Formulaire édition contact ajouté:**
- Bouton "Modifier" dans fiche prospect
- Champs: Contact, Email, Téléphone, Poste
- Sauvegarde locale + sync Airtable automatique

**Sync Airtable amélioré:**
- Récupère tous les champs contact depuis Airtable

---

### Session 35 - Template Démarchage

**Fichier créé**: `marketing/TEMPLATE_DEMARCHAGE.md`

Template complet pour démarcher les entreprises incluant:
- Fiche prospect à remplir
- Questions de qualification (4 catégories):
  - Volume & Communication
  - Process Internes
  - Suivi Client
  - Questions d'Argent
- Structure appel en 9 phases
- Gestion des objections
- Templates email (initial + relance)
- Séquence follow-up (J0 → J+10)
- Adaptation par secteur (Commerce, Services, Hôtellerie, Import, Restauration)
- Checklists et red flags
- Préserve données locales si Airtable vide

---

### Session 36 - Dashboard ATN Configuration Complete

**Configuration .env.local corrigée:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ogsimsfqwibcmotaeevb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AIRTABLE_API_KEY=pat46LSKbLbvTLFCm.3431b75c27ab9fc638cb8e784f6559347ede36c1d9801a9df511f2aaed941faf
AIRTABLE_BASE_ID=appWd0x5YZPHKL0VK
N8N_WEBHOOK_BASE=https://n8n.srv1140766.hstgr.cloud/webhook
ANTHROPIC_API_KEY=[RÉVOQUÉE - Créer nouvelle clé sur console.anthropic.com]
```

**Corrections techniques:**
- API route Airtable: Tri sur champ `Date` rendu optionnel (paramètre `sortField`)
- Hydration error fix: `toLocaleString()` → formatage manuel avec espaces
- Toutes les 15 pages HTTP 200

**Tables Airtable ATN (appWd0x5YZPHKL0VK):**
- Contacts, Newsletter_Logs, Concierge_Logs
- SEO_Content, ROI_Alerts, Dashboard
- Booking_Logs, Flight_Alerts, Upsell_Offers
- Social_Mentions, Competitor_Intel, Reviews
- Content_Calendar, Chat_Sessions, Reports_Queue
- Prompt_Templates, Content_Config, Backlog

**Guide utilisateur créé:** `Air Tahiti Nui/dashboard-app/GUIDE_UTILISATEUR_ATN.md`

---

### Session 37 - High Value Capital Content System

**Projet**: HVC Command Center + Content Planner automatisé

**Fichiers clés**:
- `/PACIFIKAI/Argentic Workflows/High Value Capital/dashboard/index.html` - Dashboard principal
- `/PACIFIKAI/Argentic Workflows/High Value Capital/n8n-framework/content-planner/` - Système de planification

**Airtable HVC**:
- Base ID: `appW1YCDJVOMmLicc`
- Table Content: `tbl1j7PjKpUeiYaP6`

**Workflows n8n créés**:
1. `content_planner_workflow.json` - Dimanche 8h, génère 15 jours de contenu
2. `kpi_collector_workflow.json` - Tous les jours 23h, collecte stats
3. `ai_content_analyzer_workflow.json` - Dimanche 6h, analyse IA des performances

**Contenu planifié (2 marques)**:
- **Jordy Banks**: 5 Reels/semaine + 5 séquences de 3 stories (15 stories)
- **High Value Capital**: 3 Reels/semaine

**Framework Stories** (`STORIES_FRAMEWORK.md`):
- 10 séquences types (Morning Routine, Trade Breakdown, Lifestyle Contrast, etc.)
- Chaque séquence = 3 stories (Hook → Content → CTA)
- CTAs en 3 niveaux (Ultra Soft, Soft, Direct)

**Fix Timezone Tahiti (UTC-10)**:
Le Dashboard utilisait `toISOString().split('T')[0]` qui donnait des dates UTC.
Problème: décalage de 1 jour entre dashboard et calendrier.

**Corrections appliquées**:
1. `utcToTahitiDate()` - Fonction utilitaire pour conversion UTC → Tahiti
2. `renderWeekPreview()` - Calcul des dates de la semaine en temps Tahiti
3. `updateStats()` - Filtrage contenu semaine en temps Tahiti
4. `renderCalendar()` - Indicateur "aujourd'hui" en temps Tahiti
5. Variables `currentMonth`/`currentYear` - Initialisées avec mois/année Tahiti

**Pattern réutilisable**:
```javascript
// Convertir UTC → Tahiti (UTC-10)
const nowUtc = new Date();
const tahitiNow = new Date(nowUtc.getTime() - (10 * 60 * 60 * 1000));
// Utiliser getUTC*() pour extraire les composantes
const dateStr = `${tahitiNow.getUTCFullYear()}-${String(tahitiNow.getUTCMonth() + 1).padStart(2, '0')}-${String(tahitiNow.getUTCDate()).padStart(2, '0')}`;
```

---

### Session 38 - Content Calendar PACIFIK'AI Avancé + Workflow n8n ACTIF

**Dashboard PACIFIK'AI - Module Content Calendar refait:**

Inspiré du dashboard ATN, le module Content Calendar a été complètement refait avec:

**Fonctionnalités:**
- **KPIs en temps réel**: Total Posts, Planifiés, Publiés, Engagement moyen
- **Distribution Funnel**: TOFU/MOFU/BOFU avec pourcentages visuels
- **Filtres**: Par plateforme (Facebook/LinkedIn) et par statut
- **Liste des posts** avec badges colorés (plateforme, funnel, statut)
- **Edition inline** via modal avec tous les champs
- **Preview** du contenu avant publication
- **Quick create** depuis la sidebar
- **Génération automatique** d'une semaine complète (5 posts)

**Table Airtable Content Calendar:**
```
Table ID: tblj296C1kSmUcVvO
Base ID: appF7pltUaQkOlKM5
```

**Champs:**
- Titre, Contenu, Type, Date publication, Status
- Engagement, Image URL, Plateforme (multiselect: Facebook, LinkedIn)
- Funnel Stage (TOFU/MOFU/BOFU), Semaine

**Plan de contenu hebdomadaire:**
| Jour | Plateforme | Funnel | Type |
|------|------------|--------|------|
| Lundi | LinkedIn | TOFU | Actualité IA |
| Mardi | Facebook | MOFU | Cas client |
| Mercredi | LinkedIn | TOFU | Tips |
| Jeudi | Facebook | BOFU | Promo |
| Vendredi | LinkedIn | MOFU | Behind the scenes |

**Workflow n8n créé et ACTIF:**
- **Nom**: `PACIFIKAI - Generation Contenu Hebdomadaire`
- **ID**: `Qdnl6ZeLpmQ8C0Lk`
- **Schedule**: Dimanche 20h (cron: `0 20 * * 0`)
- **Status**: ✅ ACTIF et PUBLIÉ

**Architecture workflow:**
```
Dimanche Soir 20h → Calculer Semaine et Plan → Verifier Posts Existants
→ Posts Deja Generes? (IF)
  → TRUE: Posts Deja Existants (fin)
  → FALSE: Preparer Prompts → Split En Batches → Generer Contenu Claude
    → Parser Reponse → Creer Post Airtable → Retour Boucle
    → Generation Terminee
```

**Nœuds:**
1. Dimanche Soir 20h - Schedule Trigger
2. Calculer Semaine et Plan - Code (calcul numéro semaine + dates)
3. Verifier Posts Existants - Airtable (liste posts semaine)
4. Posts Deja Generes? - IF (évite doublons)
5. Preparer Prompts - Code (5 prompts par jour)
6. Split En Batches - Loop (traitement un par un)
7. Generer Contenu Claude - HTTP Request (Anthropic API)
8. Parser Reponse - Code (extraction JSON)
9. Creer Post Airtable - HTTP Request (création record)
10. Retour Boucle - Reconnexion vers Split
11. Generation Terminee / Posts Deja Existants - Endpoints

**Fichiers créés:**
- `n8n-workflows/content-generator-weekly.json` - Export du workflow
- `n8n-workflows/README.md` - Documentation complète

**CSS ajouté au dashboard:**
- Badges plateforme (Facebook #4267B2, LinkedIn #0077B5)
- Badges funnel (TOFU vert, MOFU jaune, BOFU rouge)
- Modal édition/création contenu
- Modal preview contenu
- KPI row + Funnel distribution row

**Configuration via Playwright:**
- Connecté à n8n.srv1140766.hstgr.cloud
- Workflow publié et activé
- Prochaine exécution: Dimanche 20h

---

### Session 39 - Dashboard PACIFIK'AI CRM Améliorations

**Corrections JS:**
- Fix `allTasks is not defined` → changé en `tasks` (3 occurrences lignes 8326, 8442, 8680)
- Fix chemin script `generate-prospect-fiche.sh` → mis à jour vers workspace GitHub
- Fix modal "Générer Fiche IA" qui ne s'affichait pas → ajout `modal.classList.add('show')`

**Assets - Nettoyage complet:**

1. **Nouveau manifest propre** (`assets-manifest.json`):
   - Supprimé tous les fichiers système (CLAUDE.md, MEMORY.md, README.md, etc.)
   - Gardé uniquement les vrais livrables travaillés
   - Ajouté système de favoris (`"favorite": true`)

2. **Fichiers par prospect (exemple Air Tahiti Nui):**
   - ★ Landing Page (demo/index.html)
   - ★ Dashboard IA (demo/dashboard.html)
   - ★ Workflows n8n (demo/n8n-visualizer.html)
   - Présentation Builds
   - Stratégie Pricing
   - Architecture Livraison
   - Script Vidéo
   - Blog IA

3. **Affichage amélioré:**
   - Favoris en premier avec étoile dorée (★)
   - Style doré pour les cartes favorites
   - Text-overflow: ellipsis sur noms et descriptions

**Preview Assets en Popup:**
- Nouvelle fonction `openAssetPreview()` remplace l'ancien système
- Popup iframe 90vw x 90vh avec header
- Bouton "Ouvrir dans un onglet" pour ouvrir en plein écran
- Bouton X pour fermer
- Clic en dehors ferme la popup
- Support PDF via `<object>` tag

**CSS ajouté:**
```css
.asset-preview-container - Container popup
.asset-preview-header - Header avec nom fichier et actions
.asset-preview-content - Zone iframe/object
.asset-card.favorite - Style doré pour favoris
```

**Fichier modifié:** `dashboard/index.html`

---

### Session 40 - Agent ILIA pour High Value Capital

**Nouveau dashboard HVC avec agent IA ILIA integre:**

**Fichier:** `High Value Capital/dashboard.html`

**ILIA** = Assistant IA 2 syllabes pour High Value Capital (comme MANA pour PACIFIK'AI)

**Fonctionnalites:**
- Dashboard Command Center avec KPIs en temps reel
- Navigation complete vers toutes les sections HVC
- Panel lateral ILIA avec chat IA
- Connexion directe a Airtable HVC
- Quick actions pre-configurees
- Historique de conversation avec contexte

**Base Airtable HVC:** `appW1YCDJVOMmLicc`

**Tables connectees (18 total):**
| Table | ID | Usage |
|-------|-----|-------|
| Taches | `tblKrcktcmDG8wXVb` | Gestion taches |
| Roadmap | `tblTKevaaCITLp2tf` | Phases projet |
| Workflows n8n | `tblvBMKd4rdT3H3wO` | Tracking automations |
| Plan Newsletter | `tblDd4AcPy46mdjNm` | Planification emails |
| KPIs | `tblzjAQbDhR42yqyb` | Metriques |
| Contenu | `tbl1NVtwy7ycIL5mM` | Posts et contenus |
| Idees | `tblRqRhZxxkPh8dOC` | Backlog idees |
| CRM Contacts | `tblPAJXEt9SzxOMYt` | Base Heartbeat |
| Dashboard | `tblaSQDlEDOpdmZgR` | Hub central |
| Sequence Onboarding | `tblj3Zl2pArjMrblR` | 7 emails gratuit->payant |
| Temoignages | `tblLd5ceQbg6v8EyH` | Temoignages clients |
| Formation Refonte 2.0 | `tblKSldHlJMfufRws` | Tracking refonte IA |
| Formation Videos | `tblRXMeEDDMAIoP0W` | Pipeline videos |
| Planning Contenu Social | `tbl1j7PjKpUeiYaP6` | Reels, Stories |
| Funnel IA Trading | `tblcqxxRNzInsApPc` | Scanner IA |
| Leads Investisseurs | `tblPmw0tse5j5Sp9a` | CRM investisseurs |
| Trades Scanner | `tbltofezo6xGlblrK` | Historique trades |

**Contexte ILIA:**
- Acces a toutes les taches, roadmap, temoignages, sequence onboarding
- KPIs actuels: 1106 contacts, ~100 ventes, ~10% conversion
- Objectifs: 5k€/mois (court terme) -> 10k€ -> 20-35k€
- Phase actuelle: Phase 1 - Optimisation

**Quick Actions:**
- Taches urgentes
- KPIs actuels
- Prochain email onboarding
- Temoignage pour newsletter

**Design:**
- Theme dark avec accent or (#d4af37)
- Font: Inter + Space Grotesk
- Panel ILIA slide-in depuis la droite
- Cards KPI avec trends

**Configuration:**
- API Key Airtable: stockee dans localStorage (`hvc_airtable_key`)
- API Key Claude: stockee dans localStorage (`hvc_claude_key`)
- Model: claude-sonnet-4-5-20250929

---

### Session 41 - Blog Section + Newsletter Management System

**Blog PACIFIK'AI - Section complète créée:**

**URL Production**: https://pacifikai.com/blog/
**Fichier**: `landing-page/blog/index.html`

**Fonctionnalités:**
- Liste des articles avec cards
- Filtrage par catégorie
- Newsletter subscription intégrée
- 4 articles initiaux:
  - KLM Service Client IA
  - RAG pour PME
  - Automatisation Comptabilité
  - Chatbots 2026

**Table Airtable Blog:**
```
Table ID: tbllQuhvHL2Utu8mk
Base ID: appF7pltUaQkOlKM5
```

**Champs:** Title, Slug, Excerpt, Content, Category, Author, Published_Date, Status, Featured_Image, Reading_Time

---

**Newsletter System - Complet:**

**1. Subscription Form (Blog)**
- Connecté à Brevo API (plus Airtable)
- Liste Brevo: `PACIFIKAI Newsletter` (ID: 6)
- Sender: `newsletter@pacifikai.com`

**2. Table Airtable Subscribers (backup):**
```
Table ID: tbltgJn60E0M9iyHd
Base ID: appF7pltUaQkOlKM5
```

**3. Newsletter Campaigns Management (Dashboard):**

**Table Airtable:**
```
Table ID: tblXkj4Q5gMxHT6Oh
Base ID: appF7pltUaQkOlKM5
```

**Champs:** Subject, Preview_Text, HTML_Content, Status, Scheduled_Date, Sent_Date, Open_Rate, Click_Rate

**Fonctionnalités Dashboard:**
- KPIs: Subscribers, Campaigns, Scheduled, Sent
- Liste des campagnes avec filtres (Draft/Ready/Scheduled/Sent)
- Éditeur HTML avec preview live
- Insertion de blocs (Header, Article, CTA, Footer)
- Template PACIFIK'AI par défaut (dark theme)
- Envoi test email
- Envoi campagne Brevo
- Planification date/heure

**Brevo Configuration:**
```
API Key: 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
List ID: 6 (PACIFIKAI Newsletter)
Sender: newsletter@pacifikai.com
```

**Fichiers modifiés:**
- `landing-page/index.html` - Titre changé "Solution IA"
- `landing-page/blog/index.html` - Newsletter form → Brevo
- `dashboard/index.html` - Section Newsletter complète (nav, view, modal, JS)

**Dashboard URL**: https://dashboard-omega-five-23.vercel.app

---

*Dernière MAJ: 2026-01-29 (Session 41)*
