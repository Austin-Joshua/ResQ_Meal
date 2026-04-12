package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImpactService {

  private final JdbcTemplate jdbc;

  public ImpactService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private static String periodClause(String period) {
    if (period == null) {
      return "1=1";
    }
    return switch (period) {
      case "today" -> "DATE(il.created_at) = CURDATE()";
      case "week" -> "il.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      case "month" -> "il.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      default -> "1=1";
    };
  }

  private Map<String, Object> formatRow(Map<String, Object> row) {
    if (row == null) {
      return Map.of(
          "meals_saved", 0,
          "food_saved_kg", 0.0,
          "co2_saved_kg", 0.0,
          "water_saved_liters", 0.0,
          "total_deliveries", 0);
    }
    Map<String, Object> m = new HashMap<>();
    m.put("meals_saved", intVal(row.get("meals_saved")));
    m.put("food_saved_kg", doubleVal(row.get("food_saved_kg")));
    m.put("co2_saved_kg", doubleVal(row.get("co2_saved_kg")));
    m.put("water_saved_liters", doubleVal(row.get("water_saved_liters")));
    m.put("total_deliveries", intVal(row.get("total_deliveries")));
    return m;
  }

  private static int intVal(Object o) {
    return o == null ? 0 : ((Number) o).intValue();
  }

  private static double doubleVal(Object o) {
    return o == null ? 0.0 : ((Number) o).doubleValue();
  }

  public Map<String, Object> ngoImpact(long userId, String period) {
    long ngoId =
        UserIds.ngoId(jdbc, userId).orElseThrow(() -> new IllegalStateException("NGO profile not found"));
    String clause = periodClause(period);
    Map<String, Object> row =
        jdbc.queryForMap(
            "SELECT COALESCE(SUM(il.meals_saved),0) AS meals_saved, COALESCE(SUM(il.food_saved_kg),0) AS food_saved_kg, "
                + "COALESCE(SUM(il.co2_saved_kg),0) AS co2_saved_kg, COALESCE(SUM(il.water_saved_liters),0) AS water_saved_liters, "
                + "COUNT(DISTINCT il.food_post_id) AS total_deliveries "
                + "FROM impact_logs il WHERE il.ngo_id = ? AND "
                + clause,
            ngoId);
    return formatRow(row);
  }

  public Map<String, Object> restaurantImpact(long userId, String period) {
    long restaurantId =
        UserIds.restaurantId(jdbc, userId)
            .orElseThrow(() -> new IllegalStateException("Restaurant profile not found"));
    String clause = periodClause(period);
    Map<String, Object> row =
        jdbc.queryForMap(
            "SELECT COALESCE(SUM(il.meals_saved),0) AS meals_saved, COALESCE(SUM(il.food_saved_kg),0) AS food_saved_kg, "
                + "COALESCE(SUM(il.co2_saved_kg),0) AS co2_saved_kg, COALESCE(SUM(il.water_saved_liters),0) AS water_saved_liters, "
                + "COUNT(DISTINCT il.food_post_id) AS total_deliveries "
                + "FROM impact_logs il JOIN food_posts fp ON il.food_post_id = fp.id "
                + "WHERE fp.restaurant_id = ? AND "
                + clause,
            restaurantId);
    return formatRow(row);
  }

  public Map<String, Object> globalImpact() {
    Map<String, Object> row =
        jdbc.queryForMap(
            "SELECT COALESCE(SUM(il.meals_saved),0) AS meals_saved, COALESCE(SUM(il.food_saved_kg),0) AS food_saved_kg, "
                + "COALESCE(SUM(il.co2_saved_kg),0) AS co2_saved_kg, COALESCE(SUM(il.water_saved_liters),0) AS water_saved_liters, "
                + "COUNT(DISTINCT il.food_post_id) AS total_deliveries FROM impact_logs il");
    return formatRow(row);
  }

  public Map<String, Object> timeline(int days) {
    List<Map<String, Object>> rows =
        jdbc.queryForList(
            """
            SELECT DATE(il.created_at) AS date,
                   SUM(il.meals_saved) AS meals_saved,
                   SUM(il.food_saved_kg) AS food_saved_kg,
                   SUM(il.co2_saved_kg) AS co2_saved_kg,
                   SUM(il.water_saved_liters) AS water_saved_liters,
                   COUNT(DISTINCT il.food_post_id) AS deliveries
            FROM impact_logs il
            WHERE il.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(il.created_at)
            ORDER BY date DESC
            """,
            days);
    List<Map<String, Object>> timeline = new java.util.ArrayList<>();
    for (Map<String, Object> r : rows) {
      Map<String, Object> item = new HashMap<>();
      item.put("date", r.get("date"));
      item.put("meals_saved", intVal(r.get("meals_saved")));
      item.put("food_saved_kg", doubleVal(r.get("food_saved_kg")));
      item.put("co2_saved_kg", doubleVal(r.get("co2_saved_kg")));
      item.put("water_saved_liters", doubleVal(r.get("water_saved_liters")));
      item.put("deliveries", intVal(r.get("deliveries")));
      timeline.add(item);
    }
    return Map.of("timeline", timeline);
  }
}
