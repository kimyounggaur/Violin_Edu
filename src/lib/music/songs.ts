import { FINGERS, STRINGS, type FingerLabel, type StringId, getNote } from "./violinData";

export type SongNote = readonly [StringId, FingerLabel, string, number];

export interface PracticeSong {
  title: string;
  key: string;
  tempo: number;
  notes: readonly SongNote[];
}

export const SONGS = [
  {
    title: "작은별 (반짝반짝 작은별)",
    key: "A장조",
    tempo: 90,
    notes: [
      ["A", "0", "반", 1],
      ["A", "0", "짝", 1],
      ["E", "0", "반", 1],
      ["E", "0", "짝", 1],
      ["E", "1", "작", 1],
      ["E", "1", "은", 1],
      ["E", "0", "별", 2],
      ["A", "3", "아", 1],
      ["A", "3", "름", 1],
      ["A", "2", "답", 1],
      ["A", "2", "게", 1],
      ["A", "1", "빛", 1],
      ["A", "1", "나", 1],
      ["A", "0", "네", 2]
    ] as const
  },
  {
    title: "라 시 도# 레 미",
    key: "A장조",
    tempo: 84,
    notes: [
      ["A", "0", "라", 1],
      ["A", "1", "시", 1],
      ["A", "2", "도#", 1],
      ["A", "3", "레", 1],
      ["E", "0", "미", 2]
    ] as const
  }
] as const satisfies readonly PracticeSong[];

const VALID_STRING_IDS = new Set(STRINGS.map((violinString) => violinString.id));
const VALID_FINGER_LABELS = new Set(FINGERS.map((finger) => finger.label));

export function validateSongs(songs: readonly PracticeSong[]) {
  const errors: string[] = [];

  songs.forEach((song) => {
    song.notes.forEach(([stringId, fingerLabel], index) => {
      if (!VALID_STRING_IDS.has(stringId) || !VALID_FINGER_LABELS.has(fingerLabel)) {
        errors.push(`${song.title} ${index + 1}번째 음이 데이터 범위를 벗어났습니다: ${stringId}${fingerLabel}`);
        return;
      }

      try {
        getNote(stringId, fingerLabel);
      } catch (error) {
        errors.push(`${song.title} ${index + 1}번째 음을 계산할 수 없습니다: ${(error as Error).message}`);
      }
    });
  });

  return errors;
}

export const SOLFEGE_SEQUENCES = [
  {
    title: "라 시 도# 레 미",
    helper: "A현에서 시작해 E현 개방현까지 이어요.",
    notes: SONGS[1].notes
  },
  {
    title: "레 미 파# 솔 라",
    helper: "D현 기본 손가락을 차례로 연결해요.",
    notes: [
      ["D", "0", "레", 1],
      ["D", "1", "미", 1],
      ["D", "2", "파#", 1],
      ["D", "3", "솔", 1],
      ["A", "0", "라", 2]
    ] as const
  }
] as const;
