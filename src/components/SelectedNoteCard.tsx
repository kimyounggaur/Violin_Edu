import { Play } from "lucide-react";
import { formatNoteName, formatSolfege, type AccidentalMode, type SelectedNote } from "../lib/music/violinData";

interface SelectedNoteCardProps {
  note: SelectedNote;
  accidental: AccidentalMode;
  onReplay: () => void;
}

export function SelectedNoteCard({ note, accidental, onReplay }: SelectedNoteCardProps) {
  const noteName = formatNoteName(note, accidental);
  const solfege = formatSolfege(note, accidental);
  const fingerText = note.fingerLabel === "0" ? "개방현" : `${note.fingerName} 손가락(${note.handName})`;

  return (
    <section className="selected-note" aria-label="선택한 음">
      <div className="selected-main">
        <div>
          <p className="eyebrow">선택한 음</p>
          <strong>{solfege}</strong>
          <span>{noteName}</span>
        </div>
        <button type="button" className="icon-button replay" onClick={onReplay} aria-label={`${noteName} 다시 듣기`}>
          <Play size={20} fill="currentColor" />
        </button>
      </div>
      <p className="note-detail">
        {note.stringName} · {note.fingerLabel}번 · {fingerText} · {note.freq.toFixed(2)}Hz
      </p>
      <MiniStaff color={note.color} noteName={noteName} />
      <p className="microcopy">
        {note.stringName} 위에 {note.fingerLabel === "0" ? "손가락을 올리지 않고" : `${note.handName}를 가볍게 올리고`} 활은 해당 현만 지나가게 켜보세요.
      </p>
    </section>
  );
}

function MiniStaff({ color, noteName }: { color: string; noteName: string }) {
  return (
    <svg className="mini-staff" viewBox="0 0 240 52" role="img" aria-label={`${noteName} 미니 오선보 위치`}>
      {[10, 18, 26, 34, 42].map((y) => (
        <line key={y} x1="8" x2="232" y1={y} y2={y} />
      ))}
      <circle cx="118" cy="26" r="8" fill={color} />
      <line x1="127" x2="127" y1="6" y2="26" stroke={color} strokeWidth="3" />
      <text x="150" y="31">{noteName}</text>
    </svg>
  );
}
