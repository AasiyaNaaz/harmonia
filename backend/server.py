# backend/server.py
import asyncio
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import sys
import time
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# ensure project root is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# try import the pipeline; if it fails, raise a clear error
try:
    from scripts.harmonia_pop_pipeline import full_run
except Exception as e:
    # give a clear message in server logs and re-raise
    print("Failed to import harmonica_pop_pipeline:", e)
    raise

# ───────────────────────────────
BASE_OUT = "output"
LOG_SUBSCRIBERS = []  # simple in-memory SSE queue

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple SSE generator
async def event_generator():
    while True:
        if LOG_SUBSCRIBERS:
            msg = LOG_SUBSCRIBERS.pop(0)
            yield f"data: {msg}\n\n"
        else:
            yield "data: \n\n"
        await asyncio.sleep(0.1)

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/convert-page")
def convert_page():
    base_dir = os.path.dirname(os.path.abspath(__file__))     # backend/
    file_path = os.path.abspath(os.path.join(base_dir, "..", "frontend", "pop_convert_page.html"))

    with open(file_path, "r", encoding="utf-8") as f:
        return HTMLResponse(f.read(), status_code=200)


@app.get("/stream")
async def stream():
    return StreamingResponse(event_generator(), media_type="text/event-stream")

def log(msg: str):
    # sanitize message, push to queue
    LOG_SUBSCRIBERS.append(str(msg))

@app.post("/upload/song")
async def upload_song(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())[:8]
    save_path = f"uploads/songs/{uid}-{file.filename}"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(await file.read())
    log(f"[UPLOAD] Song uploaded: {save_path}")
    return {"path": save_path}

# backend/server.py  (only changed run_arrange signature & return payload)
@app.post("/run/arrange")
async def run_arrange(
    song: str = Form(...),
    style: str = Form("poprock"),
    piano: float = Form(1.0),
    guitar: float = Form(1.0),
    bass: float = Form(1.0),
    synth: float = Form(1.0),
    drums: float = Form(1.0),
    autotune_mode: str = Form("medium"),   # NEW: 'subtle'|'medium'|'hard'|'all'
):
    try:
        uid = int(time.time())
        out_dir = os.path.join(BASE_OUT, f"run_{uid}")
        os.makedirs(out_dir, exist_ok=True)

        log(f"[PIPELINE] Style chosen: {style}")
        log(f"[PIPELINE] Autotune mode: {autotune_mode}")
        log("[PIPELINE] Starting arrangement...")

        mixer = {
            "piano": float(piano),
            "guitar": float(guitar),
            "bass": float(bass),
            "synth": float(synth),
            "drums": float(drums)
        }

        # full_run now accepts autotune_mode
        res = full_run(song, out_dir, style=style, mixer=mixer, autotune_mode=autotune_mode)

        log("[PIPELINE] Completed.")
        log("__PIPELINE_DONE__")

        # res contains keys: 'midi','instruments_wav','vocals', 'finals'
        # vocals and finals can be dicts when autotune_mode=='all'
        return {
            "midi": res.get("midi"),
            "instruments": res.get("instruments_wav"),
            "vocals": res.get("vocals"),     # str or dict
            "finals": res.get("finals"),     # str or dict
            "style": style,
            "mixer": mixer,
            "autotune_mode": autotune_mode
        }

    except Exception as e:
        log(f"[ERROR] {str(e)}")
        return {"error": str(e)}


@app.get("/download")
def download_file(file: str):
    if not os.path.exists(file):
        return JSONResponse({"error": "file not found"}, status_code=404)
    return FileResponse(file)

if __name__ == "__main__":
    # run with `python -m uvicorn backend.server:app` when using venv python
    uvicorn.run(app, host="0.0.0.0", port=5000)
