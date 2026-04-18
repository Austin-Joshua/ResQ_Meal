"""
Traffic security ML service — real-time inference API (batch + cache + async-friendly).

Runs Phase A preprocessing and hierarchical encoder + Phase C head from hierarchical_model.
"""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
import hashlib
import os
import time
from collections import OrderedDict
from typing import Any

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from hierarchical_model import TrafficSecurityModel, build_model
from phase_a_preprocessing import parse_http_request_payload, pattern_boost_scores

MODEL_PATH = os.environ.get("TRAFFIC_SECURITY_MODEL_PATH", "")
MAX_CACHE = int(os.environ.get("TRAFFIC_SECURITY_CACHE_SIZE", "8192"))
CACHE_TTL_SEC = float(os.environ.get("TRAFFIC_SECURITY_CACHE_TTL", "60"))


class PredictItem(BaseModel):
    method: str = "GET"
    path: str = ""
    query: str = ""
    headers: dict[str, str] = Field(default_factory=dict)
    body_b64: str = ""
    ip: str = ""
    userId: str | None = None
    sessionId: str = ""
    requestsLastMinute: float = 0.0


class PredictBatchBody(BaseModel):
    items: list[PredictItem]


class TtlCache:
    def __init__(self, max_items: int, ttl_sec: float):
        self.max_items = max_items
        self.ttl_sec = ttl_sec
        self._data: OrderedDict[str, tuple[float, dict[str, Any]]] = OrderedDict()

    def get(self, key: str) -> dict[str, Any] | None:
        now = time.time()
        if key in self._data:
            ts, val = self._data[key]
            if now - ts < self.ttl_sec:
                self._data.move_to_end(key)
                return val
            del self._data[key]
        return None

    def put(self, key: str, val: dict[str, Any]) -> None:
        self._data[key] = (time.time(), val)
        self._data.move_to_end(key)
        while len(self._data) > self.max_items:
            self._data.popitem(last=False)


def cache_key(item: PredictItem) -> str:
    raw = f"{item.method}|{item.path}|{item.query}|{item.body_b64}|{item.requestsLastMinute:.1f}"
    return hashlib.sha256(raw.encode("utf-8", errors="ignore")).hexdigest()


def attack_families(flow, label: str) -> list[str]:
    from phase_a_preprocessing import SQLI_PATTERNS, XSS_PATTERNS, BOT_UA

    ua = flow.headers.get("User-Agent") or flow.headers.get("user-agent") or ""
    out: list[str] = []
    if SQLI_PATTERNS.search(flow.payload_text + flow.query):
        out.append("sql_injection")
    if XSS_PATTERNS.search(flow.payload_text + flow.query):
        out.append("xss")
    if BOT_UA.search(ua):
        out.append("bot_traffic")
    if flow.requests_last_minute > 200:
        out.append("ddos_pattern")
    if label == "suspicious" and not out:
        out.append("suspicious_behavior")
    return out


def predict_one_item(
    model: TrafficSecurityModel, device: torch.device, item: PredictItem
) -> dict[str, Any]:
    flow = parse_http_request_payload(item.model_dump())
    logits = model(flow, device).squeeze(0)
    boost = pattern_boost_scores(flow).to(device)
    logits = logits + boost.to(logits.dtype)
    probs = torch.softmax(logits, dim=-1)
    idx = int(torch.argmax(probs).item())
    label = TrafficSecurityModel.LABELS[idx]
    conf = float(probs[idx].item())
    families = attack_families(flow, label)
    return {
        "label": label,
        "confidence": conf,
        "probabilities": {
            "normal": float(probs[0].item()),
            "suspicious": float(probs[1].item()),
            "malicious": float(probs[2].item()),
        },
        "attack_families": families,
    }


cache = TtlCache(MAX_CACHE, CACHE_TTL_SEC)
app_state: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model().to(device).eval()
    if MODEL_PATH and os.path.isfile(MODEL_PATH):
        try:
            state = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        except TypeError:
            state = torch.load(MODEL_PATH, map_location=device)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        missing, unexpected = model.load_state_dict(state, strict=False)
        if missing or unexpected:
            print("load_state_dict:", "missing", missing, "unexpected", unexpected)
    app_state["model"] = model
    app_state["device"] = device
    yield
    app_state.clear()


app = FastAPI(title="ResQ Traffic Security ML", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "model": "traffic_security_v1"}


@app.post("/internal/predict")
async def predict(item: PredictItem):
    key = cache_key(item)
    hit = cache.get(key)
    if hit is not None:
        return {"cached": True, **hit}
    model = app_state.get("model")
    device = app_state.get("device")
    if model is None or device is None:
        raise HTTPException(503, "Model not ready")
    loop = asyncio.get_event_loop()
    out = await loop.run_in_executor(None, lambda: predict_one_item(model, device, item))
    cache.put(key, out)
    return {"cached": False, **out}


@app.post("/internal/predict/batch")
async def predict_batch(body: PredictBatchBody):
    model = app_state.get("model")
    device = app_state.get("device")
    if model is None or device is None:
        raise HTTPException(503, "Model not ready")
    results: list[dict[str, Any]] = []
    loop = asyncio.get_event_loop()

    def run_batch():
        batch_out = []
        for it in body.items:
            key = cache_key(it)
            hit = cache.get(key)
            if hit is not None:
                batch_out.append({"cached": True, **hit})
            else:
                o = predict_one_item(model, device, it)
                cache.put(key, o)
                batch_out.append({"cached": False, **o})
        return batch_out

    results = await loop.run_in_executor(None, run_batch)
    return {"results": results}


def main():
    import uvicorn

    port = int(os.environ.get("TRAFFIC_SECURITY_ML_PORT", "8091"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, workers=1)


if __name__ == "__main__":
    main()
