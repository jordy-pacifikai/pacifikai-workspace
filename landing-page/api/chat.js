const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1220940474';

const ALLOWED_ORIGINS = [
  'https://pacifikai.com',
  'https://www.pacifikai.com',
  'https://landing-page-jordybanks-projects.vercel.app'
];

const SYSTEM_PROMPT = `Tu es MANA, l'assistant IA de PACIFIK'AI, agence de solutions IA en Polynesie francaise.

Tu parles a un visiteur qui te contacte (via le site pacifikai.com, Messenger, ou autre canal). Ton role:
1. Accueille chaleureusement si c'est le debut de la conversation
2. Le nom et l'email du visiteur sont parfois deja collectes par un formulaire. Si le visiteur t'envoie son nom/email, enregistre-les avec update_prospect et remercie brievement, puis enchaine sur ses besoins.
3. Comprends leurs besoins : automatisation, application web/mobile, site web, chatbot, IA en general
4. Qualifie le prospect (secteur, taille, budget, urgence)
5. Reponds aux questions sur les services PACIFIK'AI
6. Des que tu apprends quelque chose sur le prospect, utilise update_prospect immediatement

PACIFIK'AI:
- Equipe basee a Tahiti, Polynesie francaise (contact@pacifikai.com)
- Services: Chatbots & Agents IA, Automatisation de workflows, Applications web & mobile (dashboards, portails clients, apps metier), Landing pages & sites web, Integrations API, Extraction de documents, Conseil & Formation IA
- On travaille avec des entreprises de tous secteurs en Polynesie francaise : tourisme, commerce, sante, services, etc.

APPROCHE:
- Pose des questions ouvertes pour comprendre le besoin reel ('Tu geres ca comment aujourd'hui ?', 'T'as deja un site ou une app ?', 'C'est quoi ton plus gros casse-tete au quotidien ?')
- Ne presuppose PAS que le visiteur cherche de l'automatisation — il peut vouloir un site, une app, un chatbot, ou juste un conseil
- Propose la solution la plus adaptee parmi toute la gamme PACIFIK'AI

REGLES:
- Tutoie TOUJOURS
- Reponses COURTES (2-4 phrases max)
- Chaleureux mais professionnel
- JAMAIS de prix precis SAUF pour l'offre "Site Web Pro a 100 000 XPF" ci-dessous
- JAMAIS mentionner le prenom du fondateur. Dis toujours 'notre equipe' ou 'on' — jamais 'Jordy'
- JAMAIS inventer des noms de clients, des temoignages, ou des references. On ne cite PAS de noms d'entreprises clientes.
- 1-2 emojis max par message

REGLES DE CONTACT — TRES IMPORTANT:
- JAMAIS proposer d'appel telephonique, de rappel, ou de RDV telephonique
- JAMAIS dire "on va t'appeler", "Jordy va te rappeler", "un appel de 15 min", "de vive voix"
- JAMAIS demander le numero de telephone du prospect
- Le SEUL canal de contact : ce chat (Messenger) ou email contact@pacifikai.com
- Si le prospect demande un appel → reponds "On peut tout gerer par message ou email, c'est plus rapide pour toi comme pour nous !"
- Si le prospect donne son numero spontanement → enregistre-le avec update_prospect mais ne promets PAS de rappel

REGLES DE FORMATAGE — TRES IMPORTANT:
- JAMAIS de markdown : pas de **gras**, pas de _italique_, pas de # titres, pas de - listes markdown
- Ecris en TEXTE BRUT uniquement — Messenger n'affiche PAS le markdown, ca montre les asterisques en brut
- Pour structurer : utilise des emojis en debut de ligne (✅, 🔹, ➡️) au lieu de tirets ou asterisques
- Pour mettre en valeur : utilise les MAJUSCULES sur 1-2 mots cles, pas le gras markdown

REGLE ABSOLUE SUR LES OUTILS:
Tu DOIS TOUJOURS ecrire ta reponse texte au visiteur AVANT d'utiliser les outils CRM.
Le visiteur DOIT recevoir un message. Les outils sont silencieux et invisibles.
Structure OBLIGATOIRE: 1) D'abord ton texte de reponse 2) Ensuite les outils
Ne JAMAIS envoyer que des outils sans texte.

OUTILS CRM (utilise-les NATURELLEMENT):
- update_prospect: des que tu apprends quelque chose (entreprise, email, nom, secteur, besoin...)
- set_temperature: quand tu detectes un signal (cold=curieux, warm=interesse, hot=veut agir)
- create_task: quand le visiteur veut avancer (devis, demo, etc.)

CAMPAGNE EN COURS — "Site Web Pro a 100 000 XPF" :
Tu CONNAIS cette offre. Elle existe. Voici les details EXACTS :
- Prix : 100 000 XPF (cent mille francs)
- Offre limitee, 50 places seulement
- Inclus : design premium sur-mesure, jusqu'a 5 pages, responsive mobile, SEO, formulaire contact, support 3 mois, 1 revision, code source inclus
- Nom de domaine : inclus la 1ere annee
- Hebergement : inclus sans frais supplementaires
- Livraison en 7 JOURS (pas 5)
- Acompte : 50 000 XPF a la commande, solde a la livraison
- Page de l'offre : pacifikai.com/offre-site-web

DETECTION CAMPAGNE — REGLE CRITIQUE :
- Si le visiteur mentionne "100K", "100 000", "site web", "site internet", "page web", "vitrine", "landing page", "creer un site", "pub", "publicite", "offre", ou s'il vient de la page offre-site-web → tu DOIS mentionner l'offre "Site Web Pro a 100 000 XPF" avec les details ci-dessus. Ne dis JAMAIS que tu ne connais pas cette offre.
- NE force PAS l'offre si le visiteur parle d'autre chose (chatbot, automatisation, app mobile, etc.)

CLOSING — QUAND LE PROSPECT EST CHAUD:
- Quand le prospect dit qu'il veut avancer, qu'il est interesse, qu'il veut commencer → passe en mode closing
- Demande son EMAIL pour lui envoyer les details et le devis
- Dis : "Pour avancer, envoie-moi ton email et on t'envoie tout ca !"
- JAMAIS proposer d'appel. Toujours diriger vers email ou ce chat.
- Si le prospect a deja donne son email → dis "Super, on te prepare un devis et on te l'envoie par email !"

QUALIFICATION SITE WEB (poser 1-2 questions a la fois, naturellement) :
1. Type de site (vitrine, e-commerce, reservation, portfolio, blog...)
2. Secteur d'activite / type d'entreprise
3. Nombre de pages souhaitees
4. Contenu existant (logo, textes, photos, charte graphique)
5. Site actuel ? (URL si oui)
6. Deadline souhaitee

Utilise update_prospect avec les champs site_type, site_pages_count, existing_content, existing_site_url, project_deadline, project_notes pour stocker ces infos.`;

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
        conversation_stage: { type: 'string', enum: ['discovery', 'qualification', 'proposal', 'negotiation', 'won', 'lost'] },
        campaign_source: { type: 'string', description: 'Source campagne (campagne-site-web, facebook-ads, etc.)' },
        site_type: { type: 'string', description: 'Type de site souhaite (vitrine, e-commerce, booking, portfolio, blog)' },
        site_pages_count: { type: 'string', description: 'Nombre de pages souhaitees' },
        existing_content: { type: 'string', description: 'Contenu existant: logo, textes, photos, charte graphique' },
        existing_site_url: { type: 'string', description: 'URL du site actuel si existant' },
        project_deadline: { type: 'string', description: 'Deadline souhaitee pour le projet' },
        project_notes: { type: 'string', description: 'Notes supplementaires sur le projet' }
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
    description: 'Cree une tache de suivi pour l equipe.',
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

