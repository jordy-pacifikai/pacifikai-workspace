# Memoire Projet - Air Tahiti Nui

> **Instructions Claude**: Lire ce fichier au debut de chaque session sur ce projet.

---

## Infos Cles

- **Client**: Air Tahiti Nui (compagnie internationale)
- **Routes**: PPT-LAX, PPT-CDG, PPT-NRT, PPT-AKL, PPT-SEA
- **Flotte**: Boeing 787-9 Dreamliner
- **Classes**: Poerava Business, Moana Premium, Moana Economy

---

## Infrastructure Technique

### n8n Workflows (15 Builds)

**Builds 1-10: Agents IA Metier**

| Build | Workflow ID | Nom | Webhook | Status |
|-------|-------------|-----|---------|--------|
| 1 | - | Concierge IA Multilingue | atn-concierge | ACTIF |
| 2 | - | Newsletter Personnalisee | atn-newsletter-demo | ACTIF |
| 3 | - | Content Factory SEO+GEO | atn-seo-content | ACTIF |
| 4 | - | ROI Analyst | atn-roi-analyst | ACTIF |
| 5 | dDPAbhFPeIRc9gU4 | Booking Assistant | atn-booking-assistant | ACTIF |
| 6 | XVxINg7uQRCvDCDi | Social Monitor | atn-social-monitor | ACTIF |
| 7 | Vj3pAXnbDt2tMnP1 | Competitor Intelligence | atn-competitor-intel | ACTIF |
| 8 | qwatQWUdzJMYFR9L | Flight Notifier | atn-flight-notifier | ACTIF |
| 9 | VEdk4X5rseMYfWxW | Review Responder | atn-review-responder | ACTIF |
| 10 | fzywRGoEAg2xDCkE | Upsell Engine | atn-upsell-engine | ACTIF |

**Builds 11-14: Dashboard Management**

| Build | Workflow ID | Nom | Webhook | Status |
|-------|-------------|-----|---------|--------|
| 11 | Y49udNuyGyUtlzub | Dashboard API Hub | atn-dashboard-api | A ACTIVER |
| 12 | 27fFsoBVYDSwjg0Y | Content Scheduler | atn-content-scheduler | A ACTIVER |
| 13 | j0NhhYp9Di9R2VpN | Dashboard AI Assistant | atn-assistant | A ACTIVER |
| 14 | Iq9VrM2K7UgG2f0o | Report Generator | atn-report-generator | A ACTIVER |

**Build 15: Smart Content Generator**

| Build | Workflow ID | Nom | Webhook | Status |
|-------|-------------|-----|---------|--------|
| 15 | SqQoJF18mKWRJpDC | Smart Content Generator | atn-smart-generator | A ACTIVER |

**Fonctionnement Build 15:**
- Cron hebdomadaire (configurable): Lundi 8h par defaut
- Analyse le calendrier existant + contenus deplaces
- Recupere les KPIs/anomalies depuis ROI_Alerts
- Genere suggestions intelligentes avec Claude
- Cree automatiquement le contenu pour la semaine a venir
- Reprogramme intelligemment les contenus deplaces
- Ajuste la generation selon le nombre de contenus deja deplaces

> **ACTION REQUISE**: Activer manuellement les Builds 11-15 dans n8n (toggle ON)

**Webhooks Base URL**: https://n8n.srv1140766.hstgr.cloud/webhook/

### Airtable
- **Base ID**: appWd0x5YZPHKL0VK
- **Tables Logs** (13 tables):
  - Contacts, Newsletter_Logs, Concierge_Logs, SEO_Content, ROI_Alerts, Dashboard, Backlog
  - **Nouvelles (Builds 5-10)**: Booking_Logs, Social_Mentions, Competitor_Intel, Flight_Alerts, Reviews, Upsell_Offers
