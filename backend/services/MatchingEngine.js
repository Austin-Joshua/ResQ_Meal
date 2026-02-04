/**
 * Smart NGO Matching & Routing Engine
 * Feature 2: Intelligently matches surplus food with NGOs based on multiple factors
 */

const { query } = require('../config/postgres-config');
const logger = require('../utils/logger');
const geolib = require('geolib');

class MatchingEngine {
  /**
   * Calculate distance between two coordinates
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    return geolib.getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    ) / 1000; // Convert to km
  }

  /**
   * Calculate freshness score (0-1.0)
   * Based on time remaining until expiry
   */
  static calculateFreshnessScore(expiryTime, safetyWindow) {
    const now = new Date();
    const minutesRemaining = (new Date(expiryTime) - now) / (1000 * 60);
    
    if (minutesRemaining <= 0) return 0.0;
    if (minutesRemaining >= safetyWindow) return 1.0;
    
    return Math.max(0, minutesRemaining / safetyWindow);
  }

  /**
   * Calculate capacity match score (0-1.0)
   * Considers NGO's available capacity
   */
  static calculateCapacityScore(availableCapacity, requiredServings) {
    if (availableCapacity <= 0) return 0.0;
    if (availableCapacity >= requiredServings) return 1.0;
    
    return availableCapacity / requiredServings;
  }

  /**
   * Calculate distance score (0-1.0)
   * Closer is better, normalized
   */
  static calculateDistanceScore(distanceKm, maxDistanceKm = 15) {
    if (distanceKm > maxDistanceKm) return 0.0;
    return Math.max(0, 1 - (distanceKm / maxDistanceKm));
  }

  /**
   * Check food type compatibility
   */
  static checkFoodTypeCompatibility(foodType, ngoAcceptedTypes) {
    if (!ngoAcceptedTypes || ngoAcceptedTypes.length === 0) return 1.0;
    return ngoAcceptedTypes.includes(foodType) ? 1.0 : 0.3;
  }

