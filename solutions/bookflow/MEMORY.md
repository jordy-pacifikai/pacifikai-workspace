# BookFlow - Memoire Projet

> **Instructions Claude**: Lire ce fichier au debut de chaque session BookFlow.

---

## Identite Projet

**Nom**: BookFlow
**Type**: SaaS Prise de RDV
**Cible**: Metiers beaute/bien-etre (coiffeurs, ongles, coachs, etc.)
**Parent**: PACIFIK'AI (offre produit)

---

## Stack Technique

| Composant | Technologie | Status |
|-----------|-------------|--------|
| Backend | Supabase | Done |
| App Mobile | React Native + Expo | En cours |
| Dashboard Web | React + Vite | A faire |
| Chatbot | Claude via n8n | A faire |
| Offline | WatermelonDB | A faire |

---

## Structure du Projet

```
bookflow/
├── MEMORY.md .................. CE FICHIER
├── MASTER.md .................. Point d'entree projet
├── README.md .................. Documentation generale
│
├── app/ ....................... Application React Native
│   ├── app/ ................... Ecrans (Expo Router)
│   │   ├── index.tsx .......... Welcome screen
│   │   ├── _layout.tsx ........ Root layout
│   │   ├── auth/ .............. Auth screens
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (client)/ .......... Onglets client
│   │   │   ├── _layout.tsx .... Tab navigation
│   │   │   ├── index.tsx ...... Home
│   │   │   ├── explore.tsx .... Explorer pros
│   │   │   ├── appointments.tsx Mes RDV
│   │   │   ├── chat.tsx ....... Assistant IA
│   │   │   └── profile.tsx .... Profil
│   │   ├── (pro)/ ............. Onglets pro
│   │   │   ├── _layout.tsx .... Tab navigation
│   │   │   ├── index.tsx ...... Dashboard
│   │   │   ├── agenda.tsx ..... Calendrier
│   │   │   ├── clients.tsx .... Liste clients
│   │   │   ├── services.tsx ... Prestations
│   │   │   └── settings.tsx ... Parametres
│   │   └── onboarding/ ........ Onboarding pro
│   │       └── pro.tsx
│   ├── hooks/ ................. React Hooks
│   │   ├── useAuth.ts ......... Authentification
│   │   ├── useBusiness.ts ..... CRUD business
│   │   ├── useServices.ts ..... CRUD services
│   │   ├── useClients.ts ...... CRUD clients
│   │   └── useAppointments.ts . CRUD RDV + slots
│   ├── lib/ ................... Librairies
│   │   └── supabase.ts ........ Client Supabase
│   ├── types/ ................. TypeScript types
│   │   └── database.ts ........ Types Supabase
│   ├── components/ ............ Composants reutilisables
│   └── package.json
│
├── supabase/ .................. Configuration Supabase
│   ├── schema.sql ............. Schema complet
│   └── seed.sql ............... Donnees de test
│
├── web/ ....................... Dashboard web (a faire)
├── n8n/ ....................... Workflows n8n (a faire)
└── prompts/ ................... Prompts chatbot (a faire)
```

---

## Base de Donnees

### Tables (10)
1. `businesses` - Pros inscrits (slug, horaires, settings)
2. `services` - Prestations (duree, prix, categorie)
3. `clients` - Clients des pros (fidelite, preferences)
4. `appointments` - RDV (status, paiement, notes)
5. `loyalty_rules` - Regles fidelite par business
6. `loyalty_redemptions` - Historique recompenses
7. `reviews` - Avis clients
8. `chat_messages` - Historique chatbot
9. `push_tokens` - Tokens notifications
10. `blocked_slots` - Creneaux bloques/vacances

### Fonctions SQL
- `generate_unique_slug(base_name)` - Genere un slug unique
- `get_available_slots(business_id, date, duration)` - Creneaux disponibles

### Fichiers
- Schema: `supabase/schema.sql`
- Seed: `supabase/seed.sql`

---

## Fonctionnalites

