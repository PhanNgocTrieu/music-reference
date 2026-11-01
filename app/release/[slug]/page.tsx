import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getReleaseBySlug, isFavorited, getReleaseRating } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/user/FavoriteButton";
import RatingStars from "@/components/user/RatingStars";
import { auth } from "@/lib/auth";

export const revalidate = 3600;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug).catch(() => null);
  if (!release) return {};
  const artist = release.releaseGroup?.artist?.name;
  return {
    title: `${release.title}${artist ? ` by ${artist}` : ""}`,
    description: `${release.title} — track listing, credits and information`,
    openGraph: { title: release.title, type: "music.album" },
  };
}

function fmtDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;

  const key = cacheKey.release(slug);
  let release = await getCache<Awaited<ReturnType<typeof getReleaseBySlug>>>(key);
  if (!release) {
    release = await getReleaseBySlug(slug);
    if (release) await setCache(key, release, CACHE_TTL.page);
  }
  if (!release) notFound();

  const session = await auth();
  const artist = release.releaseGroup?.artist;
  const [favorited, userRating] = await Promise.all([
    session?.user?.id ? isFavorited(session.user.id, { releaseId: release.id }) : false,
    session?.user?.id ? getReleaseRating(session.user.id, release.id) : null,
  ]);

  const meta = [
    release.format,
    release.country,
    release.date?.slice(0, 4),
    release.label?.name,
    release.catalogNumber,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-zinc-500">
            {artist && (
              <Link href={`/artist/${artist.slug}`}>{artist.name}</Link>
            )}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">{release.title}</h1>
          {meta && <p className="mt-2 text-sm text-zinc-500">{meta}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {release.releaseGroup?.releaseGroupGenres?.map((rgg: { genreId: string; genre: { name: string; slug: string } }) => (
              <Badge
                key={rgg.genreId}
                label={rgg.genre.name}
                href={`/browse/genre/${rgg.genre.slug}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {session && <FavoriteButton initialFavorited={favorited} releaseId={release.id} />}
          {session && <RatingStars releaseId={release.id} initialRating={userRating} />}
        </div>
      </div>

      {/* Track listing */}
      {release.tracks && release.tracks.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">Tracks</h2>
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
            {release.tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-6 shrink-0 text-right text-xs text-zinc-400">{track.position}</span>
                <span className="flex-1 text-sm text-zinc-900">{track.title}</span>
                {track.duration && (
                  <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                    {fmtDuration(track.duration)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Credits */}
      {release.credits && release.credits.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">Credits</h2>
          <ul className="space-y-1.5">
            {release.credits.map((credit) => (
              <li key={credit.id} className="flex items-baseline gap-2 text-sm">
                <span className="capitalize text-zinc-500">{credit.role}</span>
                <span className="text-zinc-300">·</span>
                <Link href={`/artist/${credit.artist.slug}`} className="text-zinc-900">
                  {credit.artist.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
