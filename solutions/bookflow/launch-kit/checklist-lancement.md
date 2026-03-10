# Checklist Lancement Ve'a — 2 Semaines

> A fournir a chaque nouveau client. Cocher chaque etape au fur et a mesure.

---

## Semaine 1 — Activation

### Jour 1-2 : Setup technique (PACIFIK'AI)
- [ ] Bot Ve'a configure avec les services/horaires du client
- [ ] Test complet du flow de reservation (A → Z)
- [ ] Session Supabase creee pour le business
- [ ] Webhook connecte (Twilio sandbox ou Meta Cloud API)

### Jour 2-3 : Assets de communication
- [ ] Lien wa.me cree : `https://wa.me/{{PHONE}}?text=Bonjour%2C%20je%20souhaite%20reserver`
- [ ] QR codes generes (3 tailles : petit, moyen, grand)
- [ ] Affiche A4 imprimee (signaletique in-store)
- [ ] Post Facebook redige et valide par le client

### Jour 3-4 : Mise en place physique
- [ ] QR code pose a l'accueil / comptoir
- [ ] QR code sur les menus / cartes de prix
- [ ] Affiche A4 en vitrine
- [ ] QR code sur les cartes de visite (si reimpression prevue)

### Jour 4-5 : Lancement digital
- [ ] Post Facebook publie sur la page du business
- [ ] Post epingle en haut de la page Facebook
- [ ] Bio Instagram mise a jour avec le lien wa.me
- [ ] 3-5 stories Instagram publiees

---

## Semaine 2 — Amplification

### Jour 6-7 : Canaux supplementaires
- [ ] Google Business Profile mis a jour (bouton WhatsApp)
- [ ] Email envoye aux clients existants (voir template)
- [ ] SMS envoye aux clients avec numero de telephone (optionnel)

### Jour 8-10 : Publicite (si budget)
- [ ] Campagne Facebook "Click-to-WhatsApp" lancee
- [ ] Budget : 10-15 000 XPF pour 2 semaines
- [ ] Ciblage : rayon 3-5 km, 18-55 ans, interets secteur
- [ ] Suivi quotidien des resultats

### Jour 10-14 : Formation et optimisation
- [ ] Formation equipe 15 min (comment fonctionne le bot, cas speciaux)
- [ ] Equipe informee de ne PAS repondre aux messages WhatsApp geres par le bot
- [ ] Premier bilan : nombre de reservations, feedback clients
- [ ] Ajustements si necessaire (horaires, services, message d'accueil)

---

## Apres 2 semaines — Bilan

### Metriques a verifier
- [ ] Nombre de conversations WhatsApp
- [ ] Nombre de reservations completees
- [ ] Taux de conversion (conversation → RDV)
- [ ] No-shows evites grace aux rappels
- [ ] Feedback des clients (positif/negatif)
- [ ] ROI vs cout mensuel Ve'a

### Actions selon resultats
- **Ca marche bien** → augmenter le budget pub, ajouter Messenger
- **Moyen** → ajuster le message d'accueil, revoir les creneaux
- **Ca ne marche pas** → diagnostic avec PACIFIK'AI, possible changement de strategie

---

## Template Email — Clients Existants

**Objet** : Reservez plus facilement chez {{NOM_BUSINESS}}

```
Bonjour,

Bonne nouvelle ! Vous pouvez desormais prendre rendez-vous chez {{NOM_BUSINESS}} directement sur WhatsApp.

Comment ca marche :
1. Cliquez sur ce lien : {{LIEN_WAME}}
2. Envoyez "Bonjour"
3. Choisissez votre prestation et votre creneau
4. C'est fait ! Confirmation immediate.

Plus besoin d'appeler ou d'attendre. Reservez 24h/24, meme le soir et le weekend.

Un rappel automatique vous sera envoye la veille de votre rendez-vous.

A bientot !
L'equipe {{NOM_BUSINESS}}
```

---

## Template SMS — Clients avec numero

```
{{NOM_BUSINESS}} : Reservez maintenant sur WhatsApp ! 30 sec, pas d'appel.
{{LIEN_WAME}}
```

(Garder sous 160 caracteres pour eviter le double SMS)
