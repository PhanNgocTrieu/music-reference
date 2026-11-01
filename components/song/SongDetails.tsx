"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { genreColorClass } from "@/lib/ui/genreColor";
import { getRefSong, type Song } from "@/lib/data/songs";

export default function SongDetails({ song }: { song: Song }) {
  const { t } = useLanguage();
  const refSong = getRefSong(song);
  const refLabel = song.lang === "en" ? "VI" : "EN";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-navy-400 hover:text-navy-800">
        ← {t("back")}
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">{song.title}</h1>
        <Badge label={song.key} tone="bg-gold-100 text-gold-700" />
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-navy-400">{t("detailAuthor")}</dt>
          <dd className="text-navy-900">{song.author}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-navy-400">{t("detailPerformedBy")}</dt>
          <dd className="text-navy-900">{song.performedBy}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-navy-400">{t("detailKey")}</dt>
          <dd className="text-navy-900">{song.key}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-navy-400">{t("detailGenres")}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {song.genres.map((genre) => (
              <Badge key={genre} label={genre} tone={genreColorClass(genre)} />
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={song.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
        >
          {t("listen")}
        </a>
        <a
          href={song.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-cream-100"
        >
          {t("viewSheet")}
        </a>
        {refSong && (
          <Link
            href={`/song/${refSong.slug}`}
            className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-cream-100"
          >
            {refLabel} · {refSong.title}
          </Link>
        )}
      </div>
    </div>
  );
}
