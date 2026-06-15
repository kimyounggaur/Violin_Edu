import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import {
  FINGER_COLORS,
  STRINGS,
  type StringId,
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

const STRING_TOP_X = [43.2, 48.1, 51.9, 56.8];
const STRING_BOTTOM_X = [37.4, 45.8, 54.2, 62.6];
const STRING_START_Y = 28.5;
const STRING_END_Y = 96.2;
const MARKER_START_Y = 32;
const MARKER_END_Y = 88.5;
const STRING_WIDTH: Record<StringId, number> = {
  G: 2.9,
  D: 2.25,
  A: 1.72,
  E: 1.22
};
const WINDING_COLORS: Record<StringId, string> = {
  G: "#7c3aed",
  D: "#2563eb",
  A: "#16a34a",
  E: "#dc2626"
};

function stringXAt(visualIndex: number, ratio: number) {
  return STRING_TOP_X[visualIndex] + (STRING_BOTTOM_X[visualIndex] - STRING_TOP_X[visualIndex]) * ratio;
}

function stringPath(visualIndex: number) {
  const top = STRING_TOP_X[visualIndex];
  const bottom = STRING_BOTTOM_X[visualIndex];
  const drift = bottom - top;

  return `M ${top} ${STRING_START_Y} C ${top + drift * 0.18} 45, ${top + drift * 0.72} 76, ${bottom} ${STRING_END_Y}`;
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
        <div className="scroll-crown" aria-hidden="true">
          <span />
        </div>
        <div className="pegbox" aria-hidden="true">
          <div className="pegbox-body" />
          <div className="pegbox-cavity" />
          <div className="tuning-peg peg-left peg-upper">
            <span />
          </div>
          <div className="tuning-peg peg-right peg-upper">
            <span />
          </div>
          <div className="tuning-peg peg-left peg-lower">
            <span />
          </div>
          <div className="tuning-peg peg-right peg-lower">
            <span />
          </div>
          {strings.map((stringItem, stringIndex) => (
            <span
              key={`winding-${stringItem.id}`}
              className="string-winding"
              style={
                {
                  left: `${44 + stringIndex * 3.9}%`,
                  top: `${11.2 + (stringIndex % 2) * 8.5}%`,
                  "--winding-color": WINDING_COLORS[stringItem.id]
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="neck-heel" aria-hidden="true" />
        <div className="fingerboard-core" aria-hidden="true" />
        <div className="nut" aria-hidden="true" />
        <svg className="string-web" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
          {strings.map((stringItem, stringIndex) => (
            <g key={stringItem.id}>
              <path className="instrument-string-shadow" d={stringPath(stringIndex)} vectorEffect="non-scaling-stroke" />
              <path
                className={`instrument-string string-${stringItem.id.toLowerCase()}`}
                d={stringPath(stringIndex)}
                strokeWidth={STRING_WIDTH[stringItem.id]}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>
        {notes.map((note) => {
          const stringIndex = strings.findIndex((stringItem) => stringItem.id === note.stringId);
          const left = stringXAt(stringIndex, note.posRatio);
          const top = MARKER_START_Y + note.posRatio * (MARKER_END_Y - MARKER_START_Y);
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
                note.finger === 0 ? "is-open-string" : "",
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
