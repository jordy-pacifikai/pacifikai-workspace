import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { watchCalendar, stopWatch } from '@/lib/gcal';
import { requireAuth, requireBusinessAccess } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google`
  : 'https://dashboard.vea.pacifikai.com/api/auth/google';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vea.pacifikai.com';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Redirect and clear the OAuth nonce cookie */
function oauthRedirect(url: string): NextResponse {
  const res = NextResponse.redirect(url);
  res.cookies.delete({ name: 'gcal_oauth_nonce', path: '/api/auth/google' });
  return res;
}

/**
 * GET — Generate Google OAuth URL (called from frontend to start flow).
 * Query params: ?business_id=xxx
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-google-get:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const url = new URL(req.url);
  const businessId = url.searchParams.get('business_id');

  // Check if this is the OAuth callback (has code param)
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code && state) {
    // This is the OAuth callback from Google — validate CSRF nonce
    const separatorIdx = state.indexOf(':');
    if (separatorIdx === -1) {
      return oauthRedirect(`${SITE_URL}/channels?gcal_error=invalid_state`);
    }
    const stateBizId = state.slice(0, separatorIdx);
    const nonce = state.slice(separatorIdx + 1);

    if (!UUID_RE.test(stateBizId)) {
      return oauthRedirect(`${SITE_URL}/channels?gcal_error=invalid_state`);
    }

    const cookieNonce = req.cookies.get('gcal_oauth_nonce')?.value;
    if (!cookieNonce || cookieNonce !== nonce) {
      return oauthRedirect(`${SITE_URL}/channels?gcal_error=csrf_failed`);
    }

    return handleCallback(req, code, stateBizId);
  }

  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 });
  }

  if (!UUID_RE.test(businessId)) {
    return NextResponse.json({ error: 'Invalid business_id' }, { status: 400 });
  }

  const nonce = crypto.randomUUID();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ];

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: `${businessId}:${nonce}`,
  });

  const response = NextResponse.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  });
  response.cookies.set('gcal_oauth_nonce', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/auth/google',
  });
  return response;
}

/**
 * Handle the OAuth callback from Google.
 */
async function handleCallback(req: NextRequest, code: string, businessId: string) {
  // Verify caller owns this business
  try {
    await requireBusinessAccess(businessId);
  } catch {
    return oauthRedirect(`${SITE_URL}/channels?gcal_error=unauthorized`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    logger.error('Token exchange failed', { action: 'gcal_oauth', error: String(err) });
    // Redirect back to channels page with error
    return oauthRedirect(`${SITE_URL}/channels?gcal_error=token_exchange_failed`);
  }

  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token;

  if (!refreshToken) {
    return oauthRedirect(`${SITE_URL}/channels?gcal_error=no_refresh_token`);
  }

  // List calendars to find primary
  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const calData = await calRes.json();
  const calendars = (calData.items ?? []) as Array<{ id: string; summary: string; primary?: boolean }>;
  const primary = calendars.find((c) => c.primary);
  const calendarId = primary?.id ?? calendars[0]?.id;

  if (!calendarId) {
    return oauthRedirect(`${SITE_URL}/channels?gcal_error=no_calendar_found`);
  }

  // Store in Supabase
  const sb = supabaseAdmin();
  await sb
    .from('bookbot_businesses')
    .update({
      gcal_refresh_token: refreshToken,
      gcal_calendar_id: calendarId,
      gcal_connected_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  // Setup Google Calendar push notifications (real-time sync)
  try {
    const webhookUrl = `${REDIRECT_URI.replace('/api/auth/google', '')}/api/webhook/gcal`;
    const watch = await watchCalendar(businessId, webhookUrl);
    if (watch) {
      await sb.from('bookbot_businesses').update({
        gcal_watch_channel_id: watch.channelId,
        gcal_watch_resource_id: watch.resourceId,
        gcal_watch_expiration: new Date(Number(watch.expiration)).toISOString(),
      }).eq('id', businessId);
      logger.info(`Watch channel created: ${watch.channelId}`, { action: 'gcal-oauth-watch', businessId, expiration: watch.expiration });
    }
  } catch (e) {
    logger.warn('Watch setup failed (non-blocking)', { action: 'gcal_oauth_watch', error: String(e) });
  }

  // Initial sync — import existing calendar events immediately
  // Timed events → appointments, all-day → blocked_slots
  try {
    const { data: biz } = await sb
      .from('bookbot_businesses')
      .select('timezone')
      .eq('id', businessId)
      .single();

    const now = new Date();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      const items = (eventsData.items ?? []) as Array<{
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        attendees?: Array<{ email?: string; displayName?: string; self?: boolean }>;
      }>;

      const tz = biz?.timezone ?? 'Pacific/Tahiti';

      // Batch-prepare inserts to avoid N+1 DB calls
      const blockedBatch: Array<Record<string, unknown>> = [];
      const appointmentBatch: Array<Record<string, unknown>> = [];
      const clientNames = new Set<string>();
      const clientBatch: Array<Record<string, unknown>> = [];

      for (const item of items) {
        if (item.start?.date) {
          blockedBatch.push({
            business_id: businessId,
            date: item.start.date,
            time_from: null,
            time_to: null,
            all_day: true,
            reason: item.summary ?? '(sans titre)',
            source: 'gcal',
            gcal_event_id: item.id,
          });
        } else if (item.start?.dateTime && item.end?.dateTime) {
          const startDt = new Date(item.start.dateTime);
          const endDt = new Date(item.end.dateTime);
          const startLocal = new Date(startDt.toLocaleString('en-US', { timeZone: tz }));
          const endLocal = new Date(endDt.toLocaleString('en-US', { timeZone: tz }));

          const date = `${startLocal.getFullYear()}-${String(startLocal.getMonth() + 1).padStart(2, '0')}-${String(startLocal.getDate()).padStart(2, '0')}`;
          const timeSlot = `${String(startLocal.getHours()).padStart(2, '0')}:${String(startLocal.getMinutes()).padStart(2, '0')}`;
          const endTime = `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`;

          const attendee = (item.attendees ?? []).find((a) => a.email && !a.self);
          const clientName = attendee?.displayName ?? item.summary ?? '(sans titre)';
          const clientEmail = attendee?.email ?? null;

          if (clientName && !clientNames.has(clientName)) {
            clientNames.add(clientName);
            clientBatch.push({
              business_id: businessId,
              name: clientName,
              email: clientEmail,
              source: 'gcal',
              tags: ['gcal'],
            });
          }

          appointmentBatch.push({
            business_id: businessId,
            client_name: clientName,
            client_email: clientEmail,
            service: null,
            appointment_date: date,
            time_slot: timeSlot,
            end_time: endTime,
            status: 'confirmed',
            source: 'gcal',
            gcal_event_id: item.id,
          });
        }
      }

      // Batch inserts (3 queries instead of up to 750)
      if (blockedBatch.length > 0) {
        await sb.from('bookbot_blocked_slots').insert(blockedBatch);
      }
      if (clientBatch.length > 0) {
        await sb.from('bookbot_clients').upsert(clientBatch, {
          onConflict: 'business_id,name',
          ignoreDuplicates: true,
        });
      }
      if (appointmentBatch.length > 0) {
        await sb.from('bookbot_appointments').upsert(appointmentBatch, {
          onConflict: 'business_id,gcal_event_id',
          ignoreDuplicates: true,
        });
      }
      logger.info(`Initial sync: ${items.length} events imported`, { action: 'gcal-oauth-sync', businessId, count: items.length });
    }
  } catch (e) {
    logger.warn('Initial sync failed (non-blocking)', { action: 'gcal_oauth_sync', error: String(e) });
  }

  // Redirect back to channels page with success
  return oauthRedirect(`${SITE_URL}/channels?gcal_connected=true`);
}

/**
 * POST — Exchange code for tokens and list calendars (alternative flow).
 */
export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-google-post:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  // Require authenticated user
  try {
    await requireAuth()
  } catch (authError) {
    if (authError instanceof NextResponse) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
  const postSchema = z.object({ code: z.string().min(1) });
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }
  const { code } = parsed.data;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    logger.error('Token exchange failed', { action: 'gcal_oauth_post', error: JSON.stringify(tokens) });
    return NextResponse.json({ error: 'token_exchange_failed' }, { status: 400 });
  }

  // List calendars
  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const calData = await calRes.json();

  return NextResponse.json({
    calendars: (calData.items ?? []).map((c: Record<string, unknown>) => ({
      id: c.id,
      summary: c.summary,
      primary: Boolean(c.primary),
    })),
  });
  } catch (err) {
    logger.error('Google OAuth POST error', { action: 'gcal_oauth_post', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * DELETE — Disconnect Google Calendar.
 */
export async function DELETE(req: Request) {
  const ip = getClientIp(req)
  const { success } = rateLimit(`auth-google-delete:${ip}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
  const disconnectSchema = z.object({
    businessId: z.string().uuid(),
    keepSlots: z.boolean().optional(),
  });
  const parsed = disconnectSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { businessId } = parsed.data;

  // Auth: verify caller owns this business
  try {
    await requireBusinessAccess(businessId);
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = supabaseAdmin();

  // Get current data to revoke token + stop watch
  const { data } = await sb
    .from('bookbot_businesses')
    .select('gcal_refresh_token, gcal_watch_channel_id, gcal_watch_resource_id')
    .eq('id', businessId)
    .single();

  if (data?.gcal_refresh_token) {
    // Stop watch channel
    if (data.gcal_watch_channel_id && data.gcal_watch_resource_id) {
      await stopWatch(businessId, data.gcal_watch_channel_id, data.gcal_watch_resource_id);
    }
    // Best-effort revocation
    await fetch(`https://oauth2.googleapis.com/revoke?token=${data.gcal_refresh_token}`, {
      method: 'POST',
    }).catch(() => {});
  }

  // Clear columns + optionally remove synced data (parallel)
  const keepSlots = parsed.data.keepSlots ?? false;
  const clearColumns = sb.from('bookbot_businesses').update({
    gcal_refresh_token: null, gcal_calendar_id: null, gcal_connected_at: null,
    gcal_watch_channel_id: null, gcal_watch_resource_id: null, gcal_watch_expiration: null,
  }).eq('id', businessId);

  if (!keepSlots) {
    await Promise.all([
      clearColumns,
      sb.from('bookbot_blocked_slots').delete().eq('business_id', businessId).eq('source', 'gcal'),
      sb.from('bookbot_appointments').delete().eq('business_id', businessId).eq('source', 'gcal'),
    ]);
  } else {
    await clearColumns;
  }

  return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Google disconnect error', { action: 'gcal_disconnect', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
