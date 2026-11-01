import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/api/rate-limit";
import { z } from "zod";
import { searchClient, INDEXES } from "@/lib/search/client";

const schema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const rl = await rateLimit(`api:search:${ip}`, 60, 60);
  const headers = getRateLimitHeaders(rl, 60);

  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400, headers });
  }

  const { q, limit } = parsed.data;
  const [artistRes, releaseRes] = await Promise.all([
    searchClient.index(INDEXES.artists).search(q, { limit }),
    searchClient.index(INDEXES.releases).search(q, { limit }),
  ]);

  return NextResponse.json({ artists: artistRes.hits, releases: releaseRes.hits, query: q }, { headers });
}
