import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/book/[businessId]/reviews
// Returns { avg: number, count: number } or { avg: 0, count: 0 } when no reviews.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  // Rate limit: 30/min per IP
  const ip = getClientIp(_req);
  const { success: rlOk } = rateLimit(`book-reviews:${ip}`, { interval: 60_000, limit: 30 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  try {
  const { businessId } = await params;
  const supabase = supabaseAdmin();

  // Resolve slug → UUID if needed
  let resolvedId = businessId;
  if (!UUID_RE.test(businessId)) {
    const { data } = await supabase
      .from('bookbot_businesses')
      .select('id')
      .eq('booking_slug', businessId)
      .single();
    if (!data) {
      return NextResponse.json({ avg: 0, count: 0 });
    }
    resolvedId = data.id as string;
  }

  // Query reviews from bookbot_review_requests where rating is not null
  const { data, error } = await supabase
    .from('bookbot_review_requests')
    .select('rating')
    .eq('business_id', resolvedId)
    .not('rating', 'is', null);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ avg: 0, count: 0 });
  }

  const ratings = data
    .map((r: { rating: number | null }) => r.rating)
    .filter((v): v is number => typeof v === 'number');

  if (ratings.length === 0) {
    return NextResponse.json({ avg: 0, count: 0 });
  }

  const avg = ratings.reduce((sum, v) => sum + v, 0) / ratings.length;

  return NextResponse.json({
    avg: Math.round(avg * 10) / 10,
    count: ratings.length,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  });
  } catch (err) {
    logger.error('Reviews fetch error', { action: 'book_reviews', error: String(err) });
    return NextResponse.json({ avg: 0, count: 0 });
  }
}
