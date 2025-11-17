# scripts/extract_stems_demucs.py
import subprocess
import time
from pathlib import Path
import shutil
import os

def run_demucs_cli(song_path: str):
    song_path = str(Path(song_path).resolve())
    cmd = ["demucs", "-n", "htdemucs", song_path]
    try:
        print("Calling:", " ".join(cmd))
        subprocess.check_call(cmd)
    except FileNotFoundError:
        raise RuntimeError("Demucs not found in PATH. Install demucs and ensure it's on PATH.")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Demucs failed with exit code {e.returncode}")

def extract_stems_demucs(song_path: str, wait_seconds: float = 25.0):
    """
    Run Demucs and return the folder where stems appear.
    This searches typical locations and waits up to `wait_seconds`.
    """
    song_path = Path(song_path).resolve()
    song_name = song_path.stem

    # run CLI
    run_demucs_cli(str(song_path))

    # candidate output roots (cover your variants)
    project_root = Path(__file__).resolve().parents[1]   # music_project/
    candidates = [
        project_root / "separated" / "htdemucs" / song_name,
        project_root / "backend" / "separated" / "htdemucs" / song_name,
        project_root / "backend" / "separated" / song_name,
        project_root / "separated" / song_name,
    ]

    print("[extract_stems_demucs] waiting for Demucs output. checking:", candidates)
    waited = 0.0
    interval = 0.5
    while waited < wait_seconds:
        for c in candidates:
            if c.exists() and any(c.iterdir()):
                print("Demucs output found at:", c)
                return str(c)
        time.sleep(interval)
        waited += interval

    # last-resort recursive scan inside project_root
    print("No demucs folder in candidate paths — doing recursive scan (last resort).")
    for root, dirs, files in os.walk(project_root):
        for d in dirs:
            if d == song_name:
                p = Path(root) / d
                if any(p.iterdir()):
                    print("Found demucs output recursively at:", p)
                    return str(p)

    raise FileNotFoundError(f"Demucs output folder did not appear (looked at {candidates})")
