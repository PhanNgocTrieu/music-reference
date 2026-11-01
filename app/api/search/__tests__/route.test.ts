import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/search/client", () => ({
  searchClient: {
    index: vi.fn().mockReturnValue({
      search: vi.fn().mockResolvedValue({ hits: [{ id: "1", name: "Test Artist", slug: "test-artist" }] }),
    }),
  },
  INDEXES: { artists: "artists", releases: "releases" },
}));

vi.mock("@/lib/cache", () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

import { GET } from "../route";

function makeRequest(query: Record<string, string>) {
  const url = new URL("http://localhost/api/search?" + new URLSearchParams(query).toString());
  return new NextRequest(url);
}

describe("GET /api/search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for missing q param", async () => {
    const res = await GET(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns artists and releases for valid query", async () => {
    const res = await GET(makeRequest({ q: "sankey" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("artists");
    expect(body).toHaveProperty("releases");
    expect(body.query).toBe("sankey");
  });

  it("returns 400 for q exceeding max length", async () => {
    const res = await GET(makeRequest({ q: "a".repeat(201) }));
    expect(res.status).toBe(400);
  });

  it("respects limit param", async () => {
    const { searchClient } = await import("@/lib/search/client");
    const mockSearch = vi.fn().mockResolvedValue({ hits: [] });
    vi.mocked(searchClient.index).mockReturnValue({ search: mockSearch } as any);

    await GET(makeRequest({ q: "test", limit: "5" }));
    expect(mockSearch).toHaveBeenCalledWith("test", expect.objectContaining({ limit: 5 }));
  });
});
