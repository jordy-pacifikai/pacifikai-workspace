import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Single-host mode: no dashboard subdomain, everything on vea.pacifikai.com
const DASHBOARD_HOST = 'vea.pacifikai.com'
const LANDING_HOST = 'vea.pacifikai.com'
const BIZ_CACHE_COOKIE = 'vea_biz'
const BIZ_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Edge-compatible HMAC using Web Crypto API
const _encoder = new TextEncoder()
let _cryptoKey: CryptoKey | null = null
async function getCryptoKey(): Promise<CryptoKey> {
  if (_cryptoKey) return _cryptoKey
  const rawSecret = process.env.COOKIE_SIGNING_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!rawSecret) throw new Error('COOKIE_SIGNING_SECRET or SUPABASE_SERVICE_ROLE_KEY required for cookie signing')
  const secret = _encoder.encode(rawSecret)
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

  const { pathname } = request.nextUrl

  // ─── Static / public assets — skip all logic ──────────────────────
  const isAsset = pathname.startsWith('/_next/') || pathname.startsWith('/icons/') || pathname.startsWith('/logos/')
  if (isAsset) return supabaseResponse

  // ─── Auth & dashboard logic ────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes on dashboard — no auth required
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/privacy', '/terms', '/data-deletion', '/book', '/status', '/review', '/pricing', '/faq', '/offline', '/unsubscribe', '/landing', '/portal', '/secteur']
  // Exact match or sub-path under a trailing slash — prevents '/review' from catching '/reviews'
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))
  // Only skip auth for actual external webhook/callback endpoints
  // Dashboard API routes (/api/clients, /api/appointments, etc.) go through normal auth flow
  const webhookPrefixes = [
    '/api/webhook',        // WhatsApp/Meta webhooks
    '/api/webhooks',       // Generic webhook receivers
    '/api/cron',           // Cron jobs (authenticated by secret header)
    '/api/book',           // Public booking widget API
    '/api/portal',         // Public client portal
    '/api/health',         // Health check
    '/api/waitlist',       // Public waitlist signup
    '/api/unsubscribe',    // Email unsubscribe
    '/api/messenger/oauth-callback', // Facebook OAuth redirect
    '/api/auth/callback',  // Supabase auth callback
    '/api/auth/facebook',  // Facebook OAuth initiation (has own CSRF)
  ]
  const isWebhook = webhookPrefixes.some(p => pathname.startsWith(p))

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

  // Not authenticated
  if (!user) {
    // API routes: return JSON 401 (not a redirect)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
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
