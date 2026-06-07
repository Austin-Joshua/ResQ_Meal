package com.resqmeal.controller;

import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Validated
@Tag(name = "Users", description = "User profile endpoints")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  @Operation(summary = "Get the authenticated user's profile")
  public ResponseEntity<?> me(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    Map<String, Object> data = userService.getMe(user.id());
    if (data == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found"));
    }
    return ResponseEntity.ok(data);
  }

  @PutMapping("/me")
  @Operation(summary = "Update the authenticated user's profile")
  public ResponseEntity<?> update(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token required"));
    }
    try {
      return ResponseEntity.ok(userService.updateMe(user.id(), user.role(), body));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
    }
  }
}
