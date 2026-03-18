# Meta App Review — PACIFIKAI Messaging (App ID: 854522137595486)

> Ready-to-use submission guide. Copy-paste justifications, test instructions, and screencast script.
> Last updated: 2026-03-16

---

## 1. Permission Justifications (paste into Meta App Review form)

### pages_messaging

> **PACIFIKAI Messaging** is a multi-tenant SaaS platform (branded "Ve'a") that enables local businesses in French Polynesia — such as hair salons, restaurants, medical offices, and wellness centers — to automate appointment booking through Facebook Messenger.
>
> When a customer sends a direct message to a business's Facebook Page, our webhook endpoint (`/api/webhook/messenger`) receives the message, identifies the business by its `page_id`, and triggers an AI-powered conversational agent. The agent understands the customer's intent (e.g., "I'd like to book a haircut tomorrow at 2pm"), checks real-time availability against the business's calendar, and confirms the appointment — all within the Messenger conversation.
>
> We need `pages_messaging` to:
> 1. **Receive** incoming messages from customers via our webhook subscription.
> 2. **Send** automated replies (appointment confirmations, availability options, rescheduling prompts) back to the customer on behalf of the business.
>
> Each business connects their own Facebook Page through our OAuth flow (Facebook Login for Business). We store only the Page-scoped access token to send replies. Businesses can disconnect their Page at any time from our dashboard.
>
> This is not a one-off integration. Ve'a is a commercial SaaS serving multiple businesses, each connecting their own Page. We currently operate in French Polynesia and plan to expand to other Pacific Island territories.
>
> Privacy Policy: https://vea.pacifikai.com/privacy
> Terms of Service: https://vea.pacifikai.com/terms
> Data Deletion: https://vea.pacifikai.com/data-deletion

---

### pages_manage_metadata

