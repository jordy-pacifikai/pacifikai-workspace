import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServer } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 2/hour per user (one-time action anyway, but guard against abuse)
    const { success: rlOk } = rateLimit(`extend-trial:${user.id}`, { interval: 3_600_000, limit: 2 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const admin = supabaseAdmin();

    // Find user's business
    const { data: link, error: linkError } = await admin
      .from('bookbot_business_users')
      .select('business_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (linkError || !link?.business_id) {
      return NextResponse.json({ error: 'Business non trouvé' }, { status: 404 });
    }

    const businessId = link.business_id as string;

    // Get current business state
    const { data: biz, error: bizError } = await admin
      .from('bookbot_businesses')
      .select('subscription_status, trial_ends_at, trial_extended, plan')
      .eq('id', businessId)
      .single();

    if (bizError || !biz) {
      return NextResponse.json({ error: 'Business non trouvé' }, { status: 404 });
    }

    // Only allow for trial or expired status
    const status = biz.subscription_status as string;
    if (status !== 'trial' && status !== 'expired') {
      return NextResponse.json(
        { error: 'Extension disponible uniquement pendant ou après l\'essai gratuit' },
        { status: 400 },
      );
    }

    // One-time only
    if (biz.trial_extended === true) {
      return NextResponse.json(
        { error: 'L\'extension d\'essai a déjà été utilisée' },
        { status: 400 },
      );
    }

    // Extend trial_ends_at by 7 days from current value (or from now if already expired)
    const base = biz.trial_ends_at
      ? new Date(biz.trial_ends_at as string)
      : new Date();
    // If already in the past, extend from now
    const baseDate = base < new Date() ? new Date() : base;
    const newTrialEnd = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await admin
      .from('bookbot_businesses')
      .update({
        trial_ends_at: newTrialEnd.toISOString(),
        trial_extended: true,
        // If expired, reactivate to trial
        ...(status === 'expired' ? { subscription_status: 'trial' } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateError) {
      logger.error('Failed to extend trial', {
        action: 'billing.extend-trial',
        businessId,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erreur lors de l\'extension' }, { status: 500 });
    }

    logger.info('Trial extended by 7 days', {
      action: 'billing.extend-trial',
      businessId,
      userId: user.id,
      newTrialEnd: newTrialEnd.toISOString(),
    });

    return NextResponse.json({
      success: true,
      newTrialEnd: newTrialEnd.toISOString(),
      message: 'Essai étendu de 7 jours',
    });
  } catch (err) {
    logger.error('Unexpected error in extend-trial', {
      action: 'billing.extend-trial',
      error: String(err),
    });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
