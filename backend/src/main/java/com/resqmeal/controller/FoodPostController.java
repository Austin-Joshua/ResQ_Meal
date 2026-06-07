package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.FoodService;
import com.resqmeal.dto.request.FoodPostRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/food-posts")
@Validated
@Tag(name = "Food Posts", description = "Paginated food post listings and creation")
public class FoodPostController {

  private final FoodService foodService;

  public FoodPostController(FoodService foodService) {
    this.foodService = foodService;
  }

  @GetMapping
  @Operation(summary = "List food posts with pagination")
  public ResponseEntity<?> list(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(name = "food_type", required = false) String foodType,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "createdAt,desc") String sort) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(foodService.listFoodPosts(status, foodType, page, size, sort));
  }

  @PostMapping
  @Operation(summary = "Create a food post")
  public ResponseEntity<?> create(
      @AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody FoodPostRequest request) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(foodService.postFood(user.id(), toBodyMap(request)));
  }

  @DeleteMapping("/{id:[0-9]+}")
  @Operation(summary = "Soft-delete a food post")
  public ResponseEntity<?> delete(@AuthenticationPrincipal AuthPrincipal user, @PathVariable long id) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      foodService.deleteFood(user.id(), id);
      return ResponseEntity.ok(Map.of("message", "Food post deleted successfully"));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }
  }

  private static Map<String, Object> toBodyMap(FoodPostRequest request) {
    Map<String, Object> body = new HashMap<>();
    body.put("food_name", request.getTitle());
    body.put("quantity_servings", request.getQuantity());
    body.put("food_type", request.getFoodType());
    body.put("address", request.getAddress());
    body.put("description", request.getDescription());
    body.put("latitude", request.getLatitude());
    body.put("longitude", request.getLongitude());
    body.put("safety_window_minutes", request.getSafetyWindowMinutes());
    body.put("min_storage_temp_celsius", request.getMinStorageTempCelsius());
    body.put("max_storage_temp_celsius", request.getMaxStorageTempCelsius());
    body.put("availability_time_hours", request.getAvailabilityTimeHours());
    body.put("photo_url", request.getPhotoUrl());
    if (request.getExpiryTime() != null) {
      body.put("expiry_time", request.getExpiryTime());
    }
    return body;
  }
}
