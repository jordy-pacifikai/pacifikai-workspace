import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FB_APP_ID || '';
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET || process.env.FB_APP_SECRET || '';
const GRAPH_API = 'https://graph.facebook.com/v22.0';

/**
 * GET /api/messenger/oauth-callback
 *
 * Facebook OAuth redirect callback.
 * Receives authorization code, exchanges for tokens, lists pages,
 * stores in a temporary session, and redirects to /channels.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // businessId
  const errorParam = searchParams.get('error');

  // User denied or error
  if (errorParam || !code) {
    const reason = searchParams.get('error_description') || 'Connexion Facebook annulee';
    logger.warn('FB OAuth denied', { error: errorParam, reason });
    return NextResponse.redirect(
      new URL(`/channels?fb_error=${encodeURIComponent(reason)}`, req.url),
    );
  }

  if (!state) {
    return NextResponse.redirect(new URL('/channels?fb_error=Session+invalide', req.url));
  }

  if (!FB_APP_ID || !FB_APP_SECRET) {
    logger.error('FB_APP_ID or FB_APP_SECRET not configured');
    return NextResponse.redirect(new URL('/channels?fb_error=Service+non+configure', req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/messenger/oauth-callback`;

  try {
    // 1. Exchange code for short-lived user token
    const tokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FB_APP_SECRET}&code=${encodeURIComponent(code)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      logger.error('FB code exchange failed', { status: tokenRes.status, error: JSON.stringify(tokenData) });
      return NextResponse.redirect(
        new URL('/channels?fb_error=Erreur+echange+token+Facebook', req.url),
      );
    }

    const shortToken = tokenData.access_token;

    // 2. Exchange short-lived for long-lived token (60 days)
    const llRes = await fetch(
      `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${encodeURIComponent(shortToken)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    const llData = await llRes.json();

    if (!llRes.ok || !llData.access_token) {
      logger.error('FB long-lived token exchange failed', { status: llRes.status, error: JSON.stringify(llData) });
      return NextResponse.redirect(
        new URL('/channels?fb_error=Erreur+token+longue+duree', req.url),
      );
    }

    const longLivedToken = llData.access_token;

    // 3. List pages
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(longLivedToken)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    const pagesData = await pagesRes.json();

    if (!pagesRes.ok || !pagesData.data) {
      logger.error('FB list pages failed', { status: pagesRes.status, error: JSON.stringify(pagesData) });
      return NextResponse.redirect(
        new URL('/channels?fb_error=Impossible+de+recuperer+tes+Pages', req.url),
      );
    }

    const pages = pagesData.data as Array<{ id: string; name: string; access_token: string }>;

    if (pages.length === 0) {
      return NextResponse.redirect(
        new URL('/channels?fb_error=Aucune+Page+Facebook+trouvee', req.url),
      );
    }

    // 4. If only one page, auto-connect it
    if (pages.length === 1) {
      const page = pages[0];

      // Verify page token
      const verifyRes = await fetch(
        `${GRAPH_API}/me?fields=id,name&access_token=${encodeURIComponent(page.access_token)}`,
        { signal: AbortSignal.timeout(10000) },
      );
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.id === page.id) {
        const supabase = supabaseAdmin();
        await supabase
          .from('bookbot_businesses')
          .update({
            meta_page_id: page.id,
            meta_page_name: page.name,
            meta_page_token: page.access_token,
            meta_user_token: longLivedToken,
            meta_connected_at: new Date().toISOString(),
            meta_token_status: 'valid',
          })
          .eq('id', state);

        logger.info('Messenger page auto-connected via OAuth', { businessId: state, pageId: page.id, pageName: page.name });

        return NextResponse.redirect(
          new URL('/channels?fb_success=Page+connectee+avec+succes', req.url),
        );
      }
    }

    // 5. Multiple pages — store in temp session for picker UI
    const supabase = supabaseAdmin();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min TTL

    await supabase
      .from('bookbot_fb_page_sessions')
      .insert({
        business_id: state,
        pages: pages.map((p) => ({ id: p.id, name: p.name, access_token: p.access_token })),
        user_token: longLivedToken,
        expires_at: expiresAt,
      });

    return NextResponse.redirect(
      new URL('/channels?fb_pick_pages=true', req.url),
    );
  } catch (err) {
    logger.error('FB OAuth callback error', { error: String(err) });
    return NextResponse.redirect(
      new URL('/channels?fb_error=Erreur+interne', req.url),
    );
  }
}
