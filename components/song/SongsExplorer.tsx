"use client";

import { useMemo, useState } from "react";
import Select from "@/components/ui/Select";
import SongsTable from "@/components/song/SongsTable";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { uniqueSorted } from "@/lib/utils/unique-sorted";
import type { Song } from "@/lib/data/songs";

const ALL = "all";

export default function SongsExplorer({ songs }: { songs: Song[] }) {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState(ALL);
  const [author, setAuthor] = useState(ALL);
  const [performer, setPerformer] = useState(ALL);

  // Only songs that actually have a title in the active language — keeps
  // the list from mixing in the other language's songs.
  const langSongs = useMemo(
    () => songs.filter((song) => (lang === "en" ? Boolean(song.engTitle) : Boolean(song.viTitle))),
    [songs, lang]
  );

  const genres = useMemo(() => uniqueSorted(langSongs.flatMap((s) => s.genres)), [langSongs]);
  const authors = useMemo(() => uniqueSorted(langSongs.map((s) => s.author)), [langSongs]);
  const performers = useMemo(() => uniqueSorted(langSongs.map((s) => s.performedBy)), [langSongs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return langSongs.filter((song) => {
      if (genre !== ALL && !song.genres.includes(genre)) return false;
      if (author !== ALL && song.author !== author) return false;
      if (performer !== ALL && song.performedBy !== performer) return false;
      if (q) {
        const haystack = `${song.engTitle ?? ""} ${song.viTitle ?? ""} ${song.author} ${song.performedBy}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [langSongs, query, genre, author, performer]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label={t("colGenres")}>
            <option value={ALL}>{t("allGenres")}</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          <Select value={author} onChange={(e) => setAuthor(e.target.value)} aria-label={t("colAuthor")}>
            <option value={ALL}>{t("allAuthors")}</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
          <Select value={performer} onChange={(e) => setPerformer(e.target.value)} aria-label={t("colPerformedBy")}>
            <option value={ALL}>{t("allPerformers")}</option>
            {performers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-navy-400">{t("noMatches")}</p>
      ) : (
        <SongsTable songs={filtered} />
      )}
    </div>
  );
}
