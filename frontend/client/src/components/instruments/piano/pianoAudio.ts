// pianoAudio.ts
type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
  midi: number;
};

const Engine = (function () {
  let ctx: AudioContext | null = null;
  const active = new Map<number, Voice>();
  let master: GainNode | null = null;
  let reverbConvolver: ConvolverNode | null = null;
  let reverbWet: GainNode | null = null;
  let analyser: AnalyserNode | null = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.8;

      // analyser -> master
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.connect(master);

      // reverb chain
      reverbConvolver = ctx.createConvolver();
      reverbWet = ctx.createGain();
      reverbWet.gain.value = 0; // default off
      reverbConvolver.connect(reverbWet);
      reverbWet.connect(master);

      // connect master to destination
      master.connect(ctx.destination);
    }
  }

  function resume() {
    ensure();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  function playNote(midi: number, freq: number, velocity = 1) {
    ensure();
    if (!ctx || !master) return;
    // prevent duplicate voice
    if (active.has(midi)) stopNote(midi);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle"; // warm-ish
    osc.frequency.value = freq;
    gain.gain.value = velocity;

    // connect: osc -> gain -> master & reverbConvolver
    osc.connect(gain);
    gain.connect(master);
    if (reverbConvolver && reverbWet) {
      gain.connect(reverbConvolver);
    }
    osc.start();
    active.set(midi, { osc, gain, midi });
  }

  function stopNote(midi: number) {
    if (!ctx) return;
    const v = active.get(midi);
    if (!v) return;
    try {
      // small ramp to avoid clicks
      v.gain.gain.cancelScheduledValues(ctx.currentTime);
      v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
      v.osc.stop(ctx.currentTime + 0.02);
    } catch {}
    active.delete(midi);
  }

  function stopAll() {
    Array.from(active.keys()).forEach((m) => stopNote(m));
  }

  function setMasterVolume(v: number) {
    ensure();
    if (master) master.gain.value = v;
  }

  function setReverbWet(wet: number) {
    ensure();
    if (reverbWet) reverbWet.gain.value = Math.max(0, Math.min(1, wet));
  }

  function loadReverbImpulse(arrayBuffer: ArrayBuffer) {
    ensure();
    if (!ctx || !reverbConvolver) return;
    ctx.decodeAudioData(arrayBuffer.slice(0), (buf) => {
      reverbConvolver!.buffer = buf;
    });
  }

  function getAnalyser() {
    ensure();
    return analyser;
  }

  return {
    resume,
    playNote,
    stopNote,
    stopAll,
    setMasterVolume,
    setReverbWet,
    loadReverbImpulse,
    getAnalyser,
  };
})();

export default Engine;
