# Build 4 : Analyste ROI IA

> **Workflow ID**: À créer (duplicata de `J9xK3rAR2T6jjjQ7`)
> **Dernière MAJ**: 2026-01-26
> **Status**: En préparation

---

## Problème Résolu

**Douleur Air Tahiti**:
- Détection des anomalies de ventes en 24-48h (trop tard)
- Reporting Excel manuel chronophage
- Pas de vision temps réel sur les 48 destinations
- Concurrence Air Moana nécessite réactivité accrue
- Besoin d'optimiser les routes DSP (subventionnées)

**Solution**: Détection d'anomalies et recommandations stratégiques en temps réel sur les destinations et routes clés.

---

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ANALYSTE ROI IA                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [Webhook Trigger] ─── Données ventes par destination              │
│         │                                                            │
│         ▼                                                            │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Code Node - Analyse Statistique                            │   │
│   │                                                              │   │
│   │  - Calcul Z-Score par destination                           │   │
│   │  - Comparaison historique (4 mois)                          │   │
│   │  - Détection anomalies (> 2 écarts-types)                   │   │
│   │  - Identification tendances                                  │   │
│   └────────────────────────┬────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Claude Sonnet - Analyst                                     │   │
│   │                                                              │   │
│   │  MISSION:                                                    │   │
│   │  1. Interpréter les anomalies détectées                     │   │
│   │  2. Identifier les causes probables                          │   │
│   │  3. Formuler recommandations actionnables                    │   │
│   │  4. Prioriser les alertes (Critical/Warning/Info)           │   │
│   │  5. Suggérer actions correctives                            │   │
│   │                                                              │   │
│   │  CONTEXTE:                                                   │   │
│   │  - Air Tahiti = 48 destinations inter-îles                  │   │
│   │  - Concurrence Air Moana sur routes principales             │   │
│   │  - DSP pour îles éloignées                                  │   │
│   │  - Lancement Signature (premium) 2026                       │   │
│   └────────────────────────┬────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Log to Airtable - ROI_Alerts                               │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Destinations Surveillées

### Routes Principales (concurrence Air Moana)

| Route | Fréquence | Enjeu |
|-------|-----------|-------|
| Papeete - Bora Bora | 10+ vols/jour | Tourisme premium |
| Papeete - Moorea | 15+ vols/jour | Navette la plus fréquente |
| Papeete - Rangiroa | 4-6 vols/jour | Plongée internationale |
| Papeete - Raiatea | 4-5 vols/jour | Hub Îles Sous-le-Vent |
| Papeete - Huahine | 4-5 vols/jour | Tourisme authentique |

### Routes DSP (subventionnées)

| Route | Fréquence | Enjeu |
|-------|-----------|-------|
| Papeete - Nuku Hiva | 3-4 vols/sem | Marquises - essentiel |
| Papeete - Hiva Oa | 3-4 vols/sem | Marquises - tourisme |
| Papeete - Tubuai | 2-3 vols/sem | Australes |
| Papeete - Rurutu | 2-3 vols/sem | Baleines saisonnières |
| Papeete - Mangareva | 1-2 vols/sem | Gambier - le plus éloigné |

### Routes Premium (Signature 2026)

| Route | Enjeu |
|-------|-------|
| Papeete - Bora Bora (Signature) | Clientèle luxe resorts |
| Papeete - Raiatea/Taha'a (Signature) | Île vanille premium |

---

## Types d'Anomalies Détectées

### 1. Anomalies de Volume

```
🚨 ALERTE CRITIQUE - Bora Bora
Baisse de 25% des réservations vs mois précédent
Z-Score: -2.8 (anormal)

CAUSES PROBABLES:
- Nouvelle promotion Air Moana ?
- Fermeture resort partenaire ?
- Conditions météo défavorables ?

RECOMMANDATIONS:
1. Vérifier offres concurrence Air Moana
2. Contacter partenaires hôteliers
3. Activer promo flash "Last Minute Bora"
```

### 2. Anomalies de Revenus

