# Architecture

## Layout

```
Browser -> GitHub Pages (static files)
             ^
             | pnpm build (output: "export") on push to master
             |
       Next.js pages <- lib/data/songs.ts <- fs.readdirSync("/data")
                                           <- data/song_list_0001.json
                                           <- data/song_list_0002.json
                                           <- data/song_list_000N.json ...
```

## Read path

1. The owner adds or edits a `data/song_list_*.json` file by hand (any `.json` file in `/data` except `data-format.json` is loaded; `data-format.json` itself is just the field reference). Each entry can carry `eng-title`/`vi-title` and `en-url`/`vi-url`, one or both of each pair (`is_bilingual: true` when both titles are present).
2. `lib/data/songs.ts` lists the `/data` folder with Node's `fs` at build time, reads and validates every file with zod, and normalizes field names into a camelCase `Song` type. It throws if two files use the same `slug`. This only ever runs in Server Components — it's never bundled into client JS.
3. Pages (`/`, `/song/[slug]`) are statically generated into `/out` by `pnpm build` from the single combined song list.
4. The home page ships the whole catalog to the client as props (via `HomeContent`). `SongsExplorer` first narrows it to songs with a title in the active language, derives the genre/author/performer filter options from that subset, then applies the search box and dropdown filters — all in the browser, no API call. `SongsTable` sorts (Title/Performed by/Key) client-side too. The EN/VI toggle changes which songs are visible and which title/video link (`titleFor()`/`urlFor()`, from the filesystem-free `lib/data/song-display.ts`) and UI text are displayed.
5. For a bilingual song, the *other* language's title/link is just a sibling field (`engTitle`/`viTitle`, `engUrl`/`viUrl`) on the same object — `SongsTable`/`SongDetails` read it directly, no cross-file lookup needed.

## Deploy path

1. Pushing to `master` triggers `.github/workflows/deploy.yml`.
2. It installs, lints, type-checks, tests, builds (`next build` with `output: "export"`), and publishes `/out` to GitHub Pages via `actions/deploy-pages`.
3. The site is served at the GitHub Pages project URL, under `basePath: "/music-reference"` (set in `next.config.ts`).

## Not needed here

- A database, cache or search engine — the dataset is small and static, and search/filter run client-side.
- Authentication — the site is read-only and public.
- Background jobs — there is nothing to import or sync.
- A Node server at runtime — GitHub Pages only serves static files.

If the site later needs user accounts, a real database, or scheduled imports, revisit this document and `skills.md` first — ask before adding any of them.
