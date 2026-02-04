# Fruit-Veg Freshness API

ResQ Meal integration for [fruit-veg-freshness-ai](https://github.com/captraj/fruit-veg-freshness-ai) — an AI model that classifies fruit/vegetable freshness from an image (MobileNetV2-based).

## Setup

1. **Clone the model repo and copy the model file**

   ```bash
   git clone https://github.com/captraj/fruit-veg-freshness-ai.git _upstream
   cp _upstream/rottenvsfresh98pval.h5 .
   ```

2. **Create a virtualenv and install dependencies**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   # source .venv/bin/activate  # Linux/macOS
   pip install -r requirements.txt
   ```

3. **Run the API**

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Endpoints

- **GET /health** — Check if the service and model are ready.
- **POST /evaluate** — Upload an image (`file`); returns:
  - `prediction`: raw model output (0–1)
  - `classification`: `"fresh"` | `"medium_fresh"` | `"not_fresh"`
  - `freshness_index`: 0–100 for UI (100 = freshest)

## Environment

- `FRESHNESS_MODEL_PATH` — Path to the `.h5` model file (default: `rottenvsfresh98pval.h5` in this directory).
- `THRESHOLD_FRESH`, `THRESHOLD_MEDIUM` — Classification thresholds (see `evaluate.py`).

## ResQ Meal backend

Set `FRESHNESS_AI_URL=http://localhost:8000` in the Node backend `.env` so the Food Quality Verification service calls this API when assessing food photos.
