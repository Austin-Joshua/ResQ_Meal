package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.FoodQualityService;
import com.resqmeal.service.FoodService;
import com.resqmeal.dto.request.FoodPostRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/food")
@Validated
@Tag(name = "Food", description = "Food quality assessment and posting")
public class FoodController {

  private final FoodService foodService;
  private final FoodQualityService foodQualityService;

  public FoodController(FoodService foodService, FoodQualityService foodQualityService) {
    this.foodService = foodService;
    this.foodQualityService = foodQualityService;
  }

  @PostMapping("/assess-freshness")
  @Operation(summary = "Assess food freshness from an uploaded image")
  public ResponseEntity<?> assessFreshness(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam("image") MultipartFile image) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(foodQualityService.assessFreshness(image));
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(Map.of("error", "Failed to assess food freshness"));
    }
  }

  @PostMapping("/assess-freshness-by-environment")
  @Operation(summary = "Assess freshness from storage environment data")
  public ResponseEntity<?> assessEnv(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(foodQualityService.assessFreshnessByEnvironment(body));
  }

  @PostMapping("/classify-image")
  @Operation(summary = "Classify food type from an uploaded image")
  public ResponseEntity<?> classify(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam("image") MultipartFile image) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      Map<String, Object> res = foodQualityService.classifyImage(image);
      if (res.containsKey("error")) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(res);
      }
      return ResponseEntity.ok(res);
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "Failed to classify food image", "message", e.getMessage()));
    }
  }

  @PostMapping
  @Operation(summary = "Create a new food post")
  public ResponseEntity<?> post(
      @AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody FoodPostRequest request) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(foodService.postFood(user.id(), toBodyMap(request)));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/my-posts")
  @Operation(summary = "List food posts created by the authenticated restaurant")
  public ResponseEntity<?> myPosts(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(foodService.getMyPosts(user.id(), status, limit, offset));
  }

  @GetMapping("/available/all")
  @Operation(summary = "List available food posts for NGOs and volunteers")
  public Map<String, Object> available(
      @RequestParam(required = false) String food_type,
      @RequestParam(required = false) Integer min_urgency,
      @RequestParam(required = false) Integer max_urgency,
      @RequestParam(defaultValue = "50") int limit) {
    return foodService.getAvailableFood(food_type, min_urgency, max_urgency, limit);
  }

  @GetMapping("/{id:[0-9]+}")
  @Operation(summary = "Get a food post by ID")
  public ResponseEntity<?> one(@PathVariable long id) {
    Map<String, Object> post = foodService.getFoodPost(id);
    if (post == null || post.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(post);
  }

  @PutMapping("/{id:[0-9]+}")
  @Operation(summary = "Update a food post")
  public ResponseEntity<?> update(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(foodService.updateFood(user.id(), id, body));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }
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

