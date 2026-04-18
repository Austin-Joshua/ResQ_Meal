"""
Fruit/vegetable freshness evaluation.
Logic based on https://github.com/captraj/fruit-veg-freshness-ai
Uses MobileNetV2-based model; prediction is probability that item is fresh (0 = not fresh, 1 = fresh).
"""
import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Thresholds (from repo: lower value = more fresh in their model)
THRESHOLD_FRESH = float(os.environ.get("THRESHOLD_FRESH", "0.10"))
THRESHOLD_MEDIUM = float(os.environ.get("THRESHOLD_MEDIUM", "0.35"))


def get_classification(prediction: float) -> str:
    """Map raw prediction to fresh / medium_fresh / not_fresh."""
    if prediction < THRESHOLD_FRESH:
        return "fresh"
    if prediction < THRESHOLD_MEDIUM:
        return "medium_fresh"
    return "not_fresh"


def preprocess_image(image_path: str) -> np.ndarray:
    """Resize and normalize image for the model (100x100, RGB, 0-1)."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    img = cv2.resize(img, (100, 100))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)
    return img


def evaluate_freshness(image_path: str, model) -> float:
    """Run model on image; returns freshness score (higher = more fresh in typical setups)."""
    x = preprocess_image(image_path)
    pred = model.predict(x, verbose=0)
    return float(pred[0][0])
