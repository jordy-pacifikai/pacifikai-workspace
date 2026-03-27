import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, getUserBusinessId } from '@/lib/auth';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const schema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(4096),
});

/**
 * POST /api/conversations/reply
 * Send a manual reply from the dashboard into a conversation (WhatsApp/Messenger/Instagram).
 */
export async function POST(req: Request) {
  try {
    // Rate limit
    const ip = getClientIp(req);
    const { success: rlOk } = await rateLimitAsync(`conv-reply:${ip}`, { interval: 60_000, limit: 120 });
    if (!rlOk) {
      return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
    }

    // Auth
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId, message } = parsed.data;
    const sb = supabaseAdmin();

    // Fetch session
    const { data: session, error: sessionErr } = await sb
      .from('bookbot_sessions')
      .select('id, phone, business_id, context, state')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    // Verify user owns this business
    const userBusinessId = await getUserBusinessId();
    if (userBusinessId !== session.business_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch business credentials
    const { data: business, error: bizErr } = await sb
      .from('bookbot_businesses')
      .select('meta_page_token, config')
      .eq('id', session.business_id)
      .single();

    if (bizErr || !business) {
      return NextResponse.json({ error: 'Business introuvable' }, { status: 404 });
    }

    const phone: string = session.phone;

    // Determine channel and send
    if (phone.startsWith('messenger_') || phone.startsWith('instagram_')) {
      // Messenger or Instagram — use page token
      const pageToken = business.meta_page_token;
      if (!pageToken) {
        return NextResponse.json({ error: 'Page token manquant pour ce business' }, { status: 400 });
      }
      const recipientId = phone.replace(/^(messenger_|instagram_)/, '');
      const res = await fetch('https://graph.facebook.com/v24.0/me/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pageToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const detail = (errBody as { error?: { message?: string } })?.error?.message ?? 'unknown';
        logger.error('Messenger/IG send failed', { action: 'conv_reply', error: detail, businessId: session.business_id });
        return NextResponse.json({ error: `Erreur envoi: ${detail}` }, { status: 502 });
      }
    } else {
      // WhatsApp — use Meta Cloud API
      const config = business.config as { metaPhoneNumberId?: string; metaAccessToken?: string } | null;
      const phoneNumberId = config?.metaPhoneNumberId;
      const accessToken = config?.metaAccessToken;
      if (!phoneNumberId || !accessToken) {
        return NextResponse.json({ error: 'Credentials WhatsApp manquants' }, { status: 400 });
      }
      const cleanPhone = phone.replace('whatsapp:', '').replace('+', '');
      const res = await fetch(`https://graph.facebook.com/v24.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const detail = (errBody as { error?: { message?: string } })?.error?.message ?? 'unknown';
        logger.error('WhatsApp send failed', { action: 'conv_reply', error: detail, businessId: session.business_id });
        return NextResponse.json({ error: `Erreur envoi: ${detail}` }, { status: 502 });
      }
    }

    // Append reply to session context
    const existingMessages = (session.context as { messages?: unknown[] } | null)?.messages ?? [];
    const newMessage = {
      role: 'assistant',
      content: message,
    };
    const updatedContext = {
      ...(session.context as Record<string, unknown> ?? {}),
      messages: [...existingMessages, newMessage],
    };

    const { error: updateErr } = await sb
      .from('bookbot_sessions')
      .update({
        context: updatedContext,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateErr) {
      logger.error('Session context update failed', { action: 'conv_reply', error: updateErr.message, sessionId });
      // Message was sent but DB update failed — still return success
    }

    logger.info('Reply sent', { action: 'conv_reply', userId: user.id, sessionId, channel: phone.startsWith('messenger_') ? 'messenger' : phone.startsWith('instagram_') ? 'instagram' : 'whatsapp' });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Conversation reply error', { action: 'conv_reply', error: String(err) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
