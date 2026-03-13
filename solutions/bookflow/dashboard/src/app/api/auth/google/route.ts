import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google`
  : 'https://dashboard.vea.pacifikai.com/api/auth/google';

/**
 * GET — Generate Google OAuth URL (called from frontend to start flow).
 * Query params: ?business_id=xxx
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const businessId = url.searchParams.get('business_id');

  // Check if this is the OAuth callback (has code param)
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code && state) {
    // This is the OAuth callback from Google
    return handleCallback(code, state);
  }

  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 });
  }

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
    state: businessId, // pass business_id as state
  });

  return NextResponse.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  });
}

/**
 * Handle the OAuth callback from Google.
 */
async function handleCallback(code: string, businessId: string) {
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
    console.error('[GCal OAuth] Token exchange failed:', err);
    // Redirect back to channels page with error
    return NextResponse.redirect(
      new URL('/channels?gcal_error=token_exchange_failed', REDIRECT_URI.replace('/api/auth/google', ''))
    );
  }

  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token;

  if (!refreshToken) {
    return NextResponse.redirect(
      new URL('/channels?gcal_error=no_refresh_token', REDIRECT_URI.replace('/api/auth/google', ''))
    );
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
    return NextResponse.redirect(
      new URL('/channels?gcal_error=no_calendar_found', REDIRECT_URI.replace('/api/auth/google', ''))
    );
  }

  // Store in Supabase
  const sb = getAdmin();
  await sb
    .from('bookbot_businesses')
    .update({
      gcal_refresh_token: refreshToken,
      gcal_calendar_id: calendarId,
      gcal_connected_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  // Redirect back to channels page with success
  return NextResponse.redirect(
    new URL('/channels?gcal_connected=true', REDIRECT_URI.replace('/api/auth/google', ''))
  );
}

/**
 * POST — Exchange code for tokens and list calendars (alternative flow).
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
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

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'token_exchange_failed', details: tokens }, { status: 400 });
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
    refreshToken: tokens.refresh_token,
  });
}

/**
 * DELETE — Disconnect Google Calendar.
 */
export async function DELETE(req: Request) {
  const body = await req.json();
  const { businessId } = body;

  if (!businessId) {
    return NextResponse.json({ error: 'businessId required' }, { status: 400 });
  }

  const sb = getAdmin();

  // Get current refresh token to revoke
  const { data } = await sb
    .from('bookbot_businesses')
    .select('gcal_refresh_token')
    .eq('id', businessId)
    .single();

  if (data?.gcal_refresh_token) {
    // Best-effort revocation
    await fetch(`https://oauth2.googleapis.com/revoke?token=${data.gcal_refresh_token}`, {
      method: 'POST',
    }).catch(() => {});
  }

  // Clear columns
  await sb
    .from('bookbot_businesses')
    .update({
      gcal_refresh_token: null,
      gcal_calendar_id: null,
      gcal_connected_at: null,
    })
    .eq('id', businessId);

  return NextResponse.json({ ok: true });
}
