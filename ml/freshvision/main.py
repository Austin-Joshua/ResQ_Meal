"""
FastAPI wrapper for FreshVision (EfficientNetB0 freshness).
https://github.com/devdezzies/freshvision

Classifies apple, banana, orange as Fresh or Rotten. Requires cloned repo and model file.

Run: uvicorn main:app --host 0.0.0.0 --port 8004
"""
import os
import tempfile
from pathlib import Path

import torch
from fastapi import FastAPI, File, UploadFile, HTTPException

from model_builder import create_model_baseline_effnetb0
from evaluate import predict

MODEL_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = MODEL_DIR / "models" / "effnetb0_freshvisionv0_10_epochs.pt"
MODEL_PATH = os.environ.get("FRESHVISION_MODEL_PATH", str(DEFAULT_MODEL))

app = FastAPI(
    title="FreshVision (EfficientNet)",
    description="ResQ Meal - Fresh/rotten classifier for apple, banana, orange (devdezzies/freshvision)",
    version="1.0.0",
)

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None


def get_model():
    global _model
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}. "
                "Clone https://github.com/devdezzies/freshvision and copy models/effnetb0_freshvisionv0_10_epochs.pt "
                "to this service's models/ folder, or set FRESHVISION_MODEL_PATH."
            )
        _model = create_model_baseline_effnetb0(out_feats=6, device=_device)
        try:
            _model.load_state_dict(torch.load(MODEL_PATH, map_location=_device, weights_only=True))
        except TypeError:
            _model.load_state_dict(torch.load(MODEL_PATH, map_location=_device))
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
    """Upload image; returns classification (fresh/rotten), item_type, freshness_index (0-100)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
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
        classification, item_type, confidence = predict(tmp_path, model, _device)
        freshness_index = round(confidence * 100) if classification == "fresh" else round((1 - confidence) * 100)
        freshness_index = max(0, min(100, freshness_index))
        return {
            "classification": classification,
            "item_type": item_type,
            "confidence": round(confidence, 4),
            "freshness_index": freshness_index,
        }
    finally:
        if os.path.isfile(tmp_path):
            os.unlink(tmp_path)
