import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Music, 
  Play, 
  Circle, 
  Repeat, 
  Sparkles, 
  Clock, 
  Trash2, 
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Piano from "@/components/instruments/Piano";
import DrumKit from "@/components/instruments/DrumKit";
import Guitar from "@/components/instruments/Guitar";
import Synthesizer from "@/components/instruments/Synthesizer";
import { recordingManager } from "@/lib/recordingManager";
import { useToast } from "@/hooks/use-toast";

type InstrumentType = "piano" | "drums" | "guitar" | "synth";

export default function StudioPage() {
  const [activeInstrument, setActiveInstrument] = useState<InstrumentType>("piano");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [showTempoDialog, setShowTempoDialog] = useState(false);
  const [showFXDialog, setShowFXDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateState = () => {
      setIsRecording(recordingManager.getIsRecording());
      setIsPlaying(recordingManager.getIsPlaying());
      setIsLooping(recordingManager.getIsLooping());
    };
    
    recordingManager.onStateChange(updateState);
    updateState(); // Initial state
  }, []);

  const instruments: { id: InstrumentType; name: string; icon: string }[] = [
    { id: "piano", name: "Piano", icon: "🎹" },
    { id: "drums", name: "Drums", icon: "🥁" },
    { id: "guitar", name: "Guitar", icon: "🎸" },
    { id: "synth", name: "Synth", icon: "🎛️" }
  ];

  const handleRecord = () => {
    if (isRecording) {
      recordingManager.stopRecording();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your performance has been saved."
      });
    } else {
      recordingManager.startRecording();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Play your instrument to record."
      });
    }
  };

  const handlePlay = () => {
    if (!recordingManager.hasRecording()) {
      toast({
        title: "No recording",
        description: "Record something first before playing.",
        variant: "destructive"
      });
      return;
    }
    
    if (isPlaying) {
      recordingManager.stop();
      setIsPlaying(false);
    } else {
      recordingManager.play();
      setIsPlaying(true);
    }
  };

  const handleLoop = () => {
    const looping = recordingManager.toggleLoop();
    setIsLooping(looping);
    toast({
      title: looping ? "Loop enabled" : "Loop disabled",
      description: looping ? "Recording will repeat when you press Play." : "Recording will play once."
    });
  };

  const handleClear = () => {
    recordingManager.clearCurrentTrack();
    setIsRecording(false);
    setIsPlaying(false);
    toast({
      title: "Recording cleared",
      description: "All notes have been removed."
    });
  };

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0];
    setTempo(newTempo);
    recordingManager.setTempo(newTempo);
    toast({
      title: "Tempo updated",
      description: `Playback speed set to ${newTempo} BPM`
    });
  };

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
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Studio Controls</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={isRecording ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={handleRecord}
                data-testid="button-control-record"
              >
                <Circle className={`h-4 w-4 ${isRecording ? "fill-current" : ""}`} />
                {isRecording ? "Stop Recording" : "Record"}
              </Button>
              
              <Button
                variant={isPlaying ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={handlePlay}
                data-testid="button-control-play"
                disabled={!recordingManager.hasRecording()}
              >
                {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Stop" : "Play"}
              </Button>
              
              <Button
                variant={isLooping ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={handleLoop}
                data-testid="button-control-loop"
              >
                <Repeat className="h-4 w-4" />
                Loop
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowTempoDialog(true)}
                data-testid="button-control-tempo"
                disabled={isPlaying}
              >
                <Clock className="h-4 w-4" />
                Tempo ({tempo} BPM)
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFXDialog(true)}
                data-testid="button-control-fx"
              >
                <Sparkles className="h-4 w-4" />
                FX
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleClear}
                data-testid="button-control-clear"
                disabled={!recordingManager.hasRecording()}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </Card>
        </div>

        <Dialog open={showTempoDialog} onOpenChange={setShowTempoDialog}>
          <DialogContent data-testid="dialog-tempo">
            <DialogHeader>
              <DialogTitle>Adjust Tempo</DialogTitle>
              <DialogDescription>
                Change the playback speed (40-240 BPM)
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Tempo</span>
                <span className="text-2xl font-bold">{tempo} BPM</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={handleTempoChange}
                min={40}
                max={240}
                step={1}
                data-testid="slider-tempo"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showFXDialog} onOpenChange={setShowFXDialog}>
          <DialogContent data-testid="dialog-fx">
            <DialogHeader>
              <DialogTitle>Audio Effects</DialogTitle>
              <DialogDescription>
                Add effects to your recording (Coming soon!)
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                Audio effects like reverb, delay, and distortion will be available in a future update.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
