# STRATÉGIE PROSPECTION MASSIVE — PACIFIK'AI
**Équipe 2 personnes | Objectif: contacter toute la Polynésie**
*Généré le 2026-02-24*

---

## VUE D'ENSEMBLE

**Objectif**: 500-1000 prospects contactés en 90 jours, pipeline qualifié, agent IA qui tourne en autonomie 24/7.
**Équipe**: Jordy (closing, demos, stratégie) + coéquipier (opérations, setup, data)
**Budget stack**: ~$100-200/mois tout compris

---

## PARTIE 1 — SOURCES DE DONNÉES ENTREPRISES PF

### Source #1 — RTE ISPF (open data officiel, GRATUIT)
**URL**: https://www.tefenua.data.gov.pf/datasets/be7fd4496a524d2186dd28b49b8f64ba_0/about
- C'est le SIREN de Polynésie française. Chaque entreprise = numéro TAHITI (6 chiffres)
- Contient: nom, code NAF/APE, commune
- Télécharger le CSV, filtrer par secteur NAF + commune Papeete/Moorea
- Résultat: 5 000-15 000 entités identifiées
- **Pas d'email/tel** → à croiser avec les annuaires

### Source #2 — Annuaires commerciaux (email + tel, GRATUIT)
| Source | URL | Données |
|--------|-----|---------|
| **Pages Jaunes OPT (officiel)** | annuaireopt.pf | Nom, tel, secteur |
| **Tahiti Annuaire** | tahitiannuaire.com | Nom, tel, email, adresse |
| **Tahiti Business Guide** | tahitibusinessguide.com | Fiche complète |
| **Annuaire Polynésie** | annuaire-polynesie.com | Coordonnées |

→ Scrappables via **Firecrawl** (structure HTML classique, pagination par secteur)

### Source #3 — Google Maps via Outscraper (~$15-30 pour 1000 fiches)
**URL**: outscraper.com/google-maps-scraper
- Requête: "hôtels Tahiti", "médecins Papeete", "restaurants Moorea", etc.
- Données: nom, adresse, tel, site web, email (partiel), horaires, avis
- 100% automatisable via API REST → n8n webhook direct
- **Meilleur rapport effort/qualité pour contacts locaux qualifiés**

### Source #4 — CCISM (CCI PF) — 22 000 entreprises référencées
**URL**: ccism.pf
- Registre RCS consultable via ca-papeete.justice.fr
- Pas d'export public direct, mais sourcing sectoriel possible

### Tableau résumé données disponibles
| Source | Nom | Secteur | Tel | Email | Site | Coût |
|--------|-----|---------|-----|-------|------|------|
| RTE ISPF | ✅ | ✅ | ❌ | ❌ | ❌ | Gratuit |
| Annuaires OPT/Tahiti | ✅ | ✅ | ✅ | partiel | partiel | Gratuit |
| Google Maps/Outscraper | ✅ | ✅ | ✅ | partiel | ✅ | ~$15-30/1000 |
| Apollo.io | ✅ | ✅ | partiel | ✅ | ✅ | Gratuit (50/mois) |

---

## PARTIE 2 — STACK PROSPECTION AUTOMATISÉ

### Stack recommandé (Option B — minimal, démarrer en 48h)

| Outil | Rôle | Prix/mois |
|-------|------|-----------|
| **n8n** (déjà actif) | Orchestrateur central | $0 |
| **Apollo.io Free** | Enrichissement contacts B2B | $0 |
| **Hunter.io Free** | Vérification emails | $0 |
| **Instantly.ai Growth** | Cold email illimité + warmup | $37 |
| **DeepSeek V3** (déjà actif) | Personnalisation emails IA | ~$5 |
| **Outscraper** | Extraction Google Maps | ~$15-30 (one-shot) |

**Total: ~$42-72/mois pour commencer**

Scale si >200 contacts/semaine: ajouter Lemlist (€63/mois, RGPD-compliant) ou Clay ($149/mois pour enrichissement lourd).

### Architecture agent prospection autonome (n8n)

```
[SOURCE] → [ENRICHISSEMENT] → [SCORING IA] → [EMAIL SÉQUENCE] → [CRM + NOTIF]

1. Outscraper API → Google Maps par secteur/commune
   ou Firecrawl → scrape annuaireopt.pf

2. Hunter.io → vérifier email
   Apollo.io → enrichir (poste, LinkedIn, taille)

3. DeepSeek/Claude → score ICP 1-10
   Filtre n8n → si score ≥7 → file priorité haute

4. Instantly.ai API → créer séquence 5 emails automatique
   DeepSeek → générer ligne objet + 1er paragraphe personnalisé

5. Supabase → log lead + statut
   SpiderClaw → notif Telegram si réponse positive
```

