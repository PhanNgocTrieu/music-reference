import { describe, expect, it } from "vitest";
import { getAllSongs, getSongBySlug, normalizeSong, type Song } from "@/lib/data/songs";
import { titleFor, urlFor } from "@/lib/data/song-display";

// These tests check general invariants against whatever real data is in
// `/data` right now. They must NOT assume specific songs/slugs exist —
// `pnpm import:excel` can replace all of it with external, user-authored
// content (e.g. automatically in CI), so anything content-specific belongs
// in the synthetic-fixture tests below instead.
describe("songs data (real /data content)", () => {
  it("loads songs from every shard file except data-format.json", () => {
    const songs = getAllSongs();
    expect(songs.length).toBeGreaterThan(0);
    for (const song of songs) {
      expect(song.slug).toMatch(/^[a-z0-9-]+$/);
      expect(song.engTitle || song.viTitle).toBeTruthy();
      expect(song.engUrl || song.viUrl).toBeTruthy();
      expect(song.genres.length).toBeGreaterThan(0);
      expect(song.genres.length).toBeLessThanOrEqual(3);
    }
  });

  it("has unique slugs across all shard files", () => {
    const slugs = getAllSongs().map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("finds a song by slug", () => {
    const [first] = getAllSongs();
    expect(getSongBySlug(first.slug)).toEqual(first);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getSongBySlug("does-not-exist-xyz")).toBeUndefined();
  });
});

const baseFixture = {
  slug: "fixture-song",
  author: "Fixture Author",
  genres: ["Praising"],
  performedBy: "Fixture Performer",
  sheetUrl: "https://example.com/sheet.pdf",
  key: "C",
} satisfies Partial<Song>;

describe("normalizeSong (pure, synthetic fixtures)", () => {
  it("treats a blank title as absent even when the raw is_bilingual flag says otherwise", () => {
    const song = normalizeSong({
      slug: "fixture-song",
      "eng-title": "Fixture Title",
      "vi-title": "",
      is_bilingual: true,
      author: "A",
      genre: ["Praising"],
      "performed by": "P",
      "en-url": "https://example.com/en",
      "sheet-url": "https://example.com/sheet.pdf",
      "key chord": "C",
    });

    expect(song.viTitle).toBeUndefined();
    expect(song.isBilingual).toBe(false);
  });

  it("derives isBilingual from both titles being non-blank", () => {
    const song = normalizeSong({
      slug: "fixture-song",
      "eng-title": "Fixture Title",
      "vi-title": "Tiêu Đề",
      is_bilingual: false, // intentionally wrong — should still be derived as true
      author: "A",
      genre: ["Praising"],
      "performed by": "P",
      "en-url": "https://example.com/en",
      "sheet-url": "https://example.com/sheet.pdf",
      "key chord": "C",
    });

    expect(song.isBilingual).toBe(true);
  });
});

describe("titleFor / urlFor (pure, synthetic fixtures)", () => {
  it("prefers the active language's title and falls back when only one exists", () => {
    const bilingual: Song = { ...baseFixture, engTitle: "English", viTitle: "Vietnamese", isBilingual: true };
    expect(titleFor(bilingual, "en")).toBe("English");
    expect(titleFor(bilingual, "vi")).toBe("Vietnamese");

    const viOnly: Song = { ...baseFixture, viTitle: "Vietnamese only", isBilingual: false };
    expect(titleFor(viOnly, "en")).toBe("Vietnamese only");
    expect(titleFor(viOnly, "vi")).toBe("Vietnamese only");
  });

  it("falls back to the slug when neither title exists", () => {
    const untitled: Song = { ...baseFixture, isBilingual: false };
    expect(titleFor(untitled, "en")).toBe("fixture-song");
  });

  it("prefers the active language's url and falls back when only one exists", () => {
    const both: Song = { ...baseFixture, isBilingual: false, engUrl: "https://example.com/en", viUrl: "https://example.com/vi" };
    expect(urlFor(both, "en")).toBe("https://example.com/en");
    expect(urlFor(both, "vi")).toBe("https://example.com/vi");

    const engOnly: Song = { ...baseFixture, isBilingual: false, engUrl: "https://example.com/en" };
    expect(urlFor(engOnly, "vi")).toBe("https://example.com/en");
  });

  it("returns undefined when neither url exists", () => {
    const noUrl: Song = { ...baseFixture, isBilingual: false };
    expect(urlFor(noUrl, "en")).toBeUndefined();
  });
});
