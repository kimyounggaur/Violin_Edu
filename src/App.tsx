import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronUp,
  Gauge,
  HelpCircle,
  Music2,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Fingerboard } from "./components/Fingerboard";
import { SelectedNoteCard } from "./components/SelectedNoteCard";
import { playPitch, vibrate } from "./lib/audio";
import {
  formatNoteName,
  formatSolfege,
  getNote,
  getNoteByKey,
  type AppMode,
  type DisplayOptions,
  type SelectedNote
} from "./lib/music/violinData";
import { SOLFEGE_SEQUENCES, SONGS, type SongNote } from "./lib/music/songs";
import { createQuizQuestion, type QuizDifficulty, type QuizQuestion } from "./lib/quiz";
import { DEFAULT_OPTIONS, hasSeenOnboarding, loadSettings, markOnboardingSeen, saveSettings } from "./lib/storage";

type SheetView = "view" | "help" | "settings";
type Feedback = { tone: "good" | "try"; text: string } | null;

const MODES: Array<{ id: AppMode; label: string; icon: typeof Sparkles }> = [
  { id: "explore", label: "탐색", icon: Sparkles },
  { id: "solfege", label: "계이름", icon: Music2 },
  { id: "quiz", label: "퀴즈", icon: CheckCircle2 },
  { id: "song", label: "연습곡", icon: BookOpen }
];

const HELP_IMAGES = [
  {
    file: "violin-parts.png",
    title: "바이올린 부위별 명칭",
    body: "지판, 줄, 브리지, 턱받침의 위치를 먼저 익혀요. 오늘 누르는 손가락 위치는 모두 지판 위에서 움직입니다."
  },
  {
    file: "violin-bow.png",
    title: "활의 기본 구조",
    body: "활털이 현을 지나가며 소리를 만들어요. 지판에서 음을 찾은 뒤에는 활이 한 현만 지나가게 천천히 켜보세요."
  },
  {
    file: "violin-tuning-range.png",
    title: "튜닝과 음역대",
    body: "기본 조율은 G-D-A-E입니다. 이 앱의 모든 소리는 A4=440Hz와 MIDI 계산으로 만들어집니다."
  },
  {
    file: "violin-posture.png",
    title: "현 잡기와 활 자세",
    body: "손가락은 세게 누르기보다 정확한 위치를 찾는 것이 먼저예요. 어깨와 손목에 힘을 빼고 시작해요."
  },
  {
    file: "violin-pizzicato.png",
    title: "피치카토",
    body: "활 없이 손가락으로 현을 뜯어도 음정을 확인할 수 있어요. 처음에는 피치카토로 위치를 익혀도 좋습니다."
  },
  {
    file: "violin-mute.png",
    title: "약음기",
    body: "소리를 작게 만드는 도구예요. 조용히 연습해야 할 때도 지판 위치와 계이름 학습은 계속할 수 있습니다."
  }
];

