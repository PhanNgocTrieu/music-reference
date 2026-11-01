import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export async function setCache(key: string, value: unknown, ttl = 3600): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys);
}
