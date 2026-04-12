import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Cookie that stores the user's currently-selected business ID */
export const CURRENT_BIZ_COOKIE = 'vea_current_biz'

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from Server Component — can't set cookies
          }
        },
      },
    },
  )
}

export async function getUser() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

export async function requireBusinessAccess(businessId: string) {
  const user = await requireAuth()
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('bookbot_business_users')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .limit(1)
    .single()

  if (!data) {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

/**
 * Get ALL business IDs linked to the current user.
 */
export async function getUserBusinessIds(): Promise<string[]> {
  const user = await getUser()
  if (!user) return []

  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('bookbot_business_users')
    .select('business_id')
    .eq('user_id', user.id)

  return data?.map((d) => d.business_id) ?? []
}

/**
 * Get the currently-selected business ID.
 * Reads the `vea_current_biz` cookie, validates it belongs to the user,
 * and falls back to the first linked business.
 */
export async function getUserBusinessId(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('bookbot_business_users')
    .select('business_id')
    .eq('user_id', user.id)

  const ids = data?.map((d) => d.business_id) ?? []
  if (ids.length === 0) return null

  // Check cookie for active selection
  const cookieStore = await cookies()
  const selected = cookieStore.get(CURRENT_BIZ_COOKIE)?.value
  if (selected && ids.includes(selected)) return selected

  // Fallback to first
  return ids[0]
}
