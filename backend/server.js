const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();

// ==================== MIDDLEWARE ====================
// CORS Configuration - Allow all localhost ports for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  process.env.FRONTEND_URL,
].filter(Boolean);

// In development, allow any localhost origin
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ==================== DATABASE CONNECTION ====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0
});

// ==================== ROUTES ====================
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const impactRoutes = require('./routes/impactRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const organisationRoutes = require('./routes/organisationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organisation', organisationRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

// Check if port is available
const net = require('net');

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function startServer() {
  const portAvailable = await checkPortAvailable(PORT);
  
  if (!portAvailable) {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`\nPlease either:`);
    console.error(`1. Stop the process using port ${PORT}`);
    console.error(`2. Change PORT in backend/.env to a different port (e.g., 5001)`);
    console.error(`3. Find and kill the process: netstat -ano | findstr :${PORT} (Windows) or lsof -ti:${PORT} | xargs kill (Mac/Linux)\n`);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ ResQ Meal API running on http://localhost:${PORT}`);
    console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🌐 Development mode: All localhost origins allowed\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
      console.error(`Please stop the process using this port or change PORT in backend/.env\n`);
    } else {
      console.error(`\n❌ Server error:`, err.message);
    }
    process.exit(1);
  });
}

startServer();

module.exports = { app, pool };
