# Music reference site

Read `skills.md` first. It holds the stack, data model and rules. For any UI work, also read `docs/ui-design.md`.

## Commands

```
docker compose up -d      # Postgres, Redis, Meilisearch
pnpm install
pnpm db:migrate           # run migrations
pnpm db:seed              # load a small sample dataset
pnpm dev                  # start Next.js
pnpm worker               # start the background job worker
pnpm test
pnpm lint
pnpm typecheck
```

## Folder structure

```
/app                 Next.js routes (pages and API handlers)
  /artist/[slug]
  /release/[slug]
  /search
  /api
/components          UI components
  /ui                shadcn/ui primitives
  /entity            EntityCard, ArtistHeader, Tracklist, etc.
/lib
  /db                schema, migrations, queries
  /search            Meilisearch client and indexing
  /cache             Redis helpers
  /importers         MusicBrainz and other importers
/workers             background job definitions
/docs                architecture and prompt files
/scripts             one-off scripts
```

## Conventions

- TypeScript strict mode. No `any` without a comment explaining why.
- Database access only through functions in `/lib/db`. Components never query directly.
- Use `slug` in URLs, `id` (UUID) internally.
- Environment variables go in `.env.local` and are documented in `.env.example`.
- Commit messages: short, imperative ("Add release page").

## Do not

- Store or display lyrics.
- Run imports inside HTTP requests.
- Add a service or dependency without asking.
- Edit existing migrations after they have been applied. Add a new one.
