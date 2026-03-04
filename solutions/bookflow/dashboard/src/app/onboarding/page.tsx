'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

const GREEN = '#25D366'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ServiceDraft {
  name: string
  duration: number
  price: number
}

interface HourSlot {
  isOpen: boolean
  open: string
  close: string
  hasBreak: boolean
  breakStart: string
  breakEnd: string
}

type Hours = Record<string, HourSlot>

interface OnboardingData {
  // Step 1 — Business
  businessName: string
  category: 'salon' | 'restaurant' | 'medical' | 'sport' | 'autre'
  description: string
  address: string
  phone: string
  // Step 2 — Services
  services: ServiceDraft[]
  // Step 3 — Hours
  hours: Hours
  // Step 4 — Policies
  cancellationDelay: number // heures
  lateToleranceMin: number
  paymentMethods: string[]
  // Step 5 — Personality
  tone: 'formel' | 'decontracte' | 'chaleureux'
  language: 'fr'
  greeting: string
}

const DAYS = [
  { key: 'mon', label: 'Lundi' },
  { key: 'tue', label: 'Mardi' },
  { key: 'wed', label: 'Mercredi' },
  { key: 'thu', label: 'Jeudi' },
  { key: 'fri', label: 'Vendredi' },
  { key: 'sat', label: 'Samedi' },
  { key: 'sun', label: 'Dimanche' },
]

