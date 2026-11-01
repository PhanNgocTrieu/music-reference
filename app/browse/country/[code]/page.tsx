import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtistsByCountry } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import ArtistCard from "@/components/artist/ArtistCard";
import Pagination from "@/components/ui/Pagination";

export const revalidate = 1800;

interface Props {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ page?: string }>;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
  JP: "Japan", BR: "Brazil", CA: "Canada", AU: "Australia", NG: "Nigeria",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
  return { title: `Artists from ${country}` };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const upperCode = code.toUpperCase();

  const key = cacheKey.country(upperCode, page);
  let data = await getCache<Awaited<ReturnType<typeof getArtistsByCountry>>>(key);
  if (!data) {
    data = await getArtistsByCountry(upperCode, page);
    await setCache(key, data, CACHE_TTL.browse);
  }

  const { artists, total } = data;
  const countryName = COUNTRY_NAMES[upperCode] ?? upperCode;

  if (total === 0 && page === 1) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Browse by country</p>
        <h1 className="text-3xl font-semibold text-zinc-900">{countryName}</h1>
        <p className="mt-1 text-sm text-zinc-500">{total} artist{total !== 1 ? "s" : ""}</p>
      </div>

      {artists.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artists.map((a) => (
              <ArtistCard key={a.id} name={a.name} slug={a.slug} type={a.type} country={a.country} beginYear={a.beginYear} endYear={a.endYear} />
            ))}
          </div>
          <Pagination page={page} total={total} buildHref={(p) => `/browse/country/${code}?page=${p}`} />
        </>
      ) : (
        <p className="text-zinc-500">No artists found for this country.</p>
      )}
    </div>
  );
}
