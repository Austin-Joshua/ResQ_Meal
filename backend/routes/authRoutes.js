const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/register
 * 
 * Request:
 * {
 *   email: string,
 *   password: string,
 *   name: string,
 *   phone_number: string,
 *   role: 'restaurant' | 'ngo' | 'volunteer',
 *   latitude: number (optional),
 *   longitude: number (optional),
 *   business_name: string (required if restaurant),
 *   organization_name: string (required if ngo),
 *   daily_capacity: number (required if ngo, default 100)
 * }
 */
router.post('/register', (req, res) => {
  // TODO: Implement user registration with hashing
  res.json({ message: 'Register endpoint' });
});

/**
 * POST /api/auth/login
 * 
 * Request:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   token: JWT,
 *   user: { id, email, name, role, ... }
 * }
 */
router.post('/login', (req, res) => {
  // TODO: Implement user login with JWT generation
  res.json({ message: 'Login endpoint' });
});

/**
 * POST /api/auth/logout
 * Client-side token removal (no backend state needed for JWT)
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
