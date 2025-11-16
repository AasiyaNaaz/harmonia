// Audio utility functions using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Piano note frequencies (C4 through B5)
const pianoFrequencies: { [key: string]: number } = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
  'C2': 523.25,
  'C#2': 554.37,
  'D2': 587.33,
  'D#2': 622.25,
  'E2': 659.25,
  'F2': 698.46,
  'G2': 783.99
};

export const playPianoNote = (note: string, duration: number = 0.5) => {
  const ctx = getAudioContext();
  const frequency = pianoFrequencies[note] || 440;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // ADSR envelope for piano-like sound
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + duration * 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const playDrum = (drumTypeOrObj: string | { id: string; kit?: string }) => {
  const ctx = getAudioContext();

  // Normalize input to { id, kit }
  let id: string;
  let kit: string = 'acoustic';
  if (typeof drumTypeOrObj === 'string') {
    const s = drumTypeOrObj.split(":");
    if (s.length === 2) {
      kit = s[0] || 'acoustic';
      id = s[1];
    } else {
      id = drumTypeOrObj;
    }
  } else {
    id = drumTypeOrObj.id;
    kit = drumTypeOrObj.kit || kit;
  }

  // kit-specific params
  const isElectronic = kit === 'electronic';

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // small helper to schedule oscillator-based drum
  const scheduleOscDrum = (startFreq: number, dur = 0.5, gain = 0.8) => {
    oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    gainNode.gain.setValueAtTime(isElectronic ? gain * 0.8 : gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + dur + 0.05);
  };

  switch (id) {
    case 'kick':
      // Deep punch — electronic shorter and brighter, acoustic longer
      scheduleOscDrum(isElectronic ? 80 : 120, isElectronic ? 0.35 : 0.6, isElectronic ? 0.9 : 1.0);
      break;

    case 'snare':
      // Snare uses noise burst + body oscillator
      {
        const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * (isElectronic ? 0.06 : 0.12)), ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(isElectronic ? 0.25 : 0.6, ctx.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isElectronic ? 0.12 : 0.25));
        noise.connect(ng);
        ng.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + (isElectronic ? 0.12 : 0.25));

        // body click
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = isElectronic ? 'square' : 'triangle';
        bodyOsc.frequency.setValueAtTime(isElectronic ? 220 : 180, ctx.currentTime);
        bodyGain.gain.setValueAtTime(isElectronic ? 0.05 : 0.15, ctx.currentTime);
        bodyGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isElectronic ? 0.18 : 0.28));
        bodyOsc.connect(bodyGain); bodyGain.connect(ctx.destination);
        bodyOsc.start(ctx.currentTime); bodyOsc.stop(ctx.currentTime + (isElectronic ? 0.18 : 0.28));
      }
      break;

    case 'hihat':
    case 'crash':
    case 'ride':
      // Cymbals — noise with highpass
      {
        const len = Math.floor(ctx.sampleRate * (id === 'hihat' ? 0.08 : 0.5));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = isElectronic ? 6000 : 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(isElectronic ? 0.2 : (id === 'hihat' ? 0.3 : 0.5), ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (id === 'hihat' ? 0.08 : 0.8));
        src.connect(hp); hp.connect(g); g.connect(ctx.destination);
        src.start(ctx.currentTime); src.stop(ctx.currentTime + (id === 'hihat' ? 0.08 : 0.8));
      }
      break;

    case 'tom1':
    case 'tom2':
      {
        const freq = id === 'tom1' ? (isElectronic ? 230 : 200) : (isElectronic ? 180 : 150);
        scheduleOscDrum(freq, isElectronic ? 0.28 : 0.4, isElectronic ? 0.7 : 0.8);
      }
      break;

    default:
      scheduleOscDrum(200, 0.3, 0.6);
  }
};

export type GuitarPlayInput =
  | number
  | { stringIndex: number; semitoneOffset?: number; frequency?: number };

