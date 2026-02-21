const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { session_id, name, email } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    if (!name && !email) return res.status(400).json({ error: 'name or email required' });

    const updates = { last_contact_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (email) updates.email = email;

    // PATCH the existing prospect (created by chat.js upsertProspect on first message)
    // If no prospect exists yet, upsert one
    await fetch(`${SUPABASE_URL}/rest/v1/messenger_prospects`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        sender_id: session_id,
        source: 'landing-page',
        temperature: 'cold',
        conversation_stage: 'discovery',
        ...updates
      })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ success: false });
  }
}
