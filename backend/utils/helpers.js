// Helper functions for calculations and formatting

/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
exports.haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Calculate minutes remaining until expiry
 * @param {Date} expiryTime - Expiry datetime
 * @returns {number} Minutes remaining
 */
exports.getMinutesUntilExpiry = (expiryTime) => {
  const now = new Date();
  const expiryDate = new Date(expiryTime);
  return Math.floor((expiryDate - now) / (1000 * 60));
};

/**
 * Calculate urgency score based on expiry time
 * Urgency increases as expiry approaches
 * @param {Date} expiryTime - Expiry datetime
 * @returns {number} Urgency score (0-100)
 */
exports.calculateUrgencyScore = (expiryTime) => {
  const minutesRemaining = exports.getMinutesUntilExpiry(expiryTime);

  // If already expired
  if (minutesRemaining < 0) return 100;

  // If expired or expiring very soon (within 30 min)
  if (minutesRemaining <= 30) return 100;

  // If expiring within 1 hour
  if (minutesRemaining <= 60) return 90;

  // If expiring within 2 hours
  if (minutesRemaining <= 120) return 75;

  // If expiring within 3 hours
  if (minutesRemaining <= 180) return 50;

  // Otherwise, low urgency
  return 25;
};

/**
 * Parse JSON safely
 */
exports.safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Format API response
 */
exports.formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data: data || {},
  };
};

/**
 * Get public file URL
 */
exports.getPublicFileUrl = (filename) => {
  return `${process.env.API_URL}/uploads/${filename}`;
};
