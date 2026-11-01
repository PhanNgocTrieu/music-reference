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
```

## Folder structure

```
/app                 Next.js routes (statically exported)
  /song/[slug]
  icon.png           favicon (copy of public/logo.png)
/components          UI components
  /ui                shared primitives (Badge, Select, etc.)
  /song              SongsTable, SongsExplorer, SongDetails, HomeContent
  /layout            Header, Footer
  /providers         LanguageProvider (en/vi toggle)
/lib
  /data              reads and validates /data/en-songs.json and /data/vi-songs.json
  /i18n              UI string dictionary (en, vi only)
  /ui                UI helpers (e.g. genreColor)
/data                en-songs.json, vi-songs.json — the two song catalogs (edit these to add songs)
/public              logo.png — the brand logo (source of the site's color palette)
/docs                UI design notes
/.github/workflows   GitHub Pages deploy workflow
```

## Conventions

- TypeScript strict mode. No `any` without a comment explaining why.
- Song data access only through functions in `/lib/data`. Components never read `data/*-songs.json` directly.
- Use `slug` in URLs; slugs must be unique across *both* language files since the detail route looks them up without knowing the language.
- Search and genre/author/performer filtering run client-side (`SongsExplorer`), scoped to the active language's catalog — there is no backend to filter on.
- UI language is English and Vietnamese only (`lib/i18n/dictionary.ts`, toggled via `LanguageProvider`/`Header`). The toggle also switches which song catalog (`en-songs.json` vs `vi-songs.json`) is shown — it's not just UI text. Don't add other languages without asking; song data itself (titles, authors, genres) is not translated.
- A song may optionally set `ref` to the slug of its counterpart in the other language's file; `getRefSong()` resolves it. Not every song has one.
- Color palette is `navy` / `gold` / `cream`, defined in `tailwind.config.ts` from `public/logo.png`. Don't reintroduce `zinc`/`indigo`/`amber` or raw hex values — see `docs/ui-design.md`.
- Environment variables go in `.env.local` and are documented in `.env.example`.
- Commit messages: short, imperative ("Add song page").

## Do not

- Store or display song lyrics, even partially. Link out via the song's `url` field instead (e.g. to a licensed lyrics/video source). This is a copyright constraint, not a style preference.
- Add a login, database, or background job system — this site is static, read-only, no-auth by design. Ask before changing that.
- Add a service or dependency without asking.
- Remove `output: "export"` from `next.config.ts` or anything that requires a Node server at runtime — the site deploys to GitHub Pages as static files.
