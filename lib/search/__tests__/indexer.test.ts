import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db and searchClient before importing indexer
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([
      { id: "uuid-1", slug: "ira-d-sankey-c90f8b8e", name: "Ira D. Sankey", type: "person", country: "US", beginYear: 1840, endYear: 1908, disambiguation: null },
    ]),
    query: { releaseGroups: { findMany: vi.fn().mockResolvedValue([]) } },
  },
}));

vi.mock("@/lib/search/client", () => ({
  searchClient: {
    index: vi.fn().mockReturnValue({
      updateSettings: vi.fn().mockResolvedValue({}),
      addDocuments: vi.fn().mockResolvedValue({ taskUid: 1 }),
    }),
  },
  INDEXES: { artists: "artists", releases: "releases" },
}));

import { buildArtistIndex, buildReleaseGroupIndex } from "../indexer";
import { searchClient } from "../client";

describe("buildArtistIndex", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls updateSettings with correct attributes", async () => {
    const mockIndex = { updateSettings: vi.fn().mockResolvedValue({}), addDocuments: vi.fn().mockResolvedValue({}) };
    vi.mocked(searchClient.index).mockReturnValue(mockIndex as any);

    await buildArtistIndex();

    expect(mockIndex.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ searchableAttributes: expect.arrayContaining(["name"]) })
    );
  });

  it("calls addDocuments with artist data", async () => {
    const mockIndex = { updateSettings: vi.fn().mockResolvedValue({}), addDocuments: vi.fn().mockResolvedValue({}) };
    vi.mocked(searchClient.index).mockReturnValue(mockIndex as any);

    await buildArtistIndex();

    expect(mockIndex.addDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Ira D. Sankey" }),
      ])
    );
  });
});

describe("buildReleaseGroupIndex", () => {
  it("completes without error when no release groups exist", async () => {
    const mockIndex = { updateSettings: vi.fn().mockResolvedValue({}), addDocuments: vi.fn().mockResolvedValue({}) };
    vi.mocked(searchClient.index).mockReturnValue(mockIndex as any);

    await expect(buildReleaseGroupIndex()).resolves.toBeUndefined();
    expect(mockIndex.addDocuments).not.toHaveBeenCalled();
  });
});
