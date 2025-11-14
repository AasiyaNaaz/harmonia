import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playDrum, resumeAudioContext } from "@/lib/audioUtils";
import { recordingManager } from "@/lib/recordingManager";

interface DrumPad {
  id: string;
  label: string;
  color: string;
  size: string;
  position: string;
}

const DRUM_PADS: DrumPad[] = [
  { id: "kick", label: "Kick", color: "bg-red-500", size: "w-32 h-32", position: "bottom-0 left-1/2 -translate-x-1/2" },
  { id: "snare", label: "Snare", color: "bg-blue-500", size: "w-28 h-28", position: "bottom-20 left-1/4" },
  { id: "hihat", label: "Hi-Hat", color: "bg-yellow-500", size: "w-20 h-20", position: "top-4 right-1/4" },
  { id: "tom1", label: "Tom 1", color: "bg-green-500", size: "w-24 h-24", position: "top-8 left-1/3" },
  { id: "tom2", label: "Tom 2", color: "bg-purple-500", size: "w-24 h-24", position: "top-8 right-1/3" },
  { id: "crash", label: "Crash", color: "bg-orange-500", size: "w-20 h-20", position: "top-4 left-1/4" },
  { id: "ride", label: "Ride", color: "bg-pink-500", size: "w-20 h-20", position: "top-4 right-12" }
];

export default function DrumKit() {
  const [activePad, setActivePad] = useState<string | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const hitDrum = async (drumId: string) => {
    await resumeAudioContext();
    setActivePad(drumId);
    playDrum(drumId);
    recordingManager.recordNote('drums', drumId);
    setTimeout(() => setActivePad(null), 200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative h-96 bg-gradient-to-b from-muted/30 to-muted/10 rounded-md p-8">
        {DRUM_PADS.map((drum) => (
          <motion.button
            key={drum.id}
            className={`
              absolute ${drum.size} ${drum.color} rounded-full
              ${drum.position}
              flex items-center justify-center
              font-semibold text-white shadow-lg
              transition-all duration-100
              hover:scale-105
              ${activePad === drum.id ? "ring-4 ring-white ring-offset-2" : ""}
            `}
            onClick={() => hitDrum(drum.id)}
            whileTap={{ scale: 0.9 }}
            animate={activePad === drum.id ? {
              scale: [1, 1.1, 0.95, 1],
              transition: { duration: 0.2 }
            } : {}}
            data-testid={`drum-${drum.id}`}
          >
            <span className="text-xs md:text-sm drop-shadow-md">
              {drum.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Click or tap each drum to hear its unique sound
        </p>
      </div>
    </div>
  );
}
