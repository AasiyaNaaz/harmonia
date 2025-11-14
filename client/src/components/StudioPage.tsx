import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Music, 
  Play, 
  Circle, 
  Repeat, 
  Sparkles, 
  Clock, 
  Layers, 
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Piano from "./instruments/Piano";
import DrumKit from "./instruments/DrumKit";
import Guitar from "./instruments/Guitar";
import Synthesizer from "./instruments/Synthesizer";

type InstrumentType = "piano" | "drums" | "guitar" | "synth";

export default function StudioPage() {
  const [activeInstrument, setActiveInstrument] = useState<InstrumentType>("piano");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const instruments: { id: InstrumentType; name: string; icon: string }[] = [
    { id: "piano", name: "Piano", icon: "🎹" },
    { id: "drums", name: "Drums", icon: "🥁" },
    { id: "guitar", name: "Guitar", icon: "🎸" },
    { id: "synth", name: "Synth", icon: "🎛️" }
  ];

  const controls = [
    { 
      icon: Circle, 
      label: "Record", 
      active: isRecording,
      onClick: () => {
        setIsRecording(!isRecording);
        console.log("Record toggled:", !isRecording);
      }
    },
    { 
      icon: Play, 
      label: "Play", 
      active: isPlaying,
      onClick: () => {
        setIsPlaying(!isPlaying);
        console.log("Play toggled:", !isPlaying);
      }
    },
    { icon: Repeat, label: "Loop", active: false, onClick: () => console.log("Loop clicked") },
    { icon: Sparkles, label: "FX", active: false, onClick: () => console.log("FX clicked") },
    { icon: Clock, label: "Tempo", active: false, onClick: () => console.log("Tempo clicked") },
    { icon: Layers, label: "Tracks", active: false, onClick: () => console.log("Tracks clicked") },
    { icon: Settings, label: "Settings", active: false, onClick: () => console.log("Settings clicked") }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Virtual Studio</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Tap any instrument to learn and play!
          </p>
        </motion.div>

        <div className="grid gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Select Instrument</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {instruments.map((instrument) => (
                <Button
                  key={instrument.id}
                  variant={activeInstrument === instrument.id ? "default" : "outline"}
                  className="h-20 text-lg flex flex-col gap-2"
                  onClick={() => setActiveInstrument(instrument.id)}
                  data-testid={`button-instrument-${instrument.id}`}
                >
                  <span className="text-3xl">{instrument.icon}</span>
                  <span>{instrument.name}</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-8 min-h-[400px] flex items-center justify-center">
            {activeInstrument === "piano" && <Piano />}
            {activeInstrument === "drums" && <DrumKit />}
            {activeInstrument === "guitar" && <Guitar />}
            {activeInstrument === "synth" && <Synthesizer />}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Studio Controls</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {controls.map((control, index) => (
                <Button
                  key={control.label}
                  variant={control.active ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={control.onClick}
                  data-testid={`button-control-${control.label.toLowerCase()}`}
                >
                  <control.icon className="h-4 w-4" />
                  {control.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
