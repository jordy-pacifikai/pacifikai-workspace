import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, getUserBusinessId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// GET /api/account/export
export async function GET(_req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { success } = rateLimit(`account-export:${user.id}`, { interval: 3600_000, limit: 3 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const businessId = await getUserBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: 'Aucun business associe' }, { status: 404 });
    }

    const sb = supabaseAdmin();

    // Fetch all data in parallel — whitelist columns to exclude OAuth tokens/secrets
    const BUSINESS_COLS = 'id, name, plan, timezone, services, hours, config, booking_slug, logo_url, bio, brand_color, phone, active, cancellation_hours, conversation_count, subscription_status, trial_ends_at, created_at';
    const CLIENT_COLS = 'id, name, email, phone, tags, notes, loyalty_points, visit_count, last_visit_at, marketing_opt_out, created_at';
    const APPOINTMENT_COLS = 'id, service, appointment_date, time_slot, end_time, status, client_name, client_email, client_phone, client_notes, price, source, reminder_sent, followup_sent_at, created_at, updated_at';
    const REVIEW_COLS = 'id, client_name, rating, comment, created_at';

    const [businessResult, clientsResult, appointmentsResult, reviewsResult] = await Promise.all([
      sb.from('bookbot_businesses').select(BUSINESS_COLS).eq('id', businessId).single(),
      sb.from('bookbot_clients').select(CLIENT_COLS).eq('business_id', businessId).order('created_at', { ascending: true }),
      sb.from('bookbot_appointments').select(APPOINTMENT_COLS).eq('business_id', businessId).order('scheduled_at', { ascending: true }).limit(100_000),
      sb.from('bookbot_reviews').select(REVIEW_COLS).eq('business_id', businessId).order('created_at', { ascending: true }),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      export_version: '1.0',
      user: {
        id: user.id,
        email: user.email,
      },
      business: businessResult.data ?? null,
      clients: clientsResult.data ?? [],
      appointments: appointmentsResult.data ?? [],
      reviews: reviewsResult.data ?? [],
    };

    const today = new Date().toISOString().slice(0, 10);
    const filename = `vea-export-${today}.json`;

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    logger.error('Account export error', { action: 'account_export', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
