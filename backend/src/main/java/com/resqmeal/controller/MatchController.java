package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.MatchingService;
import com.resqmeal.dto.request.CreateMatchRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@Validated
@Tag(name = "Matches", description = "Food rescue match lifecycle")
public class MatchController {

  private final MatchingService matchingService;

  public MatchController(MatchingService matchingService) {
    this.matchingService = matchingService;
  }

  @GetMapping
  @Operation(summary = "List matches with pagination")
  public ResponseEntity<?> list(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(matchingService.listMatchesPaginated(user.id(), user.role(), status, page, size));
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping
  @Operation(summary = "Create a match request")
  public ResponseEntity<?> create(
      @AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody CreateMatchRequest request) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(matchingService.createMatch(user.id(), request.getFoodPostId()));
    } catch (IllegalStateException | IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/for-ngo/all")
  @Operation(summary = "List all matches for the authenticated NGO")
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
  @Operation(summary = "List all matches for the authenticated restaurant")
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
  @Operation(summary = "Get recommended NGO matches for a food post")
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
  @Operation(summary = "Get a single match by ID")
  public ResponseEntity<?> one(@PathVariable long id) {
    Map<String, Object> m = matchingService.getMatch(id);
    if (m == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(m);
  }

  @PutMapping("/{id:[0-9]+}/status")
  @Operation(summary = "Update match status")
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

  @PutMapping(value = "/{id:[0-9]+}/complete", consumes = "multipart/form-data")
  @Operation(summary = "Complete a match with pickup photo proof")
  public ResponseEntity<?> complete(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestParam("photo") MultipartFile photo,
      @RequestParam(value = "volunteer_id", required = false) Long volunteerId) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    if (photo == null || photo.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Pickup photo is required"));
    }
    try {
      return ResponseEntity.ok(
          matchingService.completeMatch(user.id(), id, photo.getBytes(), photo.getOriginalFilename(), volunteerId));
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(Map.of("error", "Failed to complete match"));
    }
  }
}

