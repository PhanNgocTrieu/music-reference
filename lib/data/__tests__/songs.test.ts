import { describe, expect, it } from "vitest";
import {
  getAllAuthors,
  getAllGenres,
  getAllPerformers,
  getAllSongs,
  getRefSong,
  getSongBySlug,
} from "@/lib/data/songs";

describe("songs data", () => {
  it("loads songs for each language that match the schema", () => {
    for (const lang of ["en", "vi"] as const) {
      const songs = getAllSongs(lang);
      expect(songs.length).toBeGreaterThan(0);
      for (const song of songs) {
        expect(song.slug).toMatch(/^[a-z0-9-]+$/);
        expect(song.title).not.toBe("");
        expect(song.genres.length).toBeGreaterThan(0);
        expect(song.lang).toBe(lang);
      }
    }
  });

  it("has unique slugs within and across both languages", () => {
    const slugs = [...getAllSongs("en"), ...getAllSongs("vi")].map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("derives unique, sorted filter options per language", () => {
    for (const lang of ["en", "vi"] as const) {
      for (const list of [getAllGenres(lang), getAllAuthors(lang), getAllPerformers(lang)]) {
        expect(list.length).toBeGreaterThan(0);
        expect(new Set(list).size).toBe(list.length);
        expect(list).toEqual([...list].sort((a, b) => a.localeCompare(b)));
      }
    }
  });

  it("finds a song by slug regardless of which language file it's in", () => {
    const en = getAllSongs("en")[0];
    const vi = getAllSongs("vi")[0];
    expect(getSongBySlug(en.slug)).toEqual(en);
    expect(getSongBySlug(vi.slug)).toEqual(vi);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getSongBySlug("does-not-exist")).toBeUndefined();
  });

  it("resolves a cross-language ref to the matching song", () => {
    const linked = getAllSongs("en").find((s) => s.ref);
    expect(linked).toBeDefined();
    const ref = getRefSong(linked!);
    expect(ref).toBeDefined();
    expect(ref!.lang).toBe("vi");
    expect(ref!.slug).toBe(linked!.ref);
  });

  it("returns undefined for a song with no ref", () => {
    const unlinked = getAllSongs("vi").find((s) => !s.ref);
    expect(unlinked).toBeDefined();
    expect(getRefSong(unlinked!)).toBeUndefined();
  });
});
