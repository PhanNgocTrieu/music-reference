---
name: music-reference-site
description: Build and extend a static, no-login worship song reference site (title, author, performer, key, genres, sheet link, EN/VI cross-references) for Vision Worship Team, deployed to GitHub Pages. Use when working on any part of this project.
---

# Music reference site skill

## Project summary

Vision Worship Team's reference list of songs used in worship: title, author, performed by, a link (e.g. to listen or for lyrics), a sheet (PDF link), the musical key, and one or more genres (e.g. Christmas, Praising, Resurrection, Suffering). No login, no database, no background jobs, no lyrics stored on-site. There are two independent song catalogs — English and Vietnamese — and the site's EN/VI toggle switches which catalog is shown, not just the UI text; a song in one catalog may optionally reference its counterpart in the other. The site is static — all data lives in `data/en-songs.json` and `data/vi-songs.json`, which the owner edits by hand, and it deploys to GitHub Pages as plain static files.

Read `CLAUDE.md` for conventions and `docs/ui-design.md` for anything visual, before making changes.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, TypeScript), `output: "export"` (static export) |
| Data | Two JSON files (`data/en-songs.json`, `data/vi-songs.json`), read through `/lib/data` |
| Validation | zod, used when loading the JSON files |
| UI | Tailwind CSS |
| Search/filter | Client-side only (`SongsExplorer`), no API |
| Hosting | GitHub Pages, built and deployed by `.github/workflows/deploy.yml` |

There is intentionally no database, cache, search engine, auth system, or worker. Do not add one without asking first.

## Data model

A song (`lib/data/songs.ts`) has:

- `slug` — unique **across both language files** (combined lookup), used in the URL (`/song/{slug}`)
- `title`
- `author` — who wrote it
- `performedBy` — who performs/recorded it
- `url` — a link to listen to it (or find lyrics on a licensed source — never embed lyric text here)
- `sheetUrl` — a link to the PDF chord sheet
- `key` — the musical key
- `genres` — one or more of a free-form list (e.g. Christmas, Praising, Resurrection, Suffering); keep casing consistent with existing entries so the filter dropdown doesn't fragment. Genre names are not translated between the two files.
- `ref` — optional. The `slug` of the matching song in the *other* language's file, when a bilingual counterpart exists. Leave it out when there isn't one — not every song needs a pair.
- `lang` — added automatically by `lib/data/songs.ts` (not in the JSON files); tells you which catalog a `Song` object came from.

`lib/data/songs.ts` exposes:

- `getAllSongs(lang)`, `getAllGenres(lang)`, `getAllAuthors(lang)`, `getAllPerformers(lang)` — scoped to one language's catalog
- `getSongBySlug(slug)` — searches both catalogs (used by the detail route, since a URL doesn't carry language)
- `getRefSong(song)` — resolves `song.ref` to the actual `Song` in the other catalog, or `undefined`

## Rules to follow

1. All song data lives in `data/en-songs.json` and `data/vi-songs.json`. Never hardcode song data in components or introduce a database.
2. Read and validate the JSON through `lib/data/songs.ts` (zod schema). Never import either JSON file directly from a component or page.
3. Use `slug` in URLs. Keep slugs unique across *both* files — the detail page looks them up without knowing which language they belong to.
4. Never store or display lyrics — link out instead. This is a copyright constraint (worship songs are often CCLI-licensed), not a style choice.
5. Pages are statically generated (`generateStaticParams`, combining both languages) and the whole app builds with `output: "export"` — avoid anything that needs a Node server (API routes, server actions, middleware) at runtime.
6. `basePath` is set in `next.config.ts` for the GitHub Pages project URL; reference public assets with `process.env.NEXT_PUBLIC_BASE_PATH` when hardcoding a path.
7. Ask before adding a new dependency, a database, auth, or any other service.

## UI rules

1. Build mobile layout first, then scale up.
2. The home page needs search (title/performer) plus filters by author, performer and genre, scoped to the active language's catalog, and an empty state when nothing matches.
3. `SongsTable` caps its visible height to roughly 10 rows with a scrollbar beyond that (`max-h-[31rem] overflow-auto` with a sticky header) — don't let it grow unbounded.
4. The table does not show an Author column (kept on the detail page only). Genre badges stack vertically within their cell so rows stay visually aligned; columns are separated with `divide-x`.
5. The table's last column links to the song's cross-language counterpart (via `getRefSong`), labeled "EN ref"/"VI ref" depending on the active language; hovering the link previews the other song's title/author/performer/key via `HoverPreview` (a portal, so it isn't clipped by the table's scroll container).
6. The song page needs a not-found state for an unknown slug.
7. Pages must be accessible (keyboard, contrast, alt text) and have SEO metadata.

## How to work on a task

1. Restate the task in one or two sentences and list the files you expect to touch.
2. If the task changes the data shape, update the zod schema in `lib/data/songs.ts` and both `data/*-songs.json` files together.
3. Implement in small steps and run type-check, lint and tests after each step.
4. Summarize what changed and what is left, in a few lines.