### Ce qui est 100% automatisable
- Sourcing + extraction leads depuis Google Maps / annuaires
- Vérification et déduplication emails
- Scoring ICP par IA
- Génération des emails personnalisés (DeepSeek)
- Envoi séquences cold email (Instantly)
- Relances J+3 / J+7 / J+14 automatiques
- Mise à jour CRM Supabase
- Notification Telegram (SpiderClaw) si réponse positive

### Ce qui nécessite intervention humaine
- Qualifier les réponses intéressées (toi)
- Mener les démos (Jordy)
- Gérer les devis custom
- Review qualité emails (10% échantillon)
- Gestion bounces + désabonnements RGPD

---

## PARTIE 3 — PLAN DE SEGMENTATION

### Priorité de ciblage (ordre d'attaque)

| # | Secteur | Volume PF est. | Canal prioritaire | Offre d'entrée |
|---|---------|---------------|-------------------|----------------|
| 1 | Hôtels & resorts | ~60 | Email + Tel | AutoPilot Chat |
| 2 | Médecins & cliniques | ~80 | Email + WhatsApp | AutoPilot Chat |
| 3 | Restaurants | ~200 | Email + WhatsApp | AutoPilot Chat |
| 4 | Agences immobilières | ~25 | Email + LinkedIn | AutoPilot Chat |
| 5 | Concessionnaires auto | ~15 | Tel + Email | AutoPilot Chat |
| 6 | Tour operators / activités | ~100 | WhatsApp + Email | AutoPilot Chat |
| 7 | Professions libérales | ~150 | Email + LinkedIn | OpenClaw Personal |
| 8 | Distribution / import | ~50 | Email | FlowMatic |
| **Total vague 1** | | **~680 prospects** | | |

### Segments suivants (vague 2, M2-M3)
- Grandes surfaces & retail (~30)
- Agences de voyage (~40)
- Coiffeurs / esthétique (~100)
- Architectes / BTP (~50)
- Assurances (~20)
- Écoles / formations (~40)
- **Total vague 2: ~280 prospects**

---

## PARTIE 4 — SÉQUENCES EMAILS (structure validée)

### Structure optimale (5 touchpoints sur 14 jours)
```
J0  → Email 1 (premier contact — pain point)
J1  → Vue profil LinkedIn (signal passif)
J3  → Email 2 (relance — angle différent, tâche concrète)
J6  → DM LinkedIn (canal complémentaire)
J10 → Email 3 (breakup — oui/non/pas maintenant)
```

**Benchmarks**: open rate 27-45%, reply rate 4-15% selon personnalisation. Séquence 5 emails = 3x plus de réponses qu'un seul email.

### Subject lines qui convertissent
- `{{prenom}}, question rapide` → ~45% open rate
- `{{entreprise}} + IA = ?` → ~42%
- `J'ai regardé votre site {{entreprise}}` → ~40%

**Règle**: 2-4 mots = highest open rate. Prénom dans le sujet = +46%.

### Templates génériques (à personnaliser par secteur)

**Email 1 — Premier contact (J0)**
```
Objet: {{prenom}}, question rapide sur {{entreprise}}

Bonjour {{prenom}},

En regardant {{entreprise}}, j'ai remarqué que [SIGNAL SPÉCIFIQUE].

On a mis en place un système similaire pour [ANALOGUE MÊME SECTEUR]
— ils ont réduit leur charge admin de 40% en 3 semaines.

Ça vaut le coup d'en parler 15 min?

Jordy
PACIFIK'AI — Automatisation IA pour PME polynésiennes
```

**Email 2 — Relance (J+3)**
```
Objet: Re: {{prenom}}, question rapide sur {{entreprise}}

{{prenom}},

Je reviens sur mon email. Pas de pression — juste une précision.

Le système qu'on a installé chez [TYPE D'ENTREPRISE SIMILAIRE]
automatise [TÂCHE CONCRÈTE]. Le dirigeant m'a dit que ça lui a
rendu 2h/jour.

Si c'est pas le bon moment, dis-le moi directement.
Sinon, 15 min cette semaine?

Jordy
```

