# ResQ Meal Backend API

Node.js + Express backend for ResQ Meal platform with MySQL database.

## Setup

```bash
npm install
```

Create `.env` file (use `.env.example` as template):
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resqmeal_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
```

## Initialize Database

```bash
# Import schema and seed data
mysql -u root -p resqmeal_db < config/database.sql
mysql -u root -p resqmeal_db < config/seed.sql
```

## Start Server

```bash
npm start
```

API runs on `http://localhost:5000`

## Project Structure

```
backend/
├── config/          # Database schema & seed data
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middlewares/     # Auth & file upload
├── services/        # Matching engine & food quality
├── utils/           # Helpers, JWT, logging
└── server.js        # Express app entry point
```

## Core API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Food Posts
- `POST /api/food` - Create food post
- `GET /api/food/my-posts` - Get user's posts
- `GET /api/food/:id` - Get food post details
- `GET /api/food/available/all` - Get available food
- `PUT /api/food/:id` - Update food post
- `DELETE /api/food/:id` - Delete food post

### Matching
- `POST /api/matches` - Request food match
- `GET /api/matches/for-ngo/all` - Get matches for NGO
- `GET /api/matches/for-restaurant/all` - Get matches for restaurant
- `PUT /api/matches/:id/status` - Update match status

### NGO
- `GET /api/ngos/:id` - Get NGO details
- `GET /api/ngos/:id/capacity` - Get NGO capacity

### Impact
- `GET /api/impact/ngo` - Get NGO impact metrics
- `GET /api/impact/global` - Get global impact

### Freshness / Food Quality
- `POST /api/food/assess-freshness` - Upload image; returns freshness assessment (tries Bedrock → TFLite → Roboflow → FreshVision → fruit-veg-freshness-ai → mock).
- `POST /api/food/assess-freshness-by-environment` - JSON `{ temperature, humidity, time_stored_hours, gas? }`; uses Food-Freshness-Analyzer when `FRESHNESS_ENV_AI_URL` is set.
- `POST /api/food/classify-image` - Upload image; returns food_class, food_name, confidence, nutrition (Food-Image-Recognition when `FOOD_IMAGE_RECOGNITION_URL` is set).

**Optional AI backends** (see `.env.example`): Amazon Bedrock (Claude 3 vision), TFLite, Roboflow YOLO, FreshVision (EfficientNet), fruit-veg-freshness-ai. Reference: [AWS serverless-genai-food-analyzer-app](https://github.com/aws-samples/serverless-genai-food-analyzer-app) (Bedrock + Claude for food/ingredient detection).

## Database Schema

8 tables: users, restaurants, ngos, volunteers, food_posts, matches, impact_logs, delivery_proofs

Status values: `POSTED`, `MATCHED`, `ACCEPTED`, `PICKED_UP`, `DELIVERED`, `EXPIRED`

All responses use `snake_case` field naming.
