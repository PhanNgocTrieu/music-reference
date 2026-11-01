# Prompts for each phase

Paste one prompt at a time. Start every session with:

> Read skills.md, CLAUDE.md and docs/architecture.md. Then do the task below.

## Phase 0: project setup

> Scaffold the project: Next.js (App Router, TypeScript strict), Drizzle ORM, a `docker-compose.yml` with PostgreSQL, Redis and Meilisearch, `.env.example`, and the folder structure from CLAUDE.md. Add scripts for dev, migrate, seed, test, lint and typecheck. Do not build features yet.

## Phase 0.5: UI foundation

**Design system**
> Read docs/ui-design.md. Set up Tailwind and shadcn/ui, define the design tokens in globals.css (light and dark), add next/font, and build the app shell: sticky header with search box and browse menu, footer, and a theme toggle. Ask me for an accent color first.

**Core components**
> Build EntityCard, Badge list, SearchBox (with autocomplete UI using mock data), skeleton loaders, empty state and error state components. Add a /styleguide page showing all of them in light and dark mode.

## Phase 1: MVP

**Schema**
> Design the PostgreSQL schema for artist, release_group, release, track, credit, genre, label and the join tables, with UUID keys, unique slugs and an external_ids column. Write the Drizzle schema and the first migration, plus a seed script with 20 artists. Show me the schema summary before writing code.

**Importer**
> Write a MusicBrainz importer as a background job in /lib/importers. It should import one genre (ask me which), be idempotent (upsert by MusicBrainz ID), respect rate limits, log progress, and be safe to re-run. Add tests using saved sample responses.

**Pages**
> Build the artist page and release page. Server-rendered with ISR, clean URLs by slug, SEO metadata, and links to related items (releases on the artist page, tracks and credits on the release page). Keep the UI simple and responsive.

**UI polish for MVP pages**
> Review the artist and release pages against docs/ui-design.md. Check mobile layout, loading and empty states, heading order, alt text, keyboard focus and JSON-LD. List problems first, then fix them.

**Search**
> Add Meilisearch. Create an indexer that builds the index from PostgreSQL (rebuildable at any time), a search API route, and a search page with autocomplete across artists, releases and tracks.

## Phase 2: browse and discovery

> Add browse pages by genre, year, label and country with pagination. Then add a "related artists" section based on shared genres, labels and credits. Cache results in Redis and explain the cache keys and invalidation.

## Phase 3: accounts

> Add authentication with Auth.js (email and one OAuth provider). Then add favorites, ratings and user lists with their migrations, API routes and UI. Users must only edit their own data.

## Phase 4: scale and extras

> Review the app for performance: ISR settings, CDN headers, slow queries (use EXPLAIN), missing indexes, and Redis usage. Give me a prioritized list before changing anything.

> Add a public read-only REST API with API keys, rate limiting and documentation.

## Useful general prompts

- "Review the last change against the rules in skills.md and list any violations."
- "Write tests for [file or function] covering edge cases."
- "Explain how [feature] works in this codebase, then suggest one improvement."
- "Before coding, give me two options for [problem] with trade-offs."
