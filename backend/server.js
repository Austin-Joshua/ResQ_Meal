const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
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

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/users', userRoutes);

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
app.listen(PORT, () => {
  console.log(`ResQ Meal API running on http://localhost:${PORT}`);
});

module.exports = { app, pool };