**Email 3 — Breakup (J+10)**
```
Objet: On ferme le dossier {{entreprise}}?

{{prenom}},

Ça fait quelques jours sans retour — je comprends, les agendas chargent.

Je ferme le dossier de mon côté sauf si l'automatisation de
[TÂCHE SPÉCIFIQUE] est encore un sujet pour toi.

Réponse rapide: oui / non / pas maintenant?

Jordy
```

---

## PARTIE 5 — PITCHS SECTORIELS COMPLETS

### SECTEUR 1 — Hôtels & Resorts

**Subject:** Votre réception répond à 2h du matin?

**Email:**
La chambre 204 veut savoir les horaires du spa. La 117 demande un late check-out. Le restaurant affiche complet sur Google mais pas sur votre site. Et votre réceptionniste est déjà sur deux autres lignes.

On a installé un assistant WhatsApp pour un hôtel de la place. En 30 jours: 70% des demandes guest traitées sans intervention humaine, réponse aux avis Google sous 2h, et le staff qui gère enfin ce qui demande vraiment leur attention.

Concrètement: check-in info, horaires, excursions recommandées, demandes spéciales — tout géré automatiquement, en français, anglais et tahitien, 24h/24.

Votre réception ne disparaît pas. Elle arrête de répondre aux mêmes questions 40 fois par jour.

Ça t'intéresse qu'on regarde ensemble ce que ça donnerait pour ton établissement? 15 minutes, je t'explique exactement.

— Jordy / PACIFIK'AI

**WhatsApp (50-80 mots):**
Salut, c'est Jordy de PACIFIK'AI. Je travaille avec des hôtels ici en Polynésie pour automatiser les demandes guests sur WhatsApp — horaires, services, late check-out, réponse aux avis. 70% des questions traitées sans intervention. Ton équipe réception est souvent sur-sollicitée? Je t'explique en 15 min. Dispo cette semaine?

**Script appel (30s):**
"Bonjour, Jordy de PACIFIK'AI. Je vous appelle parce qu'on vient d'automatiser le service guest WhatsApp d'un hôtel ici en Polynésie — ils gèrent maintenant 70% des demandes sans décrocher. Je voulais savoir si c'est un sujet qui vous parle, parce que j'ai l'impression que votre réception tourne à plein régime. Vous avez 15 minutes cette semaine?"

---

### SECTEUR 2 — Médecins & Cliniques

**Subject:** Patients qui posent un lapin — vraiment inévitable?

**Email:**
Votre secrétaire passe une heure par jour à confirmer des RDV par téléphone. Résultat: la ligne est occupée quand un patient appelle, 3-4 créneaux vides chaque semaine parce que personne n'a rappelé, et votre agenda ressemble à du gruyère.

On a mis en place un système de prise de RDV WhatsApp pour une clinique ici en PF. Le bilan après 2 mois: -40% de no-shows grâce aux rappels automatiques, et les patients prennent RDV à 21h sans déranger personne.

Le patient envoie un message, choisit son créneau, reçoit une confirmation et un rappel 24h avant. Votre secrétaire ne touche à rien. Elle gère ce qui nécessite vraiment un humain.

Pas besoin de changer votre logiciel de gestion. Ça se branche par-dessus ce que vous avez déjà.

Ça t'intéresse qu'on voie si c'est applicable chez toi en 15 minutes?

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. Je travaille avec des cabinets médicaux en Polynésie pour automatiser les RDV sur WhatsApp et les rappels patients. Résultat: -40% de no-shows, zéro téléphone pour les confirmations. Ta secrétaire est souvent débordée? Je t'explique en 15 min. Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. Je vous appelle parce qu'on vient d'aider une clinique ici en Polynésie à diviser par deux leurs rendez-vous manqués grâce aux rappels automatiques WhatsApp. Je voulais savoir si les no-shows et la surcharge téléphonique c'est quelque chose que vous ressentez aussi. Vous avez 15 minutes cette semaine?"

---

### SECTEUR 3 — Agences Immobilières

**Subject:** Vos leads Facebook dorment pendant que vous dormez

**Email:**
Un acheteur voit votre annonce à 22h sur Facebook. Il envoie un message. Vous répondez le lendemain matin à 8h. À ce moment-là, il a déjà contacté deux autres agences.

Dans l'immobilier, la rapidité de contact fait la différence. Un lead contacté en moins de 5 minutes a 9x plus de chances de convertir.

