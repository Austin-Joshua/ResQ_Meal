package com.resqmeal.service;

import com.resqmeal.common.AppConstants;
import com.resqmeal.config.MatchingWeightsConfig;
import com.resqmeal.util.GeoUtils;
import com.resqmeal.dto.response.PageEnvelope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MatchingService {

  private static final List<String> PREFERRED_FOOD_TYPES = List.of("meals", "vegetables", "baked");

  private final JdbcTemplate jdbc;
  private final NotificationService notificationService;
  private final RealtimeEmitter realtimeEmitter;
  private final MatchingWeightsConfig weights;

  @Value("${app.upload-dir:uploads}")
  private String uploadDir;

  public MatchingService(
      JdbcTemplate jdbc,
      NotificationService notificationService,
      RealtimeEmitter realtimeEmitter,
      MatchingWeightsConfig weights) {
    this.jdbc = jdbc;
    this.notificationService = notificationService;
    this.realtimeEmitter = realtimeEmitter;
    this.weights = weights;
  }

  public double scoreDistanceComponent(double distanceKm) {
    double normalized =
        distanceKm <= 2 ? 1.0 : distanceKm <= 5 ? 0.75 : distanceKm <= 10 ? 0.5 : 0.25;
    return normalized * weights.getDistanceWeight();
  }

  public double scoreFreshnessComponent(int minutesToExpiry) {
    double hours = minutesToExpiry / 60.0;
    double normalized;
    if (hours <= 1) {
      normalized = 1.0;
    } else if (hours <= 6) {
      normalized = 1.0 - ((hours - 1) / 5.0) * 0.8;
    } else {
      normalized = Math.max(0, 0.2 - (hours - 6) * 0.02);
    }
    return normalized * weights.getFreshnessWeight();
  }

  public double scoreCapacityComponent(int dailyCapacity, int usedCapacity) {
    if (dailyCapacity <= 0) {
      return 0;
    }
    double remaining = Math.max(0, dailyCapacity - usedCapacity);
    if (remaining == 0) {
      return 0;
    }
    return (remaining / dailyCapacity) * weights.getCapacityWeight();
  }

  public double scoreFoodTypeComponent(String foodType) {
    if (foodType != null && PREFERRED_FOOD_TYPES.contains(foodType)) {
      return weights.getFoodTypeWeight();
    }
    return 0;
  }

  public double calculateWeightedScore(
      double distanceKm, int minutesToExpiry, int dailyCapacity, int usedCapacity, String foodType) {
    return Math.min(
        1.0,
        scoreDistanceComponent(distanceKm)
            + scoreFreshnessComponent(minutesToExpiry)
            + scoreCapacityComponent(dailyCapacity, usedCapacity)
            + scoreFoodTypeComponent(foodType));
  }

  public double applyDemandBoost(double score, int recentAccepted) {
    double boost = 1.0;
    if (recentAccepted >= 10) {
      boost = 1.25;
    } else if (recentAccepted >= 5) {
      boost = 1.15;
    }
    return Math.min(1.0, score * boost);
  }

  public static double calculateMatchScore(double distanceKm, double capacityPercent, String foodType) {
    MatchingWeightsConfig defaults = new MatchingWeightsConfig();
    MatchingService svc =
        new MatchingService(null, null, null, defaults);
    int daily = 100;
    int used = (int) Math.round(daily - (capacityPercent / 100.0) * daily);
    return svc.calculateWeightedScore(distanceKm, 60, daily, used, foodType);
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
            "SELECT * FROM food_posts WHERE id = ? AND deleted_at IS NULL",
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
              fp.put("expiry_time", rs.getTimestamp("expiry_time"));
              return fp;
            },
            foodPostId);
    if (food == null) {
      throw new IllegalStateException("Food post not found");
    }
    if (!AppConstants.FOOD_STATUS_POSTED.equals(food.get("status"))) {
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
    String foodType = (String) food.get("food_type");
    int minutesToExpiry = minutesUntilExpiry((java.sql.Timestamp) food.get("expiry_time"));
    double matchScore = calculateWeightedScore(distanceKm, minutesToExpiry, daily, used, foodType);

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
            JOIN food_posts fp ON m.food_post_id = fp.id AND fp.deleted_at IS NULL
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
    if (!List.of(
            AppConstants.MATCH_ACCEPTED, AppConstants.MATCH_PICKED_UP, AppConstants.MATCH_DELIVERED)
        .contains(status)) {
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
    List<String> progression =
        List.of(
            AppConstants.MATCH_MATCHED,
            AppConstants.MATCH_ACCEPTED,
            AppConstants.MATCH_PICKED_UP,
            AppConstants.MATCH_DELIVERED);
    int cur = progression.indexOf(current);
    int nxt = progression.indexOf(status);
    if (nxt <= cur) {
      throw new IllegalStateException("Invalid status transition");
    }
    if (AppConstants.MATCH_PICKED_UP.equals(status) && volunteerId == null) {
      throw new IllegalArgumentException("volunteer_id required for PICKED_UP");
    }
    long foodPostId = ((Number) match.get("food_post_id")).longValue();
    if (AppConstants.MATCH_ACCEPTED.equals(status)) {
      jdbc.update(
          "UPDATE matches SET status = ?, accepted_at = NOW(), updated_at = NOW() WHERE id = ?",
          status,
          matchId);
    } else if (AppConstants.MATCH_PICKED_UP.equals(status)) {
      jdbc.update(
          "UPDATE matches SET status = ?, picked_up_at = NOW(), volunteer_id = ?, updated_at = NOW() WHERE id = ?",
          status,
          volunteerId,
          matchId);
    } else if (AppConstants.MATCH_DELIVERED.equals(status)) {
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
    if (AppConstants.MATCH_ACCEPTED.equals(status)) {
      title = "Match accepted";
      message = "An NGO accepted the match. Food can be picked up.";
    } else if (AppConstants.MATCH_PICKED_UP.equals(status)) {
      title = "Food picked up";
      message = "Volunteer has picked up the food.";
    } else if (AppConstants.MATCH_DELIVERED.equals(status)) {
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
            WHERE fp.id = ? AND fp.status = 'POSTED' AND fp.deleted_at IS NULL
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
              m.put("expiry_time", rs.getTimestamp("expiry_time"));
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

    int minutesToExpiry = minutesUntilExpiry((java.sql.Timestamp) post.get("expiry_time"));

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
      int usedCap = dailyCap - available;
      int recentAccepted = demandByNgo.getOrDefault(((Number) ngo.get("id")).longValue(), 0);
      double baseScore =
          calculateWeightedScore(distanceKm, minutesToExpiry, dailyCap, usedCap, foodType);
      double overallScore = applyDemandBoost(baseScore, recentAccepted);
      double demandBoost = recentAccepted >= 10 ? 1.25 : recentAccepted >= 5 ? 1.15 : 1.0;
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

  public Map<String, Object> listMatchesPaginated(long userId, String role, String status, int page, int size) {
    int lim = Math.min(Math.max(size, 1), 100);
    int off = Math.max(page, 0) * lim;
    String normalizedRole = role != null ? role.toLowerCase() : "";

    if ("ngo".equals(normalizedRole)) {
      long ngoId =
          UserIds.ngoId(jdbc, userId).orElseThrow(() -> new IllegalStateException("NGO profile not found"));
      StringBuilder q = new StringBuilder("SELECT * FROM matches WHERE ngo_id = ?");
      List<Object> p = new ArrayList<>();
      p.add(ngoId);
      if (status != null && !status.isBlank()) {
        q.append(" AND status = ?");
        p.add(status);
      }
      String countSql = q.toString().replace("SELECT *", "SELECT COUNT(*)");
      Integer total = jdbc.queryForObject(countSql, Integer.class, p.toArray());
      q.append(" ORDER BY matched_at DESC LIMIT ? OFFSET ?");
      p.add(lim);
      p.add(off);
      List<Map<String, Object>> rows =
          jdbc.query(q.toString(), (rs, rowNum) -> formatMatch(rs), p.toArray());
      return PageEnvelope.of(rows, page, lim, total != null ? total : 0);
    }

    if ("restaurant".equals(normalizedRole)) {
      long restaurantId =
          UserIds.restaurantId(jdbc, userId)
              .orElseThrow(() -> new IllegalStateException("Restaurant profile not found"));
      StringBuilder q =
          new StringBuilder(
              """
              SELECT m.* FROM matches m
              JOIN food_posts fp ON m.food_post_id = fp.id AND fp.deleted_at IS NULL
              WHERE fp.restaurant_id = ?
              """);
      List<Object> p = new ArrayList<>();
      p.add(restaurantId);
      if (status != null && !status.isBlank()) {
        q.append(" AND m.status = ?");
        p.add(status);
      }
      String countSql = q.toString().replace("SELECT m.*", "SELECT COUNT(*)");
      Integer total = jdbc.queryForObject(countSql, Integer.class, p.toArray());
      q.append(" ORDER BY m.matched_at DESC LIMIT ? OFFSET ?");
      p.add(lim);
      p.add(off);
      List<Map<String, Object>> rows =
          jdbc.query(q.toString(), (rs, rowNum) -> formatMatch(rs), p.toArray());
      return PageEnvelope.of(rows, page, lim, total != null ? total : 0);
    }

    throw new IllegalStateException("Matches listing requires NGO or restaurant role");
  }

  private static int minutesUntilExpiry(java.sql.Timestamp expiryTime) {
    if (expiryTime == null) {
      return 60;
    }
    long diffMs = expiryTime.getTime() - System.currentTimeMillis();
    return (int) Math.max(0, diffMs / 60_000L);
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

  private String savePickupPhoto(long matchId, byte[] bytes, String originalFilename) throws Exception {
    Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(dir);
    String ext = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
    String filename = "pickup_match_" + matchId + "_" + UUID.randomUUID() + ext;
    Files.write(dir.resolve(filename), bytes);
    return filename;
  }

  @Transactional
  public Map<String, Object> completeMatch(
      long userId, long matchId, byte[] photoBytes, String originalFilename, Long volunteerId)
      throws Exception {
    Map<String, Object> match = getMatch(matchId);
    if (match == null) {
      throw new IllegalStateException("Match not found");
    }
    String status = (String) match.get("status");
    if (!List.of("ACCEPTED", "PICKED_UP").contains(status)) {
      throw new IllegalStateException("Match cannot be completed from status: " + status);
    }
    if (photoBytes == null || photoBytes.length == 0) {
      throw new IllegalArgumentException("Pickup photo is required");
    }
    String photoFilename = savePickupPhoto(matchId, photoBytes, originalFilename);

    if (AppConstants.MATCH_ACCEPTED.equals(status)) {
      long vid = volunteerId != null ? volunteerId : resolveVolunteerId(userId, match);
      return updateMatchStatus(matchId, AppConstants.MATCH_PICKED_UP, vid, photoFilename);
    }
    return updateMatchStatus(matchId, AppConstants.MATCH_DELIVERED, volunteerId, photoFilename);
  }

  private long resolveVolunteerId(long userId, Map<String, Object> match) {
    Object existing = match.get("volunteer_id");
    if (existing != null) {
      return ((Number) existing).longValue();
    }
    Long volunteerId =
        jdbc.query(
            "SELECT id FROM volunteers WHERE user_id = ? LIMIT 1",
            rs -> rs.next() ? rs.getLong("id") : null,
            userId);
    if (volunteerId == null) {
      throw new IllegalArgumentException("volunteer_id required for pickup completion");
    }
    return volunteerId;
  }
}

