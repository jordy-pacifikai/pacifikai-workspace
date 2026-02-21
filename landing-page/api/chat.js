const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1220940474';

const SYSTEM_PROMPT = `Tu es MANA, l'assistant IA de PACIFIK'AI, agence de solutions IA en Polynesie francaise.

Tu parles au visiteur du site web pacifikai.com. Ton role:
1. Accueille chaleureusement si c'est le debut de la conversation
2. Le nom et l'email du visiteur sont deja collectes par un formulaire avant le chat. Si le visiteur t'envoie son nom/email, enregistre-les avec update_prospect et remercie brievement, puis enchaine sur ses besoins.
3. Comprends leurs besoins : automatisation, application web/mobile, site web, chatbot, IA en general
4. Qualifie le prospect (secteur, taille, budget, urgence)
5. Reponds aux questions sur les services PACIFIK'AI
6. Des que tu apprends quelque chose sur le prospect, utilise update_prospect immediatement

PACIFIK'AI:
- Fondateur: Jordy Banks (jordy@pacifikai.com, +689 89 55 81 89)
- Services: Chatbots & Agents IA, Automatisation de workflows, Applications web & mobile (dashboards, portails clients, apps metier), Landing pages & sites web, Integrations API, Extraction de documents, Conseil & Formation IA
- Clients: Air Tahiti Nui, Intercontinental, banques, PME locales
- Basee a Tahiti, Polynesie francaise

APPROCHE:
- Pose des questions ouvertes pour comprendre le besoin reel ('Tu geres ca comment aujourd'hui ?', 'T'as deja un site ou une app ?', 'C'est quoi ton plus gros casse-tete au quotidien ?')
- Ne presuppose PAS que le visiteur cherche de l'automatisation — il peut vouloir un site, une app, un chatbot, ou juste un conseil
- Propose la solution la plus adaptee parmi toute la gamme PACIFIK'AI

REGLES:
- Tutoie TOUJOURS
- Reponses COURTES (2-4 phrases max)
- Chaleureux mais professionnel
- JAMAIS de prix precis ('ca depend du projet, on en discute avec Jordy')
- 1-2 emojis max par message

REGLE ABSOLUE SUR LES OUTILS:
Tu DOIS TOUJOURS ecrire ta reponse texte au visiteur AVANT d'utiliser les outils CRM.
Le visiteur DOIT recevoir un message. Les outils sont silencieux et invisibles.
Structure OBLIGATOIRE: 1) D'abord ton texte de reponse 2) Ensuite les outils
Ne JAMAIS envoyer que des outils sans texte.

OUTILS CRM (utilise-les NATURELLEMENT):
- update_prospect: des que tu apprends quelque chose (entreprise, email, nom, secteur, besoin...)
- set_temperature: quand tu detectes un signal (cold=curieux, warm=interesse, hot=veut agir/RDV)
- create_task: quand le visiteur demande un appel, un devis, une demo`;

const TOOLS = [
  {
    name: 'update_prospect',
    description: 'Met a jour les infos du prospect.',
    input_schema: {
      type: 'object',
      properties: {
        company: { type: 'string' },
        sector: { type: 'string' },
        role: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        main_problem: { type: 'string' },
        current_solution: { type: 'string' },
        budget_range: { type: 'string' },
        timeline: { type: 'string' },
        decision_maker: { type: 'boolean' },
        conversation_stage: { type: 'string', enum: ['discovery', 'qualification', 'proposal', 'negotiation', 'won', 'lost'] }
      }
    }
  },
  {
    name: 'set_temperature',
    description: 'Ajuste la temperature du prospect.',
    input_schema: {
      type: 'object',
      properties: {
        temperature: { type: 'string', enum: ['cold', 'warm', 'hot'] },
        reason: { type: 'string' }
      },
      required: ['temperature', 'reason']
    }
  },
  {
    name: 'create_task',
    description: 'Cree une tache pour Jordy.',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['call_back', 'send_proposal', 'schedule_demo', 'follow_up', 'other'] },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }
      },
      required: ['type', 'title']
    }
  }
];

async function supabaseRequest(method, path, body, headers = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...headers
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (method === 'GET') return resp.json();
  return resp;
}

