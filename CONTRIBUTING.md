# Contributing to ResQ Meal

Thank you for helping improve ResQ Meal. This guide covers local setup, code style, and the pull-request workflow.

## Getting started

1. Fork and clone the repository.
2. Copy environment templates:
   - `backend/.env.example` → `backend/.env`
   - `.env.docker.example` → `.env.docker` (optional, for full Docker stack)
3. Start the stack:
   - **Docker:** `docker compose up -d --build`
   - **Local:** `npm install && npm run dev:fullstack`
4. Open http://localhost (Docker) or http://localhost:5173 (local Vite).

See [docs/CONNECT.md](docs/CONNECT.md) for database seeding and admin configuration.

## Branch naming

- `feature/short-description` — new functionality
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation only
- `chore/short-description` — tooling, CI, dependencies

## Code style

### Frontend

- TypeScript with strict mode enabled (`tsconfig.app.json`).
- Run before committing:
  ```bash
  cd frontend
  npm run lint
  npm run lint:fix
  npm run format
  npm run build
  ```
- Use functional React components; memoize list cards (`FoodPostCard`, `MatchCard`) when rendering large lists.
- Tailwind for styling; follow existing shadcn/ui patterns in `frontend/src/components/ui/`.

### Backend

- Java 17, Spring Boot 3 conventions.
- JDBC via `JdbcTemplate`; keep SQL in service classes or clearly named helpers.
- Validate request DTOs with Jakarta Bean Validation.
- Run tests: `cd backend && ./mvnw test`

## Commits

Write clear, imperative commit messages:

```
Add public impact endpoint with 5-minute cache
Fix nginx SPA fallback for nested routes
```

Keep commits focused; avoid mixing unrelated changes.

## Pull requests

1. Rebase or merge latest `main` into your branch.
2. Ensure CI passes (backend tests, frontend lint + build, Docker build).
3. Describe **what** changed and **why** in the PR body.
4. Link related issues when applicable.
5. Add screenshots for UI changes.

## Environment and secrets

- Never commit `.env`, `.env.docker`, or credentials.
- Document new variables in [docs/ENV_VARS.md](docs/ENV_VARS.md).
- Use GitHub Secrets for deploy hooks (`RENDER_DEPLOY_HOOK_URL`, Vercel tokens).

## Testing

| Area | Command |
|------|---------|
| Backend unit/integration | `cd backend && ./mvnw test` |
| Frontend unit | `cd frontend && npm test` |
| Frontend lint | `npm run lint -w frontend` |
| Full Docker smoke | `docker compose up -d --build` then hit `/api/health` |

## Questions

Open a GitHub issue for bugs or feature proposals before large refactors. For setup help, see [README.md](README.md) and [docs/CONNECT.md](docs/CONNECT.md).
