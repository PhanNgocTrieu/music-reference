import Link from "next/link";

interface ReleaseCardProps {
  title: string;
  slug: string;
  artistName?: string | null;
  artistSlug?: string | null;
  year?: number | null;
  type?: string | null;
}

export default function ReleaseCard({ title, slug, artistName, artistSlug, year, type }: ReleaseCardProps) {
  const meta = [year, type].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
      <Link href={`/release/${slug}`} className="block font-medium text-zinc-900 truncate hover:text-indigo-600">
        {title}
      </Link>
      {artistName && artistSlug && (
        <Link href={`/artist/${artistSlug}`} className="mt-0.5 block text-sm text-zinc-500 truncate hover:text-zinc-700">
          {artistName}
        </Link>
      )}
      {meta && <p className="mt-1 text-xs text-zinc-400 capitalize">{meta}</p>}
    </div>
  );
}
