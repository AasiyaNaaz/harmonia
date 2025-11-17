# harmonica/scripts/arranger_pop_rock.py
"""
arranger_pop_rock.py
Generates a multi-track pop-rock arrangement MIDI from a vocal (or melody) audio file.
Instruments: Acoustic guitar, Piano, Bass, Big Drums, Soft Synth pads.

Usage:
    from arranger_pop_rock import arrange_and_write_midi
    midi_path = arrange_and_write_midi(vocals_wav, out_midi_path)
"""
import os
from pathlib import Path
from typing import List, Tuple
import numpy as np
import librosa
import pretty_midi

# ---------- Parameters (tweakable) ----------
HOP_LENGTH = 160
SR = 16000
CHROMA_HOP = HOP_LENGTH
MIN_SECTION_LEN_SEC = 1.0

# MIDI programs
PROG_PIANO = 0         # Acoustic Grand Piano
PROG_GUITAR = 24       # Acoustic Guitar (nylon)/actually 24 is nylon, 25 steel - choose 24
PROG_BASS = 32         # Acoustic Bass
PROG_SYNTH = 88        # Pad (e.g., Pad 1)
PROG_DRUM = 0          # drums use is_drum True

# ---------- Utilities ----------
def _frames_to_times(frames, sr=SR, hop_length=HOP_LENGTH):
    return np.array(frames) * (hop_length / sr)

def _safe_round(x):
    return int(np.round(x))


# ---------- Chord detection (simple) ----------
def detect_chords(y: np.ndarray, sr: int = SR, hop_length: int = HOP_LENGTH) -> List[Tuple[float,float,str]]:
    # chroma
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    T = chroma.shape[1]
    times = librosa.frames_to_time(np.arange(T), sr=sr, hop_length=hop_length)

    # simple templates
    maj = np.array([1,0,0,0,1,0,0,1,0,0,0,0])
    min_ = np.array([1,0,0,1,0,0,0,1,0,0,0,0])
    chord_frames = []
    for t in range(T):
        vec = chroma[:,t]
        vec = vec / (np.linalg.norm(vec) + 1e-9)
        best = None
        best_score = 0
        for root in range(12):
            maj_t = np.roll(maj, root)
            min_t = np.roll(min_, root)
            s_maj = np.dot(vec, maj_t)
            s_min = np.dot(vec, min_t)
            if s_maj > best_score:
                best_score = s_maj; best = (root, 'maj')
            if s_min > best_score:
                best_score = s_min; best = (root, 'min')
        chord_frames.append(best if best_score > 0.15 else None)

    # collapse frames to segments
    segs = []
    cur = chord_frames[0]
    start = 0
    for i in range(1, T):
        if chord_frames[i] != cur:
            if cur is not None:
                root, quality = cur
                segs.append((times[start], times[i], f"{root}:{quality}"))
            start = i
            cur = chord_frames[i]
    if cur is not None:
        root, quality = cur
        segs.append((times[start], times[-1] + hop_length/sr, f"{root}:{quality}"))
    # ensure segments >= min len
    segs = [(s,e,name) for (s,e,name) in segs if (e-s) >= MIN_SECTION_LEN_SEC]
    return segs

# ---------- Energy segmentation ----------
def compute_energy_sections(y: np.ndarray, sr: int = SR, hop_length: int = HOP_LENGTH):
    # RMS energy per frame
    rms = librosa.feature.rms(y=y, frame_length=hop_length*2, hop_length=hop_length).squeeze()
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    # smooth
    import scipy.ndimage as ndi
    smooth = ndi.gaussian_filter1d(rms, sigma=1.5)
    # thresholds by percentiles
    low = np.percentile(smooth, 40)
    high = np.percentile(smooth, 80)
    # build section labels
    sections = []
    cur_state = None
    start_t = 0.0
    for i, t in enumerate(times):
        val = smooth[i]
        state = 0 if val < low else (1 if val < high else 2)
        if cur_state is None:
            cur_state = state; start_t = t
        elif state != cur_state:
            sections.append((start_t, t, cur_state))
            start_t = t; cur_state = state
    # append final
    if cur_state is not None:
        sections.append((start_t, times[-1] + hop_length/sr, cur_state))
    return sections, smooth, times

# ---------- Midi builders ----------
def make_instrument(program:int, name:str=None, is_drum=False):
    return pretty_midi.Instrument(program=program, name=name, is_drum=is_drum)

