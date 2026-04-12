package com.resqmeal.web;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.MatchingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

  private final MatchingService matchingService;

  public MatchController(MatchingService matchingService) {
    this.matchingService = matchingService;
  }

  @PostMapping
  public ResponseEntity<?> create(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      long foodPostId = ((Number) body.get("food_post_id")).longValue();
      return ResponseEntity.status(HttpStatus.CREATED).body(matchingService.createMatch(user.id(), foodPostId));
    } catch (IllegalStateException | IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/for-ngo/all")
  public ResponseEntity<?> forNgo(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(matchingService.getMatchesForNgo(user.id(), status, limit, offset));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/for-restaurant/all")
  public ResponseEntity<?> forRestaurant(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(matchingService.getMatchesForRestaurant(user.id(), status, limit, offset));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/recommended/{foodPostId:[0-9]+}")
  public ResponseEntity<?> recommended(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long foodPostId,
      @RequestParam(defaultValue = "5") int top) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      int topN = Math.min(Math.max(top, 1), 20);
      return ResponseEntity.ok(matchingService.getRecommended(foodPostId, topN));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/{id:[0-9]+}")
  public ResponseEntity<?> one(@PathVariable long id) {
    Map<String, Object> m = matchingService.getMatch(id);
    if (m == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(m);
  }

  @PutMapping("/{id:[0-9]+}/status")
  public ResponseEntity<?> status(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      String st = (String) body.get("status");
      Long volunteerId =
          body.get("volunteer_id") != null ? ((Number) body.get("volunteer_id")).longValue() : null;
      String proof = (String) body.get("delivery_proof_photo");
      return ResponseEntity.ok(matchingService.updateMatchStatus(id, st, volunteerId, proof));
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{id:[0-9]+}/assign-volunteer")
  public ResponseEntity<?> assign(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    long volunteerId = ((Number) body.get("volunteer_id")).longValue();
    return ResponseEntity.ok(matchingService.assignVolunteer(id, volunteerId));
  }
}
