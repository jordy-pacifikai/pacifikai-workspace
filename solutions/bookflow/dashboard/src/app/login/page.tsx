'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'

const GREEN = '#25D366'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const supabase = getSupabaseBrowser()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
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
        <button
          onClick={() => setSent(false)}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Utiliser une autre adresse
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          Ve&apos;a
        </h1>
        <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
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
          {loading ? 'Envoi...' : 'Se connecter par email'}
        </button>
      </form>

      {/* Signup link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="font-medium hover:text-white transition-colors" style={{ color: GREEN }}>
          Créer mon chatbot
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm text-center">
          <div className="text-2xl font-bold text-white">Ve&apos;a</div>
          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
