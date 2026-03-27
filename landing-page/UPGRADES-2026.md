# PACIFIK'AI Landing — Upgrades à Appliquer (mars 2026)

> Basé sur: `nextjs-react-typescript-advanced-2026.md`
> Note: Landing = HTML/JS statique, pas Next.js. Les upgrades Next.js ne s'appliquent PAS.

## Priorité 1 — Chatbot MANA

### Model Routing pour MANA
- Questions simples ("vos services ?", "tarifs ?") → DeepSeek V3 ($0.14/M)
- Questions complexes (devis, cas d'usage spécifique) → Claude Sonnet ($3/M)
- **Gain** : chatbot quasi-gratuit pour 90% des conversations

### Semantic Cache pour les questions fréquentes
- "C'est quoi PACIFIK'AI ?" → cache permanent
- "Vous faites des sites web ?" → cache permanent
- Top 20 questions → cache = zéro coût LLM
- **Gain** : réponse instantanée, $0

### Structured Output pour les leads
- Quand MANA détecte un prospect intéressé → structured output :
  `{ intent: 'lead', service: 'site-web', budget: '100K-500K XPF', contact: '...' }`
- Auto-insert dans Supabase `messenger_prospects`
- **Gain** : qualification automatique

## Priorité 2 — Performance landing

### GSAP gotchas documentés
- `gsap.from()` opacity:0 → `ScrollTrigger.kill()` + `!important`
- `loading="lazy"` incompatible avec certaines animations GSAP
- Ces gotchas sont maintenant dans la KB

### Image optimization
- Toutes les images portfolio → WebP/AVIF
- Lazy load sauf hero (LCP)

## Priorité 3 — Prospection

### Prototypes auto-générés
- 30 prototypes déjà dans `prospection/output/`
- Structured output Zod pour les specs de chaque prototype
- Pipeline : scrape prospect → generate specs → build prototype → deploy
