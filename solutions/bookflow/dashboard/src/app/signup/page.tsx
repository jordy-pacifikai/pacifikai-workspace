'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'

const TEAL = '#0d9488'

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const supabase = getSupabaseBrowser()

  async function handleSignup(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { business_name: businessName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setStep('code')
    setLoading(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  async function handleVerifyCode(code: string) {
    setLoading(true)
    setError('')

    let result = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (result.error) {
      result = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink',
      })
    }

    if (result.error) {
      setError('Code invalide ou expiré')
      setOtp(['', '', '', '', '', ''])
      setLoading(false)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
      return
    }

    router.push(`/onboarding?businessName=${encodeURIComponent(businessName)}`)
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const full = next.join('')
    if (full.length === 6) handleVerifyCode(full)
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ''
    setOtp(next)
    if (pasted.length === 6) handleVerifyCode(pasted)
    else inputRefs.current[pasted.length]?.focus()
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-6">
            <Image src="/logos/logo-transparent.png" alt="Ve'a" width={80} height={44} className="h-12 w-auto mx-auto mb-2" />
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(13, 148, 136, 0.10)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Entrez votre code</h1>
          <p className="text-sm text-gray-400 mb-8">
            Un code à 6 chiffres a été envoyé à <span className="text-white font-medium">{email}</span>
          </p>

          <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={loading}
                className="w-12 h-14 rounded-lg bg-gray-900 border border-gray-700 text-center text-xl font-bold text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/25 transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          {loading && <p className="text-sm text-teal-400 mb-4">Vérification...</p>}

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => handleSignup()}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              Renvoyer le code
            </button>
            <button
              onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError('') }}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Changer d&apos;adresse
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logos/logo-transparent.png" alt="Ve'a" width={120} height={65} className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">
            Ve&apos;a
          </h1>
          <p className="text-sm text-gray-500 mt-1">Votre assistant IA de reservation en 5 minutes</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-1.5">
              Nom de votre entreprise
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Salon Moana, Restaurant Le Lagon..."
              className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: TEAL }}
          >
            {loading ? 'Création...' : 'Commencer gratuitement'}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          {[
            'Chatbot IA conversationnel prêt en 5 min',
            'Réservation automatique 24h/24',
            'Messenger, WhatsApp, Instagram',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium hover:text-white transition-colors" style={{ color: TEAL }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
