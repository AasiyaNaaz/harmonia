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
  { id: "kick", label: "Kick", color: "bg-red-500", size: "w-32 h-32", position: "bottom-0 left-1/2 -translate-x-1/2", },
  { id: "snare", label: "Snare", color: "bg-blue-500", size: "w-28 h-28", position: "bottom-20 left-1/4", },
  { id: "hihat", label: "Hi-Hat", color: "bg-yellow-500", size: "w-20 h-20", position: "top-4 right-1/4", },
  { id: "tom1", label: "Tom 1", color: "bg-green-500", size: "w-24 h-24", position: "top-8 left-1/3", },
  { id: "tom2", label: "Tom 2", color: "bg-purple-500", size: "w-24 h-24", position: "top-8 right-1/3", },
  { id: "crash", label: "Crash", color: "bg-orange-500", size: "w-20 h-20", position: "top-4 left-1/4", },
  { id: "ride", label: "Ride", color: "bg-pink-500", size: "w-20 h-20", position: "top-4 right-12", }
];

export default function DrumKit() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [kit, setKit] = useState<'acoustic' | 'electronic'>('acoustic');
  const [stickPad, setStickPad] = useState<string | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    const onState = () => {
      setEvents(recordingManager.getCurrentTrack());
      setIsRecording(recordingManager.getIsRecording());
      setIsPlaying(recordingManager.getIsPlaying());
    };
    recordingManager.onStateChange(onState);
    document.addEventListener('click', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  // keyboard mapping for drum pads: Z X C V B N M
  useEffect(() => {
    const keys = ['z','x','c','v','b','n','m'];
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const idx = keys.indexOf(k);
      if (idx !== -1) {
        const pad = DRUM_PADS[idx];
        if (pad) hitDrum(pad.id);
      }
      if (k === 'r') toggleRecording();
      if (k === ' ') { e.preventDefault(); playRecording(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [kit]);

  const hitDrum = async (drumId: string) => {
    await resumeAudioContext();
    setActivePad(drumId);
    // play variant depending on kit
    playDrum(`${kit}:${drumId}`);
    // record object with kit so playback uses same timbre
    recordingManager.recordNote('drums', { id: drumId, kit });
    // stick animation + ripple effect
    setStickPad(drumId);
    setTimeout(() => setStickPad(null), 260);
    setTimeout(() => setActivePad(null), 220);
  };

  const toggleRecording = () => {
    if (recordingManager.getIsRecording()) {
      recordingManager.stopRecording();
    } else {
      recordingManager.startRecording();
    }
    setIsRecording(recordingManager.getIsRecording());
  };

  const playRecording = async () => {
    await resumeAudioContext();
    recordingManager.play();
  };

  const clearRecording = () => {
    recordingManager.clearCurrentTrack();
    setEvents([]);
  };

  const downloadRecording = () => {
    const blob = new Blob([JSON.stringify(recordingManager.getCurrentTrack(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'drum_session.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <style>{`@keyframes stick-hit { 0% { transform: translateY(-6px) rotate(18deg) scaleY(0.9); opacity: 1 } 100% { transform: translateY(12px) rotate(18deg) scaleY(1); opacity: 0.0 } }`}</style>
      <div className="relative h-96 bg-gradient-to-b from-muted/30 to-muted/10 rounded-md p-8">
        {DRUM_PADS.map((drum) => (
          <motion.div key={drum.id} className={`absolute ${drum.position} ${drum.size} flex items-center justify-center`}>
              <div
                onClick={() => hitDrum(drum.id)}
                role="button"
                aria-label={drum.label}
                className={`relative w-full h-full cursor-pointer select-none ${activePad === drum.id ? 'scale-105' : ''}`}
              >
                {/* rim */}
                <div className={`absolute inset-0 rounded-full ${drum.color} shadow-lg ring-1 ring-black/30`} style={{ transform: 'translateZ(0)' }} />
                {/* head */}
                <div className="absolute inset-3 rounded-full bg-white/90 flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs md:text-sm font-semibold text-black">{drum.label}</span>
                    <span className="text-lg md:text-2xl font-extrabold tracking-wide text-black">{['Z','X','C','V','B','N','M'][DRUM_PADS.findIndex(p=>p.id===drum.id)]}</span>
                  </div>
                  {/* ripple */}
                  {activePad === drum.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2/3 h-2/3 rounded-full bg-white/40 animate-pulse" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }} />
                    </div>
                  )}
                  {/* stick hit animation */}
                  {stickPad === drum.id && (
                    <div className="absolute inset-0 pointer-events-none flex items-start justify-center">
                      <div style={{ width: '6px', height: '48px', background: 'linear-gradient(45deg,#6b4a2a,#2b1f12)', borderRadius: '4px', transform: 'rotate(18deg)', animation: 'stick-hit 220ms ease-out' }} />
                    </div>
                  )}
                </div>
              </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <button onClick={toggleRecording} className={`px-3 py-1 rounded-md ${isRecording ? 'bg-red-600 text-black' : 'bg-white/10 text-black'}`}>{isRecording ? 'Stop' : 'Record'}</button>
            <button onClick={playRecording} className="px-3 py-1 rounded-md bg-primary/30 text-black" disabled={!recordingManager.hasRecording()}>Play</button>
            <button onClick={clearRecording} className="px-3 py-1 rounded-md bg-destructive/10 text-black">Clear</button>
            <button onClick={downloadRecording} className="px-3 py-1 rounded-md bg-white/10 text-black" disabled={!recordingManager.hasRecording()}>Download</button>
            <select value={kit} onChange={(e) => setKit(e.target.value as any)} className="bg-white/6 text-sm rounded px-2 py-1 text-black">
              <option value="acoustic">Acoustic Kit</option>
              <option value="electronic">Electronic Kit</option>
            </select>
          </div>

          <p className="text-sm text-muted-foreground">Click or tap each drum to hear its unique sound</p>

          <div className="mt-4 text-left">
            <h4 className="text-sm font-semibold">Transcript</h4>
            <div className="max-h-40 overflow-y-auto text-xs space-y-1 mt-2">
              {events.length === 0 ? <div className="text-white/60">No drum events yet. Record to capture hits.</div> : (
                events.map((ev, i) => (
                  <div key={i} className="flex justify-between bg-white/5 p-1 rounded">
                    <div>{new Date(ev.timestamp + Date.now() - ev.timestamp).toLocaleTimeString()} • {String(ev.data)}</div>
                    <div className="text-white/60">{(ev.timestamp / 1000).toFixed(2)}s</div>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
