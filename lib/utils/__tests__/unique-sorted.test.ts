import { describe, expect, it } from "vitest";
import { uniqueSorted } from "@/lib/utils/unique-sorted";

describe("uniqueSorted", () => {
  it("dedupes and sorts", () => {
    expect(uniqueSorted(["Praising", "Christmas", "Praising", "Suffering"])).toEqual([
      "Christmas",
      "Praising",
      "Suffering",
    ]);
  });

  it("returns an empty array for no input", () => {
    expect(uniqueSorted([])).toEqual([]);
  });
});
