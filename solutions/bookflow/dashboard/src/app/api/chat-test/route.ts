import { NextResponse, type NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function getDeepSeekClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: 'https://api.deepseek.com',
  })
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ChatTestPayload {
  businessId: string
  message: string
  sessionId?: string
}

// ─── Tools ──────────────────────────────────────────────────────────────────────

const BOOKBOT_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge_base',
      description: 'Cherche dans la base de connaissances du commerce.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'La question à rechercher' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_services',
      description: 'Liste tous les services disponibles.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Vérifie les créneaux disponibles pour un service à une date.',
      parameters: {
        type: 'object',
        properties: {
          service_name: { type: 'string', description: 'Nom du service' },
          date: { type: 'string', description: 'Date YYYY-MM-DD' },
        },
        required: ['service_name', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Confirme et crée un rendez-vous.',
      parameters: {
        type: 'object',
        properties: {
          service: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
          client_name: { type: 'string' },
        },
        required: ['service', 'date', 'time', 'client_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_appointment',
      description: 'Annule le prochain rendez-vous confirmé.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'transfer_to_human',
      description: 'Transfère la conversation à un humain.',
      parameters: {
        type: 'object',
        properties: { reason: { type: 'string' } },
        required: ['reason'],
      },
    },
  },
]

// ─── Business config loader ─────────────────────────────────────────────────────

interface BizConfig {
  businessId: string
  businessName: string
  services: { name: string; duration: number; price: number }[]
  openingHours: Record<string, string>
  timezone: string
  humanPhone: string
  config: Record<string, unknown>
}

async function loadBizConfig(businessId: string): Promise<BizConfig | null> {
  const { data } = await getSupabase()
    .from('bookbot_businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!data) return null

  const rawServices: unknown[] = data.services ?? []
  const services = rawServices.map((s: unknown) => {
    if (typeof s === 'string') {
      const [name, dur, price] = s.split('|')
      return { name: name ?? 'Service', duration: parseInt(dur ?? '30'), price: parseInt(price ?? '0') }
    }
    return s as { name: string; duration: number; price: number }
  })

  const hours = data.hours ?? data.opening_hours ?? {}
  const humanPhone = data.human_phone ?? data.config?.human_phone ?? data.phone ?? ''

  return {
    businessId: data.id,
    businessName: data.name,
    services,
    openingHours: hours,
    timezone: data.timezone ?? 'Pacific/Tahiti',
    humanPhone,
    config: data.config ?? {},
  }
}

// ─── System prompt ──────────────────────────────────────────────────────────────

function buildSystemPrompt(config: BizConfig): string {
  const servicesList = config.services
    .map(s => `- ${s.name} (${s.duration} min, ${s.price.toLocaleString('fr-FR')} XPF)`)
    .join('\n')

  const dayLabels: Record<string, string> = {
    mon: 'Lundi', tue: 'Mardi', wed: 'Mercredi', thu: 'Jeudi',
    fri: 'Vendredi', sat: 'Samedi', sun: 'Dimanche',
  }

  const hours = Object.entries(config.openingHours)
    .map(([day, h]) => `${dayLabels[day] ?? day}: ${h}`)
    .join('\n')

  const today = new Date().toLocaleDateString('fr-FR', {
    timeZone: config.timezone,
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // Custom tone from config
  const tone = config.config?.tone === 'formel' ? 'formel et professionnel' :
    config.config?.tone === 'decontracte' ? 'décontracté et amical' :
      'chaleureux et accueillant, utilise "Ia ora na" pour saluer'

  // Language preference
  const langMap: Record<string, string> = {
    fr: 'français', en: 'anglais', tah: 'tahitien (reo Māʼohi)',
  }
  const language = langMap[(config.config?.language as string) ?? 'fr'] ?? 'français'

  // Custom greeting
  const greeting = (config.config?.greeting as string) ?? ''
  const greetingInstruction = greeting
    ? `\n- Quand un client te salue, utilise cette formule de bienvenue : "${greeting}"`
    : ''

  return `Tu es l'assistant de ${config.businessName}. Tu parles en ${language}, ton ${tone}. Tu es basé en Polynésie française.
${greetingInstruction}

## Services
${servicesList}

## Horaires
${hours}

## Aujourd'hui
${today} (timezone: ${config.timezone})

## Règles
1. TOUJOURS utiliser \`check_availability\` avant de proposer un créneau
2. TOUJOURS demander confirmation AVANT d'appeler \`book_appointment\`
3. Demander le prénom du client avant de réserver
4. Réponses COURTES (2-4 phrases max)
5. Si question hors compétences → \`transfer_to_human\`
6. Utilise \`search_knowledge_base\` pour les questions spécifiques
7. NE JAMAIS proposer de dates dans le passé
8. Tu DOIS répondre en ${language} — c'est la langue configurée par le commerce`
}

// ─── Tool execution ─────────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  config: BizConfig,
): Promise<string> {
  switch (name) {
    case 'search_knowledge_base': {
      const query = input.query as string
      const { data } = await getSupabase().rpc('bookbot_search', {
        p_business_id: config.businessId,
        p_query: query,
        p_limit: 5,
      })
      const results = Array.isArray(data) ? data : []
      if (results.length === 0) return 'Aucune information trouvée.'
      return results.map((r: { title: string; chunk_text: string }) => `[${r.title}] ${r.chunk_text}`).join('\n\n')
    }

    case 'list_services':
      return config.services
        .map(s => `- ${s.name}: ${s.duration} min, ${s.price.toLocaleString('fr-FR')} XPF`)
        .join('\n')

    case 'check_availability': {
      const serviceName = input.service_name as string
      const date = input.date as string
      const now = new Date()
      const tahiti = new Date(now.toLocaleString('en-US', { timeZone: config.timezone }))
      const todayISO = `${tahiti.getFullYear()}-${String(tahiti.getMonth() + 1).padStart(2, '0')}-${String(tahiti.getDate()).padStart(2, '0')}`

      if (date <= todayISO) return `La date ${date} est dans le passé ou aujourd'hui.`

      const service = config.services.find(s => s.name.toLowerCase() === serviceName.toLowerCase())
      const duration = service?.duration ?? 30

      // Generate slots
      const dayOfWeek = new Date(date).getDay()
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const dayKey = dayKeys[dayOfWeek]
      const hoursStr = (dayKey && config.openingHours[dayKey]) ?? '08:00-17:00'
      if (hoursStr === 'closed') return `Nous sommes fermés le ${date}.`

      const [openStr, closeStr] = hoursStr.split('-')
      const openH = parseInt(openStr?.split(':')[0] ?? '8')
      const closeH = parseInt(closeStr?.split(':')[0] ?? '17')

      const allSlots: string[] = []
      for (let h = openH; h < closeH; h++) {
        if (h === 12) continue
        allSlots.push(`${String(h).padStart(2, '0')}:00`)
        if (duration <= 30) allSlots.push(`${String(h).padStart(2, '0')}:30`)
      }

      // Get existing bookings
      const { data: bookings } = await getSupabase()
        .from('bookbot_appointments')
        .select('time_slot')
        .eq('business_id', config.businessId)
        .eq('appointment_date', date)
        .eq('status', 'confirmed')

      const taken = new Set((bookings ?? []).map((b: { time_slot: string }) => b.time_slot))
      const available = allSlots.filter(s => !taken.has(s))

      if (available.length === 0) return `Aucun créneau disponible le ${date} pour ${serviceName}.`
      return `Créneaux disponibles le ${date} pour ${serviceName} (${duration} min) :\n${available.map(s => `- ${s.replace(':', 'h')}`).join('\n')}`
    }

    case 'book_appointment': {
      const service = input.service as string
      const date = input.date as string
      const time = input.time as string
      const clientName = input.client_name as string

      await getSupabase().from('bookbot_appointments').insert({
        business_id: config.businessId,
        client_name: clientName,
        client_phone: 'test_dashboard',
        service,
        appointment_date: date,
        time_slot: time,
        status: 'confirmed',
        source: 'chatbot',
      })

      return `Rendez-vous confirmé ! ${service} le ${date} à ${time} pour ${clientName}.`
    }

    case 'cancel_appointment':
      return 'Mode test : annulation simulée.'

    case 'transfer_to_human':
      return `Transfert demandé. Raison : ${input.reason}. Numéro : ${config.humanPhone || 'non configuré'}.`

    default:
      return `Outil inconnu: ${name}`
  }
}

// ─── POST handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatTestPayload

  if (!body.businessId || !body.message) {
    return NextResponse.json({ error: 'businessId and message required' }, { status: 400 })
  }

  const config = await loadBizConfig(body.businessId)
  if (!config) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Load or create test session
  const testPhone = `test_${body.sessionId ?? 'default'}`
  const sb = getSupabase()
  const { data: existingSession } = await sb
    .from('bookbot_sessions')
    .select('*')
    .eq('phone', testPhone)
    .eq('business_id', body.businessId)
    .limit(1)
    .single()

  let history: OpenAI.ChatCompletionMessageParam[] = []
  if (existingSession?.context?.messages) {
    history = existingSession.context.messages as OpenAI.ChatCompletionMessageParam[]
  }

  // Add user message
  history.push({ role: 'user', content: body.message })

  // Run DeepSeek agent loop
  const client = getDeepSeekClient()
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(config) },
    ...history,
  ]
  let finalReply = ''
  const toolCalls: { name: string; input: Record<string, unknown>; result: string }[] = []

  for (let i = 0; i < 5; i++) {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1024,
      tools: BOOKBOT_TOOLS,
      messages,
    })

    const choice = response.choices[0]
    if (!choice) break

    const msg = choice.message

    if (choice.finish_reason === 'tool_calls' && msg.tool_calls?.length) {
      // Add assistant message with tool calls
      messages.push(msg)

      // Execute each tool call
      for (const toolCall of msg.tool_calls) {
        if (toolCall.type !== 'function') continue
        const args = JSON.parse(toolCall.function.arguments || '{}')
        const result = await executeTool(toolCall.function.name, args, config)
        messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result })
        toolCalls.push({ name: toolCall.function.name, input: args, result })
      }
    } else {
      finalReply = msg.content ?? ''
      history.push({ role: 'assistant', content: finalReply })
      break
    }
  }

  // Save session (without system prompt — re-injected each time)
  const trimmed = history.slice(-30)
  if (existingSession) {
    await sb
      .from('bookbot_sessions')
      .update({ context: { messages: trimmed }, state: 'active', updated_at: new Date().toISOString() })
      .eq('id', existingSession.id)
  } else {
    await sb.from('bookbot_sessions').insert({
      phone: testPhone,
      business_id: body.businessId,
      state: 'active',
      context: { messages: trimmed },
    })
  }

  return NextResponse.json({
    reply: finalReply || 'Désolé, je n\'ai pas pu traiter ta demande.',
    toolCalls,
  })
}

// ─── DELETE handler — reset session ─────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const businessId = searchParams.get('businessId')
  const sessionId = searchParams.get('sessionId') ?? 'default'

  if (!businessId) {
    return NextResponse.json({ error: 'businessId required' }, { status: 400 })
  }

  await getSupabase()
    .from('bookbot_sessions')
    .delete()
    .eq('phone', `test_${sessionId}`)
    .eq('business_id', businessId)

  return NextResponse.json({ ok: true })
}
