import { getAllNotes, type AccidentalMode, type SelectedNote, formatNoteName, formatSolfege } from "./music/violinData";

export type QuizKind = "findByName" | "findBySolfege" | "nameByPos" | "listenAndFind";
export type QuizDifficulty = "easy" | "basic" | "all";

export interface QuizQuestion {
  kind: QuizKind;
  target: SelectedNote;
  prompt: string;
  choices?: string[];
  answer: string;
}

const KINDS: QuizKind[] = ["findBySolfege", "findByName", "nameByPos", "listenAndFind"];

function poolForDifficulty(difficulty: QuizDifficulty) {
  const allNotes = getAllNotes({ includeChromatic: difficulty === "all" });

  if (difficulty === "easy") {
    return allNotes.filter((note) => note.finger === 0 || note.finger === 1);
  }

  if (difficulty === "basic") {
    return allNotes.filter((note) => !note.isChromatic && note.finger <= 3);
  }

  return allNotes;
}

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function uniqueChoices(answer: string, values: string[]) {
  const shuffled = [...new Set(values.filter(Boolean))].sort(() => Math.random() - 0.5);
  return [answer, ...shuffled.filter((choice) => choice !== answer)].slice(0, 4).sort(() => Math.random() - 0.5);
}

export function createQuizQuestion(difficulty: QuizDifficulty, accidental: AccidentalMode): QuizQuestion {
  const pool = poolForDifficulty(difficulty);
  const target = pick(pool);
  const kind = pick(KINDS);
  const noteName = formatNoteName(target, accidental);
  const solfege = formatSolfege(target, accidental);

  if (kind === "findByName") {
    return {
      kind,
      target,
      prompt: `${noteName}를 찾아보세요.`,
      answer: target.key
    };
  }

  if (kind === "findBySolfege") {
    return {
      kind,
      target,
      prompt: `${target.stringName}에서 '${solfege}'을 찾아보세요.`,
      answer: target.key
    };
  }

  if (kind === "listenAndFind") {
    return {
      kind,
      target,
      prompt: "소리를 듣고 같은 위치를 눌러보세요.",
      answer: target.key
    };
  }

  const choiceValues = pool.map((note) => `${formatSolfege(note, accidental)} · ${formatNoteName(note, accidental)}`);
  const answer = `${solfege} · ${noteName}`;

  return {
    kind,
    target,
    prompt: "깜빡이는 위치의 계이름과 음이름을 골라보세요.",
    choices: uniqueChoices(answer, choiceValues),
    answer
  };
}
