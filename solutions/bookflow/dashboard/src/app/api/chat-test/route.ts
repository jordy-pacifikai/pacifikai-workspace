import { NextResponse, type NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { createCalendarEvent } from '@/lib/gcal'

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

  const hours = data.hours ?? {}
  const humanPhone = data.config?.human_phone ?? data.phone ?? ''

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
    .map(([day, h]) => {
      let display: string
      if (typeof h === 'string') {
        display = h
      } else if (typeof h === 'object' && h !== null) {
        const obj = h as { open?: string; close?: string; is_open?: boolean; break_start?: string; break_end?: string }
        if (obj.is_open === false) display = 'Fermé'
        else if (obj.break_start && obj.break_end) display = `${obj.open}-${obj.break_start}, ${obj.break_end}-${obj.close}`
        else display = `${obj.open ?? '08:00'}-${obj.close ?? '17:00'}`
      } else {
        display = String(h)
      }
      return `${dayLabels[day] ?? day}: ${display}`
    })
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

  return `Tu es l'assistant de ${config.businessName}. Langue : ${language}. Ton : ${tone}.${greetingInstruction}

## RÈGLE FONDAMENTALE — NE JAMAIS INVENTER
- NE JAMAIS promettre, mentionner ou suggérer quoi que ce soit qui n'est pas dans ce prompt ou dans les résultats des outils
- NE JAMAIS mentionner : appel téléphonique, rappel par téléphone, confirmation par email, SMS, délai de traitement, validation manuelle, devis, ou tout autre processus non décrit ici
- NE JAMAIS improviser des formules qui impliquent une action future ("on vous recontactera", "vous recevrez un appel"...)
- Si tu ne sais pas → \`search_knowledge_base\`. Toujours sans réponse → \`transfer_to_human\`. JAMAIS inventer.

## Services
${servicesList}

## Horaires
${hours}

## Aujourd'hui
${today} (timezone: ${config.timezone})

## Règles OBLIGATOIRES
1. TOUJOURS utiliser \`check_availability\` avant de proposer un créneau — NE JAMAIS inventer de disponibilité
2. TOUJOURS demander confirmation ("C'est bon pour toi ?" ou "Je confirme ?") AVANT d'appeler \`book_appointment\`
3. Client confirme → appelle \`book_appointment\` IMMÉDIATEMENT. NE JAMAIS dire "confirmé" sans avoir appelé l'outil.
4. Demander le prénom du client avant de réserver
5. Réponses COURTES (2-4 phrases max)
6. Question hors compétences → \`transfer_to_human\`
7. Questions spécifiques → \`search_knowledge_base\`
8. NE JAMAIS proposer de dates dans le passé
9. Langue : ${language} — adapte-toi à la langue du client si différente

## SCRIPTS FIXES (utilise exactement ces formules)
- Après \`book_appointment\` réussi : "✅ RDV confirmé !\\n[Service] — [Date lisible] à [Heure]\\nÀ bientôt chez ${config.businessName} !"
- Après annulation réussie : "✅ Ton rendez-vous a bien été annulé. N'hésite pas si tu veux en reprendre un !"
- Après \`transfer_to_human\` : "Je te mets en contact avec l'équipe de ${config.businessName}. À très vite !"
- Question sans réponse : "Je n'ai pas cette information, mais l'équipe de ${config.businessName} pourra t'aider directement."`
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

      // Use getUTCDay() because "YYYY-MM-DD" is parsed as UTC midnight
      const dayOfWeek = new Date(date).getUTCDay()
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const dayKey = dayKeys[dayOfWeek]
      const rawHours = (dayKey && config.openingHours[dayKey]) ?? '08:00-17:00'

      // Normalize hours — can be string "08:00-17:00" or object {open, close, is_open, break_start, break_end}
      let hoursStr: string
      if (typeof rawHours === 'string') {
        hoursStr = rawHours
      } else if (typeof rawHours === 'object' && rawHours !== null) {
        const h = rawHours as { open?: string; close?: string; is_open?: boolean; break_start?: string; break_end?: string }
        if (h.is_open === false) {
          hoursStr = 'closed'
        } else if (h.break_start && h.break_end) {
          hoursStr = `${h.open ?? '08:00'}-${h.break_start},${h.break_end}-${h.close ?? '17:00'}`
        } else {
          hoursStr = `${h.open ?? '08:00'}-${h.close ?? '17:00'}`
        }
      } else {
        hoursStr = '08:00-17:00'
      }

      if (hoursStr === 'closed') return `Nous sommes fermés le ${date}.`

      // Parse multi-range hours (e.g. "08:00-12:00,13:00-17:00")
      const allSlots: string[] = []
      for (const range of hoursStr.split(',')) {
        const [openStr, closeStr] = range.trim().split('-')
        const openParts = (openStr ?? '08:00').split(':')
        const closeParts = (closeStr ?? '17:00').split(':')
        const openMins = parseInt(openParts[0] ?? '8') * 60 + parseInt(openParts[1] ?? '0')
        const closeMins = parseInt(closeParts[0] ?? '17') * 60 + parseInt(closeParts[1] ?? '0')

        for (let mins = openMins; mins + duration <= closeMins; mins += 30) {
          const h = Math.floor(mins / 60)
          const m = mins % 60
          allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
        }
      }

      // Get existing bookings
      const sb = getSupabase()
      const { data: bookings } = await sb
        .from('bookbot_appointments')
        .select('time_slot,end_time')
        .eq('business_id', config.businessId)
        .eq('appointment_date', date)
        .in('status', ['confirmed', 'pending'])

      // Get blocked slots (manual + GCal synced)
      const { data: blockedSlots } = await sb
        .from('bookbot_blocked_slots')
        .select('time_from,time_to,all_day')
        .eq('business_id', config.businessId)
        .eq('date', date)

      // If any blocked slot is all_day, the entire day is blocked
      if (blockedSlots?.some((s: { all_day: boolean }) => s.all_day)) {
        return `Aucun créneau disponible le ${date} pour ${serviceName} (journée bloquée).`
      }

      // Build occupied ranges from bookings
      const occupiedRanges: { start: number; end: number }[] = []
      for (const b of bookings ?? []) {
        const booking = b as { time_slot: unknown; end_time: unknown }
        const tsStr = String(booking.time_slot ?? '00:00')
        const bParts = tsStr.split(':').map(Number)
        const bStart = (bParts[0] ?? 0) * 60 + (bParts[1] ?? 0)
        let bEnd: number
        if (booking.end_time) {
          const eParts = String(booking.end_time).split(':').map(Number)
          bEnd = (eParts[0] ?? 0) * 60 + (eParts[1] ?? 0)
        } else {
          bEnd = bStart + 30
        }
        occupiedRanges.push({ start: bStart, end: bEnd })
      }

      // Add blocked slots to occupied ranges
      for (const slot of blockedSlots ?? []) {
        const bs = slot as { time_from: string | null; time_to: string | null; all_day: boolean }
        if (bs.all_day || !bs.time_from || !bs.time_to) continue
        const fromParts = bs.time_from.split(':').map(Number)
        const toParts = bs.time_to.split(':').map(Number)
        occupiedRanges.push({
          start: (fromParts[0] ?? 0) * 60 + (fromParts[1] ?? 0),
          end: (toParts[0] ?? 0) * 60 + (toParts[1] ?? 0),
        })
      }

      const available = allSlots.filter(s => {
        const sParts = s.split(':').map(Number)
        const slotStart = (sParts[0] ?? 0) * 60 + (sParts[1] ?? 0)
        const slotEnd = slotStart + duration
        return !occupiedRanges.some(r => slotStart < r.end && r.start < slotEnd)
      })

      if (available.length === 0) return `Aucun créneau disponible le ${date} pour ${serviceName}.`
      return `Créneaux disponibles le ${date} pour ${serviceName} (${duration} min) :\n${available.map(s => `- ${s.replace(':', 'h')}`).join('\n')}`
    }

    case 'book_appointment': {
      const service = input.service as string
      const date = input.date as string
      const time = input.time as string
      const clientName = input.client_name as string

      // Calculate end_time from service duration
      const svc = config.services.find(s => s.name.toLowerCase() === service.toLowerCase())
      const dur = svc?.duration ?? 30
      const timeParts = String(time).split(':').map(Number)
      const endMins = (timeParts[0] ?? 0) * 60 + (timeParts[1] ?? 0) + dur
      const endTime = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`

      const { data: apptData } = await getSupabase().from('bookbot_appointments').insert({
        business_id: config.businessId,
        client_name: clientName,
        client_phone: 'test_dashboard',
        service,
        appointment_date: date,
        time_slot: time,
        end_time: endTime,
        status: 'confirmed',
        source: 'chatbot',
      }).select('id').single()

      // Create Google Calendar event (best-effort, don't block booking)
      try {
        const gcalEventId = await createCalendarEvent(config.businessId, {
          summary: `${service} — ${clientName}`,
          description: `Réservé via Ve'a chatbot.\nService: ${service}\nClient: ${clientName}`,
          date,
          startTime: time,
          endTime,
          timezone: config.timezone,
        })
        if (gcalEventId && apptData?.id) {
          await getSupabase()
            .from('bookbot_appointments')
            .update({ gcal_event_id: gcalEventId })
            .eq('id', apptData.id)
        }
      } catch (e) {
        console.error('[GCal] Event creation failed (non-blocking):', e)
      }

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
  try {
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

    if (msg.tool_calls?.length) {
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

      // If model also included text content alongside tool calls, capture it
      if (msg.content) finalReply = msg.content
    } else {
      finalReply = msg.content ?? ''
      history.push({ role: 'assistant', content: finalReply })
      break
    }
  }

  // If loop ended with tool calls but no final text, add whatever we got
  if (finalReply && history[history.length - 1]?.role !== 'assistant') {
    history.push({ role: 'assistant', content: finalReply })
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
  } catch (err) {
    console.error('[chat-test] Error:', err)
    return NextResponse.json(
      { error: 'Internal error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
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