```
⚠️ WARNING - Rangiroa
Taux de remplissage OK mais revenu/passager -15%
Z-Score: -2.1

CAUSES PROBABLES:
- Guerre des prix plongée ?
- Mix passagers (plus de résidents, moins de touristes ?)

RECOMMANDATIONS:
1. Analyser segmentation passagers
2. Vérifier tarifs Pass Tuamotu
3. Campagne ciblée plongeurs internationaux
```

### 3. Opportunités Détectées

```
✅ OPPORTUNITÉ - Rurutu
Hausse de 40% des demandes (saison baleines)
Z-Score: +2.5

RECOMMANDATIONS:
1. Ajouter fréquence temporaire
2. Lancer campagne "Baleines 2026"
3. Partenariat centres observation
```

---

## Métriques Analysées

### Par Destination

| Métrique | Description |
|----------|-------------|
| Passagers | Nombre de passagers transportés |
| Revenus | Chiffre d'affaires en XPF |
| Taux de remplissage | % de sièges vendus |
| Revenu/passager | Yield moyen |
| Réservations J-7 | Prévisions court terme |
| Annulations | Taux d'annulation |

### Par Segment

| Segment | Métriques spécifiques |
|---------|----------------------|
| Touristes | Pass vendus, destinations combinées |
| Résidents | Fréquence voyages, fidélité |
| Plongeurs | Routes Tuamotu, franchise bagage |
| Premium | Candidats Signature |

---

## Format de Sortie

### Alerte Slack/Email

```
📊 RAPPORT QUOTIDIEN AIR TAHITI - 26/01/2026

🚨 ALERTES CRITIQUES (1)
━━━━━━━━━━━━━━━━━━━━━━━━
• Bora Bora: -25% réservations (Z=-2.8)
  → Action: Vérifier promo Air Moana

⚠️ WARNINGS (2)
━━━━━━━━━━━━━━━━━━━━━━━━
• Rangiroa: Yield -15% (Z=-2.1)
• Moorea: Taux annulation +8%

✅ OPPORTUNITÉS (1)
━━━━━━━━━━━━━━━━━━━━━━━━
• Rurutu: Demande +40% (baleines)
  → Ajouter fréquence ?

📈 TOP 3 DESTINATIONS
━━━━━━━━━━━━━━━━━━━━━━━━
1. Moorea: 98% remplissage
2. Bora Bora: 92% remplissage
3. Raiatea: 87% remplissage

⏱️ Prochaine analyse: 27/01/2026 08:00
```

---

## Intégration Airtable

### Table ROI_Alerts

| Champ | Type | Description |
|-------|------|-------------|
| ID | Auto | Identifiant unique |
| Date | DateTime | Date de l'alerte |
| Destination | Text | Île concernée |
| Type | Select | Critical, Warning, Opportunity, Info |
| Metric | Text | Métrique concernée |
| Value | Number | Valeur actuelle |
| Z_Score | Number | Score d'anomalie |
| Analysis | Long text | Analyse Claude |
| Recommendations | Long text | Actions suggérées |
| Status | Select | Nouveau, En cours, Résolu |

---

## Valeur Ajoutée

### Pour Air Tahiti

| Métrique | Avant | Après |
|----------|-------|-------|
| Détection anomalie | 24-48h | Temps réel |
| Temps reporting | 5h/semaine | 0h (auto) |
| Couverture | Routes principales | 48 destinations |
| Réactivité concurrence | Lente | Immédiate |

### ROI Estimé

- **Opportunités capturées** : +5-10% revenus par réactivité
- **Pertes évitées** : Alertes précoces sur baisses
- **Gain temps** : 5h/semaine × 50 semaines = 250h/an
- **Optimisation DSP** : Meilleure allocation ressources

---

## Checklist Démo

- [ ] Dupliquer workflow ATN vers AT
- [ ] Créer table ROI_Alerts dans Airtable
- [ ] Adapter les destinations (48 îles)
- [ ] Configurer seuils Z-Score
- [ ] Ajouter contexte Air Moana dans prompt
- [ ] Ajouter routes Signature
- [ ] Tester avec données simulées
- [ ] Configurer alertes Slack

---

*Document généré par PACIFIK'AI - 2026-01-26*
