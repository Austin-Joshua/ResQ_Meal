package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.OrganisationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
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
  public ResponseEntity<ApiResponse<Map<String, Object>>> post(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.createdEntity(organisationService.postFood(user.id(), user.role(), body));
  }

  @GetMapping("/food")
  @Operation(summary = "List food posts for the authenticated organisation")
  public ResponseEntity<ApiResponse<Map<String, Object>>> mine(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(organisationService.getMyOrganisationFood(user.id(), user.role()));
  }

  @GetMapping("/food/available")
  @Operation(summary = "List available organisation food posts")
  public ResponseEntity<ApiResponse<Map<String, Object>>> available(
      @AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(organisationService.getAvailableOrganisationFood());
  }
}
