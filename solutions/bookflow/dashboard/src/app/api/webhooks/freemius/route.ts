// ─── Webhook Freemius ────────────────────────────────────────────────────────
// Endpoint POST /api/webhooks/freemius
// Reçoit les événements Freemius et met à jour bookbot_businesses.
//
// Signature verification : Freemius signe chaque requête avec HMAC-SHA256
// en utilisant la secret_key. Le header est "X-FS-Signature".

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { isValidEmail } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { PLAN_RANK } from '@/lib/freemius';

// ─── Signature verification ──────────────────────────────────────────────────

function verifyFreemiusSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.FREEMIUS_SECRET_KEY;
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Comparaison en temps constant pour éviter timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const FreemiusUserSchema = z.object({
  email: z.string().email().refine((v) => isValidEmail(v), 'Invalid email').optional(),
  id: z.number().optional(),
});

const FreemiusSubscriptionSchema = z.object({
  id: z.number(),
  plan_id: z.number().optional(),
  billing_cycle: z.string().optional(),
  next_payment: z.string().optional(),
  user: FreemiusUserSchema.optional(),
});

const FreemiusPaymentSchema = z.object({
  id: z.number(),
  amount: z.number().optional(),
  gross: z.number().optional(),
  subscription_id: z.number().optional(),
  user: FreemiusUserSchema.optional(),
  plan_id: z.number().optional(),
});

const FreemiusLicenseSchema = z.object({
  id: z.number(),
  secret_key: z.string().optional(),
  user: FreemiusUserSchema.optional(),
  plan_id: z.number().optional(),
});

const FreemiusWebhookSchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
});

// ─── Mapping Freemius plan_id → plan interne ─────────────────────────────────

const FREEMIUS_PLAN_ID_TO_INTERNAL: Record<number, string> = {
  44081: 'starter',
  44082: 'pro',
  44083: 'business',
};

function planFromFreemiusId(planId: number | undefined): string | null {
  if (!planId) return null;
  return FREEMIUS_PLAN_ID_TO_INTERNAL[planId] ?? null;
}

// ─── Notification helper (fire-and-forget) ────────────────────────────────────

async function createWebhookNotification(
  businessId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from('bookbot_notifications').insert({
      business_id: businessId,
      type,
      title,
      message,
      is_read: false,
      metadata: metadata ?? {},
    });
    if (error) {
      logger.warn('freemius.webhook: notification insert failed', {
        action: 'freemius.webhook',
        businessId,
        error: error.message,
      });
    }
  } catch (err) {
    logger.warn('freemius.webhook: notification insert error', {
      action: 'freemius.webhook',
      error: String(err),
    });
  }
}

// ─── Helpers Supabase ─────────────────────────────────────────────────────────

async function findBusinessByEmail(email: string): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('bookbot_businesses')
    .select('id')
    .eq('email', email)
    .limit(1)
    .single();
  return data?.id ?? null;
}

async function findBusinessByLicenseKey(licenseKey: string): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('bookbot_businesses')
    .select('id')
    .eq('freemius_license_key', licenseKey)
    .limit(1)
    .single();
  return data?.id ?? null;
}

async function updateBusiness(
  businessId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const admin = supabaseAdmin();
  const { error } = await admin
    .from('bookbot_businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', businessId);

  if (error) {
    throw new Error(`Erreur mise à jour business ${businessId}: ${error.message}`);
  }
}

// ─── Handlers par type d'événement ───────────────────────────────────────────

async function handleSubscriptionCreated(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusSubscriptionSchema.safeParse(data);
  if (!parsed.success) {
    logger.warn('freemius.webhook: subscription.created — données invalides', {
      action: 'freemius.webhook',
      details: parsed.error.message,
    });
    return;
  }

  const sub = parsed.data;
  const email = sub.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) {
    logger.warn('freemius.webhook: subscription.created — business introuvable', {
      action: 'freemius.webhook',
      email,
    });
    return;
  }

  const internalPlan = planFromFreemiusId(sub.plan_id);
  const updates: Record<string, unknown> = {
    subscription_status: 'active',
    billing_cycle_start: new Date().toISOString(),
    freemius_subscription_id: sub.id,
  };
  if (internalPlan) updates.plan = internalPlan;

  await updateBusiness(businessId, updates);
  logger.info('freemius.webhook: subscription créée', {
    action: 'freemius.webhook',
    businessId,
    plan: internalPlan,
    freemiusSubId: sub.id,
  });
}

