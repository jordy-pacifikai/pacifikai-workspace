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

**Derniere MAJ**: 2026-01-29
