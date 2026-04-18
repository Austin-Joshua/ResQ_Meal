package com.resqmeal.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class BlockedEntityRegistry {

  private static final Logger log = LoggerFactory.getLogger(BlockedEntityRegistry.class);

  private final JdbcTemplate jdbc;

  private final Set<String> blockedIps = ConcurrentHashMap.newKeySet();
  private final Set<Long> blockedUserIds = ConcurrentHashMap.newKeySet();

  public BlockedEntityRegistry(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostConstruct
  public void loadFromDatabase() {
    try {
      for (Map<String, Object> row :
          jdbc.queryForList("SELECT user_id, ip_address FROM blocked_entities")) {
        Object uid = row.get("user_id");
        if (uid != null) {
          try {
            blockedUserIds.add(Long.parseLong(uid.toString().trim()));
          } catch (NumberFormatException ignored) {
          }
        }
        Object ip = row.get("ip_address");
        if (ip != null && !ip.toString().isBlank()) {
          blockedIps.add(ip.toString().trim());
        }
      }
    } catch (DataAccessException e) {
      log.warn(
          "Could not load blocked_entities (MySQL down or wrong DB_PASSWORD in backend/.env). "
              + "IP/user blocks start empty until DB is available: {}",
          e.getMostSpecificCause().getMessage());
    }
  }

  public boolean isIpBlocked(String ip) {
    return ip != null && blockedIps.contains(ip.trim());
  }

  public boolean isUserBlocked(long userId) {
    return blockedUserIds.contains(userId);
  }

  public void blockIp(String ip, String reason) {
    if (ip == null || ip.isBlank()) {
      return;
    }
    String trimmed = ip.trim();
    if (blockedIps.add(trimmed)) {
      jdbc.update(
          "INSERT INTO blocked_entities (user_id, ip_address, reason) VALUES (NULL, ?, ?)",
          trimmed,
          reason);
    }
  }

  public void blockUser(long userId, String reason) {
    if (blockedUserIds.add(userId)) {
      jdbc.update(
          "INSERT INTO blocked_entities (user_id, ip_address, reason) VALUES (?, NULL, ?)",
          String.valueOf(userId),
          reason);
    }
  }

  public void unblockIp(String ip) {
    if (ip == null) {
      return;
    }
    String t = ip.trim();
    blockedIps.remove(t);
    jdbc.update("DELETE FROM blocked_entities WHERE ip_address = ?", t);
  }

  public void unblockUser(long userId) {
    blockedUserIds.remove(userId);
    jdbc.update("DELETE FROM blocked_entities WHERE user_id = ?", String.valueOf(userId));
  }
}
