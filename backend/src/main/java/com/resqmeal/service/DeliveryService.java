package com.resqmeal.service;

import com.resqmeal.common.AppConstants;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeliveryService {

  private final JdbcTemplate jdbc;
  private final MatchingService matchingService;

  public DeliveryService(JdbcTemplate jdbc, MatchingService matchingService) {
    this.jdbc = jdbc;
    this.matchingService = matchingService;
  }

  public List<Map<String, Object>> volunteerDeliveries(long userId) {
    return jdbc.query(
        """
        SELECT m.id, fp.food_name, m.status, fp.address
        FROM matches m
        JOIN volunteers v ON m.volunteer_id = v.id
        JOIN food_posts fp ON fp.id = m.food_post_id
        WHERE v.user_id = ?
        ORDER BY m.matched_at DESC
        """,
        (rs, rowNum) -> {
          Map<String, Object> m = new HashMap<>();
          m.put("id", String.valueOf(rs.getLong("id")));
          m.put("food_name", rs.getString("food_name"));
          m.put("status", rs.getString("status"));
          m.put("address", rs.getString("address"));
          return m;
        },
        userId);
  }

  public Map<String, Object> completeDelivery(long userId, String deliveryId, String proofPhoto) {
    long matchId = Long.parseLong(deliveryId);
    Long vol =
        jdbc.query(
            "SELECT v.id FROM volunteers v WHERE v.user_id = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            userId);
    if (vol == null) {
      throw new IllegalStateException("Volunteer profile not found");
    }
    Long assigned =
        jdbc.query(
            "SELECT volunteer_id FROM matches WHERE id = ?",
            rs -> rs.next() ? rs.getLong("volunteer_id") : null,
            matchId);
    if (assigned == null || assigned != vol) {
      throw new IllegalStateException("Not assigned to this delivery");
    }
    return matchingService.updateMatchStatus(matchId, AppConstants.MATCH_DELIVERED, null, proofPhoto);
  }

  public Map<String, Object> updateDeliveryStatus(String deliveryId, String status) {
    long matchId = Long.parseLong(deliveryId);
    jdbc.update("UPDATE matches SET status = ?, updated_at = NOW() WHERE id = ?", status, matchId);
    return matchingService.getMatch(matchId);
  }
}
