"""
Freshness-Detector TFLite inference.
Based on https://github.com/Kayuemkhan/Freshness-Detector
12 classes: fresh_apple, stale_apple, fresh_banana, stale_banana, fresh_bitter_gourd,
stale_bitter_gourd, fresh_capsicum, stale_capsicum, fresh_orange, stale_orange,
fresh_tomato, stale_tomato.
"""
import os
import numpy as np
from PIL import Image

# Class names in model output order (index 0-11)
CLASS_NAMES = [
    "fresh_apple", "stale_apple",
    "fresh_banana", "stale_banana",
    "fresh_bitter_gourd", "stale_bitter_gourd",
    "fresh_capsicum", "stale_capsicum",
    "fresh_orange", "stale_orange",
    "fresh_tomato", "stale_tomato",
]

ITEM_TYPES = ["apple", "banana", "bitter_gourd", "capsicum", "orange", "tomato"]


def preprocess_image(image_path: str, input_height: int, input_width: int, dtype_name: str) -> np.ndarray:
    """Load image, resize to model input size, normalize. Returns shape (1, H, W, 3)."""
    img = Image.open(image_path).convert("RGB")
    img = img.resize((input_width, input_height), Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    if dtype_name == "uint8":
        arr = (arr * 255).astype(np.uint8)
    arr = np.expand_dims(arr, axis=0)
    return arr


def run_inference(interpreter, image_path: str) -> tuple[str, str, int]:
    """
    Run TFLite model on image.
    Returns (classification: 'fresh'|'stale', item_type: str, freshness_index: 0-100).
    """
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    shape = input_details[0]["shape"]
    dtype = input_details[0]["dtype"]
    dtype_name = np.dtype(dtype).name if hasattr(dtype, "name") else str(dtype)
    h, w = int(shape[1]), int(shape[2])

    input_data = preprocess_image(image_path, h, w, dtype_name)
    if dtype_name == "uint8" and input_data.dtype != np.uint8:
        scale, zero_point = input_details[0].get("quantization", (1.0, 0))
        input_data = np.round(input_data / scale + zero_point).astype(np.uint8)

    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]["index"])[0]

    class_idx = int(np.argmax(output))
    class_name = CLASS_NAMES[class_idx] if class_idx < len(CLASS_NAMES) else "fresh_tomato"
    is_fresh = class_name.startswith("fresh_")
    item_type = class_name.replace("fresh_", "").replace("stale_", "")
    confidence = float(output[class_idx]) if len(output) > class_idx else 1.0
    freshness_index = round(confidence * 100) if is_fresh else round((1 - confidence) * 100)
    freshness_index = max(0, min(100, freshness_index))
    if not is_fresh:
        freshness_index = min(freshness_index, 45)

    classification = "fresh" if is_fresh else "stale"
    return classification, item_type, freshness_index
