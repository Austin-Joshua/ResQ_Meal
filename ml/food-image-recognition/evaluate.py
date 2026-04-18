"""
Food-Image-Recognition inference: Food-101 classification + nutrition lookup.
Based on https://github.com/MaharshSuryawala/Food-Image-Recognition
InceptionV3, 299x299 input, 101 classes. Nutrition from nutrition101.csv or USDA API.
"""
import os
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image
from tensorflow.keras.applications.inception_v3 import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array

from classes import FOOD_101_CLASSES

INPUT_SIZE = (299, 299)


def load_nutrition_csv(csv_path: str) -> pd.DataFrame | None:
    """Load nutrition101.csv (columns: name, protein, calcium, fat, carbohydrates, vitamins)."""
    if not csv_path or not os.path.isfile(csv_path):
        return None
    df = pd.read_csv(csv_path)
    # Repo CSV may have unnamed index column; ensure 'name' exists
    if "name" not in df.columns:
        return None
    return df


def preprocess_image(image_path: str) -> np.ndarray:
    """Load image, resize to 299x299, apply InceptionV3 preprocessing. Shape (1, 299, 299, 3)."""
    img = Image.open(image_path).convert("RGB")
    img = img.resize(INPUT_SIZE, Image.Resampling.BILINEAR)
    arr = img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    return arr


def predict_and_nutrition(
    image_path: str,
    model,
    nutrition_df: pd.DataFrame | None,
) -> tuple[str, str, float, dict | None]:
    """
    Run model on image. Returns (food_class_id, food_name, confidence, nutrition_dict or None).
    """
    x = preprocess_image(image_path)
    pred = model.predict(x, verbose=0)
    class_idx = int(np.argmax(pred[0]))
    confidence = float(pred[0][class_idx])
    food_name = FOOD_101_CLASSES[class_idx] if class_idx < len(FOOD_101_CLASSES) else "unknown"
    food_class = food_name.replace(" ", "_").replace("-", "_")

    nutrition = None
    if nutrition_df is not None and "name" in nutrition_df.columns:
        row = nutrition_df[nutrition_df["name"].str.strip().str.lower() == food_name.strip().lower()]
        if not row.empty:
            r = row.iloc[0]
            nutrition = {
                "protein_g": float(r.get("protein", 0)) if pd.notna(r.get("protein")) else None,
                "calcium_g": float(r.get("calcium", 0)) if pd.notna(r.get("calcium")) else None,
                "fat_g": float(r.get("fat", 0)) if pd.notna(r.get("fat")) else None,
                "carbohydrates_g": float(r.get("carbohydrates", 0)) if pd.notna(r.get("carbohydrates")) else None,
                "vitamins_g": float(r.get("vitamins", 0)) if pd.notna(r.get("vitamins")) else None,
            }
    return food_class, food_name, confidence, nutrition
