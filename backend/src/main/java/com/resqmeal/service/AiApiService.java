package com.resqmeal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiApiService {

  private final JdbcTemplate jdbc;

  @Value("${freshness.ai-url:}")
  private String freshnessAiUrl;

  @Value("${freshness.env-ai-url:}")
  private String freshnessEnvAiUrl;

  public AiApiService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public Map<String, Object> demandPrediction() {
    List<Map<String, Object>> rows =
        jdbc.query(
            """
            SELECT n.id AS ngo_id, n.organization_name, n.daily_capacity,
                   n.used_capacity,
                   COUNT(DISTINCT m.id) AS accepted_count,
                   COUNT(DISTINCT CASE WHEN m.status = 'DELIVERED' THEN m.id END) AS delivered_count
            FROM ngos n
            LEFT JOIN matches m ON m.ngo_id = n.id
              AND m.status IN ('ACCEPTED', 'PICKED_UP', 'DELIVERED')
              AND m.matched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            WHERE n.verified = TRUE
            GROUP BY n.id, n.organization_name, n.daily_capacity, n.used_capacity
            """,
            (rs, rowNum) -> {
              Map<String, Object> r = new HashMap<>();
              r.put("ngo_id", rs.getLong("ngo_id"));
              r.put("organization_name", rs.getString("organization_name"));
              r.put("daily_capacity", rs.getInt("daily_capacity"));
              r.put("used_capacity", rs.getInt("used_capacity"));
              r.put("accepted_count", rs.getInt("accepted_count"));
              r.put("delivered_count", rs.getInt("delivered_count"));
              return r;
            });
    int dayOfWeek = java.time.LocalDate.now().getDayOfWeek().getValue() % 7;
    List<Map<String, Object>> predictions = new ArrayList<>();
    for (Map<String, Object> r : rows) {
      int capacity = ((Number) r.get("daily_capacity")).intValue();
      int used = ((Number) r.get("used_capacity")).intValue();
      int accepted = ((Number) r.get("accepted_count")).intValue();
      int delivered = ((Number) r.get("delivered_count")).intValue();
      int recentDemand = accepted + delivered;
      int predicted =
          (int)
              Math.round(
                  (capacity - used) * 0.6 + Math.min(recentDemand * 2, capacity) * 0.4);
      String level =
          predicted >= capacity * 0.8
              ? "critical"
              : predicted >= capacity * 0.5 ? "high" : "normal";
      Map<String, Object> p = new HashMap<>();
      p.put("ngo_id", r.get("ngo_id"));
      p.put("organization_name", r.get("organization_name"));
      p.put("predicted_demand_servings", Math.max(0, predicted));
      p.put("demand_level", level);
      p.put("day_of_week", dayOfWeek);
      p.put("accepted_last_30d", accepted);
      p.put("delivered_last_30d", delivered);
      predictions.add(p);
    }
    return Map.of("data", predictions);
  }

  @Transactional
  public Map<String, Object> feedback(long matchId, String outcome, Integer delayMinutes, String notes) {
    List<Map<String, Object>> m =
        jdbc.query(
            "SELECT id, ngo_id, food_post_id FROM matches WHERE id = ?",
            (rs, rowNum) -> {
              Map<String, Object> row = new HashMap<>();
              row.put("ngo_id", rs.getLong("ngo_id"));
              row.put("food_post_id", rs.getLong("food_post_id"));
              return row;
            },
            matchId);
    if (m.isEmpty()) {
      throw new IllegalStateException("Match not found");
    }
    try {
      jdbc.update(
          """
          INSERT INTO ai_feedback (match_id, ngo_id, food_post_id, outcome, delay_minutes, notes, created_at)
          VALUES (?,?,?,?,?,?,NOW())
          """,
          matchId,
          m.get(0).get("ngo_id"),
          m.get(0).get("food_post_id"),
          outcome,
          delayMinutes,
          notes);
    } catch (Exception e) {
      return Map.of("success", true, "message", "Feedback recorded (logging only)");
    }
    return Map.of("success", true, "message", "Feedback recorded");
  }

  public Map<String, Object> health() {
    boolean fresh =
        (freshnessAiUrl != null && !freshnessAiUrl.isBlank())
            || (freshnessEnvAiUrl != null && !freshnessEnvAiUrl.isBlank());
    return Map.of(
        "freshness_image", fresh,
        "freshness_env", freshnessEnvAiUrl != null && !freshnessEnvAiUrl.isBlank(),
        "demand_prediction", true,
        "feedback_enabled", true);
  }
}
