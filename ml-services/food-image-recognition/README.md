# Food Image Recognition (Food-101 + Nutrition) API

ResQ Meal integration for [Food-Image-Recognition](https://github.com/MaharshSuryawala/Food-Image-Recognition) — **Inception-v3** trained on **Food-101** (101 classes). Upload an image → food class + optional **nutrition** (protein, fat, carbs, calcium, vitamins) from a static CSV or USDA.

## Setup

1. **Get model and nutrition data**
   ```bash
   git clone https://github.com/MaharshSuryawala/Food-Image-Recognition.git _upstream
   mkdir -p models
   cp _upstream/best_model_101class.hdf5 models/
   cp _upstream/nutrition101.csv .
   ```

2. **Install and run**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8005
   ```

Use a different port (e.g. 8005) if other services use 8000–8004.

## Endpoints

- **GET /health** — Service, model, and nutrition CSV status.
- **POST /evaluate** — Upload image (`file`). Returns:
  - `food_class`: slug (e.g. `apple_pie`)
  - `food_name`: display name (e.g. `apple pie`)
  - `confidence`: 0–1
  - `nutrition` (if nutrition101.csv is present): `protein_g`, `fat_g`, `carbohydrates_g`, `calcium_g`, `vitamins_g`

## ResQ Meal

Use this service to **classify food type** and **get nutrition** from a photo when posting surplus (e.g. auto-fill `food_type` or show nutrition on the post). Set `FOOD_IMAGE_RECOGNITION_URL=http://localhost:8005` in the backend and call it from your post-surplus or food-detail flow.
