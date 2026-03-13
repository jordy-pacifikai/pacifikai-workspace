# BookBot WhatsApp — Spec Workflow n8n

> Template générique, duplicable par client. Changer uniquement le noeud "⚙️ Config Business".

---

## Workflow 1 — TEMPLATE BookBot WhatsApp Booking

**Nom dans n8n**: `TEMPLATE — BookBot WhatsApp Booking`
**Trigger**: Webhook POST (Twilio ou Meta Cloud API)

### Architecture

```
[Webhook: Twilio/Meta]
  → [⚙️ Config Business — Set node]
    → [Code: Parse Message WhatsApp]
      → [Filter: Skip si echo/status]
        → [AI Agent: Claude Haiku — Classifier intent]
          ├── "reservation" → [Code: Check dispo] → [HTTP: Réponse WhatsApp créneaux]
          ├── "confirmation" → [Supabase: Créer RDV] → [HTTP: Confirmer RDV]
          ├── "annulation" → [Supabase: Annuler RDV] → [HTTP: Confirmer annulation]
          ├── "faq" → [AI Agent: Répondre FAQ] → [HTTP: Envoyer réponse]
          └── "autre" → [HTTP: Rediriger vers humain]
```

### Noeud 1 — Webhook
- **Type**: `n8n-nodes-base.webhook`
- **Method**: POST
- **Path**: `/bookbot-{{business_slug}}` (ex: `/bookbot-salon-moana`)
- **Response Mode**: Last Node

### Noeud 2 — ⚙️ Config Business (SET — SEUL NOEUD A MODIFIER PAR CLIENT)
- **Type**: `n8n-nodes-base.set`
- **Valeurs**:
  ```json
  {
    "business_name": "Mon Salon",
    "business_id": "uuid-du-client-dans-supabase",
    "business_phone": "+689XXXXXXXX",
    "whatsapp_token": "WHATSAPP_API_TOKEN",
    "whatsapp_phone_id": "PHONE_ID_META",
    "supabase_url": "https://ogsimsfqwibcmotaeevb.supabase.co",
    "supabase_key": "SERVICE_KEY",
    "opening_hours": "Lun-Sam 8h-18h",
    "services": "Coupe homme,Coupe femme,Couleur,Barbe",
    "slot_duration_min": "30",
    "timezone": "Pacific/Tahiti",
    "human_phone": "+689XXXXXXXX"
  }
  ```

### Noeud 3 — Code: Parse Message
- **Type**: `n8n-nodes-base.code`
- **Language**: JavaScript
```javascript
const body = $input.item.json.body || $input.item.json;

// Support Twilio et Meta Cloud API
let from, messageText, messageId;

if (body.From) {
  // Twilio
  from = body.From.replace('whatsapp:', '');
  messageText = body.Body || '';
  messageId = body.MessageSid || '';
} else if (body.entry) {
  // Meta Cloud API
  const entry = body.entry[0];
  const change = entry?.changes?.[0]?.value;
  const msg = change?.messages?.[0];
  from = msg?.from || '';
  messageText = msg?.text?.body || '';
  messageId = msg?.id || '';
}

const config = $('⚙️ Config Business').item.json;

return [{
  json: {
    from,
    message: messageText.trim(),
    messageId,
    business_id: config.business_id,
    business_name: config.business_name,
    whatsapp_token: config.whatsapp_token,
    whatsapp_phone_id: config.whatsapp_phone_id,
    supabase_url: config.supabase_url,
    supabase_key: config.supabase_key,
    opening_hours: config.opening_hours,
    services: config.services,
    slot_duration_min: parseInt(config.slot_duration_min),
    human_phone: config.human_phone,
  }
}];
```

### Noeud 4 — Filter: Skip
- **Type**: `n8n-nodes-base.filter`
- **Condition**: `message` is not empty AND `from` is not empty

### Noeud 5 — AI Agent: Classifier Intent
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **Model**: Claude Haiku (`claude-haiku-4-5-20251001`) — rapide et pas cher
- **System Prompt**:
```
Tu es un classificateur d'intent pour un assistant de réservation WhatsApp.

Business: {{$json.business_name}}
Services: {{$json.services}}
Horaires: {{$json.opening_hours}}

Réponds UNIQUEMENT avec un JSON: {"intent": "X", "details": "..."}

Intents possibles:
- "reservation" : le client veut prendre RDV (ex: "je voudrais un RDV", "vous avez de la place")
- "confirmation" : le client confirme un créneau proposé (ex: "oui", "ok pour mardi 14h", "c'est bon")
- "annulation" : le client veut annuler (ex: "je dois annuler", "je peux pas venir")
- "faq" : question sur les services, prix, horaires, adresse
- "autre" : message hors contexte ou demande complexe

Message du client: {{$json.message}}
```
- **Output Parser**: JSON (intent + details)

### Noeud 6 — Switch: Route par intent
- **Type**: `n8n-nodes-base.switch`
- **4 routes**: reservation / confirmation / annulation / faq → default = "autre"

