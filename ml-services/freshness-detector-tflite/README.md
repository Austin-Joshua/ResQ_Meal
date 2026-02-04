# Freshness Detector (TFLite) API

ResQ Meal integration for [Freshness-Detector](https://github.com/Kayuemkhan/Freshness-Detector) — TensorFlow Lite model that classifies fruits/vegetables as **fresh** or **stale** for 6 item types: apple, banana, bitter gourd, capsicum, orange, tomato.

## Setup

1. **Get the TFLite model**

   ```bash
   git clone https://github.com/Kayuemkhan/Freshness-Detector.git _upstream
   cp _upstream/app/src/main/ml/model.tflite .
   ```

2. **Install and run**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8002
   ```

Use a different port (e.g. 8002) if other freshness services use 8000/8001.

## Endpoints

- **GET /health** — Service and model status.
- **POST /evaluate** — Upload image (`file`). Returns:
  - `classification`: `"fresh"` | `"stale"`
  - `item_type`: `"apple"` | `"banana"` | `"bitter_gourd"` | `"capsicum"` | `"orange"` | `"tomato"`
  - `freshness_index`: 0–100 (for UI).

## ResQ Meal backend

Set `FRESHNESS_TFLITE_URL=http://localhost:8002` in the Node backend `.env` to use this model for **photo-based** freshness checks (alternative or fallback to fruit-veg-freshness-ai).
