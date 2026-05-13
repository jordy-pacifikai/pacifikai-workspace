# PACIFIK'AI - MASTER CONTEXT

> **INSTRUCTIONS CLAUDE**: Lis ce fichier AU DEBUT de chaque session. Il contient TOUT le contexte nécessaire.
> **Commande rapide**: `/pacifikai` ou "Lis MASTER.md"

---

## QUICK START (30 secondes)

### Identité
- **Projet**: PACIFIK'AI
- **Description**: Leader de l'automatisation IA en Polynésie française
- **Fondateur**: Jordy Banks (basé à Tahiti)
- **Objectif**: "100K Project" - Prouver la capacité à vendre des services B2B haute valeur
- **Ton**: Direct, orienté action, pas d'over-engineering

### Vision
Devenir le leader de l'automatisation IA en Polynésie française en proposant des solutions clé-en-main pour les entreprises locales qui n'ont pas les ressources techniques pour digitaliser leurs processus.

### Marché Cible
- **Zone**: Polynésie française (marché peu digitalisé, forte opportunité)
- **Cible**: PME locales (hôtels, restaurants, importateurs, comptables)
- **Canal principal**: WhatsApp (dominant localement)
- **Avantage concurrentiel**: Peu d'acteurs proposent des solutions IA avancées

### URLs Production
| Ressource | URL |
|-----------|-----|
| n8n Instance | https://n8n.srv1140766.hstgr.cloud |
| Airtable Base | https://airtable.com/appF7pltUaQkOlKM5 |
| Site principal | À définir |
| Page Facebook | https://www.facebook.com/profile.php?id=61587101037690 |

### Facebook Page
- **Page ID**: `935123186355701`
- **Email**: jordy@pacifikai.com
- **Premier post**: 2026-01-23 (Post ID: 935123186355701_122095500819236701)

---

## STACK TECHNIQUE

| Outil | Usage |
|-------|-------|
| **n8n** (Hostinger) | Orchestration workflows |
| **Claude API** | Intelligence artificielle |
| **Twilio** | WhatsApp + SMS |
| **Airtable** | Bases de données clients |
| **Google Calendar** | Gestion calendriers |
| **Supabase** | Vector store (RAG) |

---

## SOLUTIONS DÉVELOPPÉES

### ✅ 1. Chatbot Hôtels (Agentic RAG)
- **Secteur**: Hôtellerie
- **Problème**: Répondre 24/7 aux questions fréquentes via WhatsApp
- **Tech**: RAG avec base de connaissances FAQ
- **Status**: Développé et fonctionnel

### ✅ 2. Extraction Documents Comptables
- **Secteur**: Cabinets comptables
- **Problème**: Extraire données des factures, relevés bancaires
- **Tech**: OCR + IA pour structurer les données
- **Status**: Développé et fonctionnel

### ✅ 3. Prise de Commandes Importateurs
- **Secteur**: Import/Distribution
- **Problème**: Automatiser commandes WhatsApp → PDF bon de commande
- **Tech**: Agent conversationnel + génération PDF
- **Status**: Développé et fonctionnel

### 🔄 4. Réservations Restaurants (EN COURS)
- **Secteur**: Restauration
- **Problème**: Gérer réservations WhatsApp + Calendar + SMS rappels
- **Tech**: Agent IA + Google Calendar + Airtable + Twilio SMS
- **Status**: En cours de développement
- **Cible**: 60 restaurants en Polynésie
- **Pricing**: 125K XPF setup (~1050€) + 30-50K XPF/mois (~250-420€)

**Workflows du projet:**
1. Réservation Main (WhatsApp → Agent IA → Calendar → Airtable → SMS)
2. Rappels SMS J-1 (automatique chaque matin)
3. Annulations/Modifications (gestion via WhatsApp)

---

## SOLUTIONS FUTURES (Roadmap)

| # | Solution | Secteur | Status |
|---|----------|---------|--------|
| 5 | Call Center Vocal IA | Multi-secteur | 📋 Planifié |
| 6 | Assistant RH / Recrutement | RH | 💡 Idée |
| 7 | Gestion Flotte / Livraisons | Logistique | 💡 Idée |
| 8 | Support Client Multi-canal | E-commerce | 💡 Idée |
| 9 | Priorisation Fiscale | Comptabilité | 💡 Idée |

---

## PRICING & ROI

### Modèle de pricing
- **Setup**: 125K XPF (~1050€)
- **Maintenance**: 30-50K XPF/mois (~250-420€)

### ROI type pour le client
- Économie d'un employé mi-temps: ~150K XPF/mois
- **Rentabilisé en 1-2 mois**

### Contexte marché
- Entreprises habituées à des coûts élevés (isolement géographique)
- Concurrent identifié: **Tickee** (60 clients en 2 ans sur digitalisation basique)

---

## AUTRES ACTIVITÉS (Revenus Passifs)

| Activité | Revenus |
|----------|---------|
| Trading Forex "Méthode ARD" | ~70K€/an |
| Copy Trading | ~50K€ en 2025 |
| Affiliations brokers | 10-30K€/mois |
| Email marketing | 1000 abonnés |

