// src/components/instruments/GuitarGaragePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Self-contained GuitarGaragePage
 * - Own WebAudio-based guitar sound (no external engine)
 * - Built-in RecordingManager used for transcript, play, download, load
 * - UI styled for dark mode and visible strings
 */

/* ----------------------- Built-in Audio Engine ----------------------- */
class LocalGuitarEngine {
  private static ctx: AudioContext | null = null;
  static masterGain: GainNode | null = null;
  static reverbWet = 0;
  static volume = 0.8;

  private static ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  static async resume() {
    this.ensure();
    if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
  }

  static setVolume(v: number) {
    this.ensure();
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.setValueAtTime(v, this.ctx!.currentTime);
  }

  static setReverbWet(v: number) {
    this.reverbWet = v;
    // (placeholder: no convolution reverb node implemented to keep this file self-contained)
    // Reverb UI will show effect but this simple engine doesn't include a convolution reverb.
  }

  // play a plucked-string note with frequency (Hz)
  static playPluck(id: string, frequency: number, style: "acoustic" | "electric" | "distorted" = "acoustic", duration = 2) {
    this.ensure();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // small noise attack (pick)
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.02), this.ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx!.sampleRate * 0.02));

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = style === "acoustic" ? 1200 : 2500;
    noiseSrc.connect(noiseFilter);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(style === "distorted" ? 0.65 : 0.35, now);
    noiseFilter.connect(noiseGain);

    // main harmonic oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    const g3 = this.ctx.createGain();

    // choose waveform & gains by style
    if (style === "acoustic") {
      osc1.type = "triangle";
      osc2.type = "sine";
      osc3.type = "sine";
      g1.gain.value = 0.6;
      g2.gain.value = 0.12;
      g3.gain.value = 0.06;
    } else if (style === "electric") {
      osc1.type = "sawtooth";
      osc2.type = "square";
      osc3.type = "sine";
      g1.gain.value = 0.55;
      g2.gain.value = 0.18;
      g3.gain.value = 0.08;
    } else {
      // distorted/clean variants
      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc3.type = "square";
      g1.gain.value = 0.6;
      g2.gain.value = 0.22;
      g3.gain.value = 0.10;
    }

    osc1.frequency.setValueAtTime(frequency, now);
    osc2.frequency.setValueAtTime(frequency * 2, now);
    osc3.frequency.setValueAtTime(frequency * 3, now);

    // detune for warmth
    try { osc2.detune.setValueAtTime(6, now); osc3.detune.setValueAtTime(-5, now); } catch { /* Safari safe */ }

    // sum
    const sum = this.ctx.createGain();
    g1.connect(sum);
    g2.connect(sum);
    g3.connect(sum);

    // body filter
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = style === "distorted" ? 6000 : style === "electric" ? 5000 : 4800;
    bodyFilter.Q.value = 1;

    // master chain
    noiseGain.connect(bodyFilter);
    sum.connect(bodyFilter);

    const outGain = this.ctx.createGain();
    bodyFilter.connect(outGain);
    outGain.connect(this.masterGain);

    // envelope
    const attack = 0.005;
    const decay = style === "distorted" ? 1.4 : 1.8;
    const sustain = 0.02;

    outGain.gain.setValueAtTime(0.0001, now);
    outGain.gain.linearRampToValueAtTime(1.0, now + attack);
    outGain.gain.exponentialRampToValueAtTime(sustain, now + decay);

    // connect oscillators
    osc1.connect(g1); osc2.connect(g2); osc3.connect(g3);
    g1.connect(sum); g2.connect(sum); g3.connect(sum);

    // start nodes
    noiseSrc.start(now);
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    // stop after duration (decay-based)
    const stopTime = now + Math.max(0.3, duration);
    noiseSrc.stop(now + 0.03);
    try { osc1.stop(stopTime); osc2.stop(stopTime); osc3.stop(stopTime); } catch {}

    // return a function to force-stop early if needed
    return () => {
      try { osc1.stop(); osc2.stop(); osc3.stop(); } catch {}
      try { noiseSrc.stop(); } catch {}
    };
  }
}

/* ----------------------- Built-in Recording Manager ----------------------- */
type RecEvent = {
  id: string;
  stringIndex: number;
  noteName: string;
  start: number; // seconds relative to session
  duration: number; // seconds
  style: "acoustic" | "electric" | "distorted";
};

