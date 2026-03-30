const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID_LEAD_MAGNET = 7;
const BREVO_LIST_ID_NEWSLETTER = 6;
const PDF_URL = 'https://pacifikai.com/assets/guide-10-workflows-ia.pdf';

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
    // Add to both Lead Magnet list AND Newsletter list
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID_LEAD_MAGNET, BREVO_LIST_ID_NEWSLETTER],
        updateEnabled: true,
        attributes: {
          SOURCE: source || 'lead-magnet',
          LEAD_MAGNET: 'guide-10-workflows-ia',
          SIGNUP_DATE: new Date().toISOString().split('T')[0]
        }
      })
    });

    if (response.ok || response.status === 201 || response.status === 204) {
      return Response.json({ success: true, pdf_url: PDF_URL }, { headers: CORS_HEADERS });
    }

    const err = await response.json() as BrevoErrorResponse;
    if (err.code === 'duplicate_parameter') {
      // Already exists — still give them the PDF
      return Response.json({ success: true, pdf_url: PDF_URL, duplicate: true }, { headers: CORS_HEADERS });
    }

    return Response.json(
      { error: err.message || 'Brevo error' },
      { status: response.status, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}
