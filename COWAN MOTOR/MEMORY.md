# COWAN MOTOR - Memoire Prospect

> **Instructions**: Ce fichier contient tout le contexte du prospect.

---

## Informations Entreprise

**Nom**: COWAN MOTOR
**Secteur**: Automobile / Concessionnaire
**Localisation**: Polynesie francaise (PK 4,5 cote mer, Arue)
**Date creation dossier**: 2026-01-28

### Contacts
| Nom | Poste | Email | Telephone |
|-----|-------|-------|-----------|
| Tevahitua Cowan | Direction | cowan.tevahitua1@gmail.com | - |
| Vetea Cowan | (Cc) | - | - |
| Manua Cowan | (Cc) | - | - |

### Pages Facebook a gerer
| Page | Description |
|------|-------------|
| Cowan Motor | Concession principale |
| Tahiti Echappement | Atelier specialise |
| Punaauia Pneus | Centre pneumatiques |
| Station Pacific Hitia'a | Lancement prevu (nouveau) |

---

## Status Commercial

**Statut actuel**: Proposition marketing envoyee
**Priorite**: CHAUD
**Valeur estimee**: 280 000 XPF/mois (formule Pro recommandee)

### Historique Interactions
| Date | Action | Resultat |
|------|--------|----------|
| 2026-01-28 | Dossier cree | - |
| 2026-01-28 | Email envoye (proposition automatisation 6 modules) | Reponse recue |
| 2026-01-29 | **Reponse Tevahitua** | Reorientation vers marketing/contenu |
| 2026-01-29 | Nouvelle proposition marketing creee | En attente envoi |

### Demande client (email 2026-01-29)
Tevahitua a repondu en reorientant vers du **contenu creatif** :
- Posts Facebook/Instagram automatiques
- Visuels produits (pneus, vehicules)
- Maquettes pneus (2-3/semaine)
- Visuels stylises mannequins + vehicules (1-2/mois)
- Quiz "Le saviez-vous ?" interactifs
- Gestion des 4 pages Facebook

---

## Assets Crees

| Type | Fichier | Description |
|------|---------|-------------|
| doc | prospection/proposition-commerciale.html | Proposition initiale 6 modules (obsolete) |
| doc | prospection/proposition-marketing.html | **NOUVELLE proposition marketing IA** |
| doc | prospection/email-prospection.md | Templates emails initiaux |
| doc | prospection/email-reponse-marketing.md | **Email de reponse a Tevahitua** |
| doc | prospection/script-appel.md | Script telephonique |
| doc | prospection/signature-email.html | Signature PACIFIK'AI |

---

## Proposition Marketing IA (ACTIVE)

### 3 Formules proposees
| Formule | Prix/mois | Contenu |
|---------|-----------|---------|
| **Starter** | 150 000 XPF | 16 posts + 16 visuels IA |
| **Pro** (recommande) | 280 000 XPF | 32 posts + quiz + stories |
| **Enterprise** | 450 000 XPF | 48 posts + mannequins IA + videos |

### Formule Pro - Detail
- 8 posts/semaine (2 par page)
- 32 visuels IA/mois (FAL.ai 2K)
- 4 quiz interactifs "Le saviez-vous ?"
- 8 stories Instagram
- Rapport performance mensuel

### Tech Stack prevu
- **Generation images**: FAL.ai Nano Banana Pro (2K)
- **Copywriting**: Claude Sonnet 4.5
- **Publication**: Facebook Graph API (multi-pages)
- **Planning**: Airtable (calendrier contenu)
- **Orchestration**: n8n workflow

---

## Infrastructure Technique (CREE)

### Dashboard Marketing
- **URL actuelle**: https://dashboard-omega-five-23.vercel.app
- **URL finale**: https://cowan.pacifikai.com (DNS en attente)
- **Code**: `PACIFIK'AI/COWAN MOTOR/dashboard/index.html`
- **Hebergement**: Vercel

### Configuration DNS requise
```
Type: A
Name: cowan
Value: 76.76.21.21
```
→ A configurer sur le registrar de pacifikai.com

### Tables Airtable (Base PACIFIK'AI)
| Table | ID | Usage |
|-------|-----|-------|
| COWAN_Products | tbliS8SLaMxJEhdYB | Catalogue produits |
| COWAN_Content_Calendar | tblaUuQjvjJDyGhYl | Calendrier editorial |
| COWAN_Pages_Config | tbl84V5wJiJnJ4tjh | Config 4 pages Facebook |
| COWAN_Editorial_Ideas | tblquworimj7crybV | Idees editoriales avant generation |
| COWAN_Avatars | tbl1akTQcdmvmNKpG | Bibliotheque avatars reutilisables |
| COWAN_Settings | tbltDLphSwTn6bzsI | Config frequence/mode auto par page |
| COWAN_Featured_Products | tblEbtNf2dlEQg142 | Produits vedettes par periode |

### Workflows n8n
| Workflow | ID | Webhook URL | Status |
|----------|-----|-------------|--------|
| COWAN - Upload Product | f5wTI2GUBNcfMMd7 | /webhook/cowan-upload-product | ACTIF |
| COWAN - Generate Content (FAL.ai) | x0tMR73y99fhkjH8 | /webhook/cowan-generate-content | ACTIF |
| COWAN - Schedule Post | JXWg4kVF1d7pR5mF | /webhook/cowan-schedule-post | ACTIF |
| COWAN - Auto Publish Facebook | K14XU2WdQrsHbk6s | Schedule (toutes les heures) | ACTIF |
| COWAN - Generate Editorial Ideas | 7opwWGpuf5i9H1Pd | Schedule (dimanche 8h) + Manual | ACTIF |
| COWAN - Generate Content from Idea | pDXQ9QNCqJx6sIVU | /webhook/cowan-accept-idea | ACTIF |
| COWAN - Avatar Generator | 9ec6fSpj5xTC3Rmn | /webhook/cowan-create-avatar | ACTIF |
| COWAN - Demo Generator | ro1NOU9af7c8uLMe | /webhook/cowan-demo | ACTIF |

