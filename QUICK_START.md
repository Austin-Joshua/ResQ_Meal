# ResQ Meal - Quick Start

## Start the application

### Option 1: Frontend + Spring Boot (recommended)

```bash
npm run dev:all
```

- API: **http://localhost:8080** (`/api`, `/uploads`; Vite proxies from 5173)
- Socket.IO: **http://localhost:9090** (set `VITE_SOCKET_URL` if needed)
- Frontend: **http://localhost:5173**

### Option 2: Separate terminals

**Terminal 1 – API:**

```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 – UI:**

```bash
npm run dev
```

## Test login (after DB seed)

**Password for all:** `password123`

| Mode        | Email                    |
|------------|--------------------------|
| Volunteer  | `volunteer@community.com` |
| NGO        | `ngo@savechildren.com`   |
| Restaurant | `chef@kitchen.com`       |

## Verify API

- Logs should show Tomcat on **8080** and Socket.IO on **9090**.
- Health: **http://localhost:8080/api/health** (or `/api/health` via Vite on 5173)

## Database (first time)

```bash
mysql -u root -p
CREATE DATABASE resqmeal_db;
```

```bash
mysql -u root -p resqmeal_db < database/database.sql
mysql -u root -p resqmeal_db < database/seed.sql
mysql -u root -p resqmeal_db < database/notifications-migration.sql
```

Configure MySQL credentials via environment variables or `backend/src/main/resources/application.properties` (see `backend/.env.example`).

## Login flow

1. Start stack: `npm run dev:all`
2. Open **http://localhost:5173**
3. Sign in with test users above