On a mis en place un agent IA pour une agence ici en Polynésie. Tous les leads Facebook et Instagram sont répondus en moins de 5 minutes — de nuit, le week-end, peu importe. L'agent qualifie (budget, type de bien, délai), et transfère seulement les prospects chauds à votre équipe avec un résumé complet.

Vos commerciaux ne voient plus que des contacts qui savent déjà ce qu'ils veulent.

Ça t'intéresse qu'on regarde ensemble combien de leads tu perds actuellement chaque semaine? 15 minutes top chrono.

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. Vos leads Facebook/Insta — ils reçoivent une réponse en combien de temps actuellement? On a un système qui répond en moins de 5 min, qualifie le prospect, et te passe seulement les chauds. Une agence ici en PF a installé ça. 15 minutes pour t'expliquer? Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. Je vous appelle parce qu'on a aidé une agence immobilière ici en Polynésie à ne plus perdre de leads la nuit — leur agent IA répond en moins de 5 minutes et qualifie les acheteurs avant de les passer aux commerciaux. Est-ce que c'est un problème que vous ressentez aussi? Vous avez 15 minutes?"

---

### SECTEUR 4 — Concessionnaires Auto

**Subject:** Votre SAV répond aux mêmes questions depuis des années

**Email:**
"C'est quoi les horaires atelier?" "Comment je prends RDV?" "Mon voyant clignote, c'est grave?" — votre équipe SAV répond à ça 20 fois par jour. Pendant ce temps, les vrais clients qui veulent acheter un véhicule attendent.

On a installé un assistant WhatsApp chez COWAN MOTOR ici en Polynésie. Résultat: le SAV a récupéré 30% de son temps sur les questions répétitives, et les leads commerciaux reçoivent une réponse immédiate avec qualification automatique.

Un lead qui remplit un formulaire sur votre site à 19h — il reçoit une réponse dans la minute. Pas le lendemain matin.

Ça t'intéresse qu'on discute 15 minutes pour voir si c'est applicable chez toi?

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. On travaille avec COWAN MOTOR ici en PF — chatbot WhatsApp qui gère le FAQ SAV + qualifie les leads commerciaux automatiquement. Les vendeurs voient seulement les prospects chauds. Tu perds du temps à gérer des questions répétitives? Je t'explique en 15 min. Dispo?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. Je vous appelle parce qu'on travaille déjà avec COWAN MOTOR ici en Polynésie pour automatiser leur SAV et leurs leads commerciaux sur WhatsApp. Je voulais voir si vous avez les mêmes enjeux. Vous avez 15 minutes?"

---

### SECTEUR 5 — Restaurants & Food Service

**Subject:** La table de 8 — confirmée ou pas?

**Email:**
Vendredi soir. Vous avez 3 tables de 6 confirmées par téléphone. À 19h30, deux ne se présentent pas. Vous aviez refusé des réservations pour ça.

Les restaurants qui gèrent leurs réservations sur WhatsApp avec rappels automatiques réduisent leurs no-shows de 50%. Et leurs clients inactifs depuis 2 mois reçoivent un message personnalisé qui les fait revenir — sans que personne appuie sur un bouton.

On a mis ça en place pour un établissement ici en Polynésie: réservation WhatsApp 24h/24, rappel automatique 2h avant, réponse aux avis Google sous 4h, relance clients inactifs avec offre du mois.

Et le soir où la salle est à moitié vide? Un message part automatiquement à votre liste clients avec la disponibilité du soir.

Ça t'intéresse qu'on voie ensemble comment ça s'adapte à ton resto? 15 minutes.

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. Réservations WhatsApp automatiques, rappels 2h avant, relance clients inactifs, réponse avis Google — tout ça sans que ton équipe touche à rien. Un restaurant ici en PF a réduit ses no-shows de 50% avec ça. Ça t'intéresse? 15 min pour t'expliquer. Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. Je travaille avec des restaurants ici en Polynésie pour automatiser les réservations WhatsApp et les rappels clients — un établissement qu'on accompagne a divisé ses no-shows par deux depuis qu'on a mis ça en place. Est-ce que les réservations manquées vous prennent du temps? Vous avez 15 minutes?"

---

### SECTEUR 6 — Professions Libérales (notaires, avocats, experts-comptables)

**Subject:** Combien d'heures par semaine sur des tâches sans valeur?

