"""
FastAPI wrapper for fruit-veg-freshness-ai model.
https://github.com/captraj/fruit-veg-freshness-ai

Run: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from tensorflow.keras.models import load_model

from evaluate import evaluate_freshness, get_classification

# Model path: clone repo and copy rottenvsfresh98pval.h5 here, or set MODEL_PATH
MODEL_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = MODEL_DIR / "rottenvsfresh98pval.h5"
MODEL_PATH = os.environ.get("FRESHNESS_MODEL_PATH", str(DEFAULT_MODEL))

app = FastAPI(
    title="Fruit-Veg Freshness API",
    description="ResQ Meal - Freshness classification for fruits/vegetables (fruit-veg-freshness-ai)",
    version="1.0.0",
)

# Load model once at startup (optional; if missing, /evaluate will return 503 until model is available)
_model = None


def get_model():
    global _model
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}. "
                "Clone https://github.com/captraj/fruit-veg-freshness-ai and copy rottenvsfresh98pval.h5 here, "
                "or set FRESHNESS_MODEL_PATH."
            )
        _model = load_model(MODEL_PATH)
    return _model


@app.get("/health")
def health():
    try:
        get_model()
        return {"status": "ok", "model_loaded": True}
    except FileNotFoundError as e:
        return {"status": "degraded", "model_loaded": False, "message": str(e)}


@app.post("/evaluate")
async def evaluate(file: UploadFile = File(...)):
    """Upload an image; returns prediction and freshness classification."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, etc.)")
    try:
        model = get_model()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    suffix = Path(file.filename or "image").suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        prediction = evaluate_freshness(tmp_path, model)
        classification = get_classification(prediction)
        # Freshness index 0-100 for UI (invert if model uses "rotten" as high)
        freshness_index = round((1.0 - prediction) * 100) if prediction <= 1.0 else round(prediction * 100)
        freshness_index = max(0, min(100, freshness_index))
        return {
            "prediction": round(prediction, 4),
            "classification": classification,
            "freshness_index": freshness_index,
        }
    finally:
        if os.path.isfile(tmp_path):
            os.unlink(tmp_path)
