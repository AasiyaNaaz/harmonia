import { playPianoNote, playDrum, playGuitarString, playSynthPad, resumeAudioContext } from "./audioUtils";

export interface NoteEvent {
  timestamp: number;
  instrument: 'piano' | 'drums' | 'guitar' | 'synth';
  data: any; // note name for piano, drum type for drums, string index for guitar, pad index for synth
}

type StateChangeCallback = () => void;

export class RecordingManager {
  private tracks: Map<number, NoteEvent[]> = new Map();
  private currentTrack: number = 0;
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;
  private isPlaying: boolean = false;
  private isLooping: boolean = false;
  private tempo: number = 120; // BPM
  private playbackTimeouts: number[] = [];
  private loopOrStopTimeout: number | null = null; // Track the final timeout separately
  private playbackStartTime: number = 0; // Track when playback started
  private stateChangeCallbacks: StateChangeCallback[] = [];

  constructor() {
    this.tracks.set(0, []);
  }

  onStateChange(callback: StateChangeCallback) {
    this.stateChangeCallbacks.push(callback);
  }

  private notifyStateChange() {
    this.stateChangeCallbacks.forEach(cb => cb());
  }

  startRecording() {
    if (!this.isRecording) {
      this.stop(); // Stop any playback
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      // Clear track to start fresh recording
      this.tracks.set(this.currentTrack, []);
      this.notifyStateChange();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.notifyStateChange();
    }
  }

  recordNote(instrument: 'piano' | 'drums' | 'guitar' | 'synth', data: any) {
    if (!this.isRecording) return;
    
    const event: NoteEvent = {
      timestamp: Date.now() - this.recordingStartTime,
      instrument,
      data
    };
    
    const track = this.tracks.get(this.currentTrack) || [];
    track.push(event);
    this.tracks.set(this.currentTrack, track);
  }

  async play() {
    this.stop(); // Stop any current playback
    this.isPlaying = true;
    this.playbackStartTime = Date.now();
    this.notifyStateChange();

    // Resume audio context in case it is suspended (browsers require user interaction to unlock audio)
    try {
      await resumeAudioContext();
    } catch {}
    
    const track = this.tracks.get(this.currentTrack) || [];
    if (track.length === 0) {
      this.isPlaying = false;
      this.notifyStateChange();
      return;
    }

    const tempoMultiplier = 120 / this.tempo; // Correct tempo scaling: higher BPM = faster playback
    
    const playOnce = () => {
      this.playbackStartTime = Date.now();
      track.forEach((event) => {
        const adjustedDelay = event.timestamp * tempoMultiplier;
        const timeoutId = window.setTimeout(() => {
          if (this.isPlaying) {
            this.playEvent(event);
          }
        }, adjustedDelay);
        this.playbackTimeouts.push(timeoutId);
      });

      const totalDuration = track[track.length - 1].timestamp * tempoMultiplier;
      
      // Schedule loop or stop
      if (this.isLooping) {
        this.loopOrStopTimeout = window.setTimeout(() => {
          if (this.isPlaying && this.isLooping) {
            this.clearNoteTimeouts(); // Clear only note timeouts, not the loop timeout
            playOnce();
          } else {
            this.isPlaying = false;
            this.loopOrStopTimeout = null;
            this.notifyStateChange();
          }
        }, totalDuration + 500);
      } else {
        this.loopOrStopTimeout = window.setTimeout(() => {
          this.isPlaying = false;
          this.loopOrStopTimeout = null;
          this.notifyStateChange();
        }, totalDuration + 500);
      }
    };

    playOnce();
  }

  private playEvent(event: NoteEvent) {
    switch (event.instrument) {
      case 'piano':
        playPianoNote(event.data);
        break;
      case 'drums':
        playDrum(event.data);
        break;
      case 'guitar':
        // recorded guitar events may store an object { stringIndex, style, octave, semitoneOffset }
        try {
          if (typeof event.data === 'object' && event.data !== null) {
            const { stringIndex, semitoneOffset, style, octave, frequency } = event.data as any;
            // prefer calling with input and opts so style/octave are applied
            const input = (typeof stringIndex === 'number') ? { stringIndex, semitoneOffset, frequency } : event.data;
            playGuitarString(input as any, { style, octave });
          } else {
            playGuitarString(event.data as any);
          }
        } catch (err) {
          // fallback
          try {
            playGuitarString(event.data as any);
          } catch {}
        }
        break;
      case 'synth':
        playSynthPad(event.data);
        break;
    }
  }

  stop() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.clearNoteTimeouts();
      if (this.loopOrStopTimeout !== null) {
        clearTimeout(this.loopOrStopTimeout);
        this.loopOrStopTimeout = null;
      }
      this.notifyStateChange();
    }
  }

  private clearNoteTimeouts() {
    this.playbackTimeouts.forEach(id => clearTimeout(id));
    this.playbackTimeouts = [];
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.notifyStateChange();
    // Note: Loop toggle takes effect on next play or after current playback completes
    // This simplifies implementation and avoids mid-playback interruptions
    return this.isLooping;
  }

  setTempo(bpm: number) {
    this.tempo = Math.max(40, Math.min(240, bpm)); // Clamp between 40-240 BPM
  }

  getTempo() {
    return this.tempo;
  }

  getIsRecording() {
    return this.isRecording;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getIsLooping() {
    return this.isLooping;
  }

  getCurrentTrack() {
    return this.tracks.get(this.currentTrack) || [];
  }

  hasRecording() {
    const track = this.tracks.get(this.currentTrack) || [];
    return track.length > 0;
  }

  clearCurrentTrack() {
    this.stop();
    this.tracks.set(this.currentTrack, []);
    this.isLooping = false;
    this.notifyStateChange();
  }

  newTrack() {
    this.currentTrack++;
    this.tracks.set(this.currentTrack, []);
    return this.currentTrack;
  }

  switchTrack(trackId: number) {
    if (this.tracks.has(trackId)) {
      this.currentTrack = trackId;
    }
  }
}

// Global instance
export const recordingManager = new RecordingManager();
