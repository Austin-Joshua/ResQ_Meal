# How AI Is Implemented in ResQ Meal

*(and how it changes the project from a regular system)*

---

## 1. Baseline: How a Regular (Non-AI) Project Works

In a regular food donation platform:

- Donor posts surplus food
- NGOs manually browse listings
- First NGO to respond gets the food
- All food items are treated equally
- Decisions are static and rule-based

### Limitations

- Delays in pickup
- Perishable food may expire
- NGOs may receive more food than they need
- No learning from past data
- Works only at very small scale

---

## 2. AI-Enhanced ResQ Meal: What Changes

ResQ Meal introduces **data-driven intelligence** that learns and adapts over time.

AI is implemented as a **decision-support layer**, not as automation replacing humans.

---

## 3. AI Implementation Layers (Clear & Practical)

### 1️⃣ Demand Prediction AI

| | Description |
|---|-------------|
| **What AI does** | Learns from historical NGO data: day of week, location, NGO capacity, past acceptance patterns. |
| **Implementation** | ML regression model trained on past donation data. Output: expected food demand per NGO per day. |
| **Change from regular system** | Before: NGOs randomly accept food. After: System recommends optimal quantity. |
| **Impact** | Less waste, better distribution balance. |

**Current status in ResQ Meal**

- **Today:** **Demand prediction API** (`GET /api/ai/demand-prediction`) returns predicted demand per NGO using historical match/delivery data (last 30 days) and capacity. Smart matching uses this via **recommended matches** (`GET /api/matches/recommended/:food_post_id`), which scores NGOs by distance, capacity, food type, and a **demand boost** from recent acceptance count (learning from past behaviour).
- **Enhancement path:** Optional external ML service that consumes `ai_feedback` and exposes predicted demand; backend can call it when `DEMAND_PREDICTION_URL` is set.

---

### 2️⃣ Smart Matching (Recommendation AI)

| | Description |
|---|-------------|
| **What AI does** | Scores donor–NGO pairs using distance, food type, NGO capacity, acceptance history. |
| **Implementation** | Content-based recommendation system; clustering for NGO grouping. |
| **Change from regular system** | Before: Manual browsing. After: Ranked recommendations. |
| **Impact** | Faster pickups, reduced human coordination effort. |

**Current status in ResQ Meal**

- **Today:** Deterministic scoring in `MatchingEngine.js` (no ML). Each NGO is scored by:
  - **Distance** (40%) – closer is better
  - **Freshness** (30%) – time until expiry vs safety window
  - **Capacity** (20%) – available capacity vs required servings
  - **Food type** (10%) – compatibility with NGO accepted types
  - **Time window** – service hours
  - **Demand boost** – `current_need_level` (critical/high)
- Matches are sorted by overall score and top N are returned. So the system already behaves like “ranked recommendations” and “optimal matching,” but with **rules**, not a learned model.
- **Enhancement path:** Replace or augment with an ML recommendation model (e.g. learned embeddings, acceptance history) and/or clustering; keep the same API contract.

---

### 3️⃣ Perishability & Priority Classification

| | Description |
|---|-------------|
| **What AI does** | Predicts spoilage risk. Inputs: food type, time since preparation, environmental factors (future). |
| **Implementation** | Classification model (high / medium / low priority). |
| **Change from regular system** | Before: All food equal. After: Time-critical food prioritized. |
| **Impact** | Health safety, reduced spoilage. |

**Current status in ResQ Meal**

- **Today:**
  - **Rule-based:** `MatchingEngine.calculateFreshnessScore()` uses expiry time and safety window to score posts; time-sensitive surplus is ranked higher in matching.
  - **Optional ML:** `FoodQualityVerification.js` can call external ML services for **image-based** freshness (e.g. fruit-veg-freshness, TFLite, FreshVision) and **environment-based** freshness (Food-Freshness-Analyzer: temperature, humidity, storage time). When configured, the backend uses these for quality/freshness assessment and the UI shows ML-derived freshness.
- See `README.md` (Freshness detector & ML models) and `docs/FRESHNESS_REFERENCES.md` for setup (e.g. `node scripts/setup-freshness-models.js`, env URLs).

---

### 4️⃣ Learning From Feedback

| | Description |
|---|-------------|
| **What AI does** | Continuously improves predictions using accepted/rejected donations, delivery success, time delays. |
| **Implementation** | Model retraining pipeline fed by match outcomes and delivery data. |
| **Change from regular system** | Before: Static behavior. After: Adaptive system. |
| **Impact** | Better demand and matching over time. |

**Current status in ResQ Meal**

- **Today:** **Feedback API** (`POST /api/ai/feedback`) records match outcomes (`accepted`, `rejected`, `delivered`) and optional `delay_minutes` in the `ai_feedback` table. Demand prediction and recommended matches use historical data (matches, deliveries) so the system **learns from behaviour** (NGOs with more recent acceptances get a higher demand boost). No external retraining pipeline yet.
- **Enhancement path:** Periodic job that exports `ai_feedback` to an ML service for retraining; backend calls updated demand API when available.

---

## 4. Technical Integration (How AI Fits Into the Stack)

| Aspect | Detail |
|--------|--------|
| **Where AI lives** | Separate ML services (Python), e.g. under `ml-services/`. |
| **Communication** | Backend (Node/Express) calls ML via **REST APIs** (e.g. `/evaluate`, `/evaluate-environment`). |
| **Why this matters** | Does not break the existing system; easy to scale and to replace or upgrade models. |

**Relevant code**

- **Matching (rule-based):** `backend/services/MatchingEngine.js`, `backend/controllers/MatchingController.js`
- **Freshness (rules + optional ML):** `backend/services/FoodQualityVerification.js`, `ml-services/*` (see README and `docs/FRESHNESS_REFERENCES.md`)

---

## 5. Key Differences: Regular vs AI-Enabled Project

| Aspect | Regular System | ResQ Meal with AI |
|--------|----------------|-------------------|
| **Decision-making** | Manual | AI-assisted (rules today; ML where configured) |
| **Food priority** | Same for all | Perishability-aware (freshness score + optional ML) |
| **Matching** | First-come | Optimal (ranked by distance, freshness, capacity, type, need) |
| **Learning** | None | Continuous (planned; feedback loop not yet implemented) |
| **Scalability** | Low | High (designed for ML services and future demand/matching models) |
| **Impact** | Limited | Maximized (better distribution and safety when ML is used) |

---

## Summary

- ResQ Meal is already **beyond a “regular” platform**: matching is **ranked and multi-factor**, and freshness/perishability **drive priority**.
- **ML is in use** where you enable it: **freshness** (image and environment) via optional Python services and env config.
- **Demand prediction** and **learning from feedback** are **designed for** (documented here and in the codebase) but **not yet implemented** as trained models; the current “demand” signal is rule-based (`current_need_level`).
- The **architecture** (REST, separate ML services) supports adding demand prediction and feedback-driven retraining without replacing the core app.
