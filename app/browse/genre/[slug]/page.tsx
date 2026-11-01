import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtistsByGenre, getReleaseGroupsByGenre } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import ArtistCard from "@/components/artist/ArtistCard";
import ReleaseCard from "@/components/release/ReleaseCard";
import Pagination from "@/components/ui/Pagination";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { genre } = await getArtistsByGenre(slug, 1);
  if (!genre) return {};
  return { title: `${genre.name} — Browse by Genre` };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));

  const aKey = cacheKey.genreArtists(slug, page);
  let artistData = await getCache<Awaited<ReturnType<typeof getArtistsByGenre>>>(aKey);
  if (!artistData) {
    artistData = await getArtistsByGenre(slug, page);
    await setCache(aKey, artistData, CACHE_TTL.browse);
  }
  if (!artistData.genre) notFound();

  const rKey = cacheKey.genreReleases(slug, page);
  let releaseData = await getCache<Awaited<ReturnType<typeof getReleaseGroupsByGenre>>>(rKey);
  if (!releaseData) {
    releaseData = await getReleaseGroupsByGenre(slug, page);
    await setCache(rKey, releaseData, CACHE_TTL.browse);
  }

  const { genre, artists, total: artistTotal } = artistData;
  const { releaseGroups, total: rgTotal } = releaseData ?? { releaseGroups: [], total: 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Genre</p>
        <h1 className="text-3xl font-semibold capitalize text-zinc-900">{genre.name}</h1>
      </div>

      {artists.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Artists <span className="text-sm font-normal text-zinc-400">({artistTotal})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artists.map((a) => (
              <ArtistCard key={a.id} name={a.name} slug={a.slug} type={a.type} country={a.country} beginYear={a.beginYear} endYear={a.endYear} />
            ))}
          </div>
          <Pagination page={page} total={artistTotal} buildHref={(p) => `/browse/genre/${slug}?page=${p}`} />
        </section>
      )}

      {releaseGroups.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Releases <span className="text-sm font-normal text-zinc-400">({rgTotal})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {releaseGroups.map((rg) => (
              <ReleaseCard key={rg.id} title={rg.title} slug={rg.slug} year={rg.year} type={rg.type ?? undefined} />
            ))}
          </div>
        </section>
      )}

      {artists.length === 0 && releaseGroups.length === 0 && (
        <p className="text-zinc-500">No items in this genre yet.</p>
      )}
    </div>
  );
}
