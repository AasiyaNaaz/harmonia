# harmonica/scripts/audio_to_midi.py
"""
Advanced Audio -> MIDI pipeline (multi-track, chords, smoothing, auto-tune cleanup)

Features:
- Uses torchcrepe for pitch (version-proof wrapper)
- Uses librosa.cqt for onset/chroma (no nnAudio dependency)
- Smooths pitch (median + Savitzky-Golay)
- Produces separate MIDI tracks: melody (main), accompaniment (per stem), chord track
- Auto-tune style cleaning: semitone quantize, merge/suppress short notes
- Velocity derived from amplitude envelope
- Time quantization grid for tidy MIDI

Usage:
    from audio_to_midi import audio_to_midi_batch
    # either pass a single stem file or a list of stem files
    audio_to_midi_batch(["vocals.wav", "accompaniment.wav"], "out/combined.mid")
"""

import os
import math
import inspect
from typing import List, Tuple, Optional

import numpy as np
import librosa
import pretty_midi
import torch
import torchcrepe
from scipy.signal import savgol_filter, medfilt

# -----------------------
# Utility: CREPE wrapper
# -----------------------
def safe_crepe_predict(audio_tensor: torch.Tensor, sr: int, hop_length: int = 160):
    """
    Version-proof CREPE wrapper: detects whether predict() expects 'sr' or 'sample_rate'.
    Returns (periodicity, f0) as torch tensors shape [1, T].
    """
    crepe_args = {
        "hop_length": hop_length,
        "fmin": 50,
        "fmax": 1100,
        "model": "full",
        "return_periodicity": True,
        "device": "cpu",
    }
    sig = inspect.signature(torchcrepe.predict)
    if "sample_rate" in sig.parameters:
        crepe_args["sample_rate"] = sr
    else:
        crepe_args["sr"] = sr
    return torchcrepe.predict(audio_tensor, **crepe_args)


# -----------------------
# Pitch smoothing helpers
# -----------------------
def smooth_pitch(f0_array: np.ndarray, conf: np.ndarray,
                 conf_threshold: float = 0.2,
                 median_kernel: int = 3,
                 sg_window: int = 11,
                 sg_poly: int = 2) -> np.ndarray:
    """
    Input f0_array: Hz vector (len T). conf: same length.
    - Zero-out low-confidence frames
    - Median filter small spikes
    - Savitzky-Golay for smoothing
    Returns smoothed Hz array.
    """
    f0 = f0_array.copy()
    f0[conf < conf_threshold] = 0.0

    # median to remove outliers (choose odd kernel)
    if median_kernel > 1:
        k = median_kernel if median_kernel % 2 == 1 else median_kernel + 1
        f0 = medfilt(f0, kernel_size=k)

    # SG smooth only non-zero regions (we'll run on entire array but it's fine)
    if sg_window > 3:
        w = sg_window if sg_window % 2 == 1 else sg_window + 1
        try:
            f0 = savgol_filter(f0, window_length=min(w, len(f0) - (1 - len(f0) % 2)), polyorder=sg_poly)
        except Exception:
            # fallback if window too large
            pass

    # ensure no small negative rounding artefacts
    f0[f0 < 0] = 0.0
    return f0


# -----------------------
# Onset detection & amplitude
# -----------------------
def detect_onsets_and_energy(y: np.ndarray, sr: int, hop_length: int = 160,
                             cqt_bins: int = 84, onset_thresh_factor: float = 1.3) -> Tuple[np.ndarray, np.ndarray]:
    """
    Returns:
      onsets_frames: array of frame indices of onsets
      amp_env: per-frame amplitude envelope (len T)
    Uses librosa.cqt for spectral envelope like before but without nnAudio.
    """
    # compute CQT magnitude
    C = np.abs(librosa.cqt(y, sr=sr, hop_length=hop_length, fmin=32.7, n_bins=cqt_bins, bins_per_octave=12))
    # sum freq bins to get onset env
    env = C.sum(axis=0)
    thr = np.mean(env) * onset_thresh_factor
    onsets = np.where(env > thr)[0]

    # thin dense onsets (>= 5 frames apart ~ 50ms at 160 hop)
    if len(onsets) > 0:
        cleaned = [onsets[0]]
        for f in onsets[1:]:
            if f - cleaned[-1] > 4:
                cleaned.append(f)
        onsets = np.array(cleaned)

    # amplitude envelope per frame (RMS)
    hop_frames = int(hop_length)
    frame_len = hop_frames
    # use librosa.feature.rms
    amp_env = librosa.feature.rms(y=y, frame_length=frame_len * 2, hop_length=hop_frames).squeeze()
    # ensure same length as C frames
    min_len = min(len(amp_env), C.shape[1])
    amp_env = amp_env[:min_len]
    return onsets, amp_env


