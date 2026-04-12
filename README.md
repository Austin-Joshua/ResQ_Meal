# ResQ Meal

A web platform connecting restaurants and food establishments with NGOs and volunteers to efficiently redistribute surplus food and combat hunger.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Java 17 + Spring Boot 3 (REST API, JDBC, Spring Security + JWT)
- **Real-time**: Socket.IO (Java netty-socketio; default port **9090** alongside HTTP **8080**)
- **Database**: MySQL

## Real-time & Notifications

- **Socket.IO**: The Spring app runs Socket.IO on port **9090** by default. The frontend connects with the JWT when logged in and receives events such as `food_posted`, `match_created`, `match_status_updated`, and `notification`. Set `VITE_SOCKET_URL` at build time if your deployment uses a different URL.
- **Notifications**: In-app notification bell shows unread count and list. Notifications are persisted in MySQL. Create the table with:
  ```bash
  mysql -u root -p resqmeal_db < database/notifications-migration.sql
  ```
  If the table does not exist, the API returns an empty list and real-time events still work.

## Quick Start

### Prerequisites

- Node.js (for the Vite frontend)
- Java 17 + Maven (or use the included `server/mvnw` wrapper)
- MySQL

### Run frontend and API together (recommended)

1. Copy `server/.env.example` to `server/.env` (or set env vars) with `DB_*`, `JWT_SECRET`, etc.
2. Create and seed the database (see [Database setup](#database-setup)).
3. From the project root:

```bash
npm install
npm run dev:all
```

This starts:

- Spring Boot API on **http://localhost:8080**
- Socket.IO on **http://localhost:9090**
- Vite dev server on **http://localhost:5173** (proxies `/api` and `/uploads` to port 8080)

Open **http://localhost:5173** and use the login page status indicator to confirm the API is reachable.

### Frontend only

```bash
npm install
npm run dev
```

### API only

```bash
cd server
./mvnw spring-boot:run
```

(On Windows, `mvnw.cmd` is used when you run `mvnw` from npm scripts.)

### Production JAR (full-stack static + API)

```bash
npm run build
npm run build:fullstack
java -jar server/target/resqmeal-server-1.0.0.jar
```

### App logo

Place **`logo.png`** (or `logo.jpg`) in **`public/`**. The app uses `/logo.png` everywhere. See `public/LOGO_README.txt`.

## Project structure

```
├── src/                 # React frontend
├── server/              # Spring Boot (Maven): API, security, Socket.IO
├── database/            # MySQL schema, seed, notifications migration
├── ml-services/         # Optional Python ML sidecars (freshness, classification)
├── public/              # Static assets
└── package.json         # Frontend scripts; `dev:backend` runs Spring in server/
```

## Features

- **One-Click Surplus Posting**: Restaurants post excess food instantly
- **Smart Matching Engine**: NGO matching by location, capacity, and demand
- **Food Safety Validation**: Countdown timers and quality verification
- **Live Impact Tracking**: Metrics on meals saved and CO₂ impact
- **Dark Mode & Multilingual**: English, Tamil, Hindi
- **Responsive Design**: Mobile and desktop

## AI in ResQ Meal

AI is used as decision-support: smart matching, perishability-aware priority, optional ML freshness, demand prediction, and feedback. See **[docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md)**.

## Development

### Frontend

```bash
npm run dev
```

Runs on `http://localhost:5173`.

### Backend

```bash
cd server && ./mvnw spring-boot:run
```

API base path: **`/api`** on port **8080** (see `server/src/main/resources/application.properties`).

## Environment (Spring)

Use **`server/.env.example`** as a reference. Spring reads `DB_*`, `JWT_SECRET`, `PORT`, `SOCKETIO_PORT`, optional ML URLs (`FRESHNESS_AI_URL`, `FRESHNESS_ENV_AI_URL`, `FOOD_IMAGE_RECOGNITION_URL`), etc., via environment variables or `application.properties`.

## Database setup

1. Create database: `CREATE DATABASE resqmeal_db;`
2. Apply schema and seed:

```bash
mysql -u root -p resqmeal_db < database/database.sql
mysql -u root -p resqmeal_db < database/seed.sql
mysql -u root -p resqmeal_db < database/notifications-migration.sql
```

## Test login credentials

After **`database/seed.sql`**, password for all: **`password123`**

| Role       | Email                     |
|-----------|---------------------------|
| Volunteer | `volunteer@community.com` |
| Restaurant| `chef@kitchen.com`        |
| Restaurant| `baker@artisan.com`       |
| NGO       | `ngo@savechildren.com`    |

If login fails, ensure the DB is seeded and the API can reach MySQL.

## Freshness detector & ML models

Without ML URLs, the API returns **mock** freshness assessments. For real models, see **`docs/FRESHNESS_REFERENCES.md`** and each **`ml-services/*/README.md`**.

### One-command model download (image-based)

```bash
node scripts/setup-freshness-models.js
```

### Wire ML services to Spring

Set environment variables (or entries in `server/src/main/resources/application.properties`) such as:

| Service | Variable | Example |
|--------|----------|---------|
| fruit-veg-freshness (image) | `FRESHNESS_AI_URL` | `http://localhost:8000` |
| Food-Freshness-Analyzer (env) | `FRESHNESS_ENV_AI_URL` | `http://localhost:8001` |
| Food image classification | `FOOD_IMAGE_RECOGNITION_URL` | `http://localhost:8005` |

### AI HTTP endpoints (same as before)

- `GET /api/ai/demand-prediction`, `POST /api/ai/feedback`, `GET /api/ai/health`
- `GET /api/matches/recommended/:food_post_id`

## UI design system

- **Primary (light)**: ResQ green (HSL 145 63% 49%)
- **Primary (dark)**: #34a853
- **Secondary**: Slate Blue (#334155)
- **Accent (light)**: Soft Amber (#F59E0B)

## License

MIT
