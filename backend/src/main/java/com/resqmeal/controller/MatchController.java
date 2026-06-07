package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.dto.request.CreateMatchRequest;
import com.resqmeal.exception.ResourceNotFoundException;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.MatchingService;
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
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(matchingService.listMatchesPaginated(user.id(), user.role(), status, page, size));
  }

  @PostMapping
  @Operation(summary = "Create a match request")
  public ResponseEntity<ApiResponse<Map<String, Object>>> create(
      @AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody CreateMatchRequest request) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.createdEntity(matchingService.createMatch(user.id(), request.getFoodPostId()));
  }

  @GetMapping("/for-ngo/all")
  @Operation(summary = "List all matches for the authenticated NGO")
  public ResponseEntity<ApiResponse<Map<String, Object>>> forNgo(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(matchingService.getMatchesForNgo(user.id(), status, limit, offset));
  }

  @GetMapping("/for-restaurant/all")
  @Operation(summary = "List all matches for the authenticated restaurant")
  public ResponseEntity<ApiResponse<Map<String, Object>>> forRestaurant(
      @AuthenticationPrincipal AuthPrincipal user,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "20") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(
        matchingService.getMatchesForRestaurant(user.id(), status, limit, offset));
  }

  @GetMapping("/recommended/{foodPostId:[0-9]+}")
  @Operation(summary = "Get recommended NGO matches for a food post")
  public ResponseEntity<ApiResponse<Map<String, Object>>> recommended(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long foodPostId,
      @RequestParam(defaultValue = "5") int top) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    int topN = Math.min(Math.max(top, 1), 20);
    return ApiResponse.okEntity(matchingService.getRecommended(foodPostId, topN));
  }

  @GetMapping("/{id:[0-9]+}")
  @Operation(summary = "Get a single match by ID")
  public ResponseEntity<ApiResponse<Map<String, Object>>> one(@PathVariable long id) {
    Map<String, Object> m = matchingService.getMatch(id);
    if (m == null) {
      throw new ResourceNotFoundException("Match not found");
    }
    return ApiResponse.okEntity(m);
  }

  @PutMapping("/{id:[0-9]+}/status")
  @Operation(summary = "Update match status")
  public ResponseEntity<ApiResponse<Map<String, Object>>> status(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    String st = (String) body.get("status");
    Long volunteerId =
        body.get("volunteer_id") != null ? ((Number) body.get("volunteer_id")).longValue() : null;
    String proof = (String) body.get("delivery_proof_photo");
    return ApiResponse.okEntity(matchingService.updateMatchStatus(id, st, volunteerId, proof));
  }

  @PutMapping("/{id:[0-9]+}/assign-volunteer")
  public ResponseEntity<ApiResponse<Map<String, Object>>> assign(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    long volunteerId = ((Number) body.get("volunteer_id")).longValue();
    return ApiResponse.okEntity(matchingService.assignVolunteer(id, volunteerId));
  }

  @PutMapping(value = "/{id:[0-9]+}/complete", consumes = "multipart/form-data")
  @Operation(summary = "Complete a match with pickup photo proof")
  public ResponseEntity<ApiResponse<Map<String, Object>>> complete(
      @AuthenticationPrincipal AuthPrincipal user,
      @PathVariable long id,
      @RequestParam("photo") MultipartFile photo,
      @RequestParam(value = "volunteer_id", required = false) Long volunteerId) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    if (photo == null || photo.isEmpty()) {
      throw new IllegalArgumentException("Pickup photo is required");
    }
    try {
      return ApiResponse.okEntity(
          matchingService.completeMatch(
              user.id(), id, photo.getBytes(), photo.getOriginalFilename(), volunteerId));
    } catch (IllegalArgumentException | IllegalStateException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to complete match");
    }
  }
}