### Client
- [x] Auth (signup/login)
- [x] Guest booking (sans compte)
- [ ] Explorer les pros
- [ ] Prendre RDV
- [ ] Chatbot IA
- [ ] Points fidelite
- [ ] Avis

### Pro
- [x] Auth + Onboarding
- [x] Dashboard basique
- [x] Liste clients
- [x] Liste services
- [ ] Agenda complet
- [ ] Page publique (bookflow.app/pro/[slug])
- [ ] QR code partage
- [ ] Chatbot commandes vocales
- [ ] Creneaux intelligents
- [ ] Mode offline

---

## Hooks Disponibles

### useAuth
```typescript
const { user, session, loading, signUp, signIn, signOut, resetPassword } = useAuth();
```

### useBusiness
```typescript
const { business, loading, createBusiness, updateBusiness, fetchBusiness } = useBusiness(userId);
```

### useServices
```typescript
const { services, loading, createService, updateService, deleteService } = useServices(businessId);
```

### useClients
```typescript
const { clients, loading, createClient, updateClient, deleteClient, searchClients } = useClients(businessId);
```

### useAppointments
```typescript
const { appointments, loading, createAppointment, updateAppointment, getAvailableSlots } = useAppointments(businessId);
```

---

## Pricing

| Plan | Prix/mois | RDV | Features |
|------|-----------|-----|----------|
| Free | 0 | 30 | Basique |
| Starter | 5K XPF | 150 | Fidelite |
| Pro | 15K XPF | Illimite | Chatbot IA + Analytics |

---

## Sprints

### Sprint 1 - Fondations (En cours)
- [x] Schema Supabase (10 tables, RLS, fonctions)
- [x] Setup projet Expo
- [x] Auth Supabase (signup/login)
- [x] CRUD services/appointments
- [ ] WatermelonDB setup (offline)

### Sprint 2 - Experience utilisateur
- [ ] Explorer les pros (carte + liste)
- [ ] Flow de reservation complet
- [ ] Chatbot n8n
- [ ] Push notifications

### Sprint 3 - Partage et rappels
- [ ] Page publique pro
- [ ] Lien de partage + QR code
- [ ] Rappels SMS/push

### Sprint 4 - Fidelite et analytics
- [ ] Systeme de fidelite
- [ ] Avis clients
- [ ] Dashboard web pro

---

## Decisions

| Date | Decision | Raison |
|------|----------|--------|
| 2026-01-27 | Stack RN + Supabase | Ecosysteme React, Supabase deja utilise |
| 2026-01-27 | Freemium | Concurrence Fresha (600 FCFP/mois) |
| 2026-01-27 | Offline-first | Connexion instable en Polynesie |
| 2026-01-27 | Guest booking | Reduire friction, augmenter conversions |
| 2026-01-27 | Expo Router | Navigation file-based moderne |

---

## Credentials

### Supabase
- **Project ID**: celwaekgtxknzwyjrjym
- **Project URL**: https://celwaekgtxknzwyjrjym.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHdhZWtndHhrbnp3eWpyanltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODA1NjAsImV4cCI6MjA4NTE1NjU2MH0.6m9XBYDwdjMtA_keRuDGe93iZ0gBvdBQZnoRAcdi88A
- **Publishable Key**: sb_publishable_peug15ff3OCFHni8dxIOLQ_H8x6g_Kh
- **Region**: ap-southeast-1 (Singapore)
- **Organisation**: PACIFIKAI

### Expo
- **Projet**: bookflow-app
- Demarrer: `cd app && npx expo start`

---

## Commandes Utiles

```bash
# Demarrer l'app (web)
cd app && npx expo start --web

# Demarrer l'app (mobile via Expo Go)
cd app && npx expo start

# TypeScript check
cd app && npx tsc --noEmit

# Installer dependencies
cd app && npm install --legacy-peer-deps
```

---

## Sessions de Travail

### Session 2026-01-29 - Sprint 1 Quasi Complet

