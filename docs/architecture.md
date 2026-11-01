# Architecture

## Layout

```
Browser -> CDN -> Next.js (SSR / ISR pages)
                     |
                     +-> API layer -> PostgreSQL   (source of truth)
                     |      |
                     |      +-> Redis              (hot cache)
                     |      +-> Meilisearch        (search index)
                     |
Background jobs -> import and sync -> External sources (MusicBrainz, Spotify)
                     |
                     +-> writes to PostgreSQL, then updates Meilisearch
```

## Read path

1. The browser requests a page. The CDN serves it if cached.
2. On a miss, Next.js renders the page (ISR) by calling the data layer.
3. The data layer checks Redis, then PostgreSQL. Search goes to Meilisearch.
4. The rendered page is cached at the CDN. Editing an entity invalidates its page.

## Write path

1. A scheduled job fetches data from an external source.
2. It normalizes the data and upserts it into PostgreSQL, keyed by external ID.
3. It then updates the search index and invalidates affected cache entries.

## Data sources

- MusicBrainz: metadata (database dump plus API)
- Cover Art Archive: artwork, linked by MusicBrainz ID
- Spotify / Apple Music: previews, links, popularity (check terms before storing)
- Lyrics: not stored

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Database | PostgreSQL | Data is relational (artists, releases, credits) |
| Rendering | SSR + ISR | SEO matters, and pages change rarely |
| Search | Meilisearch | Simple, fast, typo tolerant |
| Imports | Background jobs | Slow, can fail, must be retryable |

## Not drawn on the diagram

- Image storage (S3 or R2 behind the CDN)
- Authentication (Auth.js, attached to the Next.js layer)
