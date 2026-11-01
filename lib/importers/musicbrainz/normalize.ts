import type { MBArtist, MBReleaseGroup, MBRelease, MBTrack } from "./types";

const ARTIST_TYPES = ["person", "group", "orchestra", "choir", "character", "other"] as const;
const RELEASE_TYPES = ["album", "ep", "single", "compilation", "live", "remix", "other"] as const;
type ArtistType = (typeof ARTIST_TYPES)[number];
type ReleaseType = (typeof RELEASE_TYPES)[number];

export function slugify(text: string, mbid: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 200);
  return `${base}-${mbid.slice(0, 8)}`;
}

function toArtistType(mb?: string): ArtistType | null {
  if (!mb) return null;
  const v = mb.toLowerCase();
  return (ARTIST_TYPES as readonly string[]).includes(v) ? (v as ArtistType) : "other";
}

function toReleaseType(primary?: string, secondary?: string[]): ReleaseType {
  if (secondary?.includes("Compilation")) return "compilation";
  if (secondary?.includes("Live")) return "live";
  if (secondary?.includes("Remix")) return "remix";
  const p = primary?.toLowerCase() ?? "";
  if (p === "ep") return "ep";
  if (p === "single") return "single";
  if (p === "album") return "album";
  return "other";
}

function parseYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return isNaN(year) ? null : year;
}

export function normalizeArtist(mb: MBArtist) {
  return {
    slug: slugify(mb.name, mb.id),
    name: mb.name,
    sortName: mb["sort-name"],
    type: toArtistType(mb.type),
    disambiguation: mb.disambiguation ?? null,
    country: mb.country ?? null,
    beginYear: parseYear(mb["life-span"]?.begin),
    endYear: parseYear(mb["life-span"]?.end),
    externalIds: { mb: mb.id } as Record<string, string>,
  };
}

export function normalizeReleaseGroup(mb: MBReleaseGroup, artistId: string) {
  return {
    slug: slugify(mb.title, mb.id),
    title: mb.title,
    artistId,
    type: toReleaseType(mb["primary-type"], mb["secondary-types"]),
    year: parseYear(mb["first-release-date"]),
    externalIds: { mb: mb.id } as Record<string, string>,
  };
}

export function normalizeRelease(mb: MBRelease, releaseGroupId: string) {
  const labelInfo = mb["label-info"]?.[0];
  return {
    slug: slugify(mb.title, mb.id),
    releaseGroupId,
    title: mb.title,
    country: mb.country ?? null,
    date: mb.date ?? null,
    labelId: null,
    format: mb.media?.[0]?.format ?? null,
    catalogNumber: labelInfo?.["catalog-number"] ?? null,
    externalIds: { mb: mb.id } as Record<string, string>,
  };
}

export function normalizeTrack(mb: MBTrack, releaseId: string) {
  return {
    releaseId,
    position: mb.position,
    title: mb.title,
    duration: mb.length !== undefined ? Math.round(mb.length / 1000) : null,
    externalIds: { mb: mb.id } as Record<string, string>,
  };
}
