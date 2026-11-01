export const cacheKey = {
  artist: (slug: string) => `v1:artist:${slug}`,
  releaseGroup: (slug: string) => `v1:rg:${slug}`,
  release: (slug: string) => `v1:release:${slug}`,
  search: (query: string) => `v1:search:${query.toLowerCase().trim()}`,
  genreArtists: (slug: string, page: number) => `v1:genre:${slug}:artists:${page}`,
  genreReleases: (slug: string, page: number) => `v1:genre:${slug}:releases:${page}`,
  year: (year: number, page: number) => `v1:year:${year}:${page}`,
  label: (slug: string, page: number) => `v1:label:${slug}:${page}`,
  country: (code: string, page: number) => `v1:country:${code}:${page}`,
} as const;

export const CACHE_TTL = {
  page: 3600,        // 1h for artist/release pages
  browse: 1800,      // 30m for browse pages
  search: 300,       // 5m for search results
} as const;
