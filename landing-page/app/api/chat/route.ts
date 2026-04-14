const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
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

const TOOLS_OPENAI = TOOLS.map(t => ({
  type: 'function',
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema
  }
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentBlock {
  type: 'text' | 'tool_use';
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface LLMResult {
  content?: ContentBlock[];
  error?: string;
}

interface ToolCall {
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
      tool_calls?: ToolCall[];
    };
  }>;
  error?: { message?: string };
}

// ─── Supabase helper ──────────────────────────────────────────────────────────

async function supabaseRequest(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<unknown> {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const opts: RequestInit = {
    method,
    headers: {
      apikey: SUPABASE_KEY ?? '',
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...headers
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (method === 'GET') return resp.json();
  return resp;
}

async function upsertProspect(sessionId: string, pageUrl?: string): Promise<string> {
  try {
    const isCampaign = pageUrl && (pageUrl.includes('offre-site-web') || pageUrl.includes('utm_campaign=site-web'));
    const source = isCampaign ? 'campagne-site-web' : 'landing-page';
    await supabaseRequest(
      'POST',
      'messenger_prospects',
      {
        sender_id: sessionId,
        last_contact_at: new Date().toISOString(),
        temperature: 'cold',
        conversation_stage: 'discovery',
        source
      },
      { Prefer: 'resolution=merge-duplicates,return=minimal' }
    );
    return source;
  } catch (err) {
    console.error('[upsertProspect] Supabase error:', (err as Error)?.message);
    return 'landing-page';
  }
}

async function getHistory(sessionId: string): Promise<Message[]> {
  try {
    const messages = await supabaseRequest(
      'GET',
      `messenger_messages?sender_id=eq.${sessionId}&select=role,content,created_at&order=created_at.desc&limit=20`
    ) as Array<{ role: string; content: string }>;
    if (!Array.isArray(messages)) return [];
    return messages.reverse().map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
  } catch (err) {
    console.error('[getHistory] Supabase error:', (err as Error)?.message);
    return [];
  }
}

// ─── LLM helpers ──────────────────────────────────────────────────────────────

function parseOpenAIResponse(data: OpenAIResponse): LLMResult {
  const choice = data.choices?.[0]?.message;
  if (!choice) return { error: 'no_choice' };
  const content: ContentBlock[] = [];
  if (choice.content) content.push({ type: 'text', text: choice.content });
  if (choice.tool_calls) {
    for (const tc of choice.tool_calls) {
      content.push({
        type: 'tool_use',
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>
      });
    }
  }
  return { content };
}

async function callGemini(messages: Message[], systemPrompt: string): Promise<LLMResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        max_tokens: 800,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        tools: TOOLS_OPENAI
      }),
      signal: controller.signal
    });
    const data = await resp.json() as OpenAIResponse;
    if (!resp.ok) {
      console.error('[Gemini] API error:', resp.status, data);
      return { error: data?.error?.message || `HTTP ${resp.status}` };
    }
    return parseOpenAIResponse(data);
  } catch (err) {
    console.error('[Gemini] Error:', (err as Error)?.message);
    return { error: (err as Error)?.message || 'gemini_error' };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(messages: Message[], systemPrompt: string): Promise<LLMResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        tools: TOOLS_OPENAI
      }),
      signal: controller.signal
    });
    const data = await resp.json() as OpenAIResponse;
    if (!resp.ok) {
      console.error('[Groq] API error:', resp.status, data);
      return { error: data?.error?.message || `HTTP ${resp.status}` };
    }
    return parseOpenAIResponse(data);
  } catch (err) {
    console.error('[Groq] Error:', (err as Error)?.message);
    return { error: (err as Error)?.message || 'groq_error' };
  } finally {
    clearTimeout(timeout);
  }
}

async function callDeepSeek(messages: Message[], systemPrompt: string): Promise<LLMResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 800,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        tools: TOOLS_OPENAI
      }),
      signal: controller.signal
    });
    const data = await resp.json() as OpenAIResponse;
    if (!resp.ok) {
      console.error('[DeepSeek] API error:', resp.status, data);
      return { error: data?.error?.message || `HTTP ${resp.status}` };
    }
    return parseOpenAIResponse(data);
  } catch (err) {
    console.error('[DeepSeek] Error:', (err as Error)?.message);
    return { error: (err as Error)?.message || 'deepseek_error' };
  } finally {
    clearTimeout(timeout);
  }
}

