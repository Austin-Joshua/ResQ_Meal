# Environment Variables

All configuration for ResQ Meal. Spring Boot reads `backend/.env` locally or container env in Docker/Render. Vite reads `frontend/.env` at **build time**.

## Backend (Spring Boot)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8080` | HTTP API port |
| `DB_HOST` | Yes | `localhost` | MySQL host |
| `DB_PORT` | Yes | `3306` | MySQL port (`3307` when using host-mapped Docker DB) |
| `DB_NAME` | Yes | `resqmeal_db` | Database name |
| `DB_USER` | Yes | `root` | Database user |
| `DB_PASSWORD` | Yes | — | Database password |
| `DB_POOL_LIMIT` | No | `10` | HikariCP max pool size |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars in production) |
| `UPLOAD_DIR` | No | `uploads` | Local path for uploaded files |
| `API_URL` | No | `http://localhost:8080` | Public base URL for upload links |
| `FORCE_HTTPS` | No | `false` | Require HTTPS for `/api/**` |
| `SOCKETIO_PORT` | No | `9090` | Socket.IO port |
| `SOCKETIO_HOST` | No | `0.0.0.0` | Socket.IO bind address |
| `FRESHNESS_AI_URL` | No | — | Fruit/veg freshness ML service URL |
| `FRESHNESS_ENV_AI_URL` | No | — | Environmental freshness analyzer URL |
| `FOOD_IMAGE_RECOGNITION_URL` | No | — | Food image classification URL |
| `ADMIN_USER_IDS` | No | — | Comma-separated user IDs with admin role |
| `TELEGRAM_BOT_TOKEN` | No | — | Telegram bot token for security alerts |
| `TELEGRAM_CHAT_ID` | No | — | Telegram chat ID for alerts |
| `APP_SECURITY_MAX_FAILED_LOGINS_PER_MINUTE` | No | `5` | Failed login rate limit |
| `APP_SECURITY_MAX_MUTATIONS_PER_MINUTE` | No | `20` | Authenticated mutation rate limit |
| `TRAFFIC_SECURITY_ML_ENABLED` | No | `false` | Enable traffic ML analysis |
| `TRAFFIC_SECURITY_ML_URL` | No | `http://127.0.0.1:8091` | Traffic ML service base URL |
| `TRAFFIC_SECURITY_MAX_BODY_BYTES` | No | `65536` | Max request body captured |
| `TRAFFIC_SECURITY_CONNECT_TIMEOUT_MS` | No | `500` | ML client connect timeout |
| `TRAFFIC_SECURITY_READ_TIMEOUT_MS` | No | `8000` | ML client read timeout |
| `FIREBASE_SECURITY_WEBHOOK_URL` | No | — | Firebase webhook for threat push |
| `FIREBASE_SECURITY_WEBHOOK_SECRET` | No | — | Webhook shared secret |
| `TRAFFIC_SECURITY_BLOCK_ON_MALICIOUS` | No | `false` | Block requests flagged malicious |
| `ATTACK_SIM_ENABLED` | No | `true` | Attack simulation module |
| `ATTACK_SIM_TELEGRAM_BOT_ENABLED` | No | `true` | Telegram bot for attack sim |
| `ATTACK_SIM_BACKUP_SCHEMA` | No | `resqmeal_backup` | Backup schema name |
| `ATTACK_SIM_AUTHORIZED_TELEGRAM_USER_IDS` | No | — | Allowed Telegram user IDs |
| `ATTACK_SIM_BOT_POLL_DELAY_MS` | No | `3000` | Bot poll interval |
| `ATTACK_SIM_BACKUP_SYNC_DELAY_MS` | No | `15000` | Backup sync delay |
| `FIREBASE_ENABLED` | No | `false` | Enable Firebase Admin for Google sign-in |
| `FIREBASE_PROJECT_ID` | When enabled | — | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | When enabled | — | Service account JSON (single line) for token verification |

## Frontend (Vite — build time)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | REST API base (same-origin in Docker/nginx) |
| `VITE_SOCKET_URL` | No | same-origin | Socket.IO URL override |
| `VITE_FIREBASE_API_KEY` | For Google sign-in | — | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | For Google sign-in | — | e.g. `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | For Google sign-in | — | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | For Google sign-in | — | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | For Google sign-in | — | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | For Google sign-in | — | Firebase web app ID |

## Docker Compose (`.env.docker`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | Yes | — | MySQL root password for `db` service |
| `JWT_SECRET` | Yes | — | Passed to `backend` service |

## CI / Deploy (GitHub Secrets)

| Secret | Used by | Description |
|--------|---------|-------------|
| `RENDER_DEPLOY_HOOK_URL` | `deploy.yml` | Render POST deploy hook |
| `VERCEL_TOKEN` | `deploy.yml` | Vercel API token |
| `VERCEL_ORG_ID` | `deploy.yml` | Vercel team/org ID |
| `VERCEL_PROJECT_ID` | `deploy.yml` | Vercel project ID |

See also [CONNECT.md](./CONNECT.md) for local setup and [HTTPS_SETUP.md](./HTTPS_SETUP.md) for TLS.
