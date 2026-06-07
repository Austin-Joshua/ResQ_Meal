package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.dto.response.PageEnvelope;
import com.resqmeal.exception.ResourceNotFoundException;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Validated
@Tag(name = "Notifications", description = "In-app notification inbox")
public class NotificationApiController {

  private final JdbcTemplate jdbc;

  public NotificationApiController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping
  @Operation(summary = "List notifications with pagination")
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String unread_only,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int size) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    try {
      int lim = Math.min(Math.max(size, 1), 100);
      int off = Math.max(page, 0) * lim;
      StringBuilder q =
          new StringBuilder(
              "SELECT id, type, title, message, link, ref_id, read_at, created_at FROM notifications WHERE user_id = ?");
      if ("true".equalsIgnoreCase(unread_only)) {
        q.append(" AND read_at IS NULL");
      }
      String countSql =
          q.toString()
              .replace(
                  "SELECT id, type, title, message, link, ref_id, read_at, created_at",
                  "SELECT COUNT(*)");
      Integer total = jdbc.queryForObject(countSql, Integer.class, user.id());
      q.append(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
      List<Map<String, Object>> rows = jdbc.queryForList(q.toString(), user.id(), lim, off);
      Number unread =
          jdbc.queryForObject(
              "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL",
              Number.class,
              user.id());
      Map<String, Object> body = new HashMap<>(PageEnvelope.of(rows, page, lim, total != null ? total : 0));
      body.put("unreadCount", unread != null ? unread.intValue() : 0);
      return ApiResponse.okEntity(body);
    } catch (Exception e) {
      Map<String, Object> empty = new HashMap<>(PageEnvelope.of(List.of(), page, size, 0));
      empty.put("unreadCount", 0);
      return ApiResponse.okEntity(empty);
    }
  }

  @PatchMapping("/{id:[0-9]+}/read")
  @Operation(summary = "Mark a notification as read")
  public ResponseEntity<ApiResponse<Map<String, Boolean>>> read(
      @AuthenticationPrincipal AuthPrincipal user, @PathVariable long id) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    try {
      int n = jdbc.update("UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?", id, user.id());
      if (n == 0) {
        throw new ResourceNotFoundException("Notification not found");
      }
      return ApiResponse.okEntity(Map.of("success", true));
    } catch (ResourceNotFoundException e) {
      throw e;
    } catch (Exception e) {
      return ApiResponse.okEntity(Map.of("success", true));
    }
  }

  @PostMapping("/read-all")
  @Operation(summary = "Mark all notifications as read")
  public ResponseEntity<ApiResponse<Map<String, Boolean>>> readAll(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    try {
      jdbc.update("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL", user.id());
    } catch (Exception ignored) {
    }
    return ApiResponse.okEntity(Map.of("success", true));
  }
}
