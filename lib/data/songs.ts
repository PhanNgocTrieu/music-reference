import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const songFileSchema = z
  .object({
    slug: z.string(),
    "eng-title": z.string().optional(),
    "vi-title": z.string().optional(),
    is_bilingual: z.boolean(),
    author: z.string(),
    genre: z.array(z.string()).min(1).max(3),
    "performed by": z.string(),
    "en-url": z.string().url().optional(),
    "vi-url": z.string().url().optional(),
    "sheet-url": z.string().url(),
    "key chord": z.string(),
  })
  .refine((song) => song["eng-title"] || song["vi-title"], {
    message: "A song needs at least an eng-title or a vi-title",
  })
  .refine((song) => song["en-url"] || song["vi-url"], {
    message: "A song needs at least an en-url or a vi-url",
  });

const songsFileSchema = z.array(songFileSchema);

export interface Song {
  slug: string;
  engTitle?: string;
  viTitle?: string;
  isBilingual: boolean;
  author: string;
  genres: string[];
  performedBy: string;
  engUrl?: string;
  viUrl?: string;
  sheetUrl: string;
  key: string;
}

type RawSong = z.infer<typeof songFileSchema>;

/**
 * Shapes an already-validated raw record into the internal `Song` type.
 * Pure (no `fs`) — exported so tests can exercise this logic with synthetic
 * fixtures instead of depending on whatever's actually in `/data` (which,
 * once `pnpm import:excel` runs in CI, is external content we don't control).
 */
export function normalizeSong(raw: RawSong): Song {
  const engTitle = raw["eng-title"]?.trim() || undefined;
  const viTitle = raw["vi-title"]?.trim() || undefined;

  return {
    slug: raw.slug,
    engTitle,
    viTitle,
    // Derived from the actual titles, not the authored `is_bilingual` flag —
    // a blank "" title (even with is_bilingual: true in the JSON) doesn't count.
    isBilingual: Boolean(engTitle) && Boolean(viTitle),
    author: raw.author,
    genres: raw.genre,
    performedBy: raw["performed by"],
    engUrl: raw["en-url"]?.trim() || undefined,
    viUrl: raw["vi-url"]?.trim() || undefined,
    sheetUrl: raw["sheet-url"],
    key: raw["key chord"],
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const EXCLUDED_FILES = new Set(["data-format.json"]);

let cache: Song[] | null = null;

function loadAllSongs(): Song[] {
  if (cache) return cache;

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json") && !EXCLUDED_FILES.has(file))
    .sort();

  const songs: Song[] = [];
  const seenSlugs = new Map<string, string>();

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    const parsed = songsFileSchema.parse(raw);

    for (const song of parsed) {
      const existingFile = seenSlugs.get(song.slug);
      if (existingFile) {
        throw new Error(`Duplicate song slug "${song.slug}" in ${file} (already used in ${existingFile})`);
      }
      seenSlugs.set(song.slug, file);

      songs.push(normalizeSong(song));
    }
  }

  cache = songs;
  return songs;
}

export function getAllSongs(): Song[] {
  return loadAllSongs();
}

export function getSongBySlug(slug: string): Song | undefined {
  return loadAllSongs().find((song) => song.slug === slug);
}
