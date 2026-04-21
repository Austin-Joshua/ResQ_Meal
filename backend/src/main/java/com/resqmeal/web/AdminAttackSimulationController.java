package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.AttackSimulationService;
import com.resqmeal.service.SecurityMonitoringService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/attack-sim")
public class AdminAttackSimulationController {

  private final AttackSimulationService attackSimulationService;

  public AdminAttackSimulationController(AttackSimulationService attackSimulationService) {
    this.attackSimulationService = attackSimulationService;
  }

  @GetMapping("/state")
  public ResponseEntity<Map<String, Object>> state() {
    return ResponseEntity.ok(
        Map.of("success", true, "security_mode_on", attackSimulationService.isSecurityModeOn()));
  }

  @PostMapping("/security-mode")
  public ResponseEntity<Map<String, Object>> setSecurityMode(
      @RequestParam boolean enabled, @AuthenticationPrincipal AuthPrincipal user) {
    Map<String, Object> data =
        attackSimulationService.setSecurityMode(enabled, actor(user, "api_admin_toggle"));
    return ResponseEntity.ok(data);
  }

  @PostMapping("/attack/{type}")
  public ResponseEntity<Map<String, Object>> executeAttack(
      @PathVariable String type,
      @AuthenticationPrincipal AuthPrincipal user,
      HttpServletRequest request) {
    String ip = SecurityMonitoringService.clientIp(request);
    return ResponseEntity.ok(
        attackSimulationService.executeAttack(type, actor(user, "api_admin"), ip, null));
  }

  @PostMapping("/recover")
  public ResponseEntity<Map<String, Object>> recover(@AuthenticationPrincipal AuthPrincipal user) {
    return ResponseEntity.ok(attackSimulationService.recoverFromBackup(actor(user, "api_admin")));
  }

  @PostMapping("/sync-backup")
  public ResponseEntity<Map<String, Object>> syncBackup() {
    return ResponseEntity.ok(attackSimulationService.synchronizeBackup());
  }

  @GetMapping("/logs")
  public ResponseEntity<Map<String, Object>> logs(@RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = attackSimulationService.listSimulationLogs(limit);
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  @GetMapping("/data")
  public ResponseEntity<Map<String, Object>> data(@RequestParam(defaultValue = "100") int limit) {
    List<Map<String, Object>> rows = attackSimulationService.listMainData(limit);
    return ResponseEntity.ok(Map.of("success", true, "data", rows));
  }

  private static String actor(AuthPrincipal user, String fallback) {
    if (user == null) {
      return fallback;
    }
    return "user:" + user.id() + ":" + user.role();
  }
}