async function handleSubscriptionCancelled(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusSubscriptionSchema.safeParse(data);
  if (!parsed.success) return;

  const sub = parsed.data;
  const email = sub.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  await updateBusiness(businessId, {
    subscription_status: 'cancelled',
  });
  logger.info('freemius.webhook: subscription annulée', {
    action: 'freemius.webhook',
    businessId,
    freemiusSubId: sub.id,
  });
}

async function handleSubscriptionRenewed(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusSubscriptionSchema.safeParse(data);
  if (!parsed.success) return;

  const sub = parsed.data;
  const email = sub.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  await updateBusiness(businessId, {
    subscription_status: 'active',
    billing_cycle_start: new Date().toISOString(),
  });
  logger.info('freemius.webhook: subscription renouvelée', {
    action: 'freemius.webhook',
    businessId,
    freemiusSubId: sub.id,
  });
}

async function handlePaymentCompleted(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusPaymentSchema.safeParse(data);
  if (!parsed.success) return;

  const payment = parsed.data;
  const email = payment.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  // Montant en centimes → XPF approximatif (1 USD ≈ 119 XPF)
  const amountUsd = (payment.gross ?? payment.amount ?? 0) / 100;
  const amountXpf = Math.round(amountUsd * 119);
  const internalPlan = planFromFreemiusId(payment.plan_id);

  const admin = supabaseAdmin();
  const now = new Date();
  const periodStart = now.toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();

  // Créer une facture dans bookbot_invoices
  const { error } = await admin.from('bookbot_invoices').insert({
    business_id: businessId,
    period_start: periodStart,
    period_end: periodEnd,
    amount: amountXpf,
    status: 'paid',
    freemius_payment_id: payment.id,
    created_at: now.toISOString(),
  });

  if (error) {
    logger.warn('freemius.webhook: payment.completed — impossible de créer la facture', {
      action: 'freemius.webhook',
      businessId,
      error: error.message,
    });
  }

  // Mettre à jour le plan si présent dans le paiement
  if (internalPlan) {
    await updateBusiness(businessId, {
      plan: internalPlan,
      subscription_status: 'active',
    });
  }

  logger.info('freemius.webhook: paiement enregistré', {
    action: 'freemius.webhook',
    businessId,
    amountXpf,
    plan: internalPlan,
    freemiusPaymentId: payment.id,
  });
}

async function handlePaymentFailed(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusPaymentSchema.safeParse(data);
  if (!parsed.success) return;

  const payment = parsed.data;
  const email = payment.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  await updateBusiness(businessId, {
    subscription_status: 'payment_failed',
  });

  await createWebhookNotification(
    businessId,
    'cancellation',
    'Echec de paiement',
    'Votre dernier paiement a echoue. Mettez a jour vos informations de paiement pour continuer a utiliser Ve\'a.',
    { freemiusPaymentId: payment.id },
  );

  logger.info('freemius.webhook: paiement echoue', {
    action: 'freemius.webhook',
    businessId,
    freemiusPaymentId: payment.id,
  });
}

