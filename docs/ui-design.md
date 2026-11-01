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
| Language | English + Vietnamese only, via `LanguageProvider` (`components/providers`) and `lib/i18n/dictionary.ts`; toggle lives in the header. Filters the song list to that language and picks which title/video link (`titleFor()`/`urlFor()`) is shown per song — one unified catalog, not two. |
| Dropdowns | Use `components/ui/Select.tsx`, not a raw `<select>` — it replaces the native arrow with a custom chevron so it isn't flush against the border |
| Color | Genre badges are color-coded via `lib/ui/genreColor.ts` (hashes the genre name to a palette color, so new genres in the data get a color automatically); key badges use a fixed gold tone |
| Hover previews | Use `components/ui/HoverPreview.tsx` for any hover tooltip inside the table — it portals to `document.body` so it isn't clipped by the table's `overflow-auto` scroll container |

## Color palette

Taken directly from `logo.png` (deep navy circle, gold/yellow flame and script text, cream ring) and defined as `navy` / `gold` / `cream` custom colors in `tailwind.config.ts`. Don't use `zinc`, `indigo`, or `amber` (the old placeholder palette) or raw hex values in components — use `navy-*` for text/structure, `gold-*` for accents and focus states, `cream-*` for backgrounds/borders. The homepage hero intentionally inverts to a navy card with gold heading text to echo the logo.

## Pages

**Home (`/`)**
- Header: logo + "Vision Worship Team" + EN/VI language toggle. Switching it filters the list down to songs that have a title in that language (a bilingual song shows in both; `HomeContent` remounts `SongsExplorer` with `key={lang}` so filter/sort selections reset rather than going stale) and changes which title (`titleFor()`) and UI text are shown.
- `SongsExplorer`: a search box (matches both titles, author, performer) plus three filter dropdowns (genre, author, performer) whose options are derived from the active-language subset, all client-side.
- `SongsTable`: columns are Title, Performed by, Key, Genres, a video-link column (header reuses the "Listen" label; cell text is always the literal "YouTube", via `urlFor()` — not the real URL, not translated, same idea as "PDF" below it), Sheet, and a bilingual-indicator column ("EN ref"/"VI ref", labeled for whichever language is *not* active) — no Author column (that's detail-page-only). Title, Performed by and Key are sortable (click the header to toggle ascending/descending). Genre badges stack vertically within their cell (not wrapped inline) so rows stay aligned column-to-column; `divide-x` draws vertical rules between columns. Capped to roughly 10 visible rows (`max-h-[31rem] overflow-auto`, sticky header) with a scrollbar beyond that. When a song's `isBilingual` is true, the last cell is a small "EN"/"VI" pill (not a link — it's the same song/page); hovering it (via `HoverPreview`) shows the title in the other language. Non-bilingual songs show "—".
- Empty states: no songs at all vs. no songs matching the current filters.

**Song page (`/song/[slug]`)**
- Title (active language via `titleFor()`); if bilingual, a muted subtitle shows the other language's title.
- Key badge, author, performed by, genre badges.
- Links: "Listen (YouTube)" (`urlFor()`, hidden if the song has no video link for the active language and no fallback) and "View sheet (PDF)" (`sheetUrl`), opened in a new tab.
- No lyrics text anywhere on this page — see `CLAUDE.md`.
- `notFound()` for an unknown slug.

## Shared states

- Empty state on the home page if the catalog has no songs, or if filters match nothing.
- Not-found page for an unknown song slug.

## Accessibility

- One `h1` per page.
- Every filter control has an `aria-label`.
- Links that open a new tab use `target="_blank" rel="noopener noreferrer"`.
- Color is never the only signal (key and genre badges also carry text).