class LocalRecordingManager {
  private events: RecEvent[] = [];
  private sessionStart: number | null = null;
  private isRecording = false;
  private isPlaying = false;
  private listeners: (() => void)[] = [];

  startRecording() {
    this.sessionStart = performance.now() / 1000;
    this.isRecording = true;
    this.notify();
  }
  stopRecording() {
    this.isRecording = false;
    this.notify();
  }
  recordNote(payload: Omit<RecEvent, "id" | "start"> & { rawStart?: number }) {
    const now = performance.now() / 1000;
    const start = payload.rawStart ?? now;
    if (this.sessionStart === null) this.sessionStart = start;
    const entry: RecEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      stringIndex: payload.stringIndex,
      noteName: payload.noteName,
      start: start - (this.sessionStart ?? start),
      duration: payload.duration,
      style: payload.style,
    };
    this.events.push(entry);
    this.notify();
  }
  clear() {
    this.events = [];
    this.sessionStart = null;
    this.isPlaying = false;
    this.isRecording = false;
    this.notify();
  }
  getEvents() {
    return [...this.events];
  }
  onStateChange(cb: () => void) {
    this.listeners.push(cb);
  }
  notify() {
    this.listeners.forEach((f) => f());
  }

  async play(onPlayEvent?: (e: RecEvent) => void, onDone?: () => void) {
    if (this.events.length === 0) return;
    this.isPlaying = true;
    const snap = [...this.events];
    const base = Math.min(...snap.map((e) => e.start));
    const timers: number[] = [];
    snap.forEach((e) => {
      const delay = Math.max(0, e.start - base) * 1000;
      const t = window.setTimeout(() => {
        onPlayEvent?.(e);
      }, delay);
      timers.push(t);
    });
    // set stop after last event + its duration
    const last = Math.max(...snap.map((e) => e.start + e.duration));
    const endTimer = window.setTimeout(() => {
      this.isPlaying = false;
      this.notify();
      onDone?.();
      timers.forEach(clearTimeout);
    }, (last - base) * 1000 + 200);
    timers.push(endTimer);
    this.notify();
  }
}

/* ----------------------- Strings + UI types ----------------------- */
const STRINGS_META = [
  { name: "E2", freq: 82.41 },
  { name: "A2", freq: 110.0 },
  { name: "D3", freq: 146.83 },
  { name: "G3", freq: 196.0 },
  { name: "B3", freq: 246.94 },
  { name: "E4", freq: 329.63 },
];

