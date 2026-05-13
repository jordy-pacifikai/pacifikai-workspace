import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { registerPageWithPoller } from '@/lib/page-poller';
import { z } from 'zod';

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FB_APP_ID || '';
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET || process.env.FB_APP_SECRET || '';
const GRAPH_API = 'https://graph.facebook.com/v22.0';

/**
 * POST /api/messenger/connect
 *
 * Direct Facebook Graph API integration (no Chatwoot dependency).
 * Uses our own FB app in dev mode — polling-based, no webhooks needed.
 *
 * Actions:
 * - list-pages: Exchange short-lived user token → long-lived → list pages
 * - connect-page: Store page token + register with Chatwoot (optional)
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`messenger-connect:${ip}`, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  if (!FB_APP_ID || !FB_APP_SECRET) {
    logger.error('FB_APP_ID or FB_APP_SECRET not configured');
    return NextResponse.json({ error: 'Service non configure' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    // ── List Pages ──────────────────────────────────────────────────────
    if (action === 'list-pages') {
      const schema = z.object({
        action: z.literal('list-pages'),
        businessId: z.string().uuid(),
        fbUserToken: z.string().min(10),
      });

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }

      const { businessId, fbUserToken } = parsed.data;

      try {
        await requireBusinessAccess(businessId);
      } catch (authError) {
        if (authError instanceof NextResponse) return authError;
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Exchange short-lived token for long-lived token (60 days)
      const llRes = await fetch(
        `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${encodeURIComponent(fbUserToken)}`,
        { signal: AbortSignal.timeout(10000) },
      );
      const llData = await llRes.json();

      if (!llRes.ok || !llData.access_token) {
        logger.error('FB token exchange failed', { status: llRes.status, error: JSON.stringify(llData) });
        return NextResponse.json(
          { error: 'Erreur lors de l\'echange du token Facebook. Reessaye.' },
          { status: 400 },
        );
      }

      const longLivedToken = llData.access_token;

      // List pages the user manages
      const pagesRes = await fetch(
        `${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(longLivedToken)}`,
        { signal: AbortSignal.timeout(10000) },
      );
      const pagesData = await pagesRes.json();

      if (!pagesRes.ok || !pagesData.data) {
        logger.error('FB list pages failed', { status: pagesRes.status, error: JSON.stringify(pagesData) });
        return NextResponse.json(
          { error: 'Impossible de recuperer tes Pages Facebook.' },
          { status: 400 },
        );
      }

      // Page tokens from /me/accounts with a long-lived user token are never-expiring
      return NextResponse.json({
        pages: pagesData.data.map((p: { id: string; name: string; access_token: string }) => ({
          id: p.id,
          name: p.name,
          access_token: p.access_token,
        })),
        userAccessToken: longLivedToken,
      });
    }

    // ── Connect Page ────────────────────────────────────────────────────
    if (action === 'connect-page') {
      const schema = z.object({
        action: z.literal('connect-page'),
        businessId: z.string().uuid(),
        pageId: z.string().min(1),
        pageName: z.string().min(1),
        pageAccessToken: z.string().min(10),
        userAccessToken: z.string().min(10),
      });

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }

      const { businessId, pageId, pageName, pageAccessToken, userAccessToken } = parsed.data;

      try {
        await requireBusinessAccess(businessId);
      } catch (authError) {
        if (authError instanceof NextResponse) return authError;
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify the page token is valid
      const verifyRes = await fetch(
        `${GRAPH_API}/me?fields=id,name&access_token=${encodeURIComponent(pageAccessToken)}`,
        { signal: AbortSignal.timeout(10000) },
      );
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || verifyData.id !== pageId) {
        return NextResponse.json({ error: 'Token de page invalide' }, { status: 400 });
      }

      // Store in database
      const supabase = supabaseAdmin();
      const { error } = await supabase
        .from('bookbot_businesses')
        .update({
          meta_page_id: pageId,
          meta_page_name: pageName,
          meta_page_token: pageAccessToken,
          meta_user_token: userAccessToken,
          meta_connected_at: new Date().toISOString(),
          meta_token_status: 'valid',
        })
        .eq('id', businessId);

      if (error) {
        logger.error('DB update failed', { action: 'messenger_connect', error: error.message });
        return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 });
      }

      // Also register in Chatwoot (optional, for dashboard view)
      const chatwootToken = process.env.CHATWOOT_API_TOKEN;
      if (chatwootToken) {
        try {
          const cwRes = await fetch('https://app.chatwoot.com/api/v1/accounts/158268/callbacks/register_facebook_page', {
            method: 'POST',
            headers: { 'api_access_token': chatwootToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_access_token: userAccessToken,
              page_access_token: pageAccessToken,
              page_id: pageId,
              inbox_name: pageName,
            }),
            signal: AbortSignal.timeout(10000),
          });
          const cwData = await cwRes.json();
          if (cwRes.ok && cwData.id) {
            await supabase
              .from('bookbot_businesses')
              .update({ chatwoot_inbox_id: cwData.id, chatwoot_connected_at: new Date().toISOString() })
              .eq('id', businessId);
          }
        } catch {
          // Non-blocking — Chatwoot registration is optional
          logger.warn('Chatwoot registration failed (non-blocking)', { businessId });
        }
      }

      // Register page with the inbox poller (non-blocking)
      registerPageWithPoller({
        pageId,
        pageName,
        pageToken: pageAccessToken,
        businessId,
      }).catch(() => {});

      logger.info('Messenger page connected', { action: 'messenger_connect', businessId, pageId, pageName });

      return NextResponse.json({
        success: true,
        page_id: pageId,
        page_name: pageName,
      });
    }

    // ── Load Page Session (for multi-page picker after OAuth) ─────────
    if (action === 'load-page-session') {
      const schema = z.object({
        action: z.literal('load-page-session'),
        businessId: z.string().uuid(),
      });

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }

      const { businessId } = parsed.data;

      try {
        await requireBusinessAccess(businessId);
      } catch (authError) {
        if (authError instanceof NextResponse) return authError;
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const supabase = supabaseAdmin();
      const { data: session } = await supabase
        .from('bookbot_fb_page_sessions')
        .select('id, pages, user_token, expires_at')
        .eq('business_id', businessId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!session) {
        return NextResponse.json({ error: 'Session expiree, reessaie la connexion.' }, { status: 404 });
      }

      // Delete session after read (one-time use)
      await supabase.from('bookbot_fb_page_sessions').delete().eq('id', session.id);

      return NextResponse.json({
        pages: session.pages,
        userToken: session.user_token,
      });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    logger.error('Messenger connect error', { action: 'messenger_connect', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
