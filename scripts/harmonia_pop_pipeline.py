#!/usr/bin/env python3
# scripts/harmonica_pop_pipeline.py
"""
Harmonica Pop pipeline - full rewrite (stable)

Features:
- Demucs stems extraction via extract_stems_demucs()
- Melody stem selection
- Multi-style arranger (poprock, edm, bollywood, lofi)
- CREPE-based pitch analysis via pitch_extract.extract_pitch_crepe()
- Autotune / vocal processing (subtle/medium/hard/all)
- MIDI -> WAV via fluidsynth (if available)
- Final mix, individual stems, and safe outputs
- Robust error handling and clear return dict
"""

import os
import sys
import math
import time
import random
import logging
import subprocess
from pathlib import Path

import numpy as np
import librosa
import soundfile as sf
import pretty_midi

# Ensure project root in path for local imports when called from backend/
ROOT = Path(__file__).resolve().parents[1]  # project/scripts -> project/
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

# Local helpers (must exist in scripts/)
try:
    from scripts.extract_stems_demucs import extract_stems_demucs
    from scripts.pitch_extract import extract_pitch_crepe
except Exception:
    # fallback if executed from different cwd
    from extract_stems_demucs import extract_stems_demucs
    from pitch_extract import extract_pitch_crepe

# Logging
LOG = logging.getLogger("harmonica")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
if not LOG.handlers:
    LOG.addHandler(handler)
LOG.setLevel(logging.INFO)

# Config
SR = 16000
HOP = 160
PREVIEW_SR = 44100
DEFAULT_TEMPO = 120
SOUNDFONT_DEFAULT = str(Path(__file__).resolve().parents[1] / "soundfonts" / "general_user.sf2")

# Mixer defaults tuned to: softer piano, louder drums/guitar
DEFAULT_MIXER = {
    "piano": 0.6,
    "guitar": 1.5,
    "bass": 1.25,
    "synth": 0.95,
    "drums": 2.0
}

# -------------------------
# Utilities
# -------------------------
def ensure_dir(p):
    if not p:
        return
    Path(p).mkdir(parents=True, exist_ok=True)

def safe_print(msg):
    LOG.info(str(msg))

def clamp_vel(v):
    """Clamp velocity to valid MIDI range 1..127."""
    try:
        vi = int(round(float(v)))
    except Exception:
        vi = 80
    return max(1, min(127, vi))

def normalize_audio(y, peak=0.95):
    maxv = np.max(np.abs(y)) if y.size else 1.0
    if maxv < 1e-9:
        return y
    return (y / (maxv + 1e-9)) * peak

# -------------------------
# Chord detection (robust)
# returns list of (start, end, label)
# -------------------------
def detect_chords_fixed(y, sr=SR, hop_length=HOP):
    """Return list of (start, end, label) with guaranteed shape."""
    TOLABEL = "0:maj"
    if len(y) < hop_length * 2:
        return [(0.0, float(len(y)/sr), TOLABEL)]
    try:
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    except Exception:
        # fallback to STFT-based chroma if CQT fails
        chroma = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=hop_length)

    # normalize safely
    norms = np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-9
    chroma = chroma / norms

    times = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=sr, hop_length=hop_length)

    maj = np.array([1,0,0,0,1,0,0,1,0,0,0,0], dtype=float)
    min_ = np.array([1,0,0,1,0,0,0,1,0,0,0,0], dtype=float)

    segs = []
    cur_label = None
    cur_start = 0.0

    for i in range(chroma.shape[1]):
        vec = chroma[:, i]
        best_score = 0.0
        best_label = TOLABEL
        for root in range(12):
            m = np.roll(maj, root)
            n = np.roll(min_, root)
            s_m = float(np.dot(vec, m))
            s_n = float(np.dot(vec, n))
            if s_m > best_score:
                best_score = s_m
                best_label = f"{root}:maj"
            if s_n > best_score:
                best_score = s_n
                best_label = f"{root}:min"
        if best_label != cur_label:
            if cur_label is not None:
                segs.append((float(times[cur_start_idx]), float(times[i]), cur_label))
            cur_label = best_label
            cur_start_idx = i
    # append tail
    if cur_label is not None:
        segs.append((float(times[cur_start_idx]), float(times[-1] + hop_length/sr), cur_label))

    # sanitize: ensure (s,e,label) and non-zero duration
    clean = []
    for item in segs:
        if len(item) >= 3:
            s, e, l = item[0], item[1], str(item[2])
            if e - s > 0.05:
                clean.append((float(s), float(e), l))
    if not clean:
        clean = [(0.0, float(len(y)/sr), TOLABEL)]
    return clean