function noteFromSongItem(item: SongNote) {
  return getNote(item[0], item[1]);
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function App() {
  const [options, setOptions] = useState<DisplayOptions>(() => {
    if (typeof window === "undefined") return DEFAULT_OPTIONS;
    return loadSettings();
  });
  const [mode, setMode] = useState<AppMode>("explore");
  const [selected, setSelected] = useState<SelectedNote>(() => getNote("A", "0"));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>("view");
  const [showOnboarding, setShowOnboarding] = useState(() => (typeof window === "undefined" ? false : !hasSeenOnboarding()));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [sequenceId, setSequenceId] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState<QuizDifficulty>("easy");
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion>(() => createQuizQuestion("easy", "sharp"));
  const [quizCount, setQuizCount] = useState(1);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [songIndex, setSongIndex] = useState(-1);
  const [songPlaying, setSongPlaying] = useState(false);
  const songAbortRef = useRef(false);

  const activeSequence = SOLFEGE_SEQUENCES[sequenceId];
  const sequenceTarget = mode === "solfege" ? noteFromSongItem(activeSequence.notes[sequenceIndex]) : null;
  const song = SONGS[0];
  const songTarget = mode === "song" && songIndex >= 0 ? noteFromSongItem(song.notes[songIndex]) : null;
  const quizTarget = mode === "quiz" && quizQuestion.kind === "nameByPos" ? quizQuestion.target : null;
  const targetKey = sequenceTarget?.key ?? songTarget?.key ?? quizTarget?.key;

  useEffect(() => {
    saveSettings(options);
    document.documentElement.classList.toggle("dark", options.darkMode);
  }, [options]);

  useEffect(() => {
    setQuizQuestion(createQuizQuestion(quizDifficulty, options.accidental));
    setQuizCount(1);
    setQuizCorrect(0);
    setQuizDone(false);
    setFeedback(null);
  }, [quizDifficulty, options.accidental]);

  function patchOptions(patch: Partial<DisplayOptions>) {
    setOptions((current) => ({ ...current, ...patch }));
  }

  async function playNote(note: SelectedNote) {
    await playPitch(note.note, options.soundOn);
  }

  function openSheet(view: SheetView) {
    setSheetView(view);
    setSheetOpen(true);
  }

  function finishOnboarding() {
    markOnboardingSeen();
    setShowOnboarding(false);
  }

  function modeTitle() {
    if (mode === "solfege") return "계이름을 따라 눌러요";
    if (mode === "quiz") return "소리와 이름을 맞혀요";
    if (mode === "song") return "작은별을 박자대로 짚어요";
    return "지판을 눌러 바로 들어요";
  }

  function handleSelect(note: SelectedNote) {
    setSelected(note);
    setFeedback(null);
    vibrate(10, options.haptics);
    void playNote(note);

    if (mode === "solfege" && sequenceTarget) {
      if (note.key === sequenceTarget.key) {
        vibrate([10, 40, 10], options.haptics);
        setFeedback({ tone: "good", text: "정확해요! 다음 음으로 이어가 볼까요?" });
        setSequenceIndex((current) => Math.min(current + 1, activeSequence.notes.length - 1));
      } else {
        vibrate(60, options.haptics);
        setFeedback({
          tone: "try",
          text: `좋은 시도예요. 지금은 ${sequenceTarget.stringName} ${sequenceTarget.fingerLabel}번, ${formatSolfege(sequenceTarget, options.accidental)}를 찾아보세요.`
        });
      }
    }

    if (mode === "quiz" && quizQuestion.kind !== "nameByPos") {
      submitQuizAnswer(note.key);
    }
  }

  function submitQuizAnswer(answer: string) {
    if (quizDone || feedback?.tone === "good") return;

    const correct = answer === quizQuestion.answer;
    if (correct) {
      setQuizCorrect((current) => current + 1);
      vibrate([10, 40, 10], options.haptics);
      setFeedback({ tone: "good", text: "정확해요! 같은 음을 한 번 더 눌러 소리를 익혀볼까요?" });
    } else {
      vibrate(60, options.haptics);
      setFeedback({
        tone: "try",
        text: `거의 맞았어요. 정답은 ${quizQuestion.target.stringName} ${quizQuestion.target.fingerLabel}번, ${formatSolfege(
          quizQuestion.target,
          options.accidental
        )} ${formatNoteName(quizQuestion.target, options.accidental)}예요.`
      });
    }

    window.setTimeout(() => {
      if (quizCount >= 10) {
        setQuizDone(true);
        return;
      }
      setQuizCount((current) => current + 1);
      setQuizQuestion(createQuizQuestion(quizDifficulty, options.accidental));
      setFeedback(null);
    }, correct ? 650 : 1100);
  }

  function resetQuiz() {
    setQuizQuestion(createQuizQuestion(quizDifficulty, options.accidental));
    setQuizCount(1);
    setQuizCorrect(0);
    setQuizDone(false);
    setFeedback(null);
  }

  async function playSong() {
    if (songPlaying) return;
    songAbortRef.current = false;
    setSongPlaying(true);

    for (let index = 0; index < song.notes.length; index += 1) {
      if (songAbortRef.current) break;
      const note = noteFromSongItem(song.notes[index]);
      setSongIndex(index);
      setSelected(note);
      void playNote(note);
      const beatMs = 60000 / options.bpm;
      await sleep(beatMs * song.notes[index][3]);
    }

    setSongPlaying(false);
  }

  function stopSong() {
    songAbortRef.current = true;
    setSongPlaying(false);
  }

  function stepSong() {
    const nextIndex = songIndex < 0 ? 0 : (songIndex + 1) % song.notes.length;
    const note = noteFromSongItem(song.notes[nextIndex]);
    setSongIndex(nextIndex);
    setSelected(note);
    void playNote(note);
  }

  return (
    <div className="app-shell">
      <header className="topbar" role="banner">
        <div className="brand">
          <span aria-hidden="true">🎻</span>
          <div>
            <strong>운지 마스터</strong>
            <small>{modeTitle()}</small>
          </div>
        </div>
        <div className="top-actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => patchOptions({ soundOn: !options.soundOn })}
            aria-label={options.soundOn ? "소리 끄기" : "소리 켜기"}
          >
            {options.soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button type="button" className="icon-button" onClick={() => openSheet("settings")} aria-label="설정 열기">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="main-layout">
        <div className="hero-column">
          <SelectedNoteCard note={selected} accidental={options.accidental} onReplay={() => void playNote(selected)} />
          <Fingerboard
            selectedKey={selected.key}
            targetKey={targetKey}
            includeChromatic={options.includeChromatic}
            leftHanded={options.leftHanded}
            showFinger={options.showFinger}
            showNoteName={options.showNoteName}
            showSolfege={options.showSolfege}
            accidental={options.accidental}
            onSelect={handleSelect}
          />
          <button type="button" className="sheet-handle" onClick={() => openSheet("view")} aria-label="보기 옵션 열기">
            <ChevronUp size={16} />
            보기 옵션
          </button>
        </div>

        <aside className="mode-panel" aria-live="polite">
          {mode === "explore" && <ExplorePanel selected={selected} accidental={options.accidental} onOpenHelp={() => openSheet("help")} />}
          {mode === "solfege" && (
            <SolfegePanel
              sequenceId={sequenceId}
              onSequenceChange={(next) => {
                setSequenceId(next);
                setSequenceIndex(0);
                setFeedback(null);
              }}
              sequenceIndex={sequenceIndex}
              target={sequenceTarget}
              feedback={feedback}
              onReset={() => {
                setSequenceIndex(0);
                setFeedback(null);
              }}
              accidental={options.accidental}
            />
          )}
          {mode === "quiz" && (
            <QuizPanel
              question={quizQuestion}
              count={quizCount}
              correct={quizCorrect}
              done={quizDone}
              difficulty={quizDifficulty}
              feedback={feedback}
              accidental={options.accidental}
              onDifficultyChange={setQuizDifficulty}
              onChoice={submitQuizAnswer}
              onListen={() => void playNote(quizQuestion.target)}
              onReset={resetQuiz}
            />
          )}
          {mode === "song" && (
            <SongPanel
              songIndex={songIndex}
              songPlaying={songPlaying}
              bpm={options.bpm}
              onBpmChange={(bpm) => patchOptions({ bpm })}
              onPlay={() => void playSong()}
              onStop={stopSong}
              onStep={stepSong}
              accidental={options.accidental}
            />
          )}
        </aside>
      </main>

      <nav className="bottom-tabs" aria-label="학습 모드">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={mode === id ? "is-selected" : ""}
            onClick={() => {
              setMode(id);
              setFeedback(null);
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <OptionSheet
        open={sheetOpen}
        view={sheetView}
        options={options}
        onClose={() => setSheetOpen(false)}
        onViewChange={setSheetView}
        onPatchOptions={patchOptions}
      />

      <AnimatePresence>
        {showOnboarding && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section
              className="onboarding"
              role="dialog"
              aria-modal="true"
              aria-label="첫 사용 안내"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
            >
              <Sparkles size={28} />
              <h2>지판을 탭하면 소리와 계이름이 바로 나와요</h2>
              <p>먼저 A현의 동그라미를 눌러보세요. 바이올린은 프렛이 없어서 표시 위치는 가이드이고, 실제 연주는 귀로 조금씩 맞춥니다.</p>
              <button type="button" className="primary-button" onClick={finishOnboarding}>
                시작하기
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExplorePanel({ selected, accidental, onOpenHelp }: { selected: SelectedNote; accidental: DisplayOptions["accidental"]; onOpenHelp: () => void }) {
  return (
    <section className="panel-section">
      <p className="eyebrow">탐색</p>
      <h1>{selected.stringName} {selected.fingerLabel}번</h1>
      <p>
        {formatSolfege(selected, accidental)} · {formatNoteName(selected, accidental)} · {selected.freq.toFixed(2)}Hz
      </p>
      <div className="tip-box">
        바이올린은 프렛이 없는 악기예요. 표시된 위치는 운지를 돕는 가이드이며, 실제 연주는 귀로 음정을 들으며 미세하게 조정합니다.
      </div>
      <button type="button" className="secondary-button" onClick={onOpenHelp}>
        <HelpCircle size={18} />
        학습 이미지 보기
      </button>
    </section>
  );
}

function SolfegePanel({
  sequenceId,
  onSequenceChange,
  sequenceIndex,
  target,
  feedback,
  onReset,
  accidental
}: {
  sequenceId: number;
  onSequenceChange: (index: number) => void;
  sequenceIndex: number;
  target: SelectedNote | null;
  feedback: Feedback;
  onReset: () => void;
  accidental: DisplayOptions["accidental"];
}) {
  const sequence = SOLFEGE_SEQUENCES[sequenceId];

  return (
    <section className="panel-section">
      <p className="eyebrow">계이름 모드</p>
      <h2>{sequence.title}</h2>
      <div className="segmented" role="group" aria-label="계이름 시퀀스 선택">
        {SOLFEGE_SEQUENCES.map((item, index) => (
          <button key={item.title} type="button" className={sequenceId === index ? "active" : ""} onClick={() => onSequenceChange(index)}>
            {item.title}
          </button>
        ))}
      </div>
      <p>{sequence.helper}</p>
      {target && (
        <div className="target-card">
          <span>지금 누를 음</span>
          <strong>
            {formatSolfege(target, accidental)} · {formatNoteName(target, accidental)}
          </strong>
          <small>{target.stringName} {target.fingerLabel}번</small>
        </div>
      )}
      <div className="note-row">
        {sequence.notes.map((item, index) => {
          const note = noteFromSongItem(item);
          return (
            <span key={`${note.key}-${index}`} className={sequenceIndex === index ? "current" : ""} style={{ "--chip-color": note.color } as CSSProperties}>
              {item[2]}
            </span>
          );
        })}
      </div>
      {feedback && <FeedbackLine feedback={feedback} />}
      <button type="button" className="secondary-button" onClick={onReset}>
        <RotateCcw size={18} />
        처음부터
      </button>
    </section>
  );
}

function QuizPanel({
  question,
  count,
  correct,
  done,
  difficulty,
  feedback,
  accidental,
  onDifficultyChange,
  onChoice,
  onListen,
  onReset
}: {
  question: QuizQuestion;
  count: number;
  correct: number;
  done: boolean;
  difficulty: QuizDifficulty;
  feedback: Feedback;
  accidental: DisplayOptions["accidental"];
  onDifficultyChange: (difficulty: QuizDifficulty) => void;
  onChoice: (answer: string) => void;
  onListen: () => void;
  onReset: () => void;
}) {
  if (done) {
    return (
      <section className="panel-section">
        <p className="eyebrow">퀴즈 결과</p>
        <h2>{correct}/10 정답</h2>
        <p>좋아요! 기본 운지를 몸으로 연결하는 감각이 쌓이고 있어요.</p>
        <button type="button" className="primary-button" onClick={onReset}>
          다시 풀기
        </button>
      </section>
    );
  }

  return (
    <section className="panel-section">
      <p className="eyebrow">퀴즈 {count}/10</p>
      <h2>{question.prompt}</h2>
      <div className="segmented" role="group" aria-label="퀴즈 난이도">
        {[
          ["easy", "개방+1번"],
          ["basic", "1~3번"],
          ["all", "4현 전체"]
        ].map(([value, label]) => (
          <button key={value} type="button" className={difficulty === value ? "active" : ""} onClick={() => onDifficultyChange(value as QuizDifficulty)}>
            {label}
          </button>
        ))}
      </div>
      <div className="score-line">
        <Gauge size={18} />
        정답 {correct}개
      </div>
      {(question.kind === "listenAndFind" || question.kind === "nameByPos") && (
        <button type="button" className="secondary-button" onClick={onListen}>
          <Volume2 size={18} />
          소리 듣기
        </button>
      )}
      {question.choices && (
        <div className="choice-grid">
          {question.choices.map((choice) => (
            <button key={choice} type="button" onClick={() => onChoice(choice)}>
              {choice}
            </button>
          ))}
        </div>
      )}
      {question.kind !== "nameByPos" && (
        <p className="subtle">지판에서 정답 위치를 직접 눌러보세요. 첫 문제는 쉬운 음부터 시작합니다.</p>
      )}
      <p className="subtle">
        정답 기준: {question.target.stringName} {question.target.fingerLabel}번 · {formatSolfege(question.target, accidental)}{" "}
        {formatNoteName(question.target, accidental)}
      </p>
      {feedback && <FeedbackLine feedback={feedback} />}
    </section>
  );
}

function SongPanel({
  songIndex,
  songPlaying,
  bpm,
  onBpmChange,
  onPlay,
  onStop,
  onStep,
  accidental
}: {
  songIndex: number;
  songPlaying: boolean;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onStep: () => void;
  accidental: DisplayOptions["accidental"];
}) {
  const song = SONGS[0];

  return (
    <section className="panel-section">
      <p className="eyebrow">연습곡</p>
      <h2>{song.title}</h2>
      <p>{song.key} · 박자에 맞춰 지판 위치가 차례로 강조됩니다.</p>
      <div className="song-strip">
        {song.notes.map((item, index) => {
          const note = noteFromSongItem(item);
          return (
            <span key={`${note.key}-${index}`} className={songIndex === index ? "current" : ""} style={{ "--chip-color": note.color } as CSSProperties}>
              <b>{item[2]}</b>
              <small>{note.stringId}{note.fingerLabel}</small>
            </span>
          );
        })}
      </div>
      <label className="range-control">
        <span>템포 {bpm} BPM</span>
        <input type="range" min="50" max="120" value={bpm} onChange={(event) => onBpmChange(Number(event.target.value))} />
      </label>
      <div className="button-row">
        <button type="button" className="primary-button" onClick={songPlaying ? onStop : onPlay}>
          {songPlaying ? "정지" : "재생"}
        </button>
        <button type="button" className="secondary-button" onClick={onStep}>
          한 음씩
        </button>
      </div>
    </section>
  );
}

function FeedbackLine({ feedback }: { feedback: Exclude<Feedback, null> }) {
  const Icon = feedback.tone === "good" ? CheckCircle2 : XCircle;
  return (
    <motion.div
      className={`feedback ${feedback.tone}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, x: feedback.tone === "try" ? [0, -6, 6, -4, 4, 0] : 0 }}
    >
      <Icon size={18} />
      {feedback.text}
    </motion.div>
  );
}

function OptionSheet({
  open,
  view,
  options,
  onClose,
  onViewChange,
  onPatchOptions
}: {
  open: boolean;
  view: SheetView;
  options: DisplayOptions;
  onClose: () => void;
  onViewChange: (view: SheetView) => void;
  onPatchOptions: (patch: Partial<DisplayOptions>) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section
            className="bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="보기 옵션과 설정"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className="sheet-header">
              <div className="sheet-tabs" role="tablist" aria-label="시트 보기">
                {[
                  ["view", "보기"],
                  ["help", "도움말"],
                  ["settings", "설정"]
                ].map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => onViewChange(id as SheetView)}>
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
                <XCircle size={20} />
              </button>
            </div>
            {view === "view" && <ViewOptions options={options} onPatchOptions={onPatchOptions} />}
            {view === "help" && <HelpPanel />}
            {view === "settings" && <SettingsPanel options={options} onPatchOptions={onPatchOptions} />}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function ViewOptions({ options, onPatchOptions }: { options: DisplayOptions; onPatchOptions: (patch: Partial<DisplayOptions>) => void }) {
  return (
    <div className="sheet-body">
      <h2>
        <SlidersHorizontal size={20} />
        보기 옵션
      </h2>
      <ToggleRow label="계이름" description="도레미를 마커에 함께 표시" checked={options.showSolfege} onChange={(showSolfege) => onPatchOptions({ showSolfege })} />
      <ToggleRow label="음이름" description="A4, C#5 같은 음높이 표시" checked={options.showNoteName} onChange={(showNoteName) => onPatchOptions({ showNoteName })} />
      <ToggleRow label="손가락 번호" description="색만으로 구분하지 않도록 번호 유지" checked={options.showFinger} onChange={(showFinger) => onPatchOptions({ showFinger })} />
      <ToggleRow label="반음 포함" description="L1, L2, H3를 흐리게 추가" checked={options.includeChromatic} onChange={(includeChromatic) => onPatchOptions({ includeChromatic })} />
      <ToggleRow label="왼손잡이 보기" description="현 순서를 반대로 확인" checked={options.leftHanded} onChange={(leftHanded) => onPatchOptions({ leftHanded })} />
      <div className="segmented full">
        <button type="button" className={options.accidental === "sharp" ? "active" : ""} onClick={() => onPatchOptions({ accidental: "sharp" })}>
          # 기준
        </button>
        <button type="button" className={options.accidental === "flat" ? "active" : ""} onClick={() => onPatchOptions({ accidental: "flat" })}>
          ♭ 기준
        </button>
      </div>
      <div className="legend-note">2·3번은 반음이라 손가락 사이가 가까워지는 자리예요. 반음 위치는 기본 운지를 익힌 뒤 켜보세요.</div>
    </div>
  );
}

function SettingsPanel({ options, onPatchOptions }: { options: DisplayOptions; onPatchOptions: (patch: Partial<DisplayOptions>) => void }) {
  return (
    <div className="sheet-body">
      <h2>
        <Settings size={20} />
        설정
      </h2>
      <ToggleRow label="소리" description="첫 탭에서 오디오를 켜고 음을 재생" checked={options.soundOn} onChange={(soundOn) => onPatchOptions({ soundOn })} />
      <ToggleRow label="햅틱" description="지원 기기에서만 짧게 진동" checked={options.haptics} onChange={(haptics) => onPatchOptions({ haptics })} />
      <ToggleRow label="다크 모드" description="OLED 친화 색상으로 전환" checked={options.darkMode} onChange={(darkMode) => onPatchOptions({ darkMode })} />
      <label className="range-control">
        <span>메트로놈 {options.bpm} BPM</span>
        <input type="range" min="50" max="120" value={options.bpm} onChange={(event) => onPatchOptions({ bpm: Number(event.target.value) })} />
      </label>
    </div>
  );
}

function HelpPanel() {
  const cards = useMemo(() => HELP_IMAGES, []);

  return (
    <div className="sheet-body">
      <h2>
        <HelpCircle size={20} />
        학습 이미지
      </h2>
      <div className="help-grid">
        {cards.map((item) => (
          <article className="help-card" key={item.file}>
            <img src={encodeURI(`/assets/${item.file}`)} alt={item.title} loading="lazy" />
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
