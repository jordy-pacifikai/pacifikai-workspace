import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DASHBOARD_HOST = 'dashboard.vea.pacifikai.com'
const LANDING_HOST = 'vea.pacifikai.com'

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

  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const isDashboardHost = hostname.startsWith('dashboard.')
  const isLandingHost = !isDashboardHost

  // ─── Landing host (vea.pacifikai.com) ───────────────────────────────
  // Only serve landing page, legal pages, and API routes.
  // All auth/dashboard routes redirect to dashboard subdomain.
  if (isLandingHost) {
    const landingRoutes = ['/', '/landing', '/privacy', '/terms', '/data-deletion', '/status', '/pricing', '/faq', '/unsubscribe']
    const isLandingRoute = landingRoutes.includes(pathname)
    const isSecteurRoute = pathname.startsWith('/secteur/')
    const isBookRoute = pathname.startsWith('/book/')
    const isApi = pathname.startsWith('/api/')
    const isAsset = pathname.startsWith('/_next/') || pathname.startsWith('/icons/') || pathname.startsWith('/logos/')

    if (isLandingRoute || isSecteurRoute || isBookRoute || isApi || isAsset) {
      return supabaseResponse
    }

    // Any other route on landing host → redirect to dashboard host
    const url = new URL(`https://${DASHBOARD_HOST}${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  // ─── Dashboard host (dashboard.vea.pacifikai.com) ───────────────────
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes on dashboard — no auth required
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/privacy', '/terms', '/data-deletion', '/book', '/status', '/review', '/pricing', '/faq', '/offline', '/unsubscribe']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isWebhook = pathname.startsWith('/api/')

  // Dashboard root "/" → redirect to stats or login
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
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If already authenticated and visiting login/signup, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
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

    // ─── Paywall: block expired/cancelled subscriptions ───────────────
    const paywallExempt = ['/billing', '/settings', '/onboarding']
    const isPaywallExempt = paywallExempt.some(r => pathname.startsWith(r))

    if (!isPaywallExempt && link.business_id) {
      const { data: biz } = await supabase
        .from('bookbot_businesses')
        .select('subscription_status, trial_ends_at, plan')
        .eq('id', link.business_id)
        .single()

      if (biz) {
        const status = biz.subscription_status
        const plan = biz.plan

        // Free plan (decouverte) always allowed
        if (plan !== 'decouverte') {
          let blocked = false

          if (status === 'expired' || status === 'cancelled' || status === 'payment_failed' || !status) {
            blocked = true
          } else if (status === 'trial' && biz.trial_ends_at) {
            blocked = new Date(biz.trial_ends_at) < new Date()
          }

          if (blocked) {
            const url = request.nextUrl.clone()
            url.pathname = '/billing'
            url.searchParams.set('expired', 'true')
            return NextResponse.redirect(url)
          }
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