# -------------------------
# Energy / sections detection
# returns list of (start, end, state)
# state: 0 low, 1 medium, 2 high
# -------------------------
def compute_energy_sections(y, sr=SR, hop_length=HOP):
    if len(y) < hop_length*2:
        return [(0.0, float(len(y)/sr), 2)], np.array([]), np.array([0.0])
    rms = librosa.feature.rms(y=y, frame_length=hop_length*2, hop_length=hop_length).squeeze()
    frames = np.arange(len(rms))
    times = librosa.frames_to_time(frames, sr=sr, hop_length=hop_length)
    try:
        import scipy.ndimage as ndi
        smooth = ndi.gaussian_filter1d(rms, sigma=1.2)
    except Exception:
        smooth = rms
    low = float(np.percentile(smooth, 40))
    high = float(np.percentile(smooth, 80))
    sections = []
    cur_state = None
    start_t = float(times[0]) if len(times) else 0.0
    for i, t in enumerate(times):
        val = float(smooth[i])
        state = 0 if val < low else (1 if val < high else 2)
        if cur_state is None:
            cur_state = state; start_t = float(t)
        elif state != cur_state:
            sections.append((float(start_t), float(t), int(cur_state)))
            cur_state = state; start_t = float(t)
    if cur_state is not None:
        sections.append((float(start_t), float(times[-1] + hop_length/sr), int(cur_state)))
    if not sections:
        sections = [(0.0, float(len(y)/sr), 2)]
    return sections, smooth, times

# -------------------------
# MIDI instrument helpers
# -------------------------
def chord_to_pitch_set(label):
    try:
        root, quality = label.split(':')
        root = int(root)
    except Exception:
        return [60,64,67]
    base = 60  # C4 baseline
    root_midi = base + root
    if quality == 'maj':
        return [root_midi, root_midi+4, root_midi+7]
    else:
        return [root_midi, root_midi+3, root_midi+7]

def add_piano_comp(pm_inst, chord_segs, velocity=70, humanize=True):
    for seg in chord_segs:
        s, e, label = seg
        pitches = chord_to_pitch_set(label)
        for p in pitches:
            st = float(s + (random.uniform(0,0.03) if humanize else 0))
            en = float(e - (random.uniform(0,0.03) if humanize else 0))
            vel = clamp_vel(int(velocity))
            pm_inst.notes.append(pretty_midi.Note(vel, int(p), st, max(en, st+0.05)))

def add_guitar_strums(pm_inst, chord_segs, velocity=76, humanize=True):
    for seg in chord_segs:
        s, e, label = seg
        dur = e - s
        step = max(0.5, dur / 2.0)
        times = list(np.arange(s, e, step))
        root = chord_to_pitch_set(label)[0] - 12
        for t0 in times:
            pts = [root, root+4, root+7]
            for i,p in enumerate(pts):
                st = float((t0 + i*0.06) + (random.uniform(-0.01,0.01) if humanize else 0))
                en = float(st + 0.08 + random.uniform(0, 0.02))
                vel = clamp_vel(int(velocity))
                pm_inst.notes.append(pretty_midi.Note(vel, int(p), st, en))

def add_bassline(pm_inst, chord_segs, velocity=88, humanize=True):
    for seg in chord_segs:
        s, e, label = seg
        root = chord_to_pitch_set(label)[0] - 12
        st = float(s + (random.uniform(0,0.02) if humanize else 0))
        en = float(min(e, s+0.5))
        pm_inst.notes.append(pretty_midi.Note(clamp_vel(int(velocity)), int(root), st, en))
        if (e - s) > 1.0:
            st2 = float(s + 0.5)
            pm_inst.notes.append(pretty_midi.Note(clamp_vel(int(max(velocity-8, 8))), int(root+2), st2, float(min(e, st2+0.5))))

