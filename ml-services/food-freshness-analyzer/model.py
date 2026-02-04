"""
Train a RandomForest for food freshness from environmental data.
Logic based on https://github.com/Parabellum768/Food-Freshness-Analyzer
Inputs: Temperature, Humidity, Time (hours), Gas (optional).
Output: Fresh | Stale | Spoiled
"""
import random
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier

RANDOM_STATE = 42
LABELS = ["Fresh", "Stale", "Spoiled"]  # index 0, 1, 2


def _generate_synthetic_data(n=500):
    """Generate synthetic dataset with same rules as the original repo."""
    data = []
    random.seed(RANDOM_STATE)
    for _ in range(n):
        temp = random.uniform(2, 35)
        humidity = random.uniform(30, 90)
        time_stored = random.uniform(1, 72)
        gas = random.uniform(100, 500)
        if time_stored < 24 and gas < 200:
            label = "Fresh"
        elif time_stored < 48:
            label = "Stale"
        else:
            label = "Spoiled"
        data.append([temp, humidity, time_stored, gas, label])
    return pd.DataFrame(
        data,
        columns=["Temperature", "Humidity", "Time", "Gas", "Label"],
    )


def train_model():
    """Train RandomForest and scaler on synthetic data; return (scaler, model, label_encoder)."""
    df = _generate_synthetic_data()
    X = df[["Temperature", "Humidity", "Time", "Gas"]]
    y = LabelEncoder().fit_transform(df["Label"])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE)
    model.fit(X_scaled, y)

    return scaler, model


def predict_freshness(scaler, model, temperature, humidity, time_stored, gas=200.0):
    """
    Predict Fresh (0), Stale (1), or Spoiled (2).
    Returns (label_string, freshness_index 0-100).
    """
    import numpy as np
    X = np.array([[temperature, humidity, time_stored, gas]], dtype=float)
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    label = LABELS[pred]
    # Map to 0-100: Fresh=high, Stale=mid, Spoiled=low
    freshness_index = 90 if pred == 0 else (55 if pred == 1 else 20)
    return label, freshness_index
