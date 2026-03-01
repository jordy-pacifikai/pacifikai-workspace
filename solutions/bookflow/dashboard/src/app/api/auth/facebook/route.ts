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
const FB_API = 'https://graph.facebook.com/v22.0';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

/**
 * POST /api/auth/facebook
 *
 * Receives a short-lived user token from the frontend,
 * exchanges it for a permanent Page Access Token, stores it,
 * and auto-subscribes the page to webhook events.
 *
 * Body: { accessToken: string, businessId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, businessId } = await req.json();

    if (!accessToken || !businessId) {
      return NextResponse.json(
        { error: 'accessToken and businessId are required' },
        { status: 400 },
      );
    }

    if (!FB_APP_SECRET) {
      return NextResponse.json(
        { error: 'FACEBOOK_APP_SECRET is not configured on the server' },
        { status: 500 },
      );
    }

    // ── Step 1: Exchange short-lived → long-lived user token ──────────────
    const exchangeRes = await fetch(
      `${FB_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: accessToken,
        }),
    );
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
      console.error('[Facebook OAuth] Exchange error:', exchangeData.error);
      return NextResponse.json(
        { error: `Facebook token exchange failed: ${exchangeData.error.message}` },
        { status: 400 },
      );
    }

    const longLivedToken = exchangeData.access_token as string;

    // ── Step 2: Get user pages (Page Access Tokens are PERMANENT) ─────────
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
      return NextResponse.json(
        { error: `Failed to fetch pages: ${pagesData.error.message}` },
        { status: 400 },
      );
    }

    const pages: FacebookPage[] = pagesData.data ?? [];

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'Aucune Page Facebook trouvee. Verifie que tu es admin d\'au moins une Page.' },
        { status: 400 },
      );
    }

    // Return the list of pages so the user can choose which one to connect
    return NextResponse.json({
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        access_token: p.access_token,
        instagram_business_account_id: p.instagram_business_account?.id ?? null,
      })),
      businessId,
    });
  } catch (err) {
    console.error('[Facebook OAuth] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
