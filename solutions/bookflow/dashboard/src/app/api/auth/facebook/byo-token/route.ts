import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { registerPageWithPoller } from '@/lib/page-poller';

const FB_API = 'https://graph.facebook.com/v22.0';

const REQUIRED_SCOPES = ['pages_messaging', 'pages_manage_metadata'];

const bodySchema = z.object({
  businessId: z.string().uuid(),
  pageToken: z.string().min(50),
});

interface DebugTokenData {
  app_id?: string;
  type?: string;
  application?: string;
  expires_at?: number;
  is_valid?: boolean;
  issued_at?: number;
  profile_id?: string;
  scopes?: string[];
  error?: { message?: string; code?: number };
}

/**
 * POST /api/auth/facebook/byo-token
 *
 * Bring-Your-Own-Token flow: client paste a permanent Page Access Token
 * generated via Meta Business Suite (System User → Generate Token).
 *
 * No App Review, no OAuth dance. Just validate the token and store it.
 *
 * Body: { businessId, pageToken }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`auth-byo-token:${ip}`, {
    interval: 60_000,
    limit: 10,
  });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Champs invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { businessId, pageToken } = parsed.data;

  // Auth: caller must own the business
  try {
    await requireBusinessAccess(businessId);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Step 1: verify token via /me — confirms it's alive and gets page info
  const meRes = await fetch(
    `${FB_API}/me?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(pageToken)}`,
    { signal: AbortSignal.timeout(10000) },
  );
  const meData = await meRes.json();

  if (!meRes.ok || !meData.id) {
    return NextResponse.json(
      {
        error: 'Token invalide',
        detail: meData.error?.message ?? 'Le token n\'est pas reconnu par Facebook.',
      },
      { status: 400 },
    );
  }

  const pageId = meData.id as string;
  const pageName = (meData.name as string) ?? 'Facebook Page';
  const igAccountId = meData.instagram_business_account?.id ?? null;

  // Step 2: debug_token — confirm type=PAGE, scopes, never expires
  const debugRes = await fetch(
    `${FB_API}/debug_token?input_token=${encodeURIComponent(pageToken)}&access_token=${encodeURIComponent(pageToken)}`,
    { signal: AbortSignal.timeout(10000) },
  );
  const debugJson = await debugRes.json();
  const debug = debugJson.data as DebugTokenData | undefined;

  if (!debug || debug.error) {
    return NextResponse.json(
      {
        error: 'Impossible de valider le token',
        detail: debug?.error?.message ?? 'debug_token a echoue',
      },
      { status: 400 },
    );
  }

  if (debug.type !== 'PAGE') {
    return NextResponse.json(
      {
        error: 'Mauvais type de token',
        detail: `Le token recu est de type "${debug.type ?? 'inconnu'}". Vous devez utiliser un Page Access Token (depuis Business Settings → System Users → Generate Token, en assignant la Page).`,
      },
      { status: 400 },
    );
  }

  if (debug.is_valid !== true) {
    return NextResponse.json(
      {
        error: 'Token expire ou revoque',
        detail: 'Generez un nouveau token et reessayez.',
      },
      { status: 400 },
    );
  }

  // Permanent token → expires_at === 0 (or undefined per FB docs)
  // Long-lived but not permanent → expires_at > now (still acceptable, warn)
  const expiresAt = debug.expires_at ?? 0;
  const isPermanent = expiresAt === 0;

  // Verify required scopes
  const scopes = debug.scopes ?? [];
  const missingScopes = REQUIRED_SCOPES.filter((s) => !scopes.includes(s));
  if (missingScopes.length > 0) {
    return NextResponse.json(
      {
        error: 'Permissions manquantes',
        detail: `Le token doit avoir les permissions : ${missingScopes.join(', ')}. Re-generez le token avec ces permissions cochees.`,
        missingScopes,
      },
      { status: 400 },
    );
  }

  // Step 3: store in DB
  const supabase = supabaseAdmin();
  const { error: dbErr } = await supabase
    .from('bookbot_businesses')
    .update({
      meta_page_id: pageId,
      meta_page_name: pageName,
      meta_page_token: pageToken,
      meta_ig_account_id: igAccountId,
      meta_connected_at: new Date().toISOString(),
      meta_token_status: 'valid',
    })
    .eq('id', businessId);

  if (dbErr) {
    logger.error('BYO token DB update failed', {
      action: 'byo_token',
      businessId,
      error: dbErr.message,
    });
    return NextResponse.json(
      { error: 'Erreur de sauvegarde, reessayez.' },
      { status: 500 },
    );
  }

  // Step 4: register page with inbox poller (non-blocking)
  registerPageWithPoller({
    pageId,
    pageName,
    pageToken,
    businessId,
  }).catch(() => {});

  logger.info('BYO token connected', {
    action: 'byo_token',
    businessId,
    pageId,
    pageName,
    isPermanent,
  });

  return NextResponse.json({
    ok: true,
    page: {
      id: pageId,
      name: pageName,
      instagram: Boolean(igAccountId),
    },
    token: {
      permanent: isPermanent,
      expiresAt,
      scopes,
    },
  });
}
