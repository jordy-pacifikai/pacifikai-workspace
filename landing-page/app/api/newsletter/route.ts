const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = 6;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

interface BrevoErrorResponse {
  code?: string;
  message?: string;
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  if (!BREVO_API_KEY) {
    return Response.json({ error: 'BREVO_API_KEY not configured' }, { status: 500, headers: CORS_HEADERS });
  }

  const body = await request.json() as { email?: string; source?: string } | null;
  const { email, source } = body ?? {};

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Email invalide' }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
        attributes: { SOURCE: source || 'PACIFIKAI' }
      })
    });

    if (response.ok || response.status === 201 || response.status === 204) {
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    const err = await response.json() as BrevoErrorResponse;
    if (err.code === 'duplicate_parameter') {
      return Response.json({ success: true, duplicate: true }, { headers: CORS_HEADERS });
    }

    return Response.json(
      { error: err.message || 'Brevo error' },
      { status: response.status, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Newsletter API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}