def add_synth_pads(pm_inst, chord_segs, velocity=60, humanize=True):
    for seg in chord_segs:
        s, e, label = seg
        for p in chord_to_pitch_set(label):
            st = float(s)
            en = float(e)
            vel = clamp_vel(int(velocity))
            pm_inst.notes.append(pretty_midi.Note(vel, int(p+12), st, en))

# Drum generator
def generate_drum_pattern(duration, sections, tempo=DEFAULT_TEMPO):
    beat = 60.0/tempo
    t = 0.0
    notes = []
    while t < duration:
        sec_state = 2
        for (s,e,state) in sections:
            if s <= t < e:
                sec_state = state
                break
        # Kick
        notes.append({"pitch":36, "start":float(t + random.uniform(-0.01,0.01)), "end":float(t+0.04), "vel":clamp_vel(110)})
        # Snare on 2 & 4 when energetic
        if sec_state >= 1:
            if int((t/beat) % 2) == 1:
                notes.append({"pitch":38, "start":float(t + random.uniform(-0.008,0.008)), "end":float(t+0.04), "vel":clamp_vel(98)})
            # hats
            for hh in [0.25, 0.5, 0.75]:
                notes.append({"pitch":42, "start":float(t + hh*beat + random.uniform(-0.005,0.005)), "end":float(t + hh*beat + 0.02), "vel":clamp_vel(72)})
        t += beat
    return notes

def add_drums_to_instrument(pm_inst, drum_notes):
    for n in drum_notes:
        pm_inst.notes.append(pretty_midi.Note(clamp_vel(n["vel"]), int(n["pitch"]), float(n["start"]), float(n["end"])))

# -------------------------
# MIDI -> WAV synth
# -------------------------
def synthesize_midi_preview(midi_file, out_wav, soundfont=SOUNDFONT_DEFAULT, sr=PREVIEW_SR):
    if not shutil_which("fluidsynth"):
        raise RuntimeError("fluidsynth not found in PATH (required for MIDI->WAV)")
    if not os.path.exists(soundfont):
        raise RuntimeError("soundfont not found: " + soundfont)
    ensure_dir(os.path.dirname(out_wav) or ".")
    cmd = ["fluidsynth", "-ni", "-F", out_wav, "-r", str(sr), soundfont, midi_file]
    safe_print("[SYNTH] " + " ".join(cmd))
    subprocess.check_call(cmd)
    try:
        y, _ = librosa.load(out_wav, sr=sr, mono=True)
        y = normalize_audio(y)
        sf.write(out_wav, y, sr)
    except Exception as e:
        safe_print("[SYNTH] postprocess warn: " + str(e))
    safe_print("[SYNTH] wrote: " + out_wav)
    return out_wav

def shutil_which(name):
    """Wrapper for shutil.which - avoids top-level import issues."""
    import shutil
    return shutil.which(name)

