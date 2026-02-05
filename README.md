# ResQ Meal

A web platform connecting restaurants and food establishments with NGOs and volunteers to efficiently redistribute surplus food and combat hunger.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL

## Quick Start

### Run frontend and backend together (for login to work)

From the project root, after configuring `backend/.env` and seeding the database:

```bash
npm install
cd backend && npm install && cd ..
npm run dev:all
```

This starts the API on `http://localhost:5000` and the app on `http://localhost:5173`. Open the app URL and sign in (see Test login credentials below).

### Frontend only

```bash
npm install
npm run dev
```

### Backend only

```bash
cd backend
npm install
# Configure .env with database credentials
npm run dev
```

## Project Structure

```
resqmeal-nourishing-communities/
├── src/                    # Frontend source code
│   ├── pages/             # Page components (App, Dashboard)
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (LanguageContext)
│   ├── services/          # API integration
│   ├── lib/               # Utility functions
│   └── assets/            # Images, logos
├── backend/               # Backend API
│   ├── routes/           # API routes
│   ├── controllers/       # Business logic
│   ├── config/           # Database schema & seed data
│   └── middlewares/       # Auth middleware
├── public/               # Static assets
└── package.json          # Dependencies
```

## Features

- **One-Click Surplus Posting**: Restaurants post excess food instantly
- **Smart Matching Engine**: Automatic NGO matching based on location, capacity, and demand
- **Food Safety Validation**: Countdown timers and quality verification
- **Live Impact Tracking**: Real-time metrics on meals saved and CO₂ impact
- **Dark Mode & Multilingual**: Support for English, Tamil, and Hindi with dark mode
- **Responsive Design**: Works seamlessly on mobile and desktop

## AI in ResQ Meal

ResQ Meal uses AI as a decision-support layer: **smart matching** (ranked donor–NGO pairs by distance, freshness, capacity, food type), **perishability-aware priority** (time-to-expiry and optional ML freshness from image/env), and optional **demand prediction** and **learning from feedback** (designed, not yet trained). See **[docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md)** for how AI is implemented and how it differs from a regular donation platform.

## Development

### Running Frontend
```bash
npm run dev
```
Server runs on `http://localhost:5173`

### Running Backend
```bash
cd backend
npm start
```
API runs on `http://localhost:5000`

## Environment Setup

Create `.env` in the backend directory:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resqmeal_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## Test login credentials

After running the database seed (`backend/config/seed.sql`), you can sign in with any of these accounts. **Password for all: `password123`**

| Role       | Email                     | Use case                          |
|-----------|---------------------------|-----------------------------------|
| Volunteer | `volunteer@community.com` | Base website (Dashboard, etc.)   |
| Restaurant| `chef@kitchen.com`        | Organisation report view          |
| Restaurant| `baker@artisan.com`       | Organisation report view          |
| NGO       | `ngo@savechildren.com`    | Organisation report view          |

If login fails with "Invalid email or password":
1. Use the password exactly: **`password123`** (all lowercase, no spaces).
2. Ensure the backend is running and the database has been seeded. If you already ran the old seed, update test user passwords in MySQL:  
   `UPDATE users SET password = '$2b$10$a/AFX5BWMRD5WAMu7CAdKuekKL0w4tGMwfjLKCqI9znbyqZw6tNHm' WHERE email IN ('chef@kitchen.com','ngo@savechildren.com','volunteer@community.com','baker@artisan.com');`  
   Or re-run the full seed (after dropping/recreating the DB or clearing the `users` table) with `backend/config/seed.sql`.

## Freshness detector & ML models

The **Fresh Food Checker** (photo or environment-based) works without any ML setup: if no ML URLs are set in `backend/.env`, the backend returns **mock** assessments. To use **trained models** from the links in `docs/FRESHNESS_REFERENCES.md`:

### One-command model setup (image-based)

From the repo root, download pre-trained models from the official GitHub repos:

```bash
node scripts/setup-freshness-models.js
```

This clones (shallow) and copies:

