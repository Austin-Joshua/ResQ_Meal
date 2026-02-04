# FreshVision (EfficientNet) API

ResQ Meal integration for [freshvision](https://github.com/devdezzies/freshvision) — EfficientNetB0 classifier for **apple**, **banana**, and **orange** (Fresh vs Rotten).

## Setup

1. **Get the model file**
   ```bash
   git clone https://github.com/devdezzies/freshvision.git _upstream
   mkdir -p models
   cp _upstream/models/effnetb0_freshvisionv0_10_epochs.pt models/
   ```

2. **Install and run**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8004
   ```

Use a different port (e.g. 8004) if other freshness services use 8000–8003.

## Endpoints

- **GET /health** — Service and model status.
- **POST /evaluate** — Upload image (`file`). Returns:
  - `classification`: `"fresh"` | `"rotten"`
  - `item_type`: `"apple"` | `"banana"` | `"orange"`
  - `confidence`: 0–1
  - `freshness_index`: 0–100 (for UI).

## ResQ Meal backend

Set `FRESHNESS_FRESHVISION_URL=http://localhost:8004` in the Node backend `.env` to use this model for **photo-based** freshness checks (best for single-fruit images: apple, banana, orange).
