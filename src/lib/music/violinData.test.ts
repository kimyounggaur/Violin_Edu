import { describe, expect, it } from "vitest";
import {
  FINGERS,
  STRINGS,
  getAllNotes,
  getNote,
  midiToFreq,
  midiToName,
  midiToSolfege,
  posRatio
} from "./violinData";

describe("violinData", () => {
  it("calculates pitch, solfege, midi, frequency, and aria from one source", () => {
    const note = getNote("A", "1");

    expect(note.stringId).toBe("A");
    expect(note.fingerLabel).toBe("1");
    expect(note.finger).toBe(1);
    expect(note.note).toBe("B4");
    expect(note.solfege).toBe("시");
    expect(note.midi).toBe(71);
    expect(note.freq).toBeCloseTo(493.88, 2);
    expect(note.aria).toContain("A현");
    expect(note.aria).toContain("시 B4");
  });

  it("keeps the high-2 beginner fingering, including E string second finger as G#5", () => {
    expect(getNote("D", "2")).toMatchObject({ note: "F#4", solfege: "파#" });
    expect(getNote("A", "2")).toMatchObject({ note: "C#5", solfege: "도#" });
    expect(getNote("E", "2")).toMatchObject({ note: "G#5", solfege: "솔#" });
  });

  it("places first-position markers by violin string-length ratios, not equal spacing", () => {
    expect(posRatio(0)).toBeCloseTo(0, 3);
    expect(posRatio(2)).toBeCloseTo(0.328, 2);
    expect(posRatio(4)).toBeCloseTo(0.621, 2);
    expect(posRatio(5)).toBeCloseTo(0.754, 2);
    expect(posRatio(7)).toBeCloseTo(1, 3);
  });

  it("matches the fourth finger to the next higher open string", () => {
    expect(getNote("G", "4").note).toBe(getNote("D", "0").note);
    expect(getNote("D", "4").note).toBe(getNote("A", "0").note);
    expect(getNote("A", "4").note).toBe(getNote("E", "0").note);
  });

  it("derives every note through the shared strings and finger tables", () => {
    const allNotes = getAllNotes({ includeChromatic: true });

    expect(allNotes).toHaveLength(STRINGS.length * FINGERS.length);
    expect(midiToName(60)).toBe("C4");
    expect(midiToSolfege(60)).toBe("도");
    expect(midiToFreq(69)).toBe(440);
  });
});
