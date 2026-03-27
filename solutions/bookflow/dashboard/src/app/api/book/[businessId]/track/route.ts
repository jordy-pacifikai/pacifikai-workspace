import { NextResponse } from 'next/server';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { resolveBusinessId } from '@/lib/resolve-business';

const VALID_EVENTS = new Set([
  'page_view',
  'service_selected',
  'date_selected',
  'booking_confirmed',
]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  // Rate limit: 100/min per IP (analytics events)
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`book-track:${ip}`, { interval: 60_000, limit: 100 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const { businessId: rawId } = await params;

  let body: { event?: string };
  try {
    body = (await req.json()) as { event?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event } = body;
  if (!event || !VALID_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const business = await resolveBusinessId(rawId);
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }
  const businessId = business.id;

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('bookbot_page_views').insert({
    business_id: businessId,
    event,
  });

  if (error) {
    logger.error('Track insert failed', { action: 'booking_track', error: error.message });
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