export const playGuitarString = (
  input: GuitarPlayInput,
  opts?: { style?: 'acoustic' | 'electric' | 'clean' | 'distorted'; octave?: number; ctx?: AudioContext }
) => {
  const ctx = opts?.ctx || getAudioContext();
  const baseFrequencies = [82.41, 110, 146.83, 196, 246.94, 329.63]; // E A D G B E

  let frequency = 440;

  if (typeof input === 'number') {
    frequency = baseFrequencies[input] || 440;
  } else if (typeof input === 'object') {
    if (input.frequency) {
      frequency = input.frequency;
    } else {
      const base = baseFrequencies[input.stringIndex] || 440;
      const semitones = input.semitoneOffset || 0;
      frequency = base * Math.pow(2, semitones / 12);
    }
  }

  const octave = opts?.octave || 0;
  frequency = frequency * Math.pow(2, octave);

  // Create a plucked-string-like sound: a short noise attack + fundamental oscillator with harmonic content
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Choose character based on style
  const style = opts?.style || 'acoustic';

  // Attack click (pick) using noise burst
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = style === 'acoustic' ? 1200 : 2500;
  noiseSource.connect(noiseFilter);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(style === 'distorted' ? 0.6 : 0.3, ctx.currentTime);
  noiseFilter.connect(noiseGain);

  // Main oscillator(s)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();

  // Configure waveforms per style
  if (style === 'acoustic') {
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sine';
    gain1.gain.value = 0.6;
    gain2.gain.value = 0.15;
    gain3.gain.value = 0.08;
  } else if (style === 'electric') {
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc3.type = 'sine';
    gain1.gain.value = 0.55;
    gain2.gain.value = 0.2;
    gain3.gain.value = 0.08;
  } else if (style === 'distorted') {
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc3.type = 'square';
    gain1.gain.value = 0.6;
    gain2.gain.value = 0.25;
    gain3.gain.value = 0.12;
  } else {
    // clean
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'triangle';
    gain1.gain.value = 0.65;
    gain2.gain.value = 0.18;
    gain3.gain.value = 0.06;
  }

  osc1.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
  osc3.frequency.setValueAtTime(frequency * 3, ctx.currentTime);

  // Slight detune for warmth
  osc2.detune.value = 6;
  osc3.detune.value = -5;

  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);

  const sumGain = ctx.createGain();
  gain1.connect(sumGain);
  gain2.connect(sumGain);
  gain3.connect(sumGain);

  // Filter for body tone
  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = 'lowpass';
  bodyFilter.frequency.value = style === 'distorted' ? 6000 : style === 'electric' ? 5000 : 4800;
  bodyFilter.Q.value = 1;

  sumGain.connect(bodyFilter);
  noiseGain.connect(bodyFilter);

  const bodyGain = ctx.createGain();
  bodyFilter.connect(bodyGain);
  bodyGain.connect(masterGain);

  // Envelope
  const now = ctx.currentTime;
  const attack = 0.005;
  const decay = style === 'distorted' ? 1.4 : 1.8;
  const sustain = 0.02;

  // Start sources
  noiseSource.start(now);
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  // Apply gain envelopes
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.linearRampToValueAtTime(1.0, now + attack);
  bodyGain.gain.exponentialRampToValueAtTime(sustain, now + decay);

  // Stop nodes after duration
  const stopTime = now + decay + 0.1;
  osc1.stop(stopTime);
  osc2.stop(stopTime);
  osc3.stop(stopTime);
  noiseSource.stop(now + 0.02);
};

export const playSynthPad = (padIndex: number) => {
  const ctx = getAudioContext();
  const baseFrequency = 220 * Math.pow(2, padIndex / 4); // Musical scale
  
  // Create multiple oscillators for rich synth sound
  const oscillators = [];
  const gainNodes = [];
  
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = i === 0 ? 'sawtooth' : i === 1 ? 'square' : 'sine';
    osc.frequency.setValueAtTime(baseFrequency * (1 + i * 0.01), ctx.currentTime);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    oscillators.push(osc);
    gainNodes.push(gain);
  }
  
  oscillators.forEach(osc => {
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  });
};

export const playInstrumentSample = (instrumentType: string) => {
  // Play a sample sound for instrument demos
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  let frequency = 440;
  let duration = 1;
  
  switch (instrumentType) {
    case 'piano':
    case 'harmonium':
      frequency = 523.25; // C5
      oscillator.type = 'sine';
      break;
    case 'guitar':
    case 'banjo':
      frequency = 329.63; // E4
      oscillator.type = 'sawtooth';
      break;
    case 'drums':
    case 'tabla':
      playDrum('kick');
      setTimeout(() => playDrum('snare'), 200);
      setTimeout(() => playDrum('hihat'), 400);
      return;
    case 'synth':
    case 'bass':
      frequency = 110; // A2
      oscillator.type = 'square';
      duration = 1.5;
      break;
    case 'violin':
    case 'koto':
      frequency = 440; // A4
      oscillator.type = 'triangle';
      duration = 2;
      break;
  }
  
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

// Resume audio context on user interaction (required by browsers)
export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

// Play a short test tone to verify audio output (useful immediately after resumeAudioContext)
export const playTestTone = (opts?: { duration?: number; frequency?: number; ctx?: AudioContext }) => {
  const ctx = opts?.ctx || getAudioContext();
  const duration = opts?.duration ?? 0.18;
  const frequency = opts?.frequency ?? 880;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Quick percussive envelope
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};
