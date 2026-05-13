# Ve'a Connect — Browser Extension

Connecte ta Page Facebook a Ve'a en un clic. L'extension detecte automatiquement
ton Page Access Token genere via Meta Business Settings et l'envoie a ton dashboard
Ve'a, sans copier-coller manuel.

## Pourquoi cette extension ?

Pour eviter l'App Review Meta tout en restant scalable, Ve'a utilise des Page
Access Tokens permanents generes par le client lui-meme via Meta Business
Settings → System Users. Cette extension automatise l'etape "copie le token et
colle-le dans Ve'a" : elle surveille la page Business Settings et capture le
token des qu'il apparait dans le DOM, puis l'envoie a `vea.pacifikai.com`.

## Architecture

| Composant | Role |
|---|---|
| `popup/` | UI quand on clique l'icone — selecteur business, etats wizard |
| `content/business-fb.js` | Tourne sur `business.facebook.com/*`, observe le DOM avec `MutationObserver`, detecte les tokens (regex `EAA[A-Za-z0-9]{180,}` + contexte) |
| `background/sw.js` | Service worker — relaye les tokens detectes vers le popup, gere le badge |
| `manifest.json` | Manifest V3 — permissions minimales (`tabs`, `storage`, `scripting`, `alarms`) |

## Flux utilisateur

1. Client est logge sur `vea.pacifikai.com` (cookie session present)
2. Click sur l'icone Ve'a Connect → popup verifie l'auth via `/api/business`
3. Popup liste les businesses du client, il en choisit un
4. Click "Continuer" → ouvre `business.facebook.com/settings/system-users` dans un nouvel onglet
5. Client cree un System User, assigne sa Page, genere un token (expiration "Jamais")
6. Le content script detecte le token dans le modal qui apparait → toast vert "Token detecte !"
7. Background SW envoie le token a `POST /api/auth/facebook/byo-token` avec `credentials: 'include'`
8. Backend Vea valide (debug_token, scopes, type=PAGE), sauve, configure le poller
9. Popup affiche succes

## Auth model

L'extension n'a **aucune cle API en clair**. Toutes les requetes vers Vea
utilisent les cookies session du domaine `vea.pacifikai.com` (le client doit
deja etre logge dans son navigateur).

## Permissions justifiees

- `tabs` : ouvrir l'onglet Business Settings, naviguer vers Vea
- `storage` : memoriser le business actif et le dernier token detecte (auto-purge 10 min)
- `scripting` : injecter le content script (deja declare dans manifest, mais utile pour MAJ futures)
- `alarms` : nettoyage automatique du token stocke
- `host_permissions` :
  - `vea.pacifikai.com/*` : POST le token
  - `business.facebook.com/*` + `www.facebook.com/business/*` : injection content script

## Securite

- **Le token n'est jamais journalise** dans les logs de l'extension
- **Auto-purge 10 min** : `chrome.alarms` nettoie `lastDetectedToken` apres 10 minutes
- **Cooldown 5s** : evite les double-sends du content script
- **Validation stricte** : regex `EAA[A-Za-z0-9]{180,}` + verif que l'element est un textarea/input/code/contexte token
- **Backend Vea valide tout** : type=PAGE, scopes obligatoires, expiration

## Install local (developpement)

1. Charge l'extension non packagee dans Chrome / Brave / Edge :
   - `chrome://extensions` → activer "Developer mode"
   - Click "Load unpacked" → selectionne le dossier `vea-extension/`
2. Connecte-toi a `vea.pacifikai.com`
3. Click l'icone Ve'a Connect dans la barre d'extensions
4. Suis le flow

## Build dist (Chrome Web Store)

```bash
cd vea-extension
zip -r ../vea-connect.zip . -x "README.md" -x ".DS_Store" -x "*.swp"
```

Le zip resultant est uploadable directement dans Chrome Web Store
Developer Console (compte Vea ouvert avec frais $5 unique).

## Reviews / cycle CWS

- Soumission via [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
- Privacy policy obligatoire (URL hostee : `https://vea.pacifikai.com/privacy/extension`)
- Justification permissions (texte deja redige dans cette README, section "Permissions justifiees")
- Review delai : 1-3 jours en general, jusqu'a 2 semaines si Meta-related (Google peut verifier les permissions FB)

## Compatibilite

- ✅ Chrome 109+
- ✅ Brave (memes builds Chromium)
- ✅ Edge (Chromium)
- ⚠️ Firefox : port necessaire (Manifest V3 supporte mais APIs `chrome.*` → `browser.*`). Plus tard.
- ❌ Safari : nope (Webkit Manifest V3 plus restrictif)

## Versioning

Chaque release bump dans `manifest.json` `version` (semver).
- `1.0.x` : patches detection (FB UI changes, faux positifs)
- `1.x.0` : nouvelles features (multi-page, Instagram, etc.)
- `2.0.0` : refonte majeure
