export type StringId = "G" | "D" | "A" | "E";
export type AccidentalMode = "sharp" | "flat";

export const PITCH_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const PITCH_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;
export const SOLFEGE_SHARP = ["도", "도#", "레", "레#", "미", "파", "파#", "솔", "솔#", "라", "라#", "시"] as const;
export const SOLFEGE_FLAT = ["도", "레♭", "레", "미♭", "미", "파", "솔♭", "솔", "라♭", "라", "시♭", "시"] as const;

export const STRINGS = [
  { id: "G", koreanName: "G현", strNo: 4, openMidi: 55, order: 0 },
  { id: "D", koreanName: "D현", strNo: 3, openMidi: 62, order: 1 },
  { id: "A", koreanName: "A현", strNo: 2, openMidi: 69, order: 2 },
  { id: "E", koreanName: "E현", strNo: 1, openMidi: 76, order: 3 }
] as const;

export const FINGERS = [
  { label: "0", finger: 0, semi: 0, isChromatic: false, name: "개방현", handName: "" },
  { label: "L1", finger: 1, semi: 1, isChromatic: true, name: "낮은 1번", handName: "검지" },
  { label: "1", finger: 1, semi: 2, isChromatic: false, name: "1번", handName: "검지" },
  { label: "L2", finger: 2, semi: 3, isChromatic: true, name: "낮은 2번", handName: "중지" },
  { label: "2", finger: 2, semi: 4, isChromatic: false, name: "2번", handName: "중지" },
  { label: "3", finger: 3, semi: 5, isChromatic: false, name: "3번", handName: "약지" },
  { label: "H3", finger: 3, semi: 6, isChromatic: true, name: "높은 3번", handName: "약지" },
  { label: "4", finger: 4, semi: 7, isChromatic: false, name: "4번", handName: "소지" }
] as const;

export type FingerLabel = (typeof FINGERS)[number]["label"];

export const FINGER_COLORS: Record<number, string> = {
  0: "#64748B",
  1: "#2563EB",
  2: "#16A34A",
  3: "#EA580C",
  4: "#9333EA"
};

export interface SelectedNote {
  stringId: StringId;
  stringName: string;
  stringNo: number;
  fingerLabel: FingerLabel;
  finger: number;
  fingerName: string;
  handName: string;
  note: string;
  noteFlat: string;
  solfege: string;
  solfegeFlat: string;
  midi: number;
  freq: number;
  posRatio: number;
  color: string;
  isChromatic: boolean;
  aria: string;
  key: string;
}

export type AppMode = "explore" | "solfege" | "quiz" | "song";

export interface DisplayOptions {
  showSolfege: boolean;
  showNoteName: boolean;
  showFinger: boolean;
  includeChromatic: boolean;
  soundOn: boolean;
  haptics: boolean;
  leftHanded: boolean;
  accidental: AccidentalMode;
  darkMode: boolean;
  bpm: number;
}

const SCALE = 328;
const dist = (semi: number) => SCALE * (1 - Math.pow(2, -semi / 12));

export const midiToName = (midi: number) => `${PITCH_SHARP[midi % 12]}${Math.floor(midi / 12) - 1}`;
export const midiToFlatName = (midi: number) => `${PITCH_FLAT[midi % 12]}${Math.floor(midi / 12) - 1}`;
export const midiToSolfege = (midi: number) => SOLFEGE_SHARP[midi % 12];
export const midiToFlatSolfege = (midi: number) => SOLFEGE_FLAT[midi % 12];
export const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
export const posRatio = (semi: number) => dist(semi) / dist(7);
export const noteKey = (stringId: StringId, fingerLabel: FingerLabel) => `${stringId}:${fingerLabel}`;

export function getNote(stringId: StringId, fingerLabel: FingerLabel): SelectedNote {
  const violinString = STRINGS.find((stringItem) => stringItem.id === stringId);
  const finger = FINGERS.find((fingerItem) => fingerItem.label === fingerLabel);

  if (!violinString || !finger) {
    throw new Error(`Unknown violin position: ${stringId}:${fingerLabel}`);
  }

  const midi = violinString.openMidi + finger.semi;
  const sharpName = midiToName(midi);
  const sharpSolfege = midiToSolfege(midi);
  const fingerText = finger.label === "0" ? "개방현" : `${finger.label}번 손가락`;

  return {
    stringId,
    stringName: violinString.koreanName,
    stringNo: violinString.strNo,
    fingerLabel: finger.label,
    finger: finger.finger,
    fingerName: finger.name,
    handName: finger.handName,
    note: sharpName,
    noteFlat: midiToFlatName(midi),
    solfege: sharpSolfege,
    solfegeFlat: midiToFlatSolfege(midi),
    midi,
    freq: midiToFreq(midi),
    posRatio: posRatio(finger.semi),
    color: FINGER_COLORS[finger.finger],
    isChromatic: finger.isChromatic,
    aria: `${violinString.koreanName} ${fingerText}, ${sharpSolfege} ${sharpName}`,
    key: noteKey(stringId, finger.label)
  };
}

export function getAllNotes({ includeChromatic = false }: { includeChromatic?: boolean } = {}) {
  const fingers = FINGERS.filter((finger) => includeChromatic || !finger.isChromatic);
  return STRINGS.flatMap((violinString) => fingers.map((finger) => getNote(violinString.id, finger.label)));
}

export function getNoteByKey(key: string) {
  const [stringId, fingerLabel] = key.split(":") as [StringId, FingerLabel];
  return getNote(stringId, fingerLabel);
}

export function formatNoteName(note: SelectedNote, accidental: AccidentalMode) {
  return accidental === "flat" ? note.noteFlat : note.note;
}

export function formatSolfege(note: SelectedNote, accidental: AccidentalMode) {
  return accidental === "flat" ? note.solfegeFlat : note.solfege;
}
