# Workflow: Publication Facebook Automatique - Actualités IA (Multi-Sources)

> **Workflow ID**: `hZotr6emniXBXMO4`
> **Instance n8n**: https://n8n.srv1140766.hstgr.cloud

---

## Description

Workflow avancé qui publie automatiquement des posts Facebook sur l'actualité IA tous les **lundi, mercredi et vendredi à 8h** (heure Tahiti).

### Points forts
- **5 sources RSS** de qualité (pas juste une API)
- **Synthèse intelligente** par Claude (sélectionne les news les plus impactantes)
- **Génération d'image** avec Fal.ai Nano Banana Pro + watermark PACIFIK'AI via QuickChart API
- **Queue pattern async** pour Fal.ai (submit → wait → poll → result)
- **Log automatique** dans Airtable Content Calendar

---

## Architecture du Workflow

```
Schedule Trigger (Lun/Mer/Ven 8h Tahiti)
    │
    ├──> TechCrunch AI (RSS)
    ├──> The Verge AI (RSS)
    ├──> VentureBeat AI (RSS)
    ├──> Wired AI (RSS)
    └──> MIT Tech Review (RSS)
            │
            ▼
    Merge All Feeds (combine les 5 sources)
            │
            ▼
    Filter Recent (articles < 48h seulement)
            │
            ▼
    Limit to 15 (top 15 articles)
            │
            ▼
    Aggregate All Articles (15 items → 1 batch)
            │
            ▼
    Agent 1 - Claude Sonnet (sélectionne 1-2 news + génère post Facebook)
            │
            ▼
    Parse Agent 1 Response
            │
            ▼
    Agent 2 - Claude Haiku (génère prompt image hook ultra-détaillé)
            │
            ▼
    Prepare Image Data
            │
            ▼
    FAL POST Submit (queue.fal.run - async)
            │
            ▼
    Wait 10s
            │
            ▼
    FAL Status Check ──────────────────┐
            │                          │
            ▼                          │
    If (status == COMPLETED?)          │
            │                          │
     ┌──────┴──────┐                   │
     ▼             ▼                   │
   TRUE          FALSE ────────────────┘
     │            (loop back to Wait)
     ▼
    FAL GET Result
            │
            ▼
    Add Watermark (QuickChart API)
            │
            ▼
    Prepare Facebook Post
            │
            ▼
    Upload Image Temp (catbox.moe)
            │
            ▼
    Publish to Facebook (Graph API)
            │
            ▼
    Log to Airtable (Content Calendar)
```

---

## Sources RSS

| Source | URL | Spécialité |
|--------|-----|------------|
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` | Startups, levées de fonds |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` | Grand public, tendances |
| VentureBeat AI | `https://venturebeat.com/category/ai/feed/` | Enterprise AI |
| Wired AI | `https://www.wired.com/feed/tag/ai/latest/rss` | Impact sociétal |
| MIT Tech Review | `https://www.technologyreview.com/feed/` | Recherche, innovation |

---

## Credentials à Configurer

### 1. Anthropic Claude API
**Type**: Anthropic API

| Champ | Valeur |
|-------|--------|
| API Key | Ta clé Anthropic |

**Obtenir**: https://console.anthropic.com/

### 2. Fal.ai API (Nano Banana Pro)
**Type**: HTTP Header Auth

| Champ | Valeur |
|-------|--------|
| Name | `Authorization` |
| Value | `Key {FAL_KEY}` |

**Obtenir**: https://fal.ai/dashboard/keys

**Pricing**: $0.15/image (2K), $0.30/image (4K)

### 3. Facebook Graph API
**Type**: HTTP Query Auth

| Champ | Valeur |
|-------|--------|
| Name | `access_token` |
| Value | Page Access Token PACIFIK'AI |

**Obtenir le token**:
1. https://developers.facebook.com/tools/explorer/
2. Sélectionner l'app "HVC Post"
3. Cliquer "Obtenir un token d'accès de Page"
4. Sélectionner "PACIFIK'AI"

