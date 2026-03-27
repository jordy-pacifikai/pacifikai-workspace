import { supabaseAdmin } from './supabase';

export type AuthEventType =
  | 'failed_login'
  | 'invalid_token'
  | 'csrf_failure'
  | 'rate_limited'
  | 'unauthorized_access';

/**
 * Log an auth-related security event to bookbot_auth_events.
 * Fire-and-forget — never throws.
 */
export async function logAuthEvent(params: {
  eventType: AuthEventType;
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const sb = supabaseAdmin();
    await sb.from('bookbot_auth_events').insert({
      event_type: params.eventType,
      ip_address: params.ip ?? null,
      user_agent: params.userAgent ?? null,
      user_id: params.userId ?? null,
      details: params.details ?? {},
    });
  } catch (err) {
    console.error('[Audit] Failed to log event:', err);
  }
}

/** Extract IP + User-Agent from a Request for audit logging. */
export function extractRequestMeta(req: Request) {
  const ip =
    req.headers.get('x-real-ip') ??
    ((req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ||
    'unknown');
  const userAgent = req.headers.get('user-agent') ?? null;
  return { ip, userAgent };
}