### Noeud 7a — Branch "reservation": Code Check Dispo
```javascript
const { business_id, services, slot_duration_min, opening_hours } = $input.item.json;

// Générer créneaux disponibles pour les 3 prochains jours
const now = new Date();
const slots = [];
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

for (let d = 1; d <= 3; d++) {
  const date = new Date(now);
  date.setDate(date.getDate() + d);
  if (date.getDay() === 0) continue; // Skip dimanche

  const dayName = days[date.getDay() - 1];
  const dateStr = `${dayName} ${date.getDate()}/${date.getMonth()+1}`;
  slots.push(`${dateStr}: 9h, 10h, 11h, 14h, 15h, 16h`);
}

const serviceList = services.split(',').join(', ');
const response = `Bonjour ! 😊 Je suis votre assistant réservation.\n\nServices disponibles: ${serviceList}\n\nCréneaux disponibles:\n${slots.join('\n')}\n\nQuel jour et quelle heure vous convient ? (ex: "Mardi 10h pour coupe homme")`;

return [{ json: { ...$input.item.json, reply: response } }];
```

### Noeud 7b — Branch "confirmation": Supabase Créer RDV
- **Type**: `n8n-nodes-base.supabase` (ou HTTP Request)
- **Operation**: INSERT dans `bookbot_appointments`
- **Data**:
  ```json
  {
    "business_id": "{{$json.business_id}}",
    "client_phone": "{{$json.from}}",
    "service": "{{$json.details}}",
    "status": "confirmed",
    "source": "whatsapp"
  }
  ```
- **Réponse**: "✅ RDV confirmé ! Vous recevrez un rappel la veille. À bientôt !"

### Noeud 7c — Branch "annulation": Supabase Cancel
- UPDATE `bookbot_appointments` SET status='cancelled' WHERE client_phone = from AND status='confirmed'
- **Réponse**: "RDV annulé. N'hésitez pas à nous recontacter pour reprendre un créneau !"

### Noeud 7d — Branch "faq": AI Agent FAQ
- Répond aux questions sur prix/horaires/adresse via Claude Haiku avec contexte business

### Noeud 7e — Branch "autre": Redirect Humain
- **Réponse**: "Je vais vous mettre en contact avec notre équipe. Un instant..."
- (Optionnel) Notification Telegram à Jordy

### Noeud 8 — HTTP Request: Send WhatsApp (commun)
- **URL**: `https://graph.facebook.com/v19.0/{{$json.whatsapp_phone_id}}/messages`
- **Method**: POST
- **Headers**: `Authorization: Bearer {{$json.whatsapp_token}}`
- **Body**:
  ```json
  {
    "messaging_product": "whatsapp",
    "to": "{{$json.from}}",
    "type": "text",
    "text": { "body": "{{$json.reply}}" }
  }
  ```

---

## Workflow 2 — TEMPLATE BookBot Rappels J-1

**Nom dans n8n**: `TEMPLATE — BookBot WhatsApp Rappels`
**Trigger**: CRON quotidien à 8h (Tahiti time = 18h UTC)

### Architecture
```
[CRON 8h Tahiti]
  → [⚙️ Config Business — Set node]
    → [Supabase: RDV de demain avec status=confirmed et reminder_sent=false]
      → [SplitInBatches: 1 par 1]
        → [HTTP: WhatsApp rappel client]
          → [Supabase: UPDATE reminder_sent=true]
```

### Noeud CRON
- **Type**: `n8n-nodes-base.scheduleTrigger`
- **Rule**: Tous les jours à 08:00 (timezone: Pacific/Tahiti)

### Noeud Supabase: Lire RDV demain
- **URL**: `{{supabase_url}}/rest/v1/bookbot_appointments`
- **Params**: `select=*&business_id=eq.{{business_id}}&appointment_date=eq.{{tomorrow}}&status=eq.confirmed&reminder_sent=eq.false`

### Message Rappel
```
Bonjour {{client_name}} ! 👋
Rappel : vous avez un RDV demain ({{date}}) à {{time_slot}} chez {{business_name}}.
Service : {{service}}

Pour annuler, répondez simplement "annuler".
À demain ! 😊
```

---

## Duplication par client

1. Dupliquer le workflow "TEMPLATE — BookBot WhatsApp Booking"
2. Renommer : "{{Client}} — BookBot WhatsApp Booking"
3. **Modifier UNIQUEMENT le noeud ⚙️ Config Business** (tous les champs)
4. Changer le path du webhook : `/bookbot-{{slug-client}}`
5. Activer le workflow
6. Copier le webhook URL → donner au client / configurer dans Twilio ou Meta

---

## Stack technique

| Composant | Choix | Raison |
|-----------|-------|--------|
| WhatsApp | Twilio (sandbox) → Meta Cloud API (prod) | Twilio = test rapide, Meta = gratuit en prod |
| AI | Claude Haiku | Rapide, pas cher ($0.25/M tokens), suffisant pour classifier |
| DB | Supabase (tables bookbot_*) | Déjà en place, RLS par business_id |
| Hosting | n8n cloud actuel | Déjà payé, pas de surcoût |
| Notifications | HTTP WhatsApp + Telegram Jordy | Simple, no overhead |

---

## Pour tester sans WhatsApp API

Utiliser le webhook URL en POST avec:
```json
{
  "From": "whatsapp:+68989558189",
  "Body": "Bonjour, je voudrais prendre un rendez-vous",
  "MessageSid": "test123"
}
```
