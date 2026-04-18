"""
Phase C — Fine-tuning & evaluation (labeled attack data).

Classifier: pretrained encoder (or joint) + Linear / GELU / Dropout head.
Labels: 0 normal, 1 suspicious, 2 malicious.
"""
from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F

from hierarchical_model import TrafficSecurityModel
from phase_a_preprocessing import SecurityFlow


class FineTuneWrapper(nn.Module):
    def __init__(self, base: TrafficSecurityModel):
        super().__init__()
        self.base = base

    def forward_batch(self, flows: list[SecurityFlow], device: torch.device) -> torch.Tensor:
        self.base.eval()
        logits = []
        for f in flows:
            logits.append(self.base(f, device))
        return torch.cat(logits, dim=0)


def classification_loss(logits: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
    return F.cross_entropy(logits, labels)


def train_finetune_step(
    model: TrafficSecurityModel,
    flows: list[SecurityFlow],
    labels: torch.Tensor,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> float:
    model.train()
    logits = []
    for i, fl in enumerate(flows):
        logits.append(model(fl, device))
    logits = torch.cat(logits, dim=0)
    loss = classification_loss(logits, labels.to(device))
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return float(loss.detach().cpu())
