import { desc } from "drizzle-orm";
import { db } from "../db";
import { artists, artistGenres, genres, releaseGroups } from "../db/schema";
import { searchClient, INDEXES } from "./client";

const BATCH = 500;

export async function buildArtistIndex(): Promise<void> {
  const index = searchClient.index(INDEXES.artists);

  await index.updateSettings({
    searchableAttributes: ["name", "disambiguation"],
    filterableAttributes: ["type", "country"],
    sortableAttributes: ["name"],
    displayedAttributes: ["id", "slug", "name", "type", "country", "beginYear", "endYear"],
  });

  const rows = await db
    .select({
      id: artists.id,
      slug: artists.slug,
      name: artists.name,
      type: artists.type,
      country: artists.country,
      beginYear: artists.beginYear,
      endYear: artists.endYear,
      disambiguation: artists.disambiguation,
    })
    .from(artists)
    .orderBy(artists.name);

  for (let i = 0; i < rows.length; i += BATCH) {
    await index.addDocuments(rows.slice(i, i + BATCH));
    console.log(`[indexer] artists ${i + 1}–${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  console.log(`[indexer] Artist index built: ${rows.length} documents`);
}

export async function buildReleaseGroupIndex(): Promise<void> {
  const index = searchClient.index(INDEXES.releases);

  await index.updateSettings({
    searchableAttributes: ["title", "artistName"],
    filterableAttributes: ["type", "year"],
    sortableAttributes: ["year", "title"],
    displayedAttributes: ["id", "slug", "title", "type", "year", "artistName", "artistSlug"],
  });

  const rows = await db.query.releaseGroups.findMany({
    with: { artist: true },
    orderBy: [desc(releaseGroups.year)],
  });

  const docs = rows.map((rg) => ({
    id: rg.id,
    slug: rg.slug,
    title: rg.title,
    type: rg.type,
    year: rg.year,
    artistName: rg.artist?.name ?? null,
    artistSlug: rg.artist?.slug ?? null,
  }));

  for (let i = 0; i < docs.length; i += BATCH) {
    await index.addDocuments(docs.slice(i, i + BATCH));
    console.log(`[indexer] releases ${i + 1}–${Math.min(i + BATCH, docs.length)} / ${docs.length}`);
  }

  console.log(`[indexer] Release index built: ${docs.length} documents`);
}

export async function rebuildAllIndexes(): Promise<void> {
  console.log("[indexer] Rebuilding all indexes from PostgreSQL...");
  await buildArtistIndex();
  await buildReleaseGroupIndex();
  console.log("[indexer] All indexes rebuilt.");
}
