# Build 2 : Hyper-Personnalisation Newsletter

> **Workflow ID**: À créer (duplicata de `wLWXgfjyJ6OZXmmP`)
> **Dernière MAJ**: 2026-01-26
> **Status**: En préparation

---

## Problème Résolu

**Douleur Air Tahiti**: Les newsletters génériques ont un faible taux d'engagement. Avec 48 destinations et des segments très différents (touristes plongeurs, lunes de miel, familles, résidents), une approche one-size-fits-all ne fonctionne pas.

**Solution**: Un système d'emails automatisés qui adapte le contenu selon les préférences de chaque voyageur et leur segment.

---

## Segments Air Tahiti

| Segment | Caractéristiques | Destinations prioritaires |
|---------|------------------|---------------------------|
| **Plongeurs** | Passionnés de plongée sous-marine | Rangiroa, Fakarava, Tikehau, Moorea |
| **Lune de miel** | Couples, jeunes mariés | Bora Bora, Taha'a, Moorea |
| **Famille** | Parents avec enfants | Moorea, Huahine, Rangiroa |
| **Résidents** | Polynésiens (déplacements fréquents) | Toutes îles, focus pratique |
| **Aventure** | Randonneurs, explorateurs | Marquises, Australes |
| **Luxe** | Clientèle premium (pour Signature) | Bora Bora, Raiatea-Taha'a |
| **General** | Segment par défaut | Mix des destinations |

---

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HYPER-PERSONNALISATION NEWSLETTER                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [Webhook Trigger] ──────────────────────────────────────────┐     │
│         │                                                      │     │
│         ▼                                                      │     │
│   ┌─────────────────┐                                          │     │
│   │ Segment Router  │ ←── Analyse du segment client            │     │
│   └────────┬────────┘                                          │     │
│            │                                                    │     │
│   ┌────────┴────────────────────────────────────┐              │     │
│   ▼           ▼           ▼           ▼         ▼              │     │
│ Plongeur  Lune miel   Famille    Résident   Aventure          │     │
│   │           │           │           │         │              │     │
│   └───────────┴───────────┴───────────┴─────────┘              │     │
│                           │                                     │     │
│                           ▼                                     │     │
│   ┌─────────────────────────────────────────────────────────┐  │     │
│   │  Claude Sonnet - Génération contenu personnalisé        │  │     │
│   │  - Ton adapté au segment                                │  │     │
│   │  - Destinations recommandées                            │  │     │
│   │  - Offres spécifiques (Air Pass, promo)                 │  │     │
│   └────────────────────────┬────────────────────────────────┘  │     │
│                            │                                    │     │
│                            ▼                                    │     │
│   ┌─────────────────────────────────────────────────────────┐  │     │
│   │  Log to Airtable - Newsletter_Logs                      │  │     │
│   └─────────────────────────────────────────────────────────┘  │     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Personnalisation par Segment

### Plongeurs

**Ton**: Technique et passionné
**Destinations mises en avant**:
- Rangiroa (passe de Tiputa, dauphins, requins)
- Fakarava (mur de requins, UNESCO)
- Tikehau (raies manta, jardin de corail)

**Contenu type**:
```
Ia ora na [Prénom],

Les requins marteaux sont de retour à Rangiroa !
De décembre à mars, c'est LA période pour observer ces géants
dans la passe de Tiputa.

🤿 Rappel : Votre équipement de plongée voyage GRATUITEMENT
avec Air Tahiti (5kg supplémentaires sur les îles plongée).

Pass Bora Bora + Tuamotu : Combinez Bora Bora et Rangiroa
en un seul voyage.

Māuruuru,
Air Tahiti
```

### Lune de Miel

**Ton**: Romantique et premium
**Destinations mises en avant**:
- Bora Bora (bungalows sur pilotis)
- Taha'a (île vanille, intimité)
- Moorea (montagne et lagon)

**Contenu type**:
```
Ia ora na [Prénom],

Félicitations pour votre mariage ! 🌺

Imaginez : Un dîner aux chandelles sur votre terrasse privée,
les pieds dans l'eau turquoise de Bora Bora...

Avec Air Tahiti, rejoignez Bora Bora en seulement 50 minutes
depuis Papeete. Plus de 10 vols par jour pour s'adapter
à votre planning.

Nouveau 2026 : Air Tahiti Signature, notre service tout
Business Class vers Bora Bora et Taha'a.

Nana,
Air Tahiti
```

### Résidents

**Ton**: Pratique et informatif
**Focus**:
- Tarifs résident
- Fréquences de vols
- Informations pratiques
- Actualités compagnie

**Contenu type**:
```
Ia ora na [Prénom],

📢 Nouvelles fréquences Papeete-Raiatea dès le 1er février !
3 vols supplémentaires par semaine pour faciliter vos déplacements.

N'oubliez pas votre carte de résident pour bénéficier
de votre tarif préférentiel.

⚠️ Travaux aéroport Huahine : prévoir 10 min supplémentaires
pour l'enregistrement.

Māuruuru roa,
Air Tahiti
```

---

## Métriques de Personnalisation

### Score calculé

```javascript
// Calcul du score de personnalisation
const score = {
  segmentMatch: 30,      // Bon segment identifié
  destinationRelevance: 25,  // Destinations pertinentes
  tonAdaptation: 20,     // Ton adapté
  offerRelevance: 15,    // Offres ciblées
  timing: 10             // Bon moment d'envoi
};
// Total: 100 points
```

### KPIs attendus

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Taux d'ouverture | 15-20% | 35-45% | +100% |
| Taux de clic | 2-3% | 6-8% | +150% |
| Conversion vers réservation | 0.5% | 1.5% | +200% |
| Désabonnements | 2% | 0.5% | -75% |

---

## Intégration Airtable

### Table Newsletter_Logs

| Champ | Type | Description |
|-------|------|-------------|
| ID | Auto | Identifiant unique |
| Date | DateTime | Date d'envoi |
| Email | Text | Adresse email |
| Segment | Select | Plongeur, Lune de miel, etc. |
| Score_Personnalisation | Number | Score 0-100 |
| Score_Engagement | Number | Score prédit 0-100 |
| Destinations_Suggérées | Text | Liste des îles |
| Contenu_Email | Long text | Email généré |

---

## Configuration Requise

### Credentials n8n

| Credential | Usage |
|------------|-------|
| Anthropic API | Claude Sonnet (génération) |
| Airtable API | Logging et contacts |
| Brevo/Mailchimp | Envoi emails (optionnel) |

### Base Airtable (à créer)

- **Base**: `Air Tahiti`
- **Tables**:
  - Contacts (email, segment, préférences)
  - Newsletter_Logs (historique envois)
  - Dashboard (KPIs)

---

## Checklist Démo

- [ ] Créer base Airtable Air Tahiti
- [ ] Créer tables Contacts et Newsletter_Logs
- [ ] Dupliquer workflow ATN vers AT
- [ ] Adapter les prompts par segment
- [ ] Configurer les destinations par segment
- [ ] Tester avec les 7 segments
- [ ] Vérifier le scoring

---

*Document généré par PACIFIK'AI - 2026-01-26*
