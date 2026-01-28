# BookFlow - MASTER

<!-- MEMOIRE AUTOMATIQUE -->
@MEMORY.md

---

> **SaaS de prise de RDV pour les metiers beaute/bien-etre**
> Concurrent low-cost de Fresha pour le marche polynesien

---

## Quick Start

### Demarrer l'app mobile
```bash
cd app && npx expo start
```

### Verifier le TypeScript
```bash
cd app && npx tsc --noEmit
```

---

## Contexte

**BookFlow** est une solution de reservation en ligne destinee aux:
- Coiffeurs / Barbiers
- Prothesistes ongulaires
- Coachs sportifs
- Estheticiennes
- Tout professionnel avec prise de RDV

### Proposition de valeur
1. **Prix agressif** - Freemium vs 600 FCFP/mois chez Fresha
2. **Offline-first** - Fonctionne meme sans connexion
3. **Guest booking** - Pas besoin de compte pour reserver
4. **Fidelite multi-enseignes** - Points cumulables entre pros

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │     │   Dashboard Web │
│  (React Native) │     │     (React)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Supabase  │
              │  (Backend)  │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │     n8n     │
              │  (Chatbot)  │
              └─────────────┘
```

---

## Fichiers Cles

| Fichier | Description |
|---------|-------------|
| [MEMORY.md](MEMORY.md) | Memoire projet (hooks, credentials, sprints) |
| [app/](app/) | Code source React Native |
| [supabase/schema.sql](supabase/schema.sql) | Schema base de donnees |
| [supabase/seed.sql](supabase/seed.sql) | Donnees de test |

---

## Ecrans Implementes

### Client (app/(client)/)
- `index.tsx` - Accueil avec RDV a venir
- `explore.tsx` - Explorer les pros
- `appointments.tsx` - Historique RDV
- `chat.tsx` - Assistant IA
- `profile.tsx` - Profil et fidelite

### Pro (app/(pro)/)
- `index.tsx` - Dashboard stats
- `agenda.tsx` - Calendrier RDV
- `clients.tsx` - Liste clients
- `services.tsx` - Gestion prestations
- `settings.tsx` - Parametres business

### Auth (app/auth/)
- `login.tsx` - Connexion
- `signup.tsx` - Inscription (client ou pro)
- `forgot-password.tsx` - Reset password

---

## Prochaines Etapes

1. **WatermelonDB** - Mode offline
2. **Flow reservation** - Choix pro > service > creneau > confirmation
3. **Chatbot n8n** - Assistant vocal
4. **Page publique** - bookflow.app/pro/[slug]

---

## Liens Utiles

- **Supabase Dashboard**: https://supabase.com/dashboard/project/celwaekgtxknzwyjrjym
- **Expo Dev**: https://expo.dev

---

**Derniere MAJ**: 2026-01-27
