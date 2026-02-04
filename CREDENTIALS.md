# ResQ Meal – Saved test credentials

**Password for all accounts:** `password123`

## One-time database setup (required for login with MySQL)

From the project root, with **MySQL running** and `backend/.env` configured (copy from `backend/.env.example`):

```bash
cd backend
npm run db:setup
```

This creates the database and seeds all modes (restaurant, ngo, volunteer). Then use the credentials below.

| Role      | Email                     | Name         | Use |
|----------|---------------------------|--------------|-----|
| Volunteer | `volunteer@community.com` | Arjun Rao    | Dashboard, volunteer flows |
| Restaurant | `chef@kitchen.com`       | Chef Kumar   | Post surplus, Chef's Kitchen |
| Restaurant | `baker@artisan.com`      | Maria Silva  | Post surplus, Artisan Bakery |
| NGO       | `ngo@savechildren.com`   | Priya Sharma | Matches, Save Children India |

- **Password:** `password123` (all lowercase, no spaces)
- If the database is not running, the backend still allows **volunteer@community.com** / **password123** in development (dev fallback).