- **[fruit-veg-freshness-ai](https://github.com/captraj/fruit-veg-freshness-ai)** → `ml-services/fruit-veg-freshness/rottenvsfresh98pval.h5`
- **[Freshness-Detector](https://github.com/Kayuemkhan/Freshness-Detector)** (TFLite) → `ml-services/freshness-detector-tflite/model.tflite`
- **[freshvision](https://github.com/devdezzies/freshvision)** → `ml-services/freshvision/models/effnetb0_freshvisionv0_10_epochs.pt`

### Environment-based model (trains on startup)

**Food-Freshness-Analyzer** ([Parabellum768](https://github.com/Parabellum768/Food-Freshness-Analyzer)) does **not** need a downloaded file: it **trains** a RandomForest on synthetic environmental data when the service starts. Use it for temperature/humidity/storage-time checks:

```bash
cd ml-services/food-freshness-analyzer
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Wire the backend to ML services

In `backend/.env` set the URL(s) for the service(s) you run:

| Service | Env variable | Example |
|--------|----------------|---------|
| fruit-veg-freshness (image) | `FRESHNESS_AI_URL` | `http://localhost:8000` |
| Freshness-Detector TFLite (image) | `FRESHNESS_TFLITE_URL` | `http://localhost:8002` |
| FreshVision (image) | `FRESHNESS_FRESHVISION_URL` | `http://localhost:8004` |
| Food-Freshness-Analyzer (environment) | `FRESHNESS_ENV_AI_URL` | `http://localhost:8001` |

The backend tries image-based services in order (Bedrock → TFLite → Roboflow → FreshVision → fruit-veg-freshness); the first that is configured and responding is used. Environment-based checks use `FRESHNESS_ENV_AI_URL` only.

### AI API (demand prediction, feedback, recommended matches)

- **GET /api/ai/demand-prediction** (auth) — Predicted demand per NGO from historical matches/deliveries (last 30 days).
- **POST /api/ai/feedback** (auth) — Record match outcome for learning: `{ match_id, outcome: "accepted"|"rejected"|"delivered", delay_minutes?, notes? }`.
- **GET /api/ai/health** — Which AI features are enabled (freshness URLs, etc.).
- **GET /api/matches/recommended/:food_post_id** (auth) — Ranked NGO recommendations for a food post (distance, capacity, food type, demand boost from past behaviour). Query: `?top=5` (default 5, max 20).

See `docs/AI_IMPLEMENTATION.md` for how these fit the four AI layers (demand prediction, smart matching, perishability, learning from feedback).

## UI Design System

- **Primary (light)**: ResQ green (HSL 145 63% 49%)
- **Primary (dark)**: Google AI Studio green **#34a853** (HSL 135 53% 43%) — used for primary, accent, ring, sidebar in dark mode
- **Secondary**: Slate Blue (#334155)
- **Accent (light)**: Soft Amber (#F59E0B)
- **Success**: Sage Green (#16A34A)
- **Background**: White (#FFFFFF); dark: `hsl(210 22% 10%)`
- **Dark mode utilities**: `.studio-green-bg`, `.studio-green-border`, `.studio-green-text` use #34a853

## Freshness detector & ML

The food freshness detector (via image upload or environmental parameters) is designed to integrate with external Machine Learning microservices. By default, the system uses mock data for freshness assessments.

To enable real ML-driven freshness detection:

1.  **Select an ML service**: The `ml-services/` directory contains various Python FastAPI wrappers for ML models (e.g., `fruit-veg-freshness`). Choose one to set up.
2.  **Obtain the trained model**: Most ML services require a pre-trained model file (e.g., `.h5` or `.tflite`). These files are *not* included in this repository due to their size. Follow the instructions in the specific `ml-services/<service-name>/README.md` to clone the upstream model repository and copy the necessary model files.
3.  **Install Python dependencies**: For your chosen ML service, create a Python virtual environment and install the dependencies specified in its `requirements.txt`.
4.  **Run the ML service**: Start the FastAPI application for the chosen service. For example, for `fruit-veg-freshness`:
    ```bash
    cd ml-services/fruit-veg-freshness
    # (activate virtualenv)
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```
5.  **Configure backend**: In your `backend/.env` file, set the appropriate URL for the running ML service. For `fruit-veg-freshness`, you would add:
    ```
    FRESHNESS_AI_URL=http://localhost:8000
    ```
    (Ensure the port matches what your ML service is running on).

After these steps, the backend's `FoodQualityVerification` service will call your running ML service for actual freshness predictions instead of using mock data.

## License

MIT
