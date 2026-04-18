"""
FastAPI wrapper for Food-Image-Recognition (Food-101 classification + nutrition).
https://github.com/MaharshSuryawala/Food-Image-Recognition

Upload image → food class (101 classes) + optional nutrition (protein, fat, etc.).

Run: uvicorn main:app --host 0.0.0.0 --port 8005
"""
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from tensorflow.keras.models import load_model

from evaluate import load_nutrition_csv, predict_and_nutrition

MODEL_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = MODEL_DIR / "models" / "best_model_101class.hdf5"
DEFAULT_NUTRITION_CSV = MODEL_DIR / "nutrition101.csv"
MODEL_PATH = os.environ.get("FOOD_IMAGE_RECOGNITION_MODEL_PATH", str(DEFAULT_MODEL))
NUTRITION_CSV_PATH = os.environ.get("FOOD_IMAGE_RECOGNITION_NUTRITION_CSV", str(DEFAULT_NUTRITION_CSV))

app = FastAPI(
    title="Food Image Recognition (Food-101 + Nutrition)",
    description="ResQ Meal - Food classification and nutrition from image (MaharshSuryawala/Food-Image-Recognition)",
    version="1.0.0",
)

_model = None
_nutrition_df = None


def get_model():
    global _model
    if _model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}. "
                "Clone https://github.com/MaharshSuryawala/Food-Image-Recognition and copy "
                "best_model_101class.hdf5 to this service's models/ folder, or set FOOD_IMAGE_RECOGNITION_MODEL_PATH."
            )
        _model = load_model(MODEL_PATH)
    return _model


def get_nutrition_df():
    global _nutrition_df
    if _nutrition_df is None:
        _nutrition_df = load_nutrition_csv(NUTRITION_CSV_PATH)
    return _nutrition_df


@app.get("/health")
def health():
    try:
        get_model()
        return {"status": "ok", "model_loaded": True, "nutrition_loaded": get_nutrition_df() is not None}
    except FileNotFoundError as e:
        return {"status": "degraded", "model_loaded": False, "message": str(e)}


@app.post("/evaluate")
async def evaluate(file: UploadFile = File(...)):
    """Upload image; returns food_class, food_name, confidence, and optional nutrition."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        model = get_model()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    nutrition_df = get_nutrition_df()

    suffix = Path(file.filename or "image").suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        food_class, food_name, confidence, nutrition = predict_and_nutrition(tmp_path, model, nutrition_df)
        out = {
            "food_class": food_class,
            "food_name": food_name,
            "confidence": round(confidence, 4),
        }
        if nutrition:
            out["nutrition"] = nutrition
        return out
    finally:
        if os.path.isfile(tmp_path):
            os.unlink(tmp_path)
