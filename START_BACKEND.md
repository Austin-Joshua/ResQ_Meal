# Backend (Spring Boot) – connection guide

## Start API + frontend

```bash
npm run dev:all
```

- Spring Boot: **http://localhost:8080**
- Socket.IO: **http://localhost:9090**
- Vite: **http://localhost:5173** (proxies `/api` and `/uploads` → 8080)

## Start API only

**Loads `backend/.env` automatically (recommended):** from repo root, `npm run dev:backend`.

Or manually:

```bash
cd backend
./mvnw spring-boot:run
```

(On Windows, `node backend/scripts/run-spring.mjs` from the repo root runs `mvnw.cmd` with env from `backend/.env`.)

## Verify

- Open **http://localhost:8080/api/health** — expect `{"status":"ok",...}`
- From the Vite app, `/api/health` is proxied to the same backend.

## Configuration

- See **`backend/.env.example`** and **`backend/src/main/resources/application.properties`**
- MySQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- JWT: `JWT_SECRET`
- HTTP port: `PORT` (default 8080)
- Socket.IO: `SOCKETIO_PORT` (default 9090)

## Frontend env

- Default API base: **`/api`** (same origin or Vite proxy)
- Optional: `VITE_SOCKET_URL` if Socket.IO is not on `hostname:9090`

## Troubleshooting

- **Port 8080 busy:** set `PORT` in the environment or change `server.port` in `application.properties`.
- **DB errors:** ensure MySQL is running and credentials match; run SQL under **`database/`**.
- **CORS:** Spring allows localhost origins in dev (see `WebConfig`).

## Test users (after `database/seed.sql`)

- `volunteer@community.com` / `password123`
- `ngo@savechildren.com` / `password123`
- `chef@kitchen.com` / `password123`
