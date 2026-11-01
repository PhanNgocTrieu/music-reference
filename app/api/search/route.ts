import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchClient, INDEXES } from "@/lib/search/client";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";

const schema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["all", "artist", "release"]).default("all"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { q, type, limit } = parsed.data;
  const key = cacheKey.search(`${type}:${q}:${limit}`);
  const cached = await getCache(key);
  if (cached) return NextResponse.json(cached);

  const [artistRes, releaseRes] = await Promise.all([
    type !== "release" ? searchClient.index(INDEXES.artists).search(q, { limit }) : null,
    type !== "artist" ? searchClient.index(INDEXES.releases).search(q, { limit }) : null,
  ]);

  const result = {
    artists: artistRes?.hits ?? [],
    releases: releaseRes?.hits ?? [],
    query: q,
  };

  await setCache(key, result, CACHE_TTL.search);
  return NextResponse.json(result);
}
