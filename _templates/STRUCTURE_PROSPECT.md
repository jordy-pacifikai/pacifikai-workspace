# Structure Standard - Dossier Prospect

Chaque prospect doit suivre cette structure pour faciliter l'organisation et le manifest automatique.

```
{NOM_ENTREPRISE}/
├── MEMORY.md .................. Memoire du prospect (obligatoire)
├── FICHE_RECHERCHE.md ......... Fiche generee par Claude Opus
│
├── prospection/ ............... Documents de demarchage
│   ├── email-prospection.md ... Templates emails
│   ├── script-appel.md ........ Script telephonique
│   └── proposition-commerciale.html
│
├── demo/ ...................... Demos et presentations
│   ├── index.html ............. Landing page demo
│   ├── dashboard.html ......... Dashboard demo
│   ├── n8n-visualizer.html .... Visualiseur workflows
│   └── assets/ ................ Images, CSS, etc.
│
├── docs/ ...................... Documentation technique
│   ├── architecture.md
│   └── builds/ ................ Details des builds n8n
│
└── workflows/ ................. Exports workflows n8n (JSON)
```

## Fichiers Obligatoires

1. **MEMORY.md** - Memoire du prospect avec:
   - Contexte entreprise
   - Historique interactions
   - Assets crees
   - Prochaines actions

2. **FICHE_RECHERCHE.md** - Generee automatiquement avec:
   - Recherche web
   - 10 features automatisables
   - Script appel + Email

## Categorisation Automatique

Le manifest detecte automatiquement le type de fichier:

| Pattern | Type | Icone |
|---------|------|-------|
| `*landing*`, `index.html` | site | 🌐 |
| `*dashboard*`, `*demo*.html` | dash | 📊 |
| `*workflow*`, `*n8n*`, `*.json` | wf | ⚡ |
| Autres | doc | 📄 |

## Commandes Utiles

```bash
# Generer/actualiser le manifest des assets
./scripts/generate-assets-manifest.sh

# Generer une fiche recherche pour un prospect
./scripts/generate-prospect-fiche.sh "Nom Entreprise" "Secteur"

# Creer un nouveau dossier prospect structure
./scripts/create-prospect-folder.sh "Nom Entreprise"
```