const DEFAULT_HOURS: Hours = Object.fromEntries(
  DAYS.map(d => [
    d.key,
    { isOpen: d.key !== 'sun', open: '08:00', close: '17:00', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  ]),
)

const CATEGORIES = [
  { value: 'salon', label: 'Salon / Beauté' },
  { value: 'restaurant', label: 'Restaurant / Café' },
  { value: 'medical', label: 'Médical / Santé' },
  { value: 'sport', label: 'Sport / Fitness' },
  { value: 'autre', label: 'Autre' },
] as const

const TONES = [
  { value: 'formel', label: 'Formel', desc: '"Bonjour, comment puis-je vous aider ?"' },
  { value: 'decontracte', label: 'Décontracté', desc: '"Hey ! Qu\'est-ce que je peux faire pour toi ?"' },
  { value: 'chaleureux', label: 'Chaleureux', desc: '"Ia ora na ! Bienvenue, en quoi puis-je t\'aider ?"' },
] as const

const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  salon: 'Ex: Salon de coiffure et soins esthétiques à Papeete, spécialisé dans les lissages brésiliens et les balayages. Ambiance détendue, sans rendez-vous le samedi matin.',
  restaurant: 'Ex: Restaurant de cuisine fusion polynésienne et asiatique, terrasse vue mer à Punaauia. Ouvert midi et soir, brunch le dimanche. Réservation recommandée le week-end.',
  medical: 'Ex: Cabinet de kinésithérapie et ostéopathie à Pirae. Spécialisé en rééducation sportive et douleurs chroniques. Consultations sur rendez-vous uniquement.',
  sport: 'Ex: Salle de CrossFit et coaching personnalisé à Faa\'a. Cours collectifs matin et soir, programme débutant disponible. Premier cours d\'essai gratuit.',
  autre: 'Ex: Décrivez en quelques mots votre activité, vos spécialités, et ce qui vous différencie. Le chatbot utilisera ces infos pour mieux répondre à vos clients.',
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { user, businessId: existingBizId } = useAuth()
  const supabase = getSupabaseBrowser()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    category: 'salon',
    description: '',
    address: '',
    phone: '',
    services: [{ name: '', duration: 30, price: 3000 }],
    hours: DEFAULT_HOURS,
    cancellationDelay: 24,
    lateToleranceMin: 10,
    paymentMethods: ['especes'],
    tone: 'chaleureux',
    language: 'fr',
    greeting: 'Ia ora na ! Bienvenue chez {business}. Comment puis-je vous aider ?',
  })

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) =>
    setData(prev => ({ ...prev, [key]: value }))

  // ── Navigation ────────────────────────────────────────────────────────────

  const canNext = () => {
    switch (step) {
      case 1: return data.businessName.trim().length > 0
      case 2: return data.services.length > 0 && data.services.every(s => s.name.trim())
      case 3: return Object.values(data.hours).some(h => h.isOpen)
      case 4: return true
      case 5: return true
      default: return true
    }
  }

  const next = () => { if (step < 5 && canNext()) setStep(s => s + 1) }
  const prev = () => { if (step > 1) setStep(s => s - 1) }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    setError('')

    try {
      // 1. Upsert bookbot_businesses (for the AI agent)
      const openingHoursRecord: Record<string, string> = {}
      for (const [day, slot] of Object.entries(data.hours)) {
        if (!slot.isOpen) {
          openingHoursRecord[day] = 'closed'
        } else if (slot.hasBreak) {
          openingHoursRecord[day] = `${slot.open}-${slot.breakStart},${slot.breakEnd}-${slot.close}`
        } else {
          openingHoursRecord[day] = `${slot.open}-${slot.close}`
        }
      }

      const resolvedGreeting = data.greeting.replace(/\{business\}/g, data.businessName || 'notre établissement')

      const servicesArray = data.services
        .filter(s => s.name.trim())
        .map(s => ({ name: s.name.trim(), duration: s.duration, price: s.price }))

      let bizId = existingBizId

      if (bizId) {
        // Update existing
        await supabase
          .from('bookbot_businesses')
          .update({
            name: data.businessName,
            phone: data.phone || '',
            sector: data.category,
            services: servicesArray,
            hours: openingHoursRecord,
            timezone: 'Pacific/Tahiti',
            config: {
              tone: data.tone,
              language: data.language,
              greeting: resolvedGreeting,
              description: data.description,
              cancellation_delay_hours: data.cancellationDelay,
              late_tolerance_min: data.lateToleranceMin,
              payment_methods: data.paymentMethods,
              category: data.category,
            },
          })
          .eq('id', bizId)
      } else {
        // Create new
        const { data: newBiz, error: bizError } = await supabase
          .from('bookbot_businesses')
          .insert({
            name: data.businessName,
            phone: data.phone || '',
            sector: data.category,
            owner_user_id: user.id,
            plan: 'starter',
            services: servicesArray,
            hours: openingHoursRecord,
            timezone: 'Pacific/Tahiti',
            config: {
              tone: data.tone,
              language: data.language,
              greeting: resolvedGreeting,
              description: data.description,
              cancellation_delay_hours: data.cancellationDelay,
              late_tolerance_min: data.lateToleranceMin,
              payment_methods: data.paymentMethods,
              category: data.category,
            },
            conversation_count: 0,
          })
          .select('id')
          .single()

        if (bizError) throw bizError
        bizId = newBiz!.id

        // Link user to business
        const { error: bizUserError } = await supabase.from('bookbot_business_users').insert({
          user_id: user.id,
          business_id: bizId,
          role: 'owner',
        })
        if (bizUserError) throw bizUserError
      }

      // 2. Upsert dashboard businesses table (non-blocking — table may not exist)
      try {
        const openingHoursObj: Record<string, { open: string | null; close: string | null; is_open: boolean; break_start: string | null; break_end: string | null }> = {}
        for (const [day, slot] of Object.entries(data.hours)) {
          openingHoursObj[day] = {
            open: slot.isOpen ? slot.open : null,
            close: slot.isOpen ? slot.close : null,
            is_open: slot.isOpen,
            break_start: slot.isOpen && slot.hasBreak ? slot.breakStart : null,
            break_end: slot.isOpen && slot.hasBreak ? slot.breakEnd : null,
          }
        }

        const { data: existingDashBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', bizId!)
          .single()

        if (existingDashBiz) {
          await supabase
            .from('businesses')
            .update({
              name: data.businessName,
              category: data.category,
              address: data.address || null,
              phone: data.phone || null,
              opening_hours: openingHoursObj,
              owner_id: user.id,
            })
            .eq('id', bizId!)
        } else {
          await supabase.from('businesses').insert({
            id: bizId!,
            name: data.businessName,
            slug: data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: data.category,
            address: data.address || null,
            phone: data.phone || null,
            opening_hours: openingHoursObj,
            owner_id: user.id,
            subscription_plan: 'starter',
            default_slot_duration: 30,
            booking_buffer: 0,
            max_advance_booking_days: 30,
            rating: 0,
            review_count: 0,
            total_bookings: 0,
          })
        }

        // 3. Create services in dashboard services table
        const validServices = data.services.filter(s => s.name.trim())
        if (validServices.length > 0) {
          await supabase.from('services').delete().eq('business_id', bizId!)
          await supabase.from('services').insert(
            validServices.map((s, i) => ({
              business_id: bizId!,
              name: s.name.trim(),
              duration: s.duration,
              price: s.price,
              is_active: true,
              display_order: i,
            })),
          )
        }
      } catch (e) {
        console.warn('Dashboard tables upsert (non-critical):', e)
      }

      // 4. Generate knowledge base documents (non-blocking)
      try {
        await generateKnowledgeDocs(bizId!, data)
      } catch (e) {
        console.warn('Knowledge docs generation (non-critical):', e)
      }

      // Done — redirect to dashboard
      router.push('/stats')
    } catch (err: unknown) {
      console.error('Onboarding error:', err)
      let msg = ''
      if (err instanceof Error) {
        msg = err.message
      } else if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        const parts = [e.message, e.details, e.hint, e.code].filter(Boolean)
        msg = parts.length > 0 ? parts.join(' — ') : JSON.stringify(err)
      } else {
        msg = String(err)
      }
      setError(msg || 'Erreur inconnue — voir la console')
      setSaving(false)
    }
  }

  async function generateKnowledgeDocs(businessId: string, d: OnboardingData) {
    const docs = [
      {
        title: 'Informations générales',
        category: 'info',
        content: `${d.businessName} est un(e) ${CATEGORIES.find(c => c.value === d.category)?.label || d.category}.${d.description ? ` ${d.description}` : ''}${d.address ? ` Adresse : ${d.address}.` : ''}${d.phone ? ` Téléphone : ${d.phone}.` : ''}`,
      },
      {
        title: 'Services proposés',
        category: 'services',
        content: d.services
          .filter(s => s.name.trim())
          .map(s => `- ${s.name} : durée ${s.duration} min, prix ${s.price} XPF`)
          .join('\n'),
      },
      {
        title: 'Horaires d\'ouverture',
        category: 'horaires',
        content: DAYS
          .map(day => {
            const h = d.hours[day.key]
            if (!h.isOpen) return `- ${day.label} : Fermé`
            const base = `${h.open} - ${h.close}`
            return `- ${day.label} : ${base}${h.hasBreak ? ` (pause ${h.breakStart} - ${h.breakEnd})` : ''}`
          })
          .join('\n'),
      },
      {
        title: 'Politique d\'annulation',
        category: 'politique',
        content: `Les annulations doivent être effectuées au moins ${d.cancellationDelay} heures à l'avance. En cas de retard, une tolérance de ${d.lateToleranceMin} minutes est accordée.`,
      },
      {
        title: 'Moyens de paiement',
        category: 'paiement',
        content: `Moyens de paiement acceptés : ${d.paymentMethods.join(', ')}.`,
      },
    ]

    for (const doc of docs) {
      await supabase.from('bookbot_knowledge').insert({
        business_id: businessId,
        title: doc.title,
        category: doc.category,
        content: doc.content,
      })
    }
  }

  // ─── Step components ──────────────────────────────────────────────────────

  const stepTitles = [
    'Votre entreprise',
    'Vos services',
    'Vos horaires',
    'Vos politiques',
    'Personnalité du bot',
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">
            Ve&apos;a
            <span className="text-gray-500 text-sm font-normal ml-3">Configuration</span>
          </h1>
          <span className="text-sm text-gray-500">{step} / 5</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-900">
        <div
          className="h-1 transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%`, backgroundColor: GREEN }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-1">{stepTitles[step - 1]}</h2>
          <p className="text-sm text-gray-500 mb-8">
            {step === 1 && 'Présentez votre activité en quelques infos.'}
            {step === 2 && 'Ajoutez les prestations que vos clients peuvent réserver.'}
            {step === 3 && 'Définissez vos jours et heures d\'ouverture.'}
            {step === 4 && 'Configurez vos règles d\'annulation et de paiement.'}
            {step === 5 && 'Choisissez le ton de votre chatbot IA.'}
          </p>

          {step === 1 && <Step1Business data={data} update={update} />}
          {step === 2 && <Step2Services data={data} update={update} />}
          {step === 3 && <Step3Hours data={data} update={update} />}
          {step === 4 && <Step4Policies data={data} update={update} />}
          {step === 5 && <Step5Personality data={data} update={update} />}

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 1}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Retour
          </button>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={!canNext()}
              className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-950 disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ backgroundColor: GREEN }}
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-950 disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ backgroundColor: GREEN }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Créer mon chatbot
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 1 — Business ────────────────────────────────────────────────────────

