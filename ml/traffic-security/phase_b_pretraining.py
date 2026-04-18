"""
Phase B — Pre-training (self-supervised security learning).

Augmented views of traffic flows, encoder pass, contrastive loss (InfoNCE-style)
on fused latent representations (normal vs abnormal structure).
"""
from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from hierarchical_model import HierarchicalSecurityEncoder
from phase_a_preprocessing import SecurityFlow, augment_flow_unlabeled


class ContrastiveSecurityPretrainer(nn.Module):
    def __init__(self, d_model: int = 128, proj_dim: int = 64):
        super().__init__()
        self.encoder = HierarchicalSecurityEncoder(d_model=d_model)
        self.proj = nn.Sequential(
            nn.Linear(d_model * 2, d_model),
            nn.GELU(),
            nn.Linear(d_model, proj_dim),
        )

    def encode_latent(
        self, flow_img, payload_tokens, meta_tokens, flow_feats
    ) -> torch.Tensor:
        latent, _, _, _, _ = self.encoder(flow_img, payload_tokens, meta_tokens, flow_feats)
        z = self.proj(latent)
        return F.normalize(z, dim=-1)

    def contrastive_loss(self, z1: torch.Tensor, z2: torch.Tensor, temperature: float = 0.1) -> torch.Tensor:
        """Symmetric InfoNCE across batch (rows = samples)."""
        b = z1.size(0)
        logits = z1 @ z2.T / temperature
        targets = torch.arange(b, device=z1.device)
        loss_a = F.cross_entropy(logits, targets)
        loss_b = F.cross_entropy(logits.T, targets)
        return (loss_a + loss_b) * 0.5


def flows_to_batch_tensors(flows: list[SecurityFlow], device: torch.device):
    from phase_a_preprocessing import feature_matrix, to_security_flow_image

    imgs, pays, metas, ffs = [], [], [], []
    for fl in flows:
        feats = feature_matrix(fl)
        imgs.append(to_security_flow_image(feats))
        pays.append(torch.as_tensor(feats["payload_prefix_tokens"]).long())
        metas.append(torch.as_tensor(feats["meta_prefix"]).long())
        hist = feats["byte_histogram"]
        scal = feats["scalar_features"]
        fp = fl.requests_last_minute
        fv = np.zeros(32, dtype=np.float32)
        fv[:8] = scal
        fv[8:32] = hist[::11][:24]
        fv[31] = min(1.0, fp / 500.0)
        ffs.append(torch.from_numpy(fv))
    return (
        torch.stack(imgs).to(device),
        torch.stack(pays).to(device),
        torch.stack(metas).to(device),
        torch.stack(ffs).to(device),
    )


def train_pretrain_step(
    model: ContrastiveSecurityPretrainer,
    flows: list[SecurityFlow],
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    rng: np.random.Generator,
) -> float:
    model.train()
    v1 = [augment_flow_unlabeled(f, rng) for f in flows]
    v2 = [augment_flow_unlabeled(f, rng) for f in flows]
    a1 = flows_to_batch_tensors(v1, device)
    a2 = flows_to_batch_tensors(v2, device)
    z1 = model.encode_latent(*a1)
    z2 = model.encode_latent(*a2)
    loss = model.contrastive_loss(z1, z2)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return float(loss.detach().cpu())
