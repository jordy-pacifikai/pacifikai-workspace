# n8n Workflow Builder

## Purpose
Framework pour construire des workflows n8n de haute qualité via Claude Code et le serveur MCP n8n.

---

## Quick Reference

| Élément | Valeur |
|---------|--------|
| n8n URL | http://localhost:5679 |
| n8n Cloud | https://n8n.srv1140766.hstgr.cloud |
| MCP Server | n8n-mcp |
| Logs | ~/Library/Logs/Claude/mcp-server-n8n.log |

---

## Available Integrations

| Integration | Purpose |
|------------|---------|
| Claude API | AI content generation, analysis |
| Airtable | Data management, records |
| Publer | Social media publishing |
| Fal.ai | AI image generation |
| HTTP Request | External API calls |
| Schedule Trigger | Cron-based automation |
| Telegram | Bot notifications |
| Webhook | Real-time triggers |

---

## Workflow Types

| Type | Pattern | Use Case |
|------|---------|----------|
| AI-Powered | Trigger → AI → Action | Content generation, chatbots |
| Data Automation | Schedule → Read → Transform → Update | Sync, reports |
| General-Purpose | Webhook → Validate → Process → Response | APIs, integrations |

---

## Best Practices Summary

### Design
- Clear trigger conditions
- Descriptive node names
- Error handling with IF nodes
- Single responsibility per workflow

### Performance
- Use "Split in Batches" for large datasets
- Conditional execution to skip unnecessary nodes
- Pagination for large API responses

### Security
- Use n8n credential manager (never hardcode)
- Validate all external inputs
- No sensitive data in error messages

---

## Common Commands

```bash
# Health check
curl -s http://localhost:5679/healthz

# View logs
tail -f ~/Library/Logs/Claude/mcp-server-n8n.log

# Docker status
docker ps --filter "name=mcp"
```

---

## n8n Skills Disponibles

7 skills spécialisés dans `/n8n-skills/skills/`:
- `n8n-code-javascript` - Code JavaScript dans n8n
- `n8n-code-python` - Code Python dans n8n
- `n8n-expression-syntax` - Syntaxe expressions {{}}
- `n8n-node-configuration` - Configuration de nodes
- `n8n-validation-expert` - Validation de workflows
- `n8n-workflow-patterns` - Patterns de workflows
- `n8n-mcp-tools-expert` - Outils MCP

---

## Documentation Détaillée

| Sujet | Fichier |
|-------|---------|
| Workflow Patterns | [docs/WORKFLOW_PATTERNS.md](docs/WORKFLOW_PATTERNS.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Credentials Setup | [docs/CREDENTIALS.md](docs/CREDENTIALS.md) |
| n8n Official Docs | https://docs.n8n.io/ |
| MCP n8n Repo | https://github.com/czlonkowski/n8n-mcp |

---

## Quick Start

1. **Access n8n:** http://localhost:5679
2. **Import Templates:** Workflow JSONs from `~/Desktop/Bureau/workflows-haute-valeur 2/`
3. **Configure Credentials:** Set up API keys in n8n
4. **Test:** Run with sample data
5. **Activate:** Enable when ready

---

**Dernière MAJ**: 2026-01-21
