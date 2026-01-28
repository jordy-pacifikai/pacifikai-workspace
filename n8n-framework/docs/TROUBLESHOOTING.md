# n8n Troubleshooting Guide

## MCP Server Connection

### Issue: MCP server not connecting

**Steps:**
1. Check Docker container status: `docker ps`
2. Verify image is available: `docker images | grep mcp/n8n`
3. Check logs: `tail -f ~/Library/Logs/Claude/mcp-server-n8n.log`
4. Restart MCP gateway: `docker mcp gateway run`

### Issue: Port conflicts

**Steps:**
1. Verify n8n on port 5679: `lsof -i :5679`
2. Verify MCP server on port 3000: `lsof -i :3000`

---

## Workflow Execution

### Issue: Workflow fails to execute

**Steps:**
1. Check credential configuration in workflow
2. Validate node connections (ensure all required inputs connected)
3. Review execution logs in n8n UI
4. Test individual nodes in isolation

### Issue: Credential validation fails

**Steps:**
1. Re-authenticate credentials in n8n settings
2. Verify API keys are current and valid
3. Check credential permissions and scopes

---

## Common Node Errors

### HTTP Request Node
- Verify URL format and endpoint availability
- Check authentication headers
- Validate request body JSON format

### Airtable Node
- Confirm Base ID and Table names are correct
- Check field names match exactly (case-sensitive)
- Verify API token has required permissions

### Claude API Node
- Ensure API key is valid and has credits
- Check prompt format and parameters
- Verify model selection (e.g., claude-3-sonnet)

### Schedule Trigger
- Validate cron expression syntax
- Check timezone settings
- Ensure workflow is activated

---

## Quick Diagnostics

```bash
# Check n8n is running
curl -s http://localhost:5679/healthz

# Check MCP server logs
tail -50 ~/Library/Logs/Claude/mcp-server-n8n.log

# List running containers
docker ps --filter "name=mcp"

# Check port usage
lsof -i :5679 -i :3000
```
