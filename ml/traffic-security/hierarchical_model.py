"""
Patchify + embedding, hierarchical attention (byte / packet / flow), and Phase C head.

Architecture:
- Convolutional patch embedding on Security Flow Image + position + CLS
- Byte-level encoder on payload byte tokens
- Packet-level encoder on [metadata packet, payload packet] summaries
- Flow-level encoder on session / rate features
- Latent fusion -> classification head (Linear, GELU, Dropout, Linear)
"""
from __future__ import annotations

from typing import Tuple

import numpy as np
import torch
import torch.nn as nn
from phase_a_preprocessing import SecurityFlow, feature_matrix, to_security_flow_image


class PatchifyEmbedding2d(nn.Module):
    """Convolution-based patch tokens from flow image."""

    def __init__(self, in_ch: int, d_model: int, patch: int = 4):
        super().__init__()
        self.proj = nn.Conv2d(in_ch, d_model, kernel_size=patch, stride=patch)
        self.patch = patch

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: B x 1 x C x H x W -> merge C into in_ch expected 2 under 1 conv: treat as in_ch=2
        h = self.proj(x.squeeze(1))  # B x d x H' x W'
        return h.flatten(2).transpose(1, 2)  # B x T x d


class HierarchicalSecurityEncoder(nn.Module):
    def __init__(self, d_model: int = 128, nhead: int = 4, ff: int = 256):
        super().__init__()
        self.d_model = d_model

        self.patch_embed = PatchifyEmbedding2d(in_ch=2, d_model=d_model, patch=4)
        n_patches = (32 // 4) ** 2  # 64
        self.patch_pos = nn.Parameter(torch.zeros(1, n_patches + 1, d_model))
        self.patch_cls = nn.Parameter(torch.zeros(1, 1, d_model))

        self.byte_embed = nn.Embedding(256, d_model)
        self.byte_pos = nn.Parameter(torch.zeros(1, 256 + 1, d_model))
        self.byte_cls = nn.Parameter(torch.zeros(1, 1, d_model))

        self.meta_proj = nn.Linear(d_model, d_model)
        self.body_proj = nn.Linear(d_model, d_model)
        self.packet_pos = nn.Parameter(torch.zeros(1, 3, d_model))
        self.packet_cls = nn.Parameter(torch.zeros(1, 1, d_model))

        self.flow_proj = nn.Sequential(
            nn.Linear(32, d_model),
            nn.GELU(),
            nn.Linear(d_model, d_model),
        )
        self.flow_pos = nn.Parameter(torch.zeros(1, 2, d_model))
        self.flow_cls = nn.Parameter(torch.zeros(1, 1, d_model))

        def enc_layer_fn(nh: int, drop: float) -> nn.TransformerEncoderLayer:
            return nn.TransformerEncoderLayer(
                d_model=d_model,
                nhead=nh,
                dim_feedforward=ff,
                batch_first=True,
                activation="gelu",
                dropout=drop,
                norm_first=True,
            )

        self.byte_encoder = nn.TransformerEncoder(enc_layer_fn(nhead, 0.1), num_layers=2)
        self.patch_encoder = nn.TransformerEncoder(enc_layer_fn(nhead, 0.1), num_layers=2)
        self.packet_encoder = nn.TransformerEncoder(enc_layer_fn(max(2, nhead // 2), 0.1), num_layers=2)
        self.flow_encoder = nn.TransformerEncoder(enc_layer_fn(2, 0.05), num_layers=1)

        self.level_attn = nn.MultiheadAttention(d_model, num_heads=nhead, batch_first=True)
        self.level_norm = nn.LayerNorm(d_model)
        self.fuse = nn.Linear(d_model * 4, d_model * 2)

    def _byte_forward(self, payload_tokens: torch.Tensor) -> torch.Tensor:
        b, l = payload_tokens.shape
        x = self.byte_embed(payload_tokens.clamp(0, 255))
        cls = self.byte_cls.expand(b, -1, -1)
        x = torch.cat([cls, x], dim=1)
        x = x + self.byte_pos[:, : x.size(1), :]
        out = self.byte_encoder(x)
        return out[:, 0, :]

    def _patch_forward(self, flow_img: torch.Tensor) -> torch.Tensor:
        b = flow_img.size(0)
        toks = self.patch_embed(flow_img)
        cls = self.patch_cls.expand(b, -1, -1)
        x = torch.cat([cls, toks], dim=1)
        x = x + self.patch_pos[:, : x.size(1), :]
        out = self.patch_encoder(x)
        return out[:, 0, :]

    def _packet_forward(
        self, meta_tokens: torch.Tensor, body_tokens: torch.Tensor
    ) -> torch.Tensor:
        b = meta_tokens.size(0)
        m = self.byte_embed(meta_tokens.clamp(0, 255).long()).mean(dim=1)
        p = self.byte_embed(body_tokens.clamp(0, 255).long()).mean(dim=1)
        t_meta = self.meta_proj(m).unsqueeze(1)
        t_body = self.body_proj(p).unsqueeze(1)
        cls = self.packet_cls.expand(b, -1, -1)
        x = torch.cat([cls, t_meta, t_body], dim=1) + self.packet_pos
        out = self.packet_encoder(x)
        return out[:, 0, :]

    def _flow_forward(self, flow_feats: torch.Tensor) -> torch.Tensor:
        b = flow_feats.size(0)
        t = self.flow_proj(flow_feats).unsqueeze(1)
        cls = self.flow_cls.expand(b, -1, -1)
        x = torch.cat([cls, t], dim=1) + self.flow_pos
        out = self.flow_encoder(x)
        return out[:, 0, :]

    def forward(
        self, flow_img: torch.Tensor, payload_tokens: torch.Tensor, meta_tokens: torch.Tensor, flow_feats: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        z_byte = self._byte_forward(payload_tokens)
        z_patch = self._patch_forward(flow_img)
        z_pkt = self._packet_forward(meta_tokens, payload_tokens)
        z_flow = self._flow_forward(flow_feats)
        stack = torch.stack([z_byte, z_patch, z_pkt, z_flow], dim=1)
        attn_out, _ = self.level_attn(stack, stack, stack)
        attn_out = self.level_norm(attn_out + stack)
        latent = self.fuse(attn_out.flatten(1))
        return latent, z_byte, z_patch, z_pkt, z_flow


class PhaseCClassifierHead(nn.Module):
    """Fine-tuning head: Linear -> GELU -> Dropout -> Linear."""

    def __init__(self, in_dim: int, num_classes: int = 3, p_drop: float = 0.15):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, in_dim),
            nn.GELU(),
            nn.Dropout(p_drop),
            nn.Linear(in_dim, num_classes),
        )

    def forward(self, latent: torch.Tensor) -> torch.Tensor:
        return self.net(latent)


class TrafficSecurityModel(nn.Module):
    LABELS = ("normal", "suspicious", "malicious")

    def __init__(self, d_model: int = 128):
        super().__init__()
        self.encoder = HierarchicalSecurityEncoder(d_model=d_model)
        self.head = PhaseCClassifierHead(in_dim=d_model * 2, num_classes=3)

    def encode(
        self, flow: SecurityFlow, device: torch.device
    ) -> tuple[torch.Tensor, dict[str, torch.Tensor]]:
        feats = feature_matrix(flow)
        img = to_security_flow_image(feats).to(device).unsqueeze(0)
        payload_t = (
            torch.as_tensor(feats["payload_prefix_tokens"], device=device).long().unsqueeze(0)
        )
        meta_t = torch.as_tensor(feats["meta_prefix"], device=device).long().unsqueeze(0)
        hist = feats["byte_histogram"]
        scal = feats["scalar_features"]
        fp = flow.requests_last_minute
        flow_vec = np.zeros(32, dtype=np.float32)
        flow_vec[:8] = scal
        hdown = hist[::11][:24]
        flow_vec[8:32] = hdown
        flow_vec[31] = min(1.0, fp / 500.0)
        ff = torch.from_numpy(flow_vec).to(device).unsqueeze(0)
        latent, zb, zp, zk, zf = self.encoder(img, payload_t, meta_t, ff)
        aux = {"z_byte": zb, "z_patch": zp, "z_packet": zk, "z_flow": zf}
        return latent, aux

    def forward(self, flow: SecurityFlow, device: torch.device) -> torch.Tensor:
        latent, _ = self.encode(flow, device)
        return self.head(latent)


def build_model() -> TrafficSecurityModel:
    return TrafficSecurityModel(d_model=128)


@torch.no_grad()
def logits_from_flow(model: TrafficSecurityModel, flow: SecurityFlow, device: torch.device) -> torch.Tensor:
    latent, _ = model.encode(flow, device)
    return model.head(latent)
