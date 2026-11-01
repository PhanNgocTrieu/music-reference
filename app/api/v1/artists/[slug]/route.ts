import { NextRequest, NextResponse } from "next/server";
import { getArtistBySlug } from "@/lib/db/queries";
import { rateLimit, getRateLimitHeaders } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const rl = await rateLimit(`api:artist:${ip}`, 60, 60);
  const headers = getRateLimitHeaders(rl, 60);

  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404, headers });

  return NextResponse.json(
    {
      id: artist.id,
      slug: artist.slug,
      name: artist.name,
      type: artist.type,
      country: artist.country,
      beginYear: artist.beginYear,
      endYear: artist.endYear,
      disambiguation: artist.disambiguation,
      genres: artist.artistGenres?.map((ag) => ag.genre.name) ?? [],
    },
    { headers }
  );
}
