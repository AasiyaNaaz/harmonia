# pitch_extract.py (SUPER UPGRADED)
import torch
import torchcrepe
import librosa
import numpy as np
import inspect
from scipy.signal import medfilt, savgol_filter


def _safe_crepe_predict(audio_tensor, sr, hop_length):
    """
    Version-proof torchcrepe.predict() wrapper.
    Detects whether the installed version uses:
      - sample_rate
      - or sr
    and calls accordingly.
    """
    sig = inspect.signature(torchcrepe.predict)

    args = {
        "hop_length": hop_length,
        "fmin": 50,
        "fmax": 1100,
        "model": "full",
        "return_periodicity": True,
        "device": "cpu"
    }

    if "sample_rate" in sig.parameters:
        args["sample_rate"] = sr
    else:
        args["sr"] = sr

    return torchcrepe.predict(audio_tensor, **args)


def _smooth_f0(f0, confidence,
               conf_thresh=0.2,
               median_kernel=3,
               sg_window=11,
               sg_poly=2):
    """
    Smooths raw f0 using:
        - Confidence threshold mask
        - Median filter
        - Savitzky-Golay smoothing
    """
    f0 = f0.copy()

    # Zero out low-confidence regions
    f0[confidence < conf_thresh] = 0

    # Median filtering for spike removal
    if median_kernel > 1:
        k = median_kernel if median_kernel % 2 == 1 else median_kernel + 1
        f0 = medfilt(f0, kernel_size=k)

    # Savitzky–Golay smoothing
    if sg_window > 3:
        w = sg_window if sg_window % 2 == 1 else sg_window + 1
        w = min(w, len(f0) - (1 - len(f0) % 2))
        try:
            f0 = savgol_filter(f0, window_length=w, polyorder=sg_poly)
        except Exception:
            pass

    # Clean small negatives
    f0[f0 < 0] = 0

    return f0


def extract_pitch_crepe(
        wav_file,
        hop_length=160,
        sr=16000,
        median_kernel=3,
        sg_window=11,
        sg_poly=2,
        conf_thresh=0.2,
        return_smoothing=True
):
    """
    UPGRADED CREPE PITCH EXTRACTOR
    ----------------------------------
    Returns:
        times          — time axis
        f0_raw         — raw CREPE f0 (Hz)
        f0_smooth      — cleaned + smoothed f0 (Hz)
        confidence     — periodicity confidence (0–1)

    Parameters:
        hop_length     — CREPE hop
        sr             — resample rate (16000 recommended)
        median_kernel  — median filter size
        sg_window      — Savitzky–Golay window
        conf_thresh    — low-confidence mask threshold
        return_smoothing — whether to include smoothed output
    """

    # ---- Load audio ----
    audio, _ = librosa.load(wav_file, sr=sr, mono=True)
    audio_tensor = torch.tensor(audio).unsqueeze(0)

    # ---- CREPE pitch extraction (raw + confidence) ----
    periodicity, f0 = _safe_crepe_predict(audio_tensor,
                                          sr=sr,
                                          hop_length=hop_length)

    f0_raw = f0.squeeze(0).cpu().numpy()
    confidence = periodicity.squeeze(0).cpu().numpy()

    # ---- Time axis ----
    times = np.arange(len(f0_raw)) * (hop_length / sr)

    if not return_smoothing:
        return times, f0_raw, None, confidence

    # ---- Smooth f0 ----
    f0_smooth = _smooth_f0(
        f0_raw,
        confidence,
        conf_thresh=conf_thresh,
        median_kernel=median_kernel,
        sg_window=sg_window,
        sg_poly=sg_poly
    )

    return times, f0_raw, f0_smooth, confidence
