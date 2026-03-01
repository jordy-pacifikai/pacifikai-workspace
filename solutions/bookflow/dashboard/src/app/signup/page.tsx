'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase'

const GREEN = '#25D366'

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = getSupabaseBrowser()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?onboarding=true&businessName=${encodeURIComponent(businessName)}`,
        data: {
          business_name: businessName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setStep('sent')
    setLoading(false)
  }

  if (step === 'sent') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-gray-400 mb-6">
            Un lien de connexion a été envoyé à <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-xs text-gray-600">
            Cliquez sur le lien pour activer votre compte et configurer votre chatbot.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Book<span style={{ color: GREEN }}>Bot</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Créez votre chatbot IA en 5 minutes</p>
        </div>

        {/* Form */}
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
              className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/25 transition-all"
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
              className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/25 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-gray-950 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {loading ? 'Création...' : 'Créer mon chatbot gratuitement'}
          </button>
        </form>

        {/* Features */}
        <div className="mt-8 space-y-3">
          {[
            'Chatbot IA conversationnel prêt en 5 min',
            'Réservation automatique 24h/24',
            'Messenger, WhatsApp, Instagram',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </div>
          ))}
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium hover:text-white transition-colors" style={{ color: GREEN }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
