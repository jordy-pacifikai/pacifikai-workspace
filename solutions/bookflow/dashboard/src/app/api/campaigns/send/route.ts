import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { requireBusinessAccess } from '@/lib/auth';
import { triggerTask } from '@/lib/trigger';
import { rateLimit } from '@/lib/rate-limit';

const sendCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  businessId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = sendCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { campaignId, businessId } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = rateLimit(`campaigns-send:${businessId}`, { interval: 60_000, limit: 2 })
    if (!success) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
    }

    const ok = await triggerTask('send-whatsapp-campaign', { campaignId, businessId });
    if (!ok) {
      return NextResponse.json({ error: 'Failed to send campaign' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Unexpected error', { action: 'campaign_send', error: String(err) });
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 },
    );
  }
}