**Realise:**
- Schema Supabase complet (10 tables + RLS + fonctions)
- Projet Expo initialise avec toutes les dependencies
- 24 ecrans crees (auth, client, pro, onboarding)
- 5 hooks React (auth, business, services, clients, appointments)
- Client Supabase configure
- Types TypeScript pour toutes les tables
- App testable en web (`npx expo start --web`)

**Ecrans Client (5):**
- index.tsx - Accueil avec RDV a venir
- explore.tsx - Explorer les pros (placeholder)
- appointments.tsx - Historique RDV
- chat.tsx - Assistant IA (placeholder)
- profile.tsx - Profil avec carte fidelite

**Ecrans Pro (5):**
- index.tsx - Dashboard avec stats
- agenda.tsx - Calendrier (placeholder)
- clients.tsx - Liste clients
- services.tsx - Gestion prestations
- settings.tsx - Parametres + abonnement

**Ecrans Auth (3):**
- login.tsx - Connexion email/password + OAuth
- signup.tsx - Inscription client ou pro
- forgot-password.tsx - Reset password

**Ecrans Onboarding (1):**
- pro.tsx - Creation du business apres inscription

**Reste a faire Sprint 1:**
- [ ] WatermelonDB pour mode offline

**Prochaine etape:**
Sprint 2 - Flow de reservation complet

---

### Session 2026-02-25 — BookBot WhatsApp v2 COMPLET

**Recherche prealable**: 145k tokens, 30+ sources, 8 templates n8n, docs Twilio/Meta

**Architecture v2**:
- State Machine mono-Code-node (pas de Switch bugge via API)
- 8 noeuds total: Webhook → Respond 200 → Config → Parse → Load Session → State Machine Router → Send WhatsApp → Update Session
- 5 states: idle → service_selection → date_selection → time_selection → confirmation → idle (reset)
- Intent classification: keyword-first (zero AI pour 80% des messages) + Claude Haiku fallback
- Session par phone dans `bookbot_sessions` (Supabase)
- Interactive messages via texte numérote (Twilio sandbox ne supporte pas buttons)
- Multi-tenant: un workflow, N businesses (changer Config Business)

**n8n Workflow**: `nrTREBIal7xhKFcl` — "TEMPLATE — BookBot WhatsApp Booking v2"
- Webhook: `https://n8n.srv1140766.hstgr.cloud/webhook/bookbot-template`
- Actif et testé E2E

**Supabase**:
- `bookbot_sessions` — table state machine (phone + business_id UNIQUE, state, selected_service/date/time, context JSONB)
- `bookbot_businesses` — colonnes Twilio ajoutées (twilio_sid, twilio_token, twilio_from, phone_number_id)
- Business demo: `a0000000-0000-0000-0000-000000000001` "Salon Demo Tahiti"

**Twilio Sandbox**:
- SID: {{TWILIO_SID}}
- From: whatsapp:+14155238886
- **Webhook PAS ENCORE configuré** — Jordy doit coller l'URL dans Console Twilio

**Bugs fixes en cours de build**:
- n8n Switch v3.2 ne route pas correctement via API → remplacé par mono-Code-node
- `URLSearchParams` not available in n8n sandbox → `encodeURIComponent` manuel
- UPSERT session reset state → changé en GET first, INSERT if not found
- `$input.item.json.body` = données du noeud précédent, pas du webhook → `$('Webhook WhatsApp').item.json.body`
- "bonjour" matched "ou" dans faqWords → greetings checked FIRST + mots courts = exact match only

**E2E validé** (6 exécutions, toutes SUCCESS):
1. "Bonjour" → greeting + menu 3 options
2. "1" → liste 4 services
3. "1" → "Coupe homme" sélectionnée + 3 dates
4. "1" → date + 6 créneaux
5. "1" → récapitulatif + confirmer/modifier/annuler
6. "1" → **RDV créé en Supabase** (confirmed, whatsapp)

**Spec v2**: `N8N_WORKFLOW_SPEC_V2.md` dans ce dossier

---

## PROCEDURE DUPLICATION — Deployer BookBot pour un nouveau client