def chord_to_pitch_set(chord_label:str):
    # chord_label like "0:maj" where 0=C
    try:
        root, q = chord_label.split(':')
        root = int(root)
    except Exception:
        return [60,64,67]
    root_midi = 60 + root  # map root to octave 5-ish baseline
    if q == 'maj':
        return [root_midi, root_midi+4, root_midi+7]
    else:
        return [root_midi, root_midi+3, root_midi+7]

# piano comping: sustained chord blocks
def add_piano_comp(pm_inst:pretty_midi.Instrument, chord_segs, velocity=80):
    for s,e,label in chord_segs:
        pitches = chord_to_pitch_set(label)
        for p in pitches:
            note = pretty_midi.Note(velocity=velocity, pitch=p, start=s, end=e)
            pm_inst.notes.append(note)

# acoustic guitar strum pattern: root on beat, arpeggio hits
def add_guitar_strums(pm_inst:pretty_midi.Instrument, chord_segs, beat_div=4, velocity=72):
    for s,e,label in chord_segs:
        duration = e - s
        if duration <= 0: continue
        # create 1 or 2 strums per chord depending on length
        times = np.arange(s, e, max(0.5, duration/2.0))
        root = chord_to_pitch_set(label)[0] if label else 60
        for t0 in times:
            # quick arpeggio: root -> 3rd -> 5th (short notes)
            pts = [root, root+4, root+7]
            dt = 0.08
            for i,p in enumerate(pts):
                note = pretty_midi.Note(velocity=velocity, pitch=p, start=t0 + i*dt, end=t0 + (i+1)*dt + 0.02)
                pm_inst.notes.append(note)

# bassline: root on downbeat with small fills
def add_bassline(pm_inst:pretty_midi.Instrument, chord_segs, velocity=90):
    for s,e,label in chord_segs:
        root = chord_to_pitch_set(label)[0] - 12  # one octave lower
        # one or two root notes
        note = pretty_midi.Note(velocity=velocity, pitch=root, start=s, end=min(e, s+0.5))
        pm_inst.notes.append(note)
        if e - s > 1.0:
            note2 = pretty_midi.Note(velocity=velocity-10, pitch=max(36, root+2), start=s+0.5, end=min(e, s+1.0))
            pm_inst.notes.append(note2)

# synth pad: long sustained chords, softer velocity
def add_synth_pads(pm_inst:pretty_midi.Instrument, chord_segs, velocity=60):
    for s,e,label in chord_segs:
        pitches = chord_to_pitch_set(label)
        for p in pitches:
            note = pretty_midi.Note(velocity=velocity, pitch=p+12, start=s, end=e)  # one octave up for pad
            pm_inst.notes.append(note)

# drums: simple big-pop kit pattern (kick/snare/hihat)
# We'll represent via General MIDI drums: 36=kick, 38=snare, 42=closed hat, 46=open hat
def add_drums(pm_inst:pretty_midi.Instrument, duration_total: float, sections, tempo=120):
    # generate a simple pattern based on tempo and sections
    beat_period = 60.0 / tempo
    t = 0.0
    # pattern for full band vs light sections
    end_t = duration_total
    while t < end_t:
        # always put a kick on downbeat
        k = pretty_midi.Note(velocity=110, pitch=36, start=t, end=t+0.05)
        pm_inst.notes.append(k)
        # snare on 2 and 4 if in high-energy regions nearby
        # find section state
        # check energy state around t
        sec_state = 0
        for s,e,state in sections:
            if s <= t < e:
                sec_state = state; break
        if (int(t/beat_period) % 2) == 1 and sec_state >= 1:
            s_n = pretty_midi.Note(velocity=100, pitch=38, start=t, end=t+0.05)
            pm_inst.notes.append(s_n)
        # hats every 0.5 beat in building/full
        if sec_state >= 1:
            for hh in [0.25, 0.5, 0.75]:
                h = pretty_midi.Note(velocity=60, pitch=42, start=t+hh*beat_period, end=t+hh*beat_period+0.02)
                pm_inst.notes.append(h)
        t += beat_period

