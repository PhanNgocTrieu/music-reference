import Link from "next/link";
import { listGenres } from "@/lib/db/queries";

export default async function HomePage() {
  const genres = await listGenres().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Music Reference</h1>
        <p className="mt-3 text-zinc-500">Explore artists, releases, and tracks.</p>
        <form action="/search" className="mt-8 flex justify-center">
          <div className="flex w-full max-w-lg gap-2">
            <input
              name="q"
              autoFocus
              placeholder="Search artists, albums, tracks…"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Browse sections */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "By Genre", href: genres[0] ? `/browse/genre/${genres[0].slug}` : "/search", desc: "Find music by style" },
          { title: "By Year", href: "/browse/year/1970", desc: "Browse by release year" },
          { title: "By Label", href: "/search?type=label", desc: "Explore record labels" },
          { title: "By Country", href: "/browse/country/us", desc: "Discover by origin" },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-semibold text-zinc-900">{item.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
          </Link>
        ))}
      </section>

      {/* Genres */}
      {genres.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/browse/genre/${g.slug}`}
                className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm capitalize text-zinc-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
