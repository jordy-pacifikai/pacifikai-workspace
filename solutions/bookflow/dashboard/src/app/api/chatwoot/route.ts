import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const CHATWOOT_API = 'https://app.chatwoot.com/api/v1/accounts/158268';
const CHATWOOT_TOKEN = process.env.CHATWOOT_API_TOKEN || '';

/**
 * POST /api/chatwoot
 *
 * Register a Facebook Page as a Chatwoot inbox, linking it to the business.
 * Called after Facebook OAuth when the client has page tokens.
 *
 * Body: { businessId, pageId, pageName, userAccessToken, pageAccessToken }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`chatwoot-connect:${ip}`, { interval: 60_000, limit: 5 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  const schema = z.object({
    businessId: z.string().uuid(),
    pageId: z.string().min(1),
    pageName: z.string().min(1),
    userAccessToken: z.string().min(1),
    pageAccessToken: z.string().min(1),
  });

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, pageId, pageName, userAccessToken, pageAccessToken } = parsed.data;

    // Auth check
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!CHATWOOT_TOKEN) {
      logger.error('CHATWOOT_API_TOKEN not configured', { action: 'chatwoot_connect' });
      return NextResponse.json({ error: 'Service non configure' }, { status: 500 });
    }

    // Register Facebook Page in Chatwoot
    const chatwootRes = await fetch(`${CHATWOOT_API}/callbacks/register_facebook_page`, {
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

    const chatwootData = await chatwootRes.json();

    if (!chatwootRes.ok) {
      logger.error('Chatwoot register_facebook_page failed', {
        action: 'chatwoot_connect',
        status: chatwootRes.status,
        error: JSON.stringify(chatwootData),
      });
      return NextResponse.json(
        { error: 'Erreur lors de la connexion Chatwoot. La page est peut-etre deja connectee.' },
        { status: 400 },
      );
    }

    // Extract inbox_id from response
    const inboxId = chatwootData.id || chatwootData.inbox_id;
    if (!inboxId) {
      logger.error('No inbox_id in Chatwoot response', { action: 'chatwoot_connect', data: JSON.stringify(chatwootData) });
      return NextResponse.json({ error: 'Reponse Chatwoot invalide' }, { status: 500 });
    }

    // Store in database
    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('bookbot_businesses')
      .update({
        chatwoot_inbox_id: inboxId,
        chatwoot_connected_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      logger.error('DB update failed', { action: 'chatwoot_connect', error: error.message });
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 });
    }

    logger.info('Chatwoot inbox created', {
      action: 'chatwoot_connect',
      businessId,
      inboxId,
      pageName,
    });

    return NextResponse.json({
      success: true,
      inbox_id: inboxId,
      page_name: pageName,
    });
  } catch (err) {
    logger.error('Chatwoot connect error', { action: 'chatwoot_connect', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * GET /api/chatwoot
 *
 * Get Chatwoot connection status for a business.
 * Query: ?business_id=xxx
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`chatwoot-status:${ip}`, { interval: 60_000, limit: 30 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  const businessId = new URL(req.url).searchParams.get('business_id');
  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 });
  }

  try {
    await requireBusinessAccess(businessId);
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('chatwoot_inbox_id, chatwoot_connected_at, ai_enabled, ai_system_prompt')
    .eq('id', businessId)
    .single();

  if (error || !data) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: Boolean(data.chatwoot_inbox_id),
    inbox_id: data.chatwoot_inbox_id,
    connected_at: data.chatwoot_connected_at,
    ai_enabled: data.ai_enabled,
    has_custom_prompt: Boolean(data.ai_system_prompt),
  });
}

/**
 * DELETE /api/chatwoot
 *
 * Disconnect Chatwoot inbox for a business.
 * Body: { businessId }
 */
export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`chatwoot-disconnect:${ip}`, { interval: 60_000, limit: 5 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  const schema = z.object({ businessId: z.string().uuid() });

  try {
    const parsed = schema.safeParse(await req.json());
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

    // Get current inbox_id to delete from Chatwoot
    const { data: business } = await supabase
      .from('bookbot_businesses')
      .select('chatwoot_inbox_id')
      .eq('id', businessId)
      .single();

    if (business?.chatwoot_inbox_id && CHATWOOT_TOKEN) {
      // Delete inbox from Chatwoot (best effort)
      await fetch(`${CHATWOOT_API}/inboxes/${business.chatwoot_inbox_id}`, {
        method: 'DELETE',
        headers: { 'api_access_token': CHATWOOT_TOKEN },
      }).catch(() => {});
    }

    // Clear DB fields
    const { error } = await supabase
      .from('bookbot_businesses')
      .update({
        chatwoot_inbox_id: null,
        chatwoot_connected_at: null,
      })
      .eq('id', businessId);

    if (error) {
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Chatwoot disconnect error', { action: 'chatwoot_disconnect', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * PUT /api/chatwoot
 *
 * Update AI settings for a business.
 * Body: { businessId, aiEnabled?, aiSystemPrompt? }
 */
export async function PUT(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`chatwoot-settings:${ip}`, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  const schema = z.object({
    businessId: z.string().uuid(),
    aiEnabled: z.boolean().optional(),
    aiSystemPrompt: z.string().max(2000).optional(),
  });

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, aiEnabled, aiSystemPrompt } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin();
    const updates: Record<string, unknown> = {};
    if (aiEnabled !== undefined) updates.ai_enabled = aiEnabled;
    if (aiSystemPrompt !== undefined) updates.ai_system_prompt = aiSystemPrompt;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Rien a mettre a jour' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bookbot_businesses')
      .update(updates)
      .eq('id', businessId);

    if (error) {
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Chatwoot settings error', { action: 'chatwoot_settings', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
