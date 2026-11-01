# Architecture

## Layout

```
Browser -> GitHub Pages (static files)
             ^
             | pnpm build (output: "export") on push to main
             |
       Next.js pages <- lib/data/songs.ts <- data/en-songs.json
                                           <- data/vi-songs.json
```

## Read path

1. The owner edits `data/en-songs.json` and/or `data/vi-songs.json` by hand to add, change or remove a song, optionally setting `ref` to link a song to its counterpart in the other file.
2. `lib/data/songs.ts` reads and validates both files with zod at build time, tagging each song with its `lang`.
3. Pages (`/`, `/song/[slug]`) are statically generated into `/out` by `pnpm build`; `/song/[slug]` combines slugs from both languages since the URL doesn't carry a language.
4. The home page ships both language catalogs to the client as props. Which one is displayed, and all searching/filtering (by title/performer, or by genre/author/performer), happens entirely in the browser (`HomeContent` + `SongsExplorer`) keyed off the EN/VI toggle — no API call, no rebuild needed to switch languages.
5. A song's `ref` is resolved client-side via `getRefSong()` to show the cross-language link/preview in `SongsTable` and on the detail page.

## Deploy path

1. Pushing to `main` triggers `.github/workflows/deploy.yml`.
2. It installs, lints, type-checks, tests, builds (`next build` with `output: "export"`), and publishes `/out` to GitHub Pages via `actions/deploy-pages`.
3. The site is served at the GitHub Pages project URL, under `basePath: "/music-reference"` (set in `next.config.ts`).

## Not needed here

- A database, cache or search engine — the dataset is small and static, and search/filter run client-side.
- Authentication — the site is read-only and public.
- Background jobs — there is nothing to import or sync.
- A Node server at runtime — GitHub Pages only serves static files.

If the site later needs user accounts, a real database, or scheduled imports, revisit this document and `skills.md` first — ask before adding any of them.
