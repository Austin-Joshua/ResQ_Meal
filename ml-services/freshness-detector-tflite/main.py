"""
FastAPI wrapper for Freshness-Detector (TensorFlow Lite).
https://github.com/Kayuemkhan/Freshness-Detector

12 classes: 6 items × (fresh / stale). Upload image → classification + item type.

Run: uvicorn main:app --host 0.0.0.0 --port 8002
"""
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
import tensorflow.lite as tflite

from evaluate import run_inference

MODEL_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = MODEL_DIR / "model.tflite"
MODEL_PATH = os.environ.get("TFLITE_FRESHNESS_MODEL_PATH", str(DEFAULT_MODEL))

app = FastAPI(
    title="Freshness Detector (TFLite)",
    description="ResQ Meal - Fresh/stale classification for 6 fruits/vegetables (Kayuemkhan/Freshness-Detector)",
    version="1.0.0",
)

_interpreter = None


def get_interpreter():
    global _interpreter
    if _interpreter is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}. "
                "Clone https://github.com/Kayuemkhan/Freshness-Detector and copy app/src/main/ml/model.tflite here, "
                "or set TFLITE_FRESHNESS_MODEL_PATH."
            )
        _interpreter = tflite.Interpreter(model_path=MODEL_PATH)
        _interpreter.allocate_tensors()
    return _interpreter


@app.get("/health")
def health():
    try:
        get_interpreter()
        return {"status": "ok", "model_loaded": True}
    except FileNotFoundError as e:
        return {"status": "degraded", "model_loaded": False, "message": str(e)}


@app.post("/evaluate")
async def evaluate(file: UploadFile = File(...)):
    """Upload image; returns classification (fresh/stale), item_type, freshness_index (0-100)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        interpreter = get_interpreter()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    suffix = Path(file.filename or "image").suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        classification, item_type, freshness_index = run_inference(interpreter, tmp_path)
        return {
            "classification": classification,
            "item_type": item_type,
            "freshness_index": freshness_index,
        }
    finally:
        if os.path.isfile(tmp_path):
            os.unlink(tmp_path)
