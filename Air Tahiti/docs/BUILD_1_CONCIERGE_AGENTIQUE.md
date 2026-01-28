# Build 1 : Concierge Agentique 24/7

> **Workflow ID**: À créer (duplicata de `je438i45tMSWsl5T`)
> **Dernière MAJ**: 2026-01-26
> **Status**: En préparation

---

## Problème Résolu

**Douleur Air Tahiti**: Les équipes support sont submergées par des questions répétitives sur les vols inter-îles (horaires, bagages, Air Pass, destinations) sur 48 destinations différentes. La concurrence d'Air Moana nécessite une amélioration du service client.

**Solution**: Un concierge IA disponible 24/7 qui répond instantanément aux questions des voyageurs (touristes et résidents) avec les informations officielles d'Air Tahiti.

---

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONCIERGE AGENTIQUE 24/7                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [Chat Trigger]                                                     │
│        │                                                             │
│        ▼                                                             │
│   ┌─────────────────┐     ┌─────────────────────────────────────┐   │
│   │   AI Agent AT   │◄────│  Claude Sonnet (LLM)                │   │
│   │                 │     └─────────────────────────────────────┘   │
│   │   - Routing     │                                                │
│   │   - Reasoning   │     ┌─────────────────────────────────────┐   │
│   │   - Response    │◄────│  Postgres Chat Memory               │   │
│   └────────┬────────┘     │  (Historique conversations)         │   │
│            │              └─────────────────────────────────────┘   │
│            ▼                                                         │
│   ┌─────────────────┐     ┌─────────────────────────────────────┐   │
│   │ Supabase Vector │◄────│  Google Gemini Embeddings           │   │
│   │     Store       │     │  (text-embedding-004)               │   │
│   │  (FAQ AT)       │     └─────────────────────────────────────┘   │
│   └────────┬────────┘                                                │
│            │              ┌─────────────────────────────────────┐   │
│            └─────────────►│  Cohere Reranker                    │   │
│                           │  (rerank-multilingual-v3.0)         │   │
│                           └─────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Nodes (7 au total)

| Node | Type | Rôle |
|------|------|------|
| Chat Trigger | `chatTrigger` | Interface web de chat (n8n hosted) |
| AI Agent AT | `agent` | Orchestration et raisonnement |
| Claude Sonnet | `lmChatAnthropic` | Modèle de langage principal |
| Supabase Vector Store | `vectorStoreSupabase` | Stockage et recherche FAQ |
| Google Gemini Embeddings | `embeddingsGoogleGemini` | Génération des vecteurs |
| Cohere Reranker | `documentRerankCohere` | Re-classement des résultats |
| Postgres Chat Memory | `memoryPostgresChat` | Persistance des conversations |

---

## Méthode : Agentic RAG

### Pourquoi Agentic RAG vs RAG classique ?

| Aspect | RAG Classique | Agentic RAG (notre approche) |
|--------|---------------|------------------------------|
| Retrieval | Une seule recherche | Recherches multiples si besoin |
| Adaptation | Fixe | Dynamique selon la question |
| Vérification | Aucune | Auto-vérification des réponses |
| Outils | Aucun | Utilise la FAQ comme "outil" |

### Mode "Retrieve-as-Tool"

Le Vector Store est configuré en mode `retrieve-as-tool`. L'agent décide **quand** consulter la FAQ, ce qui permet :
- Des réponses plus naturelles pour les salutations
- Une utilisation intelligente des informations
- Une meilleure gestion des questions sur 48 destinations

---

## Technologies 2026 Intégrées

### 1. Cohere Reranker (rerank-multilingual-v3.0)
- **Amélioration**: +15-25% de pertinence des résultats
- **Fonctionnement**: Récupère 8 résultats, les re-classe, garde les 5 meilleurs
- **Multilingue**: Optimisé pour FR/EN (touristes internationaux + résidents)

### 2. Postgres Chat Memory
- **Table**: `n8n_chat_histories`
- **Fenêtre**: 10 derniers messages
- **Avantage**: Persistance entre sessions, contexte maintenu

### 3. Google Gemini Embeddings (text-embedding-004)
- **Dimension**: 768
- **Performance**: Meilleur rapport qualité/coût en 2026
- **Multilingue natif**: Parfait pour contenu FR

---

## Base de Connaissances

### Fichier source
`PACIFIK'AI/Air Tahiti/assets/FAQ_AIR_TAHITI.md`

