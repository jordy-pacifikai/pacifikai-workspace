import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') ?? '/'
  const onboarding = searchParams.get('onboarding') === 'true'
  const businessName = searchParams.get('businessName') ?? ''

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // Server Component — can't set cookies
            }
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If this is a signup with onboarding, create the business + link
      if (onboarding && businessName) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await setupNewBusiness(user.id, businessName)
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // Check if user has a business already
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: link } = await (supabaseAdmin() as any)
          .from('bookbot_business_users')
          .select('business_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (!link) {
          // No business yet — send to onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

async function setupNewBusiness(userId: string, businessName: string) {
  const admin = supabaseAdmin()

  // Create a new business
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (admin as any)
    .from('bookbot_businesses')
    .insert({
      name: businessName,
      owner_user_id: userId,
      plan: 'starter',
      timezone: 'Pacific/Tahiti',
      services: [],
      hours: {},
      config: {},
      conversation_count: 0,
    })
    .select('id')
    .single()

  if (!business) return

  // Link user to business
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('bookbot_business_users')
    .insert({
      user_id: userId,
      business_id: (business as { id: string }).id,
      role: 'owner',
    })
}
