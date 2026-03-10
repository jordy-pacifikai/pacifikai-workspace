import { NextRequest, NextResponse } from 'next/server';

const TRIGGER_API_URL = process.env.TRIGGER_API_URL ?? 'https://api.trigger.dev';
const TRIGGER_SECRET_KEY = process.env.TRIGGER_SECRET_KEY ?? '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { knowledgeId, businessId, action } = body;

    if (!knowledgeId || !businessId) {
      return NextResponse.json({ error: 'Missing knowledgeId or businessId' }, { status: 400 });
    }

    // Trigger the generate-embeddings task
    const res = await fetch(`${TRIGGER_API_URL}/api/v1/tasks/generate-embeddings/trigger`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TRIGGER_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: {
          knowledgeId,
          businessId,
          action: action ?? 'upsert',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Trigger.dev error:', res.status, errText);
      return NextResponse.json({ error: 'Failed to trigger embeddings' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, runId: data.id });
  } catch (err) {
    console.error('Embeddings API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
