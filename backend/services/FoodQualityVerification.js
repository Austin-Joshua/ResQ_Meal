/**
 * AI Food Quality Verification Service
 * Feature 4: Analyzes photos to detect food type, condition, spoilage, and quantity
 */

const axios = require('axios');
const sharp = require('sharp');
const logger = require('../utils/logger');
const { query } = require('../config/postgres-config');

class FoodQualityVerification {
  /**
   * Main assessment function
   * Accepts photo and returns quality score
   */
  static async assessFoodPhoto(photoPath, foodTypeHint = null) {
    try {
      // In production, use Google Vision API, AWS Rekognition, or Claude Vision
      // For now, we'll create a mock assessment with realistic logic
      
      logger.info(`Assessing food photo: ${photoPath}`);

      // Pre-process image
      const processedImage = await this.preprocessImage(photoPath);

      // Run analysis (mock for now, integrate real AI)
      const analysis = await this.runAIAnalysis(processedImage, foodTypeHint);

      // Generate overall quality score
      const assessment = this.generateAssessment(analysis);

      return assessment;

    } catch (error) {
      logger.error('Error assessing food photo:', error);
      throw error;
    }
  }

  /**
   * Preprocess image for analysis
   */
  static async preprocessImage(imagePath) {
    try {
      // Resize and normalize image
      const processed = await sharp(imagePath)
        .resize(640, 480, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      return processed;
    } catch (error) {
      logger.error('Error preprocessing image:', error);
      throw error;
    }
  }

  /**
   * Run AI analysis on food image
   * Integration point for real CV models
   */
  static async runAIAnalysis(imageBuffer, foodTypeHint) {
    try {
      // Mock assessment - in production integrate with:
      // - Google Cloud Vision API
      // - AWS Rekognition
      // - Claude API with vision
      // - Custom TensorFlow model

      const analysis = {
        // Food type detection
        detectedFoodType: foodTypeHint || this.mockDetectFoodType(),
        typeConfidence: 0.92,
        
        // Packaging condition
        packagingCondition: this.mockAnalyzePackaging(),
        packagingScore: 0.85,
        
        // Spoilage detection
        spoilageDetected: false,
        spoilageConfidence: 0.05,
        spoilageIndicators: [],
        
        // Color analysis
        colorQuality: this.mockAnalyzeColor(),
        
        // Quantity estimation
        estimatedQuantity: this.mockEstimateQuantity(),
        quantityAccuracy: 0.78,
        
        // Freshness indicators
        freshnessIndicators: this.mockAnalyzeFreshness(),
        
        // Overall confidence
        overallConfidence: 0.88,
        modelVersion: '2.1.0'
      };

      return analysis;

    } catch (error) {
      logger.error('Error in AI analysis:', error);
      throw error;
    }
  }

  /**
   * Mock food type detection
   */
  static mockDetectFoodType() {
    const types = ['cooked_meal', 'prepared_dish', 'bakery', 'packaged', 'beverage'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Mock packaging analysis
   */
  static mockAnalyzePackaging() {
    return {
      integrity: 'intact',
      cleanliness: 'clean',
      damage: false,
      damageLevel: 0,
      recommendations: []
    };
  }

  /**
   * Mock color analysis
   */
  static mockAnalyzeColor() {
    return {
      naturalColor: true,
      discoloration: false,
      browning: 'minimal',
      moldPresence: false
    };
  }

  /**
   * Mock quantity estimation
   */
  static mockEstimateQuantity() {
    return Math.floor(Math.random() * 30) + 10; // 10-40 servings
  }

  /**
   * Mock freshness analysis
   */
  static mockAnalyzeFreshness() {
    return {
      appearance: 'fresh',
      odorVisualIndicators: 'no_visible_odor_signs',
      moisture: 'appropriate',
      texture: 'appropriate'
    };
  }

  /**
   * Generate overall assessment
   */
  static generateAssessment(analysis) {
    // Calculate overall quality score
    const qualityScore = this.calculateQualityScore(analysis);
    
    // Determine if safe for consumption
    const isSafe = this.determineSafety(analysis);

    const assessment = {
      detectedFoodType: analysis.detectedFoodType,
      foodTypeConfidence: analysis.typeConfidence,
      
      packagingConditionScore: analysis.packagingScore,
      packagingDetails: analysis.packagingCondition,
      
      spoilageDetection: analysis.spoilageDetected,
      spoilageConfidence: analysis.spoilageConfidence,
      spoilageIndicators: analysis.spoilageIndicators,
      
      quantityAccuracy: analysis.quantityAccuracy,
      estimatedQuantity: analysis.estimatedQuantity,
      
      freshnessIndicators: analysis.freshnessIndicators,
      colorAnalysis: analysis.colorQuality,
      
      overallQualityScore: qualityScore,
      isSafeForConsumption: isSafe,
      
      assessmentNotes: this.generateAssessmentNotes(analysis, qualityScore, isSafe),
      confidenceLevel: analysis.overallConfidence,
      aiModelVersion: analysis.modelVersion,
      timestamp: new Date().toISOString()
    };

    return assessment;
  }

  /**
   * Calculate overall quality score (0-1.0)
   */
  static calculateQualityScore(analysis) {
    let score = 1.0;

    // Reduce for spoilage
    if (analysis.spoilageDetected) {
      score *= (1 - analysis.spoilageConfidence);
    }

    // Reduce for color issues
    if (analysis.colorQuality.discoloration) score -= 0.2;
    if (analysis.colorQuality.moldPresence) score -= 0.4;
    if (analysis.colorQuality.browning === 'significant') score -= 0.15;

    // Reduce for packaging issues
    if (analysis.packagingCondition.damage) {
      score -= (0.1 * analysis.packagingCondition.damageLevel);
    }

    return Math.max(0, Math.min(1.0, score));
  }

  /**
   * Determine if food is safe
   */
  static determineSafety(analysis) {
    // Reject if spoilage detected with high confidence
    if (analysis.spoilageDetected && analysis.spoilageConfidence > 0.7) {
      return false;
    }

    // Reject if mold detected
    if (analysis.colorQuality.moldPresence) {
      return false;
    }

    // Reject if severe damage to packaging (contamination risk)
    if (analysis.packagingCondition.damage && analysis.packagingCondition.damageLevel > 0.7) {
      return false;
    }

    return true;
  }

  /**
   * Generate assessment notes
   */
  static generateAssessmentNotes(analysis, qualityScore, isSafe) {
    const notes = [];

    notes.push(`Food Type: ${analysis.detectedFoodType} (${Math.round(analysis.typeConfidence * 100)}% confidence)`);
    
    if (qualityScore >= 0.9) {
      notes.push('✓ Excellent condition - ready for immediate distribution');
    } else if (qualityScore >= 0.7) {
      notes.push('✓ Good condition - suitable for distribution');
    } else if (qualityScore >= 0.5) {
      notes.push('⚠ Fair condition - acceptable with precautions');
    } else {
      notes.push('⚠ Poor condition - not recommended for distribution');
    }

    if (!isSafe) {
      notes.push('❌ SAFETY CONCERN - Do not distribute');
    }

    if (analysis.packagingCondition.damage) {
      notes.push(`Packaging damage detected (Level ${analysis.packagingCondition.damageLevel})`);
    }

    if (analysis.freshnessIndicators.appearance !== 'fresh') {
      notes.push(`Freshness: ${analysis.freshnessIndicators.appearance}`);
    }

    return notes.join(' | ');
  }

  /**
   * Save assessment to database
   */
  static async saveAssessment(surplusPostId, assessment) {
    try {
      const result = await query(
        `INSERT INTO food_quality_assessments 
         (surplus_post_id, detected_food_type, food_type_confidence,
          packaging_condition_score, spoilage_detection, spoilage_confidence,
          quantity_accuracy, estimated_quantity,
          overall_quality_score, is_safe_for_consumption,
          assessment_notes, ai_model_version, confidence_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          surplusPostId,
          assessment.detectedFoodType,
          assessment.foodTypeConfidence,
          assessment.packagingConditionScore,
          assessment.spoilageDetection,
          assessment.spoilageConfidence,
          assessment.quantityAccuracy,
          assessment.estimatedQuantity,
          assessment.overallQualityScore,
          assessment.isSafeForConsumption,
          assessment.assessmentNotes,
          assessment.aiModelVersion,
          assessment.confidenceLevel
        ]
      );

      // Update surplus post with quality score
      await query(
        `UPDATE surplus_posts 
         SET quality_score = $1, verification_status = $2
         WHERE id = $3`,
        [
          assessment.overallQualityScore,
          assessment.isSafeForConsumption ? 'approved' : 'rejected',
          surplusPostId
        ]
      );

      return result[0];

    } catch (error) {
      logger.error('Error saving assessment:', error);
      throw error;
    }
  }

  /**
   * Bulk assess quality for multiple posts
   */
  static async bulkAssess(postIds) {
    try {
      const assessments = [];

      for (const postId of postIds) {
        try {
          // Get post photo
          const post = await query(
            `SELECT photo_url FROM surplus_posts WHERE id = $1`,
            [postId]
          );

          if (post && post.length > 0 && post[0].photo_url) {
            const assessment = await this.assessFoodPhoto(post[0].photo_url);
            await this.saveAssessment(postId, assessment);
            assessments.push({ postId, status: 'success', assessment });
          }
        } catch (error) {
          logger.error(`Error assessing post ${postId}:`, error);
          assessments.push({ postId, status: 'error', error: error.message });
        }
      }

      return assessments;

    } catch (error) {
      logger.error('Error in bulk assessment:', error);
      throw error;
    }
  }
}

module.exports = FoodQualityVerification;
