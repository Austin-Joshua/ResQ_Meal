package com.resqmeal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resqmeal.common.ApiResponse;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
@Tag(name = "Health", description = "Service health check")
public class HealthController {

  @GetMapping("/health")
  @Operation(summary = "Health check")
  public ApiResponse<Map<String, String>> health() {
    return ApiResponse.ok(Map.of("status", "ok", "timestamp", Instant.now().toString()));
  }
}

