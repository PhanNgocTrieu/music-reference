import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReleasesByLabel } from "@/lib/db/queries";
import { getCache, setCache } from "@/lib/cache";
import { cacheKey, CACHE_TTL } from "@/lib/cache/keys";
import ReleaseCard from "@/components/release/ReleaseCard";
import Pagination from "@/components/ui/Pagination";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { label } = await getReleasesByLabel(slug, 1);
  if (!label) return {};
  return { title: `${label.name} — Label` };
}

export default async function LabelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));

  const key = cacheKey.label(slug, page);
  let data = await getCache<Awaited<ReturnType<typeof getReleasesByLabel>>>(key);
  if (!data) {
    data = await getReleasesByLabel(slug, page);
    await setCache(key, data, CACHE_TTL.browse);
  }
  if (!data.label) notFound();

  const { label, releases, total } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Record label</p>
        <h1 className="text-3xl font-semibold text-zinc-900">{label.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{total} release{total !== 1 ? "s" : ""}</p>
      </div>

      {releases.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {releases.map((r) => (
              <ReleaseCard
                key={r.id}
                title={r.title}
                slug={r.slug}
                artistName={r.releaseGroup?.artist?.name}
                artistSlug={r.releaseGroup?.artist?.slug}
                year={r.releaseGroup?.year}
                type={r.releaseGroup?.type ?? undefined}
              />
            ))}
          </div>
          <Pagination page={page} total={total} buildHref={(p) => `/browse/label/${slug}?page=${p}`} />
        </>
      ) : (
        <p className="text-zinc-500">No releases found for this label.</p>
      )}
    </div>
  );
}