async function upsertProspect(sessionId, visitorName) {
  await supabaseRequest('POST', 'messenger_prospects', {
    sender_id: sessionId,
    name: visitorName || '',
    last_contact_at: new Date().toISOString(),
    temperature: 'cold',
    conversation_stage: 'discovery',
    source: 'landing-page'
  }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' });
}

async function getHistory(sessionId) {
  const messages = await supabaseRequest('GET',
    `messenger_messages?sender_id=eq.${sessionId}&select=role,content,created_at&order=created_at.desc&limit=20`
  );
  if (!Array.isArray(messages)) return [];
  return messages.reverse().map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));
}

async function callClaude(messages) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages
    })
  });
  return resp.json();
}

async function saveMessages(sessionId, userMsg, botMsg) {
  await supabaseRequest('POST', 'messenger_messages', [
    { sender_id: sessionId, role: 'user', content: userMsg, read: false },
    { sender_id: sessionId, role: 'assistant', content: botMsg, read: true }
  ], { 'Prefer': 'return=minimal' });
}

async function executeCrmActions(sessionId, toolUseBlocks) {
  const results = [];
  for (const tool of toolUseBlocks) {
    if (tool.name === 'update_prospect') {
      const updates = { ...tool.input, last_contact_at: new Date().toISOString() };
      await supabaseRequest('PATCH',
        `messenger_prospects?sender_id=eq.${sessionId}&source=eq.landing-page`,
        updates, { 'Prefer': 'return=minimal' }
      );
      results.push({ action: 'update_prospect', fields: Object.keys(updates) });
    } else if (tool.name === 'set_temperature') {
      await supabaseRequest('PATCH',
        `messenger_prospects?sender_id=eq.${sessionId}&source=eq.landing-page`,
        { temperature: tool.input.temperature, last_contact_at: new Date().toISOString() },
        { 'Prefer': 'return=minimal' }
      );
      results.push({ action: 'set_temperature', value: tool.input.temperature });
    } else if (tool.name === 'create_task') {
      await supabaseRequest('POST', 'crm_tasks', {
        prospect_sender_id: sessionId,
        prospect_name: 'Visiteur Landing Page',
        type: tool.input.type,
        title: tool.input.title,
        description: tool.input.description || '',
        priority: tool.input.priority || 'medium'
      }, { 'Prefer': 'return=minimal' });
      results.push({ action: 'create_task', title: tool.input.title });
    }
  }
  return results;
}

async function notifyTelegram(taskTitles, temperature) {
  const text = `NOUVELLE TACHE MANA (Landing Page)\n\nTache: ${taskTitles.join(', ')}\nTemperature: ${temperature || 'inchangee'}\n\nSource: pacifikai.com`;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, session_id, page_url } = req.body;
    if (!message || !session_id) {
      return res.status(400).json({ error: 'message and session_id required' });
    }

    // 1. Upsert prospect
    await upsertProspect(session_id);

    // 2. Get conversation history
    const history = await getHistory(session_id);
    const messages = [...history, { role: 'user', content: message }];

    // 3. Call Claude
    const claudeResponse = await callClaude(messages);
    const content = claudeResponse.content || [];

    // 4. Parse response
    const textBlocks = content.filter(b => b.type === 'text');
    const toolUseBlocks = content.filter(b => b.type === 'tool_use');

    let responseText = textBlocks.map(b => b.text).join('');

    // Fallback if no text (stop_reason=tool_use)
    if (!responseText && toolUseBlocks.length > 0) {
      const hasTask = toolUseBlocks.some(t => t.name === 'create_task');
      responseText = hasTask
        ? "Merci pour ces infos ! Je transmets a Jordy, il te recontacte tres vite."
        : "Merci pour ces details ! N'hesite pas si tu as d'autres questions.";
    }
    if (!responseText) {
      responseText = "Desole, petit souci technique. Ecris a jordy@pacifikai.com en attendant !";
    }
    if (responseText.length > 2000) {
      responseText = responseText.substring(0, 2000) + '...';
    }

    // 5. Save messages
    await saveMessages(session_id, message, responseText);

    // 6. Execute CRM actions
    if (toolUseBlocks.length > 0) {
      const results = await executeCrmActions(session_id, toolUseBlocks);

      // 7. Notify Telegram if task created
      const taskResults = results.filter(r => r.action === 'create_task');
      if (taskResults.length > 0) {
        const tempResult = results.find(r => r.action === 'set_temperature');
        await notifyTelegram(
          taskResults.map(r => r.title),
          tempResult?.value
        );
      }
    }

    return res.status(200).json({
      success: true,
      response: responseText,
      session_id
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      success: false,
      response: "Desole, petit souci technique. Ecris a jordy@pacifikai.com !",
      session_id: req.body?.session_id
    });
  }
}
