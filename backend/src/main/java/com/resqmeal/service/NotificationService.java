package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationService {

  private final JdbcTemplate jdbc;
  private final RealtimeEmitter realtimeEmitter;

  public NotificationService(JdbcTemplate jdbc, RealtimeEmitter realtimeEmitter) {
    this.jdbc = jdbc;
    this.realtimeEmitter = realtimeEmitter;
  }

  public void addNotification(
      long userId, String type, String title, String message, String link, Long refId) {
    try {
      jdbc.update(
          "INSERT INTO notifications (user_id, type, title, message, link, ref_id) VALUES (?,?,?,?,?,?)",
          userId,
          type,
          title,
          message,
          link,
          refId);
    } catch (Exception e) {
      // Table may be missing in some environments
    }
    Map<String, Object> payload =
        Map.of(
            "type",
            type,
            "title",
            title,
            "message",
            message != null ? message : "",
            "link",
            link != null ? link : "",
            "ref_id",
            refId != null ? refId : 0,
            "created_at",
            java.time.Instant.now().toString());
    realtimeEmitter.emitToUser(userId, "notification", payload);
  }
}
