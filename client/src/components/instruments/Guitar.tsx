import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playGuitarString, resumeAudioContext, playTestTone } from "@/lib/audioUtils";
import { recordingManager } from "@/lib/recordingManager";

const STRINGS = [
  { note: "E", thickness: "h-1" },
  { note: "B", thickness: "h-0.5" },
  { note: "G", thickness: "h-0.5" },
  { note: "D", thickness: "h-1" },
  { note: "A", thickness: "h-1.5" },
  { note: "E", thickness: "h-2" }
];

export default function Guitar() {
  const [activeString, setActiveString] = useState<number | null>(null);
  // default style and octave to integrate with new API; can be changed globally later
  const [style, setStyle] = useState<'acoustic'|'electric'|'clean'|'distorted'>('acoustic');
  const [octave, setOctave] = useState<number>(0);

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const pluckString = async (index: number, note: string) => {
    // Ensure audio context is resumed on actual user interaction
    await resumeAudioContext();
    setActiveString(index);

    // Use the unified audio API: pass an input object and opts so recorded playback will match
    playGuitarString({ stringIndex: index }, { style, octave });
    // Record with structured event data so playback re-creates the timbre/octave
    recordingManager.recordNote('guitar', { stringIndex: index, style, octave });

    setTimeout(() => setActiveString(null), 350);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-amber-100 to-amber-50 rounded-md p-8 md:p-12">
        <div className="space-y-6 md:space-y-8">
          {STRINGS.map((string, index) => (
            <div key={index} className="relative">
              <motion.button
                className={`w-full ${string.thickness} bg-slate-300 rounded-full relative overflow-hidden cursor-pointer transition-all duration-100 hover:bg-slate-400`}
                onClick={() => pluckString(index, string.note)}
                whileTap={{ scaleY: 1.4 }}
                animate={activeString === index ? {
                  scaleX: [1, 1.02, 0.98, 1],
                  transition: { duration: 0.28, repeat: 1, ease: 'easeInOut' }
                } : {}}
                data-testid={`guitar-string-${index}`}
              >
                {activeString === index && (
                  <motion.div className="absolute inset-0 bg-amber-200/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
                )}
              </motion.button>

              <span className="absolute -left-10 top-1/2 -translate-y-1/2 text-xs text-slate-700 font-semibold">
                {string.note}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-slate-200/60" />
        <div className="absolute top-0 left-2/4 w-0.5 h-full bg-slate-200/60" />
        <div className="absolute top-0 left-3/4 w-0.5 h-full bg-slate-200/60" />
      </div>

      {/* Readable instructions below the guitar (not white) */}
      <div className="mt-5 text-center">
        <p className="text-sm text-slate-700 dark:text-slate-200">Tap or click the strings to play. You can strum multiple strings quickly for chords.</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Recorded playback requires enabling audio (press Enable sound). The Learn button keeps the previous behaviour.</p>
      </div>

      {/* Bottom toolbar with controls (moved out of the string area) */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={async () => { await resumeAudioContext(); playTestTone(); }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 text-black font-semibold shadow-md hover:scale-105 transition"
        >
          Enable sound
        </button>

        <button
          onClick={() => { window.location.href = '/learn'; }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold shadow-md hover:translate-y-[-2px] transition-transform"
        >
          Learn
        </button>
      </div>
    </div>
  );
}

