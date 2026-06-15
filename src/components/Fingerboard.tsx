import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import {
  FINGER_COLORS,
  STRINGS,
  formatNoteName,
  formatSolfege,
  getAllNotes,
  type AccidentalMode,
  type SelectedNote
} from "../lib/music/violinData";

interface FingerboardProps {
  selectedKey?: string;
  targetKey?: string;
  includeChromatic: boolean;
  leftHanded?: boolean;
  showSolfege?: boolean;
  showNoteName?: boolean;
  showFinger?: boolean;
  accidental?: AccidentalMode;
  onSelect: (note: SelectedNote) => void;
}

function markerText(
  note: SelectedNote,
  {
    showFinger = true,
    showNoteName = false,
    showSolfege = false,
    accidental = "sharp"
  }: Pick<FingerboardProps, "showFinger" | "showNoteName" | "showSolfege" | "accidental">
) {
  const parts = [
    showFinger ? note.fingerLabel : "",
    showSolfege ? formatSolfege(note, accidental) : "",
    showNoteName ? formatNoteName(note, accidental).replace(/\d/, "") : ""
  ].filter(Boolean);

  return parts.length ? parts.slice(0, 2).join("\n") : note.fingerLabel;
}

export function Fingerboard({
  selectedKey,
  targetKey,
  includeChromatic,
  leftHanded = false,
  showFinger = true,
  showNoteName = false,
  showSolfege = false,
  accidental = "sharp",
  onSelect
}: FingerboardProps) {
  const strings = leftHanded ? [...STRINGS].reverse() : STRINGS;
  const notes = getAllNotes({ includeChromatic });

  return (
    <section className="fingerboard-wrap" aria-label="바이올린 지판">
      <div className="string-labels" aria-hidden="true">
        {strings.map((stringItem) => (
          <span key={stringItem.id}>{stringItem.id}</span>
        ))}
      </div>
      <div className="fingerboard">
        <div className="nut" aria-hidden="true" />
        {strings.map((stringItem, stringIndex) => (
          <span
            key={stringItem.id}
            aria-hidden="true"
            className="string-line"
            style={{
              left: `${((stringIndex + 0.5) / strings.length) * 100}%`,
              width: `${Math.max(2, 6 - stringIndex * 1.2)}px`
            }}
          />
        ))}
        {notes.map((note) => {
          const stringIndex = strings.findIndex((stringItem) => stringItem.id === note.stringId);
          const left = ((stringIndex + 0.5) / strings.length) * 100;
          const top = 8 + note.posRatio * 82;
          const active = selectedKey === note.key;
          const target = targetKey === note.key;

          return (
            <motion.button
              key={note.key}
              type="button"
              aria-label={note.aria}
              className={[
                "finger-marker",
                active ? "is-active" : "",
                target ? "is-target" : "",
                note.isChromatic ? "is-chromatic" : ""
              ].join(" ")}
              style={{
                left: `calc(${left}% - 24px)`,
                top: `calc(${top}% - 24px)`,
                "--finger-color": note.color
              } as CSSProperties}
              onClick={() => onSelect(note)}
              whileTap={{ scale: 1.12 }}
              animate={{
                scale: active ? 1.08 : target ? [1, 1.08, 1] : 1,
                boxShadow: active ? `0 0 0 7px ${note.color}2A` : target ? `0 0 0 8px ${note.color}24` : "none"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span>{markerText(note, { showFinger, showNoteName, showSolfege, accidental })}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="finger-legend" aria-label="손가락 색상 범례">
        {[
          ["0", "개방현", FINGER_COLORS[0]],
          ["1", "검지", FINGER_COLORS[1]],
          ["2", "중지", FINGER_COLORS[2]],
          ["3", "약지", FINGER_COLORS[3]],
          ["4", "소지", FINGER_COLORS[4]]
        ].map(([finger, name, color]) => (
          <span key={finger}>
            <i style={{ background: color }} />
            {finger} {name}
          </span>
        ))}
      </div>
    </section>
  );
}