# ---------- Arranger entrypoint ----------
def arrange_and_write_midi(vocals_wav: str, out_midi: str, tempo: int = 120):
    """
    Main function:
      - analyze vocals for energy and chords
      - create arrangement sections and decide which instruments play
      - write multi-track MIDI to out_midi
    """
    y, sr = librosa.load(vocals_wav, sr=SR, mono=True)
    # energy sections
    sections, smooth_energy, energy_times = compute_energy_sections(y, sr=sr, hop_length=HOP_LENGTH)
    duration = len(y) / sr

    # chords from full audio (gives chord segments)
    chord_segs = detect_chords(y, sr=sr, hop_length=CHROMA_HOP)
    if not chord_segs:
        # fallback: single C major for whole song to avoid empty midi
        chord_segs = [(0.0, duration, "0:maj")]

    # decide instrument presence per section (0=soft intro,1=build,2=full)
    # We'll convert sections into a timeline of (start,end,state)
    # Build final chord timeline by intersecting chord_segs with sections
    # For simplicity, we use chord_segs as harmonic backbone and use sections to gate instrument entries.

    # create pretty_midi object and instruments
    pm = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    piano = make_instrument(PROG_PIANO, name="Piano")
    guitar = make_instrument(PROG_GUITAR, name="AcousticGuitar")
    bass = make_instrument(PROG_BASS, name="Bass")
    synth = make_instrument(PROG_SYNTH, name="SoftSynth")
    drums = make_instrument(PROG_DRUM, name="Drums", is_drum=True)

    # Build instrument parts conditioned on sections:
    # Intro (state 0): piano + soft synth (sparse), maybe sax omitted for pop-rock
    # Build (state 1): piano + synth + bass (light) + light drums
    # Full (state 2): everything including guitar and full drums

    # We'll translate chord_segs into per-section filtered chord lists
    for s_ch, e_ch, lab in chord_segs:
        # find overlapping sections to decide energy level(s)
        # choose the max state overlapping the chord segment
        overlapping_states = [state for (s,e,state) in sections if not (e <= s_ch or s >= e_ch)]
        state = max(overlapping_states) if overlapping_states else 2
        # apply different note creation depending on state
        if state == 0:
            # gentle piano & synth pad (sustain)
            add_piano_comp(piano, [(s_ch, e_ch, lab)], velocity=60)
            add_synth_pads(synth, [(s_ch, e_ch, lab)], velocity=50)
        elif state == 1:
            # fuller piano, light bass, light strums, light drums
            add_piano_comp(piano, [(s_ch, e_ch, lab)], velocity=75)
            add_synth_pads(synth, [(s_ch, e_ch, lab)], velocity=55)
            add_bassline(bass, [(s_ch, e_ch, lab)], velocity=80)
            add_guitar_strums(guitar, [(s_ch, e_ch, lab)], velocity=68)
        else:
            # full band: strong piano, synth, bass, guitar, drums
            add_piano_comp(piano, [(s_ch, e_ch, lab)], velocity=92)
            add_synth_pads(synth, [(s_ch, e_ch, lab)], velocity=70)
            add_bassline(bass, [(s_ch, e_ch, lab)], velocity=100)
            add_guitar_strums(guitar, [(s_ch, e_ch, lab)], velocity=85)

    # drums: use computed sections to create patterns across entire duration
    add_drums(drums, duration_total=duration, sections=sections, tempo=tempo)

    # Append non-empty instruments to pm
    for inst in [piano, guitar, bass, synth]:
        if inst.notes:
            pm.instruments.append(inst)
    # drums always append
    pm.instruments.append(drums)

    # write
    os.makedirs(os.path.dirname(out_midi) or ".", exist_ok=True)
    pm.write(out_midi)
    return out_midi

# small wrapper to compute energy sections (placed here for encapsulation)
def compute_energy_sections(y: np.ndarray, sr: int = SR, hop_length: int = HOP_LENGTH):
    rms = librosa.feature.rms(y=y, frame_length=hop_length*2, hop_length=hop_length).squeeze()
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    import scipy.ndimage as ndi
    smooth = ndi.gaussian_filter1d(rms, sigma=1.5)
    low = np.percentile(smooth, 40)
    high = np.percentile(smooth, 80)
    sections = []
    cur = None; start = 0.0
    for i,t in enumerate(times):
        val = smooth[i]
        state = 0 if val < low else (1 if val < high else 2)
        if cur is None:
            cur = state; start = t
        elif state != cur:
            sections.append((start, t, cur))
            start = t; cur = state
    if cur is not None:
        sections.append((start, times[-1] + hop_length/sr, cur))
    return sections, smooth, times
