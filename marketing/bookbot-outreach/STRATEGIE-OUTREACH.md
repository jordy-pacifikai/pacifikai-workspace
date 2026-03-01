# Strategie Outreach Ve'a — V2

> **Derniere MAJ**: 2026-02-26

## Pipeline Actuel

### Phase 1 — Proposition Commerciale (FAIT)
- URL: https://pacifikai.com/vea
- Dark theme, sections animees, pricing 3 plans, demo live, privacy policy
- Deploy Vercel OK

### Phase 2 — Launch Kit Client (FAIT)
- 7 fichiers dans `solutions/bookflow/launch-kit/`
- Templates post FB (3 secteurs), QR code generator, signaletique, guide ads, checklist

### Phase 3 — App Facebook Messenger (EN COURS)
- App "PACIFIKAI Messaging" creee (ID: `854522137595486`)
- Privacy policy configuree
- App Review pour `pages_messaging` : A SOUMETTRE (2-5 jours d'approbation)

### Phase 4 — Prospection Email (PRET POUR VALIDATION)
- 31 prospects avec emails verifies (10 salons, 10 restos, 11 medical)
- Fichier: `prospects-bookbot.json`
- 31 emails personnalises: `CAMPAGNE-31-PROSPECTS.md`
- EN ATTENTE VALIDATION JORDY

---

## Donnees Prospects

- **31 prospects** avec email verifie
- **3 secteurs** : Salons/Beaute (10), Restaurants (10), Medical (11)
- **12 avec nom contact** : personnalisation avec prenom
- Source: Firecrawl research (annuaires PF, sites web, pages Facebook)

## Regles d'Envoi (REGLE PROSPECTION)

1. **JAMAIS envoyer sans validation explicite de Jordy**
2. Objet: "PROPOSITION COMMERCIALE — [benefice] pour [NOM_BUSINESS]"
3. Ton: professionnel, direct, zero clickbait
4. Inclure: lien proposition Vercel + lien demo live
5. Sender: Jordy Toofe — PACIFIK'AI <jordy@pacifikai.com>
6. Via Brevo (API key active: jordytoofa@gmail.com)
7. Horaires: mardi-jeudi, 9h-11h Tahiti (medical: 8h30-10h)

## Relance Semi-Auto

| Delai | Action | Template |
|-------|--------|----------|
| J+0 | Email initial | CAMPAGNE-31-PROSPECTS.md |
| J+3 | Relance courte | "Suite a mon email de [jour], avez-vous eu le temps..." |
| J+7 | Relance valeur | Partager un chiffre ROI specifique au secteur |
| J+14 | Dernier contact | "Je ne vous relancerai plus, mais si..." |

Chaque relance = validation Jordy avant envoi.

## Process Envoi Brevo

```
1. Jordy valide les 31 emails (CAMPAGNE-31-PROSPECTS.md)
2. Creer campagne transactionnelle Brevo (tag: vea-outreach-{secteur})
3. Envoyer par batch de 10 (salons → restos → medical)
4. Tracker opens + clicks
5. CRM/ClickUp MAJ auto (status: Contacted, date_contact)
6. Relance J+3/J+7 si pas d'ouverture
```

## WhatsApp Outreach (complementaire)

Pour les 20 prospects qui ont aussi un telephone :
- Message WhatsApp court apres l'email (J+1 ou J+2)
- Jordy envoie manuellement (plus naturel, meilleur taux de reponse)
- Templates: voir section "Messages WhatsApp" dans l'ancien fichier
