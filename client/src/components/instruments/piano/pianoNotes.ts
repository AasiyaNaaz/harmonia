// pianoNotes.ts
export type PianoNote = {
  midi: number;
  name: string; // e.g. C4, C#4
  freq: number;
  isBlack: boolean;
  octave: number;
};

// A4 = midi 69 = 440Hz
const A4_MIDI = 69;
const A4_FREQ = 440;
function midiToFreq(m: number) {
  return A4_FREQ * Math.pow(2, (m - A4_MIDI) / 12);
}

const startMidi = 21; // A0
const endMidi = 108; // C8
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const PIANO_NOTES: PianoNote[] = Array.from({ length: endMidi - startMidi + 1 }, (_, i) => {
  const midi = startMidi + i;
  const raw = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return {
    midi,
    name: `${raw}${octave}`,
    freq: midiToFreq(midi),
    isBlack: raw.includes("#"),
    octave,
  };
});
