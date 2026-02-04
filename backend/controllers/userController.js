/**
 * User/Profile Controller
 * Handles user profile management
 */

const pool = require('../config/database');
const { getPublicFileUrl } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

/**
 * GET /api/user/me
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const query = `
      SELECT id, name, email, role, phone_number, address, latitude, longitude, 
             profile_photo, created_at, updated_at
      FROM users
      WHERE id = ?
    `;

    const [users] = await connection.query(query, [userId]);

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];
    connection.release();

    // Add public URL if profile photo exists
    if (user.profile_photo) {
      user.profile_photo_url = getPublicFileUrl(user.profile_photo);
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
};

/**
 * PUT /api/user/me
 * Update current user profile
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone_number, address, latitude, longitude, current_password, new_password } = req.body;

    const connection = await pool.getConnection();

    // Get current user
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];

    // If password change requested, verify current password
    if (new_password) {
      if (!current_password) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Current password required to set new password',
        });
      }

      const isValidPassword = await bcrypt.compare(current_password, user.password);

      if (!isValidPassword) {
        connection.release();
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
    }

    // Build update query
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const params = [];

    if (name) {
      updateQuery += ', name = ?';
      params.push(name);
    }

    if (phone_number) {
      updateQuery += ', phone_number = ?';
      params.push(phone_number);
    }

    if (address) {
      updateQuery += ', address = ?';
      params.push(address);
    }

    if (latitude !== undefined) {
      updateQuery += ', latitude = ?';
      params.push(latitude);
    }

    if (longitude !== undefined) {
      updateQuery += ', longitude = ?';
      params.push(longitude);
    }

    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await connection.execute(updateQuery, params);

    // Fetch updated user
    const [updatedUsers] = await connection.query(
      'SELECT id, name, email, role, phone_number, address, latitude, longitude, profile_photo, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    const updatedUser = updatedUsers[0];

    if (updatedUser.profile_photo) {
      updatedUser.profile_photo_url = getPublicFileUrl(updatedUser.profile_photo);
    }

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message,
    });
  }
};

/**
 * POST /api/user/me/upload-profile-photo
 * Upload profile photo
 */
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide an image.',
      });
    }

    const connection = await pool.getConnection();

    const filename = req.file.filename;
    await connection.execute('UPDATE users SET profile_photo = ? WHERE id = ?', [filename, userId]);

    connection.release();

    const photoUrl = getPublicFileUrl(filename);

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profile_photo: filename,
        profile_photo_url: photoUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message,
    });
  }
};

/**
 * GET /api/user/:userId
 * Get public user profile (limited info)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();

    const query = `
      SELECT id, name, role, profile_photo, created_at
      FROM users
      WHERE id = ?
    `;

    const [users] = await connection.query(query, [userId]);

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];
    connection.release();

    if (user.profile_photo) {
      user.profile_photo_url = getPublicFileUrl(user.profile_photo);
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
};
