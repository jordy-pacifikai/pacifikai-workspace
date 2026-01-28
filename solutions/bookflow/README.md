# BookFlow

SaaS de prise de rendez-vous pour les metiers de la beaute et du bien-etre.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| App Mobile | React Native + Expo |
| Dashboard Web | React + Vite |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| Orchestration IA | n8n webhooks |
| Chatbot | Claude API via n8n |
| Notifications | Expo Push + Twilio SMS |
| Offline | WatermelonDB |

## Structure

```
bookflow/
├── app/                # React Native (Expo)
├── web/                # Dashboard React
├── supabase/
│   ├── schema.sql      # Structure BDD
│   └── seed.sql        # Donnees de test
├── n8n/                # Workflows n8n
└── prompts/            # System prompts IA
```

## Setup

### 1. Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Executer `supabase/schema.sql` dans le SQL Editor
3. Executer `supabase/seed.sql` pour les donnees de test
4. Configurer l'authentification (Email, Google, Apple)

### 2. App Mobile

```bash
cd app
npm install
npx expo start
```

### 3. Dashboard Web

```bash
cd web
npm install
npm run dev
```

## Fonctionnalites

### Client
- [ ] Explorer les pros (annuaire)
- [ ] Prendre RDV (classique ou chatbot)
- [ ] Guest booking (sans compte)
- [ ] Points fidelite
- [ ] Rappels push/SMS

### Pro
- [ ] Dashboard + Agenda
- [ ] Page publique personnalisee
- [ ] Lien de partage + QR code
- [ ] Chatbot commandes vocales
- [ ] Rapport quotidien

## Pricing

| Plan | Mensuel | RDV | Chatbot IA | Fidelite |
|------|---------|-----|------------|----------|
| Free | 0 | 30/mois | Non | Non |
| Starter | 5K XPF | 150/mois | Oui | Basique |
| Pro | 15K XPF | Illimite | Oui + voix | Avance |

## Contact

Projet PACIFIK'AI - [pacifikai.com](https://pacifikai.com)
