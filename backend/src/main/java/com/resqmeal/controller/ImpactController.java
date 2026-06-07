package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.ImpactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
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
  public ResponseEntity<ApiResponse<Map<String, Object>>> ngo(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam(defaultValue = "all") String period) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(impactService.ngoImpact(user.id(), period));
  }

  @GetMapping("/restaurant")
  @Operation(summary = "Get restaurant impact metrics for a time period")
  public ResponseEntity<ApiResponse<Map<String, Object>>> restaurant(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam(defaultValue = "all") String period) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(impactService.restaurantImpact(user.id(), period));
  }

  @GetMapping("/global")
  @Operation(summary = "Get platform-wide impact totals")
  public ApiResponse<Map<String, Object>> global() {
    return ApiResponse.ok(impactService.globalImpact());
  }

  @GetMapping("/timeline")
  @Operation(summary = "Get daily impact timeline for recent days")
  public ApiResponse<Map<String, Object>> timeline(@RequestParam(defaultValue = "7") int days) {
    return ApiResponse.ok(impactService.timeline(days));
  }
}
