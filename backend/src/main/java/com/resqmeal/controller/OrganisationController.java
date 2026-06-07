package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.OrganisationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/organisation")
@Validated
@Tag(name = "Organisation", description = "Organisation food posts")
public class OrganisationController {

  private final OrganisationService organisationService;

  public OrganisationController(OrganisationService organisationService) {
    this.organisationService = organisationService;
  }

  @PostMapping("/food")
  @Operation(summary = "Create an organisation food post")
  public ResponseEntity<?> post(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(organisationService.postFood(user.id(), user.role(), body));
    } catch (IllegalStateException | IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @GetMapping("/food")
  @Operation(summary = "List food posts for the authenticated organisation")
  public ResponseEntity<?> mine(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(organisationService.getMyOrganisationFood(user.id(), user.role()));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @GetMapping("/food/available")
  @Operation(summary = "List available organisation food posts")
  public ResponseEntity<?> available(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(organisationService.getAvailableOrganisationFood());
  }
}
