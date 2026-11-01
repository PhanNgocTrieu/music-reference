# Vision Worship Team — Music Reference

A small, static, no-login reference list of the songs we use to worship — title, author, performer, musical key, genres, and a link to a PDF chord sheet. Built with Next.js, deployed to GitHub Pages as static files. No database, no auth, no background jobs, no lyrics stored on-site.

## Getting started

```bash
pnpm install
pnpm dev           # http://localhost:3000
```

## Adding songs

There are two song lists — [`data/en-songs.json`](data/en-songs.json) and [`data/vi-songs.json`](data/vi-songs.json). The site's EN/VI toggle switches between them. Edit whichever file(s) you need. Each entry needs:

```json
{
  "slug": "unique-url-slug",       // unique across BOTH files
  "title": "Song title",
  "author": "Who wrote it",
  "performedBy": "Who performs it",
  "url": "https://...",          // where to listen (or find lyrics on a licensed source — never paste lyrics here)
  "sheetUrl": "https://....pdf", // the chord sheet
  "key": "C",
  "genres": ["Praising"],         // one or more
  "ref": "the-other-slug"         // optional: slug of this song's counterpart in the OTHER file
}
```

If a song has both an English and a Vietnamese version, add both entries and set `ref` on each one pointing to the other's `slug` — the table then shows a hoverable "EN ref"/"VI ref" link between them. Leave `ref` out for songs that only exist in one language. Data is read and validated by [`lib/data/songs.ts`](lib/data/songs.ts) (zod schema). Commit the change and push to `main` — the site rebuilds and redeploys automatically.

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install, lint, typecheck, test, `next build` (static export to `/out`), then publish to GitHub Pages.

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
lib/data/            reads and validates data/en-songs.json and data/vi-songs.json
lib/i18n/            English/Vietnamese UI strings
data/en-songs.json   the English song catalog
data/vi-songs.json   the Vietnamese song catalog — edit these to add songs
public/logo.png      the brand logo — source of the site's navy/gold/cream color palette
docs/                UI design notes
.github/workflows/   GitHub Pages deploy workflow
```

See [docs/architecture.md](docs/architecture.md) for the system layout and [skills.md](skills.md) for conventions.
