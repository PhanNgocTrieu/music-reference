# UI design

## Principles

- Content first: a reference site is read, scanned and compared. Dense but clear.
- Fast: server-rendered pages, optimized images, no layout shift.
- Mobile first: most visitors arrive from search on a phone.
- Accessible: semantic HTML, keyboard navigation, WCAG AA contrast.
- Light and dark themes from day one.

## UI stack

| Need | Choice |
|---|---|
| Styling | Tailwind CSS with design tokens as CSS variables |
| Components | shadcn/ui (Radix primitives), copied into `/components/ui` |
| Icons | lucide-react |
| Fonts | One sans font for UI, optional serif for headings (via `next/font`) |
| Images | `next/image` with fixed aspect ratios and blur placeholders |
| Forms | react-hook-form with zod |

## Design tokens

Define in `app/globals.css` and use only these, never raw hex values in components.

- Colors: `background`, `foreground`, `muted`, `border`, `primary`, `accent`, `danger`
- Radius: 8px for controls, 12px for cards
- Spacing: Tailwind scale (4, 8, 12, 16, 24, 32, 48)
- Type scale: 12, 14, 16, 20, 24, 32, 48

Pick a distinctive accent color (not default blue) so the site has an identity.

## Layout

- App shell: sticky header (logo, global search, browse menu, account) and a simple footer
- Content width: max 1200px; reading columns max 720px
- Grid: 1 column on mobile, 2 on tablet, 3 to 4 on desktop for card lists

## Pages and key components

**Home**
- Large search box (autocomplete)
- Sections: new additions, popular genres, featured artists
- Components: `SearchBox`, `GenreChips`, `EntityCard` (cover, title, subtitle)

**Search results**
- Tabs or filters: All, Artists, Releases, Tracks
- Result rows with thumbnail, name, year, type badge
- Filters: genre, year range, country; shown in a drawer on mobile
- Empty state with suggestions

**Artist page**
- Header: photo, name, type (person or group), country, active years, genre badges
- Sections: biography, discography (grouped by album, single, EP, with sort and filter), members, related artists
- Components: `ArtistHeader`, `DiscographyGrid`, `RelatedArtists`

**Release page**
- Header: cover art, title, artist link, release date, label, format badges
- Tracklist table: number, title, duration, credits link
- Credits section (producer, composer, engineer), other editions, external links
- Components: `ReleaseHeader`, `Tracklist`, `CreditsList`, `EditionSwitcher`

**Track page** (only if recordings and works are modeled)
- Title, performers, composer, appears on, other versions

**Browse pages** (genre, year, label, country)
- Title and description, filter bar, paginated grid or list

**Account pages** (phase 3)
- Sign in, profile, favorites, lists, ratings
- List editor with add and remove items

## Shared states

Every data view needs: loading skeleton, empty state, error state, and a not-found page that suggests search.

## Behavior

- Search autocomplete: debounce 200ms, keyboard arrows and Enter, shows top 5 per type
- Pagination via URL query (`?page=2`) so pages are shareable and crawlable
- Filters stored in the URL
- Images lazy-load below the fold; cover art has a fallback placeholder

## Accessibility checklist

- One `h1` per page, logical heading order
- All interactive elements reachable by keyboard with visible focus
- Alt text for cover art ("Cover of {title} by {artist}")
- Color is never the only signal
- Respect `prefers-reduced-motion`

## SEO

- Per-page `<title>` and meta description from the entity
- Open Graph image from cover art
- JSON-LD structured data (`MusicGroup`, `MusicAlbum`, `MusicRecording`)
- Canonical URLs and a generated sitemap