const ALLOWED_TOOLS = ['update_prospect', 'set_temperature', 'create_task'];

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

async function upsertProspect(sessionId, pageUrl) {
  try {
    const isCampaign = pageUrl && (pageUrl.includes('offre-site-web') || pageUrl.includes('utm_campaign=site-web'));
    const source = isCampaign ? 'campagne-site-web' : 'landing-page';
    await supabaseRequest('POST', 'messenger_prospects', {
      sender_id: sessionId,
      last_contact_at: new Date().toISOString(),
      temperature: 'cold',
      conversation_stage: 'discovery',
      source
    }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' });
    return source;
  } catch (err) {
    console.error('[upsertProspect] Supabase error:', err?.message);
    return 'landing-page';
  }
}

async function getHistory(sessionId) {
  try {
    const messages = await supabaseRequest('GET',
      `messenger_messages?sender_id=eq.${sessionId}&select=role,content,created_at&order=created_at.desc&limit=20`
    );
    if (!Array.isArray(messages)) return [];
    return messages.reverse().map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
  } catch (err) {
    console.error('[getHistory] Supabase error:', err?.message);
    return [];
  }
}

async function callClaude(messages, systemPrompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: systemPrompt,
        tools: TOOLS,
        messages
      }),
      signal: controller.signal
    });
    const data = await resp.json();
    if (!resp.ok || data.type === 'error') {
      console.error('Claude API error:', resp.status, data);
      return { error: data?.error?.type || `HTTP ${resp.status}` };
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Claude API timeout after 25s');
      return { error: 'timeout' };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function saveMessages(sessionId, userMsg, botMsg) {
  try {
    await supabaseRequest('POST', 'messenger_messages', [
      { sender_id: sessionId, role: 'user', content: userMsg, read: false },
      { sender_id: sessionId, role: 'assistant', content: botMsg, read: true }
    ], { 'Prefer': 'return=minimal' });
  } catch (err) {
    console.error('[saveMessages] Supabase error:', err?.message);
  }
}

async function executeCrmActions(sessionId, toolUseBlocks) {
  const results = [];
  for (const tool of toolUseBlocks) {
    if (!ALLOWED_TOOLS.includes(tool.name)) {
      console.warn('[CRM] Unknown tool ignored:', tool.name);
      continue;
    }
    try {
      if (tool.name === 'update_prospect') {
        const updates = { ...tool.input, last_contact_at: new Date().toISOString() };
        await supabaseRequest('PATCH',
          `messenger_prospects?sender_id=eq.${sessionId}`,
          updates, { 'Prefer': 'return=minimal' }
        );
        results.push({ action: 'update_prospect', fields: Object.keys(updates) });
      } else if (tool.name === 'set_temperature') {
        await supabaseRequest('PATCH',
          `messenger_prospects?sender_id=eq.${sessionId}`,
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
    } catch (err) {
      console.error(`[CRM] ${tool.name} error:`, err?.message);
    }
  }
  return results;
}

async function notifyTelegram(taskTitles, temperature) {
  try {
    const text = `NOUVELLE TACHE MANA (Landing Page)\n\nTache: ${taskTitles.join(', ')}\nTemperature: ${temperature || 'inchangee'}\n\nSource: pacifikai.com`;
    const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
    if (!resp.ok) console.error('[Telegram] Notify failed:', resp.status, await resp.text());
  } catch (err) {
    console.error('[Telegram] Notify error:', err?.message);
  }
}

async function checkDedup(sessionId, message) {
  try {
    const key = `${sessionId}:${message.substring(0, 100)}`;
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const existing = await supabaseRequest('GET',
      `messenger_messages?sender_id=eq.${sessionId}&role=eq.user&content=eq.${encodeURIComponent(message)}&created_at=gt.${fiveSecondsAgo}&select=id&limit=1`
    );
    return Array.isArray(existing) && existing.length > 0;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS — restrict to known origins
  const origin = req.headers.origin;
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, session_id, page_url } = req.body;
    if (!message || !session_id) {
      return res.status(400).json({ error: 'message and session_id required' });
    }

    // Deduplication via Supabase (works across serverless instances)
    const isDuplicate = await checkDedup(session_id, message);
    if (isDuplicate) {
      console.log(`[Chat] Duplicate message rejected: ${session_id}`);
      return res.status(200).json({ success: true, response: null, session_id, deduplicated: true });
    }

    // 1. Upsert prospect
    const source = await upsertProspect(session_id, page_url);

    // 2. Get conversation history
    const history = await getHistory(session_id);
    const messages = [...history, { role: 'user', content: message }];

    // 2b. Campaign context — inject into system prompt (not messages) to avoid alternation issues
    let systemPrompt = SYSTEM_PROMPT;
    if (page_url && page_url.includes('offre-site-web')) {
      systemPrompt += '\n\nCONTEXTE: Ce visiteur vient de la page offre-site-web. Il cherche probablement un site internet. Qualifie-le pour la campagne Site Web Pro a 100 000 F.';
    }

    // 3. Call Claude (with 25s timeout)
    const claudeResponse = await callClaude(messages, systemPrompt);
    if (claudeResponse.error) {
      return res.status(200).json({
        success: false,
        response: "Desole, petit souci technique. Ecris a contact@pacifikai.com en attendant !",
        session_id
      });
    }
    const content = claudeResponse.content || [];

    // 4. Parse response
    const textBlocks = content.filter(b => b.type === 'text');
    const toolUseBlocks = content.filter(b => b.type === 'tool_use');

    let responseText = textBlocks.map(b => b.text).join('');

    // Fallback if no text (stop_reason=tool_use)
    if (!responseText && toolUseBlocks.length > 0) {
      const hasTask = toolUseBlocks.some(t => t.name === 'create_task');
      responseText = hasTask
        ? "Merci pour ces infos ! Notre equipe te revient par email tres vite."
        : "Merci pour ces details ! N'hesite pas si tu as d'autres questions.";
    }
    if (!responseText) {
      responseText = "Desole, petit souci technique. Ecris a contact@pacifikai.com en attendant !";
    }
    if (responseText.length > 2000) {
      responseText = responseText.substring(0, 2000) + '...';
    }

    // 5. Save messages (non-blocking — don't crash if Supabase is slow)
    await saveMessages(session_id, message, responseText);

    // 6. Execute CRM actions (with tool whitelist validation)
    if (toolUseBlocks.length > 0) {
      const results = await executeCrmActions(session_id, toolUseBlocks);

      // 7. Notify Telegram if task created (with error handling)
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
    console.error('Chat API error:', error?.message || error);
    return res.status(200).json({
      success: false,
      response: "Desole, petit souci technique. Ecris a contact@pacifikai.com !",
      session_id: req.body?.session_id
    });
  }
}
