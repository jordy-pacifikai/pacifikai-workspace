const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { session_id?: string; name?: string; email?: string };
    const { session_id, name, email } = body;

    if (!session_id) {
      return Response.json({ error: 'session_id required' }, { status: 400, headers: CORS_HEADERS });
    }
    if (!name && !email) {
      return Response.json({ error: 'name or email required' }, { status: 400, headers: CORS_HEADERS });
    }

    const updates: Record<string, string> = { last_contact_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (email) updates.email = email;

    // PATCH the existing prospect (created by chat upsertProspect on first message)
    // If no prospect exists yet, upsert one
    await fetch(`${SUPABASE_URL}/rest/v1/messenger_prospects`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY ?? '',
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        sender_id: session_id,
        source: 'landing-page',
        temperature: 'cold',
        conversation_stage: 'discovery',
        ...updates
      })
    });

    return Response.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Contact API error:', error);
    return Response.json({ success: false }, { status: 500, headers: CORS_HEADERS });
  }
}
