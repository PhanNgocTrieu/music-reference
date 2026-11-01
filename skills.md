---
name: music-reference-site
description: Build and extend a music reference website (artists, releases, tracks, credits) with Next.js, PostgreSQL, Redis and Meilisearch. Use when working on any part of this project: schema, API, pages, search, data import, caching.
---

# Music reference site skill

## Project summary

A database-style music reference website (similar in spirit to Discogs or MusicBrainz). It is read-heavy: about 99% of traffic is people viewing artist, release and track pages. Optimize for cheap reads, SEO and clean data.

Read `CLAUDE.md` for conventions, `docs/architecture.md` for the system layout, and `docs/ui-design.md` for anything visual, before making changes.

## Stack

| Layer | Choice |
|---|---|
| Frontend + SSR | Next.js (App Router, TypeScript) |
| API | Next.js route handlers (REST). Split into a separate service only if needed |
| Database | PostgreSQL, accessed through Drizzle ORM (or Prisma) |
| Search | Meilisearch (start with Postgres full-text if you want fewer moving parts) |
| Cache | Redis |
| Images | Object storage (S3 or Cloudflare R2) behind a CDN |
| UI | Tailwind CSS, shadcn/ui, lucide-react (see `docs/ui-design.md`) |
| Auth | Auth.js |
| Jobs | Node worker with BullMQ on Redis |
| Local dev | Docker Compose for Postgres, Redis, Meilisearch |

## Data model (core entities)

- `artist` (person or group), `artist_relation` (member of, collaboration)
- `release_group` (the abstract album) -> `release` (a specific edition) -> `track`
- `recording` (a performance) and `work` (a composition); only needed if covers and versions matter
- `credit` joins artist to track/release with a role (producer, composer, engineer)
- `genre`, `label`, `country` lookup tables; join tables for tags
- User side: `user`, `favorite`, `list`, `list_item`, `rating`, `edit_history`
- Every imported entity stores `external_ids` (MusicBrainz ID, Spotify ID) so it can be re-synced

## Rules to follow

1. Use UUIDs for primary keys and a unique `slug` for public URLs.
2. All schema changes go through migrations. Never edit the database by hand.
3. Public pages are server-rendered with ISR. Invalidate the cache on edit.
4. Imports and sync run as background jobs, never inside request handlers.
5. Do not store lyrics (copyrighted). Link out or use a licensed provider.
6. Check the terms of any external API before storing its data.
7. Validate all input at the API boundary (zod).
8. Search index is derived data. It must be rebuildable from PostgreSQL at any time.
9. Write tests for the importer and for API handlers. Keep functions small.
10. Ask before adding a new dependency or a new service.

## UI rules

1. Use design tokens and shadcn/ui components. No raw hex colors or one-off styles.
2. Build mobile layout first, then scale up.
3. Every data view has loading, empty and error states.
4. Pages must be accessible (keyboard, contrast, alt text) and have SEO metadata.
5. Filters and pagination live in the URL.
6. Show me a visual preview or screenshot description of a page before building many pages in one go.

## How to work on a task

1. Restate the task in one or two sentences and list the files you expect to touch.
2. If the task changes data, write the migration first, then the code.
3. Implement in small steps and run type-check, lint and tests after each step.
4. Summarize what changed and what is left, in a few lines.

## Phases

1. MVP: schema, a slice of imported data (one genre or about 10k artists), artist/release pages, search
2. Browse and discovery: genre, year, label and country pages; related artists; caching
3. Accounts: favorites, lists, ratings
4. Scale and extras: CDN tuning, editing workflow, public API

Ready-to-use prompts for each phase are in `docs/prompts.md`.
