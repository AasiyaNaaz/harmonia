import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playGuitarString, resumeAudioContext } from "@/lib/audioUtils";

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

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const pluckString = (index: number, note: string) => {
    setActiveString(index);
    playGuitarString(index);
    setTimeout(() => setActiveString(null), 300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-amber-800 to-amber-950 rounded-md p-8 md:p-12">
        <div className="space-y-8 md:space-y-12">
          {STRINGS.map((string, index) => (
            <div key={index} className="relative">
              <motion.button
                className={`
                  w-full ${string.thickness} bg-foreground/60 rounded-full
                  relative overflow-hidden cursor-pointer
                  transition-all duration-100
                  hover:bg-foreground/80
                `}
                onClick={() => pluckString(index, string.note)}
                whileTap={{ scaleY: 1.5 }}
                animate={activeString === index ? {
                  scaleX: [1, 1.02, 0.98, 1],
                  transition: { 
                    duration: 0.3,
                    repeat: 2,
                    ease: "easeInOut"
                  }
                } : {}}
                data-testid={`guitar-string-${index}`}
              >
                {activeString === index && (
                  <motion.div
                    className="absolute inset-0 bg-primary/50"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
              
              <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-white/60 font-semibold">
                {string.note}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-foreground/20" />
        <div className="absolute top-0 left-2/4 w-0.5 h-full bg-foreground/20" />
        <div className="absolute top-0 left-3/4 w-0.5 h-full bg-foreground/20" />
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Click or tap the strings to strum the guitar
        </p>
      </div>
    </div>
  );
}
