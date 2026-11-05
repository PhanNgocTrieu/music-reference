---
name: music-reference-site
description: Build and extend a static, no-login worship song reference site (title, author, performer, key, genres, sheet link, EN/VI bilingual titles) for Vision Worship Team, deployed to GitHub Pages. Use when working on any part of this project.
---

# Music reference site skill

## Project summary

Vision Worship Team's reference list of songs used in worship: title (English and/or Vietnamese), author, performed by, a video link (usually YouTube, English and/or Vietnamese), a sheet (PDF link), the musical key, and up to 3 genres (e.g. Christmas, Praising, Resurrection, Suffering). No login, no database, no background jobs, no lyrics stored on-site. There is one unified song catalog — a song that exists in both languages is a *single* record with `eng-title`/`vi-title` and `en-url`/`vi-url` pairs; the EN/VI toggle filters the list to songs that have a title in that language and picks which title/video link is shown (and UI text), rather than switching between two separate catalogs. The site is static — song data lives in `/data`, split across any number of JSON files (any `.json` file there except `data-format.json`), each holding up to ~50 songs, named `song_list_0001.json`, `song_list_0002.json`, etc. The owner edits these by hand; it deploys to GitHub Pages as plain static files.

Read `CLAUDE.md` for conventions and `docs/ui-design.md` for anything visual, before making changes.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, TypeScript), `output: "export"` (static export) |
| Data | Every `*.json` file in `/data` except `data-format.json`, read through `/lib/data` |
| Validation | zod, used when loading each JSON file |
| UI | Tailwind CSS |
| Search/filter | Client-side only (`SongsExplorer`), no API |
| Hosting | GitHub Pages, built and deployed by `.github/workflows/deploy.yml` |

There is intentionally no database, cache, search engine, auth system, or worker. Do not add one without asking first.

## Data model

`data/data-format.json` is the field reference (not real data — always excluded from loading). A song entry in a `song_list_*.json` file has:

