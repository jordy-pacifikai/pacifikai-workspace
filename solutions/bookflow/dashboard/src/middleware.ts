import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DASHBOARD_HOST = 'dashboard.vea.pacifikai.com'
const LANDING_HOST = 'vea.pacifikai.com'
const BIZ_CACHE_COOKIE = 'vea_biz'
const BIZ_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Edge-compatible HMAC using Web Crypto API
const _encoder = new TextEncoder()
let _cryptoKey: CryptoKey | null = null
async function getCryptoKey(): Promise<CryptoKey> {
  if (_cryptoKey) return _cryptoKey
  const secret = _encoder.encode(process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dev-secret')
  _cryptoKey = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
  return _cryptoKey
}

async function signValue(val: string): Promise<string> {
  const key = await getCryptoKey()
  const sig = await crypto.subtle.sign('HMAC', key, _encoder.encode(val))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

/** Parse and verify the cached business cookie */
async function parseBizCache(cookie: string | undefined): Promise<{ businessId: string; status: string; plan: string; trialEndsAt: string | null } | null> {
  if (!cookie) return null
  try {
    const [payload, sig, ts] = cookie.split('.')
    if (!payload || !sig || !ts) return null
    if (Date.now() - Number(ts) > BIZ_CACHE_TTL) return null
    if (await signValue(`${payload}.${ts}`) !== sig) return null
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

/** Create a signed cache cookie value */
async function createBizCache(data: { businessId: string; status: string; plan: string; trialEndsAt: string | null }): Promise<string> {
  const payload = btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const ts = String(Date.now())
  const sig = await signValue(`${payload}.${ts}`)
  return `${payload}.${sig}.${ts}`
}

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
      const cached = await parseBizCache(request.cookies.get(BIZ_CACHE_COOKIE)?.value)
      if (cached?.businessId) {
        const url = request.nextUrl.clone()
        url.pathname = '/stats'
        return NextResponse.redirect(url)
      }
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
    const cached = await parseBizCache(request.cookies.get(BIZ_CACHE_COOKIE)?.value)
    if (cached?.businessId) {
      const url = request.nextUrl.clone()
      url.pathname = '/stats'
      return NextResponse.redirect(url)
    }
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
    // Try cached cookie first to avoid DB queries on every navigation
    let bizCache = await parseBizCache(request.cookies.get(BIZ_CACHE_COOKIE)?.value)

    if (!bizCache) {
      // Cache miss — query DB (2 queries)
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

      const { data: biz } = await supabase
        .from('bookbot_businesses')
        .select('subscription_status, trial_ends_at, plan')
        .eq('id', link.business_id)
        .single()

      bizCache = {
        businessId: link.business_id,
        status: biz?.subscription_status ?? '',
        plan: biz?.plan ?? 'decouverte',
        trialEndsAt: biz?.trial_ends_at ?? null,
      }

      // Set cache cookie on response (5min TTL, signed)
      supabaseResponse.cookies.set(BIZ_CACHE_COOKIE, await createBizCache(bizCache), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 300,
        path: '/',
      })
    }

    if (!bizCache.businessId) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // ─── Paywall: block expired/cancelled subscriptions ───────────────
    const paywallExempt = ['/billing', '/settings', '/onboarding']
    const isPaywallExempt = paywallExempt.some(r => pathname.startsWith(r))

    if (!isPaywallExempt) {
      const { status, plan, trialEndsAt } = bizCache

      // Free plan (decouverte) always allowed
      if (plan !== 'decouverte') {
        let blocked = false

        if (status === 'expired' || status === 'cancelled' || status === 'payment_failed' || !status) {
          blocked = true
        } else if (status === 'trial' && trialEndsAt) {
          blocked = new Date(trialEndsAt) < new Date()
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
