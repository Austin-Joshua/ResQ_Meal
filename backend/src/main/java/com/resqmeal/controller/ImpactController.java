package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.ImpactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/impact")
@Validated
@Tag(name = "Impact", description = "Environmental impact metrics")
public class ImpactController {

  private final ImpactService impactService;

  public ImpactController(ImpactService impactService) {
    this.impactService = impactService;
  }

  @GetMapping("/ngo")
  @Operation(summary = "Get NGO impact metrics for a time period")
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
  @Operation(summary = "Get restaurant impact metrics for a time period")
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
  @Operation(summary = "Get platform-wide impact totals")
  public Map<String, Object> global() {
    return impactService.globalImpact();
  }

  @GetMapping("/timeline")
  @Operation(summary = "Get daily impact timeline for recent days")
  public Map<String, Object> timeline(@RequestParam(defaultValue = "7") int days) {
    return impactService.timeline(days);
  }
}
