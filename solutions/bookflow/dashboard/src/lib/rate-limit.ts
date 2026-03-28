// Upstash Redis-backed rate limiter — survives Vercel cold starts.
// Falls back to in-memory Map if env vars are missing or packages fail.
// Dynamic imports to avoid runtime crash on Vercel if bundling fails.

let _upstashLoaded = false;
let _Ratelimit: typeof import('@upstash/ratelimit').Ratelimit | null = null;
let _redis: InstanceType<typeof import('@upstash/redis').Redis> | null = null;

async function loadUpstash(): Promise<boolean> {
  if (_upstashLoaded) return !!_redis;
  _upstashLoaded = true;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return false;
  try {
    const [{ Redis }, { Ratelimit }] = await Promise.all([
      import('@upstash/redis'),
      import('@upstash/ratelimit'),
    ]);
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    _Ratelimit = Ratelimit;
    return true;
  } catch {
    return false;
  }
}

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

const limiters = new Map<string, unknown>();

async function getLimiter(config: RateLimitConfig) {
  const cacheKey = `${config.limit}:${config.interval}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter && _Ratelimit && _redis) {
    limiter = new _Ratelimit({
      redis: _redis,
      limiter: _Ratelimit.slidingWindow(config.limit, `${config.interval} ms`),
      prefix: 'vea:rl',
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter as { limit: (key: string) => Promise<{ success: boolean; remaining: number }> } | undefined;
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
  const hasRedis = await loadUpstash();
  if (!hasRedis) return fallbackRateLimit(key, config);

  const limiter = await getLimiter(config);
  if (!limiter) return fallbackRateLimit(key, config);

  const result = await limiter.limit(key);
  return { success: result.success, remaining: result.remaining };
}
