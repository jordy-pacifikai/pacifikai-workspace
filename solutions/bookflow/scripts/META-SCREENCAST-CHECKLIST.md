# Meta App Review Screencast — CHECKLIST OBLIGATOIRE

## Feedback Meta (rejet 20 mars 2026)
> "La capture vidéo ne démontre pas l'expérience de bout en bout"

### Ce que Meta exige EXACTEMENT :
1. ✅ Le flux de connexion Meta complet (OAuth Facebook)
2. ✅ Une personne octroyant à l'application un accès (clic Autoriser)
3. ✅ L'expérience bout en bout (message → bot → résultat dans dashboard)
4. ✅ UI en anglais OU sous-titres anglais + infobulles

### Permissions à démontrer :
- [ ] `pages_show_list` — montrer la liste des Pages dans le OAuth
- [ ] `pages_manage_metadata` — webhook subscription (connexion Page)
- [ ] `pages_messaging` — envoi/réception messages Messenger
- [ ] `business_management` — accès aux assets business

### Scènes OBLIGATOIRES (ordre) :
1. [ ] **Landing page** vea.pacifikai.com (en anglais ou sous-titres)
2. [ ] **Privacy Policy** — cliquer et montrer le contenu
3. [ ] **Login dashboard** — email + OTP (visible)
4. [ ] **Channels "Déconnecté"** — bouton "Connect with Facebook" visible
5. [ ] **OAUTH FACEBOOK** — popup avec :
   - Login Facebook (si pas connecté)
   - Liste des permissions demandées
   - Sélection de la Page
   - Clic "Autoriser/Continue"
   - Redirect retour dashboard
6. [ ] **Channels "Connecté"** — statut vert, Page visible
7. [ ] **MESSENGER LIVE** — ouvrir Messenger, envoyer message, bot répond
8. [ ] **Dashboard Conversations** — la conversation apparaît en temps réel
9. [ ] **Conversation Detail** — échange complet visible
10. [ ] **Appointments** — le RDV créé par le bot visible
11. [ ] **Déconnexion** — clic "Déconnecter", statut change
12. [ ] **Annotations** — bandeau "Testing: [permission]" sur CHAQUE scène

### Annotations texte obligatoires :
- Bandeau haut : "Testing: pages_messaging" (vert) sur les scènes messaging
- Bandeau haut : "Testing: pages_manage_metadata" (vert) sur OAuth + channels
- Infobulles : expliquer les boutons en anglais
- Footer : "Ve'a by PACIFIK'AI — Meta App Review"

### Méthode technique :
- **Facebook login** : Camoufox REST API (port 9377), cookies meta-developer-dashboard + password
- **OAuth popup** : même browser Camoufox, intercepter la navigation vers /dialog/oauth
- **Dashboard** : Puppeteer headless (OTP via Supabase Admin API)
- **Messenger** : Camoufox (même session FB), facebook.com/messages/t/
- **Composition** : FFmpeg overlay banners + concat scènes

### Credentials :
- FB : jordybanks@mail.com / Sennosen2258#
- Ve'a HVC : jordy@highvaluecapital.club (OTP via admin API)
- Supabase : aaitnegjnhjwnthcmsnr
- Page ID : 466150073258705 (High Value Capital)
- App ID : 854522137595486
- App Secret : e15a88433486514bce4f08097a9ba83f
- Webhook verify : META_VERIFY_TOKEN sur Vercel
