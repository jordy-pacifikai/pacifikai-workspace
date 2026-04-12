'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import type { BusinessSummary } from '@/lib/store'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  businessId: string | null
  businesses: BusinessSummary[]
  loading: boolean
  signOut: () => Promise<void>
}

/** Read a cookie value by name (client-side) */
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1]
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [businessId, setBusinessIdLocal] = useState<string | null>(null)
  const [businesses, setBusinessesLocal] = useState<BusinessSummary[]>([])
  const [loading, setLoading] = useState(true)

  const { setBusinessId, setBusinessName, setBusinesses } = useAppStore()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        // Load ALL user's businesses
        const { data: links } = await supabase
          .from('bookbot_business_users')
          .select('business_id')
          .eq('user_id', s.user.id)

        const bizIds = links?.map((l: { business_id: string }) => l.business_id) ?? []

        if (bizIds.length > 0 && mounted) {
          // Batch-load business details
          const { data: bizList } = await supabase
            .from('bookbot_businesses')
            .select('id, name, plan')
            .in('id', bizIds)

          const summaries: BusinessSummary[] = (bizList ?? []).map((b: { id: string; name: string | null; plan: string | null }) => ({
            id: b.id,
            name: b.name ?? '',
            plan: b.plan ?? 'decouverte',
          }))

          if (mounted) {
            setBusinessesLocal(summaries)
            setBusinesses(summaries)

            // Pick active business: from cookie or first
            const cookieBiz = getCookie('vea_current_biz')
            const activeBiz = (cookieBiz && summaries.find((b) => b.id === cookieBiz))
              ? summaries.find((b) => b.id === cookieBiz)!
              : summaries[0]

            setBusinessIdLocal(activeBiz.id)
            setBusinessId(activeBiz.id)
            setBusinessName(activeBiz.name)
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
          setBusinessesLocal([])
          setBusinessId('')
          setBusinessName('')
          setBusinesses([])
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, setBusinessId, setBusinessName, setBusinesses])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  return { user, session, businessId, businesses, loading, signOut }
}
