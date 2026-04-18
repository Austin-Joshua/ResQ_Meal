"""
Phase A — Pre-processing (security data pipeline).

Converts HTTP traffic into structured security flows, packet splits, feature matrices,
and Security Flow Images for downstream patchify + embedding.
"""
from __future__ import annotations

import base64
import hashlib
import math
import re
from dataclasses import dataclass
from typing import Any

import numpy as np
import torch

SQLI_PATTERNS = re.compile(
    r"(?i)(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|;--|'\s*or\s*'1'\s*=\s*'1|benchmark\s*\(|sleep\s*\(|waitfor\s+delay|exec\s*\(|information_schema)",
    re.IGNORECASE,
)
XSS_PATTERNS = re.compile(
    r"(?i)(<script|javascript:|onerror\s*=|onload\s*=|eval\s*\(|document\.cookie|<iframe)",
)
BOT_UA = re.compile(
    r"(?i)(bot|crawler|spider|scraper|curl|wget|python-requests|httpclient|go-http|java/)",
)


@dataclass
class SecurityFlow:
    method: str
    path: str
    query: str
    headers: dict[str, str]
    payload_text: str
    payload_bytes: bytes
    ip: str
    user_id: str | None
    session_id: str
    requests_last_minute: float


def _safe_b64_decode(raw: str | None) -> bytes:
    if not raw:
        return b""
    try:
        pad = "=" * (-len(raw) % 4)
        return base64.urlsafe_b64decode(raw + pad)
    except Exception:
        try:
            return base64.b64decode(raw, validate=False)
        except Exception:
            return raw.encode("utf-8", errors="replace")


def parse_http_request_payload(item: dict[str, Any]) -> SecurityFlow:
    body = item.get("body_b64")
    if body is None and "body" in item:
        body_bytes = (
            item["body"].encode("utf-8", errors="replace")
            if isinstance(item["body"], str)
            else bytes(item["body"])
        )
    else:
        body_bytes = _safe_b64_decode(body) if isinstance(body, str) else b""

    headers = item.get("headers") or {}
    if not isinstance(headers, dict):
        headers = {}

    return SecurityFlow(
        method=str(item.get("method", "GET")).upper(),
        path=str(item.get("path", "")),
        query=str(item.get("query", "")),
        headers={str(k): str(v) for k, v in headers.items()},
        payload_text=body_bytes.decode("utf-8", errors="replace"),
        payload_bytes=body_bytes[: 64 * 1024],
        ip=str(item.get("ip", "")),
        user_id=str(item["userId"]) if item.get("userId") is not None else None,
        session_id=str(item.get("sessionId", "")),
        requests_last_minute=float(item.get("requestsLastMinute", 0.0)),
    )


def split_packets(flow: SecurityFlow) -> tuple[bytes, bytes]:
    """Split traffic into header metadata blob and payload body bytes."""
    header_lines = [f"{k}: {v}" for k, v in sorted(flow.headers.items())]
    meta = ("\n".join(header_lines) + f"\n{flow.method} {flow.path} {flow.query}").encode(
        "utf-8", errors="replace"
    )[:4096]
    return meta, flow.payload_bytes


