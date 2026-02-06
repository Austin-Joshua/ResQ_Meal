# ResQ Meal - Quick Start Guide

## 🚀 Start the Application

### Option 1: Start Both Frontend & Backend Together (Recommended)
```bash
npm run dev:all
```
This starts:
- Backend API on `http://localhost:5000`
- Frontend app on `http://localhost:5173`

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🔐 Test Login Credentials

**Password for all accounts:** `password123`

### Volunteer Mode
- **Email:** `volunteer@community.com`
- **Password:** `password123`
- **Role:** Volunteer

### Organization/Admin Mode (NGO)
- **Email:** `ngo@savechildren.com`
- **Password:** `password123`
- **Role:** NGO/Organization Admin

### Restaurant Mode (Also Organization)
- **Email:** `chef@kitchen.com`
- **Password:** `password123`
- **Role:** Restaurant

## ✅ Verify Backend is Running

The backend should show:
```
ResQ Meal API running on http://localhost:5000
```

If you see connection errors in the login page, make sure:
1. Backend is running on port 5000
2. Database is configured in `backend/.env`
3. Database is seeded (run `backend/config/seed.sql`)

## 📝 Database Setup (First Time)

1. Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE resqmeal_db;
```

2. Run migrations:
```bash
mysql -u root -p resqmeal_db < backend/config/database.sql
mysql -u root -p resqmeal_db < backend/config/seed.sql
```

3. Configure `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resqmeal_db
```

## 🎯 Login Flow

1. Start backend: `npm run dev:all` or `cd backend && npm run dev`
2. Open frontend: `http://localhost:5173` (or it opens automatically)
3. Use test credentials above
4. Both volunteer and organization modes will work!
