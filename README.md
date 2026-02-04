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

## UI Design System

- **Primary**: Deep Teal (#0F766E)
- **Secondary**: Slate Blue (#334155)
- **Accent**: Soft Amber (#F59E0B)
- **Success**: Sage Green (#16A34A)
- **Background**: White (#FFFFFF)

## License

MIT
