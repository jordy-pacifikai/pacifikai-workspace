const SUPABASE_URL = process.env.SUPABASE_URL || "https://ogsimsfqwibcmotaeevb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const BREVO_KEY = process.env.BREVO_API_KEY;

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  // Honeypot: invisible CSS-hidden field — humans never fill it, bots usually do.
  // If filled, request is silently dropped (returns 200 to avoid signaling the bot).
  website?: string;
  // Client-side timestamp of when the form was rendered. Used to reject sub-second submits.
  rendered_at?: number;
};

// In-memory rate limiter: 5 requests per IP per 10 min window.
// Resets on redeploy (acceptable for a low-traffic page).
const rateLimitWindow = 10 * 60 * 1000;
const rateLimitMax = 5;
const rateLimitStore = new Map<string, { count: number; reset: number }>();

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitStore.set(ip, { count: 1, reset: now + rateLimitWindow });
    return true;
  }
  if (entry.count >= rateLimitMax) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore) {
    if (now > v.reset) rateLimitStore.delete(k);
  }
}, 60 * 1000).unref?.();

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isValidEmail = (e: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;

// Detects bot gibberish: long single token with mixed-case noise and no spaces/separators.
// Real names "Jean-Marc Dupont" pass; "hNBiynUVFrmuBCDDxTmbyZmk" doesn't.
function looksLikeGibberish(s: string): boolean {
  const trimmed = s.trim();
  if (trimmed.length < 12) return false;
  if (/\s/.test(trimmed)) return false;
  // count case transitions: random camel noise has many; real words have ~0-2
  let transitions = 0;
  for (let i = 1; i < trimmed.length; i++) {
    const prev = trimmed[i - 1];
    const cur = trimmed[i];
    if (/[a-z]/.test(prev) && /[A-Z]/.test(cur)) transitions++;
    if (/[A-Z]/.test(prev) && /[a-z]/.test(cur) && i > 1) transitions++;
  }
  return transitions >= 4;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimitCheck(ip)) {
      return Response.json(
        { error: "trop de demandes, reessayez dans quelques minutes" },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Payload;
    const { name, email, company, message, website, rendered_at } = body;

    // Honeypot triggered — silently accept to avoid signaling
    if (website && String(website).trim()) {
      console.warn("contact-form honeypot triggered, ip:", ip);
      return Response.json({ success: true });
    }

    // Time-to-submit check: real humans take >= 2s to fill a multi-field form
    if (typeof rendered_at === "number" && Date.now() - rendered_at < 2000) {
      console.warn("contact-form submitted too fast, ip:", ip, "dt:", Date.now() - rendered_at);
      return Response.json({ success: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: "name, email and message required" }, { status: 400 });
    }

    const nameT = name.trim();
    const emailT = email.trim();
    const companyT = company?.trim() ?? "";
    const messageT = message.trim();

    if (!isValidEmail(emailT)) {
      return Response.json({ error: "email invalide" }, { status: 400 });
    }

    if (nameT.length > 120 || companyT.length > 120 || messageT.length > 4000) {
      return Response.json({ error: "champ trop long" }, { status: 400 });
    }

    if (
      looksLikeGibberish(nameT) ||
      looksLikeGibberish(companyT) ||
      looksLikeGibberish(messageT)
    ) {
      console.warn("contact-form gibberish detected, ip:", ip);
      return Response.json({ success: true });
    }

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
          name: nameT,
          email: emailT,
          temperature: "warm",
          conversation_stage: "discovery",
          last_contact_at: new Date().toISOString(),
        }),
      });
    }

    if (BREVO_KEY) {
      const sName = escapeHtml(nameT);
      const sEmail = escapeHtml(emailT);
      const sCompany = companyT ? escapeHtml(companyT) : "";
      const sMsg = escapeHtml(messageT).replace(/\n/g, "<br>");

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "PACIFIK'AI Contact", email: "noreply@pacifikai.com" },
          to: [{ email: "contact@pacifikai.com", name: "Jordy" }],
          replyTo: { email: emailT, name: nameT },
          subject: `[Contact] ${sName}${sCompany ? ` — ${sCompany}` : ""}`,
          htmlContent: `<h3>Nouveau message depuis pacifikai.com/contact</h3>
<p><strong>Nom:</strong> ${sName}</p>
<p><strong>Email:</strong> ${sEmail}</p>
${sCompany ? `<p><strong>Entreprise:</strong> ${sCompany}</p>` : ""}
<hr>
<p>${sMsg}</p>`,
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
