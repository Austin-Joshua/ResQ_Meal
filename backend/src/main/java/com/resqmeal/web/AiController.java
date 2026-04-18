package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.AiApiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

  private final AiApiService aiApiService;

  public AiController(AiApiService aiApiService) {
    this.aiApiService = aiApiService;
  }

  @GetMapping("/demand-prediction")
  public ResponseEntity<?> demand(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(aiApiService.demandPrediction());
  }

  @PostMapping("/feedback")
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
  public Map<String, Object> health() {
    return aiApiService.health();
  }
}
