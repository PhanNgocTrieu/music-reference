import { NextRequest, NextResponse } from "next/server";
import { getReleaseBySlug } from "@/lib/db/queries";
import { rateLimit, getRateLimitHeaders } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const rl = await rateLimit(`api:release:${ip}`, 60, 60);
  const headers = getRateLimitHeaders(rl, 60);

  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const { slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404, headers });

  return NextResponse.json(
    {
      id: release.id,
      slug: release.slug,
      title: release.title,
      format: release.format,
      date: release.date,
      country: release.country,
      artist: release.releaseGroup?.artist
        ? { id: release.releaseGroup.artist.id, name: release.releaseGroup.artist.name, slug: release.releaseGroup.artist.slug }
        : null,
      tracks: release.tracks?.map((t) => ({
        position: t.position,
        title: t.title,
        duration: t.duration,
      })),
    },
    { headers }
  );
}
