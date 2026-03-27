import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const schema = z.object({
  appointmentId: z.string().uuid(),
  businessId: z.string().uuid(),
  notes: z.string().max(5000).nullable(),
});

/**
 * PATCH /api/appointments/notes
 * Updates notes on an appointment (server-side, auth-checked).
 */
export async function PATCH(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success: rlOk } = await rateLimitAsync(`appt-notes:${ip}`, { interval: 60_000, limit: 60 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { appointmentId, businessId, notes } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb
      .from('bookbot_appointments')
      .update({ notes: notes || null })
      .eq('id', appointmentId)
      .eq('business_id', businessId);

    if (error) {
      logger.error('Appointment notes update failed', { action: 'appointment_notes', error: error.message });
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Appointment notes error', { action: 'appointment_notes', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
