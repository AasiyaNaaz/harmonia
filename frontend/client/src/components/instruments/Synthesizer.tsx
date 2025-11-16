import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { playSynthPad, resumeAudioContext } from "@/lib/audioUtils";
import { recordingManager } from "@/lib/recordingManager";

interface SynthPad {
  id: string;
  label: string;
  color: string;
}

const SYNTH_PADS: SynthPad[] = [
  { id: "pad1", label: "Pad 1", color: "bg-cyan-500" },
  { id: "pad2", label: "Pad 2", color: "bg-blue-500" },
  { id: "pad3", label: "Pad 3", color: "bg-purple-500" },
  { id: "pad4", label: "Pad 4", color: "bg-pink-500" },
  { id: "pad5", label: "Pad 5", color: "bg-red-500" },
  { id: "pad6", label: "Pad 6", color: "bg-orange-500" },
  { id: "pad7", label: "Pad 7", color: "bg-yellow-500" },
  { id: "pad8", label: "Pad 8", color: "bg-green-500" }
];

export default function Synthesizer() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [volume, setVolume] = useState([75]);
  const [filter, setFilter] = useState([50]);

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const triggerPad = async (padId: string, index: number) => {
    await resumeAudioContext();
    setActivePad(padId);
    playSynthPad(index);
    recordingManager.recordNote('synth', index);
    setTimeout(() => setActivePad(null), 300);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-muted to-muted/50 rounded-md p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {SYNTH_PADS.map((pad, index) => (
            <motion.button
              key={pad.id}
              className={`
                ${pad.color} aspect-square rounded-md
                flex items-center justify-center
                font-semibold text-white shadow-lg
                transition-all duration-100
                ${activePad === pad.id ? "ring-4 ring-white scale-95" : "hover:scale-105"}
              `}
              onClick={() => triggerPad(pad.id, index)}
              whileTap={{ scale: 0.9 }}
              data-testid={`synth-${pad.id}`}
            >
              {pad.label}
            </motion.button>
          ))}
        </div>

        <div className="space-y-6 bg-card p-6 rounded-md">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">Volume</label>
              <span className="text-sm text-muted-foreground">{volume[0]}%</span>
            </div>
            <Slider 
              value={volume} 
              onValueChange={setVolume}
              max={100}
              step={1}
              data-testid="slider-volume"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">Filter</label>
              <span className="text-sm text-muted-foreground">{filter[0]}%</span>
            </div>
            <Slider 
              value={filter} 
              onValueChange={setFilter}
              max={100}
              step={1}
              data-testid="slider-filter"
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Tap pads to trigger sounds and adjust controls
        </p>
      </div>
    </div>
  );
}
