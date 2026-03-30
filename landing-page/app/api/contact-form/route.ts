const SUPABASE_URL = process.env.SUPABASE_URL || "https://ogsimsfqwibcmotaeevb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const BREVO_KEY = process.env.BREVO_API_KEY;

export async function POST(request: Request): Promise<Response> {
  try {
    const { name, email, company, message } = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: "name, email and message required" }, { status: 400 });
    }

    // Save to Supabase
    if (SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/messenger_prospects`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          sender_id: `contact-${Date.now()}`,
          source: "contact-page",
          name: name.trim(),
          email: email.trim(),
          temperature: "warm",
          conversation_stage: "discovery",
          last_contact_at: new Date().toISOString(),
        }),
      });
    }

    // Send notification email via Brevo
    if (BREVO_KEY) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "PACIFIK'AI Contact", email: "noreply@pacifikai.com" },
          to: [{ email: "contact@pacifikai.com", name: "Jordy" }],
          replyTo: { email: email.trim(), name: name.trim() },
          subject: `[Contact] ${name.trim()}${company ? ` — ${company.trim()}` : ""}`,
          htmlContent: `<h3>Nouveau message depuis pacifikai.com/contact</h3>
<p><strong>Nom:</strong> ${name.trim()}</p>
<p><strong>Email:</strong> ${email.trim()}</p>
${company ? `<p><strong>Entreprise:</strong> ${company.trim()}</p>` : ""}
<hr>
<p>${message.trim().replace(/\n/g, "<br>")}</p>`,
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