# -----------------------
# Chord detection (simple)
# -----------------------
def detect_chords(y: np.ndarray, sr: int, hop_length: int = 160) -> List[Tuple[float, float, str]]:
    """
    Use chroma and a simple template matching to detect chords.
    Returns list of (start_time, end_time, chord_name).
    This is a simple, robust approach good for pop songs.
    """
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    T = chroma.shape[1]
    times = librosa.frames_to_time(np.arange(T), sr=sr, hop_length=hop_length)

    # normalized chroma
    chroma_norm = chroma / (np.maximum(chroma.sum(axis=0, keepdims=True), 1e-9))

    # chord templates (12 pitch classes) for major/minor triads
    # index 0 = C, 1 = C#, ...
    major_template = np.roll(np.array([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0]), 0)
    minor_template = np.roll(np.array([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]), 0)
    chord_list = []

    # compute best chord per frame
    chord_per_frame = []
    for t in range(T):
        vec = chroma_norm[:, t]
        best_score = 0
        best_name = None
        for root in range(12):
            maj = np.roll(major_template, root)
            mino = np.roll(minor_template, root)
            score_maj = np.dot(vec, maj)
            score_min = np.dot(vec, mino)
            if score_maj > best_score:
                best_score = score_maj
                best_name = f"{librosa.midi_to_note(12 + root).replace('0','')[:-1]}:maj"  # e.g., C:maj
            if score_min > best_score:
                best_score = score_min
                best_name = f"{librosa.midi_to_note(12 + root).replace('0','')[:-1]}:min"
        chord_per_frame.append(best_name if best_name is not None else "N")

    # collapse consecutive same chords to segments
    if T == 0:
        return []

    segs = []
    cur = chord_per_frame[0]
    start_idx = 0
    for i in range(1, T):
        if chord_per_frame[i] != cur:
            segs.append((times[start_idx], times[i], cur))
            cur = chord_per_frame[i]
            start_idx = i
    segs.append((times[start_idx], times[-1] + hop_length / sr, cur))
    # filter out "N" or very short segments
    segs = [(s, e, name) for (s, e, name) in segs if name != "N" and (e - s) > 0.15]
    return segs


# -----------------------
# Note extraction helper
# -----------------------
def extract_notes_from_pitch_and_onsets(midi_array: np.ndarray, amp_env: np.ndarray,
                                        onsets: np.ndarray, hop_time: float,
                                        min_pitch: int = 36, max_pitch: int = 96,
                                        min_duration: float = 0.08) -> List[pretty_midi.Note]:
    """
    Build pretty_midi.Note objects from array of MIDI pitch values (float),
    amplitude envelope, and onsets (frame indices).
    Includes auto-tune quantize to nearest semitone, velocity from amp_env,
    merges short notes, and filters by range.
    """
    notes = []
    T = len(midi_array)
    # make sure amp_env length >= T
    if len(amp_env) < T:
        amp_env = np.pad(amp_env, (0, T - len(amp_env)), mode='constant')

    for i, onset in enumerate(onsets):
        if onset >= T:  # skip if onset past end
            continue
        start_time = onset * hop_time
        pitch_val = midi_array[onset]

        if pitch_val <= 0 or np.isnan(pitch_val):
            continue

        pitch_q = int(round(pitch_val))
        if pitch_q < min_pitch or pitch_q > max_pitch:
            continue

        # duration until next onset
        if i < len(onsets) - 1:
            end_time = (onsets[i + 1]) * hop_time
            dur = end_time - start_time
        else:
            dur = 0.25
            end_time = start_time + dur

        if dur < min_duration:
            # merge into next or skip
            continue

        # velocity scaled from amplitude (0-127)
        amp_val = amp_env[onset] if onset < len(amp_env) else np.max(amp_env)
        vel = int(np.clip((amp_val / (np.max(amp_env) + 1e-9)) * 100 + 27, 20, 127))

        note = pretty_midi.Note(velocity=vel, pitch=pitch_q, start=start_time, end=end_time)
        notes.append(note)

    # optionally merge overlapping consecutive notes of same pitch
    merged = []
    for n in notes:
        if merged and merged[-1].pitch == n.pitch and abs(merged[-1].end - n.start) < 1e-3:
            # extend
            merged[-1].end = n.end
        else:
            merged.append(n)
    return merged


