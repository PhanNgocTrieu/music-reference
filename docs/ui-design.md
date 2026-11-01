# UI design

## Principles

- Content first: a scannable, searchable list of worship songs.
- Mobile first.
- Accessible: semantic HTML, keyboard navigation, WCAG AA contrast.

## UI stack

| Need | Choice |
|---|---|
| Styling | Tailwind CSS |
| Components | Plain components in `/components` (no component library needed at this size) |
| Logo | `public/logo.png` (the real brand logo), shown in the header; also copied to `app/icon.png` for the favicon |
| Language | English + Vietnamese only, via `LanguageProvider` (`components/providers`) and `lib/i18n/dictionary.ts`; toggle lives in the header. Also switches which song catalog is shown (see below). |
| Dropdowns | Use `components/ui/Select.tsx`, not a raw `<select>` — it replaces the native arrow with a custom chevron so it isn't flush against the border |
| Color | Genre badges are color-coded via `lib/ui/genreColor.ts` (hashes the genre name to a palette color, so new genres in the data get a color automatically); key badges use a fixed gold tone |
| Hover previews | Use `components/ui/HoverPreview.tsx` for any hover tooltip inside the table — it portals to `document.body` so it isn't clipped by the table's `overflow-auto` scroll container |

## Color palette

Taken directly from `logo.png` (deep navy circle, gold/yellow flame and script text, cream ring) and defined as `navy` / `gold` / `cream` custom colors in `tailwind.config.ts`. Don't use `zinc`, `indigo`, or `amber` (the old placeholder palette) or raw hex values in components — use `navy-*` for text/structure, `gold-*` for accents and focus states, `cream-*` for backgrounds/borders. The homepage hero intentionally inverts to a navy card with gold heading text to echo the logo.

## Pages

**Home (`/`)**
- Header: logo + "Vision Worship Team" + EN/VI language toggle. Switching it swaps the entire song catalog (`en-songs.json` vs `vi-songs.json`), not just UI text — `SongsExplorer` remounts (`key={lang}`) so stale filter selections from the other catalog don't linger.
- `SongsExplorer`: a search box (matches title/performer) plus three filter dropdowns (genre, author, performer), all client-side, scoped to the active language's songs.
- `SongsTable`: columns are Title, Performed by, Key, Genres, Sheet, and a cross-language ref column ("EN ref" when viewing Vietnamese, "VI ref" when viewing English) — no Author column (that's detail-page-only). Genre badges stack vertically within their cell (not wrapped inline) so rows stay aligned column-to-column; `divide-x` draws vertical rules between columns. Capped to roughly 10 visible rows (`max-h-[31rem] overflow-auto`, sticky header) with a scrollbar beyond that. The ref cell, when a `ref` exists, is a small "EN"/"VI" pill linking to the counterpart's page; hovering it (via `HoverPreview`) shows that song's title/author/performer/key.
- Empty states: no songs at all in the active catalog vs. no songs matching the current filters.

**Song page (`/song/[slug]`)**
- Title, key badge.
- Author, performed by, genre badges.
- Links: "Listen" (`url`), "View sheet (PDF)" (`sheetUrl`), and — if `getRefSong()` finds one — a link to the cross-language counterpart, opened in a new tab (the ref link navigates within the site).
- No lyrics text anywhere on this page — see `CLAUDE.md`.
- `notFound()` for an unknown slug.

## Shared states

- Empty state on the home page if the active language's catalog has no songs, or if filters match nothing.
- Not-found page for an unknown song slug.

## Accessibility

- One `h1` per page.
- Every filter control has an `aria-label`.
- Links that open a new tab use `target="_blank" rel="noopener noreferrer"`.
- Color is never the only signal (key and genre badges also carry text).
