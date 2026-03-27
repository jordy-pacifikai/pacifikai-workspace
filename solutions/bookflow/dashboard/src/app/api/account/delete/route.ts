import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, getUserBusinessId } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// POST /api/account/delete
export async function POST(_req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { success } = rateLimit(`account-delete:${user.id}`, { interval: 60_000, limit: 3 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const businessId = await getUserBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: 'Aucun business associe' }, { status: 404 });
    }

    const sb = supabaseAdmin();

    // Soft delete — mark deletion_requested_at, actual purge after 30 days
    const { error } = await sb
      .from('bookbot_businesses')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_requested_by: user.id,
      })
      .eq('id', businessId);

    if (error) {
      logger.error('Account deletion failed', { action: 'account_delete', error: String(error) });
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Demande de suppression enregistree. Votre compte et toutes vos donnees seront supprimes dans 30 jours.',
      scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    logger.error('Account delete error', { action: 'account_delete', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
