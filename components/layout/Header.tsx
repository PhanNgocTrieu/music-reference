import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-semibold text-zinc-900 hover:text-indigo-600">
          Music Reference
        </Link>

        <nav className="hidden items-center gap-5 text-sm sm:flex">
          <Link href="/search" className="text-zinc-600 hover:text-zinc-900">Search</Link>
          <Link href="/browse/genre/hymn" className="text-zinc-600 hover:text-zinc-900">Browse</Link>
        </nav>

        <form action="/search" className="ml-auto hidden sm:block">
          <input
            name="q"
            placeholder="Quick search…"
            className="w-56 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </form>

        <div className="ml-4 text-sm">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-zinc-500 sm:block">{session.user?.name ?? session.user?.email}</span>
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="text-zinc-500 hover:text-zinc-900">Sign out</button>
              </form>
            </div>
          ) : (
            <form action={async () => { "use server"; await signIn("github"); }}>
              <button className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700">
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