**Email:**
Relancer un client pour un document manquant. Confirmer un RDV. Générer un contrat type qui change à peine d'un dossier à l'autre. Répondre aux mêmes questions de premier contact.

Pour un cabinet comme le vôtre, chaque heure sur ces tâches c'est une heure qui n'est pas facturée.

On a mis en place un agent IA pour un professionnel libéral ici en Polynésie. Ce que ça fait concrètement: gestion de l'agenda avec prise de RDV WhatsApp 24h/24, relances automatiques pour les pièces manquantes, génération de documents types pré-remplis.

Résultat: 6 à 8 heures récupérées par semaine sur l'administratif pur.

Pas besoin de changer vos outils. Ça vient se greffer à votre façon de travailler actuelle.

Ça t'intéresse qu'on en parle 15 minutes pour voir ce qu'on pourrait automatiser chez toi?

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. On aide les professionnels libéraux ici en PF à récupérer 6-8h/semaine sur l'admin: prise de RDV WhatsApp automatique, relances dossiers, génération de documents types. Les tâches répétitives te prennent du temps? 15 min pour t'expliquer. Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. Je vous appelle parce qu'on aide des professionnels libéraux ici en Polynésie à automatiser leur administratif — prise de RDV, relances clients, documents types. La plupart récupèrent 6 à 8 heures par semaine. Je voulais voir si c'est quelque chose qui vous parle. Vous avez 15 minutes?"

---

### SECTEUR 7 — Distribution & Import

**Subject:** Votre stock en rupture — vous le savez quand?

**Email:**
Le camion est arrivé, le rayon est vide, et votre responsable logistique l'a su ce matin parce qu'un employé lui a envoyé un message WhatsApp. La commande fournisseur part avec 3 jours de retard.

On a déployé un dashboard temps réel pour une entreprise d'import ici en Polynésie. Ce que ça change: alertes automatiques dès qu'un seuil de stock est atteint, commandes fournisseurs déclenchées automatiquement sur les références à fort mouvement, et un reporting hebdo qui part tout seul à la direction.

L'équipe ne gère plus les urgences liées aux ruptures. Elle travaille en anticipation.

Ça t'intéresse qu'on regarde ensemble ce qu'on pourrait automatiser dans ton cycle approvisionnement? 15 minutes.

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. Dashboard stock temps réel, alertes rupture automatiques, commandes fournisseurs déclenchées sans intervention humaine — on a mis ça en place pour un importateur ici en PF. Le reporting et les ruptures te prennent du temps? 15 min pour t'expliquer. Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. On a mis en place un système pour un importateur ici en Polynésie — alertes rupture automatiques et commandes fournisseurs déclenchées sans intervention humaine. Je voulais voir si la gestion des stocks et le reporting manuel c'est quelque chose qui vous prend du temps. Vous avez 15 minutes?"

---

### SECTEUR 8 — Tourisme & Activités (tour operators, nautique)

**Subject:** La réservation de 23h — vous l'avez ratée?

**Email:**
Un touriste à son hôtel à Moorea. Il veut réserver une excursion pour demain matin. Il vous envoie un message WhatsApp à 22h45. Vous le voyez le lendemain à 7h. Il a déjà réservé ailleurs.

Dans le tourisme en Polynésie, les réservations de dernière minute représentent une part importante du chiffre. Et elles se perdent presque toutes hors des heures de bureau.

On a déployé un agent IA pour un tour operator ici en Polynésie. Ce que ça fait: répond à toutes les demandes WhatsApp en moins de 2 minutes, 24h/24 — disponibilités, tarifs, options, langues (français/anglais/tahitien). Il prend la réservation, envoie la confirmation, puis le rappel la veille.

Zéro lead perdu la nuit. Zéro WhatsApp personnel débordé.

Ça t'intéresse qu'on regarde ensemble ce que ça donnerait pour tes activités? 15 minutes.

— Jordy / PACIFIK'AI

**WhatsApp:**
Salut, c'est Jordy de PACIFIK'AI. Réservations WhatsApp 24h/24, confirmations auto, rappels la veille — un tour operator ici en PF ne perd plus aucun lead de nuit depuis qu'on a mis ça en place. Ton WhatsApp perso déborde de demandes? Je t'explique en 15 min. Dispo cette semaine?

