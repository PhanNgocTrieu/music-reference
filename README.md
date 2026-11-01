# Music Reference

A database-style music reference site for artists, releases, and tracks — read-heavy, SEO-friendly, built on Next.js, PostgreSQL, Redis, and Meilisearch.

## Stack

| Layer | Choice |
|---|---|
| Frontend + SSR | Next.js 15 (App Router, TypeScript strict) |
| Database | PostgreSQL + Drizzle ORM |
| Search | Meilisearch |
| Cache | Redis |
| Jobs | BullMQ |

## Getting started

**1. Start services**

```bash
docker compose up -d
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Configure environment**

```bash
cp .env.example .env.local
# Edit .env.local if your local values differ
```

**4. Run migrations**

```bash
pnpm db:generate   # generate SQL from schema
pnpm db:migrate    # apply to the database
```

**5. Seed sample data**

```bash
pnpm db:seed
```

**6. Start the dev server**

```bash
pnpm dev           # Next.js on http://localhost:3000
pnpm worker        # background job worker (separate terminal)
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Vitest |
| `pnpm db:generate` | Generate Drizzle migration from schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Load sample data |
| `pnpm worker` | Start BullMQ worker |

## Project structure

```
app/                 Next.js routes
  artist/[slug]/
  release/[slug]/
  search/
  api/
components/          UI components
lib/
  db/                schema, migrations, queries
  search/            Meilisearch client and indexing
  cache/             Redis helpers
  importers/         MusicBrainz and other importers
workers/             BullMQ job definitions
scripts/             One-off scripts (seed, etc.)
docs/                Architecture notes and prompt files
```

## Services (docker-compose)

| Service | Port | Credentials |
|---|---|---|
| PostgreSQL | 5432 | `music` / `music` |
| Redis | 6379 | — |
| Meilisearch | 7700 | master key: `masterKey` |

## Conventions

- TypeScript strict mode. No `any` without a comment explaining why.
- Database access only through functions in `lib/db/`. Components never query directly.
- Use `slug` in URLs, UUID internally.
- Imports and sync run as background jobs — never inside HTTP request handlers.
- All schema changes go through migrations; never edit an applied migration.
- Do not store lyrics.

See [docs/architecture.md](docs/architecture.md) for the full system layout.
