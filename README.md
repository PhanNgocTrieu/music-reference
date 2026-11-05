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

### Bulk-importing from Excel

If you're collecting songs in a `.xlsx` spreadsheet instead of typing JSON by hand:

```bash
pnpm import:excel path/to/your-file.xlsx
```

Sheet layout (first sheet in the workbook): row 1 = headers, **column A is ignored** (data columns start at B), one song per row after that, with headers matching the field names above (`slug`, `eng-title`, `vi-title`, `author`, `genre`, `performed by`, `en-url`, `vi-url`, `sheet-url`, `key chord`). Put multiple genres in one cell separated by commas (e.g. `Praising, Christmas`). You can skip the `is_bilingual` column entirely — it's derived automatically. `slug` can be left blank and the script will generate one from the title, but it prints a warning for every row it had to guess, so check those.

This **overwrites every existing `data/song_list_*.json`** and regenerates them from the spreadsheet (chunked to ~50 songs per file) — the Excel file becomes the source of truth once you start using it. It never touches `data/data-format.json`. It's a manual command you run yourself whenever the spreadsheet changes; nothing in the site itself runs an import (see `CLAUDE.md`).

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
| `pnpm import:excel <file.xlsx>` | Regenerate `data/song_list_*.json` from a spreadsheet |

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
scripts/import-excel.mjs converts a .xlsx song list into data/song_list_*.json (pnpm import:excel)
public/logo.png      the brand logo — source of the site's navy/gold/cream color palette
docs/                UI design notes
.github/workflows/   GitHub Pages deploy workflow
```

See [docs/architecture.md](docs/architecture.md) for the system layout and [skills.md](skills.md) for conventions.
