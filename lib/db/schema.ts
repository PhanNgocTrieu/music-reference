import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

// ─── Enums ───────────────────────────────────────────────────────────────────

export const artistTypeEnum = pgEnum("artist_type", [
  "person",
  "group",
  "orchestra",
  "choir",
  "character",
  "other",
]);

export const releaseTypeEnum = pgEnum("release_type", [
  "album",
  "ep",
  "single",
  "compilation",
  "live",
  "remix",
  "other",
]);

// ─── Lookup tables ────────────────────────────────────────────────────────────

export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  ...timestamps,
});

export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  externalIds: jsonb("external_ids").$type<Record<string, string>>().default({}),
  ...timestamps,
});

// ─── Core entities ────────────────────────────────────────────────────────────

export const artists = pgTable("artists", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 500 }).notNull(),
  sortName: varchar("sort_name", { length: 500 }),
  type: artistTypeEnum("type"),
  disambiguation: text("disambiguation"),
  country: varchar("country", { length: 2 }),
  beginYear: integer("begin_year"),
  endYear: integer("end_year"),
  bio: text("bio"),
  externalIds: jsonb("external_ids").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const artistRelations = pgTable("artist_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  relatedArtistId: uuid("related_artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  relation: varchar("relation", { length: 100 }).notNull(),
  ...timestamps,
});

export const releaseGroups = pgTable("release_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  artistId: uuid("artist_id").references(() => artists.id, { onDelete: "set null" }),
  type: releaseTypeEnum("type"),
  year: integer("year"),
  externalIds: jsonb("external_ids").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const releases = pgTable("releases", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  releaseGroupId: uuid("release_group_id")
    .notNull()
    .references(() => releaseGroups.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  country: varchar("country", { length: 2 }),
  date: varchar("date", { length: 20 }),
  labelId: uuid("label_id").references(() => labels.id, { onDelete: "set null" }),
  catalogNumber: varchar("catalog_number", { length: 100 }),
  format: varchar("format", { length: 50 }),
  externalIds: jsonb("external_ids").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  releaseId: uuid("release_id")
    .notNull()
    .references(() => releases.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  duration: integer("duration"),
  externalIds: jsonb("external_ids").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 100 }).notNull(),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: "cascade" }),
  releaseId: uuid("release_id").references(() => releases.id, { onDelete: "cascade" }),
  ...timestamps,
});

// ─── Tag join tables ──────────────────────────────────────────────────────────

export const artistGenres = pgTable("artist_genres", {
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  genreId: uuid("genre_id")
    .notNull()
    .references(() => genres.id, { onDelete: "cascade" }),
});

export const releaseGroupGenres = pgTable("release_group_genres", {
  releaseGroupId: uuid("release_group_id")
    .notNull()
    .references(() => releaseGroups.id, { onDelete: "cascade" }),
  genreId: uuid("genre_id")
    .notNull()
    .references(() => genres.id, { onDelete: "cascade" }),
});

// ─── User tables ──────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  ...timestamps,
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  artistId: uuid("artist_id").references(() => artists.id, { onDelete: "cascade" }),
  releaseId: uuid("release_id").references(() => releases.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  ...timestamps,
});

export const listItems = pgTable("list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  releaseId: uuid("release_id").references(() => releases.id, { onDelete: "cascade" }),
  artistId: uuid("artist_id").references(() => artists.id, { onDelete: "cascade" }),
  note: text("note"),
  ...timestamps,
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  releaseId: uuid("release_id").references(() => releases.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  ...timestamps,
});

export const editHistory = pgTable("edit_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  diff: jsonb("diff").notNull(),
  ...timestamps,
});