async function callLLM(messages: Message[], systemPrompt: string): Promise<LLMResult> {
  // 1. Primary: Gemini 2.5 Flash (free tier — 250 req/jour)
  if (GEMINI_API_KEY) {
    const result = await callGemini(messages, systemPrompt);
    if (!result.error) return result;
    console.warn('[Fallback] Gemini failed, trying Cerebras...', result.error);
  }
  // 2. Fallback: Groq Llama 3.3 70B (free tier — 500K tok/jour)
  if (GROQ_API_KEY) {
    const result = await callGroq(messages, systemPrompt);
    if (!result.error) return result;
    console.warn('[Fallback] Groq failed, trying DeepSeek...', result.error);
  }
  // 3. Last resort: DeepSeek V3 (paid — $0.14/M)
  if (DEEPSEEK_API_KEY) {
    const result = await callDeepSeek(messages, systemPrompt);
    if (!result.error) return result;
    console.error('[Fallback] All 3 providers failed:', result.error);
    notifyTelegram(['MANA DOWN — Gemini + Groq + DeepSeek en erreur'], 'CRITICAL').catch(() => {});
    return result;
  }
  return { error: 'no_api_key_configured' };
}

// ─── Supabase ops ─────────────────────────────────────────────────────────────

async function saveMessages(sessionId: string, userMsg: string, botMsg: string): Promise<void> {
  try {
    await supabaseRequest(
      'POST',
      'messenger_messages',
      [
        { sender_id: sessionId, role: 'user', content: userMsg, read: false },
        { sender_id: sessionId, role: 'assistant', content: botMsg, read: true }
      ],
      { Prefer: 'return=minimal' }
    );
  } catch (err) {
    console.error('[saveMessages] Supabase error:', (err as Error)?.message);
  }
}

interface CrmResult {
  action: string;
  fields?: string[];
  value?: string;
  title?: string;
}

async function executeCrmActions(sessionId: string, toolUseBlocks: ContentBlock[]): Promise<CrmResult[]> {
  const results: CrmResult[] = [];
  for (const tool of toolUseBlocks) {
    if (!tool.name || !ALLOWED_TOOLS.includes(tool.name)) {
      console.warn('[CRM] Unknown tool ignored:', tool.name);
      continue;
    }
    const input = tool.input as Record<string, unknown>;
    try {
      if (tool.name === 'update_prospect') {
        const updates = { ...input, last_contact_at: new Date().toISOString() };
        await supabaseRequest(
          'PATCH',
          `messenger_prospects?sender_id=eq.${sessionId}`,
          updates,
          { Prefer: 'return=minimal' }
        );
        results.push({ action: 'update_prospect', fields: Object.keys(updates) });
      } else if (tool.name === 'set_temperature') {
        await supabaseRequest(
          'PATCH',
          `messenger_prospects?sender_id=eq.${sessionId}`,
          { temperature: input.temperature, last_contact_at: new Date().toISOString() },
          { Prefer: 'return=minimal' }
        );
        results.push({ action: 'set_temperature', value: input.temperature as string });
      } else if (tool.name === 'create_task') {
        await supabaseRequest(
          'POST',
          'crm_tasks',
          {
            prospect_sender_id: sessionId,
            prospect_name: 'Visiteur Landing Page',
            type: input.type,
            title: input.title,
            description: input.description || '',
            priority: input.priority || 'medium'
          },
          { Prefer: 'return=minimal' }
        );
        results.push({ action: 'create_task', title: input.title as string });
      }
    } catch (err) {
      console.error(`[CRM] ${tool.name} error:`, (err as Error)?.message);
    }
  }
  return results;
}

async function notifyTelegram(taskTitles: string[], temperature?: string): Promise<void> {
  try {
    const text = `NOUVELLE TACHE MANA (Landing Page)\n\nTache: ${taskTitles.join(', ')}\nTemperature: ${temperature || 'inchangee'}\n\nSource: pacifikai.com`;
    const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
    if (!resp.ok) console.error('[Telegram] Notify failed:', resp.status, await resp.text());
  } catch (err) {
    console.error('[Telegram] Notify error:', (err as Error)?.message);
  }
}

async function checkDedup(sessionId: string, message: string): Promise<boolean> {
  try {
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const existing = await supabaseRequest(
      'GET',
      `messenger_messages?sender_id=eq.${sessionId}&role=eq.user&content=eq.${encodeURIComponent(message)}&created_at=gt.${fiveSecondsAgo}&select=id&limit=1`
    ) as Array<{ id: string }>;
    return Array.isArray(existing) && existing.length > 0;
  } catch {
    return false;
  }
}

