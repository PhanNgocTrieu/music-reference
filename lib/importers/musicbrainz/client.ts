const MB_API_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "music-reference/0.1 (https://github.com/music-reference)";
const MIN_INTERVAL_MS = 1100; // MusicBrainz rate limit: 1 req/sec

let lastRequestAt = 0;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function mbGet<T>(path: string): Promise<T> {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const sep = path.includes("?") ? "&" : "?";
  const url = `${MB_API_BASE}${path}${sep}fmt=json`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "5", 10) * 1000;
    await sleep(retryAfter);
    return mbGet<T>(path);
  }

  if (!res.ok) {
    throw new Error(`MusicBrainz API ${res.status} for ${url}`);
  }

  return res.json() as Promise<T>;
}
