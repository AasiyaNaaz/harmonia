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

export const playDrum = (drumType: string) => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  switch (drumType) {
    case 'kick':
      // Bass drum - low frequency punch
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      break;
      
    case 'snare':
      // Snare - noise with sharp attack
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(gainNode);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      gainNode.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.2);
      return;
      
    case 'hihat':
    case 'crash':
    case 'ride':
      // Cymbals - high frequency noise
      const cymbalBufferSize = ctx.sampleRate * 0.5;
      const cymbalBuffer = ctx.createBuffer(1, cymbalBufferSize, ctx.sampleRate);
      const cymbalData = cymbalBuffer.getChannelData(0);
      for (let i = 0; i < cymbalBufferSize; i++) {
        cymbalData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const cymbal = ctx.createBufferSource();
      cymbal.buffer = cymbalBuffer;
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      cymbal.connect(filter);
      filter.connect(gainNode);
      gainNode.gain.setValueAtTime(drumType === 'hihat' ? 0.3 : 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (drumType === 'hihat' ? 0.1 : 0.8));
      gainNode.connect(ctx.destination);
      cymbal.start(ctx.currentTime);
      cymbal.stop(ctx.currentTime + (drumType === 'hihat' ? 0.1 : 0.8));
      return;
      
    case 'tom1':
    case 'tom2':
      // Toms - mid-range drums
      const tomFreq = drumType === 'tom1' ? 200 : 150;
      oscillator.frequency.setValueAtTime(tomFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      break;
      
    default:
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  }
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
};

export const playGuitarString = (stringIndex: number) => {
  const ctx = getAudioContext();
  const frequencies = [82.41, 110, 146.83, 196, 246.94, 329.63]; // E A D G B E
  const frequency = frequencies[stringIndex] || 440;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // Simulate guitar string with slight detuning
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Plucked string envelope
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 2);
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
