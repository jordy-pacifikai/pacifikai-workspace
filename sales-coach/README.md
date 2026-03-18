# PACIFIK'AI Sales Coach - Agent Avatar IA

> **Instructions Claude**: Lis ce fichier pour reprendre le projet Sales Coach.

---

## Quick Start

### Tester le Coach PACIFIK'AI (Mana)
```bash
# Generer un nouveau lien de conversation
curl -s -X POST "https://tavusapi.com/v2/conversations" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 086f0eddd8ec45d69b3088aa6f9102e9" \
  -d '{"persona_id": "p599549fb6ee"}'
```
Puis ouvre le `conversation_url` retourne.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PACIFIK'AI Sales Coach                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  NIVEAU 1: Coach Permanent (Mana)                       │
│  ─────────────────────────────────                      │
│  - Connait TOUT sur PACIFIK'AI                          │
│  - Te forme sur pitch, objections, closing              │
│  - Persona ID: p599549fb6ee                             │
│  - Replica: Mary Office (r68fe8906e53)                  │
│                                                         │
│  NIVEAU 2: Prospects Dynamiques (a creer)               │
│  ────────────────────────────────────────               │
│  - Charge avant chaque RDV                              │
│  - Connait le prospect specifique                       │
│  - Simule le C-Level cible                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Personas Disponibles

### Coach PACIFIK'AI - Mana
| Champ | Valeur |
|-------|--------|
| **Persona ID** | `p599549fb6ee` |
| **Nom** | Mana |
| **Role** | Coach vente + Roleplay prospects |
| **Replica** | Mary Office (`r68fe8906e53`) |
| **Cree le** | 2026-02-04 |

**Capabilities:**
- Mode Coach: feedback sur pitch, posture, arguments
- Mode Prospect: joue des C-Levels polynesiens sceptiques
- Connait: offre PACIFIK'AI, tarifs, references, objections

---

## Credentials Tavus

| Champ | Valeur |
|-------|--------|
| **API Key** | `086f0eddd8ec45d69b3088aa6f9102e9` |
| **Base URL** | `https://tavusapi.com/v2` |
| **Docs** | https://docs.tavus.io |
| **Dashboard** | https://platform.tavus.io |

### Quota (Plan Free)
- **25 minutes** de conversation gratuites
- Puis Starter a 59$/mois pour 100 minutes

---

## Comment utiliser

### 1. Session Training (Coach Mana)
```bash
# Creer conversation avec Mana
curl -s -X POST "https://tavusapi.com/v2/conversations" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 086f0eddd8ec45d69b3088aa6f9102e9" \
  -d '{"persona_id": "p599549fb6ee"}'
```

### 2. Simulation Prospect (a implementer)
```bash
# Workflow prevu:
# 1. Charger fiche prospect depuis Airtable
# 2. Creer persona dynamique avec contexte prospect
# 3. Generer lien conversation
# 4. Apres session: sauvegarder feedback
```

---

## Replicas Disponibles (pour varier les avatars)

| Replica ID | Nom | Style | Usage suggere |
|------------|-----|-------|---------------|
| `r68fe8906e53` | Mary - Office | Bureau pro feminin | Coach Mana (actuel) |
| `r1a4e22fa0d9` | Benjamin | Pro masculin | Prospect CEO |
| `ra066ab28864` | Raj | Bureau | Prospect CTO |
| `r92debe21318` | James | Pro masculin | Prospect CFO/DAF |
| `r9fa0878977a` | Olivia - Office | Bureau feminin | Prospect DRH |
| `rbe2c395e725` | Gloria - Conversational | Conversationnel | Coach alternatif |

---

## Status Actuel

### Problemes identifies (2026-02-04)
1. **Credits epuises**: 25 min free tier consommees
2. **Accent bizarre**: Les replicas Tavus sont anglophones, le lip-sync ne match pas le francais
3. **Voix FR configuree**: `French Conversational Lady` (Cartesia) mais accent reste

### Alternative a explorer: HeyGen
| Critere | Tavus | HeyGen |
|---------|-------|--------|
| Free tier | 25 min | 50 min streaming |
| Langues natives | Voix FR, avatar EN | 175+ langues avec lip-sync natif |
| Prix mensuel | 59$/100 min | 99$/500 min |
| Qualite FR | Accent bizarre | A tester |

**Decision**: Tester HeyGen pour comparer la qualite du francais

---

## Prochaines etapes

- [x] ~~Tester Coach Mana (25 min gratuites)~~ Credits epuises
- [ ] **PRIORITE**: Tester HeyGen (50 min gratuites) pour comparer qualite FR
- [ ] Choisir plateforme finale (Tavus vs HeyGen)
- [ ] Creer workflow n8n pour generer prospect dynamique
- [ ] Ajouter Knowledge Base avec docs commerciaux
- [ ] Creer app Next.js pour interface unifiee
- [ ] Integrer avec Airtable CRM (log sessions)

---

## API Reference

### Creer conversation
```bash
POST https://tavusapi.com/v2/conversations
{
  "persona_id": "p599549fb6ee",
  "conversation_name": "Session Training 2026-02-04"  # optionnel
}
```

### Lister personas
```bash
GET https://tavusapi.com/v2/personas
```

### Creer nouveau persona
```bash
POST https://tavusapi.com/v2/personas
{
  "persona_name": "Nom",
  "system_prompt": "Instructions...",
  "context": "Contexte...",
  "default_replica_id": "rXXXXX",
  "greeting": "Message d'accueil",
  "layers": {...}
}
```

---

---

## Voix Francaises Cartesia (pour reference)

| Voice ID | Nom | Style |
|----------|-----|-------|
| `a249eaff-1e96-4d2c-b23b-12efa4f66f41` | French Conversational Lady | Conversationnel (actuel) |
| `a8a1eb38-5f15-4c1d-8722-7ac0f329727d` | Calm French Woman | Calme |
| `8832a0b5-47b2-4751-bb22-6a8e2149303d` | French Narrator Lady | Narratrice |
| `65b25c5d-ff07-4687-a04c-da2f43ef6fa9` | Helpful French Lady | Serviable |
| `5c3c89e5-535f-43ef-b14d-f8ffe148c1f0` | French Narrator Man | Narrateur |
| `ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3` | Friendly French Man | Amical |
| `0418348a-0ca2-4e90-9986-800fb8b3bbc0` | Stern French Man | Serieux |

---

*Derniere MAJ: 2026-02-04*
