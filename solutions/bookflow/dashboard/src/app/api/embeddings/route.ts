import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { requireBusinessAccess } from '@/lib/auth';
import { triggerTask } from '@/lib/trigger';
import { rateLimitAsync } from '@/lib/rate-limit';

const embeddingsSchema = z.object({
  knowledgeId: z.string().uuid(),
  businessId: z.string().uuid(),
  action: z.enum(['upsert', 'delete']).optional().default('upsert'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = embeddingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { knowledgeId, businessId, action } = parsed.data;

    // Verify user owns this business
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10/min per user (compute-heavy)
    const { success } = await rateLimitAsync(`embeddings:${businessId}`, { interval: 60_000, limit: 10 });
    if (!success) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    // Trigger the generate-embeddings task
    const ok = await triggerTask('generate-embeddings', { knowledgeId, businessId, action });
    if (!ok) {
      return NextResponse.json({ error: 'Failed to trigger embeddings' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Embeddings API error', { action: 'generate_embeddings_trigger', error: String(err) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
