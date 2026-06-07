package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.dto.request.FoodPostRequest;
import com.resqmeal.exception.ResourceNotFoundException;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.FoodQualityService;
import com.resqmeal.service.FoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
  public ResponseEntity<ApiResponse<Map<String, Object>>> assessFreshness(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam("image") MultipartFile image) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    try {
      return ApiResponse.okEntity(foodQualityService.assessFreshness(image));
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Failed to assess food freshness");
    }
  }

  @PostMapping("/assess-freshness-by-environment")
  @Operation(summary = "Assess freshness from storage environment data")
  public ResponseEntity<ApiResponse<Map<String, Object>>> assessEnv(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(foodQualityService.assessFreshnessByEnvironment(body));
  }

  @PostMapping("/classify-image")
  @Operation(summary = "Classify food type from an uploaded image")
  public ResponseEntity<ApiResponse<Map<String, Object>>> classify(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam("image") MultipartFile image) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    try {
      Map<String, Object> res = foodQualityService.classifyImage(image);
      if (res.containsKey("error")) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, String.valueOf(res.get("error")));
      }
      return ApiResponse.okEntity(res);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Failed to classify food image: " + e.getMessage());
    }
  }

  @PostMapping
  @Operation(summary = "Create a new food post")
  public ResponseEntity<ApiResponse<Map<String, Object>>> post(
      @AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody FoodPostRequest request) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.createdEntity(foodService.postFood(user.id(), toBodyMap(request)));
  }

  @GetMapping("/my-posts")
  @Operation(summary = "List food posts created by the authenticated restaurant")
  public ResponseEntity<ApiResponse<Map<String, Object>>> myPosts(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(foodService.getMyPosts(user.id(), status, limit, offset));
  }

  @GetMapping("/available/all")
  @Operation(summary = "List available food posts for NGOs and volunteers")
  public ResponseEntity<ApiResponse<Map<String, Object>>> available(
      @RequestParam(required = false) String food_type,
      @RequestParam(required = false) Integer min_urgency,
      @RequestParam(required = false) Integer max_urgency,
      @RequestParam(defaultValue = "50") int limit) {
    return ApiResponse.okEntity(
        foodService.getAvailableFood(food_type, min_urgency, max_urgency, limit));
  }

  @GetMapping("/{id:[0-9]+}")
  @Operation(summary = "Get a food post by ID")
  public ResponseEntity<ApiResponse<Map<String, Object>>> one(@PathVariable long id) {
    Map<String, Object> post = foodService.getFoodPost(id);
    if (post == null || post.isEmpty()) {
      throw new ResourceNotFoundException("Food post not found");
    }
    return ApiResponse.okEntity(post);
  }

  @PutMapping("/{id:[0-9]+}")
  @Operation(summary = "Update a food post")
  public ResponseEntity<ApiResponse<Map<String, Object>>> update(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(foodService.updateFood(user.id(), id, body));
  }

  @DeleteMapping("/{id:[0-9]+}")
  @Operation(summary = "Soft-delete a food post")
  public ResponseEntity<ApiResponse<Map<String, String>>> delete(
      @AuthenticationPrincipal AuthPrincipal user, @PathVariable long id) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    foodService.deleteFood(user.id(), id);
    return ApiResponse.okEntity(Map.of("message", "Food post deleted successfully"));
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
