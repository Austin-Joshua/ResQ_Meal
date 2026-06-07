package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.service.BlockedEntityRegistry;
import com.resqmeal.service.SecurityMonitoringService;
import com.resqmeal.service.ThreatMlEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Validated
@Tag(name = "Admin Security", description = "Security monitoring admin APIs")
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
  @Operation(summary = "List security monitoring logs")
  public ResponseEntity<ApiResponse<Map<String, Object>>> logs(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = securityMonitoringService.listLogs(limit, false);
    return ApiResponse.okEntity(Map.of("data", rows));
  }

  @GetMapping("/critical-logs")
  @Operation(summary = "List critical security monitoring logs")
  public ResponseEntity<ApiResponse<Map<String, Object>>> criticalLogs(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = securityMonitoringService.listLogs(limit, true);
    return ApiResponse.okEntity(Map.of("data", rows));
  }

  @GetMapping("/blocked-users")
  @Operation(summary = "List blocked users and IPs")
  public ResponseEntity<ApiResponse<Map<String, Object>>> blockedUsers() {
    List<Map<String, Object>> rows = securityMonitoringService.listBlocked();
    return ApiResponse.okEntity(Map.of("data", rows));
  }

  @GetMapping("/threat-ml-events")
  @Operation(summary = "List recent ML-detected threat events")
  public ResponseEntity<ApiResponse<Map<String, Object>>> threatMlEvents(
      @RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = threatMlEventService.listRecent(limit);
    return ApiResponse.okEntity(Map.of("data", rows));
  }

  /** Block an IP immediately (persists to {@code blocked_entities}; enforced by {@code IpBlockFilter}). */
  @PostMapping("/block-ip")
  @Operation(summary = "Block an IP address immediately")
  public ResponseEntity<ApiResponse<Map<String, Object>>> blockIp(@RequestBody Map<String, String> body) {
    if (body == null) {
      throw new IllegalArgumentException(
          "Send JSON: {\"ip\":\"1.2.3.4\",\"reason\":\"optional\"}");
    }
    String ip = body.get("ip");
    if (ip == null || ip.isBlank()) {
      throw new IllegalArgumentException("Field \"ip\" is required.");
    }
    String reason = body.get("reason");
    if (reason == null || reason.isBlank()) {
      reason = "Manual IP block (security admin UI)";
    }
    blockedEntityRegistry.blockIp(ip.trim(), reason.trim());
    return ApiResponse.okEntity(
        Map.of("message", "IP blocked.", "ip", ip.trim(), "reason", reason.trim()));
  }

  /** Block a user id immediately (JWT layer should reject subsequent requests for that user). */
  @PostMapping("/block-user")
  @Operation(summary = "Block a user account immediately")
  public ResponseEntity<ApiResponse<Map<String, Object>>> blockUser(@RequestBody Map<String, Object> body) {
    if (body == null || body.get("userId") == null) {
      throw new IllegalArgumentException("Send JSON: {\"userId\":123,\"reason\":\"optional\"}");
    }
    long userId;
    try {
      userId = Long.parseLong(String.valueOf(body.get("userId")).trim());
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("userId must be a positive integer.");
    }
    if (userId <= 0) {
      throw new IllegalArgumentException("userId must be positive.");
    }
    String reason =
        body.get("reason") != null && !String.valueOf(body.get("reason")).isBlank()
            ? String.valueOf(body.get("reason")).trim()
            : "Manual user block (security admin UI)";
    blockedEntityRegistry.blockUser(userId, reason);
    return ApiResponse.okEntity(
        Map.of("message", "User blocked.", "userId", userId, "reason", reason));
  }
}