- **Tables Dashboard** (5 tables):
  - `Content_Calendar` (tblghlTupbD1ADCvl) - Calendrier editorial
    - Champs tracking: `displaced_from`, `displaced_count`, `is_suggestion`, `suggestion_reason`, `original_date`
  - `Chat_Sessions` (tbl8OLCT2W7J06U5k) - Historique chatbot
  - `Reports_Queue` (tblAQkM5W878jv5j6) - File rapports
  - `Prompt_Templates` (tbl6YKNBBXqC9TNpe) - Prompts modifiables
  - `Content_Config` (tblXiGcSXWEmeHe2B) - Configuration generation automatique
    - `generation_frequency`: daily/weekly/biweekly/monthly
    - `content_per_week`: 7 par defaut
    - `newsletters_per_week`: 3 par defaut
    - `articles_per_week`: 4 par defaut
    - `advance_weeks`: 4 (1 mois d'avance)
    - `auto_suggestions`: true/false
    - `suggestion_threshold`: 20% (seuil anomalie)

### Supabase
- **Project**: ogsimsfqwibcmotaeevb (pacifikai-facebook)
- **Documents**: 36 embeddings dans atn_faq_embeddings (RAG concierge)
- **Langues**: FR, EN, ES, JP, CN
- **Tables Dashboard**:
  - `atn_workflow_executions` - Logs executions workflows
  - `atn_daily_metrics` - Metriques agregees par jour
  - `atn_realtime_alerts` - Alertes temps reel

### Dashboard App (Next.js)
- **Chemin**: `dashboard-app/`
- **Stack**: Next.js 14 + TypeScript + Tailwind + Recharts + Lucide
- **Lancement**: `cd dashboard-app && npm install && npm run dev`

**Pages (17 total)**:
- `/` - Overview (vue d'ensemble 10 workflows)
- `/calendar` - Calendrier editorial drag & drop
- `/planner` - Content Planner 30 jours
- `/reports` - Generation rapports sur demande
- `/conversations` - Build 1: Concierge IA
- `/newsletters` - Build 2: Newsletter Engine
- `/content` - Build 3: Content Factory SEO+GEO
- `/roi` - Build 4: ROI Analyst
- `/bookings` - Build 5: Booking Assistant
- `/social` - Build 6: Social Listening
- `/competitors` - Build 7: Competitor Watch
- `/flights` - Build 8: Flight Monitor
- `/reviews` - Build 9: Review Manager
- `/upsell` - Build 10: Upsell Engine
- `/settings` - Configuration

**Composants**:
- `Sidebar` - Navigation groupee (Planning + Workflows)
- `AlertBell` - Notifications temps reel
- `ChatWidget` - Assistant IA flottant connecte aux workflows

**Fonctionnalites Cles**:
- Calendrier editorial avec drag & drop pour reprogrammer
- Planner 30 jours avec filtres et changement statut inline
- Modal edition avec prompt IA pour modifier titre/date/contenu
- Widget chatbot flottant pour actions rapides (rapport, modifier, generer)
- Rapports personnalises via prompt IA
- **Generation intelligente** (Build 15):
  - Toujours 1 mois d'avance en contenu
  - Frequence configurable par les employes ATN
  - Suggestions basees sur anomalies/KPIs
  - Reprogrammation intelligente des contenus deplaces
  - Tracking des contenus deplaces pour ajuster futures generations

---

## Architecture Dashboard <-> Workflows

### Flux de Donnees

```
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD NEXT.JS                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Calendar │ │ Planner  │ │ ChatBot  │ │ Reports  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│       └────────────┴─────┬──────┴────────────┘                  │
│                          │                                      │
│                    API Routes                                   │
│              /api/calendar, /api/chat, etc.                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      n8n WEBHOOKS                                │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ atn-dashboard- │  │ atn-content-   │  │ atn-assistant  │     │
│  │ api            │  │ scheduler      │  │                │     │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘     │
│          │                   │                   │               │
│          ▼                   ▼                   ▼               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              ORCHESTRATION WORKFLOWS                    │     │
│  │  - Lecture/Ecriture Airtable                           │     │
│  │  - Appels Claude API pour generation                    │     │
│  │  - Declenchement autres workflows (Build 1-10)         │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │      AIRTABLE       │        │      SUPABASE       │         │
│  │                     │        │                     │         │
│  │  - Content_Calendar │        │  - workflow_exec    │         │
│  │  - Newsletters      │        │  - daily_metrics    │         │
│  │  - SEO_Articles     │        │  - realtime_alerts  │         │
│  │  - Chat_Sessions    │        │  - embeddings (RAG) │         │
│  │  - Reports_Queue    │        │                     │         │
│  └─────────────────────┘        └─────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

### Nouveaux Workflows Dashboard (Builds 11-14)

| Build | Webhook | Description |
|-------|---------|-------------|
| 11 | `atn-dashboard-api` | Hub API central - CRUD calendrier/planner |
| 12 | `atn-content-scheduler` | Execution programmee newsletters/articles |
| 13 | `atn-assistant` | Chatbot dashboard - comprend et execute |
| 14 | `atn-report-generator` | Generation rapports PDF/email |

### Tables Airtable Supplementaires

| Table | Champs | Usage |
|-------|--------|-------|
| Content_Calendar | id, type, title, content, scheduled_date, status, prompt_history | Calendrier editorial |
| Chat_Sessions | session_id, messages[], last_action, user_id | Historique chatbot |
| Reports_Queue | id, type, params, status, output_url, created_at | File rapports |
| Prompt_Templates | workflow_id, prompt_name, prompt_text, version | Prompts modifiables |

### Actions du Chatbot

Le ChatWidget peut declencher:

1. **Modifier contenu** -> `atn-dashboard-api` (PATCH)
2. **Reprogrammer** -> `atn-dashboard-api` (PATCH date)
3. **Generer article** -> `atn-seo-content` (Build 3)
4. **Generer newsletter** -> `atn-newsletter-demo` (Build 2)
5. **Rapport du jour** -> `atn-report-generator` (Build 14)
6. **Ajuster prompt** -> `atn-dashboard-api` (PATCH prompt)

### Logique Content Scheduler (Build 12)

```
Trigger: Cron toutes les heures
│
├─> Check Airtable Content_Calendar WHERE scheduled_date <= NOW AND status = 'scheduled'
│
├─> Pour chaque contenu:
│   ├─> Si type = 'newsletter':
│   │   └─> Appeler Build 2 (atn-newsletter-demo)
│   │
│   └─> Si type = 'article':
│       └─> Appeler Build 3 (atn-seo-content)
│
└─> Mettre a jour status = 'published' dans Airtable
```

---

## Categories Workflows

### Service Client (3)
- Build 1: Concierge IA Multilingue
- Build 5: Booking Assistant
- Build 9: Review Responder

### Marketing (3)
- Build 2: Newsletter Personnalisee
- Build 3: Content Factory SEO+GEO
- Build 6: Social Monitor

### Operations (1)
- Build 8: Flight Notifier (alertes retards)

### Revenue (3)
- Build 4: ROI Analyst
- Build 7: Competitor Intelligence
- Build 10: Upsell Engine

---

## 5 Segments Clients

1. **Lune de miel** - Couples, Bora Bora
2. **Famille** - Vacances, Moorea
3. **Plongeurs** - Rangiroa, Fakarava
4. **Business** - Voyageurs d'affaires
5. **General** - Autres profils

---

## Opportunite Offre d'Emploi

**Poste**: Charge E-marketing
**Missions identifiees**:
1. Integrer l'IA dans les dispositifs e-marketing
2. Personnalisation et conversion
3. Generation de contenus et trafic qualifie
4. Logique ROIste, data-driven

> **Nos 10 Builds repondent a TOUTES ces missions**

---

## Arguments Cles (pour la video)

1. **Reference offre d'emploi** - "J'ai vu votre offre..."
2. **Concurrents y sont deja** - Air France, Lufthansa, Emirates
3. **ROI chiffre en XPF** - 35M economies/an (10 workflows)
4. **Securite n8n** - Donnees ne sortent pas
5. **10 workflows vs 4** - Offre complete et differenciante

---

## Fichiers Demo-Site

| Fichier | Description |
|---------|-------------|
| dashboard.html | **Dashboard Employe 10 Builds** (MIS A JOUR) |
| demo-hub.html | Hub central navigation |
| index.html | Landing + Chatbot |
| builds-presentation.html | Presentation builds |
| blog.html | Articles SEO exemple |
| pricing-strategy.html | Tarifs + ROI |
| n8n-visualizer.html | Visualisation workflows |
| delivery-architecture.html | Architecture technique |
| video-script.html | Script video prospection |

---

## Sessions de Travail

### 2026-01-28 (Session 5)
- **Creation Build 15 - Smart Content Generator** (SqQoJF18mKWRJpDC):
  - Cron hebdomadaire configurable (Lundi 8h par defaut)
  - Analyse calendrier + KPIs + anomalies ROI
  - Generation intelligente avec Claude Sonnet 4
  - Tracking contenus deplaces (displaced_from, displaced_count)
  - Ajustement automatique du nombre de contenus a generer
- **Nouvelle table Airtable**: Content_Config (tblXiGcSXWEmeHe2B)
  - Configuration frequence, nb contenus, suggestions auto, seuil anomalie
- **Nouveaux champs Content_Calendar**: displaced_from, displaced_count, is_suggestion, suggestion_reason, original_date
- **Mise a jour Settings page**: Interface config generation + bouton declenchement manuel
- **Mise a jour api.ts**: triggerSmartGeneration(), getContentConfig()
- 15 workflows total, systeme autonome

### 2026-01-28 (Session 4)
- **Creation Builds 11-14 (Dashboard Management)**:
  - Build 11: Dashboard API Hub (CRUD calendrier, prompts)
  - Build 12: Content Scheduler (cron horaire, publication auto)
  - Build 13: Dashboard AI Assistant (analyse intent, execute)
  - Build 14: Report Generator (rapports IA sur demande)
- **Creation 4 nouvelles tables Airtable**:
  - Content_Calendar, Chat_Sessions, Reports_Queue, Prompt_Templates
- **Fichier API dashboard** (`src/lib/api.ts`):
  - Fonctions pour tous les webhooks (Builds 1-14)
  - Support mode demo + mode production
- ChatWidget connecte aux webhooks reels (flag USE_REAL_API)
- 14 workflows total, systeme complet

### 2026-01-28 (Session 3)
- **Extension Dashboard avec fonctionnalites editoriales**:
  - `/calendar` - Calendrier drag & drop pour newsletters/articles
  - `/planner` - Liste 30 jours avec filtres et edition inline
  - `/reports` - Generation rapports sur demande + rapports programmes
  - `ChatWidget` - Assistant IA flottant accessible partout
- Modal edition avec prompt IA integre
- Sidebar restructuree: Planning + Workflows
- 17 pages total, dashboard complet de pilotage

### 2026-01-28 (Session 2)
- **Creation Dashboard Management Next.js** (dashboard-app/)
  - 6 pages: Overview, Conversations, Reviews, Social, Flights, Competitors
  - Connexion Airtable + Supabase APIs
  - Composants: Sidebar, AlertBell (notifications temps reel)
- **Creation 6 nouvelles tables Airtable** pour les builds 5-10
- **Creation 3 tables Supabase** pour stats et alertes
- Structure complete pour monitoring des 10 agents IA

### 2026-01-28 (Session 1)
- **Creation 6 nouveaux workflows (Builds 5-10)**
- Configuration credentials Anthropic (Claude Sonnet 4)
- Publication et activation des 10 workflows
- **Nouveau Dashboard Employe** avec 10 builds, filtres par categorie, raccourcis clavier
- Mise a jour MEMORY.md avec infos completes

### 2026-01-26
- Mise a jour video-script.html (nouvelle approche + offre emploi)
- Creation CLAUDE.md et MEMORY.md

### Sessions precedentes
- Creation complete demo-site (17 fichiers)
- Configuration chatbot multilingue
- Script video avec reference offre d'emploi

---

## Decisions Prises

| Date | Decision | Contexte |
|------|----------|----------|
| 2026-01-28 | Passer a 15 builds | Offre complete avec generation intelligente |
| 2026-01-28 | Build 15 Smart Generator | Toujours 1 mois d'avance, suggestions KPI |
| 2026-01-28 | Dashboard Employe centralise | Acces facile pour demo prospect |
| 2026-01-26 | Garder ref. offre emploi | Differenciateur vs autres prospects |
| 2026-01-26 | Nouvelle approche commerciale | "Expert automatisation marketing" |
| 2026-01-24 | Mapper builds sur offre | 4 builds = 4 missions de l'offre |

---

## A Faire

- [ ] Enregistrer video Loom (avec 15 builds)
- [ ] Envoyer a Torea (contact offre emploi)
- [x] Creer base Airtable KPIs centralisee (18 tables total)
- [x] Creer dashboard management Next.js (17 pages)
- [x] Ajouter calendrier editorial drag & drop
- [x] Ajouter content planner 30 jours
- [x] Ajouter widget chatbot IA flottant
- [x] Ajouter page rapports sur demande
- [x] Creer Builds 11-14 (workflows dashboard)
- [x] Connecter ChatWidget aux webhooks n8n
- [x] Creer fichier api.ts avec tous les webhooks
- [x] Creer Build 15 - Smart Content Generator
- [x] Creer table Content_Config pour frequence configurable
- [x] Ajouter champs tracking dans Content_Calendar
- [x] Interface Settings pour config generation
- [ ] **ACTIVER Builds 11-15 dans n8n** (toggle ON manuel)
- [ ] Configurer cle API Airtable dans .env.local
- [ ] Configurer cle Supabase anon dans .env.local
- [ ] Activer USE_REAL_API=true dans .env.local
- [ ] Deployer dashboard sur Vercel
- [ ] Suivre relance si pas de reponse J+7

---

**Derniere MAJ**: 2026-01-28
