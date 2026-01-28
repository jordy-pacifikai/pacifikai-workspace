# Instructions Claude - PACIFIK'AI

> Voir [MASTER.md](MASTER.md) pour le contexte complet.

---

## Chargement Mémoire

### Au début de chaque session

```
1. Lis MASTER.md (contexte projet)
2. Lis MEMORY.md (index clients + patterns techniques)
3. Si travail sur un client spécifique:
   → Lis clients/{nom-client}/MEMORY.md
```

### Structure mémoire

```
PACIFIK'AI/
├── MEMORY.md .................. Index léger + patterns partagés (~150 lignes)
├── clients/
│   ├── air-tahiti-nui/
│   │   └── MEMORY.md .......... Tout ATN (workflows, Airtable, tests)
│   ├── air-tahiti/
│   │   └── MEMORY.md .......... Tout AT (workflows, Airtable, tests)
│   └── _template-client/
│       └── MEMORY.md .......... Template nouveau client
```

### Avant `/compact` ou `/clear`

- Sauvegarder les infos importantes dans le MEMORY.md approprié (global ou client)

---

## Résumé Projet

**PACIFIK'AI** = Agence d'automatisation IA & consulting pour entreprises

### Offres
- **Consulting**: Audit des processus + recommandations
- **Automatisation**: Workflows n8n sur mesure
- **Formation**: Accompagnement équipes

---

## Fichiers Clés

| Fichier | Contenu |
|---------|---------|
| `MASTER.md` | Point d'entrée unique |
| `MEMORY.md` | Index clients + patterns techniques |
| `clients/{client}/MEMORY.md` | Détails par client |

---

## Règles de Communication

1. **Tutoiement** - Toujours (sauf emails clients formels)
2. **Ton professionnel** - Orienté résultats
3. **Focus ROI** - Quantifier les gains pour les clients

---

## Gestion de Session

- Seuil 60k tokens → `/compact` ou `/clear`
- Sous-agent Haiku dispo: `quick-reviewer`

---

**Dernière MAJ**: 2026-01-26
