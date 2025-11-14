import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playPianoNote, resumeAudioContext } from "@/lib/audioUtils";

const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B", "C2", "D2", "E2", "F2", "G2"];
const BLACK_KEYS = [
  { note: "C#", position: 1 },
  { note: "D#", position: 2 },
  { note: "F#", position: 4 },
  { note: "G#", position: 5 },
  { note: "A#", position: 6 },
  { note: "C#2", position: 8 },
  { note: "D#2", position: 9 }
];

export default function Piano() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    // Resume audio context on first user interaction
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const playNote = (note: string) => {
    setActiveKey(note);
    playPianoNote(note);
    setTimeout(() => setActiveKey(null), 200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative flex justify-center items-end h-64">
        <div className="flex relative">
          {WHITE_KEYS.map((note, index) => (
            <motion.button
              key={note}
              className={`
                relative w-12 h-48 md:w-14 md:h-56 border border-border rounded-b-md
                transition-all duration-100
                ${activeKey === note 
                  ? "bg-primary/30 shadow-lg shadow-primary/50" 
                  : "bg-white dark:bg-card hover-elevate active-elevate-2"
                }
              `}
              onClick={() => playNote(note)}
              whileTap={{ scale: 0.98 }}
              data-testid={`piano-key-${note}`}
            >
              <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                {note}
              </span>
            </motion.button>
          ))}

          {BLACK_KEYS.map(({ note, position }) => (
            <motion.button
              key={note}
              className={`
                absolute w-8 h-32 md:w-10 md:h-36 rounded-b-md
                transition-all duration-100 z-10
                ${activeKey === note 
                  ? "bg-primary shadow-lg shadow-primary/50" 
                  : "bg-foreground hover:bg-foreground/90"
                }
              `}
              style={{ 
                left: `${position * 48 - 16}px`,
                transform: 'translateY(0)'
              }}
              onClick={() => playNote(note)}
              whileTap={{ scale: 0.95 }}
              data-testid={`piano-key-${note}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Click or tap the keys to play notes
        </p>
      </div>
    </div>
  );
}