# -------------------------
# Style arrangers
# -------------------------
def arrange_pop_rock(vocals_wav, out_midi, tempo=DEFAULT_TEMPO, mixer=None):
    if mixer is None:
        mixer = DEFAULT_MIXER.copy()

    y, sr = librosa.load(vocals_wav, sr=SR, mono=True)
    chord_segs = detect_chords_fixed(y, sr=sr, hop_length=HOP)
    sections, _, _ = compute_energy_sections(y, sr=sr, hop_length=HOP)

    pm = pretty_midi.PrettyMIDI(initial_tempo=tempo)

    # Instruments
    piano = pretty_midi.Instrument(program=0, name="Piano")
    guitar = pretty_midi.Instrument(program=24, name="Guitar")
    bass = pretty_midi.Instrument(program=32, name="Bass")
    synth = pretty_midi.Instrument(program=88, name="Synth")
    drums = pretty_midi.Instrument(program=0, is_drum=True, name="Drums")

    # ====== NEW BALANCE ======
    # Soft background piano
    piano_vel = clamp_vel(int(40 * mixer.get("piano", 1.0)))

    # Guitar more present
    guitar_vel = clamp_vel(int(95 * mixer.get("guitar", 1.0)))

    # Bass steady
    bass_vel = clamp_vel(int(85 * mixer.get("bass", 1.0)))

    # Soft synth pad
    synth_vel = clamp_vel(int(55 * mixer.get("synth", 1.0)))

    # Add instrument parts
    add_piano_comp(piano, chord_segs, velocity=piano_vel)
    add_guitar_strums(guitar, chord_segs, velocity=guitar_vel)
    add_bassline(bass, chord_segs, velocity=bass_vel)
    add_synth_pads(synth, chord_segs, velocity=synth_vel)

    # ====== DRUM BOOST FIX ======
    drum_notes = generate_drum_pattern(float(len(y)/sr), sections, tempo=tempo)

    for n in drum_notes:
        # HUGE boost, but still safe with clamp_vel
        n['vel'] = clamp_vel(int(round(n['vel'] * mixer.get("drums", 1.0) * 1.9)))

    add_drums_to_instrument(drums, drum_notes)

    # Add all tracks
    for inst in (piano, guitar, bass, synth):
        if inst.notes:
            pm.instruments.append(inst)

    pm.instruments.append(drums)

    ensure_dir(os.path.dirname(out_midi) or ".")
    pm.write(out_midi)

    safe_print("[ARRANGER] poprock midi -> " + out_midi)
    return out_midi

def arrange_edm(vocals_wav, out_midi, tempo=DEFAULT_TEMPO, mixer=None):
    if mixer is None:
        mixer = {"piano":0.6,"guitar":0.6,"bass":1.1,"synth":1.4,"drums":1.4}
    y, sr = librosa.load(vocals_wav, sr=SR, mono=True)
    chord_segs = detect_chords_fixed(y, sr=sr, hop_length=HOP)
    sections, _, _ = compute_energy_sections(y, sr=sr, hop_length=HOP)
    pm = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    synth = pretty_midi.Instrument(program=81, name="LeadSynth")
    bass = pretty_midi.Instrument(program=38, name="Bass")
    drums_inst = pretty_midi.Instrument(program=0, is_drum=True, name="Drums")
    add_synth_pads(synth, chord_segs, velocity=clamp_vel(int(78 * mixer.get("synth",1.0))))
    add_bassline(bass, chord_segs, velocity=clamp_vel(int(100 * mixer.get("bass",1.0))))
    drum_notes = generate_drum_pattern(float(len(y)/sr), sections, tempo=tempo)
    for n in drum_notes:
        n['vel'] = clamp_vel(int(round(n['vel'] * mixer.get("drums",1.0) * 1.6)))
    add_drums_to_instrument(drums_inst, drum_notes)
    pm.instruments += [synth, bass, drums_inst]
    pm.write(out_midi)
    safe_print("[ARRANGER] edm midi -> " + out_midi)
    return out_midi

def arrange_bollywood_chill(vocals_wav, out_midi, tempo=DEFAULT_TEMPO, mixer=None):
    if mixer is None:
        mixer = {"piano":1.0,"guitar":0.9,"bass":0.9,"synth":0.8,"drums":0.8}
    y, sr = librosa.load(vocals_wav, sr=SR, mono=True)
    chord_segs = detect_chords_fixed(y, sr=sr, hop_length=HOP)
    sections, _, _ = compute_energy_sections(y, sr=sr, hop_length=HOP)
    pm = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    piano = pretty_midi.Instrument(program=0, name="Piano")
    guitar = pretty_midi.Instrument(program=25, name="Guitar")
    bass = pretty_midi.Instrument(program=32, name="Bass")
    synth = pretty_midi.Instrument(program=89, name="Pad")
    drums_inst = pretty_midi.Instrument(program=0, is_drum=True, name="Drums")
    add_piano_comp(piano, chord_segs, velocity=clamp_vel(int(66 * mixer.get("piano",1.0))))
    add_guitar_strums(guitar, chord_segs, velocity=clamp_vel(int(76 * mixer.get("guitar",1.0))))
    add_bassline(bass, chord_segs, velocity=clamp_vel(int(88 * mixer.get("bass",1.0))))
    add_synth_pads(synth, chord_segs, velocity=clamp_vel(int(64 * mixer.get("synth",1.0))))
    drum_notes = generate_drum_pattern(float(len(y)/sr), sections, tempo=tempo)
    for n in drum_notes:
        n['vel'] = clamp_vel(int(round(n['vel'] * 0.75 * mixer.get("drums",1.0))))
    add_drums_to_instrument(drums_inst, drum_notes)
    pm.instruments += [piano, guitar, bass, synth, drums_inst]
    pm.write(out_midi)
    safe_print("[ARRANGER] bollywood midi -> " + out_midi)
    return out_midi