> **Temps estimé : 5 minutes.** Tout est automatisable sauf le webhook Twilio Console.

### Etape 1 — Creer le business dans Supabase (30s)

```sql
INSERT INTO bookbot_businesses (name, phone, sector, services, hours, slot_duration_min, timezone, whatsapp_number, twilio_sid, twilio_token, twilio_from, config, active)
VALUES (
  '{{NOM_BUSINESS}}',
  '{{PHONE_CLIENT}}',
  '{{SECTEUR}}',  -- salon, restaurant, medical, etc.
  '[
    {"name":"{{SERVICE_1}}","duration":{{DUREE_1}},"price":{{PRIX_1}}},
    {"name":"{{SERVICE_2}}","duration":{{DUREE_2}},"price":{{PRIX_2}}}
  ]'::jsonb,
  '{"mon":"{{HORAIRES}}","tue":"{{HORAIRES}}","wed":"{{HORAIRES}}","thu":"{{HORAIRES}}","fri":"{{HORAIRES}}","sat":"{{HORAIRES_SAM}}"}'::jsonb,
  {{SLOT_DURATION}},
  'Pacific/Tahiti',
  'whatsapp:+14155238886',
  '{{TWILIO_SID}}',
  '{{TWILIO_TOKEN}}',
  'whatsapp:+14155238886',
  '{"human_phone":"{{PHONE_CLIENT}}"}'::jsonb,
  true
)
RETURNING id;
```
→ Noter le `id` retourné (UUID du business)

### Etape 2 — Dupliquer le workflow n8n (1 min)

