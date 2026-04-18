package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.FoodQualityService;
import com.resqmeal.service.FoodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/food")
public class FoodController {

  private final FoodService foodService;
  private final FoodQualityService foodQualityService;

  public FoodController(FoodService foodService, FoodQualityService foodQualityService) {
    this.foodService = foodService;
    this.foodQualityService = foodQualityService;
  }

  @PostMapping("/assess-freshness")
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
  public ResponseEntity<?> assessEnv(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    return ResponseEntity.ok(foodQualityService.assessFreshnessByEnvironment(body));
  }

  @PostMapping("/classify-image")
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
  public ResponseEntity<?> post(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.status(HttpStatus.CREATED).body(foodService.postFood(user.id(), body));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/my-posts")
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
  public Map<String, Object> available(
      @RequestParam(required = false) String food_type,
      @RequestParam(required = false) Integer min_urgency,
      @RequestParam(required = false) Integer max_urgency,
      @RequestParam(defaultValue = "50") int limit) {
    return foodService.getAvailableFood(food_type, min_urgency, max_urgency, limit);
  }

  @GetMapping("/{id:[0-9]+}")
  public ResponseEntity<?> one(@PathVariable long id) {
    Map<String, Object> post = foodService.getFoodPost(id);
    if (post == null || post.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(post);
  }

  @PutMapping("/{id:[0-9]+}")
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
}