# -----------------------
# Primary pipeline for single stem -> instrument track
# -----------------------
def stem_to_midi_track(stem_path: str,
                       program: int = 0,
                       name: Optional[str] = None,
                       sr: int = 16000,
                       hop_length: int = 160,
                       conf_thresh: float = 0.2) -> Tuple[pretty_midi.Instrument, List[Tuple[float, float, str]]]:
    """
    Process a single audio stem into a pretty_midi.Instrument and detected chord segments.
    Returns (instrument, chord_segments)
    """
    y, _ = librosa.load(stem_path, sr=sr)
    audio_tensor = torch.tensor(y).unsqueeze(0)

    # onsets + amplitude
    onsets, amp_env = detect_onsets_and_energy(y, sr, hop_length=hop_length)
    hop_time = hop_length / sr

    # CREPE pitch & periodicity
    periodicity, f0 = safe_crepe_predict(audio_tensor, sr=sr, hop_length=hop_length)
    f0 = f0.squeeze(0).cpu().numpy()
    periodicity = periodicity.squeeze(0).cpu().numpy()

    # smooth & clean
    f0 = smooth_pitch(f0, periodicity, conf_threshold=conf_thresh, median_kernel=3, sg_window=11, sg_poly=2)

    # convert to midi numbers (Hz->MIDI), silence remains 0
    midi_pitch = librosa.hz_to_midi(f0 + 1e-9)

    # extract notes using onsets + envelope
    notes = extract_notes_from_pitch_and_onsets(midi_pitch, amp_env, onsets, hop_time)

    # create instrument
    inst = pretty_midi.Instrument(program=program, name=name or os.path.basename(stem_path))
    inst.notes = notes

    # detect chords for the full stem (approx)
    chords = detect_chords(y, sr, hop_length=hop_length)

    return inst, chords


# -----------------------
# Batch / Multi-stem processing
# -----------------------
def audio_to_midi_batch(stem_paths: List[str], output_mid: str,
                        program_map: Optional[dict] = None,
                        sr: int = 16000,
                        hop_length: int = 160,
                        conf_thresh: float = 0.2,
                        create_chord_track: bool = True,
                        time_quantize: Optional[float] = 0.05) -> str:
    """
    Main entry:
      - stem_paths: list of filepaths (e.g. [vocals.wav, accompaniment.wav])
      - program_map: optional dict mapping stem filename->MIDI program number
      - output_mid: path to write combined multi-track MIDI
      - time_quantize: quantize note start/end times to this grid (seconds). None to disable.
    """
    pm = pretty_midi.PrettyMIDI()
    all_chords = []  # collect chords across stems

    for p in stem_paths:
        program = 0
        key = os.path.basename(p)
        if program_map and key in program_map:
            program = int(program_map[key])
        inst, chords = stem_to_midi_track(p, program=program, name=key, sr=sr, hop_length=hop_length, conf_thresh=conf_thresh)

        # optional time quantization
        if time_quantize:
            for n in inst.notes:
                n.start = round(n.start / time_quantize) * time_quantize
                n.end = max(n.start + 0.02, round(n.end / time_quantize) * time_quantize)

        pm.instruments.append(inst)
        all_chords.extend(chords)

    # build chord track if requested
    if create_chord_track and all_chords:
        chord_inst = pretty_midi.Instrument(program=0, name="Chords")
        # merge and sort chord segments by start time, simple union
        all_chords_sorted = sorted(all_chords, key=lambda x: x[0])
        # collapse overlapping or adjacent chord segments with same label
        merged = []
        for s, e, name in all_chords_sorted:
            if not merged:
                merged.append([s, e, name])
            else:
                ps, pe, pname = merged[-1]
                if name == pname and s <= pe + 0.05:
                    merged[-1][1] = max(pe, e)
                else:
                    merged.append([s, e, name])
        # create MIDI chord "blocks" as sustained notes of root pitch (approx)
        for s, e, cname in merged:
            # try to map 'C:maj' or 'C:min' to a root pitch
            try:
                root_name = cname.split(':')[0]
                # convert note letter to midi (approx using octave 4)
                root_midi = pretty_midi.note_name_to_number(root_name + '4')
            except Exception:
                root_midi = 60
            # make a chord cluster (root + 4th/maj3 or min3)
            chord_pitches = [root_midi, root_midi + 4, root_midi + 7]
            for pitch in chord_pitches:
                chord_inst.notes.append(pretty_midi.Note(velocity=60, pitch=pitch, start=s, end=e))
        pm.instruments.append(chord_inst)

    # write file
    os.makedirs(os.path.dirname(output_mid), exist_ok=True)
    pm.write(output_mid)
    return output_mid


# -----------------------
# If run as script, simple CLI
# -----------------------
if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Advanced audio->MIDI multi-stem exporter")
    ap.add_argument("stems", nargs="+", help="one or more stem audio files (wav/mp3)")
    ap.add_argument("--out", "-o", required=True, help="output MIDI path")
    ap.add_argument("--map", "-m", help="comma-separated basename:program pairs (vocals.wav:0,acc.wav:1)")
    args = ap.parse_args()

    program_map = {}
    if args.map:
        for pair in args.map.split(","):
            k, v = pair.split(":")
            program_map[k] = int(v)

    print("Processing stems:", args.stems)
    out = audio_to_midi_batch(args.stems, args.out, program_map=program_map)
    print("Wrote MIDI to", out)