### 4. Airtable API
**Type**: HTTP Header Auth

| Champ | Valeur |
|-------|--------|
| Name | `Authorization` |
| Value | `Bearer pat...` (ton Personal Access Token) |

**Obtenir**: https://airtable.com/create/tokens

---

## Prompt Claude (Synthèse)

Le prompt demande à Claude de:
1. **Sélectionner** les 1-2 actualités les plus impactantes pour des entrepreneurs
2. **Privilégier** les success stories, outils accessibles, gains de productivité
3. **Éviter** les news trop techniques (papers de recherche, modèles ML)
4. **Générer** le post Facebook complet avec emojis et hashtags
5. **Créer** un prompt pour la génération d'image

Format de sortie JSON:
```json
{
  "selected_news": [...],
  "facebook_post": "Post prêt à publier",
  "image_prompt": "Prompt DALL-E en anglais"
}
```

---

## Génération d'Image

- **Modèle**: Fal.ai Nano Banana Pro (Google Gemini 3 Pro Image)
- **Format**: 16:9 (landscape)
- **Résolution**: 2K
- **Style**: Moderne, tech, hook visuel, couleurs vives
- **Watermark**: Logo PACIFIK'AI via QuickChart API (position: bottom-right, 15% ratio, 85% opacity)

### Fal.ai Queue Pattern (Async)

Le workflow utilise le pattern queue asynchrone de Fal.ai:

1. **Submit** → `POST https://queue.fal.run/fal-ai/nano-banana-pro`
   - Retourne `request_id`
2. **Wait** → 10 secondes
3. **Status** → `GET .../requests/{request_id}/status`
   - Si `COMPLETED` → continuer
   - Sinon → loop back to Wait
4. **Result** → `GET .../requests/{request_id}`
   - Retourne l'image générée

### QuickChart Watermark API

Le watermark est ajouté via l'API gratuite QuickChart:

```
GET https://quickchart.io/watermark
  ?mainImageUrl={fal_image_url}
  &markImageUrl={logo_dropbox_url}
  &position=bottomRight
  &markRatio=0.15
  &opacity=0.85
```

**Logo PACIFIK'AI sur Dropbox**:
```
https://www.dropbox.com/scl/fi/qghxm81u0de3bt9ohgzs4/logo-transparent-noir.png?rlkey=77npxv8mbbe3wl08i0dkz7xdk&dl=1
```

### Agent 2 - Prompt Image Hook

L'Agent 2 (Claude Haiku) génère un prompt ultra-détaillé pour créer une miniature accrocheuse :
- Style futuriste, tech, dynamique
- Couleurs: bleu électrique, violet, cyan, touches d'or
- Jamais de texte ni de visages réalistes
- Format 16:9 optimisé pour le scroll Facebook

### Paramètres Nano Banana Pro

```json
{
  "prompt": "{{ $json.image_prompt }}",
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "num_images": 1,
  "output_format": "png"
}
```

**Options disponibles:**
| Paramètre | Valeurs |
|-----------|---------|
| aspect_ratio | 21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16 |
| resolution | 1K, 2K, 4K |
| output_format | jpeg, png, webp |

---

## Log Airtable

Chaque publication est automatiquement enregistrée dans la table **Content Calendar**:
- Titre: "Post Auto IA - [date]"
- Contenu: Texte du post
- Type: "Actualité IA"
- Status: "Publié"
- Image URL: URL de l'image générée

---

## Activer le Workflow

1. Ouvrir n8n: https://n8n.srv1140766.hstgr.cloud
2. Aller dans "PACIFIKAI - Publication Facebook IA (Multi-Sources)"
3. Configurer les 4 credentials
4. Cliquer "Active" en haut à droite
5. Le workflow s'exécute automatiquement Lun/Mer/Ven à 8h

---

## Test Manuel

1. Ouvrir le workflow dans n8n
2. Cliquer "Execute Workflow"
3. Vérifier:
   - Les 5 RSS retournent des articles
   - Claude génère un JSON valide
   - L'image est générée
   - Le post apparaît sur Facebook
   - L'entrée est créée dans Airtable

