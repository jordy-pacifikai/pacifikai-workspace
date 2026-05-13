const BREVO_KEY = process.env.BREVO_API_KEY;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://gwakatahiti.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

type Payload = {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  date?: string;
  prestation?: string;
  personnes?: string;
  message?: string;
  // Honeypot field — humans never fill this (CSS-hidden).
  // If filled, request is silently dropped (returns 200 to avoid signaling bots).
  website?: string;
};

// In-memory rate limiter: 5 requests per IP per 10 min window.
// Resets on redeploy (acceptable for a low-traffic site).
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

// Periodic cleanup to avoid unbounded growth
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

const isReasonableLength = (s: string, max: number): boolean => s.length <= max;

export async function POST(request: Request): Promise<Response> {
  try {
    // Rate limit by client IP (Caddy forwards X-Forwarded-For)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimitCheck(ip)) {
      return Response.json(
        { error: "trop de demandes, reessayez dans quelques minutes" },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    const body = (await request.json()) as Payload;
    const { prenom, nom, email, telephone, date, prestation, personnes, message, website } = body;

    // Honeypot: if the hidden field is filled, silently drop (return success to avoid bot signaling)
    if (website && String(website).trim()) {
      console.warn("gwaka-contact honeypot triggered, ip:", ip);
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // Required fields
    const required = { prenom, nom, email, telephone, date, prestation, personnes };
    for (const [field, value] of Object.entries(required)) {
      if (!value || !String(value).trim()) {
        return Response.json(
          { error: `${field} required` },
          { status: 400, headers: CORS_HEADERS },
        );
      }
    }

    // Email validation
    if (!isValidEmail(email!.trim())) {
      return Response.json(
        { error: "email invalide" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Length caps to avoid abuse / oversized payloads
    if (
      !isReasonableLength(prenom!, 80) ||
      !isReasonableLength(nom!, 80) ||
      !isReasonableLength(telephone!, 30) ||
      !isReasonableLength(prestation!, 40) ||
      !isReasonableLength(personnes!, 10) ||
      !isReasonableLength(message ?? "", 4000)
    ) {
      return Response.json(
        { error: "champ trop long" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!BREVO_KEY) {
      return Response.json(
        { error: "email service unavailable" },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    // Sanitize all values before injecting into HTML email
    const sPrenom = escapeHtml(prenom!.trim());
    const sNom = escapeHtml(nom!.trim());
    const sEmail = escapeHtml(email!.trim());
    const sTel = escapeHtml(telephone!.trim());
    const sDate = escapeHtml(date!.trim());
    const sPresta = escapeHtml(prestation!.trim());
    const sPers = escapeHtml(personnes!.trim());
    const sMsg = message?.trim() ? escapeHtml(message.trim()) : "";

    const fullName = `${sPrenom} ${sNom}`;
    const subject = `[GWAKA] Demande devis ${sPresta} — ${fullName} (${sPers} pers.)`;
    const html = `
      <h2 style="color:#4A7C3F">Nouvelle demande de devis GWAKA</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><b>Nom</b></td><td>${fullName}</td></tr>
        <tr><td><b>Email</b></td><td><a href="mailto:${sEmail}">${sEmail}</a></td></tr>
        <tr><td><b>Telephone</b></td><td><a href="tel:${sTel}">${sTel}</a></td></tr>
        <tr><td><b>Date evenement</b></td><td>${sDate}</td></tr>
        <tr><td><b>Type</b></td><td>${sPresta}</td></tr>
        <tr><td><b>Nombre de personnes</b></td><td>${sPers}</td></tr>
      </table>
      ${sMsg ? `<h3>Message</h3><p style="white-space:pre-wrap">${sMsg}</p>` : ""}
      <hr>
      <p style="color:#888;font-size:12px">Envoye depuis gwakatahiti.com</p>
    `;

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "GWAKA", email: "contact@gwakatahiti.com" },
        to: [{ email: "gwakatahiti@gmail.com", name: "GWAKA" }],
        replyTo: { email: email!.trim(), name: `${prenom!.trim()} ${nom!.trim()}` },
        subject,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.text();
      console.error("Brevo error:", brevoRes.status, err);
      return Response.json(
        { error: "email send failed" },
        { status: 502, headers: CORS_HEADERS },
      );
    }

    return Response.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("gwaka-contact error:", error);
    return Response.json(
      { error: "internal error" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
