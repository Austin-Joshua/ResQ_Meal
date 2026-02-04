"""
FastAPI wrapper for Freshness_detection (Roboflow YOLO).
https://github.com/Utkarsh-Shivhare/Freshness_detection

Uses Roboflow object detection to find fresh/rotten produce in images.
Requires ROBOFLOW_API_KEY (get from Roboflow). Optional: ROBOFLOW_PROJECT, ROBOFLOW_VERSION.

Run: uvicorn main:app --host 0.0.0.0 --port 8003
"""
import os
import tempfile
from pathlib import Path

import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from roboflow import Roboflow

from evaluate import aggregate_predictions

# Roboflow config: use your own API key (do not use the key from the original repo in production)
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "")
ROBOFLOW_PROJECT = os.environ.get("ROBOFLOW_PROJECT", "freshness-fruits-and-vegetables")
ROBOFLOW_VERSION = int(os.environ.get("ROBOFLOW_VERSION", "7"))

app = FastAPI(
    title="Freshness Detection (Roboflow YOLO)",
    description="ResQ Meal - Object detection for fresh/rotten produce (Utkarsh-Shivhare/Freshness_detection)",
    version="1.0.0",
)

_model = None


def get_model():
    global _model
    if _model is None:
        if not ROBOFLOW_API_KEY:
            raise ValueError(
                "ROBOFLOW_API_KEY is not set. "
                "Get an API key from https://app.roboflow.com and set ROBOFLOW_API_KEY."
            )
        rf = Roboflow(api_key=ROBOFLOW_API_KEY)
        project = rf.workspace().project(ROBOFLOW_PROJECT)
        _model = project.version(ROBOFLOW_VERSION).model
    return _model


@app.get("/health")
def health():
    try:
        get_model()
        return {"status": "ok", "model_loaded": True}
    except Exception as e:
        return {"status": "degraded", "model_loaded": False, "message": str(e)}


@app.post("/evaluate")
async def evaluate(file: UploadFile = File(...)):
    """Upload image; runs YOLO detection and returns classification (fresh/rotten/mixed) and freshness_index (0-100)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        model = get_model()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    suffix = Path(file.filename or "image").suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        image = cv2.imread(tmp_path)
        if image is None:
            raise HTTPException(status_code=400, detail="Could not read image")
        results = model.predict(image, confidence=40, overlap=30).json()
        predictions = results.get("predictions") or []
        classification, freshness_index = aggregate_predictions(predictions)
        # Normalize classification for backend: fresh | rotten | mixed
        return {
            "classification": classification,
            "freshness_index": freshness_index,
        }
    finally:
        if os.path.isfile(tmp_path):
            os.unlink(tmp_path)