- `slug` — unique **across every file in `/data`**, set by hand, used in the URL (`/song/{slug}`)
- `eng-title` / `vi-title` — at least one is required; a song only needs both if it's genuinely bilingual
- `is_bilingual` — `true` only when both titles are filled in for the *same* song
- `author` — who wrote it
- `performed by` — who performs/recorded it (note the literal space in the key — it's part of the authored JSON format)
- `en-url` / `vi-url` — video link for that language (almost always YouTube); same "at least one required" rule as the titles, same pairing logic
- `sheet-url` — a link to the PDF chord sheet
- `key chord` — the musical key
- `genre` — an array of 1 to 3 free-form values (e.g. Christmas, Praising, Resurrection, Suffering); keep casing consistent with existing entries so the filter dropdown doesn't fragment. Not translated between `eng-title`/`vi-title`.

`lib/data/songs.ts` reads every file, validates each with zod, and normalizes the authored field names into a camelCase `Song` type (`engTitle`, `viTitle`, `isBilingual`, `performedBy`, `engUrl`, `viUrl`, `sheetUrl`, `key`, `genres`) via the exported, pure `normalizeSong()` — that's what the rest of the app (components, tests) consumes. `isBilingual` is **derived** from whether both titles are actually non-blank (after trimming), not copied from the authored `is_bilingual` flag — a hand-entry mistake like `is_bilingual: true` with `"vi-title": ""` is corrected automatically. It throws at build time if two songs share a `slug` across files. It exposes `getAllSongs()` and `getSongBySlug(slug)` for the app; `normalizeSong()` is exported mainly so tests can exercise this logic with synthetic fixtures instead of depending on real `/data` content (see Testing below). Per-language genre/author/performer option lists are derived client-side in `SongsExplorer` (see UI rules) since they depend on the active language toggle, which the filesystem-reading server code has no knowledge of.

`lib/data/song-display.ts` exposes `titleFor(song, lang)` and `urlFor(song, lang)` — the title/video link to display for the active language, each falling back to whichever one the song actually has (same `en ?? vi` / `vi ?? en` pattern for both). `lib/utils/unique-sorted.ts` exposes the plain `uniqueSorted()` helper. None of these files has a filesystem dependency, so all are safe to import from client components (unlike `lib/data/songs.ts`, which uses Node's `fs`/`path` and must only ever be used from Server Components — see Rules below).

## Bulk import from Excel

`scripts/import-excel.mjs` (run as `pnpm import:excel <file.xlsx>`) converts a spreadsheet into `data/song_list_*.json`, for when songs are being collected in Excel instead of typed into JSON by hand. It's a standalone CLI tool written in plain Node ESM (not TypeScript — it never imports `lib/data/songs.ts`, so it isn't bound by that file's Server-Component-only restriction, and doesn't need a TS runner). Key behavior to keep in sync if the data shape changes:

- Reads the **first sheet** of the workbook. Row 1 = headers, **column A is skipped** (data starts at column B); one song per row after that.
- Header names must match the authored field names (`slug`, `eng-title`, `vi-title`, `author`, `genre`, `performed by`, `en-url`, `vi-url`, `sheet-url`, `key chord`) — no `is_bilingual` column needed, it's derived the same way `lib/data/songs.ts` derives it.
- `genre` is a single cell, comma-separated; truncated to 3 with a warning if more are given.
- Blank `slug` gets auto-generated from the title (Vietnamese diacritics stripped) with a printed warning per row — not silent.
- It has its own duplicate-zod validation mirroring `songFileSchema` in `lib/data/songs.ts` (can't import that file directly — see above) — if you change one schema, change the other.
- **Deletes and regenerates every existing `data/song_list_*.json`** (never touches `data-format.json`) — the spreadsheet becomes the source of truth once used.

It runs two ways, both outside the Next.js app itself: by hand (`pnpm import:excel ...`), and as a conditional pre-build step in `.github/workflows/deploy.yml` — *if* `data/songs.xlsx` is committed to the repo, every push to `master` regenerates the deployed JSON from it before `pnpm build`; if that file isn't committed, the step is skipped and CI just builds from whatever JSON is already there. Either way, the regenerated JSON is not written back to the repo — for local dev to reflect spreadsheet changes too, run the command yourself and commit the result.

## Testing

`lib/data/__tests__/songs.test.ts` is split into two groups on purpose:

- General invariants checked against whatever is actually in `/data` right now (schema shape, unique slugs, slug pattern). These must stay content-agnostic — never assert on a specific slug or song existing, since `data/song_list_*.json` can be entirely replaced by `pnpm import:excel` (including automatically in CI) with content this repo doesn't control.
- Behavior of `normalizeSong()`, `titleFor()`, `urlFor()` against hand-built synthetic `Song`/raw-record fixtures, independent of real data. Any edge case worth testing (e.g. a blank title with a stale `is_bilingual: true`) belongs here, not wired to a real example song.

## Rules to follow

1. All song data lives under `/data`, one JSON array per file, each entry matching `data/data-format.json`'s shape. Never hardcode song data in components or introduce a database.
2. Read and validate the JSON through `lib/data/songs.ts` (zod schema). Never import a `data/*.json` file directly from a component or page.
3. `lib/data/songs.ts` uses Node's `fs`/`path` to read the `/data` folder at build time — only import it from Server Components (pages). Client components (`"use client"`) must only `import type { Song }` from it, or import the filesystem-free `lib/data/song-display.ts` for display logic. Importing a runtime value from `lib/data/songs.ts` into a client component will break the build.
4. Use `slug` in URLs; it must be unique across *every* file in `/data`, not just within one file.
5. Never store or display lyrics — link out instead. This is a copyright constraint (worship songs are often CCLI-licensed), not a style choice.
6. Pages are statically generated (`generateStaticParams`) and the whole app builds with `output: "export"` — avoid anything that needs a Node server (API routes, server actions, middleware) at runtime.
7. `basePath` is set in `next.config.ts` for the GitHub Pages project URL; reference public assets with `process.env.NEXT_PUBLIC_BASE_PATH` when hardcoding a path.
8. Ask before adding a new dependency, a database, auth, or any other service. (`xlsx`, used only by `scripts/import-excel.mjs`, is already approved — it's a devDependency, never imported by the app.)
9. `scripts/import-excel.mjs` is the only thing allowed to write `data/song_list_*.json` programmatically. It's invoked by hand or from the deploy workflow's pre-build step (see "Bulk import from Excel" above) — never wire it into a Next.js page, API route, `middleware.ts`, or anything that runs inside the app at request time.

## UI rules

1. Build mobile layout first, then scale up.
2. `SongsExplorer` first filters `songs` down to the active language (a song needs a non-blank `engTitle`/`viTitle` for that language to appear at all — the other language's songs don't show, to avoid clutter), *then* derives the genre/author/performer dropdown options from that subset, then applies the search box (matches both titles, author, performer) and dropdown filters. `HomeContent` remounts `SongsExplorer` with `key={lang}` on toggle so stale filter/sort selections from the other language don't linger. Empty state when nothing matches.
3. `SongsTable` columns Title, Performed by and Key are sortable (click to toggle ascending/descending, via `aria-sort` on the `<th>`); Title sorts by the currently-displayed title (`titleFor`). Genres/Sheet/the bilingual-ref column are not sortable.
4. `SongsTable` caps its visible height to roughly 10 rows with a scrollbar beyond that (`max-h-[31rem] overflow-auto` with a sticky header) — don't let it grow unbounded.
5. The table does not show an Author column (kept on the detail page only). Genre badges stack vertically within their cell so rows stay visually aligned; columns are separated with `divide-x`.
6. The video-link column (header reuses the `listen` i18n key) links via `urlFor(song, lang)`; its visible text is always the literal "YouTube" (not translated, not the real URL — same pattern as "PDF" in the Sheet column), since almost every link is a YouTube video. Shows "—" if the song has neither `en-url` nor `vi-url` for some reason.
7. The table's last column, when a song's `isBilingual` is true, shows a small "EN"/"VI" badge (whichever is the *other* language); hovering it (via `HoverPreview`, a portal so it isn't clipped by the table's scroll container) previews that song's title in the other language. Non-bilingual songs show "—".
8. The song page needs a not-found state for an unknown slug.
9. Pages must be accessible (keyboard, contrast, alt text) and have SEO metadata.

## How to work on a task

1. Restate the task in one or two sentences and list the files you expect to touch.
2. If the task changes the data shape, update the zod schema and the `Song` interface in `lib/data/songs.ts`, `data/data-format.json`, and the existing `data/song_list_*.json` files together.
3. Implement in small steps and run type-check, lint and tests after each step.
4. Summarize what changed and what is left, in a few lines.
