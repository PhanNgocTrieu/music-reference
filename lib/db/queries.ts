import { and, desc, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "./index";
import {
  artists, artistGenres, genres,
  releaseGroups, releaseGroupGenres,
  releases, tracks, credits, labels,
  users, favorites, ratings,
} from "./schema";

const PAGE_SIZE = 24;

// ─── Artists ──────────────────────────────────────────────────────────────────

export async function getArtistBySlug(slug: string) {
  return db.query.artists.findFirst({
    where: eq(artists.slug, slug),
    with: {
      artistGenres: { with: { genre: true } },
      releaseGroups: {
        orderBy: [desc(releaseGroups.year)],
        with: { releases: { limit: 1 } },
      },
    },
  });
}

export async function getArtistsByGenre(genreSlug: string, page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const genre = await db.query.genres.findFirst({ where: eq(genres.slug, genreSlug) });
  if (!genre) return { genre: null, artists: [], total: 0 };

  const rows = await db
    .select({ artist: artists })
    .from(artistGenres)
    .innerJoin(artists, eq(artistGenres.artistId, artists.id))
    .where(eq(artistGenres.genreId, genre.id))
    .orderBy(artists.name)
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(artistGenres)
    .where(eq(artistGenres.genreId, genre.id));

  return { genre, artists: rows.map((r) => r.artist), total: count };
}

export async function getArtistsByCountry(countryCode: string, page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const where = eq(artists.country, countryCode.toUpperCase());

  const rows = await db.select().from(artists).where(where).orderBy(artists.name).limit(PAGE_SIZE).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(artists).where(where);

  return { artists: rows, total: count };
}

export async function getRelatedArtists(artistId: string, genreIds: string[], limit = 6) {
  if (genreIds.length === 0) return [];
  const rows = await db
    .selectDistinct({ artist: artists })
    .from(artistGenres)
    .innerJoin(artists, eq(artistGenres.artistId, artists.id))
    .where(
      and(
        ne(artists.id, artistId),
        sql`${artistGenres.genreId} = ANY(${sql.raw(`ARRAY['${genreIds.join("','")}']::uuid[]`)})`
      )
    )
    .limit(limit);
  return rows.map((r) => r.artist);
}

export async function findOrCreateUser(data: { email: string; name?: string | null; image?: string | null }) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) return existing;
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

// ─── Release groups & releases ────────────────────────────────────────────────

export async function getReleaseGroupBySlug(slug: string) {
  return db.query.releaseGroups.findFirst({
    where: eq(releaseGroups.slug, slug),
    with: {
      artist: true,
      releases: { orderBy: [desc(releases.date)] },
      releaseGroupGenres: { with: { genre: true } },
    },
  });
}

export async function getReleaseBySlug(slug: string) {
  return db.query.releases.findFirst({
    where: eq(releases.slug, slug),
    with: {
      releaseGroup: { with: { artist: true } },
      label: true,
      tracks: { orderBy: [tracks.position] },
      credits: { with: { artist: true } },
    },
  });
}

export async function getReleasesByYear(year: number, page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const where = eq(releaseGroups.year, year);

  const rows = await db.query.releaseGroups.findMany({
    where,
    with: { artist: true },
    orderBy: [releaseGroups.title],
    limit: PAGE_SIZE,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(releaseGroups)
    .where(where);

  return { releaseGroups: rows, total: count };
}

export async function getReleasesByLabel(labelSlug: string, page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const label = await db.query.labels.findFirst({ where: eq(labels.slug, labelSlug) });
  if (!label) return { label: null, releases: [], total: 0 };

  const where = eq(releases.labelId, label.id);
  const rows = await db.query.releases.findMany({
    where,
    with: { releaseGroup: { with: { artist: true } } },
    orderBy: [desc(releases.date)],
    limit: PAGE_SIZE,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(releases)
    .where(where);

  return { label, releases: rows, total: count };
}

export async function getReleaseGroupsByGenre(genreSlug: string, page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const genre = await db.query.genres.findFirst({ where: eq(genres.slug, genreSlug) });
  if (!genre) return { genre: null, releaseGroups: [], total: 0 };

  const rows = await db
    .select({ rg: releaseGroups })
    .from(releaseGroupGenres)
    .innerJoin(releaseGroups, eq(releaseGroupGenres.releaseGroupId, releaseGroups.id))
    .where(eq(releaseGroupGenres.genreId, genre.id))
    .orderBy(desc(releaseGroups.year))
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(releaseGroupGenres)
    .where(eq(releaseGroupGenres.genreId, genre.id));

  return { genre, releaseGroups: rows.map((r) => r.rg), total: count };
}

export async function listGenres() {
  return db.select().from(genres).orderBy(genres.name);
}

// ─── User data ────────────────────────────────────────────────────────────────

export async function getUserFavorites(userId: string) {
  return db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    with: { artist: true, release: { with: { releaseGroup: { with: { artist: true } } } } },
  });
}

export async function toggleFavorite(userId: string, opts: { artistId?: string; releaseId?: string }) {
  const where = and(
    eq(favorites.userId, userId),
    opts.artistId ? eq(favorites.artistId, opts.artistId) : eq(favorites.releaseId, opts.releaseId!)
  );
  const existing = await db.query.favorites.findFirst({ where });
  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    return { favorited: false };
  }
  await db.insert(favorites).values({ userId, ...opts });
  return { favorited: true };
}

export async function isFavorited(userId: string, opts: { artistId?: string; releaseId?: string }) {
  const row = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      opts.artistId ? eq(favorites.artistId, opts.artistId) : eq(favorites.releaseId, opts.releaseId!)
    ),
  });
  return !!row;
}

export async function upsertRating(userId: string, releaseId: string, score: number) {
  const existing = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.releaseId, releaseId)),
  });
  if (existing) {
    await db.update(ratings).set({ score }).where(eq(ratings.id, existing.id));
  } else {
    await db.insert(ratings).values({ userId, releaseId, score });
  }
  return score;
}

export async function getReleaseRating(userId: string, releaseId: string) {
  const row = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.releaseId, releaseId)),
  });
  return row?.score ?? null;
}

// ─── Public API queries ───────────────────────────────────────────────────────

export async function listArtists(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  return db.select().from(artists).orderBy(artists.name).limit(PAGE_SIZE).offset(offset);
}

export async function listReleaseGroups(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  return db.query.releaseGroups.findMany({
    with: { artist: true },
    orderBy: [desc(releaseGroups.year)],
    limit: PAGE_SIZE,
    offset,
  });
}
