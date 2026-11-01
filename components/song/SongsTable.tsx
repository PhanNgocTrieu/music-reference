import Link from "next/link";
import Badge from "@/components/ui/Badge";
import HoverPreview from "@/components/ui/HoverPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { genreColorClass } from "@/lib/ui/genreColor";
import { getRefSong, type Song } from "@/lib/data/songs";

export default function SongsTable({ songs }: { songs: Song[] }) {
  const { t, lang } = useLanguage();
  const refColumnLabel = lang === "vi" ? "EN ref" : "VI ref";

  return (
    <div className="max-h-[31rem] overflow-auto rounded-xl border border-cream-300 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="divide-x divide-cream-300 text-xs uppercase tracking-wide text-navy-500">
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colTitle")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colPerformedBy")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colKey")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colGenres")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colSheet")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{refColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => {
            const refSong = getRefSong(song);
            const refLabel = song.lang === "en" ? "VI" : "EN";

            return (
              <tr key={song.slug} className="divide-x divide-cream-200 border-b border-cream-200 last:border-0 hover:bg-gold-50/60">
                <td className="px-4 py-3 align-top">
                  <Link href={`/song/${song.slug}`} className="font-medium text-navy-900 hover:text-navy-600">
                    {song.title}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top text-navy-500">{song.performedBy}</td>
                <td className="px-4 py-3 align-top">
                  <Badge label={song.key} tone="bg-gold-100 text-gold-700" />
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col items-start gap-1">
                    {song.genres.map((genre) => (
                      <Badge key={genre} label={genre} tone={genreColorClass(genre)} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <a
                    href={song.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-navy-600 hover:text-navy-800"
                  >
                    PDF
                  </a>
                </td>
                <td className="px-4 py-3 align-top">
                  {refSong ? (
                    <HoverPreview
                      trigger={
                        <Link
                          href={`/song/${refSong.slug}`}
                          className="inline-flex items-center rounded-full border border-navy-200 px-2 py-0.5 text-xs font-medium text-navy-600 hover:bg-navy-50"
                        >
                          {refLabel}
                        </Link>
                      }
                    >
                      <p className="font-medium text-navy-900">{refSong.title}</p>
                      <p className="mt-1 text-navy-500">{refSong.author}</p>
                      <p className="text-navy-500">{refSong.performedBy}</p>
                      <p className="mt-1 text-navy-400">Key: {refSong.key}</p>
                    </HoverPreview>
                  ) : (
                    <span className="text-navy-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
