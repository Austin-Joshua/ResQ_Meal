package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.DeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
  public ResponseEntity<?> volunteer(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(Map.of("data", deliveryService.volunteerDeliveries(user.id())));
  }

  @PostMapping("/complete")
  @Operation(summary = "Mark a delivery as complete with proof photo")
  public ResponseEntity<?> complete(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      String deliveryId = String.valueOf(body.get("deliveryId"));
      String proof = (String) body.get("proofPhoto");
      return ResponseEntity.ok(deliveryService.completeDelivery(user.id(), deliveryId, proof));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{deliveryId}/status")
  @Operation(summary = "Update delivery status")
  public ResponseEntity<?> status(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable String deliveryId,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    String status = (String) body.get("status");
    return ResponseEntity.ok(deliveryService.updateDeliveryStatus(deliveryId, status));
  }
}
