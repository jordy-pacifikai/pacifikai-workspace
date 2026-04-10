import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/whatsapp/verify-token
 *
 * Server-side verification of a WhatsApp Cloud API access token.
 * Prevents the client from sending tokens directly to Graph API
 * (which would expose them in browser network logs / extensions).
 */
export async function POST(req: NextRequest) {
  await requireAuth();

  const { token } = (await req.json()) as { token?: string };

  if (!token?.trim()) {
    return NextResponse.json({ ok: false, msg: 'Aucun token fourni' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(token.trim())}`,
      { signal: AbortSignal.timeout(8000) },
    );
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ ok: false, msg: data.error.message || 'Token invalide' });
    }

    return NextResponse.json({ ok: true, msg: `Token valide — ${data.name || 'System User'}` });
  } catch {
    return NextResponse.json({ ok: false, msg: 'Erreur reseau vers Graph API' }, { status: 502 });
  }
}
