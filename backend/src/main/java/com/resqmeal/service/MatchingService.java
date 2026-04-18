package com.resqmeal.service;

import com.resqmeal.util.GeoUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MatchingService {

  private final JdbcTemplate jdbc;
  private final NotificationService notificationService;
  private final RealtimeEmitter realtimeEmitter;

  public MatchingService(
      JdbcTemplate jdbc, NotificationService notificationService, RealtimeEmitter realtimeEmitter) {
    this.jdbc = jdbc;
    this.notificationService = notificationService;
    this.realtimeEmitter = realtimeEmitter;
  }

  public static double calculateMatchScore(double distanceKm, double capacityPercent, String foodType) {
    double score = 0.5;
    if (distanceKm <= 2) {
      score += 0.35;
    } else if (distanceKm <= 5) {
      score += 0.25;
    } else if (distanceKm <= 10) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    score += (capacityPercent / 100.0) * 0.3;
    List<String> high = List.of("meals", "vegetables", "baked");
    if (high.contains(foodType)) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    return Math.min(1.0, score);
  }

  private Map<String, Object> formatMatch(java.sql.ResultSet rs) throws java.sql.SQLException {
    Map<String, Object> m = new HashMap<>();
    m.put("id", rs.getLong("id"));
    m.put("food_post_id", rs.getLong("food_post_id"));
    m.put("ngo_id", rs.getLong("ngo_id"));
    long vid = rs.getLong("volunteer_id");
    m.put("volunteer_id", rs.wasNull() ? null : vid);
    m.put("status", rs.getString("status"));
    m.put("match_score", rs.getDouble("match_score"));
    m.put("distance_km", rs.getDouble("distance_km"));
    m.put("estimated_pickup_time_minutes", rs.getObject("estimated_pickup_time_minutes"));
    m.put("delivery_proof_photo", rs.getString("delivery_proof_photo"));
    m.put("notes", rs.getString("notes"));
    Map<String, Object> ts = new HashMap<>();
    ts.put("matched_at", rs.getTimestamp("matched_at"));
    ts.put("accepted_at", rs.getTimestamp("accepted_at"));
    ts.put("picked_up_at", rs.getTimestamp("picked_up_at"));
    ts.put("delivered_at", rs.getTimestamp("delivered_at"));
    m.put("timestamps", ts);
    m.put("created_at", rs.getTimestamp("created_at"));
    m.put("updated_at", rs.getTimestamp("updated_at"));
    return m;
  }

  @Transactional
  public Map<String, Object> createMatch(long userId, long foodPostId) {
    long ngoId =
        UserIds.ngoId(jdbc, userId).orElseThrow(() -> new IllegalStateException("NGO profile not found"));
    Map<String, Object> food =
        jdbc.query(
            "SELECT * FROM food_posts WHERE id = ?",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> fp = new HashMap<>();
              fp.put("id", rs.getLong("id"));
              fp.put("status", rs.getString("status"));
              fp.put("food_name", rs.getString("food_name"));
              fp.put("food_type", rs.getString("food_type"));
              fp.put("latitude", rs.getObject("latitude"));
              fp.put("longitude", rs.getObject("longitude"));
              return fp;
            },
            foodPostId);
    if (food == null) {
      throw new IllegalStateException("Food post not found");
    }
    if (!"POSTED".equals(food.get("status"))) {
      throw new IllegalStateException("Food already matched or not available");
    }
    Map<String, Object> ngo =
        jdbc.query(
            "SELECT n.*, u.latitude AS ulat, u.longitude AS ulon FROM ngos n JOIN users u ON u.id = n.user_id WHERE n.id = ?",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> row = new HashMap<>();
              row.put("id", rs.getLong("id"));
              row.put("daily_capacity", rs.getInt("daily_capacity"));
              row.put("used_capacity", rs.getInt("used_capacity"));
              row.put("ulat", rs.getObject("ulat"));
              row.put("ulon", rs.getObject("ulon"));
              return row;
            },
            ngoId);
    if (ngo == null) {
      throw new IllegalStateException("NGO not found");
    }
    double distanceKm = 2;
    if (food.get("latitude") != null
        && food.get("longitude") != null
        && ngo.get("ulat") != null
        && ngo.get("ulon") != null) {
      double la = ((BigDecimal) food.get("latitude")).doubleValue();
      double lo = ((BigDecimal) food.get("longitude")).doubleValue();
      double nla = ((BigDecimal) ngo.get("ulat")).doubleValue();
      double nlo = ((BigDecimal) ngo.get("ulon")).doubleValue();
      distanceKm = GeoUtils.distanceKm(la, lo, nla, nlo);
    }
    int daily = ((Number) ngo.get("daily_capacity")).intValue();
    int used = ((Number) ngo.get("used_capacity")).intValue();
    double remaining = Math.max(0, daily - used);
    double capacityPercent = daily > 0 ? (remaining / daily) * 100.0 : 0;
    String foodType = (String) food.get("food_type");
    double matchScore = calculateMatchScore(distanceKm, capacityPercent, foodType);

    GeneratedKeyHolder kh = new GeneratedKeyHolder();
    double finalDistanceKm = distanceKm;
    double finalMatchScore = matchScore;
    jdbc.update(
        con -> {
          PreparedStatement ps =
              con.prepareStatement(
                  """
                  INSERT INTO matches (
                    food_post_id, ngo_id, status, match_score, distance_km,
                    estimated_pickup_time_minutes, matched_at
                  ) VALUES (?, ?, 'MATCHED', ?, ?, 30, NOW())
                  """,
                  Statement.RETURN_GENERATED_KEYS);
          ps.setLong(1, foodPostId);
          ps.setLong(2, ngoId);
          ps.setBigDecimal(3, BigDecimal.valueOf(finalMatchScore));
          ps.setBigDecimal(4, BigDecimal.valueOf(finalDistanceKm));
          return ps;
        },
        kh);
    long matchId = kh.getKey().longValue();
    jdbc.update(
        "UPDATE food_posts SET status = 'MATCHED', matched_at = NOW() WHERE id = ?", foodPostId);

    Map<String, Object> matchRow =
        jdbc.query(
            "SELECT * FROM matches WHERE id = ?",
            rs -> {
              rs.next();
              return formatMatch(rs);
            },
            matchId);

    Long restaurantUserId =
        jdbc.query(
            "SELECT r.user_id FROM food_posts fp JOIN restaurants r ON r.id = fp.restaurant_id WHERE fp.id = ?",
            rs -> rs.next() ? rs.getLong("user_id") : null,
            foodPostId);
    if (restaurantUserId != null) {
      notificationService.addNotification(
          restaurantUserId,
          "match_created",
          "New match request",
          "An NGO requested your surplus food (" + food.get("food_name") + ").",
          "#matches",
          matchId);
      realtimeEmitter.emitToUser(restaurantUserId, "match_created", matchRow);
    }
    return matchRow;
  }

  public Map<String, Object> getMatchesForNgo(long userId, String status, int limit, int offset) {
    long ngoId =
        UserIds.ngoId(jdbc, userId).orElseThrow(() -> new IllegalStateException("NGO profile not found"));
    StringBuilder q = new StringBuilder("SELECT * FROM matches WHERE ngo_id = ?");
    List<Object> p = new ArrayList<>();
    p.add(ngoId);
    if (status != null && !status.isBlank()) {
      q.append(" AND status = ?");
      p.add(status);
    }
    q.append(" ORDER BY matched_at DESC LIMIT ? OFFSET ?");
    p.add(limit);
    p.add(offset);
    List<Map<String, Object>> rows =
        jdbc.query(q.toString(), (rs, rowNum) -> formatMatch(rs), p.toArray());
    return Map.of("data", rows, "count", rows.size());
  }

  public Map<String, Object> getMatchesForRestaurant(long userId, String status, int limit, int offset) {
    long restaurantId =
        UserIds.restaurantId(jdbc, userId)
            .orElseThrow(() -> new IllegalStateException("Restaurant profile not found"));
    StringBuilder q =
        new StringBuilder(
            """
            SELECT m.* FROM matches m
            JOIN food_posts fp ON m.food_post_id = fp.id
            WHERE fp.restaurant_id = ?
            """);
    List<Object> p = new ArrayList<>();
    p.add(restaurantId);
    if (status != null && !status.isBlank()) {
      q.append(" AND m.status = ?");
      p.add(status);
    }
    q.append(" ORDER BY m.matched_at DESC LIMIT ? OFFSET ?");
    p.add(limit);
    p.add(offset);
    List<Map<String, Object>> rows =
        jdbc.query(q.toString(), (rs, rowNum) -> formatMatch(rs), p.toArray());
    return Map.of("data", rows, "count", rows.size());
  }

  public Map<String, Object> getMatch(long id) {
    return jdbc.query(
        "SELECT * FROM matches WHERE id = ?",
        rs -> {
          if (!rs.next()) {
            return null;
          }
          return formatMatch(rs);
        },
        id);
  }

  @Transactional
  public Map<String, Object> updateMatchStatus(
      long matchId, String status, Long volunteerId, String deliveryProofPhoto) {
    if (!List.of("ACCEPTED", "PICKED_UP", "DELIVERED").contains(status)) {
      throw new IllegalArgumentException("Invalid status");
    }
    Map<String, Object> match =
        jdbc.query(
            "SELECT * FROM matches WHERE id = ?",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> m = new HashMap<>();
              m.put("id", rs.getLong("id"));
              m.put("status", rs.getString("status"));
              m.put("food_post_id", rs.getLong("food_post_id"));
              m.put("ngo_id", rs.getLong("ngo_id"));
              return m;
            },
            matchId);
    if (match == null) {
      throw new IllegalStateException("Match not found");
    }
    String current = (String) match.get("status");
    List<String> progression = List.of("MATCHED", "ACCEPTED", "PICKED_UP", "DELIVERED");
    int cur = progression.indexOf(current);
    int nxt = progression.indexOf(status);
    if (nxt <= cur) {
      throw new IllegalStateException("Invalid status transition");
    }
    if ("PICKED_UP".equals(status) && volunteerId == null) {
      throw new IllegalArgumentException("volunteer_id required for PICKED_UP");
    }
    long foodPostId = ((Number) match.get("food_post_id")).longValue();
    if ("ACCEPTED".equals(status)) {
      jdbc.update(
          "UPDATE matches SET status = ?, accepted_at = NOW(), updated_at = NOW() WHERE id = ?",
          status,
          matchId);
    } else if ("PICKED_UP".equals(status)) {
      jdbc.update(
          "UPDATE matches SET status = ?, picked_up_at = NOW(), volunteer_id = ?, updated_at = NOW() WHERE id = ?",
          status,
          volunteerId,
          matchId);
    } else if ("DELIVERED".equals(status)) {
      jdbc.update(
          """
          UPDATE matches SET status = ?, delivered_at = NOW(),
            delivery_proof_photo = COALESCE(?, delivery_proof_photo), updated_at = NOW()
          WHERE id = ?
          """,
          status,
          deliveryProofPhoto,
          matchId);
      Map<String, Object> fp =
          jdbc.query(
              "SELECT quantity_servings FROM food_posts WHERE id = ?",
              rs -> {
                if (!rs.next()) {
                  return null;
                }
                Map<String, Object> m = new HashMap<>();
                m.put("quantity_servings", rs.getInt("quantity_servings"));
                return m;
              },
              foodPostId);
      if (fp != null) {
        int meals = ((Number) fp.get("quantity_servings")).intValue();
        long ngoId = ((Number) match.get("ngo_id")).longValue();
        jdbc.update(
            """
            INSERT INTO impact_logs (
              food_post_id, ngo_id, meals_saved, food_saved_kg, co2_saved_kg, water_saved_liters
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            foodPostId,
            ngoId,
            meals,
            meals * 0.5,
            meals * 2.5,
            meals * 1000.0);
      }
    }
    jdbc.update(
        "UPDATE food_posts SET status = ?, updated_at = NOW() WHERE id = ?", status, foodPostId);

    Map<String, Object> updated =
        jdbc.query(
            "SELECT * FROM matches WHERE id = ?",
            rs -> {
              rs.next();
              return formatMatch(rs);
            },
            matchId);

    Long restaurantUserId =
        jdbc.query(
            "SELECT r.user_id FROM food_posts fp JOIN restaurants r ON r.id = fp.restaurant_id WHERE fp.id = ?",
            rs -> rs.next() ? rs.getLong("user_id") : null,
            foodPostId);
    Long ngoUserId =
        jdbc.query(
            "SELECT user_id FROM ngos WHERE id = ?",
            rs -> rs.next() ? rs.getLong("user_id") : null,
            ((Number) match.get("ngo_id")).longValue());

    String title = "Match updated";
    String message = "Status: " + status;
    if ("ACCEPTED".equals(status)) {
      title = "Match accepted";
      message = "An NGO accepted the match. Food can be picked up.";
    } else if ("PICKED_UP".equals(status)) {
      title = "Food picked up";
      message = "Volunteer has picked up the food.";
    } else if ("DELIVERED".equals(status)) {
      title = "Delivery completed";
      message = "Food was delivered successfully.";
    }
    if (restaurantUserId != null) {
      notificationService.addNotification(
          restaurantUserId, "match_status_updated", title, message, "#matches", matchId);
      realtimeEmitter.emitToUser(restaurantUserId, "match_status_updated", updated);
    }
    if (ngoUserId != null) {
      notificationService.addNotification(
          ngoUserId, "match_status_updated", title, message, "#matches", matchId);
      realtimeEmitter.emitToUser(ngoUserId, "match_status_updated", updated);
    }
    return updated;
  }

  public Map<String, Object> getRecommended(long foodPostId, int topN) {
    Map<String, Object> post =
        jdbc.query(
            """
            SELECT fp.*, u.latitude AS donor_lat, u.longitude AS donor_lon
            FROM food_posts fp
            JOIN restaurants r ON r.id = fp.restaurant_id
            JOIN users u ON u.id = r.user_id
            WHERE fp.id = ? AND fp.status = 'POSTED'
            """,
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> m = new HashMap<>();
              m.put("latitude", rs.getObject("latitude"));
              m.put("longitude", rs.getObject("longitude"));
              m.put("donor_lat", rs.getObject("donor_lat"));
              m.put("donor_lon", rs.getObject("donor_lon"));
              m.put("quantity_servings", rs.getInt("quantity_servings"));
              m.put("food_type", rs.getString("food_type"));
              return m;
            },
            foodPostId);
    if (post == null) {
      throw new IllegalStateException("Food post not found or not available");
    }
    double donorLat =
        ((BigDecimal) (post.get("donor_lat") != null ? post.get("donor_lat") : post.get("latitude")))
            .doubleValue();
    double donorLon =
        ((BigDecimal) (post.get("donor_lon") != null ? post.get("donor_lon") : post.get("longitude")))
            .doubleValue();
    String foodType = (String) post.get("food_type");
    if (foodType == null) {
      foodType = "others";
    }

    List<Map<String, Object>> ngos =
        jdbc.query(
            """
            SELECT n.id, n.organization_name, n.daily_capacity, n.used_capacity,
                   u.latitude, u.longitude,
                   (n.daily_capacity - n.used_capacity) AS available_capacity
            FROM ngos n
            JOIN users u ON u.id = n.user_id
            WHERE n.verified = TRUE AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
            AND (n.daily_capacity - n.used_capacity) > 0
            """,
            (rs, rowNum) -> {
              Map<String, Object> row = new HashMap<>();
              row.put("id", rs.getLong("id"));
              row.put("organization_name", rs.getString("organization_name"));
              row.put("daily_capacity", rs.getInt("daily_capacity"));
              row.put("available_capacity", rs.getInt("available_capacity"));
              row.put("latitude", rs.getBigDecimal("latitude").doubleValue());
              row.put("longitude", rs.getBigDecimal("longitude").doubleValue());
              return row;
            });

    Map<Long, Integer> demandByNgo = new HashMap<>();
    jdbc.query(
        """
        SELECT n.id AS ngo_id,
               COUNT(DISTINCT m.id) AS accepted_count
        FROM ngos n
        LEFT JOIN matches m ON m.ngo_id = n.id
          AND m.status IN ('ACCEPTED', 'PICKED_UP', 'DELIVERED')
          AND m.matched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY n.id
        """,
        rs -> {
          while (rs.next()) {
            demandByNgo.put(rs.getLong("ngo_id"), rs.getInt("accepted_count"));
          }
          return null;
        });

    List<Map<String, Object>> scored = new ArrayList<>();
    for (Map<String, Object> ngo : ngos) {
      double nla = (Double) ngo.get("latitude");
      double nlo = (Double) ngo.get("longitude");
      double distanceKm = GeoUtils.distanceKm(donorLat, donorLon, nla, nlo);
      int available = ((Number) ngo.get("available_capacity")).intValue();
      int dailyCap = ((Number) ngo.get("daily_capacity")).intValue();
      double capacityPercent = dailyCap > 0 ? (available / (double) dailyCap) * 100.0 : 0;
      List<String> highDemand = List.of("meals", "vegetables", "baked");
      double demandBoost = 1.0;
      int recentAccepted = demandByNgo.getOrDefault(((Number) ngo.get("id")).longValue(), 0);
      if (recentAccepted >= 10) {
        demandBoost = 1.25;
      } else if (recentAccepted >= 5) {
        demandBoost = 1.15;
      }
      double overallScore = 0.5;
      overallScore += distanceKm <= 2 ? 0.35 : distanceKm <= 5 ? 0.25 : distanceKm <= 10 ? 0.15 : 0.05;
      overallScore += (capacityPercent / 100.0) * 0.3;
      overallScore += highDemand.contains(foodType) ? 0.15 : 0.05;
      overallScore = Math.min(1.0, overallScore * demandBoost);
      Map<String, Object> item = new HashMap<>();
      item.put("ngo_id", ngo.get("id"));
      item.put("organization_name", ngo.get("organization_name"));
      item.put("distance_km", Math.round(distanceKm * 10.0) / 10.0);
      item.put("available_capacity", available);
      item.put("match_score", Math.round(overallScore * 100.0) / 100.0);
      item.put("demand_boost", demandBoost);
      scored.add(item);
    }
    scored.sort((a, b) -> Double.compare((Double) b.get("match_score"), (Double) a.get("match_score")));
    List<Map<String, Object>> top =
        scored.size() > topN ? new ArrayList<>(scored.subList(0, topN)) : scored;
    return Map.of("data", top, "food_post_id", foodPostId);
  }

  public Map<String, Object> assignVolunteer(long matchId, long volunteerId) {
    jdbc.update(
        "UPDATE matches SET volunteer_id = ?, updated_at = NOW() WHERE id = ?", volunteerId, matchId);
    return jdbc.query(
        "SELECT * FROM matches WHERE id = ?",
        rs -> {
          rs.next();
          return formatMatch(rs);
        },
        matchId);
  }
}