def arrange_lofi(vocals_wav, out_midi, tempo=DEFAULT_TEMPO, mixer=None):
    if mixer is None:
        mixer = {"piano":0.8,"guitar":0.0,"bass":0.9,"synth":0.9,"drums":0.6}
    y, sr = librosa.load(vocals_wav, sr=SR, mono=True)
    chord_segs = detect_chords_fixed(y, sr=sr, hop_length=HOP)
    sections, _, _ = compute_energy_sections(y, sr=sr, hop_length=HOP)
    pm = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    piano = pretty_midi.Instrument(program=0, name="Piano")
    bass = pretty_midi.Instrument(program=34, name="Bass")
    synth = pretty_midi.Instrument(program=89, name="Pad")
    drums_inst = pretty_midi.Instrument(program=0, is_drum=True, name="Drums")
    add_piano_comp(piano, chord_segs, velocity=clamp_vel(int(58 * mixer.get("piano",1.0))))
    add_synth_pads(synth, chord_segs, velocity=clamp_vel(int(46 * mixer.get("synth",1.0))))
    add_bassline(bass, chord_segs, velocity=clamp_vel(int(72 * mixer.get("bass",1.0))))
    drum_notes = generate_drum_pattern(float(len(y)/sr), sections, tempo=tempo)
    for n in drum_notes:
        n['vel'] = clamp_vel(int(round(n['vel'] * 0.5 * mixer.get("drums",1.0))))
    add_drums_to_instrument(drums_inst, drum_notes)
    pm.instruments += [piano, bass, synth, drums_inst]
    pm.write(out_midi)
    safe_print("[ARRANGER] lofi midi -> " + out_midi)
    return out_midi

def arrange_multistyle(vocals_wav, out_midi, tempo=DEFAULT_TEMPO, style="poprock", mixer=None):
    style = (style or "poprock").lower()
    if style in ("poprock","pop-rock","pop"):
        return arrange_pop_rock(vocals_wav, out_midi, tempo=tempo, mixer=mixer)
    if style in ("edm","edmpop"):
        return arrange_edm(vocals_wav, out_midi, tempo=tempo, mixer=mixer)
    if style in ("bollywood","bolly"):
        return arrange_bollywood_chill(vocals_wav, out_midi, tempo=tempo, mixer=mixer)
    if style in ("lofi","lo-fi"):
        return arrange_lofi(vocals_wav, out_midi, tempo=tempo, mixer=mixer)
    return arrange_pop_rock(vocals_wav, out_midi, tempo=tempo, mixer=mixer)

# -------------------------
# Vocal processing (autotune-like coarse correction)
# -------------------------
AUTOTUNE_PRESETS = {
    "subtle": {"tempo_ratio":1.00, "pitch_cents":6.0},
    "medium": {"tempo_ratio":1.02, "pitch_cents":12.0},
    "hard": {"tempo_ratio":1.04, "pitch_cents":28.0},
}

