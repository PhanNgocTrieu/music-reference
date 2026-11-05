# Music reference site (Vision Worship Team)

Read `skills.md` first. It holds the data model and rules. For any UI work, also read `docs/ui-design.md`.

## Commands

```
pnpm install
pnpm dev           # start Next.js dev server
pnpm build         # static export to /out (what GitHub Pages deploys)
pnpm test
pnpm lint
pnpm typecheck
pnpm import:excel <file.xlsx>  # regenerate data/song_list_*.json from a spreadsheet
```

## Folder structure

```
/app                 Next.js routes (statically exported)
  /song/[slug]
  icon.png           favicon (copy of public/logo.png)
/components          UI components
  /ui                shared primitives (Badge, Select, HoverPreview, etc.)
  /song              SongsTable, SongsExplorer, SongDetails, HomeContent
  /layout            Header, Footer
  /providers         LanguageProvider (en/vi toggle)
/lib
  /data              songs.ts (fs-based loader, server-only) + song-display.ts (titleFor/urlFor, pure, client-safe)
  /i18n              UI string dictionary (en, vi only)
  /ui                UI helpers (e.g. genreColor)
  /utils             generic pure helpers (e.g. uniqueSorted)
/data                data-format.json (schema reference, not real data) + song_list_000N.json shards (edit/add these to add songs)
/scripts             import-excel.mjs — one-off CLI tool, not part of the deployed site
/public              logo.png — the brand logo (source of the site's color palette)
/docs                UI design notes
/.github/workflows   GitHub Pages deploy workflow
```

## Conventions

- TypeScript strict mode. No `any` without a comment explaining why.
- Song data access only through functions in `/lib/data`. Components never read a `data/*.json` file directly.
- `lib/data/songs.ts` reads every `.json` file in `/data` except `data-format.json` (via Node's `fs`) — it only runs in Server Components. Client components needing the `Song` type use `import type`; for display logic (which title/video link to show) use `lib/data/song-display.ts` (`titleFor`, `urlFor`), which has no `fs` dependency.
- Use `slug` in URLs; slugs must be unique across *every* file in `/data`, not just within one file — `lib/data/songs.ts` throws at build time on a duplicate.
- Search and genre/author/performer filtering run client-side (`SongsExplorer`) — there is no backend to filter on.
- UI language is English and Vietnamese only (`lib/i18n/dictionary.ts`, toggled via `LanguageProvider`/`Header`). There is one unified song catalog, not two — `SongsExplorer` shows only songs that have a title in the active language (so the other language's songs don't clutter the list), displayed via `titleFor()`; genre/author/performer dropdown options are derived from that same active-language subset. Don't add other languages without asking; non-title song data (author, genres, etc.) is not translated.
- A song is one record with optional `eng-title`/`vi-title` and optional `en-url`/`vi-url` (same "at least one of the pair" rule for both); `is_bilingual` is `true` only when both titles are filled in. There's no separate cross-reference/link field — don't reintroduce one.
- `scripts/import-excel.mjs` (`pnpm import:excel <file.xlsx>`) regenerates `data/song_list_*.json` from a spreadsheet. It's a standalone CLI tool (plain Node ESM, not TypeScript, so it doesn't need `lib/data/songs.ts`'s Server-Component-only code) — never import it from the app itself (`app/`, `components/`, `lib/`), per the no-imports-at-runtime rule below. It's invoked two ways, both outside the app: by hand (`pnpm import:excel ...`), and as a pre-build step in `.github/workflows/deploy.yml` that runs it against `data/songs.xlsx` *if that file is committed to the repo* — so a push rebuilds the deployed JSON from the spreadsheet, but doesn't write it back to git. If you add/rename a field, keep `lib/data/songs.ts`'s zod schema and the script's duplicate schema in sync — the script intentionally doesn't import the other one.
- Color palette is `navy` / `gold` / `cream`, defined in `tailwind.config.ts` from `public/logo.png`. Don't reintroduce `zinc`/`indigo`/`amber` or raw hex values — see `docs/ui-design.md`.
- Environment variables go in `.env.local` and are documented in `.env.example`.
- Commit messages: short, imperative ("Add song page").

## Do not

- Store or display song lyrics, even partially. Link out via the song's `en-url`/`vi-url` field instead (e.g. to a licensed lyrics/video source). This is a copyright constraint, not a style preference.
- Add a login, database, or background job system — this site is static, read-only, no-auth by design. Ask before changing that.
- Add a service or dependency without asking.
- Remove `output: "export"` from `next.config.ts` or anything that requires a Node server at runtime — the site deploys to GitHub Pages as static files.
