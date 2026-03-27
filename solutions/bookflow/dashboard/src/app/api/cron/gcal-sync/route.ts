import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { listCalendarEvents, watchCalendar, syncGCalEventsForBusiness } from '@/lib/gcal';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/cron/gcal-sync
 * Syncs Google Calendar events:
 *   - Timed events → bookbot_appointments (source='gcal', status='confirmed')
 *   - All-day events → bookbot_blocked_slots (source='gcal')
 * Called by Vercel Cron every 15 minutes.
 */
export async function GET(req: Request) {
  // Auth first — O(1) check, prevents unauthenticated requests from consuming rate-limit slots
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 1/min per IP (cron endpoint)
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`gcal-sync:${ip}`, { interval: 60_000, limit: 1 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  try {
  const sb = supabaseAdmin();

  const { data: businesses, error } = await sb
    .from('bookbot_businesses')
    .select('id, gcal_calendar_id, gcal_refresh_token, timezone, gcal_watch_channel_id, gcal_watch_expiration')
    .not('gcal_refresh_token', 'is', null)
    .not('gcal_calendar_id', 'is', null);

  if (error || !businesses?.length) {
    return NextResponse.json({ synced: 0, message: 'No connected businesses' });
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const webhookBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dashboard.vea.pacifikai.com';

  let totalSynced = 0;

  for (const biz of businesses) {
    try {
      // Renew watch channel if expired or missing (expires every 7 days)
      const watchExpired = !biz.gcal_watch_expiration || new Date(biz.gcal_watch_expiration) < new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (watchExpired) {
        const watch = await watchCalendar(biz.id, `${webhookBaseUrl}/api/webhook/gcal`);
        if (watch) {
          await sb.from('bookbot_businesses').update({
            gcal_watch_channel_id: watch.channelId,
            gcal_watch_resource_id: watch.resourceId,
            gcal_watch_expiration: new Date(Number(watch.expiration)).toISOString(),
            gcal_webhook_secret: watch.webhookSecret,
          }).eq('id', biz.id);
        }
      }

      const events = await listCalendarEvents(biz.id, timeMin, timeMax);
      if (!events) continue;

      const tz = biz.timezone ?? 'Pacific/Tahiti';
      totalSynced += await syncGCalEventsForBusiness(biz.id, tz, events);
    } catch (e) {
      const errMsg = String(e);
      logger.error('Sync error for business', { action: 'gcal_sync_cron', businessId: biz.id, error: errMsg });

      // If token was revoked, getAccessToken already handles marking disconnected + notification
      // Log explicitly for cron visibility
      if (errMsg.includes('invalid_grant') || errMsg.includes('revoked')) {
        logger.warn('GCal token revoked detected in cron', { action: 'gcal_sync_cron_revoked', businessId: biz.id });
      }
    }
  }

  return NextResponse.json({ synced: totalSynced, businesses: businesses.length });
  } catch (err) {
    logger.error('GCal sync cron error', { action: 'gcal_sync_cron', error: String(err) });
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
