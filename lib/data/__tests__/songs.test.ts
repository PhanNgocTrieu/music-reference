import { describe, expect, it } from "vitest";
import { getAllSongs, getSongBySlug } from "@/lib/data/songs";
import { titleFor, urlFor } from "@/lib/data/song-display";

describe("songs data", () => {
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
    expect(getSongBySlug("does-not-exist")).toBeUndefined();
  });

  it("titleFor prefers the active language and falls back when a song isn't bilingual", () => {
    const bilingual = getAllSongs().find((s) => s.isBilingual);
    expect(bilingual).toBeDefined();
    expect(titleFor(bilingual!, "en")).toBe(bilingual!.engTitle);
    expect(titleFor(bilingual!, "vi")).toBe(bilingual!.viTitle);

    const viOnly = getAllSongs().find((s) => !s.isBilingual && !s.engTitle);
    expect(viOnly).toBeDefined();
    expect(titleFor(viOnly!, "en")).toBe(viOnly!.viTitle);
  });

  it("treats a blank title as absent even if the JSON's is_bilingual flag says otherwise", () => {
    // in-christ-alone has "vi-title": "" with "is_bilingual": true in the data —
    // a human data-entry mistake the loader should not trust blindly.
    const song = getSongBySlug("in-christ-alone");
    expect(song).toBeDefined();
    expect(song!.viTitle).toBeUndefined();
    expect(song!.isBilingual).toBe(false);
    expect(titleFor(song!, "vi")).toBe(song!.engTitle);
  });

  it("urlFor prefers the active language and falls back when only one url exists", () => {
    const bothUrls = getAllSongs().find((s) => s.engUrl && s.viUrl);
    expect(bothUrls).toBeDefined();
    expect(urlFor(bothUrls!, "en")).toBe(bothUrls!.engUrl);
    expect(urlFor(bothUrls!, "vi")).toBe(bothUrls!.viUrl);

    const engUrlOnly = getAllSongs().find((s) => s.engUrl && !s.viUrl);
    expect(engUrlOnly).toBeDefined();
    expect(urlFor(engUrlOnly!, "vi")).toBe(engUrlOnly!.engUrl);
  });
});
