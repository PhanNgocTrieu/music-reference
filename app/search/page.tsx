import type { Metadata } from "next";
import Link from "next/link";
import { searchClient, INDEXES } from "@/lib/search/client";

export const metadata: Metadata = { title: "Search" };

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", type = "all" } = await searchParams;

  let artistHits: any[] = [];
  let releaseHits: any[] = [];

  if (q.trim()) {
    const [artistRes, releaseRes] = await Promise.all([
      type !== "release" ? searchClient.index(INDEXES.artists).search(q, { limit: 12 }) : null,
      type !== "artist" ? searchClient.index(INDEXES.releases).search(q, { limit: 12 }) : null,
    ]);
    artistHits = artistRes?.hits ?? [];
    releaseHits = releaseRes?.hits ?? [];
  }

  const total = artistHits.length + releaseHits.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Search</h1>

      {/* Search form */}
      <form method="GET" className="mb-8 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Artists, albums, tracks…"
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="artist">Artists</option>
          <option value="release">Releases</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {q && (
        <p className="mb-6 text-sm text-zinc-500">
          {total} result{total !== 1 ? "s" : ""} for <strong>"{q}"</strong>
        </p>
      )}

      {artistHits.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">Artists</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artistHits.map((hit: any) => (
              <Link
                key={hit.id}
                href={`/artist/${hit.slug}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300 transition-all"
              >
                <p className="font-medium text-zinc-900">{hit.name}</p>
                <p className="text-xs text-zinc-500 capitalize mt-0.5">
                  {[hit.type, hit.country].filter(Boolean).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {releaseHits.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">Releases</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {releaseHits.map((hit: any) => (
              <Link
                key={hit.id}
                href={`/release/${hit.slug}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300 transition-all"
              >
                <p className="font-medium text-zinc-900">{hit.title}</p>
                {hit.artistName && (
                  <p className="text-sm text-zinc-500 mt-0.5">{hit.artistName}</p>
                )}
                <p className="text-xs text-zinc-400 mt-1 capitalize">
                  {[hit.year, hit.type].filter(Boolean).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {q && total === 0 && (
        <p className="text-zinc-500">No results found. Try a different search.</p>
      )}
    </div>
  );
}
