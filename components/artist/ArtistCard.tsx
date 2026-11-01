import Link from "next/link";

interface ArtistCardProps {
  name: string;
  slug: string;
  type?: string | null;
  country?: string | null;
  beginYear?: number | null;
  endYear?: number | null;
}

export default function ArtistCard({ name, slug, type, country, beginYear, endYear }: ArtistCardProps) {
  const meta = [type, country, beginYear && (endYear ? `${beginYear}–${endYear}` : `b. ${beginYear}`)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/artist/${slug}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <p className="font-medium text-zinc-900 truncate">{name}</p>
      {meta && <p className="mt-1 text-xs text-zinc-500 capitalize">{meta}</p>}
    </Link>
  );
}