def process_vocals(vocal_path, out_dir, mode="medium"):
    ensure_dir(out_dir)
    y, sr = librosa.load(vocal_path, sr=None, mono=True)
    preset = AUTOTUNE_PRESETS.get(mode, AUTOTUNE_PRESETS["medium"])
    # trim silence
    try:
        intervals = librosa.effects.split(y, top_db=30)
        if len(intervals) > 0:
            y = np.concatenate([y[s:e] for s,e in intervals])
    except Exception:
        pass
    # small time stretch
    try:
        if abs(preset["tempo_ratio"] - 1.0) > 0.001:
            y = librosa.effects.time_stretch(y, rate=preset["tempo_ratio"])
    except Exception:
        pass
    # coarse pitch shift
    try:
        if abs(preset["pitch_cents"]) > 0.1:
            y = librosa.effects.pitch_shift(y, sr=sr, n_steps=preset["pitch_cents"]/100.0)
    except Exception:
        pass
    # CREPE-based global correction (best effort)
    try:
        times, f0 = extract_pitch_crepe(vocal_path)
        f0 = np.nan_to_num(np.array(f0).flatten(), nan=0.0)
        if len(f0) > 1:
            times = np.clip(np.array(times), 0.0, max(len(y)/sr, 0.0))
            t_audio = np.linspace(0, len(y)/sr, num=len(y))
            f0_interp = np.interp(t_audio, times, f0, left=0.0, right=0.0)
            midi_vals = librosa.hz_to_midi(f0_interp + 1e-9)
            nz = midi_vals[f0_interp > 0]
            if len(nz) > 0:
                shift = float(np.median(np.round(nz) - nz))
                if abs(shift) > 0.02:
                    try:
                        y = librosa.effects.pitch_shift(y, sr=sr, n_steps=shift)
                        safe_print(f"[VOCALS] applied global crepe shift {shift:.2f}")
                    except Exception:
                        pass
    except Exception as e:
        safe_print("[VOCPE] crepe failed: " + str(e))
    y = normalize_audio(y)
    out_path = os.path.join(out_dir, f"vocals_{mode}.wav")
    y = y * 1.6   # 1.6x louder vocals
    y = np.clip(y, -1.0, 1.0)  # avoid distortion
    sf.write(out_path, y, sr)
    safe_print("[VOCALS] wrote: " + out_path)
    return out_path

# -------------------------
# Mixing: instruments + vocals
# -------------------------
def mix_final(instruments_wav, vocals_wav, out_wav, inst_boost=1.1, voc_boost=1.0):
    # load (safe)
    yi, sr_i = (None, None)
    yv, sr_v = (None, None)
    if instruments_wav and os.path.exists(instruments_wav):
        yi, sr_i = librosa.load(instruments_wav, sr=None, mono=True)
    if vocals_wav and os.path.exists(vocals_wav):
        yv, sr_v = librosa.load(vocals_wav, sr=None, mono=True)
    if yi is None and yv is None:
        raise FileNotFoundError("No inputs for mixing")
    sr = sr_i or sr_v or PREVIEW_SR
    L = max(len(yi) if yi is not None else 0, len(yv) if yv is not None else 0)
    mix = np.zeros(L, dtype=np.float32)
    if yi is not None:
        mix[:len(yi)] += yi * inst_boost
    if yv is not None:
        mix[:len(yv)] += yv * voc_boost
    # gentle saturation + normalize
    mix = np.tanh(mix)
    mix = normalize_audio(mix)
    ensure_dir(os.path.dirname(out_wav) or ".")
    sf.write(out_wav, mix, sr)
    safe_print("[MIX] wrote: " + out_wav)
    return out_wav

