import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis-backed rate limiter — survives Vercel cold starts.
// Falls back to in-memory Map if env vars are missing (local dev).

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

interface RateLimitConfig {
  interval: number; // ms
  limit: number;
}

// ── In-memory fallback (local dev only) ──────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const fallbackMap = new Map<string, RateLimitEntry>();

function fallbackRateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = fallbackMap.get(key);

  if (!entry || now > entry.resetAt) {
    fallbackMap.set(key, { count: 1, resetAt: now + config.interval });
    return { success: true, remaining: config.limit - 1 };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count };
}

// ── Cache of Ratelimit instances per unique config ───────────────────────────

const limiters = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit {
  const cacheKey = `${config.limit}:${config.interval}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.interval} ms`),
      prefix: 'vea:rl',
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── Public API (same interface as before) ────────────────────────────────────

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

/**
 * @deprecated Use `rateLimitAsync` instead — all API routes can await.
 * This sync version always falls back to in-memory (no Redis), kept only
 * for backward compatibility. It does NOT survive Vercel cold starts.
 */
export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number } {
  return fallbackRateLimit(key, config);
}

/**
 * Async rate limit — use this in API routes that can await.
 * Returns { success, remaining } just like the sync version.
 */
export async function rateLimitAsync(key: string, config: RateLimitConfig): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    return fallbackRateLimit(key, config);
  }

  const limiter = getLimiter(config);
  const result = await limiter.limit(key);
  return { success: result.success, remaining: result.remaining };
}