1. `n8n_get_workflow` id=`nrTREBIal7xhKFcl` mode=`full` → copier tout
2. `n8n_create_workflow` avec :
   - name: `{{NOM_BUSINESS}} — BookBot WhatsApp Booking`
   - Memes nodes + connections
   - **Modifier UNIQUEMENT le noeud "Config Business"** :
     ```json
     {
       "business_id": "{{UUID_DU_STEP_1}}",
       "business_name": "{{NOM_BUSINESS}}",
       "services": ["{{SERVICE_1}}|{{DUREE_1}}|{{PRIX_1}}", "{{SERVICE_2}}|{{DUREE_2}}|{{PRIX_2}}"],
       "opening_hours": {"mon":"08:00-17:00", ...},
       "human_phone": "{{PHONE_CLIENT}}"
     }
     ```
     Les credentials Twilio/Supabase/Anthropic restent LES MEMES (compte PACIFIK'AI)
   - Changer le webhook path : `bookbot-{{SLUG_CLIENT}}` (ex: `bookbot-salon-moana`)
3. Cycle deactivate/activate via REST API

### Etape 3 — Configurer le webhook Twilio (30s — Jordy)

Pour le sandbox (test) : meme numero pour tous les clients → un seul webhook
Pour la prod (Meta Cloud API) : chaque client a son propre numero → webhook par client

**Sandbox** : `https://n8n.srv1140766.hstgr.cloud/webhook/bookbot-{{SLUG_CLIENT}}`

### Etape 4 — Tester (30s)

```bash
curl -X POST "https://n8n.srv1140766.hstgr.cloud/webhook/bookbot-{{SLUG_CLIENT}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "From=whatsapp:+68989558189" \
  --data-urlencode "Body=Bonjour" \
  --data-urlencode "MessageSid=test001"
```

### IMPORTANT — Pieges a eviter (bugs deja resolus)

1. **JAMAIS utiliser `n8n Switch` via API** — le routing est cassé. Utiliser un mono-Code-node (State Machine Router)
2. **JAMAIS `URLSearchParams`** dans n8n Code nodes — utiliser `encodeURIComponent()` manuellement
3. **JAMAIS UPSERT** pour charger la session — ça reset le state. Faire GET d'abord, INSERT seulement si pas trouvé
4. **Webhook data** : lire avec `$('Webhook WhatsApp').item.json.body`, PAS `$input.item.json.body`
5. **Keywords** : "bonjour" contient "ou" → checker greetings EN PREMIER, mots courts = exact match only
6. **Cycle deactivate/activate** obligatoire apres chaque modification via API
7. **Respond 200 immediatement** — le webhook fork vers Respond 200 ET Config Business en parallele
8. **Format services** : `"Nom|duree_min|prix_xpf"` (pipe-separated string dans un array JSON)

### Multi-tenant (1 workflow pour N clients)

Alternative a la duplication : un seul workflow qui route par phone_number_id.
- Webhook unique : `bookbot-universal`
- Le noeud Parse Message detecte le `To` (numero Twilio du client) ou un query param `?biz=UUID`
- Load la config depuis `bookbot_businesses` au lieu du noeud Set
- Avantage : 1 workflow a maintenir. Inconvenient : plus complexe, tous les clients down si bug

**Recommandation** : dupliquer pour les 5 premiers clients, passer en multi-tenant quand >5.

---

---

## Proposition Commerciale

- **URL** : https://proposition-bookbot.vercel.app
- **Fichier** : `PACIFIK'AI/propositions/bookbot/index.html`
- **Style** : Dark theme, animations (mesh gradient, floating orbs), meme qualite que propale Cowan Motor
- **Sections** : Pain points (4 stats) → Demo phone mockup → 4 etapes → ROI (3 secteurs) → Launch Kit → Secteurs → Pricing (3 plans) → Process → Garantie 14j → CTA
- **Pricing** :
  | Plan | Setup | Mensuel |
  |------|-------|---------|
  | Starter | 25 000 F | 8 000 F |
  | Business | 45 000 F | 15 000 F |
  | Premium | 65 000 F | 25 000 F |
- **CTAs** : "Discutons sur WhatsApp" (wa.me/68989558189) + "Tester la demo" (wa.me/14155238886)

---

## Launch Kit Client

Dossier : `PACIFIK'AI/solutions/bookflow/launch-kit/`

| Fichier | Description |
|---------|-------------|
| `facebook-post-salon.md` | Template post FB + stories Instagram (salon/beaute) |
| `facebook-post-resto.md` | Template post FB (restaurant) |
| `facebook-post-medical.md` | Template post FB (cabinet medical) |
| `qr-code-generator.html` | Outil HTML generateur QR codes (3 tailles PNG + SVG) |
| `signage-template.html` | Signaletique A4 imprimable (3 secteurs, preview live, print CSS) |
| `guide-facebook-ads.md` | Guide budget pub "Click-to-WhatsApp" (ciblage, ROI, quand arreter) |
| `checklist-lancement.md` | Checklist 2 semaines + template email + template SMS |

### Procedure de lancement client
1. Dupliquer le bot (voir PROCEDURE DUPLICATION ci-dessus)
2. Generer QR code via `qr-code-generator.html`
3. Generer signaletique via `signage-template.html` → imprimer
4. Personnaliser le post Facebook avec le template du secteur
5. Publier + epingler le post
6. Envoyer l'email/SMS aux clients existants
7. (Optionnel) Lancer la campagne Facebook Ads

---

## Messenger (Phase 2 — a venir)

### Architecture
- Meme State Machine Router, meme logique de booking
- Webhook unique recoit WhatsApp (Twilio) ET Messenger (Meta Graph API)
- Parse Message detecte le format : `body.entry[].changes[].value.messages` (WhatsApp) vs `body.entry[].messaging` (Messenger)
- Send message : Twilio API (WhatsApp) vs Graph API `/me/messages` (Messenger)

### Pre-requis
1. Creer nouvelle app Facebook "PACIFIK'AI BookBot" (pas reutiliser HVC Post)
2. App Review : permission `pages_messaging` (2-5 jours)
3. Politique de confidentialite sur Vercel
4. Screencast demo du bot
5. Connecter la page Facebook du client a l'app

### Modifications workflow n8n (~30 lignes)
- Parse Message : ajouter detection Messenger format
- Send WhatsApp : ajouter branche `if source === 'messenger' → Graph API`
- State Machine Router : AUCUN changement (meme logique)

---

## Dashboard Client BookBot (CONSTRUIT)

> **Statut** : BUILD COMPLETE — 9 pages, Playwright valide, pret pour deploy Vercel

### Vision
Le dashboard est le **centre de controle** du client. Sans lui, BookBot est juste un bot. Avec lui, c'est une **plateforme de gestion de reservations avec IA**.

### Architecture
- **Stack** : Next.js 14 + TypeScript + Tailwind v3 + TanStack Query v5 + Zustand v5
- **Backend** : Supabase (untyped client for flexibility, tables BookFlow existantes)
- **Auth** : Supabase Auth (a connecter — pour l'instant businessId hardcode demo)
- **Deploy** : Vercel (multi-tenant avec slug client ou sous-domaine)
- **Path** : `PACIFIK'AI/solutions/bookflow/dashboard/`
- **Default business** : `a0000000-0000-0000-0000-000000000001` (Salon Demo Tahiti)

### Fichiers cles
```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx ........... Root layout (Inter font, Providers)
│   │   ├── globals.css .......... Tailwind v3 + shimmer + scrollbar
│   │   ├── page.tsx ............. Dashboard home (stats, upcoming RDV)
│   │   ├── calendar/page.tsx .... Calendrier semaine (7j, 07h-20h)
│   │   ├── appointments/page.tsx  Liste RDV (filtres, CRUD, modal creation)
│   │   ├── services/page.tsx .... CRUD services (cards, categories)
│   │   ├── hours/page.tsx ....... Horaires (7j toggles, pause dejeuner)
│   │   ├── clients/page.tsx ..... Annuaire clients (recherche, historique)
│   │   ├── stats/page.tsx ....... Analytics (KPI, breakdowns, top services)
│   │   ├── agent/page.tsx ....... Agent IA chat (mode demo, suggestion chips)
│   │   └── settings/page.tsx .... Parametres (4 sections, save per section)
│   ├── components/
│   │   ├── layout/ .............. Sidebar + TopBar + DashboardLayout
│   │   └── ui/ .................. Skeleton (shimmer, cards, rows)
│   ├── hooks/ ................... 5 hooks TanStack Query
│   │   ├── useAppointments.ts ... CRUD + filters + joins
│   │   ├── useServices.ts ....... CRUD + soft delete
│   │   ├── useClients.ts ........ list + history + create
│   │   ├── useBusiness.ts ....... get + update
│   │   └── useStats.ts .......... dashboard stats (5 parallel queries)
│   ├── lib/ ..................... supabase, store (Zustand), providers, utils
│   └── types/database.ts ........ 8 interfaces + Database type
├── tailwind.config.ts ........... brand colors (#25D366)
├── next.config.js ............... minimal config
└── package.json ................. next@14, react@18, tailwind@3
```

### Decisions techniques
- **Tailwind v3** (pas v4) — v4 a des breaking changes (CSS-first config), v3 plus stable avec Next.js 14
- **Supabase untyped client** — le Database generic causait des erreurs TS avec les join relations. Sans generic, le cast `as Type` marche parfaitement
- **Hooks acceptent `string | null`** — businessId vient de Zustand qui peut etre null. Toutes les queries ont `enabled: Boolean(businessId)`
- **Agent IA en mode demo** — fake responses locales. Backend n8n a connecter plus tard

### Pages / Features

| Page | Description |
|------|-------------|
| `/` | Dashboard home — stats du jour, RDV a venir, alertes |
| `/calendar` | Calendrier interactif (jour/semaine/mois) avec drag & drop |
| `/appointments` | Liste des RDV (filtres: confirmes, annules, no-shows, passes) |
| `/services` | CRUD services (nom, duree, prix, categorie, actif/inactif) |
| `/hours` | Horaires d'ouverture + jours feries + vacances |
| `/settings` | Parametres chatbot (message accueil, services actifs, creneaux) |
| `/agent` | **Agent IA integre** — chat conversationnel pour gerer le business |
| `/stats` | Analytics (RDV/semaine, taux no-show, top services, heures de pointe) |
| `/clients` | Liste des clients (historique RDV, preferences, fidelite) |

### Agent IA integre (page /agent)
Chat dans le dashboard, alimente par Claude Haiku via n8n. Le gerant parle en langage naturel :
- "Reserve M. Teva demain 14h coupe homme" → cree le RDV dans Supabase
- "Ferme samedi prochain" → bloque tous les creneaux du samedi
- "Combien de RDV cette semaine ?" → query Supabase, repond avec chiffres
- "Bloque lundi matin, je suis en formation" → cree blocked_slots
- "Ajoute un service 'Balayage' a 8500 F, 90 min" → INSERT dans services
- "Quels sont mes no-shows du mois ?" → stats filtrees
Le tout via un workflow n8n AI Agent avec tools Supabase.

### Tables Supabase additionnelles (a creer)
- `bookbot_blocked_slots` — creneaux bloques manuellement
- `bookbot_clients` — clients du business (nom, tel, email, preferences, nb visites)
- `bookbot_stats_daily` — stats aggregees par jour (materialized view ou cron)

### Template duplicable
Le dashboard est un **template** : on le duplique pour chaque nouveau client.
- Config via `bookbot_businesses` (deja existant) : nom, services, horaires, timezone
- Chaque client a son propre deploy Vercel (ou multi-tenant avec auth)
- Les donnees sont isolees par `business_id` + RLS Supabase
- Duplication = fork du repo + modifier les env vars + deploy

### Relation avec le package complet BookBot

```
Package BookBot Client = {
  1. Bot WhatsApp (workflow n8n duplique)
  2. Bot Messenger (meme workflow, canal ajoute)
  3. Dashboard Client (Next.js duplique)
  4. Launch Kit (QR codes, posts FB, signaletique, guide ads)
  5. Proposition commerciale (lien Vercel personnalise)
}
```

Tout est duplicable en <1h pour un nouveau client.

---

## Demo Messenger HTML (A CONSTRUIRE)

> **Statut** : PLANIFIE — simule un chat Messenger dans la propale

### Concept
Un faux chat Messenger integre dans la page de proposition commerciale (`proposition-bookbot.vercel.app`).
- Design pixel-perfect Messenger (bulles, avatar, horodatage)
- Flow de reservation anime etape par etape (auto-scroll, typing indicator)
- Contexte personnalisable par secteur (salon, resto, medical)
- PAS besoin d'App Review — c'est du HTML/CSS/JS pur
- Remplace la demo WhatsApp mockup actuelle dans la propale (ou s'ajoute a cote)

### Implementation
- Composant HTML/CSS standalone (integrable dans n'importe quelle page)
- Animation sequentielle : message client → typing... → reponse bot → etc.
- Boutons interactifs cliquables (comme le vrai Messenger)
- Variante par secteur dans le texte des messages

---

## Prospection Email

### App Facebook
- **App "PACIFIKAI Messaging"** : ID `854522137595486`
- Privacy policy configuree : `proposition-bookbot.vercel.app/privacy`
- App Review `pages_messaging` : PAS encore soumise (pas bloquant pour le lancement WhatsApp)

### Campagne 31 Prospects
- **Fichier prospects** : `prospects-bookbot.json` (31 prospects, emails verifies)
- **Fichier emails** : `marketing/bookbot-outreach/CAMPAGNE-31-PROSPECTS.md`
- **Dashboard vision** : `solutions/bookflow/vision-bookbot.html`
- **Repartition** : 10 salons, 10 restaurants, 11 medical
- **Statut** : EN ATTENTE VALIDATION JORDY
- **Envoi via** : Brevo (jordytoofa@gmail.com)

### Templates email (regle PROPOSITION COMMERCIALE)
- `marketing/bookbot-outreach/email-salon-barbier.md`
- `marketing/bookbot-outreach/email-restaurant.md`
- `marketing/bookbot-outreach/email-medical.md`

---

**Derniere MAJ**: 2026-02-26
