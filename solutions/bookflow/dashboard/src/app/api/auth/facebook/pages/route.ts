import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';

/**
 * GET /api/auth/facebook/pages?session=<id>
 *
 * Retrieves Facebook page options from a short-lived server-side session.
 * Tokens never appear in URLs — only the ephemeral session ID does.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`fb-pages-get:${ip}`, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  const sessionId = req.nextUrl.searchParams.get('session');
  if (!sessionId) {
    return NextResponse.json({ error: 'session required' }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from('bookbot_fb_page_sessions')
    .select('pages, expires_at, business_id')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Session introuvable ou expiree' }, { status: 404 });
  }

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    // Clean up expired session
    await sb.from('bookbot_fb_page_sessions').delete().eq('id', sessionId);
    return NextResponse.json({ error: 'Session expiree' }, { status: 410 });
  }

  // Delete session after read (one-time use)
  await sb.from('bookbot_fb_page_sessions').delete().eq('id', sessionId);

  return NextResponse.json({ pages: data.pages, businessId: data.business_id });
}