  /**
   * Main matching algorithm
   * Finds best NGO matches for a surplus post
   */
  static async findBestMatches(surplusPostId, topN = 5) {
    try {
      // Get surplus post details
      const post = await query(
        `SELECT sp.*, r.user_id as restaurant_id
         FROM surplus_posts sp
         JOIN restaurants r ON sp.restaurant_id = r.id
         WHERE sp.id = $1`,
        [surplusPostId]
      );

      if (!post || post.length === 0) {
        throw new Error('Surplus post not found');
      }

      const surplusPost = post[0];

      // Get all active NGOs with available capacity
      const ngos = await query(
        `SELECT n.*, u.latitude, u.longitude, u.location_name,
                (n.daily_capacity - n.current_capacity_used) as available_capacity
         FROM ngos n
         JOIN users u ON n.user_id = u.id
         WHERE n.verified = true
         AND u.latitude IS NOT NULL
         AND u.longitude IS NOT NULL
         AND (n.daily_capacity - n.current_capacity_used) > 0`
      );

      // Score each NGO
      const matches = ngos.map(ngo => {
        // Distance score (40%)
        const distanceKm = this.calculateDistance(
          surplusPost.latitude, surplusPost.longitude,
          ngo.latitude, ngo.longitude
        );
        const distanceScore = this.calculateDistanceScore(distanceKm);

        // Freshness score (30%)
        const freshnessScore = this.calculateFreshnessScore(
          surplusPost.expiry_time,
          surplusPost.safety_window_minutes
        );

        // Capacity score (20%)
        const capacityScore = this.calculateCapacityScore(
          ngo.available_capacity,
          surplusPost.quantity_servings
        );

        // Food type compatibility (10%)
        const foodTypeScore = this.checkFoodTypeCompatibility(
          surplusPost.food_type,
          ngo.accepted_food_types
        );

        // Check time window compatibility
        const now = new Date();
        const postHour = new Date(surplusPost.created_at).getHours();
        const ngoServiceHours = ngo.service_hours_start && ngo.service_hours_end;
        
        let timeWindowScore = 0.5;
        if (ngoServiceHours) {
          const [startHour] = ngo.service_hours_start.split(':');
          const [endHour] = ngo.service_hours_end.split(':');
          timeWindowScore = (postHour >= parseInt(startHour) && postHour < parseInt(endHour)) ? 1.0 : 0.3;
        }

        // Check demand level - critical need gets boost
        let demandBoost = 1.0;
        if (ngo.current_need_level === 'critical') demandBoost = 1.3;
        else if (ngo.current_need_level === 'high') demandBoost = 1.15;

        // Overall score (weighted)
        const overallScore = (
          (distanceScore * 0.40) +
          (freshnessScore * 0.30) +
          (capacityScore * 0.20) +
          (foodTypeScore * 0.05) +
          (timeWindowScore * 0.05)
        ) * demandBoost;

        return {
          ngoId: ngo.id,
          ngoName: ngo.organization_name,
          distanceKm: Math.round(distanceKm * 10) / 10,
          availableCapacity: ngo.available_capacity,
          currentNeed: ngo.current_need_level,
          scores: {
            distance: Math.round(distanceScore * 100),
            freshness: Math.round(freshnessScore * 100),
            capacity: Math.round(capacityScore * 100),
            foodType: Math.round(foodTypeScore * 100),
            timeWindow: Math.round(timeWindowScore * 100)
          },
          overallScore: Math.min(100, Math.round(overallScore * 100)),
          reasoning: this.generateReasoning(
            distanceKm, freshnessScore, ngo.available_capacity,
            surplusPost.quantity_servings, ngo.current_need_level
          ),
          estimatedPickupTime: this.estimatePickupTime(distanceKm)
        };
      });

      // Sort by overall score and return top N
      const topMatches = matches
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, topN);

      logger.info(`Found ${topMatches.length} matches for surplus post ${surplusPostId}`);
      return topMatches;

    } catch (error) {
      logger.error('Error in matching algorithm:', error);
      throw error;
    }
  }

  /**
   * Generate human-readable reasoning for match
   */
  static generateReasoning(distanceKm, freshnessScore, capacity, required, needLevel) {
    const reasons = [];

    // Distance reasoning
    if (distanceKm < 2) reasons.push('Very close location');
    else if (distanceKm < 5) reasons.push('Nearby location');
    else if (distanceKm < 10) reasons.push('Reasonable distance');

    // Freshness reasoning
    if (freshnessScore > 0.8) reasons.push('Excellent freshness window');
    else if (freshnessScore > 0.5) reasons.push('Good freshness window');
    else if (freshnessScore > 0.2) reasons.push('Short freshness window');

    // Capacity reasoning
    if (capacity >= required * 1.5) reasons.push('More than enough capacity');
    else if (capacity >= required) reasons.push('Sufficient capacity');
    else reasons.push('Capacity constraints');

    // Need reasoning
    if (needLevel === 'critical') reasons.push('Critical urgent need');
    else if (needLevel === 'high') reasons.push('High current demand');

    return reasons.join('. ') + '.';
  }

  /**
   * Estimate pickup time based on distance
   */
  static estimatePickupTime(distanceKm) {
    // Assume average speed of 25 km/h in urban areas
    const minutesNeeded = Math.ceil((distanceKm / 25) * 60) + 10; // +10 min buffer
    return minutesNeeded;
  }

  /**
   * Create matches for a surplus post
   */
  static async createMatches(surplusPostId, matches) {
    try {
      const matchIds = [];
      
      for (const match of matches) {
        const result = await query(
          `INSERT INTO matches 
           (surplus_post_id, ngo_id, distance_km, capacity_match_score, freshness_match_score, 
            overall_match_score, match_reasoning, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            surplusPostId,
            match.ngoId,
            match.distanceKm,
            match.scores.capacity / 100,
            match.scores.freshness / 100,
            match.overallScore / 100,
            match.reasoning,
            'proposed'
          ]
        );
        
        matchIds.push(result[0].id);
      }

      return matchIds;
    } catch (error) {
      logger.error('Error creating matches:', error);
      throw error;
    }
  }

  /**
   * Emergency hunger mode matching
   * Prioritizes NGOs with critical need
   */
  static async findEmergencyMatches(emergencyAlertId) {
    try {
      const alert = await query(
        `SELECT * FROM emergency_hunger_alerts WHERE id = $1`,
        [emergencyAlertId]
      );

      if (!alert || alert.length === 0) {
        throw new Error('Emergency alert not found');
      }

      const alertData = alert[0];

      // Find nearby active surplus within safety window
      const surplus = await query(
        `SELECT sp.*, r.business_name, u.latitude, u.longitude,
                ST_Distance(location_geom, $1) / 1000 as distance_km
         FROM surplus_posts sp
         JOIN restaurants r ON sp.restaurant_id = r.id
         JOIN users u ON r.user_id = u.id
         WHERE sp.status = 'active'
         AND sp.expiry_time > NOW()
         AND ST_DWithin(location_geom, $1, $2 * 1000)
         ORDER BY sp.freshness_score DESC, distance_km ASC
         LIMIT 10`,
        [alertData.location_geom, alertData.broadcast_radius_km]
      );

      logger.info(`Found ${surplus.length} surplus posts for emergency alert`);
      return surplus;

    } catch (error) {
      logger.error('Error in emergency matching:', error);
      throw error;
    }
  }
}

module.exports = MatchingEngine;
