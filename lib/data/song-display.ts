import type { Lang } from "@/lib/i18n/dictionary";
import type { Song } from "@/lib/data/songs";

/**
 * Pure — no `fs` dependency — safe to import from client components,
 * unlike `lib/data/songs.ts` which reads the filesystem at build time.
 */
function pickForLang(en: string | undefined, vi: string | undefined, lang: Lang): string | undefined {
  return lang === "en" ? en ?? vi : vi ?? en;
}

/** The title to display for the active language, falling back to whichever title the song has. */
export function titleFor(song: Song, lang: Lang): string {
  return pickForLang(song.engTitle, song.viTitle, lang) ?? song.slug;
}

/** The video/listen link for the active language, falling back to whichever one the song has. */
export function urlFor(song: Song, lang: Lang): string | undefined {
  return pickForLang(song.engUrl, song.viUrl, lang);
}
