import { NextResponse } from 'next/server';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const ip = getClientIp(_req);
  const rl = await rateLimitAsync(`business:${ip}`, { interval: 60_000, limit: 100 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { businessId } = await params;
    const supabase = supabaseAdmin();

    const isUUID = UUID_RE.test(businessId);
    const query = supabase
      .from('bookbot_businesses')
      .select('id, name, services, hours, timezone, chatbot_config, booking_slug, logo_url, bio, brand_color, cancellation_hours, active');

    const { data, error } = await (isUUID
      ? query.eq('id', businessId)
      : query.eq('booking_slug', businessId)
    ).single();

    if (error || !data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Block booking for inactive businesses
    if (data.active === false) {
      return NextResponse.json({ error: 'Ce commerce n\'accepte pas les réservations actuellement.' }, { status: 410 });
    }

    // Don't leak active field to client
    const { active: _, ...publicData } = data;
    return NextResponse.json(publicData, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    logger.error('Business fetch error', { action: 'book_business', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
