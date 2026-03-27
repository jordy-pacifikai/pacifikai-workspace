import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { listCalendarEvents, syncGCalEventsForBusiness } from '@/lib/gcal';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// ------- Zod Schemas -------

/** Google Calendar push notification headers we rely on */
const gcalWebhookHeadersSchema = z.object({
  channelId: z.string().min(1),
  resourceState: z.enum(['sync', 'exists', 'not_exists']),
  resourceId: z.string().min(1).optional(),
});

/**
 * POST /api/webhook/gcal
 * Google Calendar push notification webhook.
 * Called by Google whenever events change on a watched calendar.
 * Headers contain channel info; body is empty (we must re-fetch events).
 */
export async function POST(req: Request) {
  // Rate limit: 100/min per IP (webhook)
  const ip = getClientIp(req);
  const { success: rlOk } = rateLimit(`webhook-gcal:${ip}`, { interval: 60_000, limit: 100 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const headerData = {
    channelId: req.headers.get('x-goog-channel-id') ?? undefined,
    resourceState: req.headers.get('x-goog-resource-state') ?? undefined,
    resourceId: req.headers.get('x-goog-resource-id') ?? undefined,
  };

  const parsed = gcalWebhookHeadersSchema.safeParse(headerData);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid webhook headers' }, { status: 400 });
  }

  const { channelId, resourceState, resourceId } = parsed.data;

  // Google sends a "sync" message when the watch is first created — ignore it
  if (resourceState === 'sync') {
    return NextResponse.json({ ok: true });
  }

  const sb = supabaseAdmin();

  // Find the business associated with this watch channel
  const { data: biz } = await sb
    .from('bookbot_businesses')
    .select('id, timezone, gcal_calendar_id, gcal_watch_resource_id')
    .eq('gcal_watch_channel_id', channelId)
    .single();

  if (!biz) {
    logger.warn('No business for channel', { action: 'gcal_webhook', channelId });
    return NextResponse.json({ error: 'Unknown channel' }, { status: 404 });
  }

  // Validate resource ID if both the header and stored value are present
  if (resourceId && biz.gcal_watch_resource_id && resourceId !== biz.gcal_watch_resource_id) {
    logger.warn('Resource ID mismatch', { action: 'gcal_webhook', channelId, expected: biz.gcal_watch_resource_id, got: resourceId });
    return NextResponse.json({ error: 'Resource mismatch' }, { status: 403 });
  }

  // Per-business rate limit: max 1 sync per 30 seconds to prevent forced sync DoS
  const { success: bizRl } = rateLimit(`gcal-sync:${biz.id}`, { interval: 30_000, limit: 1 });
  if (!bizRl) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  // Re-run the sync for this single business (same logic as cron)
  try {
    const tz = biz.timezone ?? 'Pacific/Tahiti';
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = await listCalendarEvents(biz.id, timeMin, timeMax);
    if (!events) return NextResponse.json({ ok: true, synced: 0 });

    const synced = await syncGCalEventsForBusiness(biz.id, tz, events);
    logger.info(`Synced ${synced} new events`, { action: 'gcal-webhook-sync', businessId: biz.id, synced });
    return NextResponse.json({ ok: true, synced });
  } catch (e) {
    logger.error('Sync failed', { action: 'gcal_webhook', businessId: biz.id, error: String(e) });
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
