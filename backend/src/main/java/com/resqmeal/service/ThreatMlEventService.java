package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ThreatMlEventService {

  private final JdbcTemplate jdbc;

  public ThreatMlEventService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public void insert(
      String userId,
      String ip,
      String method,
      String path,
      String label,
      double confidence,
      String attackFamiliesJson,
      String details) {
    jdbc.update(
        """
        INSERT INTO traffic_threat_ml_events
        (user_id, ip_address, http_method, path, label, confidence, attack_families, details)
        VALUES (?,?,?,?,?,?,?,?)
        """,
        userId,
        ip != null ? ip : "",
        method,
        truncate(path, 512),
        label,
        confidence,
        truncate(attackFamiliesJson, 512),
        truncate(details, 1024));
  }

  public List<Map<String, Object>> listRecent(int limit) {
    int lim = Math.min(Math.max(limit, 1), 500);
    try {
      return jdbc.queryForList(
          "SELECT id, user_id, ip_address, http_method, path, label, confidence, attack_families, details, created_at "
              + "FROM traffic_threat_ml_events ORDER BY created_at DESC LIMIT "
              + lim);
    } catch (Exception e) {
      return List.of();
    }
  }

  private static String truncate(String s, int max) {
    if (s == null) {
      return null;
    }
    return s.length() <= max ? s : s.substring(0, max);
  }

  public boolean isMlTablePresent() {
    try {
      jdbc.queryForObject(
          "SELECT COUNT(*) FROM traffic_threat_ml_events WHERE 1=0", Integer.class);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
