package com.resqmeal.controller;

import com.resqmeal.common.AppConstants;
import com.resqmeal.common.ApiResponse;
import com.resqmeal.service.AuthService;
import com.resqmeal.service.SecurityMonitoringService;
import com.resqmeal.service.TokenBlacklistService;
import com.resqmeal.dto.request.LoginRequest;
import com.resqmeal.dto.request.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
@Tag(name = "Authentication", description = "Login, register, and logout")
public class AuthController {

  private final AuthService authService;
  private final SecurityMonitoringService securityMonitoringService;
  private final TokenBlacklistService tokenBlacklistService;

  public AuthController(
      AuthService authService,
      SecurityMonitoringService securityMonitoringService,
      TokenBlacklistService tokenBlacklistService) {
    this.authService = authService;
    this.securityMonitoringService = securityMonitoringService;
    this.tokenBlacklistService = tokenBlacklistService;
  }

  @PostMapping("/register")
  @Operation(summary = "Register a new user account")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    try {
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(
              authService.register(
                  request.getName(),
                  request.getEmail(),
                  request.getPassword(),
                  request.getRole(),
                  request.getPhoneNumber(),
                  request.getAddress(),
                  request.getLatitude(),
                  request.getLongitude()));
    } catch (IllegalStateException e) {
      if (e.getMessage() != null && e.getMessage().contains("Email already")) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("success", false, "message", "Email already registered"));
      }
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("success", false, "message", e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @PostMapping("/login")
  @Operation(summary = "Authenticate and receive a JWT")
  public ResponseEntity<?> login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    String ip = SecurityMonitoringService.clientIp(httpRequest);
    String email = request.getEmail();
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> result =
          (Map<String, Object>) authService.login(email, request.getPassword());
      if (Boolean.TRUE.equals(result.get("success"))) {
        Object data = result.get("data");
        if (data instanceof Map<?, ?> m && m.get("id") instanceof Number n) {
          securityMonitoringService.onLoginSuccess(n.longValue(), ip);
        }
      }
      return ResponseEntity.ok(result);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    } catch (IllegalStateException e) {
      securityMonitoringService.onFailedLogin(ip, email);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @PostMapping("/logout")
  @Operation(summary = "Invalidate the current JWT")
  public ApiResponse<Void> logout(HttpServletRequest request) {
    String header = request.getHeader(AppConstants.AUTH_HEADER);
    if (header != null && header.startsWith(AppConstants.TOKEN_PREFIX)) {
      tokenBlacklistService.blacklist(header.substring(AppConstants.TOKEN_PREFIX.length()));
    }
    return ApiResponse.ok(null, "Logout successful");
  }
}

