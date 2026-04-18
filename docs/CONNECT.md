# Connect ResQ Meal (app + security monitoring)

Follow these steps once per machine. Paths are from the **repository root**.

## 1. Install dependencies (Node workspace)

```bash
npm install
```

Run this at the **root** only (not inside `frontend/`). It installs the `frontend` workspace and root tooling.

If you previously had `node_modules` only under `frontend/`, you can delete `frontend/node_modules` and rely on the root install (optional cleanup).

## 2. MySQL database

Create the database and apply schema + seed (adjust user/password):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS resqmeal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p resqmeal_db < database/database.sql
mysql -u root -p resqmeal_db < database/seed.sql
mysql -u root -p resqmeal_db < database/notifications-migration.sql
```

**If your database already existed** from an older clone and you only need the security tables:

```bash
mysql -u root -p resqmeal_db < database/security-migration.sql
```

## 3. Backend environment (`backend/.env`)

Spring Boot does not load `.env` files by itself. Pick one approach:

### Option A — Load `.env` automatically (recommended)

From the repo root:

```bash
npm run dev:backend
```

This uses `backend/scripts/run-spring.mjs`, which reads `backend/.env` and starts Maven with those variables set.

### Option B — Export variables in your shell

Copy `backend/.env.example` to `backend/.env`, edit values, then export them before `mvnw`, or run from repo root:

```bash
npm run dev:backend
```

which loads `backend/.env` via `backend/scripts/run-spring.mjs`.

### Option C — IDE

In IntelliJ / VS Code Java runner, set **Environment variables** from `backend/.env.example` (same keys).

**Required for a working API:** `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

## 4. Security admin dashboard (`/Admin`)

1. Find your numeric user id after logging in once, or from the DB:

   ```sql
   SELECT id, email FROM users;
   ```

2. Set **comma-separated** admin user ids (must match `users.id`):

   In `backend/.env`:

   ```env
   ADMIN_USER_IDS=1
   ```

   Restart the backend after changing this.

3. Open **`http://localhost:5173/Admin`** (dev) while logged in as that user. The UI checks `is_security_admin` from `GET /api/users/me`.

## 5. Telegram alerts (optional)

Create a bot with [@BotFather](https://t.me/BotFather), get a **chat id** (message your bot, then use `https://api.telegram.org/bot<TOKEN>/getUpdates` or a Telegram client that shows chat id).

Add to `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=your_chat_id
```

If these are empty, alerts are skipped (monitoring still logs and blocks).

## 6. Run everything (dev)

From the **repository root**:

```bash
npm run dev:all
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8080`
- Security APIs (admin only): `http://localhost:8080/api/admin/logs` (needs JWT + `ADMIN_USER_IDS`)

## 7. Production JAR (full stack)

Build UI then package the JAR (static files come from `frontend/dist`):

```bash
npm run build:fullstack
java -jar backend/target/resqmeal-server-1.0.0.jar
```

Set the same environment variables (or system properties) on the host as in `backend/.env`.
