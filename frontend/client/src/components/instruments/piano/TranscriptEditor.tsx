// TranscriptEditor.tsx
import React from "react";
import { TranscriptEntry } from "./useTranscript";

type Props = {
  entries: TranscriptEntry[];
  onUpdate: (id: string, patch: Partial<TranscriptEntry>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onPlay: () => void;
  onClear: () => void;
};

export default function TranscriptEditor({
  entries,
  onUpdate,
  onDelete,
  onDuplicate,
  onReorder,
  onPlay,
  onClear
}: Props) {
  return (
    <div className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Transcript Editor</h3>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-primary/25"
            onClick={onPlay}
          >
            Play
          </button>

          <button
            className="px-3 py-1 rounded bg-destructive/25"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No notes recorded yet — play the piano to add notes.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => (
            <div
              key={e.id}
              className="flex items-center gap-4 bg-white/3 p-2 rounded border border-white/10"
            >
              {/* Note name */}
              <div className="w-28 font-mono text-sm">{e.noteName}</div>

              {/* Duration */}
              <label className="text-xs opacity-80">Dur</label>

              <input
                type="number"
                min={0.05}
                step={0.05}
                value={Number(e.duration.toFixed(2))}
                onChange={(ev) =>
                  onUpdate(e.id, {
                    duration: Math.max(0.05, parseFloat(ev.target.value) || 0.05),
                  })
                }
                className="w-20 bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
              />

              {/* Editor buttons */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => onDuplicate(e.id)}
                  className="px-2 py-1 rounded bg-white/10 text-xs"
                >
                  Duplicate
                </button>

                <button
                  onClick={() => onDelete(e.id)}
                  className="px-2 py-1 rounded bg-destructive/20 text-xs"
                >
                  Delete
                </button>

                {/* Move Up */}
                <button
                  onClick={() => onReorder(i, Math.max(0, i - 1))}
                  className="px-2 py-1 rounded bg-white/10 text-xs"
                  disabled={i === 0}
                >
                  ↑
                </button>

                {/* Move Down */}
                <button
                  onClick={() => onReorder(i, Math.min(entries.length - 1, i + 1))}
                  className="px-2 py-1 rounded bg-white/10 text-xs"
                  disabled={i === entries.length - 1}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