→ Voir projet **High Value Capital** pour la formation trading

---

## CERTIFICATIONS EN COURS

- Google AI Essentials
- Microsoft AI-900 (Azure AI Fundamentals)
- DeepLearning.AI (cours spécialisés)

---

## MCP SERVERS ACTIFS

### n8n-mcp (Workflows)
```
Outils: search_nodes, get_node, validate_node, get_template, search_templates,
        validate_workflow, n8n_create_workflow, n8n_get_workflow, n8n_update_*,
        n8n_delete_workflow, n8n_list_workflows, n8n_validate_workflow,
        n8n_test_workflow, n8n_executions, n8n_health_check, n8n_deploy_template
```

### Airtable MCP (via MCP_DOCKER)
```
Outils: list_bases, list_tables, describe_table, list_records, get_record,
        create_record, update_records, delete_records, search_records,
        create_table, update_table, create_field, update_field
```

**Base PACIFIK'AI:** `appF7pltUaQkOlKM5`
| Table | ID | Usage |
|-------|-----|-------|
| **CRM** | tbluw05otXoESeQkz | Prospects et clients (Air Tahiti Nui, etc.) |
| Roadmap | tblmK1bh2XIjDnZsq | 7 milestones projet (dont M0: ATN) |
| Tasks | tblOqUUWT2ExGfjGw | Tâches liées aux milestones |
| Content Calendar | tblj296C1kSmUcVvO | Posts Facebook planifiés |
| Workflows | tbl5yZmrAK9wInLKh | Répertoire workflows n8n |

**Base Restaurant Réservations:** `appjdFfSJtfBHyame` (workflow réservations)

### Browser MCP (Playwright)
```
Outils: browser_navigate, browser_click, browser_type, browser_snapshot,
        browser_take_screenshot, browser_evaluate, browser_fill_form
```

### NotebookLM MCP
```
Outils: ask_question, add_notebook, list_notebooks, select_notebook
```

### Supabase MCP
```
Package: @supabase/mcp-server-supabase
Access Token: sbp_8e37454cdf5cb66b69c02f534ec88728c1924b9b
Config: voir .mcp.json
```

### Facebook Graph API (Publication automatisée)
```
Endpoint: https://graph.facebook.com/v24.0/
App: HVC Post (ID: 1273720593774126)
App Secret: 1321645e636997f35f4343fd3c7eca6e
Page PACIFIK'AI ID: 935123186355701

# Page Token PERMANENT (expires_at: 0 = jamais)
# Stocké dans le workflow n8n hZotr6emniXBXMO4

# Publier un post avec image
POST /{page_id}/photos
  - url: URL de l'image
  - message: Texte du post
  - access_token: Page Access Token

# Supprimer un post
DELETE /{post_id}?access_token={page_token}

# Obtenir nouveau token permanent (si besoin)
1. Graph Explorer → Token court
2. GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app_id}&client_secret={secret}&fb_exchange_token={short_token}
3. GET /me/accounts?access_token={long_token} → Page token permanent
```

---

## API KEYS & CREDENTIALS

### Twilio (WhatsApp + SMS)
- **Account SID**: À configurer
- **Auth Token**: À configurer
- **WhatsApp Number**: À configurer

### Airtable
- **Base PACIFIK'AI**: `appF7pltUaQkOlKM5` (Roadmap, Tasks, Content Calendar)
- **Base Restaurant Réservations**: `appjdFfSJtfBHyame` (Workflow réservations)
- **Token**: À configurer

### Claude API (Anthropic)
- **API Key**: À configurer

### Supabase (pacifikai-facebook)
- **Projet**: `pacifikai-facebook`
- **Host**: `ogsimsfqwibcmotaeevb.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIzNjc0NiwiZXhwIjoyMDg0ODEyNzQ2fQ.b2m6CLZU_N96cXhQqvVbnX_A6HRmvGJaV1dGmD3AOCE`
- **Tables**: `published_articles` (mémoire déduplication), `embeddings` (vector store)

---

## SKILLS CLAUDE (via Tool: Skill)

| Skill | Quand l'utiliser |
|-------|------------------|
| `n8n-node-configuration` | Configurer un node, propriétés requises |
| `n8n-code-javascript` | Écrire du JS dans Code node |
| `n8n-code-python` | Écrire du Python dans Code node |
| `n8n-workflow-patterns` | Patterns d'architecture |
| `n8n-expression-syntax` | Syntaxe `{{ }}` |
| `n8n-validation-expert` | Interpréter erreurs validation |
| `n8n-mcp-tools-expert` | Guide outils MCP n8n |

---

## SOUS-AGENTS

| Agent | Modèle | Usage |
|-------|--------|-------|
| `quick-reviewer` | Haiku | Linting, style, validation JSON |

---

## STRUCTURE PROJET