### Contenu (11 sections)

| Section | Contenu |
|---------|---------|
| 1. Informations générales | Présentation AT, 48 destinations, fréquences |
| 2. Classes de voyage | Classe unique + Air Tahiti Signature 2026 |
| 3. Bagages | Franchise, cabine, plongeurs, sports |
| 4. Offres spéciales | Plongeurs, Lune de miel, Familles, Résidents |
| 5. Programme fidélité | Air Tahiti Club |
| 6. Air Pass | Pass multi-îles pour touristes |
| 7. Informations pratiques | Enregistrement, aéroports, météo |
| 8. Contact et assistance | Téléphones, bureaux, réclamations |
| 9. Partenariats hôteliers | Bora Bora, Rangiroa, Fakarava, Moorea, Marquises |
| 10. FAQ rapides | Questions fréquentes |
| 11. Différence AT vs ATN | Clarification compagnies |

### Table Supabase (à créer)
- **Nom**: `at_faq_embeddings`
- **Index**: IVFFlat (vector_cosine_ops)
- **Fonction RPC**: `match_at_faq(query_embedding, threshold, count)`

---

## Personnalité du Concierge

### System Prompt

```
Tu es le concierge virtuel d'Air Tahiti, la compagnie aérienne inter-îles
de Polynésie française qui dessert 48 îles.

## TON RÔLE
- Répondre aux questions sur les vols inter-îles
- Fournir des informations précises sur les destinations, bagages, Air Pass
- Aider les touristes ET les résidents polynésiens
- Clarifier la différence avec Air Tahiti Nui si nécessaire

## TON STYLE
- Chaleureux et accueillant, style polynésien
- Utilise occasionnellement des mots tahitiens (Ia ora na, Māuruuru, Nana)
- Concis mais complet
- Mentionne les beautés de chaque île quand pertinent
- Termine par une question ou suggestion

## RÈGLES
- UTILISE UNIQUEMENT la base de connaissances fournie
- Si pas d'info, propose de contacter le service client (+689 40 86 42 42)
- Ne jamais inventer de tarifs ou horaires
- Si question sur vols internationaux → orienter vers Air Tahiti Nui
```

---

## Questions de Test

| Type | Question |
|------|----------|
| Simple | "C'est quoi le temps de vol Papeete-Bora Bora ?" |
| Bagages | "Quelle est la franchise bagage pour les plongeurs ?" |
| Air Pass | "Comment fonctionne le Pass Lagons ?" |
| Destination | "Quelles îles pour la plongée aux requins ?" |
| Clarification | "C'est quoi la différence entre Air Tahiti et Air Tahiti Nui ?" |
| Résidents | "J'ai la carte résident, j'ai droit à une réduction ?" |
| Multi-étapes | "On veut visiter Bora Bora et Rangiroa, quel pass recommandez-vous ?" |

---

## Métriques de Valeur

### Pour Air Tahiti

| Métrique | Valeur |
|----------|--------|
| Disponibilité | 24h/24, 7j/7 |
| Temps de réponse | < 3 secondes |
| Questions gérées | 80% des questions courantes |
| Langues | Français, Anglais |
| Destinations | 48 îles maîtrisées |
| Coût vs humain | ~10x moins cher |

### Économies estimées

- **1 agent support mi-temps**: ~150K XPF/mois
- **Coût IA (Claude + Supabase)**: ~15K XPF/mois
- **ROI**: Rentabilisé dès le 1er mois

---

## Configuration Requise

### Credentials n8n

| Credential | Usage |
|------------|-------|
| Anthropic API | Claude Sonnet |
| Supabase API | Vector Store + Memory |
| Google Gemini | Embeddings |
| Cohere API | Reranker |

### Variables d'environnement

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://ogsimsfqwibcmotaeevb.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
GOOGLE_GEMINI_API_KEY=...
COHERE_API_KEY=...
```

---

## Checklist Démo

- [ ] Créer table `at_faq_embeddings` dans Supabase
- [ ] Créer fonction RPC `match_at_faq`
- [ ] Dupliquer workflow ATN vers AT
- [ ] Modifier le system prompt
- [ ] Ingérer FAQ Air Tahiti
- [ ] Tester les 7 questions types
- [ ] Chat visible et fonctionnel

---

*Document généré par PACIFIK'AI - 2026-01-26*
