import { describe, it, expect } from "vitest";
import {
  slugify,
  normalizeArtist,
  normalizeReleaseGroup,
  normalizeRelease,
  normalizeTrack,
} from "../normalize";
import type { MBArtist, MBReleaseGroup, MBRelease, MBTrack } from "../types";

import artistFixture from "./fixtures/artist.json";
import releaseGroupFixture from "./fixtures/release-group.json";
import releaseFixture from "./fixtures/release.json";

// Cast fixtures to MB types — they are representative API samples
const mbArtist = artistFixture as unknown as MBArtist;
const mbReleaseGroup = releaseGroupFixture as unknown as MBReleaseGroup;
const mbRelease = releaseFixture as unknown as MBRelease;

describe("slugify", () => {
  it("produces lowercase hyphenated slug with 8-char mbid suffix", () => {
    expect(slugify("Amazing Grace", "abc12345-0000-0000-0000-000000000000")).toBe(
      "amazing-grace-abc12345"
    );
  });

  it("strips punctuation", () => {
    expect(slugify("Ira D. Sankey", "abc12345-0000-0000-0000-000000000000")).toBe(
      "ira-d-sankey-abc12345"
    );
  });

  it("collapses consecutive spaces and hyphens", () => {
    expect(slugify("A  --  B", "abc12345-0000-0000-0000-000000000000")).toBe("a-b-abc12345");
  });
});

describe("normalizeArtist", () => {
  it("maps all fields from the fixture", () => {
    const result = normalizeArtist(mbArtist);
    expect(result.name).toBe("Ira D. Sankey");
    expect(result.sortName).toBe("Sankey, Ira D.");
    expect(result.type).toBe("person");
    expect(result.country).toBe("US");
    expect(result.beginYear).toBe(1840);
    expect(result.endYear).toBe(1908);
    expect(result.externalIds).toEqual({ mb: artistFixture.id });
    expect(result.slug).toMatch(/^ira-d-sankey-/);
  });

  it("returns null for missing optional fields", () => {
    const minimal: MBArtist = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Test",
      "sort-name": "Test",
    };
    const result = normalizeArtist(minimal);
    expect(result.type).toBeNull();
    expect(result.country).toBeNull();
    expect(result.beginYear).toBeNull();
    expect(result.endYear).toBeNull();
    expect(result.disambiguation).toBeNull();
  });

  it("maps unknown MB type to 'other'", () => {
    const artist = { ...mbArtist, type: "Unknown" as MBArtist["type"] };
    expect(normalizeArtist(artist).type).toBe("other");
  });
});

describe("normalizeReleaseGroup", () => {
  it("maps all fields from the fixture", () => {
    const result = normalizeReleaseGroup(mbReleaseGroup, "artist-uuid");
    expect(result.title).toBe("Sacred Songs and Solos");
    expect(result.type).toBe("album");
    expect(result.year).toBe(1873);
    expect(result.artistId).toBe("artist-uuid");
    expect(result.externalIds).toEqual({ mb: releaseGroupFixture.id });
  });

  it("maps Compilation secondary type", () => {
    const rg = { ...mbReleaseGroup, "secondary-types": ["Compilation"] };
    expect(normalizeReleaseGroup(rg, "x").type).toBe("compilation");
  });

  it("maps Live secondary type", () => {
    const rg = { ...mbReleaseGroup, "secondary-types": ["Live"] };
    expect(normalizeReleaseGroup(rg, "x").type).toBe("live");
  });

  it("returns null year for missing first-release-date", () => {
    const rg = { ...mbReleaseGroup, "first-release-date": undefined };
    expect(normalizeReleaseGroup(rg, "x").year).toBeNull();
  });
});

describe("normalizeRelease", () => {
  it("maps all fields from the fixture", () => {
    const result = normalizeRelease(mbRelease, "rg-uuid");
    expect(result.title).toBe("Sacred Songs and Solos");
    expect(result.country).toBe("GB");
    expect(result.date).toBe("1873");
    expect(result.format).toBe("Vinyl");
    expect(result.releaseGroupId).toBe("rg-uuid");
    expect(result.externalIds).toEqual({ mb: releaseFixture.id });
  });

  it("returns null for missing country and format", () => {
    const r: MBRelease = { id: "x", title: "T", "label-info": [] };
    const result = normalizeRelease(r, "rg");
    expect(result.country).toBeNull();
    expect(result.format).toBeNull();
  });
});

describe("normalizeTrack", () => {
  it("converts duration from ms to seconds", () => {
    const track = releaseFixture.media[0].tracks[0] as unknown as MBTrack;
    const result = normalizeTrack(track, "release-uuid");
    expect(result.duration).toBe(198);
    expect(result.position).toBe(1);
    expect(result.title).toBe("The Ninety and Nine");
    expect(result.releaseId).toBe("release-uuid");
  });

  it("returns null duration when length is missing", () => {
    const track: MBTrack = { id: "t", number: "1", position: 1, title: "T" };
    expect(normalizeTrack(track, "r").duration).toBeNull();
  });

  it("maps all three tracks from the fixture", () => {
    const fixture = releaseFixture.media[0].tracks as unknown as MBTrack[];
    const results = fixture.map((t) => normalizeTrack(t, "r"));
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title)).toEqual([
      "The Ninety and Nine",
      "Hold the Fort",
      "Blessed Assurance",
    ]);
    expect(results.map((r) => r.duration)).toEqual([198, 175, 210]);
  });
});