async function handlePaymentRefunded(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusPaymentSchema.safeParse(data);
  if (!parsed.success) return;

  const payment = parsed.data;
  const email = payment.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  // Update the invoice matching this Freemius payment to 'refunded'
  const admin = supabaseAdmin();
  const { error } = await admin
    .from('bookbot_invoices')
    .update({ status: 'refunded', updated_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('freemius_payment_id', payment.id);

  if (error) {
    logger.warn('freemius.webhook: payment.refunded — impossible de mettre a jour la facture', {
      action: 'freemius.webhook',
      businessId,
      freemiusPaymentId: payment.id,
      error: error.message,
    });
  }

  await createWebhookNotification(
    businessId,
    'cancellation',
    'Remboursement effectue',
    'Un remboursement a ete traite pour votre compte. Consultez votre historique de facturation.',
    { freemiusPaymentId: payment.id },
  );

  logger.info('freemius.webhook: remboursement enregistre', {
    action: 'freemius.webhook',
    businessId,
    freemiusPaymentId: payment.id,
  });
}

async function handleSubscriptionUpdated(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusSubscriptionSchema.safeParse(data);
  if (!parsed.success) return;

  const sub = parsed.data;
  const email = sub.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  const internalPlan = planFromFreemiusId(sub.plan_id);
  if (!internalPlan) {
    logger.info('freemius.webhook: subscription.updated — plan_id absent ou inconnu, skip', {
      action: 'freemius.webhook',
      businessId,
      freemiusSubId: sub.id,
    });
    return;
  }

  await updateBusiness(businessId, { plan: internalPlan });
  logger.info('freemius.webhook: plan mis a jour via subscription.updated', {
    action: 'freemius.webhook',
    businessId,
    plan: internalPlan,
    freemiusSubId: sub.id,
  });
}

async function handleLicenseCreated(data: Record<string, unknown>): Promise<void> {
  const parsed = FreemiusLicenseSchema.safeParse(data);
  if (!parsed.success) return;

  const license = parsed.data;
  const email = license.user?.email;
  if (!email) return;

  const businessId = await findBusinessByEmail(email);
  if (!businessId) return;

  await updateBusiness(businessId, {
    freemius_license_key: license.secret_key ?? null,
    freemius_license_id: license.id,
  });
  logger.info('freemius.webhook: licence associée', {
    action: 'freemius.webhook',
    businessId,
    freemiusLicenseId: license.id,
  });
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit : 60 webhooks/min par IP (protection anti-flood)
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`freemius-webhook:${ip}`, {
    interval: 60_000,
    limit: 60,
  });
  if (!rlOk) {
    logger.warn('freemius.webhook: rate limit atteinte', { action: 'freemius.webhook', ip });
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  // Lire le body brut pour la vérification de signature
  const rawBody = await req.text();
  const signature = req.headers.get('x-fs-signature') ?? '';

  // Vérification de la signature HMAC (skip si pas de signature — dev local)
  if (signature && !verifyFreemiusSignature(rawBody, signature)) {
    logger.warn('freemius.webhook: signature invalide', {
      action: 'freemius.webhook',
      ip,
    });
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const parsed = FreemiusWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const { type, data } = parsed.data;

  // ─── Idempotency: skip si déjà traité ──────────────────────────────
  const eventId = data?.id ? `${type}_${data.id}` : `${type}_${Date.now()}`;
  const admin = supabaseAdmin();
  const { data: existing } = await admin
    .from('bookbot_webhook_events')
    .select('id')
    .eq('id', eventId)
    .single();

  if (existing) {
    logger.info('freemius.webhook: événement déjà traité (idempotent skip)', {
      action: 'freemius.webhook',
      type,
      eventId,
    });
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Marquer comme traité avant processing (prevent race condition)
  await admin.from('bookbot_webhook_events').insert({ id: eventId, event_type: type });

  logger.info('freemius.webhook: événement reçu', {
    action: 'freemius.webhook',
    type,
    eventId,
  });

  try {
    switch (type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription.cancelled':
      case 'subscription.expired':
        await handleSubscriptionCancelled(data);
        break;
      case 'subscription.renewed':
        await handleSubscriptionRenewed(data);
        break;
      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'license.created':
        await handleLicenseCreated(data);
        break;
      default:
        logger.info('freemius.webhook: événement non géré', {
          action: 'freemius.webhook',
          type,
        });
    }
  } catch (err) {
    logger.error('freemius.webhook: erreur traitement', {
      action: 'freemius.webhook',
      type,
      error: String(err),
    });
    // Retourner 200 quand même pour éviter les retries Freemius en boucle
    return NextResponse.json({ received: true, error: 'Erreur interne' });
  }

  return NextResponse.json({ received: true });
}

// Freemius envoie parfois des GET pour vérifier l'URL
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', service: 'freemius-webhook' });
}

// ─── Types étendus (pour référence future) ───────────────────────────────────
void PLAN_RANK; // utilisé via import indirect dans freemius.ts
