# 🚀 Quick Start - Backend Connection Guide

## ✅ Current Status Check

**Port 5000 is AVAILABLE** ✅  
**Backend is NOT RUNNING** ❌

## 🔧 To Start Backend and Connect Properly:

### Option 1: Start Both Frontend & Backend Together (Recommended)
```bash
npm run dev:all
```
This automatically starts:
- ✅ Backend on `http://localhost:5000`
- ✅ Frontend on `http://localhost:5173`
- ✅ Proper CORS configuration
- ✅ Connection verified

### Option 2: Start Backend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🔍 Verify Backend Connection

### Check if backend is running:
```bash
cd backend
npm run verify
```

### Check port availability:
```bash
cd backend
npm run check-port
```

### Manual test:
Open browser: `http://localhost:5000/api/health`
Should return: `{"status":"ok","timestamp":"..."}`

## ⚙️ Configuration Check

### Backend Configuration (`backend/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resqmeal_db
DB_USER=root
DB_PASSWORD=your_password
NODE_ENV=development
```

### Frontend Configuration (`.env` or `vite.config.ts`):
- API URL: `http://localhost:5000/api` (default)
- Or set: `VITE_API_URL=http://localhost:5000/api`

## 🔐 CORS Configuration

Backend (`backend/server.js`) is configured to allow:
- ✅ `http://localhost:5173` (Vite default)
- ✅ `http://localhost:5174` (alternative)
- ✅ `http://localhost:3000`
- ✅ `http://localhost:8080`
- ✅ All localhost origins in development mode

## 🐛 Troubleshooting

### If backend won't start:

1. **Port 5000 is busy:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -ti:5000
   ```
   Then change `PORT=5001` in `backend/.env`

2. **Database connection error:**
   - Ensure MySQL is running
   - Check `backend/.env` database credentials
   - Run: `cd backend && npm run db:setup`

3. **CORS errors:**
   - Backend automatically allows localhost in development
   - Check browser console for specific CORS errors
   - Verify frontend URL matches allowed origins

## ✅ Success Indicators

When backend is running correctly, you should see:
```
✅ ResQ Meal API running on http://localhost:5000
📡 CORS enabled for: http://localhost:5173, ...
🌐 Development mode: All localhost origins allowed
```

The login page will show:
- ✅ "Backend connected" status indicator
- ✅ No error messages
- ✅ Login form ready to use

## 🎯 Next Steps

1. Start backend: `npm run dev:all`
2. Wait for "Backend connected" on login page
3. Use test credentials:
   - Volunteer: `volunteer@community.com` / `password123`
   - Organization: `ngo@savechildren.com` / `password123`
