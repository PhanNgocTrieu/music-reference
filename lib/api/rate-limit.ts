import { redis } from "../cache";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const windowStart = Math.floor(Date.now() / (windowSeconds * 1000));
  const redisKey = `rate:${key}:${windowStart}`;

  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSeconds);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: (windowStart + 1) * windowSeconds * 1000,
  };
}

export function getRateLimitHeaders(result: RateLimitResult, limit: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };
}
