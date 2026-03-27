# Ve'a — Upgrades à Appliquer (mars 2026)

> Basé sur: `agentic-rag-production-llm-2026.md` + `nextjs-react-typescript-advanced-2026.md`

## Priorité 1 — Chatbot IA plus intelligent

### Adaptive Retrieval pour le booking
- Questions de réservation ("je veux un RDV demain 14h") → PAS de RAG, direct booking logic
- Questions sur le business ("vous faites quoi comme soins ?") → RAG sur knowledge base du commerçant
- Questions hors-sujet → réponse courte sans retrieval
- **Gain** : réponses 2x plus rapides, moins de tokens

### Structured Output strict pour les actions
- Booking action → Zod schema `{ action: 'book', date, time, service_id, client_name }`
- Cancel action → `{ action: 'cancel', booking_id, reason }`
- Info request → `{ action: 'info', topic }`
- **Gain** : zéro parsing error, actions fiables

### Semantic Cache par commerçant
- Cache les réponses fréquentes par business (horaires, services, prix)
- "Vous êtes ouvert quand ?" → cache hit (même réponse pour tous les clients du même business)
- **Gain** : -50% appels LLM, réponse < 500ms

### Fallback model chain
- Primary : DeepSeek V3 ($0.14/M) — suffisant pour 90% des conversations booking
- Fallback : Claude Sonnet ($3/M) — si DeepSeek timeout ou question complexe
- **Gain** : coût quasi-nul pour les conversations simples

## Priorité 2 — Dashboard Next.js 16

### React Compiler
- `reactCompiler: true` → performance dashboard immédiate
- 29 pages de dashboard → -20% render time

### `"use cache"` sur les pages dashboard
- Liste des services → `cacheLife("hours")` + `cacheTag("services")`
- Stats/analytics → `cacheLife("minutes")`
- Chat test → dynamique (pas de cache)

### `useOptimistic` pour les actions
- Toggle dispo créneau → optimistic (UI instant, sync background)
- Modifier un service → optimistic update
- Confirmer/annuler RDV → optimistic avec rollback si erreur

### Supabase SSR gotchas
- Remplacer `getSession()` par `getUser()` partout
- Vérifier `createServerClient` dans les Server Components

## Priorité 3 — Multi-canal

### Tool Calling pour les 3 canaux
- Messenger/Instagram/WhatsApp → même intent mais format différent
- Tool : `checkAvailability`, `createBooking`, `cancelBooking`, `getBusinessInfo`
- Parallel tool calls si le client demande plusieurs infos

## Fichiers à modifier
- `dashboard/src/lib/ai-chat.ts` — adaptive retrieval + structured output
- `dashboard/src/lib/cache.ts` — semantic cache par business
- `tasks/src/messenger-webhook.ts` — model routing + fallback
- `dashboard/next.config.ts` — React Compiler
- `dashboard/src/app/*/page.tsx` — `"use cache"` sur pages statiques
