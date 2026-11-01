import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArtistBySlug, getRelatedArtists, isFavorited } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import Badge from "@/components/ui/Badge";
import ReleaseCard from "@/components/release/ReleaseCard";
import ArtistCard from "@/components/artist/ArtistCard";
import FavoriteButton from "@/components/user/FavoriteButton";
import { auth } from "@/lib/auth";

export const revalidate = 3600;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug).catch(() => null);
  if (!artist) return {};
  return {
    title: artist.name,
    description: artist.disambiguation ?? `${artist.name} — discography and information`,
    openGraph: { title: artist.name, type: "profile" },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;

  const key = cacheKey.artist(slug);
  let artist = await getCache<Awaited<ReturnType<typeof getArtistBySlug>>>(key);
  if (!artist) {
    artist = await getArtistBySlug(slug);
    if (artist) await setCache(key, artist, CACHE_TTL.page);
  }
  if (!artist) notFound();

  const session = await auth();
  const genreIds = artist.artistGenres?.map((ag) => ag.genreId) ?? [];
  const [related, favorited] = await Promise.all([
    getRelatedArtists(artist.id, genreIds),
    session?.user?.id ? isFavorited(session.user.id, { artistId: artist.id }) : false,
  ]);

  const years =
    artist.beginYear && artist.endYear
      ? `${artist.beginYear}–${artist.endYear}`
      : artist.beginYear
      ? `b. ${artist.beginYear}`
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">{artist.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            {artist.type && <span className="capitalize">{artist.type}</span>}
            {artist.country && <span>{artist.country}</span>}
            {years && <span>{years}</span>}
          </div>
          {artist.disambiguation && (
            <p className="mt-1 text-sm text-zinc-500 italic">{artist.disambiguation}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {artist.artistGenres?.map((ag) => (
              <Badge key={ag.genreId} label={ag.genre.name} href={`/browse/genre/${ag.genre.slug}`} />
            ))}
          </div>
        </div>
        {session && <FavoriteButton initialFavorited={favorited} artistId={artist.id} />}
      </div>

      {artist.bio && (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-600">{artist.bio}</p>
      )}

      {/* Discography */}
      {artist.releaseGroups && artist.releaseGroups.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">Discography</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artist.releaseGroups.map((rg) => (
              <ReleaseCard
                key={rg.id}
                title={rg.title}
                slug={rg.releases?.[0]?.slug ?? rg.slug}
                year={rg.year}
                type={rg.type ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related artists */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">Related Artists</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArtistCard
                key={a.id}
                name={a.name}
                slug={a.slug}
                type={a.type}
                country={a.country}
                beginYear={a.beginYear}
                endYear={a.endYear}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
