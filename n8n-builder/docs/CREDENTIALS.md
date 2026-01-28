# n8n Credentials Setup

## Required Credentials

### Claude API
- API key from Anthropic console
- Configure in n8n credentials manager
- Use for AI-powered nodes

### Airtable
- Personal Access Token or API key
- Base ID for each database
- Table names for record operations

### Publer
- Authentication token from Publer dashboard
- Account configuration for posting

### Fal.ai
- API credentials from Fal.ai
- Model-specific parameters

### Custom HTTP Auth
- Bearer tokens, API keys as needed
- Basic auth credentials
- OAuth configurations

---

## Integration Setup Reference

Detailed credential setup available in:
`~/Desktop/Bureau/workflows-haute-valeur 2/README.md`

---

## Security Best Practices

1. **Credential Storage** - Use n8n's credential system (never hardcode)
2. **Input Validation** - Validate all webhook and external inputs
3. **Environment Variables** - Use for sensitive configuration
4. **Access Control** - Leverage n8n's authentication features
5. **Error Messages** - Avoid exposing sensitive data in errors

---

## Current Instance Credentials

| Integration | Status | Notes |
|------------|--------|-------|
| Claude API | Configured | AI content generation |
| Airtable | Configured | HVC database |
| Publer | Configured | Social media posting |
| Fal.ai | Configured | Image generation |
| Telegram | Configured | Bot notifications |
