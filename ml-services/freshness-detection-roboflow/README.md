# Freshness Detection (Roboflow YOLO) API

ResQ Meal integration for [Freshness_detection](https://github.com/Utkarsh-Shivhare/Freshness_detection) — YOLOv8 object detection via **Roboflow** to detect fresh vs rotten fruits and vegetables in images.

## Setup

1. **Get a Roboflow API key**
   - Sign up at [Roboflow](https://app.roboflow.com) and create or use a project.
   - The original repo uses project `freshness-fruits-and-vegetables` version 7. You can use the same project if you have access, or your own trained model.

2. **Install and run**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   set ROBOFLOW_API_KEY=your_api_key_here
   uvicorn main:app --host 0.0.0.0 --port 8003
   ```

Use a different port (e.g. 8003) if other freshness services use 8000–8002.

## Environment

- **ROBOFLOW_API_KEY** (required) — Your Roboflow API key.
- **ROBOFLOW_PROJECT** (optional) — Project slug (default: `freshness-fruits-and-vegetables`).
- **ROBOFLOW_VERSION** (optional) — Model version number (default: `7`).

## Endpoints

- **GET /health** — Service and model status.
- **POST /evaluate** — Upload image (`file`). Returns:
  - `classification`: `"fresh"` | `"rotten"` | `"mixed"`
  - `freshness_index`: 0–100 (for UI).

## ResQ Meal backend

Set `FRESHNESS_ROBOFLOW_URL=http://localhost:8003` in the Node backend `.env` to use this service for **photo-based** freshness checks (object detection over the whole image).
