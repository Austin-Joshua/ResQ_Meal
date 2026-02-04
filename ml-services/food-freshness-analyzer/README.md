# Food Freshness Analyzer (Environment) API

ResQ Meal integration for [Food-Freshness-Analyzer](https://github.com/Parabellum768/Food-Freshness-Analyzer) — predicts food freshness from **environmental data** (temperature, humidity, storage time, gas) using a RandomForest classifier. Classifies as **Fresh**, **Stale**, or **Spoiled**.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Use a different port (e.g. 8001) if [fruit-veg-freshness](https://github.com/captraj/fruit-veg-freshness-ai) is already on 8000.

## Endpoints

- **GET /health** — Service and model status.
- **POST /evaluate-environment** — JSON body:
  - `temperature` (number, °C)
  - `humidity` (number, %)
  - `time_stored_hours` (number)
  - `gas` (number, optional, default 200)

  Returns:
  - `classification`: `"fresh"` | `"stale"` | `"spoiled"`
  - `freshness_index`: 0–100 (for UI)

## ResQ Meal backend

Set `FRESHNESS_ENV_AI_URL=http://localhost:8001` in the Node backend `.env` to use this for **environment-based** checks (e.g. when user provides storage conditions instead of or in addition to a photo).
