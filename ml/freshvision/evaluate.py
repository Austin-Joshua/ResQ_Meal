"""
FreshVision inference: EfficientNetB0 for apple, banana, orange (fresh/rotten).
Based on https://github.com/devdezzies/freshvision
"""
import os
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

# Class names from app.py (order must match model output indices)
CLASS_NAMES = [
    "Fresh Apple",
    "Fresh Banana",
    "Fresh Orange",
    "Rotten Apple",
    "Rotten Banana",
    "Rotten Orange",
]

# ImageNet normalization (same as repo)
NORMALIZE = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225],
)

IMAGE_TRANSFORM = transforms.Compose([
    transforms.Resize(size=(224, 224)),
    transforms.ToTensor(),
    NORMALIZE,
])


def predict(image_path: str, model: torch.nn.Module, device: torch.device) -> tuple[str, str, float]:
    """
    Run model on image. Returns (classification: 'fresh'|'rotten', item_type: str, confidence: 0-1).
    """
    img = Image.open(image_path).convert("RGB")
    x = IMAGE_TRANSFORM(img).unsqueeze(0).to(device)
    model.eval()
    with torch.inference_mode():
        logits = model(x)
        probs = torch.softmax(logits, dim=-1)
        pred_idx = probs.argmax(dim=-1).item()
        confidence = probs[0, pred_idx].item()
    class_name = CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else "Fresh Orange"
    is_fresh = class_name.startswith("Fresh ")
    item_type = class_name.replace("Fresh ", "").replace("Rotten ", "").lower()
    classification = "fresh" if is_fresh else "rotten"
    return classification, item_type, confidence
