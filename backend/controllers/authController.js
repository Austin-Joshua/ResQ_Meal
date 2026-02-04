/**
 * Authentication Controller
 * Handles user registration and login
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * POST /api/auth/register
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone_number, address, latitude, longitude } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password, role',
      });
    }

    // Validate role (restaurant & ngo = organisation/admin; volunteer = volunteer mode)
    if (!['restaurant', 'ngo', 'volunteer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: restaurant, ngo, or volunteer',
      });
    }

    const connection = await pool.getConnection();

    // Check if email already exists
    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertQuery = `
      INSERT INTO users (name, email, password, role, phone_number, address, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      name,
      email,
      hashedPassword,
      role,
      phone_number || null,
      address || null,
      latitude || null,
      longitude || null,
    ]);

    connection.release();

    const userId = result.insertId;
    const token = generateToken(userId, role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: userId,
        name,
        email,
        role,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Development fallback: all seed users when DB is unavailable (password: password123)
const DEV_SEED_PASSWORD_HASH = '$2b$10$a/AFX5BWMRD5WAMu7CAdKuekKL0w4tGMwfjLKCqI9znbyqZw6tNHm';
const DEV_SEED_USERS = [
  { id: 1, name: 'Chef Kumar', email: 'chef@kitchen.com', role: 'restaurant' },
  { id: 2, name: 'Priya Sharma', email: 'ngo@savechildren.com', role: 'ngo' },
  { id: 3, name: 'Arjun Rao', email: 'volunteer@community.com', role: 'volunteer' },
  { id: 4, name: 'Maria Silva', email: 'baker@artisan.com', role: 'restaurant' },
];

function isDbConnectionError(err) {
  const code = err && (err.code || err.errno);
  return !code || code === 'ECONNREFUSED' || code === 'ER_ACCESS_DENIED_ERROR' ||
    code === 'ER_BAD_DB_ERROR' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' ||
    (typeof err.message === 'string' && (err.message.includes('connect') || err.message.includes('Connection')));
}

async function tryDevSeedLogin(email, password) {
  if (!email || !password) return null;
  const valid = await bcrypt.compare(password, DEV_SEED_PASSWORD_HASH);
  if (!valid) return null;
  const user = DEV_SEED_USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  return user || null;
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password',
      });
    }

    let connection;
    try {
      connection = await pool.getConnection();
    } catch (dbErr) {
      // In development, allow any seed user when DB is unavailable (password: password123)
      if (process.env.NODE_ENV !== 'production' && isDbConnectionError(dbErr)) {
        const devUser = await tryDevSeedLogin(email, password);
        if (devUser) {
          const token = generateToken(devUser.id, devUser.role);
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { ...devUser, token },
          });
        }
        return res.status(503).json({
          success: false,
          message: 'Database unavailable. Use chef@kitchen.com, volunteer@community.com (or any seed account) with password: password123',
        });
      }
      throw dbErr;
    }

    // Find user by email
    const [users] = await connection.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [
      email,
    ]);

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    connection.release();

    // Generate token
    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    // Development fallback: allow any seed user on any error (e.g. pool undefined)
    if (process.env.NODE_ENV !== 'production' && req.body?.email && req.body?.password) {
      try {
        const devUser = await tryDevSeedLogin(req.body.email, req.body.password);
        if (devUser) {
          const token = generateToken(devUser.id, devUser.role);
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { ...devUser, token },
          });
        }
      } catch (_) { /* ignore */ }
    }
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};
