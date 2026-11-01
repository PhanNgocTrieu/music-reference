import { z } from "zod";
import enSongsData from "@/data/en-songs.json";
import viSongsData from "@/data/vi-songs.json";
import type { Lang } from "@/lib/i18n/dictionary";

const songSchema = z.object({
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  performedBy: z.string(),
  url: z.string().url(),
  sheetUrl: z.string().url(),
  key: z.string(),
  genres: z.array(z.string()).min(1),
  /** Slug of the matching song in the other language's file, if one exists. */
  ref: z.string().optional(),
});

const songsSchema = z.array(songSchema);

export type Song = z.infer<typeof songSchema> & { lang: Lang };

let cache: Record<Lang, Song[]> | null = null;

function getDatasets(): Record<Lang, Song[]> {
  if (!cache) {
    cache = {
      en: songsSchema.parse(enSongsData).map((song) => ({ ...song, lang: "en" as const })),
      vi: songsSchema.parse(viSongsData).map((song) => ({ ...song, lang: "vi" as const })),
    };
  }
  return cache;
}

export function getAllSongs(lang: Lang): Song[] {
  return getDatasets()[lang];
}

export function getSongBySlug(slug: string): Song | undefined {
  const datasets = getDatasets();
  return datasets.en.find((song) => song.slug === slug) ?? datasets.vi.find((song) => song.slug === slug);
}

/** The matching song in the other language's file, if `song.ref` points to one. */
export function getRefSong(song: Song): Song | undefined {
  if (!song.ref) return undefined;
  const otherLang: Lang = song.lang === "en" ? "vi" : "en";
  return getDatasets()[otherLang].find((s) => s.slug === song.ref);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function getAllGenres(lang: Lang): string[] {
  return uniqueSorted(getAllSongs(lang).flatMap((song) => song.genres));
}

export function getAllAuthors(lang: Lang): string[] {
  return uniqueSorted(getAllSongs(lang).map((song) => song.author));
}

export function getAllPerformers(lang: Lang): string[] {
  return uniqueSorted(getAllSongs(lang).map((song) => song.performedBy));
}
