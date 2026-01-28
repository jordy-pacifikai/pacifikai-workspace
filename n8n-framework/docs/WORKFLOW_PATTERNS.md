# n8n Workflow Patterns

## AI-Powered Workflows

**Pattern:** Trigger → Data Fetch → AI Processing → Action

**Key Characteristics:**
- Use Claude API nodes for intelligent content processing
- Implement context-aware decision making
- Handle conversational state for chatbots
- Process and analyze unstructured data

**Common Use Cases:**
- Content generation (captions, articles, social posts)
- Data analysis and insights extraction
- Conversational agents and chatbots
- Content moderation and categorization
- Intelligent routing and decision trees

**Example Structure:**
```
Webhook/Schedule → Fetch Context → Claude API → Process Response → Update Database/Send
```

**Best For:**
- Tasks requiring understanding of context
- Creative content generation
- Complex decision-making
- Natural language processing

---

## Data Automation

**Pattern:** Schedule → Airtable Read → Process → Airtable Update

**Key Characteristics:**
- Scheduled execution (cron expressions)
- Batch processing capabilities
- Data transformation and enrichment
- Synchronization between systems

**Common Use Cases:**
- Auto-publication systems
- Daily data aggregation
- Periodic report generation
- Record synchronization
- Data cleanup and maintenance

**Example Structure:**
```
Schedule Trigger → Airtable (Read) → Filter/Transform → External API → Airtable (Update)
```

**Best For:**
- Recurring business processes
- Data pipeline automation
- Multi-system synchronization
- Scheduled content publishing

---

## General-Purpose Workflows

**Pattern:** Flexible based on requirements

**Key Characteristics:**
- Webhook triggers for real-time processing
- HTTP nodes for API integrations
- IF nodes for conditional logic
- Split in Batches for large datasets
- Code nodes for custom JavaScript logic

**Common Use Cases:**
- API endpoint creation (webhooks)
- Third-party service integration
- Custom business logic
- Event-driven processing
- Data format conversion

**Example Structure:**
```
Webhook → Validate Input → IF (Conditional) → Multiple Actions → Response
```

**Best For:**
- Real-time event handling
- Custom integration requirements
- Complex conditional logic
- Rapid prototyping

---

## Reference Templates

Templates disponibles dans `~/Desktop/Bureau/workflows-haute-valeur 2/`:

### Auto-Publication (14 nodes)
- **Pattern:** Scheduled Airtable-based publishing
- **Schedule:** 8h, 14h, 19h daily
- **Flow:** Schedule → Airtable Read → Conditional → Publer API
- **Use Case:** Automated social media posting from content database

### Caption Generation (10 nodes)
- **Pattern:** Webhook-triggered AI content creation
- **Flow:** Webhook → Claude API → Airtable Update
- **Use Case:** Real-time caption generation for media files
- **Integration:** Claude API for intelligent caption writing

### Daily Morning Check (35+ nodes)
- **Pattern:** Complex scheduled multi-source aggregation
- **Flow:** Schedule → Multiple Data Sources → Aggregation → Notification
- **Use Case:** Daily routine automation with multiple checks

### AI Content Creation (28 nodes)
- **Pattern:** Multi-step AI generation pipeline
- **Flow:** Trigger → Fal.ai → Processing → Storage
- **Use Case:** Automated content generation with AI models

### Telegram Conversational Agent (30+ nodes)
- **Pattern:** Stateful conversational AI
- **Flow:** Telegram Trigger → State Management → Claude API → Response
- **Use Case:** Interactive chatbot with context awareness
