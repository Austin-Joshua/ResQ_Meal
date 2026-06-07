package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.AiApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
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
  public ResponseEntity<ApiResponse<Map<String, Object>>> demand(
      @AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(aiApiService.demandPrediction());
  }

  @PostMapping("/feedback")
  @Operation(summary = "Submit match outcome feedback for AI training")
  public ResponseEntity<ApiResponse<Map<String, Object>>> feedback(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    long matchId = ((Number) body.get("match_id")).longValue();
    String outcome = (String) body.get("outcome");
    Integer delay =
        body.get("delay_minutes") != null ? ((Number) body.get("delay_minutes")).intValue() : null;
    String notes = (String) body.get("notes");
    return ApiResponse.okEntity(aiApiService.feedback(matchId, outcome, delay, notes));
  }

  @GetMapping("/health")
  @Operation(summary = "Check AI service health status")
  public ApiResponse<Map<String, Object>> health() {
    return ApiResponse.ok(aiApiService.health());
  }
}
