# PACIFIK'AI - Contexte Partagé

> **Usage**: Ce fichier est lu par Claude Code ET le chatbot du dashboard.
> Toute modification ici met à jour les deux systèmes automatiquement.

---

## Identité Entreprise

**Nom**: PACIFIK'AI
**Type**: Agence automatisation IA & consulting
**Fondateur**: Jordy Banks
**Localisation**: Polynésie française (fuseau Tahiti UTC-10)
**Email**: jordy@pacifikai.com
**Site**: https://pacifikai.com
**Facebook**: https://facebook.com/pacifikai

---

## Positionnement

**Mission**: Automatiser les tâches répétitives des entreprises polynésiennes avec l'IA
**Cible**: PME Polynésie française (B2B haute valeur)
**Objectif**: "100K Project" - Atteindre 100K XPF de revenus mensuels récurrents

**Services proposés**:
1. **Chatbots IA** - Assistants virtuels 24/7 pour service client
2. **Automatisation n8n** - Workflows automatisés (newsletters, posts sociaux, rapports)
3. **RAG/Embeddings** - Base de connaissances intelligente
4. **Dashboards Analytics** - Tableaux de bord temps réel
5. **Génération contenu IA** - Articles SEO, newsletters, posts sociaux

---

## Stack Technique

### Infrastructure
- **n8n**: https://n8n.srv1140766.hstgr.cloud (self-hosted Hostinger)
- **Supabase**: ogsimsfqwibcmotaeevb.supabase.co (PostgreSQL + Vector Store)
- **Airtable**: Base PACIFIK'AI (appF7pltUaQkOlKM5)

### Tables Airtable
| Table ID | Nom | Usage |
|----------|-----|-------|
| tbluw05otXoESeQkz | CRM | Prospects et clients |
| tblOqUUWT2ExGfjGw | Tasks | Tâches opérationnelles |
| - | Roadmap | Milestones business |
| - | Content Calendar | Posts Facebook |

### Credentials n8n
| Service | Credential ID |
|---------|---------------|
| Supabase | ZXsTUa2CdHjOfidM |
| Google Gemini | xERpPocwVwoOc0v1 |
| Anthropic | RZBAWo1xbQsFLpUH |
| Anthropic (2) | tD0vpSdF6v2vHqFp |

---

## Prospects Prioritaires

### Tier 1 - HOT (3M+ XPF)
| Entreprise | Secteur | Status | Contact |
|------------|---------|--------|---------|
| Air Tahiti Nui | Transport aérien international | Demo prête | Torea Colas |
| Air Tahiti | Transport aérien inter-îles | Contacté | - |
| Four Seasons Bora Bora | Hôtellerie luxe | Lead | Romain Chanet |
| Conrad Bora Bora Nui | Hôtellerie luxe | Lead | Roger Godin |
| St Regis Bora Bora | Hôtellerie luxe | Lead | Emmanuel Richardet |

### Tier 2 - CHAUD
- InterContinental Tahiti
- Aranui (croisières Marquises)
- Tahiti Tourisme
- OPT (télécom)
- Banque de Polynésie

### Assets créés par prospect
- **Air Tahiti Nui**: Dashboard 15 builds, landing page, demo hub, blog, visualiseur n8n
- **Air Tahiti**: Dashboard, landing page, demo hub, visualiseur n8n
- **Aranui**: Demo hub, blog, visualiseur n8n
- **COWAN MOTOR**: Proposition commerciale, email prospection, script appel

---

## Workflows n8n Actifs

### Pour PACIFIK'AI (business)
| Workflow ID | Nom | Fonction |
|-------------|-----|----------|
| hZotr6emniXBXMO4 | Publication Facebook IA | Posts automatiques Lun/Mer/Ven 8h |
| Y49udNuyGyUtlzub | Dashboard API Hub (Build 11) | API centrale dashboard |
| 27fFsoBVYDSwjg0Y | Content Scheduler (Build 12) | Planification éditoriale |
| j0NhhYp9Di9R2VpN | AI Assistant (Build 13) | Chatbot dashboard |
| Iq9VrM2K7UgG2f0o | Report Generator (Build 14) | Rapports automatiques |
| SqQoJF18mKWRJpDC | Smart Generator (Build 15) | Génération contenu |

### Pour démos clients (ATN)
| Build | Nom | Fonction |
|-------|-----|----------|
| 1 | Concierge IA 24/7 | Chatbot multilingue |
| 2 | Newsletter Generator | Emails personnalisés |
| 3 | SEO Content Factory | Articles optimisés |
| 4 | ROI Analyst | Analyse performance |
| 5 | Booking Assistant | Aide réservation |
| 6 | Social Monitor | Veille réseaux sociaux |
| 7 | Competitor Intel | Veille concurrentielle |
| 8 | Flight Notifier | Alertes vols |
| 9 | Review Responder | Réponses avis |
| 10 | Upsell Engine | Propositions upgrade |

---

## Stratégie Commerciale

### Plan 4 semaines (100K Project)
**Semaine 1**: Créer offre Audit IA Gratuit + 3 cas d'étude + optimiser LinkedIn/Facebook
**Semaine 2**: Contacter CCISM + lister 20 restaurants + envoyer 20 messages WhatsApp
**Semaine 3**: Organiser petit-déjeuner networking "Café IA & Automatisation"
**Semaine 4**: Follow-up + 5-8 audits + closer 2-3 clients

### Partenariats visés
- CCISM (Chambre de Commerce)
- Cabinets comptables (commission 15%)
- Agences immobilières

---

## Règles Business

1. **Pricing**: Toujours proposer 3 packages (Basic/Pro/Enterprise)
2. **Démo**: Créer prototype fonctionnel AVANT le RDV
3. **Follow-up**: Relance J+3, J+5, J+7 après proposition
4. **Airtable**: TOUJOURS mettre à jour le CRM après chaque interaction
5. **Assets**: Chaque prospect a un dossier dédié avec tous les fichiers

---

## Mémoire Sessions Récentes

### 2026-01-28
- Dashboard PACIFIK'AI amélioré (notifications, timeline, search Cmd+K, funnel, focus mode)
- Fix ouverture fichiers (URL encoding)
- Fix clic prospects (ondblclick → onclick)
- Tous les 15 builds ATN sont actifs

### 2026-01-27
- Landing page PACIFIK'AI live sur Vercel
- Fix sender Brevo pour newsletter@pacifikai.com
- Triggers réalistes dans n8n-visualizer

---

## Instructions Chatbot

Quand l'utilisateur pose une question:
1. **Contexte**: Tu es l'assistant IA de PACIFIK'AI, une agence d'automatisation IA en Polynésie
2. **Ton**: Tutoiement, direct, professionnel mais amical
3. **Données**: Tu as accès aux prospects, tâches, et statistiques du CRM
4. **Actions**: Tu peux modifier les statuts, ajouter des notes, créer des rappels
5. **Limites**: Tu ne peux pas supprimer de données (sécurité)

### Commandes supportées
- Stats/pipeline/combien → Statistiques générales
- Prospects hot/chaud/tiède/froid → Filtrer par température
- Cherche [nom] → Trouver un prospect
- Rappels/relances → Voir les follow-ups
- Passe [nom] en [status] → Changer le statut
- Note pour [nom]: [texte] → Ajouter une note
- Rappel [nom] dans X jours → Créer un rappel

---

*Dernière MAJ: 2026-01-28*
