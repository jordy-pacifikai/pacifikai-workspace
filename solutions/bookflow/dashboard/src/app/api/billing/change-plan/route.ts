import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServer } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { isUpgrade } from '@/lib/freemius';

const VALID_PLANS = ['decouverte', 'starter', 'pro', 'business'] as const;

const changePlanSchema = z.object({
  planId: z.enum(VALID_PLANS),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 3/min per user
    const { success: rlOk } = rateLimit(`billing-change:${user.id}`, { interval: 60_000, limit: 3 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    // Parse & validate body
    const body = await req.json();
    const parsed = changePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { planId } = parsed.data;

    // Find user's business
    const admin = supabaseAdmin();
    const { data: link, error: linkError } = await admin
      .from('bookbot_business_users')
      .select('business_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (linkError || !link?.business_id) {
      return NextResponse.json({ error: 'Business non trouve' }, { status: 404 });
    }

    const businessId = link.business_id as string;

    // Get current plan for logging
    const { data: currentBiz } = await admin
      .from('bookbot_businesses')
      .select('plan, name')
      .eq('id', businessId)
      .single();

    const previousPlan = (currentBiz?.plan as string) ?? 'none';
    const businessName = (currentBiz?.name as string) ?? 'unknown';

    // Upgrades sont gérés côté client via Freemius checkout popup — bloquer ici
    if (isUpgrade(previousPlan, planId)) {
      return NextResponse.json(
        { error: 'Les upgrades se font via le checkout Freemius depuis la page facturation.' },
        { status: 403 },
      );
    }

    // Note: le changement de plan côté Freemius se fait via le portail client
    // (https://checkout.freemius.com/my) ou par webhook entrant.
    // Ici on met à jour uniquement la DB — Freemius synchronise via webhook.

    // Mise à jour du plan en base
    const { error: updateError } = await admin
      .from('bookbot_businesses')
      .update({
        plan: planId,
        // Annulation de l'abonnement actif si downgrade vers decouverte
        ...(planId === 'decouverte' ? { subscription_status: 'cancelled' } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateError) {
      logger.error('Failed to update plan', {
        action: 'billing.change-plan',
        businessId,
        userId: user.id,
      });
      return NextResponse.json({ error: 'Erreur lors du changement de plan' }, { status: 500 });
    }

    logger.info('Plan changed', {
      action: 'billing.change-plan',
      businessId,
      userId: user.id,
      previousPlan,
      newPlan: planId,
      businessName,
    });

    return NextResponse.json({
      success: true,
      plan: planId,
      message: `Plan mis a jour : ${planId}`,
    });
  } catch (err) {
    logger.error('Unexpected error in change-plan', {
      action: 'billing.change-plan',
      error: String(err),
    });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
