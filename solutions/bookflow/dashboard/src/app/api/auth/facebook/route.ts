import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET ?? '';
const FB_CONFIG_ID = process.env.FACEBOOK_CONFIG_ID ?? '2536440043437319';
const FB_API = 'https://graph.facebook.com/v22.0';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vea.pacifikai.com';
const REDIRECT_URI = `${SITE_URL}/api/auth/facebook`;

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
  const supabase = getSupabase();

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
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // ── OAuth callback ──────────────────────────────────────────────────────
  if (code && state) {
    try {
      const businessId = state;

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
        console.error('[Facebook OAuth] Token exchange error:', tokenData.error);
        return NextResponse.redirect(
          `${SITE_URL}/channels?fb_error=${encodeURIComponent(tokenData.error.message)}`,
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
        console.error('[Facebook OAuth] Pages fetch error:', pagesData.error);
        return NextResponse.redirect(
          `${SITE_URL}/channels?fb_error=${encodeURIComponent(pagesData.error.message)}`,
        );
      }

      const pages: FacebookPage[] = pagesData.data ?? [];

      if (pages.length === 0) {
        return NextResponse.redirect(
          `${SITE_URL}/channels?fb_error=${encodeURIComponent('Aucune Page Facebook trouvee. Verifie que tu es admin d\'au moins une Page.')}`,
        );
      }

      // Auto-connect if only one page
      if (pages.length === 1) {
        await autoConnectPage(pages[0], businessId);
        return NextResponse.redirect(`${SITE_URL}/channels?fb_connected=true`);
      }

      // Multiple pages — encode in URL for frontend picker
      const pagesParam = pages.map((p) => ({
        id: p.id,
        name: p.name,
        access_token: p.access_token,
        instagram_business_account_id: p.instagram_business_account?.id ?? null,
      }));

      return NextResponse.redirect(
        `${SITE_URL}/channels?fb_pages=${encodeURIComponent(JSON.stringify(pagesParam))}`,
      );
    } catch (err) {
      console.error('[Facebook OAuth] Callback error:', err);
      return NextResponse.redirect(
        `${SITE_URL}/channels?fb_error=${encodeURIComponent('Erreur interne lors de la connexion Facebook')}`,
      );
    }
  }

  // ── User cancelled or error from Facebook ──────────────────────────────
  if (errorParam) {
    return NextResponse.redirect(
      `${SITE_URL}/channels?fb_error=${encodeURIComponent(errorParam)}`,
    );
  }

  // ── Start OAuth flow ────────────────────────────────────────────────────
  const businessId = url.searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 });
  }

  const scopes = [
    'pages_show_list',
    'pages_manage_metadata',
    'pages_messaging',
    'instagram_manage_messages',
    'public_profile',
  ].join(',');

  const oauthUrl =
    `https://www.facebook.com/v22.0/dialog/oauth?` +
    new URLSearchParams({
      client_id: FB_APP_ID,
      redirect_uri: REDIRECT_URI,
      config_id: FB_CONFIG_ID,
      state: businessId,
      response_type: 'code',
    });

  return NextResponse.redirect(oauthUrl);
}

/**
 * POST /api/auth/facebook — kept for backwards compat (unused now).
 */
export async function POST(req: NextRequest) {
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
  try {
    const { businessId, pageId, pageName, pageToken, igAccountId } = await req.json();

    if (!businessId || !pageId || !pageToken) {
      return NextResponse.json(
        { error: 'businessId, pageId, and pageToken are required' },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

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
      console.error('[Facebook OAuth] Webhook subscribe error:', subscribeData.error);
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
      console.error('[Facebook OAuth] DB update error:', error);
      return NextResponse.json(
        { error: `Database update failed: ${error.message}` },
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
    console.error('[Facebook OAuth] Connect error:', err);
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
  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const supabase = getSupabase();

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
        { error: `Database update failed: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Facebook OAuth] Disconnect error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
