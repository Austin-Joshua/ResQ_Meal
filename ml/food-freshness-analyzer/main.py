"""
FastAPI wrapper for Food-Freshness-Analyzer (environment-based freshness).
https://github.com/Parabellum768/Food-Freshness-Analyzer

Uses temperature, humidity, storage time, and optional gas to classify Fresh / Stale / Spoiled.

Run: uvicorn main:app --host 0.0.0.0 --port 8001
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from model import train_model, predict_freshness

app = FastAPI(
    title="Food Freshness Analyzer (Environment)",
    description="ResQ Meal - Freshness from environmental data (Food-Freshness-Analyzer)",
    version="1.0.0",
)

# Train once at startup
_scaler = None
_model = None


def get_model():
    global _scaler, _model
    if _scaler is None or _model is None:
        _scaler, _model = train_model()
    return _scaler, _model


class EvaluateRequest(BaseModel):
    temperature: float = Field(..., ge=-10, le=50, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    time_stored_hours: float = Field(..., ge=0, le=168, description="Storage time in hours")
    gas: float = Field(default=200.0, ge=0, le=1000, description="Gas concentration (optional)")


@app.get("/health")
def health():
    try:
        get_model()
        return {"status": "ok", "model_loaded": True}
    except Exception as e:
        return {"status": "degraded", "model_loaded": False, "message": str(e)}


@app.post("/evaluate-environment")
def evaluate_environment(body: EvaluateRequest):
    """Predict freshness from environmental data. Returns classification and freshness_index (0-100)."""
    scaler, model = get_model()
    label, freshness_index = predict_freshness(
        scaler,
        model,
        body.temperature,
        body.humidity,
        body.time_stored_hours,
        body.gas,
    )
    return {
        "classification": label.lower(),
        "freshness_index": freshness_index,
    }
