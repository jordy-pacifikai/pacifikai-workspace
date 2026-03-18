# Protocole Client — Site Web PACIFIK'AI

> Framework de gestion des prospects/clients pour la campagne Site Web Pro.
> Chaque prospect suit ce pipeline. Les actions sont declenchees par le statut.
> Derniere MAJ : Mars 2026

---

## Pipeline — 10 Statuts

```
LEAD → QUALIFIED → PROTOTYPED → PROPOSAL_SENT → DEPOSIT_PAID → IN_PRODUCTION → REVIEW → DELIVERED → BALANCE_PAID → COMPLETED
```

---

## 1. LEAD
> Premier contact, pas encore qualifie.

**Declencheur** : prospect envoie un message (Messenger, email, commentaire Facebook)

**Actions** :
- [ ] Repondre sous 2h max (MANA auto ou manuellement)
- [ ] Enregistrer dans `messenger_prospects` (auto via MANA)
- [ ] Identifier le canal de contact (Messenger, email, tel)

**Questions a poser** :
- C'est pour quel type d'activite/entreprise ?
- Tu as deja un site ou c'est une creation ?
- C'est pour quand ?

**Passer a QUALIFIED quand** : on connait l'activite, le besoin, et le canal de contact.

**Relance** : si pas de reponse sous 24h → relancer 1x. Si toujours rien sous 72h → archiver.

---

## 2. QUALIFIED
> On comprend le besoin, on peut builder les prototypes.

**Declencheur** : on a les infos de base (activite, type de site, urgence)

**Actions** :
- [ ] Analyser le prospect (LinkedIn, site existant, secteur)
- [ ] Determiner le scope : site vitrine 100K ou projet custom (reservation, e-commerce, etc.)
- [ ] Builder 3 prototypes avec images IA (Nano Banana 2)
- [ ] Deployer sur Vercel

**Infos requises avant de passer a PROTOTYPED** :
- Activite clairement identifiee
- Type de site (vitrine, reservation, e-commerce)
- Au moins 1 canal de contact fiable (email ou Messenger)

**Passer a PROTOTYPED quand** : 3 prototypes deployes et prets a montrer.

---

## 3. PROTOTYPED
> Les maquettes sont pretes, on les envoie au prospect.

**Declencheur** : prototypes deployes sur Vercel

**Actions** :
- [ ] Envoyer les 3 liens avec description de chaque style
- [ ] Envoyer sur TOUS les canaux disponibles (email + Messenger si on a les deux)
- [ ] Inclure le pricing dans le message
- [ ] Poser les questions de personnalisation (logo, photos, contenu, deadline)

**Message type** :
```
Voici 3 propositions de site :
1. [Nom] — [description] → [lien]
2. [Nom] — [description] → [lien]
3. [Nom] — [description] → [lien]

Offre Site Web Pro a 100 000 F : [details]
Acompte 50 000 F pour demarrer, solde a la livraison.

Questions : logo ? photos ? deadline ?
```

**Passer a PROPOSAL_SENT quand** : message envoye avec pricing + liens.

**Relance** : J+2 si pas de reponse → "Avez-vous pu regarder les maquettes ?"

---

## 4. PROPOSAL_SENT
> Le prospect a recu les maquettes et le prix. On attend son choix.

**Declencheur** : message avec prototypes + pricing envoye

**Actions** :
- [ ] Attendre le retour (choix du style, questions, objections)
- [ ] Si objection prix → framework LAER (Listen, Acknowledge, Explore, Respond)
- [ ] Si "trop cher" → proposer un scope reduit ou echelonnement
- [ ] Si "je reflechis" → isoler le blocage ("C'est le budget, le timing, ou le style ?")

**Gestion des objections** :
| Objection | Reponse |
|-----------|---------|
| "C'est trop cher" | "Le prix depend du scope. On peut adapter : un site 3 pages a 80K ou le pack complet 5 pages a 100K." |
| "Je reflechis" | "Pas de souci. C'est le budget, le timing ou le style qui necessite reflexion ?" |
| "Mon associe doit voir" | "Je peux preparer un recap pour lui. Quand pourrait-il regarder ?" |
| "Je compare" | "Normal. Ce qui nous differencie : livraison 7 jours, design premium, support 3 mois inclus." |

**Passer a DEPOSIT_PAID quand** : prospect confirme son choix + paie l'acompte.

**Relances** :
- J+2 : relance douce ("Avez-vous pu regarder ?")
- J+5 : relance avec valeur ajoutee ("On a ajoute une feature X")
- J+10 : derniere relance ("L'offre est valable encore quelques jours")
- J+15 : archiver si aucune reponse

---

## 5. DEPOSIT_PAID
> Acompte recu. On demarre la personnalisation.

**Declencheur** : acompte 50% recu (virement, especes, ou Stripe)

**Actions** :
- [ ] Confirmer la reception de l'acompte par email
- [ ] Collecter les contenus manquants (logo, photos, textes, couleurs)
- [ ] Si pas de logo → proposer creation logo (+30K XPF)
- [ ] Si pas de photos → proposer shooting (+50K XPF) ou generer par IA
- [ ] Planifier la livraison (J+7 a partir de reception de TOUS les contenus)

**Contenus a collecter** :
- [ ] Logo (fichier HD, SVG si possible)
- [ ] Photos (min 10, HD, du business/produits/equipe)
- [ ] Textes (presentation, services, a propos — ou on redige pour eux)
- [ ] Coordonnees exactes (adresse, tel, email, reseaux sociaux)
- [ ] Nom de domaine souhaite (.com ou .pf)
- [ ] Tarifs/prix si applicable

