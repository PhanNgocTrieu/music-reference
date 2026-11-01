import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/cache", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
  getCache: vi.fn(),
  setCache: vi.fn(),
}));

import { rateLimit, getRateLimitHeaders } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows request when count is within limit", async () => {
    const { redis } = await import("@/lib/cache");
    vi.mocked(redis.incr).mockResolvedValue(1);

    const result = await rateLimit("test-key", 60, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it("blocks request when limit exceeded", async () => {
    const { redis } = await import("@/lib/cache");
    vi.mocked(redis.incr).mockResolvedValue(61);

    const result = await rateLimit("test-key", 60, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("sets expire on first request (count === 1)", async () => {
    const { redis } = await import("@/lib/cache");
    vi.mocked(redis.incr).mockResolvedValue(1);

    await rateLimit("test-key", 60, 60);
    expect(redis.expire).toHaveBeenCalledOnce();
  });

  it("does not set expire on subsequent requests", async () => {
    const { redis } = await import("@/lib/cache");
    vi.mocked(redis.incr).mockResolvedValue(5);

    await rateLimit("test-key", 60, 60);
    expect(redis.expire).not.toHaveBeenCalled();
  });
});

describe("getRateLimitHeaders", () => {
  it("returns correct header strings", () => {
    const result = { allowed: true, remaining: 55, resetAt: 1700000000000 };
    const headers = getRateLimitHeaders(result, 60);
    expect(headers["X-RateLimit-Limit"]).toBe("60");
    expect(headers["X-RateLimit-Remaining"]).toBe("55");
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000000");
  });
});
