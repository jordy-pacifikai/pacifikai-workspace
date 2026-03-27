import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const reviewSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  rating: z.number().int().min(1).max(5, 'Note entre 1 et 5 requise'),
  comment: z.string().max(2000, 'Commentaire limité à 2000 caractères').optional(),
  email: z.string().email('Format email invalide').optional().or(z.literal('')),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`reviews:${ip}`, { interval: 60_000, limit: 5 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Donnees invalides';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { token, rating, comment } = parsed.data;

    const sb = supabaseAdmin();

    // Fetch review request by token
    const { data: review, error: fetchErr } = await sb
      .from('bookbot_review_requests')
      .select('id, business_id, client_name, status, expires_at')
      .eq('token', token)
      .single() as { data: { id: string; business_id: string; client_name: string | null; status: string; expires_at: string | null } | null; error: unknown };

    if (fetchErr || !review) {
      return NextResponse.json({ error: 'Lien invalide ou expire' }, { status: 404 });
    }

    // Check expiry (14 days from creation)
    if (review.expires_at && new Date(review.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Ce lien a expire' }, { status: 410 });
    }

    if (review.status === 'submitted') {
      return NextResponse.json({ error: 'Avis deja soumis' }, { status: 409 });
    }

    const { error: updateErr } = await sb
      .from('bookbot_review_requests')
      .update({
        rating,
        comment: comment?.trim() || null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', review.id);

    if (updateErr) {
      logger.error('DB update error', { action: 'review_submit', error: String(updateErr) });
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Create in-app notification for the business owner (non-blocking)
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    void sb
      .from('bookbot_notifications')
      .insert({
        business_id: review.business_id,
        type: 'review',
        title: `Nouvel avis ${stars}`,
        message: review.client_name
          ? `${review.client_name} a laissé un avis ${rating}/5${comment ? ` : "${comment.slice(0, 80)}${comment.length > 80 ? '...' : ''}"` : ''}`
          : `Un client a laissé un avis ${rating}/5`,
        is_read: false,
        metadata: { reviewRequestId: review.id, rating },
      })
      .then(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Unexpected error', { action: 'review_submit', error: String(err) });
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
