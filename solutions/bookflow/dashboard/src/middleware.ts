import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — no auth required
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/privacy', '/terms', '/data-deletion']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  // API routes — handled separately (own auth or public)
  const isWebhook = pathname.startsWith('/api/')

  // Landing page "/" — if authenticated, check onboarding then dashboard
  if (pathname === '/') {
    if (user) {
      const { data: link } = await supabase
        .from('bookbot_business_users')
        .select('business_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      const url = request.nextUrl.clone()
      url.pathname = link ? '/stats' : '/onboarding'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  if (isPublic || isWebhook) {
    return supabaseResponse
  }

  // Not authenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated — check if onboarding is done (has a business)
  if (pathname !== '/onboarding') {
    const { data: link } = await supabase
      .from('bookbot_business_users')
      .select('business_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!link) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
