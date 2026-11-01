// Kept in harmony with logo.png's navy/gold palette, plus a few muted
// complements so genres stay distinguishable without clashing.
const palette = [
  "bg-navy-100 text-navy-700",
  "bg-gold-100 text-gold-700",
  "bg-teal-50 text-teal-700",
  "bg-rose-50 text-rose-700",
  "bg-stone-100 text-stone-700",
] as const;

export function genreColorClass(genre: string): string {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = (hash * 31 + genre.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}