---

## Coûts Estimés

| Service | Coût/exécution | Coût/mois (12 exec) |
|---------|----------------|---------------------|
| Claude Sonnet (Agent 1) | ~$0.01 | ~$0.12 |
| Claude Haiku (Agent 2) | ~$0.002 | ~$0.024 |
| Nano Banana Pro (2K) | ~$0.15 | ~$1.80 |
| **Total** | ~$0.16 | **~$1.95** |

---

## Troubleshooting

| Erreur | Solution |
|--------|----------|
| RSS vide | Vérifier que l'URL du feed est accessible |
| Claude JSON invalide | Le prompt parse le JSON, vérifier le format |
| Fal.ai 401 | Clé API invalide, vérifier `Authorization: Key {FAL_KEY}` |
| Fal.ai 400 | Prompt trop long (max 50K chars) ou aspect_ratio invalide |
| Facebook 190 | Token expiré, regénérer via Graph Explorer |
| Airtable 401 | Token invalide ou expiré |

---

## Améliorations Futures

- [ ] Ajouter plus de sources (OpenAI Blog, Anthropic Blog, Hugging Face)
- [ ] Fallback si DALL-E échoue (utiliser image stock)
- [ ] Notification Slack/Email si erreur
- [ ] A/B testing des formats de post
- [ ] Réutiliser l'image pour le blog

---

**Créé le**: 2026-01-23
**Dernière MAJ**: 2026-01-24

---

## API Fal.ai Nano Banana Pro - Référence

### Endpoints (Queue Pattern - Recommandé)

| Action | Method | URL |
|--------|--------|-----|
| Submit | POST | `https://queue.fal.run/fal-ai/nano-banana-pro` |
| Status | GET | `https://queue.fal.run/fal-ai/nano-banana-pro/requests/{request_id}/status` |
| Result | GET | `https://queue.fal.run/fal-ai/nano-banana-pro/requests/{request_id}` |

### Endpoint Sync (Non recommandé pour prod)

**Endpoint**: `https://fal.run/fal-ai/nano-banana-pro`

### Authentification
```
Header: Authorization: Key {FAL_KEY}
```

### Input Schema
```json
{
  "prompt": "string (required, 3-50000 chars)",
  "num_images": 1,
  "aspect_ratio": "16:9",
  "resolution": "2K",
  "output_format": "png",
  "seed": 12345
}
```

### Submit Response
```json
{
  "request_id": "abc123-def456-...",
  "response_url": "https://queue.fal.run/.../requests/abc123.../response",
  "status_url": "https://queue.fal.run/.../requests/abc123.../status",
  "cancel_url": "https://queue.fal.run/.../requests/abc123.../cancel"
}
```

### Status Response
```json
{
  "status": "IN_PROGRESS" | "COMPLETED" | "FAILED",
  "queue_position": 0
}
```

### Result Response
```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "content_type": "image/png",
      "width": 1920,
      "height": 1080
    }
  ],
  "description": "Generated image description"
}
```

**Documentation**: https://fal.ai/models/fal-ai/nano-banana-pro/api

---

## QuickChart Watermark API - Référence

**Endpoint**: `https://quickchart.io/watermark`

### Paramètres

| Paramètre | Description | Default |
|-----------|-------------|---------|
| mainImageUrl | URL de l'image principale (required) | - |
| markImageUrl | URL du watermark/logo (required) | - |
| opacity | Transparence du watermark (0.0-1.0) | 1.0 |
| position | Position: topLeft, topMiddle, topRight, middleLeft, center, middleRight, bottomLeft, bottomMiddle, bottomRight | bottomRight |
| markRatio | Taille relative du watermark (0.0-1.0) | - |
| margin | Marge en pixels | 5% |

### Limites
- Image max 1 MB (plan gratuit)
- Image max 10 MB (plan payant)

**Documentation**: https://quickchart.io/documentation/watermark-api/
