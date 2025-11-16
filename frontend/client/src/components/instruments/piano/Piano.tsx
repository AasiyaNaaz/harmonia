// Piano.tsx
import React, { useEffect, useRef, useState } from "react";
import { PIANO_NOTES, PianoNote } from "./pianoNotes";
import PianoKey from "./PianoKey";
import Engine from "./pianoAudio";
import useTranscript from "./useTranscript";
import TranscriptMini from "./transcriptMini";
import { buildKeyboardMapForVisible } from "./keyboardMap";

const VISIBLE_WHITE_KEYS = 21;
const KEY_WIDTH = 52;
const SCALE = 220;

/* ----------------------------------------------
   NEW: Build visible slice based on startNote
-----------------------------------------------*/
function buildVisibleSlice(startNote: string) {
  const whites = PIANO_NOTES.filter((n) => !n.isBlack);

  // find starting white key index
  const startWhiteIndex = whites.findIndex((w) => w.name === startNote);

  const whiteStartIndex = startWhiteIndex === -1 ? 0 : startWhiteIndex;
  const whiteStartMidi = whites[whiteStartIndex]?.midi ?? whites[0].midi;

  const startIndex = PIANO_NOTES.findIndex((n) => n.midi === whiteStartMidi);

  const sliceLength = VISIBLE_WHITE_KEYS + Math.floor(VISIBLE_WHITE_KEYS * 0.6);

  return {
    slice: PIANO_NOTES.slice(
      startIndex,
      Math.min(PIANO_NOTES.length, startIndex + sliceLength)
    ),
    startWhiteIndex,
  };
}

