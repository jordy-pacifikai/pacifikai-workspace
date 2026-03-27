import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { triggerTask } from '@/lib/trigger';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const notifySchema = z.object({
  entryId: z.string().uuid(),
});

/**
 * POST /api/waitlist/notify
 * Sends a real WhatsApp/email notification to a waitlist client,
 * then updates the entry status to 'notified'.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`waitlist-notify:${ip}`, { interval: 60_000, limit: 10 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
  }

  try {
    const parsed = notifySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'entryId UUID requis' }, { status: 400 });
    }

    const { entryId } = parsed.data;
    const sb = supabaseAdmin();

    // Fetch waitlist entry
    const { data: entry, error: fetchErr } = await sb
      .from('bookbot_waitlist')
      .select('id, business_id, client_name, client_phone, client_email, service, status')
      .eq('id', entryId)
      .single();

    if (fetchErr || !entry) {
      return NextResponse.json({ error: 'Entree introuvable' }, { status: 404 });
    }

    // Verify caller owns this business
    try {
      await requireBusinessAccess(entry.business_id);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (entry.status !== 'waiting') {
      return NextResponse.json({ error: 'Ce client a deja ete notifie' }, { status: 409 });
    }

    // Fetch business details for notification content
    const { data: biz } = await sb
      .from('bookbot_businesses')
      .select('name, booking_slug')
      .eq('id', entry.business_id)
      .single();

    const businessName = biz?.name ?? 'Votre prestataire';
    const bookingSlug = biz?.booking_slug ?? entry.business_id;
    const bookLink = `https://vea.pacifikai.com/book/${bookingSlug}`;

    // Send WhatsApp notification via Trigger.dev
    if (entry.client_phone) {
      const servicePart = entry.service ? ` pour ${entry.service}` : '';
      const msg =
        `${entry.client_name || 'Bonjour'}, bonne nouvelle !\n\n` +
        `Un creneau s'est libere${servicePart} chez ${businessName}.\n\n` +
        `Reservez vite :\n${bookLink}\n\n` +
        `Ce message est envoye car vous etes sur notre liste d'attente.`;

      triggerTask('notify-waitlist-whatsapp', {
        businessId: entry.business_id,
        clientPhone: entry.client_phone,
        message: msg,
      }).catch(() => {});
    }

    // Update status to 'notified'
    const { error: updateErr } = await sb
      .from('bookbot_waitlist')
      .update({
        status: 'notified',
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (updateErr) {
      logger.error('Waitlist notify update error', { action: 'waitlist_notify', error: String(updateErr) });
      return NextResponse.json({ error: 'Erreur de mise a jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true, notified: entry.client_name });
  } catch (err) {
    logger.error('Waitlist notify error', { action: 'waitlist_notify', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
