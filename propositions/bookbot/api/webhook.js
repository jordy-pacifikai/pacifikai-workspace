// WhatsApp Cloud API Webhook — Vercel Serverless Function
// Handles Meta verification (GET) + forwards messages to n8n (POST)

const N8N_WEBHOOK_URL = 'https://n8n.srv1140766.hstgr.cloud/webhook/bookbot-whatsapp';
const VERIFY_TOKEN = 'bookbot_verify_2026';

export default async function handler(req, res) {
  // GET = Meta webhook verification challenge
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // POST = incoming WhatsApp message
  if (req.method === 'POST') {
    const body = req.body;

    // Forward to n8n FIRST, then respond to Meta
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('n8n forward error:', err.message);
    }

    return res.status(200).json({ status: 'ok' });
  }

  res.status(405).send('Method Not Allowed');
}