function Step1Business({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <Field label="Nom de votre entreprise" required>
        <input
          type="text"
          value={data.businessName}
          onChange={e => update('businessName', e.target.value)}
          placeholder="Ex: Salon Moana, Restaurant Le Lagon..."
          className="input-field"
        />
      </Field>

      <Field label="Secteur d'activité">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => update('category', c.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.category === c.value
                  ? 'border-green-500/50 text-white'
                  : 'border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
              style={data.category === c.value ? { backgroundColor: 'rgba(37, 211, 102, 0.1)' } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Décrivez votre activité">
        <textarea
          value={data.description}
          onChange={e => update('description', e.target.value)}
          rows={3}
          placeholder={DESCRIPTION_PLACEHOLDERS[data.category] || DESCRIPTION_PLACEHOLDERS.autre}
          className="input-field resize-none"
        />
        <p className="mt-1.5 text-xs text-gray-600">Optionnel — aide le chatbot à mieux répondre. Modifiable plus tard dans Paramètres.</p>
      </Field>

      <Field label="Adresse">
        <input
          type="text"
          value={data.address}
          onChange={e => update('address', e.target.value)}
          placeholder="Papeete, Tahiti"
          className="input-field"
        />
        <p className="mt-1 text-xs text-gray-600">Modifiable plus tard</p>
      </Field>

      <Field label="Téléphone">
        <input
          type="tel"
          value={data.phone}
          onChange={e => update('phone', e.target.value)}
          placeholder="+689 40 XX XX XX"
          className="input-field"
        />
        <p className="mt-1 text-xs text-gray-600">Modifiable plus tard</p>
      </Field>
    </div>
  )
}

// ─── Step 2 — Services ────────────────────────────────────────────────────────

function Step2Services({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}) {
  const addService = () => {
    update('services', [...data.services, { name: '', duration: 30, price: 3000 }])
  }

  const removeService = (i: number) => {
    if (data.services.length <= 1) return
    update('services', data.services.filter((_, idx) => idx !== i))
  }

  const updateService = (i: number, field: keyof ServiceDraft, value: string | number) => {
    const updated = [...data.services]
    updated[i] = { ...updated[i], [field]: value }
    update('services', updated)
  }

  return (
    <div className="space-y-4">
      {data.services.map((s, i) => (
        <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Service {i + 1}
            </span>
            {data.services.length > 1 && (
              <button
                onClick={() => removeService(i)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>

          <input
            type="text"
            value={s.name}
            onChange={e => updateService(i, 'name', e.target.value)}
            placeholder="Nom du service (ex: Coupe homme)"
            className="input-field"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Durée (min)</label>
              <input
                type="number"
                value={s.duration}
                onChange={e => updateService(i, 'duration', parseInt(e.target.value) || 0)}
                min={5}
                step={5}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prix (XPF)</label>
              <input
                type="number"
                value={s.price}
                onChange={e => updateService(i, 'price', parseInt(e.target.value) || 0)}
                min={0}
                step={100}
                className="input-field"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addService}
        className="w-full py-2.5 rounded-lg border border-dashed border-gray-700 text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all"
      >
        + Ajouter un service
      </button>
    </div>
  )
}

// ─── Step 3 — Hours ────────────────────────────────────────────────────────────

function Step3Hours({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}) {
  const toggleDay = (day: string) => {
    const h = { ...data.hours }
    h[day] = { ...h[day], isOpen: !h[day].isOpen }
    update('hours', h)
  }

  const toggleBreak = (day: string) => {
    const h = { ...data.hours }
    h[day] = { ...h[day], hasBreak: !h[day].hasBreak }
    update('hours', h)
  }

  const setTime = (day: string, field: 'open' | 'close' | 'breakStart' | 'breakEnd', value: string) => {
    const h = { ...data.hours }
    h[day] = { ...h[day], [field]: value }
    update('hours', h)
  }

  return (
    <div className="space-y-2">
      {DAYS.map(d => {
        const slot = data.hours[d.key]
        return (
          <div
            key={d.key}
            className={`rounded-lg px-4 py-3 border transition-all ${
              slot.isOpen ? 'border-gray-800 bg-gray-900' : 'border-gray-900 bg-gray-950'
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleDay(d.key)}
                className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                  slot.isOpen ? '' : 'bg-gray-800'
                }`}
                style={slot.isOpen ? { backgroundColor: GREEN } : undefined}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    slot.isOpen ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>

              <span className={`w-24 text-sm font-medium ${slot.isOpen ? 'text-gray-200' : 'text-gray-600'}`}>
                {d.label}
              </span>

              {slot.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={slot.open}
                    onChange={e => setTime(d.key, 'open', e.target.value)}
                    className="input-field !w-auto !py-1.5 text-sm"
                  />
                  <span className="text-gray-600">—</span>
                  <input
                    type="time"
                    value={slot.close}
                    onChange={e => setTime(d.key, 'close', e.target.value)}
                    className="input-field !w-auto !py-1.5 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-600">Ferme</span>
              )}
            </div>

            {slot.isOpen && (
              <div className="mt-2 ml-14 flex items-center gap-3">
                <button
                  onClick={() => toggleBreak(d.key)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <span
                    className={`w-7 h-4 rounded-full relative transition-colors ${
                      slot.hasBreak ? '' : 'bg-gray-800'
                    }`}
                    style={slot.hasBreak ? { backgroundColor: 'rgba(37, 211, 102, 0.5)' } : undefined}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        slot.hasBreak ? 'left-[13px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                  Pause
                </button>

                {slot.hasBreak && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={slot.breakStart}
                      onChange={e => setTime(d.key, 'breakStart', e.target.value)}
                      className="input-field !w-auto !py-1 !px-2 text-xs"
                    />
                    <span className="text-gray-600 text-xs">—</span>
                    <input
                      type="time"
                      value={slot.breakEnd}
                      onChange={e => setTime(d.key, 'breakEnd', e.target.value)}
                      className="input-field !w-auto !py-1 !px-2 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 4 — Policies ─────────────────────────────────────────────────────────

function Step4Policies({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}) {
  const paymentOptions = ['especes', 'carte', 'virement', 'cheque']

  const togglePayment = (method: string) => {
    const current = data.paymentMethods
    if (current.includes(method)) {
      update('paymentMethods', current.filter(m => m !== method))
    } else {
      update('paymentMethods', [...current, method])
    }
  }

  return (
    <div className="space-y-6">
      <Field label="Délai d'annulation minimum (heures)">
        <div className="flex items-center gap-3">
          {[2, 6, 12, 24, 48].map(h => (
            <button
              key={h}
              onClick={() => update('cancellationDelay', h)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.cancellationDelay === h
                  ? 'border-green-500/50 text-white'
                  : 'border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
              style={data.cancellationDelay === h ? { backgroundColor: 'rgba(37, 211, 102, 0.1)' } : undefined}
            >
              {h}h
            </button>
          ))}
        </div>
      </Field>

      <Field label="Tolérance de retard (minutes)">
        <div className="flex items-center gap-3">
          {[5, 10, 15, 30].map(m => (
            <button
              key={m}
              onClick={() => update('lateToleranceMin', m)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.lateToleranceMin === m
                  ? 'border-green-500/50 text-white'
                  : 'border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
              style={data.lateToleranceMin === m ? { backgroundColor: 'rgba(37, 211, 102, 0.1)' } : undefined}
            >
              {m} min
            </button>
          ))}
        </div>
      </Field>

      <Field label="Moyens de paiement acceptés">
        <div className="flex flex-wrap gap-2">
          {paymentOptions.map(p => (
            <button
              key={p}
              onClick={() => togglePayment(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                data.paymentMethods.includes(p)
                  ? 'border-green-500/50 text-white'
                  : 'border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
              style={data.paymentMethods.includes(p) ? { backgroundColor: 'rgba(37, 211, 102, 0.1)' } : undefined}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

// ─── Step 5 — Personality ──────────────────────────────────────────────────────

function Step5Personality({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}) {
  const bizName = data.businessName || 'votre entreprise'

  return (
    <div className="space-y-6">
      <Field label="Ton du chatbot">
        <div className="space-y-2">
          {TONES.map(t => (
            <button
              key={t.value}
              onClick={() => update('tone', t.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                data.tone === t.value
                  ? 'border-green-500/50'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              style={data.tone === t.value ? { backgroundColor: 'rgba(37, 211, 102, 0.08)' } : undefined}
            >
              <p className={`text-sm font-medium ${data.tone === t.value ? 'text-white' : 'text-gray-300'}`}>
                {t.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 italic">{t.desc}</p>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-gray-600">Modifiable plus tard dans Agent IA</p>
      </Field>

      <Field label="Message d'accueil">
        <textarea
          value={data.greeting}
          onChange={e => update('greeting', e.target.value)}
          rows={3}
          placeholder={`Ia ora na ! Bienvenue chez ${bizName}...`}
          className="input-field resize-none"
        />
        <div className="mt-2 rounded-lg bg-gray-800/50 border border-gray-800 px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Apercu</p>
          <p className="text-sm text-gray-300 italic">
            {data.greeting.replace(/\{business\}/g, bizName)}
          </p>
        </div>
        <p className="mt-1.5 text-xs text-gray-600">Modifiable plus tard dans Agent IA</p>
      </Field>
    </div>
  )
}

// ─── Shared UI ──────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
