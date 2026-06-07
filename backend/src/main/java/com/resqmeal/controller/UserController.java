package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.ResourceNotFoundException;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
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
  public ResponseEntity<ApiResponse<Map<String, Object>>> me(@AuthenticationPrincipal AuthPrincipal user) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    Map<String, Object> data = userService.getMe(user.id());
    if (data == null) {
      throw new ResourceNotFoundException("User not found");
    }
    return ApiResponse.okEntity(data);
  }

  @PutMapping("/me")
  @Operation(summary = "Update the authenticated user's profile")
  public ResponseEntity<ApiResponse<Map<String, Object>>> update(
      @AuthenticationPrincipal AuthPrincipal user, @RequestBody Map<String, Object> body) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    return ApiResponse.okEntity(userService.updateMe(user.id(), user.role(), body));
  }
}