// ─── NEXUS Inbox push (real-time) ─────────────────────────────────────────────

const NEXUS_INBOX_URL = process.env.NEXUS_URL ?? 'https://nexus.pacifikai.com';

async function pushToNexusInbox(senderId: string, userMsg: string, botMsg: string): Promise<void> {
  try {
    // Find or create conversation in NEXUS
    const convRes = await fetch(`${NEXUS_INBOX_URL}/api/inbox/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'mana',
        external_id: senderId,
        contact_name: null,
        nexus_project_id: 'pacifikai',
      }),
    });

    let convId: string | null = null;
    if (convRes.ok) {
      const conv = await convRes.json();
      convId = conv.id;
    } else {
      // Conversation may already exist — fetch it
      const listRes = await fetch(
        `${NEXUS_INBOX_URL}/api/inbox/conversations?channel=mana&search=${senderId}`
      );
      if (listRes.ok) {
        const list = await listRes.json();
        convId = list?.[0]?.id ?? null;
      }
    }

    if (!convId) return;

    // Push user message
    await fetch(`${NEXUS_INBOX_URL}/api/inbox/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: convId,
        body: userMsg,
        content_type: 'text',
        direction: 'incoming',
      }),
    });

    // Push bot response
    await fetch(`${NEXUS_INBOX_URL}/api/inbox/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: convId,
        body: botMsg,
        content_type: 'text',
      }),
    });
  } catch (err) {
    console.error('[NEXUS push] Error:', (err as Error)?.message);
  }
}

// ─── CORS helper ──────────────────────────────────────────────────────────────

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  return new Response(null, { status: 200, headers: corsHeaders(origin) });
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    const body = await request.json() as { message?: string; session_id?: string; page_url?: string };
    const { message, session_id, page_url } = body;

    if (!message || !session_id) {
      return Response.json({ error: 'message and session_id required' }, { status: 400, headers });
    }

    // Deduplication via Supabase (works across serverless instances)
    const isDuplicate = await checkDedup(session_id, message);
    if (isDuplicate) {
      console.log(`[Chat] Duplicate message rejected: ${session_id}`);
      return Response.json({ success: true, response: null, session_id, deduplicated: true }, { headers });
    }

    // 1. Upsert prospect
    await upsertProspect(session_id, page_url);

    // 2. Get conversation history
    const history = await getHistory(session_id);
    const messages: Message[] = [...history, { role: 'user', content: message }];

    // 2b. Campaign context — inject into system prompt (not messages) to avoid alternation issues
    let systemPrompt = SYSTEM_PROMPT;
    if (page_url && page_url.includes('offre-site-web')) {
      systemPrompt += '\n\nCONTEXTE: Ce visiteur vient de la page offre-site-web. Il cherche probablement un site internet. Qualifie-le pour la campagne Site Web Pro a 100 000 F.';
    }

    // 3. Call LLM with multi-provider fallback (25s timeout)
    const claudeResponse = await callLLM(messages, systemPrompt);
    if (claudeResponse.error) {
      return Response.json(
        {
          success: false,
          response: "Desole, petit souci technique. Ecris a contact@pacifikai.com en attendant !",
          session_id
        },
        { headers }
      );
    }
    const content = claudeResponse.content ?? [];

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

    // 5b. Push to NEXUS Inbox (fire-and-forget, non-blocking)
    pushToNexusInbox(session_id, message, responseText).catch(() => {});

    // 6. Execute CRM actions (with tool whitelist validation)
    if (toolUseBlocks.length > 0) {
      const results = await executeCrmActions(session_id, toolUseBlocks);

      // 7. Notify Telegram if task created
      const taskResults = results.filter(r => r.action === 'create_task');
      if (taskResults.length > 0) {
        const tempResult = results.find(r => r.action === 'set_temperature');
        await notifyTelegram(
          taskResults.map(r => r.title ?? ''),
          tempResult?.value
        );
      }
    }

    return Response.json({ success: true, response: responseText, session_id }, { headers });
  } catch (error) {
    console.error('Chat API error:', (error as Error)?.message || error);
    let session_id: string | undefined;
    try {
      // Best-effort — body already consumed, fallback to undefined
    } catch { /* ignore */ }
    return Response.json(
      {
        success: false,
        response: "Desole, petit souci technique. Ecris a contact@pacifikai.com !",
        session_id
      },
      { headers }
    );
  }
}
