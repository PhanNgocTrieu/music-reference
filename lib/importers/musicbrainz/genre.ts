import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { artists, genres, artistGenres, releaseGroups, releases, tracks } from "../../db/schema";
import { mbGet } from "./client";
import { normalizeArtist, normalizeReleaseGroup, normalizeRelease, normalizeTrack } from "./normalize";
import type {
  MBArtist,
  MBReleaseGroup,
  MBRelease,
  MBBrowseArtistsResult,
  MBBrowseReleaseGroupsResult,
  MBBrowseReleasesResult,
} from "./types";

export type Log = (msg: string) => void;

export async function importGenre(tag: string, log: Log = console.log): Promise<void> {
  log(`[mb] Starting import for tag: ${tag}`);

  const genreId = await ensureGenre(tag, log);

  let offset = 0;
  const limit = 25;

  while (true) {
    const page = await mbGet<MBBrowseArtistsResult>(
      `/artist?tag=${encodeURIComponent(tag)}&limit=${limit}&offset=${offset}`
    );

    const items = page.artists ?? [];
    const total = page["artist-count"] ?? 0;
    log(`[mb] Artists ${offset + 1}–${offset + items.length} of ${total}`);

    for (const mbArtist of items) {
      await importArtistWithReleases(mbArtist, genreId, log);
    }

    offset += items.length;
    if (offset >= total || items.length === 0) break;
  }

  log(`[mb] Import complete for tag: ${tag}`);
}

async function ensureGenre(name: string, log: Log): Promise<string> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [existing] = await db.select({ id: genres.id }).from(genres).where(eq(genres.slug, slug));
  if (existing) return existing.id;
  const [row] = await db.insert(genres).values({ slug, name }).returning({ id: genres.id });
  log(`[mb] Genre created: ${name}`);
  return row.id;
}

async function findArtistByMbId(mbId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: artists.id })
    .from(artists)
    .where(sql`${artists.externalIds}->>'mb' = ${mbId}`)
    .limit(1);
  return row?.id ?? null;
}

async function findReleaseGroupByMbId(mbId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: releaseGroups.id })
    .from(releaseGroups)
    .where(sql`${releaseGroups.externalIds}->>'mb' = ${mbId}`)
    .limit(1);
  return row?.id ?? null;
}

async function findReleaseByMbId(mbId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: releases.id })
    .from(releases)
    .where(sql`${releases.externalIds}->>'mb' = ${mbId}`)
    .limit(1);
  return row?.id ?? null;
}

async function importArtistWithReleases(mb: MBArtist, genreId: string, log: Log): Promise<void> {
  const existingId = await findArtistByMbId(mb.id);
  const data = normalizeArtist(mb);
  let artistId: string;

  if (existingId) {
    await db.update(artists).set(data).where(eq(artists.id, existingId));
    artistId = existingId;
  } else {
    const [row] = await db.insert(artists).values(data).returning({ id: artists.id }).catch(() => [null]);
    if (!row) {
      log(`[mb]   SKIP ${mb.name} (slug conflict)`);
      return;
    }
    artistId = row.id;
    log(`[mb]   Artist: ${mb.name}`);
  }

  await db
    .insert(artistGenres)
    .values({ artistId, genreId })
    .onConflictDoNothing();

  let rgOffset = 0;
  const rgLimit = 25;

  while (true) {
    const page = await mbGet<MBBrowseReleaseGroupsResult>(
      `/release-group?artist=${mb.id}&limit=${rgLimit}&offset=${rgOffset}`
    );
    const rgs = page["release-groups"] ?? [];

    for (const rg of rgs) {
      await importReleaseGroup(rg, artistId, log);
    }

    rgOffset += rgs.length;
    if (rgOffset >= (page["release-group-count"] ?? 0) || rgs.length === 0) break;
  }
}

async function importReleaseGroup(mb: MBReleaseGroup, artistId: string, log: Log): Promise<void> {
  const existingId = await findReleaseGroupByMbId(mb.id);
  const data = normalizeReleaseGroup(mb, artistId);
  let rgId: string;

  if (existingId) {
    await db.update(releaseGroups).set(data).where(eq(releaseGroups.id, existingId));
    rgId = existingId;
  } else {
    const [row] = await db
      .insert(releaseGroups)
      .values(data)
      .returning({ id: releaseGroups.id })
      .catch(() => [null]);
    if (!row) return;
    rgId = row.id;
    log(`[mb]     Release group: ${mb.title}`);
  }

  const page = await mbGet<MBBrowseReleasesResult>(
    `/release?release-group=${mb.id}&limit=1&inc=recordings`
  );
  const first = page.releases?.[0];
  if (first) await importRelease(first, rgId, log);
}

async function importRelease(mb: MBRelease, rgId: string, log: Log): Promise<void> {
  const existingId = await findReleaseByMbId(mb.id);
  const data = normalizeRelease(mb, rgId);
  let releaseId: string;

  if (existingId) {
    await db.update(releases).set(data).where(eq(releases.id, existingId));
    releaseId = existingId;
  } else {
    const [row] = await db
      .insert(releases)
      .values(data)
      .returning({ id: releases.id })
      .catch(() => [null]);
    if (!row) return;
    releaseId = row.id;
  }

  // Re-import tracks wholesale for idempotency
  await db.delete(tracks).where(eq(tracks.releaseId, releaseId));
  const mbTracks = mb.media?.flatMap((m) => m.tracks ?? []) ?? [];
  if (mbTracks.length > 0) {
    await db.insert(tracks).values(mbTracks.map((t) => normalizeTrack(t, releaseId)));
  }
}