**Passer a IN_PRODUCTION quand** : tous les contenus recus.

**Relance** : si contenus pas recus sous 48h → relancer. Expliquer que le delai de livraison commence a reception des contenus.

---

## 6. IN_PRODUCTION
> On build le site final avec les vrais contenus.

**Declencheur** : tous les contenus recus

**Actions** :
- [ ] Personnaliser le prototype choisi avec les vrais contenus
- [ ] Integrer le logo, les photos, les textes
- [ ] Configurer le nom de domaine
- [ ] Deployer en preview (pas en prod)
- [ ] Tester mobile + desktop + formulaires
- [ ] SEO : meta tags, Open Graph, sitemap

**Delai** : 5-7 jours ouvrables

**Communication** : envoyer un message J+3 ("Ca avance bien, voici un apercu")

**Passer a REVIEW quand** : site pret en preview, envoye au client pour validation.

---

## 7. REVIEW
> Le client valide le site. 1 revision incluse.

**Declencheur** : lien preview envoye au client

**Actions** :
- [ ] Envoyer le lien preview + demander validation
- [ ] Lister ce qui est inclus dans la revision (textes, couleurs, images — PAS refonte du layout)
- [ ] Appliquer les modifications demandees (1 tour de revision inclus)
- [ ] Si modifications supplementaires → facturer (+15K XPF par revision)

**Message type** :
```
Voici votre site en preview : [lien]
Verifiez le sur ordinateur et telephone.
Une revision est incluse : textes, photos, couleurs.
Dites-moi vos retours et on finalise !
```

**Passer a DELIVERED quand** : client valide ("c'est bon" / "ok pour moi").

**Relance** : J+3 si pas de retour → "Avez-vous pu valider le site ?"

---

## 8. DELIVERED
> Site en production, domaine configure. On demande le solde.

**Declencheur** : client valide → mise en production

**Actions** :
- [ ] Deployer en production sur le vrai domaine
- [ ] Configurer DNS
- [ ] Tester tout une derniere fois
- [ ] Envoyer la facture pour le solde (50 000 F)
- [ ] Envoyer un guide "comment utiliser votre site" (optionnel)

**Message type** :
```
Votre site est en ligne : [URL]
Tout fonctionne. Voici la facture pour le solde de 50 000 F.
Le support de 3 mois demarre aujourd'hui.
```

**Passer a BALANCE_PAID quand** : solde recu.

**Relance paiement** :
- J+3 : rappel amical
- J+7 : rappel ferme
- J+14 : mise en pause du site si pas paye (prevenir avant)

---

## 9. BALANCE_PAID
> Tout est paye. Support 3 mois actif.

**Declencheur** : solde 50% recu

**Actions** :
- [ ] Confirmer reception
- [ ] Activer le support 3 mois (modifications mineures, bugs)
- [ ] Proposer la maintenance mensuelle (15K XPF/mois)
- [ ] Demander un temoignage / avis Google
- [ ] Demander un referral ("Tu connais quelqu'un qui aurait besoin d'un site ?")

**Passer a COMPLETED quand** : support 3 mois termine.

---

## 10. COMPLETED
> Projet termine. Client dans le CRM pour upsell/referral.

**Actions** :
- [ ] Proposer renouvellement maintenance
- [ ] Proposer des services complementaires (SEO, chatbot, automatisation)
- [ ] Garder le contact (newsletter, voeux, etc.)
- [ ] Ajouter comme reference/temoignage si accord

---

## Regles Transversales

### Pricing
| Type | Prix | Acompte | Solde |
|------|------|---------|-------|
| Site vitrine 5 pages | 100K XPF | 50K | 50K a livraison |
| Site vitrine 3 pages | 80K XPF | 40K | 40K a livraison |
| Site + reservation simple | 150K XPF | 75K | 75K a livraison |
| Site + reservation avancee (calendrier) | 250-300K XPF | 50% | 50% a livraison |
| Site + paiement en ligne | 350-400K+ XPF | 50% | 50% a livraison |

### Options supplementaires
| Option | Prix |
|--------|------|
| Creation logo | 30K XPF |
| Shooting photo | 50K XPF |
| Page supplementaire | 20K XPF |
| Revision supplementaire | 15K XPF |
| Nom de domaine .pf | 8K XPF/an |
| Nom de domaine .com | 2K XPF/an |
| Maintenance mensuelle | 15K XPF/mois |
| Formation 1h | 10K XPF |

### Communication
- Repondre sous 2h (heures ouvrables)
- Tutoiement sauf si le client vouvoie (Pascal = vouvoiement)
- JAMAIS de prix avant d'avoir qualifie le besoin
- TOUJOURS inclure le pricing dans le message avec les prototypes
- JAMAIS builder avant d'avoir qualifie (exception : campagne 100K ou le scope est fixe)

### Relances
| Statut | Relance 1 | Relance 2 | Relance 3 | Archiver |
|--------|-----------|-----------|-----------|----------|
| LEAD | J+1 | J+3 | — | J+7 |
| PROPOSAL_SENT | J+2 | J+5 | J+10 | J+15 |
| REVIEW | J+3 | J+7 | — | J+14 |
| DELIVERED (paiement) | J+3 | J+7 | J+14 | Suspendre site |

### Canaux
- Email = formel, devis, factures, recaps
- Messenger = conversationnel, questions rapides, suivi
- Toujours envoyer sur TOUS les canaux disponibles pour les messages importants
- JAMAIS inventer un canal de contact (pas de mail invente)
