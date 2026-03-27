import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const insertSchema = z.object({
  businessId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().max(200).nullable().optional(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
});

/**
 * POST /api/blocked-slots
 * Creates a blocked slot for a business (server-side, auth-checked).
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success: rlOk } = await rateLimitAsync(`blocked-slots:${ip}`, { interval: 60_000, limit: 30 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = insertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, date, startTime, endTime, reason } = parsed.data;

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'L\'heure de fin doit être après l\'heure de début' }, { status: 400 });
    }

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('bookbot_blocked_slots')
      .insert({
        business_id: businessId,
        date,
        start_time: startTime,
        end_time: endTime,
        reason: reason?.trim() || null,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Blocked slot insert failed', { action: 'blocked_slot_create', error: error.message });
      return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    logger.error('Blocked slot create error', { action: 'blocked_slot_create', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * DELETE /api/blocked-slots
 * Deletes a blocked slot (server-side, auth-checked).
 */
export async function DELETE(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success: rlOk } = await rateLimitAsync(`blocked-slots:${ip}`, { interval: 60_000, limit: 30 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, businessId } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb
      .from('bookbot_blocked_slots')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      logger.error('Blocked slot delete failed', { action: 'blocked_slot_delete', error: error.message });
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Blocked slot delete error', { action: 'blocked_slot_delete', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
