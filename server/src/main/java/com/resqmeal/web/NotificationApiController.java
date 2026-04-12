package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationApiController {

  private final JdbcTemplate jdbc;

  public NotificationApiController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping
  public ResponseEntity<?> list(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String unread_only,
      @RequestParam(defaultValue = "50") int limit) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      int lim = Math.min(Math.max(limit, 1), 100);
      StringBuilder q =
          new StringBuilder(
              "SELECT id, type, title, message, link, ref_id, read_at, created_at FROM notifications WHERE user_id = ?");
      if ("true".equalsIgnoreCase(unread_only)) {
        q.append(" AND read_at IS NULL");
      }
      q.append(" ORDER BY created_at DESC LIMIT ?");
      List<Map<String, Object>> rows =
          jdbc.queryForList(q.toString(), user.id(), lim);
      Number unread =
          jdbc.queryForObject(
              "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL",
              Number.class,
              user.id());
      return ResponseEntity.ok(Map.of("data", rows, "unreadCount", unread != null ? unread.intValue() : 0));
    } catch (Exception e) {
      return ResponseEntity.ok(Map.of("data", List.of(), "unreadCount", 0));
    }
  }

  @PatchMapping("/{id:[0-9]+}/read")
  public ResponseEntity<?> read(@AuthenticationPrincipal AuthPrincipal user, @PathVariable long id) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      int n = jdbc.update("UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?", id, user.id());
      if (n == 0) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Notification not found"));
      }
      return ResponseEntity.ok(Map.of("success", true));
    } catch (Exception e) {
      return ResponseEntity.ok(Map.of("success", true));
    }
  }

  @PostMapping("/read-all")
  public ResponseEntity<?> readAll(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      jdbc.update("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL", user.id());
    } catch (Exception ignored) {
    }
    return ResponseEntity.ok(Map.of("success", true));
  }
}