export default function GuitarGaragePage(): JSX.Element {
  const [activeSet, setActiveSet] = useState<Set<number>>(new Set());
  const [style, setStyle] = useState<"acoustic" | "electric" | "distorted">("acoustic");
  const [volume, setVolume] = useState(0.8);
  const [reverb, setReverb] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState<RecEvent[]>([]);
  const rm = useRef(new LocalRecordingManager()).current;
  const engine = LocalGuitarEngine;

  // session hold start times (ms)
  const holdStart = useRef<Record<number, number>>({});
  const sessionStart = useRef<number | null>(null);

  useEffect(() => {
    // wire manager listener
    rm.onStateChange(() => {
      setEvents(rm.getEvents());
      // reflect recording/playing flags if needed (local manager not exposing them directly)
    });
  }, [rm]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    engine.setReverbWet(reverb);
  }, [reverb]);

  // resume audio on first interaction
  useEffect(() => {
    const unlock = async () => {
      await engine.resume();
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, []);

  // keyboard shortcuts: A S D F G H (A = high E, H = low E)
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 5, s: 4, d: 3, f: 2, g: 1, h: 0,
      A: 5, S: 4, D: 3, F: 2, G: 1, H: 0,
    };
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (k in keyMap) {
        const idx = keyMap[k as keyof typeof keyMap];
        // avoid repeat firing
        setActiveSet((s) => {
          if (s.has(idx)) return s;
          pluckDown(idx);
          return new Set([...Array.from(s), idx]);
        });
      }
      if (k === "r" || k === "R") toggleRecording();
      if (k === " " || k === "Spacebar") {
        e.preventDefault();
        if (!isPlaying) playAll(); else setIsPlaying(false);
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k in keyMap) {
        const idx = keyMap[k as keyof typeof keyMap];
        pluckUp(idx);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [isPlaying, isRecording, events, style, volume, reverb]);

  // pluck handling
  const pluckDown = (i: number) => {
    // visual active
    setActiveSet((s) => new Set([...Array.from(s), i]));
    holdStart.current[i] = performance.now();
    if (sessionStart.current === null) sessionStart.current = performance.now() / 1000;

    // actual sound
    engine.playPluck(`s${i}`, STRINGS_META[i].freq, style, 2);
  };

  const pluckUp = (i: number) => {
    const nowMs = performance.now();
    const startMs = holdStart.current[i] ?? nowMs;
    const durationSec = Math.max(0.05, (nowMs - startMs) / 1000);
    const startSec = (startMs / 1000) - (sessionStart.current ?? startMs / 1000);

    // stop isn't necessary because node stops after envelope; kept for API completeness
    engine.setVolume(volume); // ensure gain
    // record to manager
    rm.recordNote({
      stringIndex: i,
      noteName: STRINGS_META[i].name,
      duration: durationSec,
      style,
      rawStart: startMs / 1000,
    } as any);

    // visual clear
    setTimeout(() => {
      setActiveSet((s) => {
        const n = new Set(s);
        n.delete(i);
        return n;
      });
    }, 180);

    delete holdStart.current[i];
  };

  // recording controls
  const toggleRecording = () => {
    if (isRecording) {
      rm.stopRecording();
      setIsRecording(false);
    } else {
      rm.startRecording();
      setIsRecording(true);
    }
  };

  // play via manager + call engine when events trigger
  const playAll = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const onPlayEvent = (e: RecEvent) => {
      // visual & sound
      setActiveSet((s) => new Set([...Array.from(s), e.stringIndex]));
      engine.playPluck(`r${e.id}`, STRINGS_META[e.stringIndex].freq, e.style, e.duration);
      setTimeout(() => {
        setActiveSet((s) => {
          const n = new Set(s);
          n.delete(e.stringIndex);
          return n;
        });
      }, (e.duration * 1000) + 50);
    };
    rm.play(onPlayEvent, () => setIsPlaying(false));
  };

  const clearAll = () => {
    rm.clear();
    setEvents([]);
    setIsRecording(false);
    setIsPlaying(false);
    sessionStart.current = null;
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "guitar_session.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadJSON = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (Array.isArray(json)) {
          // basic validation
          const mapped = json.map((x) => ({
            id: x.id ?? `${Date.now()}-${Math.random()}`,
            stringIndex: Number(x.stringIndex),
            noteName: String(x.noteName),
            start: Number(x.start),
            duration: Number(x.duration),
            style: x.style ?? "acoustic",
          })) as RecEvent[];
          // replace manager events directly
          rm.clear();
          mapped.forEach((m) => {
            // we emulate rawStart so recording manager computes start relative to session
            rm.recordNote({ stringIndex: m.stringIndex, noteName: m.noteName, duration: m.duration, style: m.style, rawStart: (sessionStart.current ?? (performance.now()/1000)) + m.start } as any);
          });
          setEvents(rm.getEvents());
        }
      } catch (err) {
        console.error("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  // file input for load
  const fileRef = useRef<HTMLInputElement | null>(null);
  const handleLoadClick = () => {
    if (!fileRef.current) {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "application/json, .json";
      inp.onchange = (e: any) => {
        const f = e.target.files?.[0];
        loadJSON(f);
      };
      fileRef.current = inp;
    }
    fileRef.current.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 text-white">
      {/* Top controls: left(record) center(volume) right(help/download/load) */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`px-3 py-1 rounded-md font-semibold ${isRecording ? "bg-red-600 text-black" : "bg-white/10 text-white"}`}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>

          <button
            onClick={() => { if (!isPlaying) playAll(); }}
            className={`px-3 py-1 rounded-md font-medium ${isPlaying ? "bg-primary/30 text-black" : "bg-white/10 text-white"}`}
            disabled={events.length === 0}
          >
            {isPlaying ? "Playing..." : "Play"}
          </button>

          <button onClick={clearAll} className="px-2 py-1 rounded-md bg-destructive/10 text-white">Clear</button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs opacity-80">Vol</label>
          <input value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} type="range" min={0} max={1} step={0.01} className="w-40" />

          <label className="text-xs opacity-80">Reverb</label>
          <input value={reverb} onChange={(e) => setReverb(parseFloat(e.target.value))} type="range" min={0} max={1} step={0.01} className="w-40" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/6 px-2 py-1 rounded-full">
            <span className="text-xs">Style</span>
            {(["acoustic", "electric", "distorted"] as const).map((s) => (
              <button key={s} onClick={() => setStyle(s)} className={`px-2 py-1 rounded text-xs font-medium ${style === s ? "bg-white text-black" : "text-white/90"}`}>{s[0].toUpperCase() + s.slice(1)}</button>
            ))}
          </div>

          <button onClick={downloadJSON} className="px-3 py-1 rounded-md bg-white/10" disabled={events.length === 0}>Download</button>
        </div>
      </div>

      {/* Guitar visual area */}
      <div className="bg-gradient-to-b from-slate-900 to-black rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="relative max-w-full mx-auto">
          {/* fret markers */}
          <div className="absolute top-4 left-8 flex gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-0.5 h-8 bg-white/10" />
            ))}
          </div>

          <div className="space-y-5">
            {STRINGS_META.map((s, idx) => {
              const isActive = activeSet.has(idx);
              // thickness visual
              const thickness = idx === 0 ? "h-2" : idx === 1 ? "h-1.5" : idx === 4 ? "h-0.6" : "h-1";
              return (
                <div key={s.name} className="relative">
                  <motion.button
                    onMouseDown={() => pluckDown(idx)}
                    onMouseUp={() => pluckUp(idx)}
                    onTouchStart={() => pluckDown(idx)}
                    onTouchEnd={() => pluckUp(idx)}
                    whileTap={{ scaleY: 1.6 }}
                    className={`w-full ${thickness} rounded-full bg-gradient-to-r from-white/10 to-white/6 hover:from-white/20 hover:to-white/12 transition overflow-hidden cursor-pointer relative`}
                    style={{ border: isActive ? "1px solid rgba(255,255,255,0.18)" : undefined }}
                  >
                    {/* pick highlight */}
                    {isActive && (
                      <motion.div className="absolute inset-0 bg-white/20" initial={{ opacity: 0 }} animate={{ opacity: [0.6, 0.2, 0.6] }} transition={{ duration: 0.35, repeat: 1 }} />
                    )}
                  </motion.button>

                  <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-sm text-white/90 font-semibold">{s.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transcript panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm shadow-inner text-white">
          <h2 className="text-lg font-bold mb-3">Live Transcript</h2>
          <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
            {events.length === 0 ? (
              <div className="text-white/60">Play strings to see events here. While recording, events are captured with timestamps.</div>
            ) : (
              events.slice().reverse().map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ev.noteName} • {ev.style}</div>
                    <div className="text-xs text-white/60">string {ev.stringIndex} • {ev.duration.toFixed(2)}s</div>
                  </div>
                  <div className="text-xs text-white/60">{(ev.start).toFixed(2)}s</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={playAll} className="px-3 py-1 rounded-md bg-primary/30 text-black">Play Transcript</button>
            <button onClick={() => { rm.clear(); setEvents([]); }} className="px-3 py-1 rounded-md bg-destructive/10">Clear Transcript</button>
            <button onClick={downloadJSON} className="px-3 py-1 rounded-md bg-white/10">Download JSON</button>
            <button onClick={handleLoadClick} className="px-3 py-1 rounded-md bg-white/10">Load JSON</button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm shadow-inner text-white">
          <h3 className="text-md font-semibold mb-2">How to play</h3>
          <p className="text-sm text-white/80">
            • Tap or click strings to pluck. Multiple strings can be plucked in quick succession.<br/>
            • Keyboard shortcuts: <strong>A S D F G H</strong> — A = high E (top string), H = low E (bottom string).<br/>
            • Press <strong>Record</strong> to start capturing events; press again to stop. Use Play to replay recorded events.<br/>
            • Download saves the recorded JSON; use the Download button in the transcript panel.
          </p>
        </div>
      </div>
    </div>
  );
}
