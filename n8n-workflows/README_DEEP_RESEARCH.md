# Deep Research Prospect - Setup Guide

## Workflow: `deep-research-prospect.json`

Ce workflow génère automatiquement des fiches prospect complètes via recherche web (Tavily) + synthèse IA (Claude).

---

## Architecture

```
Dashboard (bouton) → Webhook n8n → Tavily (5 recherches parallèles) → Claude Sonnet → Fiche Markdown
```

### Ce que fait le workflow:

1. **5 recherches Tavily en parallèle:**
   - Pain points du secteur
   - Opportunités d'automatisation
   - Tendances digitales
   - Case studies IA
   - Success stories

2. **Agrégation des résultats** (top 20 sources)

3. **Génération Claude** avec prompt structuré:
   - Contexte entreprise + chiffres
   - 6 pain points avec citations
   - 10 features automatisables
   - 3 case studies concrets
   - Script appel téléphonique
   - Email de prospection
   - Estimation ROI en XPF

---

## Setup

### 1. Créer un compte Tavily

1. Va sur [tavily.com](https://tavily.com)
2. Crée un compte (gratuit: 1000 crédits/mois)
3. Copie ton API key

### 2. Configurer les variables n8n

Dans n8n → **Settings** → **Variables**, ajoute:

| Variable | Valeur |
|----------|--------|
| `TAVILY_API_KEY` | `tvly-xxxxxxxxxxxxx` |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxx` (déjà configuré normalement) |

### 3. Importer le workflow

1. Dans n8n → **Workflows** → **Import from file**
2. Sélectionne `deep-research-prospect.json`
3. **Active** le workflow

### 4. Vérifier le webhook

L'URL du webhook sera:
```
https://n8n.srv1140766.hstgr.cloud/webhook/deep-research
```

---

## Utilisation

### Depuis le Dashboard PACIFIK'AI

1. Ouvre un prospect dans le CRM
2. Dans la section **"Fiche Recherche IA"**, clique **"Générer"**
3. Attends 1-2 minutes
4. La fiche s'affiche avec options: Copier / Télécharger

### Via API directe

```bash
curl -X POST https://n8n.srv1140766.hstgr.cloud/webhook/deep-research \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Pacific Auto",
    "sector": "Concession automobile",
    "airtableId": "recXXXXXXXX"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "company": "Pacific Auto",
  "filename": "FICHE_RECHERCHE.md",
  "markdown": "# FICHE PROSPECT - Pacific Auto\n...",
  "generatedAt": "2026-01-28T10:30:00Z"
}
```

---

## Coûts estimés

| Service | Coût par fiche |
|---------|----------------|
| Tavily (5 recherches advanced) | ~$0.10 |
| Claude Sonnet (~8000 tokens) | ~$0.35 |
| **TOTAL** | **~$0.45/fiche** |

Avec le free tier Tavily (1000 crédits/mois), tu peux générer ~100 fiches/mois gratuitement (hors coût Claude).

---

## Personnalisation

### Modifier les requêtes de recherche

Dans le node **"Prepare Search Queries"**, adapte le code JavaScript:

```javascript
const searchQueries = [
  `${sector} pain points challenges 2025 2026`,
  `${sector} AI automation opportunities`,
  // Ajoute tes propres requêtes...
];
```

### Modifier le prompt Claude

Dans le node **"Claude - Generate Fiche"**, modifie le `jsonBody` pour changer:
- La structure de la fiche
- Les sections générées
- Le ton / style

---

## Troubleshooting

### Erreur "TAVILY_API_KEY not set"
→ Vérifie que la variable est bien créée dans n8n Settings → Variables

### Erreur "Anthropic 401"
→ Vérifie ANTHROPIC_API_KEY et que tu as du crédit sur ton compte

### Timeout
→ Le workflow peut prendre 1-2 min. Si timeout, augmente dans n8n Settings → Workflow Timeout

### CORS Error depuis le dashboard
→ Le workflow inclut les headers CORS. Si problème, vérifie que le node "Respond Success" a bien les headers configurés.

---

## Fichiers liés

- `PACIFIK'AI/dashboard/index.html` - Dashboard avec bouton intégré
- `PACIFIK'AI/_templates/EXEMPLE_FICHE_PROSPECT_CONCESSION.md` - Exemple de fiche générée
- `PACIFIK'AI/_templates/FICHE_PROSPECT_TEMPLATE.md` - Template de référence