export default function Piano() {
  /* ----------------- NEW ------------------ */
  const [startNote, setStartNote] = useState("C4");
  /* ---------------------------------------- */

  const { slice: visibleNotes } = buildVisibleSlice(startNote);
  const whiteKeys = visibleNotes.filter((n) => !n.isBlack);
  const totalWidth = whiteKeys.length * KEY_WIDTH;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const keyboardMap = useRef(buildKeyboardMapForVisible(whiteKeys.length));
  const { entries, add, remove, clear, setEntries } = useTranscript();

  const [active, setActive] = useState<Record<number, boolean>>({});
  const holdStartRef = useRef<Record<number, number>>({});
  const sessionStartRef = useRef<number | null>(null);

  const [volume, setVolume] = useState(0.8);
  const [reverb, setReverb] = useState(0);

  // DOWNLOAD
  const handleDownload = () => {
    const data = JSON.stringify(entries, null, 2);
    const file = new Blob([data], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "harmonica_transcript.json";
    a.click();
  };

  // LOAD
  const handleLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setEntries(json);
        }
      } catch (err) {
        console.error("Invalid transcript file");
      }
    };
    reader.readAsText(file);
  };


  /* -------------------------------------
     Fix hover recording bug  
  --------------------------------------*/
  useEffect(() => {
    const resume = () => Engine.resume();
    document.addEventListener("mousedown", resume);
    return () => document.removeEventListener("mousedown", resume);
  }, []);

  useEffect(() => Engine.setMasterVolume(volume), [volume]);
  useEffect(() => Engine.setReverbWet(reverb), [reverb]);

  const handleDown = (note: PianoNote) => {
    if (active[note.midi]) return;

    Engine.playNote(note.midi, note.freq, 1);
    setActive((s) => ({ ...s, [note.midi]: true }));

    holdStartRef.current[note.midi] = performance.now();

    if (sessionStartRef.current === null)
      sessionStartRef.current = performance.now() / 1000;
  };

  const handleUp = (note: PianoNote) => {
    const startMs = holdStartRef.current[note.midi];
    const nowMs = performance.now();
    const duration = startMs
      ? Math.max(0.05, (nowMs - startMs) / 1000)
      : 0.12;

    Engine.stopNote(note.midi);

    setActive((s) => {
      const c = { ...s };
      delete c[note.midi];
      return c;
    });

    delete holdStartRef.current[note.midi];

    if (sessionStartRef.current === null)
      sessionStartRef.current = nowMs / 1000;

    const entryStart =
      (startMs ? startMs / 1000 : nowMs / 1000) - sessionStartRef.current;

    add({
      midi: note.midi,
      noteName: note.name,
      start: Math.max(0, entryStart),
      duration,
    });
  };

  /* -------------------------------------
     Keyboard shortcuts (A, S, D...)
  --------------------------------------*/
  useEffect(() => {
    const map = keyboardMap.current;

    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const idx = map.get(k);
      if (idx !== undefined) handleDown(visibleNotes[idx]);
    };

    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const idx = map.get(k);
      if (idx !== undefined) handleUp(visibleNotes[idx]);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [visibleNotes]);

  /* -------------------------------------
     Smooth scroll to white index
  --------------------------------------*/
  const scrollToWhiteIndex = (wi: number) => {
    const c = containerRef.current;
    if (!c) return;
    const x = wi * KEY_WIDTH - c.clientWidth / 2 + KEY_WIDTH / 2;
    c.scrollTo({ left: Math.max(0, x), behavior: "smooth" });
  };

  /* -------------------------------------
     SHIFT LEFT / RIGHT
  --------------------------------------*/
  const shiftLeft = () => {
    const whites = PIANO_NOTES.filter((n) => !n.isBlack);
    const idx = whites.findIndex((w) => w.name === startNote);

    if (idx > 0) setStartNote(whites[idx - 1].name);
  };

  const shiftRight = () => {
    const whites = PIANO_NOTES.filter((n) => !n.isBlack);
    const idx = whites.findIndex((w) => w.name === startNote);

    if (idx < whites.length - 1) setStartNote(whites[idx + 1].name);
  };

  /* -------------------------------------
     PLAYBACK
  --------------------------------------*/
  const playTranscript = () => {
    if (entries.length === 0) return;

    const snap = [...entries];
    const base = Math.min(...snap.map((e) => e.start));

    snap.forEach((e) => {
      const delay = (e.start - base) * 1000;

      setTimeout(() => {
        const note = PIANO_NOTES.find((n) => n.midi === e.midi);
        if (!note) return;

        Engine.playNote(note.midi, note.freq, 1);

        setActive((s) => ({ ...s, [note.midi]: true }));

        setTimeout(() => {
          Engine.stopNote(note.midi);
          setActive((s) => {
            const c = { ...s };
            delete c[note.midi];
            return c;
          });
        }, e.duration * 1000);
      }, delay);
    });
  };
  

  return (
    <div className="space-y-3 mx-auto w-fit">

      {/* ---------------- CONTROLS ---------------- */}
      <div className="flex items-center justify-between gap-4 text-sm">

        {/* Left: start note & shift */}
        <div className="flex items-center gap-3">

          <label className="text-xs opacity-80">Start</label>

          <select
            value={startNote}
            onChange={(e) => setStartNote(e.target.value)}
            className="bg-white/10 text-sm px-2 py-1 rounded"
          >
            {["C3","C4","C5","A3","A4","A5","G3","G4","F4","D4","E4"].map((n) => (
              <option key={n} value={n} className="text-black">{n}</option>
            ))}
          </select>

          <button
            onClick={shiftLeft}
            className="px-2 py-1 bg-white/10 rounded"
          >
            ←
          </button>

          <button
            onClick={shiftRight}
            className="px-2 py-1 bg-white/10 rounded"
          >
            →
          </button>
        </div>

        {/* Right: volume / reverb */}
        <div className="flex items-center gap-3">
          <label className="text-xs opacity-80">Vol</label>
          <input type="range" min={0} max={1} step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-28"
          />

          <label className="text-xs opacity-80">Reverb</label>
          <input type="range" min={0} max={1} step={0.01}
            value={reverb}
            onChange={(e) => setReverb(parseFloat(e.target.value))}
            className="w-28"
          />
        </div>

        {/* Play / Clear */}
        <div className="flex items-center gap-2">
          <button onClick={playTranscript} className="px-2 py-1 rounded bg-primary/30">Play</button>
          <button onClick={() => { clear(); sessionStartRef.current = null; }} className="px-2 py-1 rounded bg-destructive/10">Clear</button>
        </div>
      </div>

      {/* ---------------- PIANO ---------------- */}
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-hidden w-full"
        style={{ height: 200, scrollbarWidth: "thin" }}
      >
        <div className="relative" style={{ width: totalWidth, height: 200 }}>
          {/* white keys */}
          {whiteKeys.map((note, wi) => (
            <div
              key={note.midi}
              style={{ position: "absolute", left: wi * KEY_WIDTH }}
            >
              <PianoKey
                note={note}
                width={KEY_WIDTH}
                active={!!active[note.midi]}
                onDown={(n) => {
                  handleDown(n);
                  scrollToWhiteIndex(wi);
                }}
                onUp={handleUp}
              />
            </div>
          ))}

          {/* black keys */}
          {visibleNotes.map((n, idx) => {
            if (!n.isBlack) return null;

            const whitesBefore = visibleNotes.slice(0, idx).filter(x => !x.isBlack).length - 1;
            const left = whitesBefore * KEY_WIDTH + KEY_WIDTH * 0.66;

            return (
              <div
                key={n.midi}
                style={{ position: "absolute", top: 0, left }}
              >
                <PianoKey
                  note={n}
                  width={KEY_WIDTH}
                  active={!!active[n.midi]}
                  onDown={handleDown}
                  onUp={handleUp}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- TRANSCRIPT ---------------- */}
      <TranscriptMini
        entries={entries}
        onDelete={(id) => remove(id)}
        onPlay={playTranscript}
        onClear={() => {
          clear();
          sessionStartRef.current = null;
        }}
        onDownload={handleDownload}
        onLoad={handleLoad}
        scale={SCALE}
      />

    </div>
  );
}
