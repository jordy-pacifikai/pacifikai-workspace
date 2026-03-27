import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const FB_APP_ID = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '').trim();
const FB_APP_SECRET = (process.env.FACEBOOK_APP_SECRET ?? '').trim();
// config_id removed — was causing "ID d'app non valide" error. Using scope param instead.
const FB_API = 'https://graph.facebook.com/v22.0';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vea.pacifikai.com';
// OAuth redirect URI must match what's registered in the Facebook Login for Business config.
// Both vea.pacifikai.com and dashboard.vea.pacifikai.com serve the same Vercel project,
// so we always use vea.pacifikai.com which is whitelisted in the Meta config.
const REDIRECT_URI = 'https://vea.pacifikai.com/api/auth/facebook';

/** Redirect and clear the OAuth nonce cookie */
function oauthRedirect(url: string): NextResponse {
  const res = NextResponse.redirect(url);
  res.cookies.delete({ name: 'fb_oauth_nonce', path: '/api/auth/facebook' });
  return res;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

/**
 * Helper: connect first page automatically (subscribe webhook + store in DB).
 */
async function autoConnectPage(page: FacebookPage, businessId: string) {
  const supabase = supabaseAdmin();

  // Subscribe to webhook events
  await fetch(
    `${FB_API}/${page.id}/subscribed_apps?` +
      new URLSearchParams({
        access_token: page.access_token,
        subscribed_fields: 'messages,messaging_postbacks',
      }),
    { method: 'POST' },
  ).catch(() => {});

  // Store in database
  await supabase
    .from('bookbot_businesses')
    .update({
      meta_page_id: page.id,
      meta_page_token: page.access_token,
      meta_page_name: page.name ?? null,
      meta_ig_account_id: page.instagram_business_account?.id ?? null,
      meta_connected_at: new Date().toISOString(),
    })
    .eq('id', businessId);
}

/**
 * GET /api/auth/facebook
 *
 * Two modes:
 * 1. ?business_id=xxx → Redirect to Facebook OAuth
 * 2. ?code=xxx&state=xxx → OAuth callback, exchange code for token
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-facebook-get:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // ── OAuth callback ──────────────────────────────────────────────────────
  if (code && state) {
    try {
      // Validate CSRF nonce from state
      const separatorIdx = state.indexOf(':');
      if (separatorIdx === -1) {
        return oauthRedirect(`${SITE_URL}/channels?fb_error=invalid_state`);
      }
      const businessId = state.slice(0, separatorIdx);
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(businessId)) {
        return oauthRedirect(`${SITE_URL}/channels?fb_error=${encodeURIComponent('Invalid business ID')}`);
      }
      const nonce = state.slice(separatorIdx + 1);
      const cookieNonce = req.cookies.get('fb_oauth_nonce')?.value;
      if (!cookieNonce || cookieNonce !== nonce) {
        return oauthRedirect(`${SITE_URL}/channels?fb_error=csrf_failed`);
      }

      // Exchange code for user access token
      const tokenRes = await fetch(
        `${FB_API}/oauth/access_token?` +
          new URLSearchParams({
            client_id: FB_APP_ID,
            client_secret: FB_APP_SECRET,
            redirect_uri: REDIRECT_URI,
            code,
          }),
      );
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        logger.error('Token exchange error', { action: 'facebook_oauth', error: String(tokenData.error.message) });
        return oauthRedirect(
          `${SITE_URL}/channels?fb_error=token_exchange_failed`,
        );
      }

      const userToken = tokenData.access_token as string;

      // Exchange short-lived → long-lived user token
      const exchangeRes = await fetch(
        `${FB_API}/oauth/access_token?` +
          new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: FB_APP_ID,
            client_secret: FB_APP_SECRET,
            fb_exchange_token: userToken,
          }),
      );
      const exchangeData = await exchangeRes.json();
      const longLivedToken = (exchangeData.access_token ?? userToken) as string;

      // Get user pages (Page Access Tokens are PERMANENT with long-lived user token)
      const pagesRes = await fetch(
        `${FB_API}/me/accounts?` +
          new URLSearchParams({
            access_token: longLivedToken,
            fields: 'id,name,access_token,instagram_business_account',
          }),
      );
      const pagesData = await pagesRes.json();

      if (pagesData.error) {
        logger.error('Pages fetch error', { action: 'facebook_oauth', error: String(pagesData.error) });
        return oauthRedirect(
          `${SITE_URL}/channels?fb_error=pages_fetch_failed`,
        );
      }

      const pages: FacebookPage[] = pagesData.data ?? [];

      if (pages.length === 0) {
        return oauthRedirect(
          `${SITE_URL}/channels?fb_error=${encodeURIComponent('Aucune Page Facebook trouvee. Verifie que tu es admin d\'au moins une Page.')}`,
        );
      }

      // Auto-connect if only one page
      if (pages.length === 1) {
        await autoConnectPage(pages[0], businessId);
        return oauthRedirect(`${SITE_URL}/channels?fb_connected=true`);
      }

      // Multiple pages — store server-side (tokens must NOT appear in URL)
      const sessionId = crypto.randomUUID();
      const supabase = supabaseAdmin();
      await supabase.from('bookbot_fb_page_sessions').insert({
        id: sessionId,
        business_id: businessId,
        pages: pages.map((p) => ({
          id: p.id,
          name: p.name,
          access_token: p.access_token,
          instagram_business_account_id: p.instagram_business_account?.id ?? null,
        })),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min TTL
      });

      return oauthRedirect(
        `${SITE_URL}/channels?fb_session=${sessionId}`,
      );
    } catch (err) {
      logger.error('Callback error', { action: 'facebook_oauth', error: String(err) });
      return oauthRedirect(
        `${SITE_URL}/channels?fb_error=${encodeURIComponent('Erreur interne lors de la connexion Facebook')}`,
      );
    }
  }

  // ── User cancelled or error from Facebook ──────────────────────────────
  if (errorParam) {
    const SAFE_FB_ERRORS: Record<string, string> = {
      access_denied: 'access_denied',
      user_denied: 'user_denied',
    };
    const safeError = SAFE_FB_ERRORS[errorParam] ?? 'unknown_error';
    return oauthRedirect(`${SITE_URL}/channels?fb_error=${safeError}`);
  }

  // ── Start OAuth flow ────────────────────────────────────────────────────
  const businessId = url.searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 });
  }

  // Generate CSRF nonce and set as HttpOnly cookie
  const nonce = crypto.randomUUID();

  const oauthUrl =
    `https://www.facebook.com/v22.0/dialog/oauth?` +
    new URLSearchParams({
      client_id: FB_APP_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'pages_show_list,pages_manage_metadata,pages_messaging,public_profile',
      state: `${businessId}:${nonce}`,
      response_type: 'code',
    });

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set('fb_oauth_nonce', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 min — OAuth flow should complete within this
    path: '/api/auth/facebook',
    domain: 'vea.pacifikai.com', // covers both vea.pacifikai.com and dashboard.vea.pacifikai.com
  });
  return response;
}

/**
 * POST /api/auth/facebook — kept for backwards compat (unused now).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-facebook-post:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  return NextResponse.json({ error: 'Use GET /api/auth/facebook?business_id=xxx instead' }, { status: 400 });
}

/**
 * POST /api/auth/facebook/connect
 * Called after the user selects a page from the list.
 *
 * We use a search param to route: ?action=connect
 *
 * Body: { businessId, pageId, pageName, pageToken, igAccountId }
 */
export async function PUT(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-facebook-put:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const connectSchema = z.object({
      businessId: z.string().uuid(),
      pageId: z.string().min(1),
      pageName: z.string().optional(),
      pageToken: z.string().min(1),
      igAccountId: z.string().optional().nullable(),
    });

    const parsed = connectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { businessId, pageId, pageName, pageToken, igAccountId } = parsed.data;

    // Auth: verify caller owns this business
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    // ── Step 3: Subscribe page to webhook events ──────────────────────────
    const subscribeRes = await fetch(
      `${FB_API}/${pageId}/subscribed_apps?` +
        new URLSearchParams({
          access_token: pageToken,
          subscribed_fields: 'messages,messaging_postbacks',
        }),
      { method: 'POST' },
    );
    const subscribeData = await subscribeRes.json();

    if (subscribeData.error) {
      logger.warn('Webhook subscribe error', { action: 'facebook_oauth', error: String(subscribeData.error) });
      // Non-blocking — store the token anyway, we can retry later
    }

    // If IG account exists, subscribe Instagram webhook too
    if (igAccountId) {
      // Instagram webhooks are subscribed at the Page level, same endpoint
      // The `messages` field covers both Messenger and Instagram DM
      // No extra subscription needed for Instagram if page is already subscribed
    }

    // ── Step 4: Store in database ─────────────────────────────────────────
    const { error } = await supabase
      .from('bookbot_businesses')
      .update({
        meta_page_id: pageId,
        meta_page_token: pageToken,
        meta_page_name: pageName ?? null,
        meta_ig_account_id: igAccountId ?? null,
        meta_connected_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      logger.error('DB update error', { action: 'facebook_oauth_connect', error: error.message });
      return NextResponse.json(
        { error: 'Erreur lors de la connexion. Veuillez réessayer.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        id: pageId,
        name: pageName,
        instagram: Boolean(igAccountId),
      },
    });
  } catch (err) {
    logger.error('Connect error', { action: 'facebook_oauth_connect', error: String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/facebook
 *
 * Disconnect a page: unsubscribe webhooks + clear stored tokens.
 * Body: { businessId }
 */
export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-facebook-delete:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const disconnectSchema = z.object({ businessId: z.string().uuid() });
    const parsed = disconnectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId } = parsed.data;

    // Auth: verify caller owns this business
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    // Get the current token to unsubscribe webhooks
    const { data: business } = await supabase
      .from('bookbot_businesses')
      .select('meta_page_id, meta_page_token')
      .eq('id', businessId)
      .single();

    if (business?.meta_page_id && business?.meta_page_token) {
      // Unsubscribe from webhooks
      await fetch(
        `${FB_API}/${business.meta_page_id}/subscribed_apps?` +
          new URLSearchParams({ access_token: business.meta_page_token }),
        { method: 'DELETE' },
      ).catch(() => {
        // Best effort — token might already be invalid
      });
    }

    // Clear all meta fields
    const { error } = await supabase
      .from('bookbot_businesses')
      .update({
        meta_page_id: null,
        meta_page_token: null,
        meta_page_name: null,
        meta_ig_account_id: null,
        meta_connected_at: null,
      })
      .eq('id', businessId);

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion. Veuillez réessayer.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Disconnect error', { action: 'facebook_oauth_disconnect', error: String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
