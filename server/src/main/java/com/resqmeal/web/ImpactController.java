package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.ImpactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

  private final ImpactService impactService;

  public ImpactController(ImpactService impactService) {
    this.impactService = impactService;
  }

  @GetMapping("/ngo")
  public ResponseEntity<?> ngo(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam(defaultValue = "all") String period) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(impactService.ngoImpact(user.id(), period));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/restaurant")
  public ResponseEntity<?> restaurant(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam(defaultValue = "all") String period) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(impactService.restaurantImpact(user.id(), period));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/global")
  public Map<String, Object> global() {
    return impactService.globalImpact();
  }

  @GetMapping("/timeline")
  public Map<String, Object> timeline(@RequestParam(defaultValue = "7") int days) {
    return impactService.timeline(days);
  }
}
