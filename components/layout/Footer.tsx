import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-zinc-500">Music Reference — a community database</p>
          <nav className="flex gap-5 text-sm text-zinc-500">
            <Link href="/browse/genre/hymn" className="hover:text-zinc-900">Browse</Link>
            <Link href="/search" className="hover:text-zinc-900">Search</Link>
            <Link href="/api/v1/artists" className="hover:text-zinc-900">API</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
