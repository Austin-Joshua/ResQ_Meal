package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class NgoService {

  private final JdbcTemplate jdbc;

  public NgoService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  private Map<String, Object> formatNgo(Map<String, Object> row) {
    int daily = ((Number) row.get("daily_capacity")).intValue();
    int used = ((Number) row.get("used_capacity")).intValue();
    int remaining = Math.max(0, daily - used);
    int util = daily > 0 ? (int) Math.round((used / (double) daily) * 100) : 0;
    Map<String, Object> m = new HashMap<>();
    m.put("id", ((Number) row.get("id")).longValue());
    m.put("user_id", ((Number) row.get("user_id")).longValue());
    m.put("organization_name", row.get("organization_name"));
    m.put("registration_number", row.get("registration_number"));
    m.put("daily_capacity", daily);
    m.put("used_capacity", used);
    m.put("remaining_capacity", remaining);
    m.put("utilization_percent", util);
    m.put("verified", row.get("verified"));
    m.put("created_at", row.get("created_at"));
    m.put("updated_at", row.get("updated_at"));
    return m;
  }

  public Map<String, Object> getNgo(long id) {
    Map<String, Object> row =
        jdbc.query(
            "SELECT * FROM ngos WHERE id = ?",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> m = new HashMap<>();
              m.put("id", rs.getLong("id"));
              m.put("user_id", rs.getLong("user_id"));
              m.put("organization_name", rs.getString("organization_name"));
              m.put("registration_number", rs.getString("registration_number"));
              m.put("daily_capacity", rs.getInt("daily_capacity"));
              m.put("used_capacity", rs.getInt("used_capacity"));
              m.put("verified", rs.getBoolean("verified"));
              m.put("created_at", rs.getTimestamp("created_at"));
              m.put("updated_at", rs.getTimestamp("updated_at"));
              return m;
            },
            id);
    if (row == null) {
      return null;
    }
    return formatNgo(row);
  }

  @Transactional
  public Map<String, Object> updateNgo(long id, Map<String, Object> body) {
    jdbc.update(
        """
        UPDATE ngos SET
          daily_capacity = COALESCE(?, daily_capacity),
          organization_name = COALESCE(?, organization_name),
          updated_at = NOW()
        WHERE id = ?
        """,
        body.get("daily_capacity"),
        body.get("organization_name"),
        id);
    return getNgo(id);
  }

  public Map<String, Object> capacity(long id) {
    Map<String, Object> row =
        jdbc.query(
            "SELECT * FROM ngos WHERE id = ?",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              int daily = rs.getInt("daily_capacity");
              int used = rs.getInt("used_capacity");
              int remaining = Math.max(0, daily - used);
              int util = daily > 0 ? (int) Math.round((used / (double) daily) * 100) : 0;
              Map<String, Object> m = new HashMap<>();
              m.put("daily_capacity", daily);
              m.put("used_capacity", used);
              m.put("remaining_capacity", remaining);
              m.put("utilization_percent", util);
              return m;
            },
            id);
    return row;
  }

  @Transactional
  public Map<String, Object> updateCapacity(long id, int quantity) {
    Map<String, Object> ngo = jdbc.queryForMap("SELECT * FROM ngos WHERE id = ?", id);
    int daily = ((Number) ngo.get("daily_capacity")).intValue();
    int used = ((Number) ngo.get("used_capacity")).intValue();
    int newUsed = Math.min(used + quantity, daily);
    jdbc.update("UPDATE ngos SET used_capacity = ?, updated_at = NOW() WHERE id = ?", newUsed, id);
    return getNgo(id);
  }
}
