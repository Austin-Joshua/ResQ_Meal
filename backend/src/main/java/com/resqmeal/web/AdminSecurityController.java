package com.resqmeal.web;

import com.resqmeal.service.BlockedEntityRegistry;
import com.resqmeal.service.SecurityMonitoringService;
import com.resqmeal.service.ThreatMlEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminSecurityController {

  private final SecurityMonitoringService securityMonitoringService;
  private final ThreatMlEventService threatMlEventService;
  private final BlockedEntityRegistry blockedEntityRegistry;

  public AdminSecurityController(
      SecurityMonitoringService securityMonitoringService,
      ThreatMlEventService threatMlEventService,
      BlockedEntityRegistry blockedEntityRegistry) {
    this.securityMonitoringService = securityMonitoringService;
    this.threatMlEventService = threatMlEventService;
    this.blockedEntityRegistry = blockedEntityRegistry;
  }

  @GetMapping("/logs")
  public ResponseEntity<Map<String, Object>> logs(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = securityMonitoringService.listLogs(limit, false);
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  @GetMapping("/critical-logs")
  public ResponseEntity<Map<String, Object>> criticalLogs(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = securityMonitoringService.listLogs(limit, true);
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  @GetMapping("/blocked-users")
  public ResponseEntity<Map<String, Object>> blockedUsers() {
    List<Map<String, Object>> rows = securityMonitoringService.listBlocked();
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  @GetMapping("/threat-ml-events")
  public ResponseEntity<Map<String, Object>> threatMlEvents(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = threatMlEventService.listRecent(limit);
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  /** Block an IP immediately (persists to {@code blocked_entities}; enforced by {@code IpBlockFilter}). */
  @PostMapping("/block-ip")
  public ResponseEntity<Map<String, Object>> blockIp(@RequestBody Map<String, String> body) {
    if (body == null) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "success",
                  false,
                  "error",
                  "invalid_body",
                  "message",
                  "Send JSON: {\"ip\":\"1.2.3.4\",\"reason\":\"optional\"}"));
    }
    String ip = body.get("ip");
    if (ip == null || ip.isBlank()) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "success",
                  false,
                  "error",
                  "ip_required",
                  "message",
                  "Field \"ip\" is required."));
    }
    String reason = body.get("reason");
    if (reason == null || reason.isBlank()) {
      reason = "Manual IP block (security admin UI)";
    }
    blockedEntityRegistry.blockIp(ip.trim(), reason.trim());
    return ResponseEntity.ok(
        Map.of("success", true, "message", "IP blocked.", "ip", ip.trim(), "reason", reason.trim()));
  }

  /** Block a user id immediately (JWT layer should reject subsequent requests for that user). */
  @PostMapping("/block-user")
  public ResponseEntity<Map<String, Object>> blockUser(@RequestBody Map<String, Object> body) {
    if (body == null || body.get("userId") == null) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "success",
                  false,
                  "error",
                  "user_id_required",
                  "message",
                  "Send JSON: {\"userId\":123,\"reason\":\"optional\"}"));
    }
    long userId;
    try {
      userId = Long.parseLong(String.valueOf(body.get("userId")).trim());
    } catch (NumberFormatException e) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "success",
                  false,
                  "error",
                  "invalid_user_id",
                  "message",
                  "userId must be a positive integer."));
    }
    if (userId <= 0) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "success",
                  false,
                  "error",
                  "invalid_user_id",
                  "message",
                  "userId must be positive."));
    }
    String reason =
        body.get("reason") != null && !String.valueOf(body.get("reason")).isBlank()
            ? String.valueOf(body.get("reason")).trim()
            : "Manual user block (security admin UI)";
    blockedEntityRegistry.blockUser(userId, reason);
    return ResponseEntity.ok(
        Map.of("success", true, "message", "User blocked.", "userId", userId, "reason", reason));
  }
}
