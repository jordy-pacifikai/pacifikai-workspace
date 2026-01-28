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
API Key: sk-ant-api03-OiXYG... (dans CLAUDE_CONFIG du dashboard)
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
ANTHROPIC_API_KEY=sk-ant-api03-OiXYGj...
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

*Dernière MAJ: 2026-01-28 (Session 36)*