```
PACIFIK'AI/
├── MASTER.md ..................... CE FICHIER
├── MEMORY.md ..................... Mémoire long-terme
├── CLAUDE.md ..................... Instructions Claude
│
├── .claude/
│   └── agents/quick-reviewer.md
│
├── .claude-plugin/
│   └── plugin.json
│
├── content-production/
│   ├── docs/
│   └── skills/
│
├── solutions/ .................... Solutions développées
│   ├── chatbot-hotels/
│   ├── extraction-comptable/
│   ├── commandes-importateurs/
│   └── reservations-restaurants/
│
├── business/ ..................... Roadmap, KPIs
│   └── ROADMAP.md
│
├── marketing/ .................... Stratégie Facebook, contenu
│   ├── FACEBOOK_STRATEGY.md
│   ├── FACEBOOK_API.md ........... Documentation Graph API
│   └── content/
│       └── semaine-1-posts.md
│
├── clients/ ...................... Dossiers par client
└── templates/ .................... Devis, contrats
```

---

## RÈGLES IMPORTANTES

1. **Tutoiement** toujours (sauf emails clients formels)
2. **Direct, orienté action** - Pas d'over-engineering
3. **Pragmatique** - Solutions rapides à déployer plutôt que parfaites
4. **Focus ROI** - Toujours quantifier les gains pour les clients
5. **Confidentialité** - Ne jamais exposer données clients

---

## PROJET ACTUEL

**🔥 Prospection Air Tahiti Nui (Proof of Asset)**
- Construire 4 prototypes IA pour démonstration
- Enregistrer vidéo Loom 5 min
- Envoyer email prospection avec lien vidéo
- **Contact**: Teiva Gooding (Dir. Communication, Digital & Loyalty)
- **Valeur**: 3M XPF (~25K€)
- **Deadline**: 29 janvier (envoi email)

**En parallèle: Système réservation restaurant WhatsApp**
- Workflows n8n déjà construits
- Phase de test/debug

---

## PROCHAINES ÉTAPES

| # | Tâche | Status | Date |
|---|-------|--------|------|
| **0** | **🔥 Closer Air Tahiti Nui** | **🔄 En cours** | **29 jan** |
| 1 | Finaliser workflow réservations restaurants | 🔄 En cours | 31 jan |
| 2 | Créer page Facebook PACIFIK'AI | ✅ Fait | 23 jan |
| 3 | Tester avec restaurant pilote | À faire | Fév |
| 4 | Créer site web PACIFIK'AI | À faire | Fév |
| 5 | Démarcher les 60 restaurants cibles | À faire | Mars-Avril |
| 6 | Passer certifications IA | 🔄 En cours | Juin |

> **Roadmap détaillée**: Voir Airtable table "Roadmap" ou [business/ROADMAP.md](business/ROADMAP.md)

---

## FICHIERS PAR CONTEXTE

| Besoin | Fichier |
|--------|---------|
| Mémoire sessions | [MEMORY.md](MEMORY.md) |
| Roadmap & Milestones | [business/ROADMAP.md](business/ROADMAP.md) |
| Stratégie Facebook | [marketing/FACEBOOK_STRATEGY.md](marketing/FACEBOOK_STRATEGY.md) |
| **Facebook Graph API** | [marketing/FACEBOOK_API.md](marketing/FACEBOOK_API.md) |
| Posts Facebook Semaine 1 | [marketing/content/semaine-1-posts.md](marketing/content/semaine-1-posts.md) |
| Créer workflow n8n | [content-production/CLAUDE.md](content-production/CLAUDE.md) |
| Patterns n8n | [content-production/docs/WORKFLOW_PATTERNS.md](content-production/docs/WORKFLOW_PATTERNS.md) |

---

**Dernière MAJ**: 2026-01-24
**Ce fichier est la source de vérité unique.**

---

## WORKFLOW FACEBOOK AUTO-POST IA

**Workflow ID**: `hZotr6emniXBXMO4`
**Nom**: "PACIFIKAI - Publication Facebook IA (Multi-Sources)"
**Schedule**: Lun/Mer/Ven à 8h (Tahiti)
**Nodes**: 30

### Architecture
```
Schedule → 5 RSS Feeds → Filter 48h → Limit 15 → Aggregate
    → Get Published Articles (Supabase REST)
    → Merge With History
    → Agent 1 (Claude Sonnet): Sélectionne news + génère post 400+ mots
    → Parse Response
    → Agent 2 (Claude Haiku): Génère prompt image
    → Fal.ai Nano Banana Pro (16:9, 2K)
    → Upload catbox → Facebook Graph API → Log Airtable
    → Save to Memory (Supabase INSERT)
```

### Caractéristiques
- **Déduplication**: Table `published_articles` dans Supabase
- **Posts enrichis**: 400+ mots avec section Focus Polynésie Française
- **Sources RSS**: TechCrunch, The Verge, VentureBeat, Wired, MIT Tech Review
- **Image**: Générée par Fal.ai Nano Banana Pro

### Structure des posts
1. Accroche (emoji + question choc)
2. Actualité expliquée (100-150 mots)
3. Focus Polynésie Française (100-150 mots) 🌺
4. Conseil actionnable (50-80 mots)
5. Engagement (question)
6. Hashtags (#PACIFIKAI #IAPolynésie #Tahiti)
