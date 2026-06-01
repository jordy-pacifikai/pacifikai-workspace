const BREVO_KEY = process.env.BREVO_API_KEY;
const CONTACT_TO = process.env.CONTACT_TO || "contact@pacificblueconsulting.org";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "contact@pacifikai.com";
const CONTACT_FROM_NAME = process.env.CONTACT_FROM_NAME || "Pacific Blue Consulting";

type Payload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  domain?: string;
  message?: string;
  locale?: string;
  // Honeypot — humans never fill this (CSS-hidden).
  website?: string;
};

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
  rateLimitStore.forEach((v, k) => {
    if (now > v.reset) rateLimitStore.delete(k);
  });
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

const DOMAIN_LABELS: Record<string, string> = {
  mobilites: "Mobilités & Transport aérien",
  infrastructures: "Infrastructures & Territoires",
  environnement: "Environnement & Souveraineté",
  transformation: "Transformation, Compétences & Création d'entreprise",
  autre: "Autre",
};

export async function POST(request: Request): Promise<Response> {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimitCheck(ip)) {
      return Response.json(
        { error: "Trop de demandes, réessayez dans quelques minutes." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Payload;
    const { name, company, email, phone, domain, message, locale, website } = body;

    if (website && String(website).trim()) {
      console.warn("pbc-contact honeypot triggered, ip:", ip);
      return Response.json({ success: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { error: "Champs requis manquants (nom, email, message)." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email.trim())) {
      return Response.json({ error: "Email invalide." }, { status: 400 });
    }

    if (
      !isReasonableLength(name, 120) ||
      !isReasonableLength(company ?? "", 160) ||
      !isReasonableLength(phone ?? "", 40) ||
      !isReasonableLength(domain ?? "", 40) ||
      !isReasonableLength(message, 6000)
    ) {
      return Response.json({ error: "Champ trop long." }, { status: 400 });
    }

    if (!BREVO_KEY) {
      console.error("pbc-contact: BREVO_API_KEY missing");
      return Response.json(
        { error: "Service email indisponible." },
        { status: 500 },
      );
    }

    const sName = escapeHtml(name.trim());
    const sCompany = company?.trim() ? escapeHtml(company.trim()) : "";
    const sEmail = escapeHtml(email.trim());
    const sPhone = phone?.trim() ? escapeHtml(phone.trim()) : "";
    const sDomainKey = domain?.trim() ?? "";
    const sDomainLabel = DOMAIN_LABELS[sDomainKey] ?? "";
    const sMsg = escapeHtml(message.trim());
    const sLocale = locale === "en" ? "EN" : "FR";

    const subject = `[PBC] ${sName}${sDomainLabel ? ` — ${sDomainLabel}` : ""}`;
    const html = `
      <h2 style="color:#0a2540;font-family:Georgia,serif;margin-bottom:8px">Nouvelle demande de contact</h2>
      <p style="color:#666;font-size:13px;margin-top:0">Reçu depuis pbc.pacifikai.com (${sLocale})</p>
      <table cellpadding="8" style="border-collapse:collapse;font-family:-apple-system,sans-serif;font-size:14px;margin-top:16px">
        <tr><td style="color:#666"><b>Nom</b></td><td>${sName}</td></tr>
        ${sCompany ? `<tr><td style="color:#666"><b>Entreprise</b></td><td>${sCompany}</td></tr>` : ""}
        <tr><td style="color:#666"><b>Email</b></td><td><a href="mailto:${sEmail}" style="color:#c9a047">${sEmail}</a></td></tr>
        ${sPhone ? `<tr><td style="color:#666"><b>Téléphone</b></td><td><a href="tel:${sPhone}" style="color:#c9a047">${sPhone}</a></td></tr>` : ""}
        ${sDomainLabel ? `<tr><td style="color:#666"><b>Domaine</b></td><td>${escapeHtml(sDomainLabel)}</td></tr>` : ""}
      </table>
      <h3 style="font-family:Georgia,serif;color:#0a2540;margin-top:24px;margin-bottom:8px">Message</h3>
      <p style="white-space:pre-wrap;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;background:#f7f6f4;padding:16px;border-radius:8px;border-left:3px solid #c9a047">${sMsg}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
      <p style="color:#999;font-size:12px;font-family:-apple-system,sans-serif">
        Pacific Blue Consulting — Cabinet de conseil indépendant, Polynésie française
      </p>
    `;

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: CONTACT_FROM_NAME, email: CONTACT_FROM_EMAIL },
        to: [{ email: CONTACT_TO, name: "Pacific Blue Consulting" }],
        replyTo: { email: email.trim(), name: name.trim() },
        subject,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.text();
      console.error("pbc-contact Brevo error:", brevoRes.status, err);
      return Response.json(
        { error: "L'envoi a échoué. Réessayez ou contactez-nous directement." },
        { status: 502 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("pbc-contact error:", error);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
