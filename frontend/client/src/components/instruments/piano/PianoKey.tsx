// PianoKey.tsx
import React from "react";
import { motion } from "framer-motion";
import { PianoNote } from "./pianoNotes";

type Props = {
  note: PianoNote;
  width: number;
  onDown: (n: PianoNote) => void;
  onUp: (n: PianoNote) => void;
  active?: boolean;
};

export default function PianoKey({ note, width, onDown, onUp, active }: Props) {
  const isBlack = note.isBlack;

  // FIX: Hard-coded stable colors (not affected by dark mode)
  const WHITE_KEY_COLOR = active ? "#e8d8ff" : "#ffffff";
  const BLACK_KEY_COLOR = active ? "#b38aff" : "#111111";

  const style: React.CSSProperties = isBlack
    ? {
        width: Math.round(width * 0.62),
        marginLeft: -(width * 0.62) / 2,
        height: 130,
        backgroundColor: BLACK_KEY_COLOR,
        zIndex: 20,
      }
    : {
        width,
        height: 190,
        backgroundColor: WHITE_KEY_COLOR,
      };

  return (
    <motion.div
      onMouseDown={(e) => {
        e.preventDefault();
        onDown(note);
      }}
      onMouseUp={() => onUp(note)}
      onMouseLeave={(e) => {
        if (e.buttons === 1) onUp(note);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="relative select-none rounded-b-md"
      style={{
        ...style,
        border: "1px solid rgba(0,0,0,0.25)", // FIX: replaces border-border
      }}
    >
      <motion.div
        animate={
          active
            ? {
                scale: 0.985,
                boxShadow: "0 12px 30px rgba(200,60,255,0.35)",
              }
            : { scale: 1 }
        }
        transition={{ type: "spring", stiffness: 700, damping: 26 }}
        className="absolute inset-0 rounded-b-md"
      />

      {/* FIX: Labels always visible */}
      <span
        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px]"
        style={{
          color: isBlack ? "white" : "black",
          opacity: 0.8,
          pointerEvents: "none",
          fontWeight: 500,
        }}
      >
        {note.name}
      </span>
    </motion.div>
  );
}
