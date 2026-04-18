package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@Service
public class OrganisationService {

  private final JdbcTemplate jdbc;

  public OrganisationService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional
  public Map<String, Object> postFood(long userId, String role, Map<String, Object> body) {
    if (!"restaurant".equalsIgnoreCase(role)) {
      throw new IllegalStateException("Only donors (restaurants) can add food.");
    }
    long restaurantId =
        UserIds.restaurantId(jdbc, userId)
            .orElseThrow(() -> new IllegalStateException("Donor (restaurant) profile not found."));
    String foodName = (String) body.get("food_name");
    String address = (String) body.get("address");
    if (foodName == null || address == null) {
      throw new IllegalArgumentException("Missing required fields: food_name, address");
    }
    String foodType = body.get("food_type") != null ? (String) body.get("food_type") : "others";
    int qty = body.get("quantity_servings") != null ? ((Number) body.get("quantity_servings")).intValue() : 1;
    String description = (String) body.get("description");
    Double lat = body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : null;
    Double lon = body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : null;
    Object fs = body.get("freshness_score");
    Object qs = body.get("quality_score");

    GeneratedKeyHolder kh = new GeneratedKeyHolder();
    jdbc.update(
        con -> {
          PreparedStatement ps =
              con.prepareStatement(
                  """
                  INSERT INTO organisation_food (restaurant_id, food_name, food_type, quantity_servings,
                    description, address, latitude, longitude, freshness_score, quality_score, status)
                  VALUES (?,?,?,?,?,?,?,?,?,?,'PENDING')
                  """,
                  Statement.RETURN_GENERATED_KEYS);
          ps.setLong(1, restaurantId);
          ps.setString(2, foodName);
          ps.setString(3, foodType);
          ps.setInt(4, qty);
          ps.setString(5, description);
          ps.setString(6, address);
          if (lat != null) {
            ps.setDouble(7, lat);
          } else {
            ps.setObject(7, null);
          }
          if (lon != null) {
            ps.setDouble(8, lon);
          } else {
            ps.setObject(8, null);
          }
          if (fs != null) {
            ps.setInt(9, ((Number) fs).intValue());
          } else {
            ps.setObject(9, null);
          }
          if (qs != null) {
            ps.setInt(10, ((Number) qs).intValue());
          } else {
            ps.setObject(10, null);
          }
          return ps;
        },
        kh);
    long id = kh.getKey().longValue();
    Map<String, Object> row = jdbc.queryForMap("SELECT * FROM organisation_food WHERE id = ?", id);
    return Map.of("success", true, "data", row, "message", "Food added. It will appear on the volunteer page.");
  }

  public Map<String, Object> getMyOrganisationFood(long userId, String role) {
    if (!("ngo".equalsIgnoreCase(role) || "restaurant".equalsIgnoreCase(role))) {
      throw new IllegalStateException("Only donors or organisations can view their food list.");
    }
    if ("restaurant".equalsIgnoreCase(role)) {
      return UserIds.restaurantId(jdbc, userId)
          .map(
              rid -> {
                List<Map<String, Object>> rows =
                    jdbc.queryForList(
                        "SELECT * FROM organisation_food WHERE restaurant_id = ? ORDER BY created_at DESC",
                        rid);
                return Map.of("success", true, "data", rows);
              })
          .orElse(Map.of("success", true, "data", List.of()));
    }
    return UserIds.ngoId(jdbc, userId)
        .map(
            nid -> {
              List<Map<String, Object>> rows =
                  jdbc.queryForList(
                      "SELECT * FROM organisation_food WHERE ngo_id = ? ORDER BY created_at DESC", nid);
              return Map.of("success", true, "data", rows);
            })
        .orElse(Map.of("success", true, "data", List.of()));
  }

  public Map<String, Object> getAvailableOrganisationFood() {
    List<Map<String, Object>> rows =
        jdbc.queryForList(
            """
            SELECT of.*,
              COALESCE(n.organization_name, r.business_name) AS organization_name
            FROM organisation_food of
            LEFT JOIN ngos n ON n.id = of.ngo_id
            LEFT JOIN restaurants r ON r.id = of.restaurant_id
            WHERE of.status = 'PENDING'
              AND (of.ngo_id IS NOT NULL OR of.restaurant_id IS NOT NULL)
            ORDER BY of.created_at DESC
            """);
    return Map.of("success", true, "data", rows);
  }
}