def feature_matrix(flow: SecurityFlow) -> dict[str, np.ndarray]:
    """Request frequency / payload patterns / token sequences as numerical features."""
    meta, body = split_packets(flow)
    ua = flow.headers.get("User-Agent") or flow.headers.get("user-agent") or ""
    sql_hits = len(SQLI_PATTERNS.findall(flow.payload_text + flow.query))
    xss_hits = len(XSS_PATTERNS.findall(flow.payload_text + flow.query))
    bot_ua = 1.0 if BOT_UA.search(ua) else 0.0
    rate = float(flow.requests_last_minute)
    burst = 1.0 if rate > 120 else rate / 120.0

    # Byte histogram (256) + meta stats
    hist = np.zeros(256, dtype=np.float32)
    for b in body[:8192]:
        hist[b] += 1.0
    if hist.sum() > 0:
        hist = hist / hist.sum()

    ent = 0.0
    for p in hist:
        if p > 0:
            ent -= float(p * math.log(p + 1e-12))
    ent /= math.log(256) + 1e-12

    token_ascii = np.frombuffer(body[:512].ljust(512, b"\x00"), dtype=np.uint8).astype(np.float32)

    feats = np.array(
        [
            sql_hits,
            xss_hits,
            bot_ua,
            burst,
            ent,
            len(body) / 8192.0,
            len(meta) / 2048.0,
            1.0 if flow.method in {"POST", "PUT", "PATCH", "DELETE"} else 0.0,
        ],
        dtype=np.float32,
    )

    return {
        "byte_histogram": hist,
        "scalar_features": feats,
        "payload_prefix_tokens": token_ascii,
        "meta_prefix": np.frombuffer(meta[:256].ljust(256, b"\x00"), dtype=np.uint8).astype(
            np.float32
        ),
    }


def to_security_flow_image(feats: dict[str, np.ndarray]) -> torch.Tensor:
    """
    Phase A output: multi-channel 'Security Flow Image' (C x H x W) from histogram + scalars.
    """
    hist_plane = feats["byte_histogram"].reshape(16, 16).astype(np.float32)
    scal = feats["scalar_features"]
    scalar_plane = np.zeros((16, 16), dtype=np.float32)
    scalar_plane.ravel()[: scal.shape[0]] = scal
    img = np.stack([hist_plane, scalar_plane], axis=0)  # 2 x 16 x 16
    img2 = np.kron(img, np.ones((2, 2), dtype=np.float32))  # 2 x 32 x 32
    t = torch.from_numpy(img2).unsqueeze(0)  # 1 x 2 x 32 x 32
    return torch.clamp(t, 0.0, 1.0)


def flow_fingerprint(flow: SecurityFlow) -> str:
    raw = f"{flow.ip}|{flow.session_id}|{flow.user_id or ''}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def augment_flow_unlabeled(flow: SecurityFlow, rng: np.random.Generator) -> SecurityFlow:
    """Phase B: synthetic augmentation for self-supervised views."""
    body = bytearray(flow.payload_bytes)
    if len(body) > 8 and rng.random() < 0.3:
        i = int(rng.integers(0, len(body) - 1))
        body[i] = (body[i] + int(rng.integers(1, 20))) % 256
    hdr = dict(flow.headers)
    if rng.random() < 0.2 and hdr:
        k = rng.choice(list(hdr.keys()))
        hdr[k] = hdr[k][: max(0, len(hdr[k]) - 2)]
    return SecurityFlow(
        method=flow.method,
        path=flow.path,
        query=flow.query,
        headers=hdr,
        payload_text=bytes(body).decode("utf-8", errors="replace"),
        payload_bytes=bytes(body),
        ip=flow.ip,
        user_id=flow.user_id,
        session_id=flow.session_id,
        requests_last_minute=max(0.0, flow.requests_last_minute + rng.normal(0, 5)),
    )


def pattern_boost_scores(flow: SecurityFlow) -> torch.Tensor:
    """Hand-crafted security signals fused at inference (complements learned weights)."""
    sql_hits = len(SQLI_PATTERNS.findall(flow.payload_text + flow.query))
    xss_hits = len(XSS_PATTERNS.findall(flow.payload_text + flow.query))
    ua = flow.headers.get("User-Agent") or flow.headers.get("user-agent") or ""
    bot = 1.0 if BOT_UA.search(ua) else 0.0
    ddos = 1.0 if flow.requests_last_minute > 300 else flow.requests_last_minute / 300.0
    mal = min(6.0, sql_hits * 2.0 + xss_hits * 1.5 + bot * 1.2 + ddos * 1.5)
    susp = min(4.0, 0.3 * mal + (1.0 if bot else 0.0) + (0.5 if ddos > 0.5 else 0.0))
    return torch.tensor([0.0, susp, mal], dtype=torch.float32)
