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

    const connection = await pool.getConnection();

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
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};
