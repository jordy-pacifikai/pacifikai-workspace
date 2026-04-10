import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API for Messenger Bridge login flow.
 * Routes requests to the self-hosted messenger-bridge service.
 */

const BRIDGE_URL = process.env.MESSENGER_BRIDGE_URL ?? 'http://localhost:3847';
const BRIDGE_SECRET = process.env.MESSENGER_BRIDGE_SECRET ?? '';

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
      signal: AbortSignal.timeout(10000),
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

    switch (action) {
      // ─── New: Email+Password login (messenger-lite) ───
      case 'login-start':
        return proxyToBridge('POST', '/bridge/login/start', { businessId: business_id });

      case 'login-credentials':
        return proxyToBridge('POST', '/bridge/login/credentials', {
          businessId: business_id,
          email: body.email,
          password: body.password,
        });

      case 'login-2fa':
        return proxyToBridge('POST', '/bridge/login/2fa', {
          businessId: business_id,
          stepId: body.step_id,
          code: body.code,
        });

      case 'login-wait-approval':
        return proxyToBridge('POST', '/bridge/login/wait-approval', {
          businessId: business_id,
          stepId: body.step_id,
        });

      // ─── Status & disconnect ───
      case 'bridge-status':
        return proxyToBridge('GET', `/bridge/status/${business_id}`);

      case 'bridge-disconnect':
        return proxyToBridge('POST', '/bridge/disconnect', { businessId: business_id });

      // ─── Pages discovery & selection ───
      case 'bridge-pages':
        return proxyToBridge('GET', `/bridge/pages/${business_id}`);

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

      case 'bridge-connect':
        return proxyToBridge('POST', '/bridge/connect', {
          businessId: business_id,
          cookies: body.cookies,
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Proxy error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
