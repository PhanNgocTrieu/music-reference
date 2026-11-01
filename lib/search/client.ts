import { MeiliSearch } from "meilisearch";

export const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const INDEXES = {
  artists: "artists",
  releases: "releases",
} as const;

export type IndexName = (typeof INDEXES)[keyof typeof INDEXES];