**Workflow Auto Publish Facebook - Pipeline:**
```
Schedule Trigger (1h) OU Manual Trigger
  → Fetch Scheduled Posts (Airtable: Status=Planifie, Date <= NOW)
  → Has Posts? (If node)
    → Split Posts (loop)
    → Get Page Config (Airtable: Page_Name match)
    → Publish to Facebook (Graph API v24.0)
    → Update Status Published (Airtable: Status=Publie, Facebook_Post_ID)
```

**Workflow Generate Content - Pipeline:**
```
Webhook POST (type, page_name, product_id?)
  → Claude claude-sonnet-4-5-20250929: Genere post_text + image_prompt
  → Parse JSON response
  → FAL.ai Queue (POST nano-banana-pro)
  → Wait 10s
  → Poll Status (loop 5s si pas COMPLETED)
  → GET Result (image URL)
  → Save to Airtable (Content_Calendar)
  → Return JSON (success, content, image_url, airtable_id)
```

### Supabase Storage
- **Bucket**: `cowan-products` (public)
- **Base URL**: https://ogsimsfqwibcmotaeevb.supabase.co/storage/v1/object/public/cowan-products/

---

## Prochaines Actions

- [x] Creer nouvelle proposition marketing HTML
- [x] Rediger email de reponse a Tevahitua
- [x] Creer tables Airtable COWAN MOTOR
- [x] Creer workflow n8n Upload Product
- [x] Creer dashboard avec upload drag & drop
- [ ] **Envoyer email de reponse avec lien proposition**
- [ ] Relance J+3 si pas de reponse
- [ ] Appel telephonique J+5 si toujours rien
- [x] (Phase 3) Workflow generateur de contenu (Claude + FAL.ai)
- [x] (Phase 4) Calendrier editorial avec vue mensuelle
- [x] (Phase 5) Publication auto Facebook + stats
- [ ] (Phase 6) Deployer sur cowan.pacifikai.com (DNS en attente)
- [x] (Phase 7) Systeme editorial complet avec idees/avatars/settings
- [ ] **Activer les 3 nouveaux workflows n8n**

---

## Notes importantes

- Tevahitua a trouve la proposition initiale "interessante et tres complete" mais prefere le marketing
- 4 pages a gerer = scope important, justifie la formule Pro
- Station Pacific Hitia'a = nouvelle page (lancement prevu)
- Mannequins = 100% IA (FAL.ai), pas de shooting reel

---

---

## Systeme Editorial Avance (Phase 7)

### Fonctionnalites Dashboard
1. **Vue Idees** - Liste/Kanban/Calendrier avec filtres (page, statut, type)
2. **Vue Avatars** - Bibliotheque avec filtres (style, genre), creation IA
3. **Vue Settings** - Config par page (posts/semaine, mode auto, heure publication)
4. **Bulk Accept** - Selection multiple + generation en lot
5. **Mode Auto** - Toggle pour publication automatique sans validation

### Workflow Editorial (Dimanche 8h)
```
Schedule Trigger (Dimanche 8h) OU Manual
  → Fetch Settings (4 pages)
  → Fetch Products + Featured Products
  → Claude: Genere idees pour 14 jours
  → Parse JSON array
  → Create records COWAN_Editorial_Ideas
```

### Workflow Accept Idea
```
Webhook POST (idea_id)
  → Fetch Idea Details
  → Update Status "En Generation"
  → Claude: Genere texte + prompt image
  → FAL.ai: Genere visuel 2K
  → Create Content_Calendar entry
  → Update Idea Status "Generee"
  → Respond (content_id, image_url)
```

### Workflow Avatar Generator
```
Webhook POST (description, style, gender)
  → Claude: Genere avatar concept + prompt
  → FAL.ai: 4 images 9:16
  → Create COWAN_Avatars record
  → Respond (avatar_id, images)
```

### Selection Avatar/Produit par post
- **Avatar**: Auto (IA choisit) ou Manual (dropdown bibliotheque)
- **Produit**: Auto (priorite featured), Manual (selection), None
- **Featured Products**: Produits a mettre en avant par semaine/mois

---

*Derniere MAJ: 2026-01-30 00h*

---

## Mode Demo (DEMYSTIFIER)

### Bouton Dashboard
- Bouton violet/rose gradient "DEMYSTIFIER" dans le header Vue 360
- Animation pulse pour attirer l'attention
- Ouvre un modal plein ecran avec progression

### Workflow Demo Generator (ro1NOU9af7c8uLMe)
```
Webhook POST (page_name)
  → Claude Sonnet: Genere post_text + image_prompt
  → Code Node: Parse + placeholder image
  → Respond JSON (success, page_name, post_text, image_url)
```

### Images Placeholder (Unsplash)
| Page | Image |
|------|-------|
| Cowan Motor | Showroom voitures moderne |
| Tahiti Echappement | Mecanique/echappement |
| Punaauia Pneus | Pneus/service auto |
| Station Pacific Hitiaa | Station essence tropicale |

### Note
- FAL.ai API key expiree → mode placeholder temporaire
- Quand FAL.ai reactif: ajouter generation images reelles
