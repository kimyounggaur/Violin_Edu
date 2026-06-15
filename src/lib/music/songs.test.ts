import { describe, expect, it } from "vitest";
import { SONGS, validateSongs } from "./songs";

describe("SONGS", () => {
  it("keeps every practice-song note inside violinData range", () => {
    expect(validateSongs(SONGS)).toEqual([]);
  });

  it("contains the required A-major Little Star starter phrase", () => {
    expect(SONGS[0].title).toContain("작은별");
    expect(SONGS[0].notes.slice(0, 7).map(([stringId, fingerLabel]) => `${stringId}${fingerLabel}`)).toEqual([
      "A0",
      "A0",
      "E0",
      "E0",
      "E1",
      "E1",
      "E0"
    ]);
  });
});
