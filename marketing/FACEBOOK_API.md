# PACIFIK'AI - Facebook Graph API Documentation

> **Usage**: Publication automatisée sur la page Facebook sans interface manuelle

---

## Credentials

| Élément | Valeur |
|---------|--------|
| **App Name** | HVC Post |
| **App ID** | 1273720593774126 |
| **Page Name** | PACIFIK'AI |
| **Page ID** | 935123186355701 |
| **Page Email** | jordy@pacifikai.com |
| **API Version** | v24.0 |

---

## Obtenir un Page Access Token

1. Aller sur https://developers.facebook.com/tools/explorer/
2. Sélectionner l'app "HVC Post"
3. Cliquer sur "Token utilisateur" → "Obtenir un token d'accès de Page"
4. Sélectionner la page "PACIFIK'AI"
5. Accorder les permissions demandées
6. Copier le token affiché

**Permissions nécessaires:**
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`

**Note**: Les tokens expirent. Regénérer si erreur 190 (token expiré).

---

## Récupérer toutes les pages et leurs tokens

```bash
USER_TOKEN="ton_user_token_ici"

curl -s "https://graph.facebook.com/v24.0/me/accounts?access_token=${USER_TOKEN}" | jq .
```

**Réponse:**
```json
{
  "data": [
    {
      "access_token": "PAGE_ACCESS_TOKEN",
      "name": "PACIFIK'AI",
      "id": "935123186355701",
      "tasks": ["MODERATE", "MESSAGING", "ANALYZE", "ADVERTISE", "CREATE_CONTENT", "MANAGE"]
    }
  ]
}
```

---

## Publier un post avec image

```bash
PAGE_TOKEN="ton_page_token_ici"
PAGE_ID="935123186355701"
IMAGE_URL="https://example.com/image.png"

# Créer le message (utiliser un fichier pour les caractères spéciaux)
cat > /tmp/fb_message.txt << 'ENDMSG'
Ton message ici avec emojis et accents.

#PACIFIKAI #Tahiti
ENDMSG

MESSAGE=$(cat /tmp/fb_message.txt)

curl -s -X POST "https://graph.facebook.com/v24.0/${PAGE_ID}/photos" \
  --data-urlencode "url=${IMAGE_URL}" \
  --data-urlencode "message=${MESSAGE}" \
  --data-urlencode "access_token=${PAGE_TOKEN}" | jq .
```

**Réponse succès:**
```json
{
  "id": "122095500801236701",
  "post_id": "935123186355701_122095500819236701"
}
```

---

## Publier un post texte seul (sans image)

```bash
curl -s -X POST "https://graph.facebook.com/v24.0/${PAGE_ID}/feed" \
  --data-urlencode "message=${MESSAGE}" \
  --data-urlencode "access_token=${PAGE_TOKEN}" | jq .
```

---

## Supprimer un post

```bash
POST_ID="935123186355701_122095500033236701"

curl -s -X DELETE "https://graph.facebook.com/v24.0/${POST_ID}?access_token=${PAGE_TOKEN}" | jq .
```

**Réponse:**
```json
{
  "success": true
}
```

---

## Hébergement d'images (contournement Docker)

Le Browser MCP tourne dans Docker et ne peut pas accéder aux fichiers locaux. Solution: uploader l'image sur un service externe.

### Catbox/Litterbox (recommandé)
```bash
# Upload avec 72h de rétention
curl -s -X POST \
  -F "reqtype=fileupload" \
  -F "time=72h" \
  -F "fileToUpload=@/chemin/vers/image.png" \
  https://litterbox.catbox.moe/resources/internals/api.php

# Retourne l'URL directe: https://litter.catbox.moe/xxxxx.png
```

### Alternatives
- **Imgur**: API plus complexe, parfois 503
- **0x0.st**: Bloque certains user agents

---

## Erreurs courantes

| Code | Message | Solution |
|------|---------|----------|
| 190 | Token expiré | Regénérer via Graph Explorer |
| 200 | Permissions insuffisantes | Vérifier les permissions de l'app |
| 100 | Paramètre invalide | Vérifier l'URL de l'image ou le format du message |

---

## Workflow automatisé n8n (TODO)

Créer un workflow n8n pour:
1. Récupérer les posts planifiés depuis Airtable
2. Télécharger/héberger les images
3. Publier via Graph API
4. Mettre à jour le status dans Airtable

---

## Posts publiés

| Date | Post ID | Contenu |
|------|---------|---------|
| 2026-01-23 | 935123186355701_122095500819236701 | Lancement - Automatisation business globale |

---

**Dernière MAJ**: 2026-01-23
