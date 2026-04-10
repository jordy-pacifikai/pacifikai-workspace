import { NextRequest, NextResponse } from 'next/server';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const FB_APP_ID = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '').trim();
const FB_APP_SECRET = (process.env.FACEBOOK_APP_SECRET ?? '').trim();
const FB_ADMIN_TOKEN = (process.env.FB_ADMIN_TOKEN ?? '').trim();
const FB_API = 'https://graph.facebook.com/v22.0';
const BRIDGE_URL = process.env.MESSENGER_BRIDGE_URL ?? '';
const BRIDGE_SECRET = process.env.MESSENGER_BRIDGE_SECRET ?? '';

/**
 * POST /api/auth/facebook/prepare
 *
 * Adds a Facebook user as "tester" on the Ve'a app BEFORE they do the full OAuth.
 * This allows them to use pages_messaging without App Review.
 *
 * Body: { businessId, facebookUserId }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`auth-fb-prepare:${ip}`, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { businessId, facebookUserId } = body;

    if (!businessId || !facebookUserId) {
      return NextResponse.json({ error: 'businessId and facebookUserId required' }, { status: 400 });
    }

    // Auth: verify caller owns this business
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let added = false;
    let method = 'none';

    // Strategy 1: Use admin user token (preferred — direct Graph API)
    if (FB_ADMIN_TOKEN) {
      try {
        const res = await fetch(`${FB_API}/${FB_APP_ID}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: facebookUserId,
            role: 'testers',
            access_token: FB_ADMIN_TOKEN,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        if (res.ok && data.success !== false) {
          added = true;
          method = 'graph_api_admin_token';
          logger.info('Tester added via admin token', { facebookUserId, businessId });
        } else {
          logger.warn('Graph API tester add failed', { status: res.status, error: JSON.stringify(data) });
        }
      } catch (err) {
        logger.warn('Graph API tester add error', { error: String(err) });
      }
    }

    // Strategy 2: Use app access token (may work for some endpoints)
    if (!added && FB_APP_ID && FB_APP_SECRET) {
      try {
        const appToken = `${FB_APP_ID}|${FB_APP_SECRET}`;
        const res = await fetch(`${FB_API}/${FB_APP_ID}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: facebookUserId,
            role: 'testers',
            access_token: appToken,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        if (res.ok && data.success !== false) {
          added = true;
          method = 'graph_api_app_token';
          logger.info('Tester added via app token', { facebookUserId, businessId });
        } else {
          logger.warn('App token tester add failed (expected)', { status: res.status });
        }
      } catch (err) {
        logger.warn('App token tester add error', { error: String(err) });
      }
    }

    // Strategy 3: Delegate to bridge service
    if (!added && BRIDGE_URL && BRIDGE_SECRET) {
      try {
        const res = await fetch(`${BRIDGE_URL}/bridge/add-tester`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BRIDGE_SECRET}` },
          body: JSON.stringify({ businessId, facebookUserId }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          added = true;
          method = 'bridge_service';
          logger.info('Tester added via bridge', { facebookUserId, businessId });
        }
      } catch (err) {
        logger.warn('Bridge tester add error', { error: String(err) });
      }
    }

    return NextResponse.json({ success: added, method });
  } catch (err) {
    logger.error('Prepare endpoint error', { error: String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
