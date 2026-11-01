import { relations } from "drizzle-orm";
import {
  artists, artistRelations as artistRels, artistGenres,
  releaseGroups, releaseGroupGenres,
  releases, tracks, credits,
  genres, labels,
  users, favorites, lists, listItems, ratings,
} from "./schema";

export const artistsRelations = relations(artists, ({ many }) => ({
  artistRelationsAsArtist: many(artistRels, { relationName: "artist" }),
  artistRelationsAsRelated: many(artistRels, { relationName: "relatedArtist" }),
  releaseGroups: many(releaseGroups),
  credits: many(credits),
  artistGenres: many(artistGenres),
}));

export const artistRelationsRelations = relations(artistRels, ({ one }) => ({
  artist: one(artists, {
    fields: [artistRels.artistId],
    references: [artists.id],
    relationName: "artist",
  }),
  relatedArtist: one(artists, {
    fields: [artistRels.relatedArtistId],
    references: [artists.id],
    relationName: "relatedArtist",
  }),
}));

export const releaseGroupsRelations = relations(releaseGroups, ({ one, many }) => ({
  artist: one(artists, { fields: [releaseGroups.artistId], references: [artists.id] }),
  releases: many(releases),
  releaseGroupGenres: many(releaseGroupGenres),
}));

export const releasesRelations = relations(releases, ({ one, many }) => ({
  releaseGroup: one(releaseGroups, {
    fields: [releases.releaseGroupId],
    references: [releaseGroups.id],
  }),
  label: one(labels, { fields: [releases.labelId], references: [labels.id] }),
  tracks: many(tracks),
  credits: many(credits),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  release: one(releases, { fields: [tracks.releaseId], references: [releases.id] }),
}));

export const creditsRelations = relations(credits, ({ one }) => ({
  artist: one(artists, { fields: [credits.artistId], references: [artists.id] }),
  track: one(tracks, { fields: [credits.trackId], references: [tracks.id] }),
  release: one(releases, { fields: [credits.releaseId], references: [releases.id] }),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  artistGenres: many(artistGenres),
  releaseGroupGenres: many(releaseGroupGenres),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  releases: many(releases),
}));

export const artistGenresRelations = relations(artistGenres, ({ one }) => ({
  artist: one(artists, { fields: [artistGenres.artistId], references: [artists.id] }),
  genre: one(genres, { fields: [artistGenres.genreId], references: [genres.id] }),
}));

export const releaseGroupGenresRelations = relations(releaseGroupGenres, ({ one }) => ({
  releaseGroup: one(releaseGroups, {
    fields: [releaseGroupGenres.releaseGroupId],
    references: [releaseGroups.id],
  }),
  genre: one(genres, { fields: [releaseGroupGenres.genreId], references: [genres.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  lists: many(lists),
  ratings: many(ratings),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  artist: one(artists, { fields: [favorites.artistId], references: [artists.id] }),
  release: one(releases, { fields: [favorites.releaseId], references: [releases.id] }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, { fields: [lists.userId], references: [users.id] }),
  items: many(listItems),
}));

export const listItemsRelations = relations(listItems, ({ one }) => ({
  list: one(lists, { fields: [listItems.listId], references: [lists.id] }),
  release: one(releases, { fields: [listItems.releaseId], references: [releases.id] }),
  artist: one(artists, { fields: [listItems.artistId], references: [artists.id] }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
  release: one(releases, { fields: [ratings.releaseId], references: [releases.id] }),
}));
