# Mémoire Projet - Aranui

> **Instructions Claude**: Lire ce fichier au début de chaque session sur ce projet.

---

## Infos Clés

- **Client**: Aranui (croisières Marquises)
- **Navire**: Aranui 5 (254 passagers + cargo)
- **USP**: Seul accès maritime régulier aux Marquises
- **Prix croisière**: ~5000-8000€ (14 jours)
- **Capacité**: ~2000 passagers/an

---

## Infrastructure Technique

### Airtable
- **Base ID**: app1OMmNVwHfqyYbs
- **Tables créées**:
  - Contacts (tblrxH1V3xykj0hHK)
  - Newsletter_Logs (tblDTm4RVZqpEcPyb)
  - Concierge_Logs (tblAJluparXk2jC3t)
  - SEO_Content (tblCYZMVlXkco8jxo)
  - ROI_Alerts (tbl7PF8pb8vxqwamH)
  - Croisieres (tblKEnUpwgb8OPV3Y) - 4 croisières démo
  - Dashboard (tblluZdScU9lHpcbf) - 8 métriques démo

### Supabase
- **Table**: aranui_documents
- **Embeddings**: 15 documents (FR/EN/DE)
- **Vector Index**: ivfflat (cosine)

### n8n Workflows
| Build | Workflow ID | Nom | Status | Webhook | Test |
|-------|-------------|-----|--------|---------|------|
| 1 | WGEx76Qw21YQx8Ji | Concierge Marquises | ACTIF (Airtable désactivé) | aranui-concierge | OK |
| 2 | ZRFzQr7ftUJWzKnS | Newsletter Personnalisée | ACTIF (Airtable désactivé) | aranui-newsletter | OK |
| 3 | 48xprTyVymhjZnOS | Content Factory SEO/GEO | ACTIF (Airtable désactivé) | aranui-seo-content | OK |
| 4 | TyZv2HuojTaTbKzX | ROI Analyst | ACTIF (Airtable désactivé) | aranui-roi-analyst | OK |

**Webhooks Base URL**: https://n8n.srv1140766.hstgr.cloud/webhook/

**Note**: Les nodes Airtable sont désactivés car les tables n'ont pas les bonnes colonnes. Le logging peut être réactivé après création des colonnes correctes.

---

## Segments Cibles

1. **Aventuriers solo** - 25-45 ans, backpackers premium
2. **Couples retraités** - 55+, haut pouvoir d'achat
3. **Groupes** - Clubs, associations, voyages organisés
4. **Photographes/artistes** - Attirés par les Marquises

---

## Fichiers Demo-Site

| Fichier | Description |
|---------|-------------|
| demo-hub.html | Hub central navigation |
| index.html | Landing + Chatbot (simulation JS) |
| builds-presentation.html | Présentation 4 builds |
| dashboard.html | KPIs + boutons workflows |
| blog.html | Articles SEO exemple |
| pricing-strategy.html | Tarifs + ROI |
| n8n-visualizer.html | Visualisation workflows |
| delivery-architecture.html | Architecture technique |
| video-script.html | Script vidéo prospection |

---

## Décisions Prises

| Date | Décision | Contexte |
|------|----------|----------|
| 2026-01-26 | Infrastructure complète | Airtable + Supabase + n8n créés |
| 2026-01-26 | Création dossier prospect | Nouveau prospect PACIFIK'AI |

---

## Sessions de Travail

### 2026-01-26 (Session 5)
- Correction Build 1 Concierge:
  - Remplacement chatTrigger par webhook standard
  - Configuration credentials Anthropic + modèle Claude Sonnet 4
  - Correction expressions ($json.body.message, $json.body.sessionId)
  - Mise à jour typeVersion 1.2 → 1.3
- Intégration HTML ↔ n8n:
  - index.html connecté au webhook aranui-concierge (chatbot fonctionnel)
  - dashboard.html connecté aux 4 webhooks
- **Tous les 4 builds sont maintenant testés et fonctionnels**

### 2026-01-26 (Session 4)
- Debug et correction des workflows Build 2, 3, 4
- Désactivation des nodes Airtable (colonnes incompatibles)
- Tests réussis:
  - Build 2: Email personnalisé généré (score 70, 153 mots)
  - Build 3: Article SEO 1446 mots + image FAL générée
  - Build 4: Rapport ROI complet avec 3 alertes, prévisions, recommandations

### 2026-01-26 (Session 3)
- Correction workflows Build 2, 3, 4 (pattern chainLlm copié d'ATN)
- Activation des 4 workflows via interface n8n
- Tous les workflows sont maintenant ACTIFS et fonctionnels

### 2026-01-26 (Session 2)
- Création base Airtable complète (7 tables)
- Insertion 15 documents Supabase pour RAG
- Création 4 workflows n8n
- Ajout données démo (4 croisières, 8 métriques)

### 2026-01-26 (Session 1)
- Création des 9 fichiers demo-site
- Nouvelle approche commerciale: "Expert automatisation marketing"

---

## À Faire

- [x] Activer les 4 workflows n8n manuellement
- [x] Connecter chatbot HTML au vrai workflow n8n
- [x] Mettre à jour les fichiers demo-site avec les vrais webhooks
- [ ] Générer embeddings vectors pour les 15 documents Supabase
- [ ] Identifier contacts (direction commerciale Aranui)
- [ ] Tester le demo-site complet dans un navigateur

---

**Dernière MAJ**: 2026-01-26
