package com.resqmeal.web;

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

  public AdminSecurityController(
      SecurityMonitoringService securityMonitoringService,
      ThreatMlEventService threatMlEventService) {
    this.securityMonitoringService = securityMonitoringService;
    this.threatMlEventService = threatMlEventService;
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
}
