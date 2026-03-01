'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  businessId: string | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [businessId, setBusinessIdLocal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { setBusinessId, setBusinessName } = useAppStore()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        // Load user's business
        const { data } = await supabase
          .from('bookbot_business_users')
          .select('business_id')
          .eq('user_id', s.user.id)
          .limit(1)
          .single()

        if (data?.business_id && mounted) {
          setBusinessIdLocal(data.business_id)
          setBusinessId(data.business_id)

          // Load business name
          const { data: biz } = await supabase
            .from('bookbot_businesses')
            .select('name')
            .eq('id', data.business_id)
            .single()

          if (biz?.name && mounted) {
            setBusinessName(biz.name)
          }
        }
      }

      if (mounted) setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s: Session | null) => {
        if (!mounted) return
        setSession(s)
        setUser(s?.user ?? null)
        if (!s?.user) {
          setBusinessIdLocal(null)
          setBusinessId('')
          setBusinessName('')
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, setBusinessId, setBusinessName])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  return { user, session, businessId, loading, signOut }
}
