package com.resqmeal.service;

import com.resqmeal.common.AppConstants;
import com.resqmeal.dto.response.PageEnvelope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FoodService {

  private final JdbcTemplate jdbc;
  private final RealtimeEmitter realtimeEmitter;

  public FoodService(JdbcTemplate jdbc, RealtimeEmitter realtimeEmitter) {
    this.jdbc = jdbc;
    this.realtimeEmitter = realtimeEmitter;
  }

  public static int calculateUrgencyScore(int safetyWindowMinutes, int quantityServings) {
    int score = 50;
    if (safetyWindowMinutes > 120) {
      score -= 15;
    } else if (safetyWindowMinutes > 60) {
      score -= 5;
    } else if (safetyWindowMinutes <= 30) {
      score += 25;
    }
    if (quantityServings > 50) {
      score += 20;
    } else if (quantityServings > 30) {
      score += 10;
    }
    return Math.min(100, Math.max(0, score));
  }

  private static final String NOT_DELETED = " AND deleted_at IS NULL";

  public long ensureRestaurantId(long userId) {
    return UserIds.restaurantId(jdbc, userId)
        .orElseGet(
            () -> {
              String name =
                  jdbc.query(
                      "SELECT name FROM users WHERE id = ?",
                      rs -> rs.next() ? rs.getString("name") : "Donor",
                      userId);
              if (name == null || name.isBlank()) {
                name = "Donor";
              }
              GeneratedKeyHolder kh = new GeneratedKeyHolder();
              String businessName = name.trim();
              jdbc.update(
                  con -> {
                    PreparedStatement ps =
                        con.prepareStatement(
                            "INSERT INTO restaurants (user_id, business_name) VALUES (?, ?)",
                            Statement.RETURN_GENERATED_KEYS);
                    ps.setLong(1, userId);
                    ps.setString(2, businessName);
                    return ps;
                  },
                  kh);
              Number k = kh.getKey();
              return k != null ? k.longValue() : 0L;
            });
  }

  @Transactional
  public Map<String, Object> postFood(long userId, Map<String, Object> body) {
    long restaurantId = ensureRestaurantId(userId);
    String foodName = (String) body.get("food_name");
    String foodType = (String) body.get("food_type");
    Number qty = (Number) body.get("quantity_servings");
    String address = (String) body.get("address");
    if (foodName == null || foodType == null || qty == null || address == null) {
      throw new IllegalArgumentException("Missing required fields");
    }
    int quantity = qty.intValue();
    String description = (String) body.get("description");
    Double lat = body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : null;
    Double lon = body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : null;
    int safetyWindow =
        body.get("safety_window_minutes") != null
            ? ((Number) body.get("safety_window_minutes")).intValue()
            : 30;
    Double minT =
        body.get("min_storage_temp_celsius") != null
            ? ((Number) body.get("min_storage_temp_celsius")).doubleValue()
            : null;
    Double maxT =
        body.get("max_storage_temp_celsius") != null
            ? ((Number) body.get("max_storage_temp_celsius")).doubleValue()
            : null;
    Integer availH =
        body.get("availability_time_hours") != null
            ? ((Number) body.get("availability_time_hours")).intValue()
            : null;
    String photoUrl = (String) body.get("photo_url");
    Timestamp expiry;
    if (body.get("expiry_time") != null) {
      Object expiryRaw = body.get("expiry_time");
      if (expiryRaw instanceof java.time.Instant instant) {
        expiry = Timestamp.from(instant);
      } else if (expiryRaw instanceof java.util.Date date) {
        expiry = new Timestamp(date.getTime());
      } else {
        expiry = Timestamp.from(java.time.Instant.parse(expiryRaw.toString()));
      }
    } else {
      long expiryMs = System.currentTimeMillis() + safetyWindow * 60_000L;
      expiry = Timestamp.from(Instant.ofEpochMilli(expiryMs));
    }
    int urgency = calculateUrgencyScore(safetyWindow, quantity);

    GeneratedKeyHolder kh = new GeneratedKeyHolder();
    jdbc.update(
        con -> {
          PreparedStatement ps =
              con.prepareStatement(
                  """
                  INSERT INTO food_posts (
                    restaurant_id, food_name, food_type, quantity_servings, description,
                    latitude, longitude, address, safety_window_minutes, expiry_time,
                    min_storage_temp_celsius, max_storage_temp_celsius, availability_time_hours,
                    photo_url, preparation_timestamp, urgency_score, status, posted_at
                  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'POSTED', NOW())
                  """,
                  Statement.RETURN_GENERATED_KEYS);
          ps.setLong(1, restaurantId);
          ps.setString(2, foodName);
          ps.setString(3, foodType);
          ps.setInt(4, quantity);
          ps.setString(5, description);
          if (lat != null) {
            ps.setBigDecimal(6, BigDecimal.valueOf(lat));
          } else {
            ps.setObject(6, null);
          }
          if (lon != null) {
            ps.setBigDecimal(7, BigDecimal.valueOf(lon));
          } else {
            ps.setObject(7, null);
          }
          ps.setString(8, address);
          ps.setInt(9, safetyWindow);
          ps.setTimestamp(10, expiry);
          if (minT != null) {
            ps.setBigDecimal(11, BigDecimal.valueOf(minT));
          } else {
            ps.setObject(11, null);
          }
          if (maxT != null) {
            ps.setBigDecimal(12, BigDecimal.valueOf(maxT));
          } else {
            ps.setObject(12, null);
          }
          if (availH != null) {
            ps.setInt(13, availH);
          } else {
            ps.setObject(13, null);
          }
          ps.setString(14, photoUrl);
          ps.setTimestamp(15, Timestamp.from(Instant.now()));
          ps.setInt(16, urgency);
          return ps;
        },
        kh);
    long id = kh.getKey().longValue();
    Map<String, Object> formatted = mapFoodRow(loadFoodRow(id));
    realtimeEmitter.broadcast("food_posted", formatted);
    return formatted;
  }

  private Map<String, Object> loadFoodRow(long id) {
    return jdbc.query(
        "SELECT * FROM food_posts WHERE id = ?" + NOT_DELETED,
        rs -> {
          if (!rs.next()) {
            return null;
          }
          return rowToFoodMap(rs);
        },
        id);
  }

  private Map<String, Object> rowToFoodMap(java.sql.ResultSet rs) throws java.sql.SQLException {
    Map<String, Object> m = new HashMap<>();
    m.put("id", rs.getLong("id"));
    m.put("restaurant_id", rs.getLong("restaurant_id"));
    m.put("food_name", rs.getString("food_name"));
    m.put("food_type", rs.getString("food_type"));
    m.put("quantity_servings", rs.getInt("quantity_servings"));
    m.put("description", rs.getString("description"));
    Map<String, Object> loc = new HashMap<>();
    loc.put("latitude", rs.getObject("latitude"));
    loc.put("longitude", rs.getObject("longitude"));
    loc.put("address", rs.getString("address"));
    m.put("location", loc);
    m.put("photo_url", rs.getString("photo_url"));
    m.put("preparation_timestamp", rs.getTimestamp("preparation_timestamp"));
    m.put("safety_window_minutes", rs.getInt("safety_window_minutes"));
    m.put("expiry_time", rs.getTimestamp("expiry_time"));
    m.put("min_storage_temp_celsius", rs.getObject("min_storage_temp_celsius"));
    m.put("max_storage_temp_celsius", rs.getObject("max_storage_temp_celsius"));
    m.put("availability_time_hours", rs.getObject("availability_time_hours"));
    m.put("freshness_score", rs.getBigDecimal("freshness_score") != null ? rs.getDouble("freshness_score") : null);
    m.put("quality_score", rs.getObject("quality_score"));
    m.put("urgency_score", rs.getInt("urgency_score"));
    m.put("status", rs.getString("status"));
    Map<String, Object> ts = new HashMap<>();
    ts.put("posted_at", rs.getTimestamp("posted_at"));
    ts.put("matched_at", rs.getTimestamp("matched_at"));
    ts.put("accepted_at", rs.getTimestamp("accepted_at"));
    ts.put("picked_up_at", rs.getTimestamp("picked_up_at"));
    ts.put("delivered_at", rs.getTimestamp("delivered_at"));
    ts.put("expired_at", rs.getTimestamp("expired_at"));
    m.put("timestamps", ts);
    m.put("created_at", rs.getTimestamp("created_at"));
    m.put("updated_at", rs.getTimestamp("updated_at"));
    return m;
  }

  public Map<String, Object> mapFoodRow(Map<String, Object> raw) {
    if (raw == null) {
      return Map.of();
    }
    return raw;
  }

  public Map<String, Object> getMyPosts(long userId, String status, int limit, int offset) {
    Optional<Long> rid = UserIds.restaurantId(jdbc, userId);
    if (rid.isEmpty()) {
      return Map.of("data", List.of(), "count", 0);
    }
    StringBuilder q =
        new StringBuilder("SELECT * FROM food_posts WHERE restaurant_id = ?" + NOT_DELETED);
    List<Object> params = new ArrayList<>();
    params.add(rid.get());
    if (status != null && !status.isBlank()) {
      q.append(" AND status = ?");
      params.add(status);
    }
    q.append(" ORDER BY posted_at DESC LIMIT ? OFFSET ?");
    params.add(limit);
    params.add(offset);
    List<Map<String, Object>> rows =
        jdbc.query(
            q.toString(),
            (rs, rowNum) -> rowToFoodMap(rs),
            params.toArray());
    List<Map<String, Object>> formatted = new ArrayList<>();
    for (Map<String, Object> r : rows) {
      formatted.add(mapFoodRow(r));
    }
    return Map.of("data", formatted, "count", formatted.size());
  }

  public Map<String, Object> getFoodPost(long id) {
    Map<String, Object> row = loadFoodRow(id);
    if (row == null) {
      return null;
    }
    return mapFoodRow(row);
  }

  public Map<String, Object> getAvailableFood(
      String foodType, Integer minUrgency, Integer maxUrgency, int limit) {
    StringBuilder q =
        new StringBuilder(
            """
            SELECT * FROM food_posts
            WHERE status IN ('POSTED','MATCHED','ACCEPTED','PICKED_UP')
            AND expiry_time > NOW()
            AND deleted_at IS NULL
            """);
    List<Object> params = new ArrayList<>();
    if (foodType != null && !foodType.isBlank()) {
      q.append(" AND food_type = ?");
      params.add(foodType);
    }
    if (minUrgency != null) {
      q.append(" AND urgency_score >= ?");
      params.add(minUrgency);
    }
    if (maxUrgency != null) {
      q.append(" AND urgency_score <= ?");
      params.add(maxUrgency);
    }
    q.append(" ORDER BY posted_at DESC, urgency_score DESC LIMIT ?");
    params.add(limit);
    List<Map<String, Object>> rows =
        jdbc.query(q.toString(), (rs, rowNum) -> rowToFoodMap(rs), params.toArray());
    List<Map<String, Object>> formatted = new ArrayList<>();
    for (Map<String, Object> r : rows) {
      formatted.add(mapFoodRow(r));
    }
    return Map.of("data", formatted, "count", formatted.size());
  }

  @Transactional
  public Map<String, Object> updateFood(long userId, long id, Map<String, Object> body) {
    long restaurantId =
        UserIds.restaurantId(jdbc, userId)
            .orElseThrow(() -> new IllegalStateException("Only donors can update food posts."));
    Map<String, Object> existing = loadFoodRow(id);
    if (existing == null || restaurantId != toLong(existing.get("restaurant_id"))) {
      throw new IllegalStateException("Food post not found");
    }
    if (!AppConstants.FOOD_STATUS_POSTED.equals(existing.get("status"))) {
      throw new IllegalStateException("Cannot update post after POSTED status");
    }
    jdbc.update(
        """
        UPDATE food_posts SET
          food_name = COALESCE(?, food_name),
          quantity_servings = COALESCE(?, quantity_servings),
          description = COALESCE(?, description),
          photo_url = COALESCE(?, photo_url),
          updated_at = NOW()
        WHERE id = ?
        """,
        body.get("food_name"),
        body.get("quantity_servings") != null ? ((Number) body.get("quantity_servings")).intValue() : null,
        body.get("description"),
        body.get("photo_url"),
        id);
    return mapFoodRow(loadFoodRow(id));
  }

  @Transactional
  public void deleteFood(long userId, long id) {
    long restaurantId =
        UserIds.restaurantId(jdbc, userId)
            .orElseThrow(() -> new IllegalStateException("Only donors can delete food posts."));
    Map<String, Object> existing = loadFoodRow(id);
    if (existing == null || restaurantId != toLong(existing.get("restaurant_id"))) {
      throw new IllegalStateException("Food post not found");
    }
    if (!AppConstants.FOOD_STATUS_POSTED.equals(existing.get("status"))) {
      throw new IllegalStateException("Cannot delete post after POSTED status");
    }
    jdbc.update("UPDATE food_posts SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?", id);
  }

  public Map<String, Object> listFoodPosts(
      String status, String foodType, int page, int size, String sort) {
    int lim = Math.min(Math.max(size, 1), 100);
    int off = Math.max(page, 0) * lim;
    String orderBy =
        switch (sort != null ? sort.toLowerCase() : "") {
          case "createdat,asc", "created_at,asc" -> "created_at ASC";
          case "expiry_time,asc", "expirytime,asc" -> "expiry_time ASC";
          case "expiry_time,desc", "expirytime,desc" -> "expiry_time DESC";
          default -> "created_at DESC";
        };
    StringBuilder q =
        new StringBuilder(
            "SELECT * FROM food_posts WHERE deleted_at IS NULL AND expiry_time > NOW()");
    List<Object> params = new ArrayList<>();
    if (status != null && !status.isBlank()) {
      q.append(" AND status = ?");
      params.add(status);
    }
    if (foodType != null && !foodType.isBlank()) {
      q.append(" AND food_type = ?");
      params.add(foodType);
    }
    String countSql = q.toString().replace("SELECT *", "SELECT COUNT(*)");
    Integer total = jdbc.queryForObject(countSql, Integer.class, params.toArray());
    q.append(" ORDER BY ").append(orderBy).append(" LIMIT ? OFFSET ?");
    params.add(lim);
    params.add(off);
    List<Map<String, Object>> rows =
        jdbc.query(q.toString(), (rs, rowNum) -> rowToFoodMap(rs), params.toArray());
    List<Map<String, Object>> formatted = new ArrayList<>();
    for (Map<String, Object> r : rows) {
      formatted.add(mapFoodRow(r));
    }
    int totalElements = total != null ? total : 0;
    return PageEnvelope.of(formatted, page, lim, totalElements);
  }

  private static long toLong(Object o) {
    if (o instanceof Number n) {
      return n.longValue();
    }
    return 0;
  }
}