# -------------------------
# Full pipeline (entry)
# -------------------------
def full_run(song, out_dir, soundfont=None, tempo=DEFAULT_TEMPO, preview=True, style="poprock", mixer=None, autotune_mode="medium"):
    """
    Full pipeline:
    - extract stems (demucs)
    - choose melody stem
    - arrange -> MIDI
    - synth MIDI -> instruments WAV (fluidsynth)
    - process vocals (autotune)
    - mix -> final WAV
    Returns dict with keys: midi, instruments, vocals, finals, stems_folder, melody_stem, individual_stems
    """
    ensure_dir(out_dir)
    safe_print("=== HARMONICA PIPELINE START ===")
    safe_print(f"[INPUT] {song} style={style} autotune={autotune_mode}")
    # 1) demucs
    stems_folder = extract_stems_demucs(song)
    stems_folder = str(stems_folder)
    safe_print("[DEMUX] stems -> " + stems_folder)
    # 2) choose melody stem (prefer vocals)
    melody_stem = None
    try:
        candidates = [Path(stems_folder) / "vocals.wav", Path(stems_folder) / "other.wav"]
        for c in candidates:
            if c.exists():
                melody_stem = str(c); break
        if melody_stem is None:
            # fallback: first wav
            wavs = list(Path(stems_folder).glob("*.wav"))
            melody_stem = str(wavs[0]) if wavs else song
    except Exception as e:
        safe_print("[MELODY] selection failed: " + str(e))
        melody_stem = song
    safe_print("[MELODY] using: " + str(melody_stem))
    # 3) arrange to MIDI
    if mixer is None:
        mixer = DEFAULT_MIXER.copy()
    midi_out = os.path.join(out_dir, "arranged.mid")
    try:
        arranged = arrange_multistyle(melody_stem, midi_out, tempo=tempo, style=style, mixer=mixer)
    except Exception as e:
        safe_print("[ARRANGE] failed: " + str(e))
        raise
    # 4) synth instruments
    instruments_wav = None
    try:
        if soundfont is None:
            soundfont = SOUNDFONT_DEFAULT
        if preview:
            inst_wav = os.path.join(out_dir, "instruments.wav")
            try:
                synth_out = synthesize_midi_preview(arranged, inst_wav, soundfont=soundfont, sr=PREVIEW_SR)
                instruments_wav = synth_out
            except Exception as es:
                safe_print("[SYNTH] synth failed: " + str(es))
                instruments_wav = None
    except Exception as e:
        safe_print("[SYNTH] error: " + str(e))
        instruments_wav = None
    # 5) vocals processing (autotune)
    vocals_result = None
    finals_result = None
    try:
        vocs_out_dir = os.path.join(out_dir, "vocals")
        if autotune_mode == "all":
            vocals_result = {}
            finals_result = {}
            for m in ("subtle","medium","hard"):
                voc_file = process_vocals(melody_stem, vocs_out_dir, mode=m)
                vocals_result[m] = voc_file
                # mix with instruments (if available)
                if instruments_wav:
                    final_path = os.path.join(out_dir, f"final_{m}.wav")
                    mix_final(instruments_wav, voc_file, final_path, inst_boost=1.05, voc_boost=1.0)
                    finals_result[m] = final_path
                else:
                    finals_result[m] = voc_file
        else:
            voc_file = process_vocals(melody_stem, vocs_out_dir, mode=autotune_mode)
            vocals_result = voc_file
            if instruments_wav:
                final_path = os.path.join(out_dir, f"final_{autotune_mode}.wav")
                mix_final(instruments_wav, voc_file, final_path, inst_boost=1.05, voc_boost=1.0)
                finals_result = final_path
            else:
                finals_result = voc_file
    except Exception as e:
        safe_print("[VOCALS] processing failed: " + str(e))
        vocals_result = melody_stem
        finals_result = None
    # 6) result dict
    result = {
        "stems_folder": stems_folder,
        "melody_stem": melody_stem,
        "midi": midi_out,
        "instruments": instruments_wav,
        "vocals": vocals_result,
        "finals": finals_result,
        "individual_stems": {
            "vocals_stem": melody_stem,
            "instruments_wav": instruments_wav
        }
    }
    safe_print("=== HARMONICA PIPELINE COMPLETE ===")
    return result

# CLI for local testing
if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--song", required=True)
    p.add_argument("--out_dir", required=True)
    p.add_argument("--style", default="poprock")
    p.add_argument("--autotune", default="medium")
    p.add_argument("--soundfont", default=None)
    args = p.parse_args()
    print(full_run(args.song, args.out_dir, soundfont=args.soundfont, style=args.style, autotune_mode=args.autotune))
