// TranscriptMini.tsx
import React from "react";
import { TranscriptEntry } from "./useTranscript";

type Props = {
  entries: TranscriptEntry[];
  onDelete: (id: string) => void;
  onPlay: () => void;
  onClear: () => void;
  onDownload: () => void;
  onLoad: (file: File) => void;
  scale?: number;
};

export default function TranscriptMini({
  entries,
  onDelete,
  onPlay,
  onClear,
  onDownload,
  onLoad,
  scale = 170,
}: Props) {
  return (
    <div 
      className="mt-3 p-3 rounded bg-white/5 border border-white/10 mx-auto"
      style={{ width: "100%", maxWidth: "100%" }}
    >
      {/* Buttons */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Transcript</h3>

        <div className="flex gap-2 items-center">

          <button onClick={onPlay} className="px-3 py-1 rounded bg-primary/25 text-sm">
            Play
          </button>

          <button onClick={onClear} className="px-3 py-1 rounded bg-destructive/20 text-sm">
            Clear
          </button>

          <button onClick={onDownload} className="px-3 py-1 rounded bg-white/10 text-sm">
            Download
          </button>

          <label className="px-3 py-1 rounded bg-white/10 text-sm cursor-pointer">
            Load
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && onLoad(e.target.files[0])
              }
            />
          </label>
        </div>
      </div>

      {/* Bars */}
      <div
        className="flex flex-wrap gap-3 w-full py-3"
        style={{ maxWidth: "100%", overflow: "hidden" }}
      >
        {entries.map((e) => {
          const width = Math.max(28, e.duration * scale);

          return (
            <div key={e.id} className="flex flex-col items-center" style={{ flexShrink: 0 }}>
              <div
                className="relative h-8 rounded-md"
                style={{
                  width,
                  background:
                    "linear-gradient(90deg, rgba(140,80,255,0.45), rgba(255,140,200,0.25))",
                  boxShadow: "0 6px 18px rgba(120,60,200,0.15)",
                }}
              >
                <button
                  onClick={() => onDelete(e.id)}
                  className="absolute -top-3 -right-2 w-5 h-5 rounded-full bg-red-300 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <span className="text-[11px] mt-1 opacity-80 font-mono">
                {e.noteName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
