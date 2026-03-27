import { createHmac, timingSafeEqual } from 'crypto';

/** Portal tokens expire after 24 hours */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getPortalSecret(): string {
  const s = process.env.PORTAL_SECRET;
  if (!s) throw new Error('PORTAL_SECRET env var is required');
  return s;
}

/**
 * Generates a URL-safe token for client portal access.
 * Token format: base64url(clientId:issuedAt:hmac(clientId:issuedAt, secret))
 *
 * Tokens are valid for 24 hours from issuance.
 */
export function generatePortalToken(clientId: string): string {
  const issuedAt = Date.now().toString(36);
  const payload = `${clientId}:${issuedAt}`;
  const hmac = createHmac('sha256', getPortalSecret()).update(payload).digest('hex');
  const raw = `${payload}:${hmac}`;
  return Buffer.from(raw).toString('base64url');
}

/**
 * Verifies a portal token and returns the clientId, or null if invalid/expired.
 */
export function verifyPortalToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    // New format: clientId:issuedAt:hmac (3 parts)
    // Legacy format: clientId:hmac (2 parts) — reject as expired
    if (parts.length !== 3) return null;

    const clientId = parts[0];
    const issuedAt = parts[1];
    const providedHmac = parts[2];

    // Check expiry
    const issuedMs = parseInt(issuedAt, 36);
    if (isNaN(issuedMs) || Date.now() - issuedMs > TOKEN_TTL_MS) return null;

    const payload = `${clientId}:${issuedAt}`;
    const expectedHmac = createHmac('sha256', getPortalSecret()).update(payload).digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (providedHmac.length !== expectedHmac.length) return null;
    const isValid = timingSafeEqual(
      Buffer.from(providedHmac, 'utf8'),
      Buffer.from(expectedHmac, 'utf8'),
    );
    return isValid ? clientId : null;
  } catch {
    return null;
  }
}

// ─── Unsubscribe tokens (no expiry — valid until secret rotates) ─────────────

const UNSUB_SALT = 'vea-unsubscribe-v1';

function getUnsubSecret(): string {
  return process.env.PORTAL_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
}

/**
 * Generates a signed unsubscribe token for an email address.
 * Token format: base64url(email|hmac(salt:email, secret))
 */
export function generateUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const hmac = createHmac('sha256', getUnsubSecret())
    .update(`${UNSUB_SALT}:${normalized}`)
    .digest('hex');
  return Buffer.from(`${normalized}|${hmac}`).toString('base64url');
}

/**
 * Verifies an unsubscribe token and returns the email, or null if invalid.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const sepIdx = raw.lastIndexOf('|');
    if (sepIdx === -1) return null;

    const email = raw.substring(0, sepIdx);
    const providedHmac = raw.substring(sepIdx + 1);

    const expectedHmac = createHmac('sha256', getUnsubSecret())
      .update(`${UNSUB_SALT}:${email}`)
      .digest('hex');

    if (providedHmac.length !== expectedHmac.length) return null;
    const isValid = timingSafeEqual(
      Buffer.from(providedHmac, 'utf8'),
      Buffer.from(expectedHmac, 'utf8'),
    );
    return isValid ? email : null;
  } catch {
    return null;
  }
}
