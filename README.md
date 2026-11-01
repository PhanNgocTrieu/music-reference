# Vision Worship Team — Music Reference

A small, static, no-login reference list of the songs we use to worship — title, author, performer, musical key, genres, a video link (usually YouTube), and a link to a PDF chord sheet. Built with Next.js, deployed to GitHub Pages as static files. No database, no auth, no background jobs, no lyrics stored on-site.

## Getting started

```bash
pnpm install
pnpm dev           # http://localhost:3000
```

## Adding songs

Song data lives in `/data`, split across any number of files — every `.json` file there is loaded *except* [`data/data-format.json`](data/data-format.json) (that one is just the field reference, not real data). Keep each file to around 50 songs and name new ones `song_list_0004.json`, `song_list_0005.json`, etc. Each entry needs:

```json
{
  "slug": "unique-url-slug",     // unique across EVERY file in /data, not just this one
  "eng-title": "Song title",     // at least one of eng-title / vi-title is required
  "vi-title": "Tên bài hát",
  "is_bilingual": true,          // true only when BOTH titles above are filled in
  "author": "Who wrote it",
  "genre": ["Praising"],         // 1 to 3 values
  "performed by": "Who performs it",
  "en-url": "https://youtube.com/...", // video link for the English version — at least one of en-url / vi-url is required
  "vi-url": "https://youtube.com/...", // video link for the Vietnamese version
  "sheet-url": "https://....pdf", // the chord sheet (never paste lyrics anywhere in this file)
  "key chord": "C"
}
```

A song is **one record** — if it has both an English and Vietnamese title, fill in both `eng-title` and `vi-title` and set `is_bilingual: true`; the EN/VI toggle then only shows this song when that language is active, picking the matching title and video link (and the table shows a hoverable badge with the other language's title). For a song that only exists in one language, fill in just that language's title and url, and set `is_bilingual: false` — it won't show up when the other language is active. The `en-url`/`vi-url` pair works the same way as the titles (at least one required, used independently of `is_bilingual`), and doesn't have to be YouTube, but the table always labels the link "YouTube" since that's almost always what it is. Data is read and validated by [`lib/data/songs.ts`](lib/data/songs.ts) (zod schema), which also rejects a duplicate `slug` across files at build time. Commit the change and push to `master` — the site rebuilds and redeploys automatically.

## Deployment

Pushing to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install, lint, typecheck, test, `next build` (static export to `/out`), then publish to GitHub Pages.

The site lives at `https://phanngoctrieu.github.io/music-reference/`. In the repo's GitHub Settings → Pages, set the source to **GitHub Actions** (one-time setup).

To preview a production build locally:

```bash
pnpm build
npx serve out
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Static export to `/out` |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Vitest |

## Project structure

```
app/                 Next.js routes
  song/[slug]/        song detail page
  icon.png             favicon (copy of public/logo.png)
components/          UI components (SongsTable, SongsExplorer, SongDetails, layout, providers)
lib/data/songs.ts        reads + validates every data/*.json file except data-format.json (fs-based, server-only)
lib/data/song-display.ts titleFor()/urlFor() — pick eng-title/vi-title and en-url/vi-url per the active language (safe for client use)
lib/i18n/            English/Vietnamese UI strings
data/data-format.json    field reference for a song entry (not real data, always excluded)
data/song_list_000N.json the song catalog, ~50 songs per file — edit/add these to add songs
public/logo.png      the brand logo — source of the site's navy/gold/cream color palette
docs/                UI design notes
.github/workflows/   GitHub Pages deploy workflow
```

See [docs/architecture.md](docs/architecture.md) for the system layout and [skills.md](skills.md) for conventions.
