// In-memory sliding window rate limiter with automatic cleanup
// Note: On serverless (Vercel), each function instance has its own Map.
// State resets on cold start. Acceptable for current scale (<1K users).
// If scaling beyond PF market, migrate to Upstash Redis or Supabase RPC.

interface RateLimitConfig {
  interval: number; // ms
  limit: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000; // cleanup stale entries every 60s

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  });
}

/**
 * Extract the client IP from request headers.
 * Prefers x-real-ip (set by Vercel), falls back to first x-forwarded-for entry.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ??
    ((req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'unknown')
  );
}

export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.interval });
    return { success: true, remaining: config.limit - 1 };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count };
}
