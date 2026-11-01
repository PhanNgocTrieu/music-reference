import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReleasesByYear } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import ReleaseCard from "@/components/release/ReleaseCard";
import Pagination from "@/components/ui/Pagination";

export const revalidate = 1800;

interface Props {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return { title: `Releases from ${year}` };
}

export default async function YearPage({ params, searchParams }: Props) {
  const { year: yearStr } = await params;
  const { page: pageStr = "1" } = await searchParams;
  const year = parseInt(yearStr, 10);
  const page = Math.max(1, parseInt(pageStr, 10));

  if (isNaN(year) || year < 1000 || year > 2100) notFound();

  const key = cacheKey.year(year, page);
  let data = await getCache<Awaited<ReturnType<typeof getReleasesByYear>>>(key);
  if (!data) {
    data = await getReleasesByYear(year, page);
    await setCache(key, data, CACHE_TTL.browse);
  }

  const { releaseGroups, total } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Browse by year</p>
        <h1 className="text-3xl font-semibold text-zinc-900">{year}</h1>
        <p className="mt-1 text-sm text-zinc-500">{total} release{total !== 1 ? "s" : ""}</p>
      </div>

      {releaseGroups.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {releaseGroups.map((rg) => (
              <ReleaseCard
                key={rg.id}
                title={rg.title}
                slug={rg.slug}
                artistName={rg.artist?.name}
                artistSlug={rg.artist?.slug}
                year={rg.year}
                type={rg.type ?? undefined}
              />
            ))}
          </div>
          <Pagination page={page} total={total} buildHref={(p) => `/browse/year/${year}?page=${p}`} />
        </>
      ) : (
        <p className="text-zinc-500">No releases found for {year}.</p>
      )}

      <div className="mt-10 flex gap-4 text-sm">
        {year > 1900 && (
          <a href={`/browse/year/${year - 1}`} className="text-zinc-500 hover:text-zinc-900">← {year - 1}</a>
        )}
        {year < new Date().getFullYear() && (
          <a href={`/browse/year/${year + 1}`} className="text-zinc-500 hover:text-zinc-900 ml-auto">{year + 1} →</a>
        )}
      </div>
    </div>
  );
}
