package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@Validated
@Tag(name = "Delivery", description = "Delivery tracking")
public class DeliveryController {

  private final DeliveryService deliveryService;

  public DeliveryController(DeliveryService deliveryService) {
    this.deliveryService = deliveryService;
  }

  @GetMapping("/volunteer")
  @Operation(summary = "List deliveries assigned to the authenticated volunteer")
  public ResponseEntity<ApiResponse<Map<String, Object>>> volunteer(
      @AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(Map.of("data", deliveryService.volunteerDeliveries(user.id())));
  }

  @PostMapping("/complete")
  @Operation(summary = "Mark a delivery as complete with proof photo")
  public ResponseEntity<ApiResponse<Map<String, Object>>> complete(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    String deliveryId = String.valueOf(body.get("deliveryId"));
    String proof = (String) body.get("proofPhoto");
    return ApiResponse.okEntity(deliveryService.completeDelivery(user.id(), deliveryId, proof));
  }

  @PutMapping("/{deliveryId}/status")
  @Operation(summary = "Update delivery status")
  public ResponseEntity<ApiResponse<Map<String, Object>>> status(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable String deliveryId,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    String status = (String) body.get("status");
    return ApiResponse.okEntity(deliveryService.updateDeliveryStatus(deliveryId, status));
  }
}
