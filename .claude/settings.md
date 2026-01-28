# Claude Code - Configuration Environnement

## Optimisation des Outils (MCP)

```bash
export ENABLE_TOOL_SEARCH=auto:5
```

---

## Budget de Réflexion

```bash
export MAX_THINKING_TOKENS=10000
```

---

## Gestion de Session

### Seuil 60k tokens
1. **Résumer**: "Résume ce qu'on a fait dans todo_session.md"
2. **Nettoyer**: `/clear`
3. **Reprendre**: "Lis todo_session.md et continuons"

### Commandes Utiles
| Commande | Usage |
|----------|-------|
| `/compact` | Compresse l'historique |
| `/clear` | Efface le contexte |
| `/cost` | Consommation actuelle |

---

## Sous-Agents

| Agent | Modèle | Usage |
|-------|--------|-------|
| `quick-reviewer` | Haiku | Linting, style, validation |

**Invocation**: "Utilise quick-reviewer pour vérifier..."
