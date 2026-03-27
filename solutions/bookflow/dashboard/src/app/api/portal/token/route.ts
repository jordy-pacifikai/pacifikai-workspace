import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { generatePortalToken } from '@/lib/portal-token';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const clientIdSchema = z.string().uuid();

/**
 * GET /api/portal/token?clientId=xxx
 * Returns the portal URL for a client.
 * Protected: requires authenticated user who owns the client's business.
 */
export async function GET(req: Request) {
  // Rate limit: 10/min per IP
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`portal-token:${ip}`, { interval: 60_000, limit: 10 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const rawClientId = searchParams.get('clientId');

  const result = clientIdSchema.safeParse(rawClientId);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid clientId', details: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const clientId = result.data;
    const sb = supabaseAdmin();

    // Verify client exists and get their business_id
    const { data: client, error } = await sb
      .from('bookbot_clients')
      .select('id, business_id')
      .eq('id', clientId)
      .single<{ id: string; business_id: string }>();

    if (error || !client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    // Verify the authenticated user owns this client's business
    try {
      await requireBusinessAccess(client.business_id);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = generatePortalToken(clientId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vea.pacifikai.com';
    const portalUrl = `${baseUrl}/portal/${token}`;

    return NextResponse.json({ portalUrl });
  } catch (err) {
    logger.error('Portal token error', { action: 'portal_token', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
