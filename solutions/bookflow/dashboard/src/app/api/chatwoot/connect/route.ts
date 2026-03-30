import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const CHATWOOT_API = 'https://app.chatwoot.com/api/v1/accounts/158268';
const CHATWOOT_TOKEN = process.env.CHATWOOT_API_TOKEN || '';

/**
 * POST /api/chatwoot/connect
 *
 * Step 1: Exchange FB user token for page list via Chatwoot.
 * Body: { action: 'list-pages', businessId, fbUserToken }
 *
 * Step 2: Register selected page as Chatwoot inbox.
 * Body: { action: 'register-page', businessId, pageId, pageName, pageAccessToken, userAccessToken }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`chatwoot-connect:${ip}`, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  if (!CHATWOOT_TOKEN) {
    return NextResponse.json({ error: 'Service non configure' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    // ── List Pages ────────────────────────────────────────────────────────
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

      // Call Chatwoot to exchange token and list pages
      const res = await fetch(`${CHATWOOT_API}/callbacks/facebook_pages`, {
        method: 'POST',
        headers: {
          'api_access_token': CHATWOOT_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ omniauth_token: fbUserToken }),
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json();

      if (!res.ok || !data.data) {
        logger.error('Chatwoot facebook_pages failed', {
          action: 'chatwoot_list_pages',
          status: res.status,
          error: JSON.stringify(data),
        });
        return NextResponse.json(
          { error: data.error || 'Erreur lors de la recuperation des pages Facebook' },
          { status: 400 },
        );
      }

      // Return pages list + user token (Chatwoot exchanges for long-lived)
      return NextResponse.json({
        pages: (data.data.page_details || []).map((p: { id: string; name: string; access_token: string }) => ({
          id: p.id,
          name: p.name,
          access_token: p.access_token,
        })),
        userAccessToken: data.data.user_access_token,
      });
    }

    // ── Register Page ─────────────────────────────────────────────────────
    if (action === 'register-page') {
      const schema = z.object({
        action: z.literal('register-page'),
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

      // Register page in Chatwoot
      const res = await fetch(`${CHATWOOT_API}/callbacks/register_facebook_page`, {
        method: 'POST',
        headers: {
          'api_access_token': CHATWOOT_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_access_token: userAccessToken,
          page_access_token: pageAccessToken,
          page_id: pageId,
          inbox_name: pageName,
        }),
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json();

      if (!res.ok) {
        logger.error('Chatwoot register_facebook_page failed', {
          action: 'chatwoot_register_page',
          status: res.status,
          error: JSON.stringify(data),
        });
        return NextResponse.json(
          { error: 'Erreur lors de la connexion. La page est peut-etre deja connectee a un autre compte.' },
          { status: 400 },
        );
      }

      const inboxId = data.id;

      // Store in our database
      const supabase = supabaseAdmin();
      const { error } = await supabase
        .from('bookbot_businesses')
        .update({
          chatwoot_inbox_id: inboxId,
          chatwoot_connected_at: new Date().toISOString(),
          meta_page_id: pageId,
          meta_page_name: pageName,
          meta_connected_at: new Date().toISOString(),
          meta_token_status: 'valid',
        })
        .eq('id', businessId);

      if (error) {
        logger.error('DB update failed', { action: 'chatwoot_register_page', error: error.message });
        return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 });
      }

      logger.info('Chatwoot page registered', {
        action: 'chatwoot_register_page',
        businessId,
        inboxId,
        pageName,
      });

      return NextResponse.json({
        success: true,
        inbox_id: inboxId,
        page_name: pageName,
      });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    logger.error('Chatwoot connect error', { action: 'chatwoot_connect', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
