"""
Aggregate Roboflow object-detection predictions into a single freshness verdict.
Based on https://github.com/Utkarsh-Shivhare/Freshness_detection
Predictions have 'class', 'confidence'. We treat classes containing rotten/stale/bad as bad.
"""
import re

# Class name patterns that indicate not fresh (case-insensitive)
NOT_FRESH_PATTERNS = re.compile(
    r"rotten|stale|bad|spoiled|decay|mold|damaged",
    re.I,
)


def is_fresh_class(class_name: str) -> bool:
    """True if the class name indicates fresh produce."""
    if not class_name:
        return True
    return NOT_FRESH_PATTERNS.search(class_name) is None


def aggregate_predictions(predictions: list) -> tuple[str, int]:
    """
    Reduce list of predictions to classification and freshness_index.
    predictions: list of dicts with 'class' and 'confidence'.
    Returns (classification: 'fresh'|'rotten'|'mixed', freshness_index: 0-100).
    """
    if not predictions:
        return "fresh", 70  # no detections -> assume acceptable

    fresh_confidences = []
    rotten_confidences = []
    for p in predictions:
        name = (p.get("class") or p.get("class_name") or "").strip()
        conf = float(p.get("confidence", 0))
        if is_fresh_class(name):
            fresh_confidences.append(conf)
        else:
            rotten_confidences.append(conf)

    if rotten_confidences and not fresh_confidences:
        worst = max(rotten_confidences)
        freshness_index = max(0, round((1 - worst) * 100))
        return "rotten", freshness_index
    if fresh_confidences and not rotten_confidences:
        best = max(fresh_confidences)
        freshness_index = round(best * 100)
        return "fresh", min(100, freshness_index)
    # mixed: reduce by worst rotten
    worst_rotten = max(rotten_confidences) if rotten_confidences else 0
    best_fresh = max(fresh_confidences) if fresh_confidences else 0
    freshness_index = round((best_fresh * (1 - worst_rotten)) * 100)
    freshness_index = max(0, min(100, freshness_index))
    classification = "rotten" if worst_rotten >= 0.5 else "mixed"
    return classification, freshness_index
