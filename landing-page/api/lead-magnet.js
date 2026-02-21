const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID_LEAD_MAGNET = 7;
const BREVO_LIST_ID_NEWSLETTER = 6;
const PDF_URL = 'https://pacifikai.com/assets/guide-10-workflows-ia.pdf';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'BREVO_API_KEY not configured' });
  }

  const { email, source } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
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
      return res.status(200).json({ success: true, pdf_url: PDF_URL });
    }

    const err = await response.json();
    if (err.code === 'duplicate_parameter') {
      // Already exists — still give them the PDF
      return res.status(200).json({ success: true, pdf_url: PDF_URL, duplicate: true });
    }

    return res.status(response.status).json({ error: err.message || 'Brevo error' });
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
