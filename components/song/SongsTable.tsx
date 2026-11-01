"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import HoverPreview from "@/components/ui/HoverPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { genreColorClass } from "@/lib/ui/genreColor";
import { titleFor, urlFor } from "@/lib/data/song-display";
import type { Song } from "@/lib/data/songs";

type SortKey = "title" | "performedBy" | "key";
type SortDir = "asc" | "desc";
interface SortState {
  key: SortKey;
  dir: SortDir;
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState | null;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sort?.key === sortKey;
  const ariaSort = isActive ? (sort!.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 hover:text-navy-900"
      >
        {label}
        {isActive && <span aria-hidden="true">{sort!.dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

export default function SongsTable({ songs }: { songs: Song[] }) {
  const { t, lang } = useLanguage();
  const otherLang = lang === "en" ? "vi" : "en";
  const otherLangLabel = lang === "en" ? "VI" : "EN";
  const [sort, setSort] = useState<SortState | null>(null);

  function handleSort(key: SortKey) {
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  const sortedSongs = useMemo(() => {
    if (!sort) return songs;
    const dir = sort.dir === "asc" ? 1 : -1;
    const valueFor = (song: Song) =>
      sort.key === "title" ? titleFor(song, lang) : sort.key === "performedBy" ? song.performedBy : song.key;

    return [...songs].sort((a, b) => valueFor(a).localeCompare(valueFor(b)) * dir);
  }, [songs, sort, lang]);

  return (
    <div className="max-h-[31rem] overflow-auto rounded-xl border border-cream-300 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="divide-x divide-cream-300 text-xs uppercase tracking-wide text-navy-500">
            <SortableHeader label={t("colTitle")} sortKey="title" sort={sort} onSort={handleSort} />
            <SortableHeader label={t("colPerformedBy")} sortKey="performedBy" sort={sort} onSort={handleSort} />
            <SortableHeader label={t("colKey")} sortKey="key" sort={sort} onSort={handleSort} />
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colGenres")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("listen")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{t("colSheet")}</th>
            <th scope="col" className="sticky top-0 z-10 bg-cream-100 px-4 py-3 font-medium">{otherLangLabel} ref</th>
          </tr>
        </thead>
        <tbody>
          {sortedSongs.map((song) => {
            const otherTitle = otherLang === "en" ? song.engTitle : song.viTitle;
            const url = urlFor(song, lang);

            return (
              <tr key={song.slug} className="divide-x divide-cream-200 border-b border-cream-200 last:border-0 hover:bg-gold-50/60">
                <td className="px-4 py-3 align-top">
                  <Link href={`/song/${song.slug}`} className="font-medium text-navy-900 hover:text-navy-600">
                    {titleFor(song, lang)}
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
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-navy-600 hover:text-navy-800"
                    >
                      YouTube
                    </a>
                  ) : (
                    <span className="text-navy-300">—</span>
                  )}
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
                  {song.isBilingual && otherTitle ? (
                    <HoverPreview
                      trigger={
                        <span className="inline-flex cursor-default items-center rounded-full border border-navy-200 px-2 py-0.5 text-xs font-medium text-navy-600">
                          {otherLangLabel}
                        </span>
                      }
                    >
                      <p className="font-medium text-navy-900">{otherTitle}</p>
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