**Script appel:**
"Bonjour, Jordy de PACIFIK'AI. On travaille avec des tour operators ici en Polynésie pour ne plus jamais rater une réservation de nuit — leur agent WhatsApp répond en 2 minutes et prend la réservation directement. Je voulais savoir si les demandes hors horaires c'est quelque chose qui vous échappe. Vous avez 15 minutes?"

---

## PARTIE 6 — PLAN D'EXÉCUTION 90 JOURS

### SEMAINE 1-2 — Setup infrastructure

**Jordy (stratégie)**:
- Télécharger base RTE ISPF (open data) → filtrer secteurs prioritaires
- Créer compte Instantly.ai ($37/mois), configurer domaine d'envoi + warmup
- Rédiger les 3 emails par secteur (adaptés depuis les templates ci-dessus)

**Coéquipier (opérations)**:
- Scraper annuaireopt.pf via Firecrawl (par secteur: hôtels, médecins, restaurants)
- Acheter batch Outscraper Google Maps (~$20) pour 500 fiches secteurs prioritaires
- Vérifier emails avec Hunter.io → nettoyer base
- Setup workflow n8n: Outscraper → Hunter → Instantly → Supabase

**Objectif semaine 2**: 300 contacts qualifiés prêts à envoyer

### SEMAINE 3-4 — Lancement vague 1

- Lancer séquences secteurs prioritaires: hôtels (60), médecins (80), restaurants (100)
- Cadence: 30-50 emails/jour (ne pas bruler la réputation du domaine)
- Surveiller open rate > 25% et reply rate > 3% minimum
- Toutes les réponses positives → notif SpiderClaw Telegram → Jordy prend la main
- Objectif: 8-15 réponses intéressées, 3-5 démos bookées

### MOIS 2 — Vague 2 + optimisation

- Analyser séquences vague 1 (meilleurs subject lines, secteurs qui répondent)
- Lancer vague 2: immobilier (25), concessionnaires (15), tour operators (100)
- Ajouter canal LinkedIn: coéquipier fait 20-30 vues de profils/jour dans les cibles
- Objectif: 5-8 démos supplémentaires, 2 premiers nouveaux clients signés

### MOIS 3 — Vague 3 + scaling

- Lancer professions libérales (150), distribution (50), activités diverses
- Affiner l'ICP basé sur les clients signés (qui a le mieux converti?)
- Optimiser agent n8n avec les patterns de réponse appris
- Objectif: MRR > 400 000 XPF, pipeline 10+ prospects chauds

---

## PARTIE 7 — RÔLES ÉQUIPE DE 2

### Jordy — Closing & Produit
- Démos et calls de qualification (objectif: 2-3/semaine)
- Décision pricing et offre sur chaque deal
- Relations clients existants (upsells)
- Définition ICP et ajustement messages
- Présence événements locaux (Chambre de Commerce, sectoriels)

### Coéquipier — Operations & Data
- Setup et maintenance agent prospection n8n
- Extraction et nettoyage bases de données
- Envoi séquences + monitoring métriques
- Mise à jour CRM Supabase
- Qualification initiale des réponses positives (avant de passer à Jordy)
- Production assets (case studies, one-pagers sectoriels)

---

## PARTIE 8 — RÈGLES RGPD & BONNES PRATIQUES

- **Toujours mentionner** "Répondre STOP pour ne plus recevoir" dans les emails
- **Unsubscribe en 1 clic** obligatoire (Instantly le gère automatiquement)
- **Ne jamais envoyer** depuis son domaine principal (pacifikai.com) → utiliser un sous-domaine dédié (ex: hello.pacifikai.com) pour protéger la réputation
- **Warmup obligatoire** avant envoi masse (Instantly warmup = 2-3 semaines)
- **WhatsApp mass** = interdit par Meta. Utiliser uniquement en one-to-one personnalisé
- **Cadence**: max 50 emails/jour les 4 premières semaines, puis monter à 100-200

---

## MÉTRIQUES À SUIVRE (dashboard Supabase)

| Métrique | Seuil minimum | Seuil excellent |
|----------|--------------|-----------------|
| Open rate | >25% | >40% |
| Reply rate | >3% | >10% |
| Taux conversion reply→démo | >20% | >40% |
| Taux conversion démo→client | >25% | >50% |
| CAC (coût par client signé) | <100k XPF | <50k XPF |
| Délai moyen premier contact→signé | <30 jours | <14 jours |

*MAJ: 2026-02-24 | Sources: 4 agents recherche web | Stack validé*