> **PACIFIKAI Messaging** (Ve'a) requires `pages_manage_metadata` to subscribe Facebook Pages to webhook events so our platform can receive real-time message notifications.
>
> When a business owner connects their Facebook Page through our dashboard, we call the `/{page_id}/subscribed_apps` endpoint with `subscribed_fields: messages,messaging_postbacks` to register our webhook. Without this permission, we cannot receive incoming messages from customers and the entire automated booking flow breaks.
>
> Specifically, we use this permission to:
> 1. **Subscribe** a Page to our webhook upon connection (`POST /{page_id}/subscribed_apps`).
> 2. **Unsubscribe** a Page when the business disconnects from our platform.
>
> We do not use this permission to modify any other Page metadata. It is strictly for webhook subscription management.
>
> This is a multi-tenant SaaS — each business connects their own Page, and the subscription is tied to their Page-scoped token.
>
> Privacy Policy: https://vea.pacifikai.com/privacy

---

### instagram_manage_messages

> **PACIFIKAI Messaging** (Ve'a) extends the same automated appointment booking experience to Instagram Direct Messages. Many businesses in French Polynesia receive more customer inquiries via Instagram DMs than Messenger, especially in the beauty, wellness, and food industries.
>
> When a customer sends a DM to a business's Instagram Professional account, our webhook endpoint (`/api/webhook/instagram`) receives the message, identifies the business by its `instagram_business_account_id`, and triggers the same AI booking agent used for Messenger.
>
> We need `instagram_manage_messages` to:
> 1. **Receive** incoming Instagram DMs from customers via our webhook subscription.
> 2. **Send** automated replies (availability, booking confirmations, reminders) back to the customer within the Instagram DM thread.
>
> The Instagram account must be linked to a Facebook Page. When a business connects their Page through our OAuth flow, we automatically detect the linked Instagram Business Account and store its ID for message routing.
>
> This is a multi-tenant SaaS platform. Each business connects their own accounts. We process messages only to provide the appointment booking service described above.
>
> Privacy Policy: https://vea.pacifikai.com/privacy
> Data Deletion: https://vea.pacifikai.com/data-deletion

---

## 2. Test Instructions for Meta Reviewers

### Test Account

```
Dashboard URL:  https://dashboard.vea.pacifikai.com
Email:          reviewer@pacifikai.com
Password:       MetaReview2026!
```

> NOTE: Create this test account in Supabase before submission. The account should have a pre-configured business ("Salon Demo") with services (Coupe Femme 30min, Coupe Homme 20min, Coloration 60min) and availability (Mon-Fri 8:00-17:00 Tahiti time).

### Testing the Messenger Flow

1. Log in to the dashboard at `https://dashboard.vea.pacifikai.com` using the credentials above.
2. Navigate to **Channels** (left sidebar).
3. Observe the connected Facebook Page "Salon Demo Tahiti" — it shows a green "Connected" status with Messenger and Instagram icons.
4. Open Facebook Messenger (web or mobile) and search for the Page **"Salon Demo Tahiti"**.
5. Send a message: **"Bonjour, je voudrais prendre rendez-vous pour une coupe demain"**
6. Within 5-10 seconds, you will receive an automated reply from the AI agent asking for your preferred time and service.
7. Reply with: **"14h pour une coupe femme"**
8. The agent will confirm availability and send a booking confirmation with date, time, service, and a unique appointment reference.
9. Return to the Ve'a dashboard → **Appointments** page. The new appointment appears in the list with the customer's Messenger name and the booked service.

### Testing the Instagram DM Flow

1. On the same dashboard, the Channels page shows the linked Instagram account under the connected Page.
2. Open Instagram (web or mobile) and go to the profile **@salondemo.tahiti**.
3. Send a DM: **"Hello, do you have availability this Friday afternoon?"**
4. Within 5-10 seconds, you will receive an automated reply with available time slots for Friday.
5. Reply with a time selection. The agent confirms the booking.
6. Return to the dashboard → **Appointments** page. The Instagram booking appears with the source marked as "Instagram".

### What the Reviewer Should Expect

- **Response time**: 3-10 seconds for the AI agent to reply.
- **Language**: The agent responds in the same language the customer uses (French or English).
- **No human involved**: The entire booking is handled by the AI. No manual approval needed.
- **Dashboard reflection**: Every conversation and booking appears in real-time on the business dashboard.
- **Disconnection**: On the Channels page, clicking "Disconnect" immediately removes webhook subscriptions and stops automated replies.

---

## 3. Screencast Script (en francais, pour Jordy)

**Duree cible : 2min30 - 3min**
**Format : enregistrement ecran + voix off**
**Resolution : 1920x1080, exporter en MP4 <50MB**

### Scene 1 — Introduction (0:00 - 0:15)

> Montrer : landing page `vea.pacifikai.com`

**Voix off :** "Bonjour, je suis Jordy TOOFA, fondateur de PACIFIK'AI. Je vais vous montrer comment fonctionne Ve'a, notre plateforme SaaS de reservation automatique par messagerie pour les entreprises en Polynesie francaise."

### Scene 2 — Connexion au dashboard (0:15 - 0:35)

> Montrer : login page → dashboard home

**Voix off :** "Chaque entreprise a son propre espace. Ici, je me connecte avec un compte de demonstration — un salon de coiffure. On voit le tableau de bord avec les rendez-vous du jour, les statistiques, et les canaux connectes."

### Scene 3 — Connexion d'une Page Facebook (0:35 - 1:05)

> Montrer : cliquer sur "Canaux" dans la sidebar → cliquer "Connecter Facebook" → pop-up OAuth Facebook → selectionner une Page → retour dashboard avec statut "Connecte"

**Voix off :** "Pour activer la messagerie automatique, l'entreprise connecte sa Page Facebook. Un clic, l'autorisation Facebook, et c'est fait. La page est connectee, le webhook est souscrit, Messenger et Instagram sont prets."

### Scene 4 — Test Messenger en direct (1:05 - 1:45)

> Montrer : ouvrir Messenger (split screen) → envoyer "Bonjour, je veux un rendez-vous demain a 14h" → attendre la reponse automatique → reponse du bot avec proposition → confirmer → recevoir la confirmation

**Voix off :** "Maintenant, je simule un client qui envoie un message sur Messenger. L'IA comprend la demande, verifie les disponibilites en temps reel, et propose un creneau. Le client confirme, et le rendez-vous est pris — tout ca en moins de 30 secondes, sans intervention humaine."

### Scene 5 — Verification sur le dashboard (1:45 - 2:05)

> Montrer : retour sur le dashboard → page Rendez-vous → le nouveau RDV apparait avec le nom du client, le service, l'heure, et la source "Messenger"

**Voix off :** "Cote professionnel, le rendez-vous apparait immediatement dans le calendrier. On voit le nom du client, le service reserve, et la source — ici Messenger."

### Scene 6 — Test Instagram (2:05 - 2:30)

> Montrer : ouvrir Instagram DM → envoyer un message → recevoir la reponse automatique → montrer le RDV sur le dashboard avec source "Instagram"

**Voix off :** "Le meme systeme fonctionne sur Instagram. Un client envoie un DM, l'IA repond, et le rendez-vous est cree. Les entreprises n'ont rien a configurer en plus — Instagram est connecte automatiquement avec la Page Facebook."

### Scene 7 — Conclusion (2:30 - 2:50)

> Montrer : page Canaux avec tout connecte, puis retour landing page

**Voix off :** "Ve'a est une plateforme multi-tenant — chaque entreprise connecte ses propres comptes, ses propres services, ses propres horaires. Les donnees sont isolees, les tokens sont securises, et l'entreprise peut se deconnecter a tout moment. Merci pour votre examen."

---

## 4. Pre-Submission Checklist

### App Settings (developers.facebook.com)

- [ ] App name: **PACIFIKAI Messaging** (no special characters)
- [ ] App icon uploaded (1024x1024, no transparency)
- [ ] App category: **Business and Pages**
- [ ] Contact email: `jordy@pacifikai.com`
- [ ] Privacy Policy URL: `https://vea.pacifikai.com/privacy`
- [ ] Terms of Service URL: `https://vea.pacifikai.com/terms`
- [ ] Data Deletion Request URL: `https://vea.pacifikai.com/data-deletion`
- [ ] App Domain: `vea.pacifikai.com`

### Facebook Login for Business

- [ ] Facebook Login product added to the app
- [ ] Valid OAuth Redirect URIs: `https://vea.pacifikai.com/api/auth/facebook`
- [ ] Login Configuration ID: `2536440043437319` (verify in dashboard)
- [ ] Deauthorize Callback URL: `https://vea.pacifikai.com/api/auth/facebook/deauthorize`
- [ ] Data Deletion Request Callback URL: `https://vea.pacifikai.com/data-deletion`

### Webhooks

- [ ] Messenger webhook configured:
  - Callback URL: `https://dashboard.vea.pacifikai.com/api/webhook/messenger`
  - Verify Token: (check env `META_WEBHOOK_VERIFY_TOKEN`)
  - Subscribed fields: `messages`, `messaging_postbacks`
- [ ] Instagram webhook configured:
  - Callback URL: `https://dashboard.vea.pacifikai.com/api/webhook/instagram`
  - Verify Token: (same verify token)
  - Subscribed fields: `messages`

### Test Account

- [ ] Create `reviewer@pacifikai.com` account in Supabase Auth
- [ ] Create "Salon Demo" business with services and hours
- [ ] Connect a test Facebook Page ("Salon Demo Tahiti") to the demo account
- [ ] Verify the test Page has a linked Instagram Business Account
- [ ] Test the full Messenger flow manually (send DM → get response → check dashboard)
- [ ] Test the full Instagram flow manually
- [ ] Ensure the test Page is **not** restricted (must be publicly messageable)

### Screencast

- [ ] Record per Scene 1-7 script above
- [ ] Duration: 2-3 minutes
- [ ] Format: MP4, under 50MB, 1080p
- [ ] Upload to Meta as "Screencast" attachment in the App Review submission
- [ ] No sensitive data visible (blur tokens, passwords if visible)

### Legal Pages (verify live)

- [ ] `https://vea.pacifikai.com/privacy` — loads correctly, mentions Facebook/Instagram data usage
- [ ] `https://vea.pacifikai.com/terms` — loads correctly
- [ ] `https://vea.pacifikai.com/data-deletion` — loads correctly, provides deletion mechanism
- [ ] All three pages accessible without login

### Code / Infrastructure

- [ ] Webhook signature verification active (`verifyMetaSignature` in both routes)
- [ ] Webhook GET handler responds to Meta verification challenge (verify_token check)
- [ ] Dashboard deployed and accessible at `https://dashboard.vea.pacifikai.com`
- [ ] Landing page deployed at `https://vea.pacifikai.com`
- [ ] SSL valid on both domains
- [ ] Environment variables set in Vercel: `FACEBOOK_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `NEXT_PUBLIC_FACEBOOK_APP_ID`

---

## 5. Business Verification

### Does PACIFIK'AI qualify?

**Yes.** Meta requires Business Verification for apps requesting advanced permissions. PACIFIK'AI operates as an **Entreprise Individuelle (EI)** registered in French Polynesia.

### Documents needed

| Document | What to provide |
|----------|----------------|
| **Business name** | PACIFIK'AI (Jordy TOOFA, EI) |
| **Legal entity type** | Entreprise Individuelle |
| **Registration number** | Patente G67367 (French Polynesia business license) |
| **Country** | France (French Polynesia — COM, code PF) |
| **Address** | Business address from Patente registration |
| **Phone** | +689 89 55 81 89 |
| **Website** | https://pacifikai.com |
| **Business email** | jordy@pacifikai.com |

### Verification process

1. Go to **Business Settings** → **Security Center** in Meta Business Suite.
2. Click **Start Verification**.
3. Select country: **France** (French Polynesia falls under France in Meta's system).
4. Upload **Patente G67367** as the business registration document.
5. If Meta asks for a secondary document, use:
   - Utility bill or bank statement with business address
   - Or the DICP registration extract
6. Meta may call the phone number listed — keep +689 89 55 81 89 available.
7. Verification typically takes 2-5 business days.

### Important notes

- Meta may not recognize "Patente" as a standard document. In the upload form, select **"Business Registration Certificate"** or **"Other"** and add a note: *"Patente is the official business license issued by DICP (Direction des Impots et des Contributions Publiques) in French Polynesia, a French overseas collectivity."*
- If verification stalls, submit a support ticket referencing that French Polynesia is a French COM (Collectivite d'Outre-Mer) and EI is a recognized legal form.
- Business Verification is separate from App Review — you can start both in parallel.

---

## Quick Reference — Submission Order

1. **Start Business Verification** (can take days — do first)
2. **Create test account + demo business** (Supabase)
3. **Record screencast** (follow script above)
4. **Verify all checklist items** green
5. **Submit App Review** with all 3 permissions in a single submission
6. **Wait** — typical review: 3-10 business days

If rejected, Meta provides specific feedback. Common rejection reasons:
- Screencast doesn't clearly show the feature in action → re-record with better demonstration
- Privacy policy doesn't mention specific data types collected → update privacy page
- Test account doesn't work → verify credentials and demo business state before resubmitting
