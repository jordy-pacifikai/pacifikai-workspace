import { NextRequest, NextResponse } from 'next/server';
import { requireBusinessAccess, createSupabaseServer } from '@/lib/auth';

/**
 * Proxy API for Messenger Bridge login flow.
 * Routes requests to the self-hosted messenger-bridge service.
 */

// Login steps can take up to 45s (Matrix + Facebook auth). Ensure Next.js
// route handler doesn't cut us off earlier.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const BRIDGE_URL = process.env.MESSENGER_BRIDGE_URL ?? 'http://localhost:3847';
const BRIDGE_SECRET = process.env.MESSENGER_BRIDGE_SECRET ?? '';

// Per-action timeouts (ms). Login flows involve Matrix handshake + Facebook auth
// which routinely take 15-25s. Fast reads (status, pages) stay short.
const FAST_TIMEOUT_MS = 10_000;
const SLOW_TIMEOUT_MS = 45_000;

function pickTimeout(path: string): number {
  if (
    path.startsWith('/bridge/login/') ||
    path.startsWith('/auth/login/') ||
    path.startsWith('/bridge/connect') ||
    path.startsWith('/bridge/select-page') ||
    path.startsWith('/bridge/add-page')
  ) {
    return SLOW_TIMEOUT_MS;
  }
  return FAST_TIMEOUT_MS;
}

async function proxyToBridge(
  method: string,
  path: string,
  body?: unknown,
): Promise<NextResponse> {
  const url = `${BRIDGE_URL}${path}`;

  if (!BRIDGE_URL || !BRIDGE_SECRET) {
    return NextResponse.json({ error: 'Messenger Bridge non configure' }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BRIDGE_SECRET}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(pickTimeout(path)),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'Invalid response from bridge', raw: text.slice(0, 200) };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bridge unreachable';
    return NextResponse.json({ error: `Bridge indisponible: ${msg}` }, { status: 503 });
  }
}

/**
 * POST /api/messenger-bridge
 * Actions: start-login, action, complete, cancel, screenshot
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, session_id, business_id, ...rest } = body;

    // R4: Require auth + business ownership for all bridge actions
    if (business_id) {
      await requireBusinessAccess(business_id);
    } else {
      // Actions without business_id (e.g. bridge-resolve-page-url) still need auth
      const { requireAuth } = await import('@/lib/auth');
      await requireAuth();
    }

    // Get the authenticated user's ID for bridge operations that need veaUserId
    const getVeaUserId = async () => {
      const { requireAuth } = await import('@/lib/auth');
      const user = await requireAuth();
      return user.id;
    };

    switch (action) {
      // ─── New: Email+Password login (messenger-lite) ───
      // Login operations use veaUserId (matrix user = per Ve'a user, not per business)
      case 'login-start': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/login/start', { veaUserId });
      }

      case 'login-credentials': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/login/credentials', {
          veaUserId,
          email: body.email,
          password: body.password,
        });
      }

      case 'login-2fa': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/login/2fa', {
          veaUserId,
          stepId: body.step_id,
          code: body.code,
        });
      }

      case 'login-wait-approval': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/login/wait-approval', {
          veaUserId,
          stepId: body.step_id,
        });
      }

      // ─── Status & disconnect ───
      case 'bridge-status': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('GET', `/bridge/status/${veaUserId}`);
      }

      case 'bridge-disconnect': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/disconnect', { veaUserId });
      }

      // ─── Pages discovery & selection ───
      case 'bridge-pages': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('GET', `/bridge/pages/${veaUserId}`);
      }

      case 'bridge-select-page':
        return proxyToBridge('POST', '/bridge/select-page', {
          businessId: business_id,
          pageIds: body.page_ids,
        });

      case 'bridge-add-page':
        return proxyToBridge('POST', '/bridge/add-page', {
          businessId: business_id,
          pageId: body.page_id,
          pageName: body.page_name,
        });

      case 'bridge-resolve-page-url':
        return proxyToBridge('POST', '/bridge/resolve-page-url', {
          url: body.url,
        });

      // ─── Page→Business assignments (writes to Supabase, not bridge) ───
      case 'bridge-assign-pages': {
        const user = business_id
          ? await requireBusinessAccess(business_id)
          : await (async () => { const { requireAuth } = await import('@/lib/auth'); return requireAuth(); })();
        const supabase = await createSupabaseServer();
        const assignments = body.assignments as Array<{ page_id: string; page_name: string; business_id: string }>;
        if (!Array.isArray(assignments) || assignments.length === 0) {
          return NextResponse.json({ error: 'No assignments provided' }, { status: 400 });
        }
        // Upsert each assignment
        for (const a of assignments) {
          // Verify user owns the target business
          const { data: link } = await supabase
            .from('bookbot_business_users')
            .select('business_id')
            .eq('user_id', user.id)
            .eq('business_id', a.business_id)
            .limit(1)
            .single();
          if (!link) continue; // skip unauthorized assignments

          await supabase
            .from('bookbot_page_assignments')
            .upsert(
              {
                user_id: user.id,
                business_id: a.business_id,
                fb_page_id: a.page_id,
                fb_page_name: a.page_name,
                active: true,
              },
              { onConflict: 'fb_page_id' },
            );

          // Also update the business's fb_page_id for quick reference
          await supabase
            .from('bookbot_businesses')
            .update({ fb_page_id: a.page_id })
            .eq('id', a.business_id);
        }
        return NextResponse.json({ ok: true, count: assignments.length });
      }

      // ─── Legacy endpoints ───
      case 'start-login':
        return proxyToBridge('POST', '/auth/login/start', { business_id });

      case 'action':
        return proxyToBridge('POST', `/auth/login/action/${session_id}`, rest);

      case 'complete':
        return proxyToBridge('POST', `/auth/login/complete/${session_id}`, { business_id });

      case 'cancel':
        return proxyToBridge('DELETE', `/auth/login/${session_id}`);

      case 'screenshot':
        return proxyToBridge('GET', `/auth/login/screen/${session_id}`);

      case 'status':
        return proxyToBridge('GET', `/auth/status/${business_id}`);

      case 'bridge-connect': {
        const veaUserId = await getVeaUserId();
        return proxyToBridge('POST', '/bridge/connect', {
          veaUserId,
          cookies: body.cookies,
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Proxy error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
