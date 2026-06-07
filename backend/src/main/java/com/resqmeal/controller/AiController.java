package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.AiApiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Validated
@Tag(name = "AI", description = "AI service proxies")
public class AiController {

  private final AiApiService aiApiService;

  public AiController(AiApiService aiApiService) {
    this.aiApiService = aiApiService;
  }

  @GetMapping("/demand-prediction")
  @Operation(summary = "Get AI demand prediction forecast")
  public ResponseEntity<?> demand(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(aiApiService.demandPrediction());
  }

  @PostMapping("/feedback")
  @Operation(summary = "Submit match outcome feedback for AI training")
  public ResponseEntity<?> feedback(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      long matchId = ((Number) body.get("match_id")).longValue();
      String outcome = (String) body.get("outcome");
      Integer delay =
          body.get("delay_minutes") != null ? ((Number) body.get("delay_minutes")).intValue() : null;
      String notes = (String) body.get("notes");
      return ResponseEntity.ok(aiApiService.feedback(matchId, outcome, delay, notes));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/health")
  @Operation(summary = "Check AI service health status")
  public Map<String, Object> health() {
    return aiApiService.health();
  }
}
