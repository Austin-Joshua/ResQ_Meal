package com.resqmeal.controller;

import com.resqmeal.common.AppConstants;
import com.resqmeal.common.ApiResponse;
import com.resqmeal.dto.request.GoogleAuthRequest;
import com.resqmeal.dto.request.LoginRequest;
import com.resqmeal.dto.request.RegisterRequest;
import com.resqmeal.exception.DuplicateResourceException;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.service.AuthService;
import com.resqmeal.service.FirebaseAuthService;
import com.resqmeal.service.SecurityMonitoringService;
import com.resqmeal.service.TokenBlacklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
  private final FirebaseAuthService firebaseAuthService;

  public AuthController(
      AuthService authService,
      SecurityMonitoringService securityMonitoringService,
      TokenBlacklistService tokenBlacklistService,
      FirebaseAuthService firebaseAuthService) {
    this.authService = authService;
    this.securityMonitoringService = securityMonitoringService;
    this.tokenBlacklistService = tokenBlacklistService;
    this.firebaseAuthService = firebaseAuthService;
  }

  @PostMapping("/register")
  @Operation(summary = "Register a new user account")
  public ResponseEntity<ApiResponse<Map<String, Object>>> register(
      @Valid @RequestBody RegisterRequest request) {
    try {
      Map<String, Object> result =
          authService.register(
              request.getName(),
              request.getEmail(),
              request.getPassword(),
              request.getRole(),
              request.getPhoneNumber(),
              request.getAddress(),
              request.getLatitude(),
              request.getLongitude());
      return ApiResponse.createdEntity(extractAuthPayload(result));
    } catch (IllegalStateException e) {
      if (e.getMessage() != null && e.getMessage().contains("Email already")) {
        throw new DuplicateResourceException("Email already registered");
      }
      throw e;
    }
  }

  @PostMapping("/login")
  @Operation(summary = "Authenticate and receive a JWT")
  public ResponseEntity<ApiResponse<Map<String, Object>>> login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    String ip = SecurityMonitoringService.clientIp(httpRequest);
    String email = request.getEmail();
    try {
      Map<String, Object> result = authService.login(email, request.getPassword());
      Map<String, Object> payload = extractAuthPayload(result);
      Object idObj = payload.get("id");
      if (idObj instanceof Number n) {
        securityMonitoringService.onLoginSuccess(n.longValue(), ip);
      }
      return ApiResponse.okEntity(payload);
    } catch (IllegalStateException e) {
      securityMonitoringService.onFailedLogin(ip, email);
      throw new UnauthorizedException(e.getMessage());
    }
  }

  @PostMapping("/google")
  @Operation(summary = "Sign in or register with Google (Firebase ID token)")
  public ResponseEntity<ApiResponse<Map<String, Object>>> google(
      @Valid @RequestBody GoogleAuthRequest request, HttpServletRequest httpRequest) {
    if (!firebaseAuthService.isAvailable()) {
      throw new IllegalStateException(
          "Google sign-in is not configured. Set FIREBASE_ENABLED and service account credentials.");
    }
    String ip = SecurityMonitoringService.clientIp(httpRequest);
    try {
      Map<String, Object> result =
          authService.authenticateWithGoogle(
              request.getIdToken(), request.getRole(), firebaseAuthService);
      Map<String, Object> payload = extractAuthPayload(result);
      Object idObj = payload.get("id");
      if (idObj instanceof Number n) {
        securityMonitoringService.onLoginSuccess(n.longValue(), ip);
      }
      return ApiResponse.okEntity(payload);
    } catch (IllegalStateException e) {
      if (e.getMessage() != null && e.getMessage().contains("already registered")) {
        throw new DuplicateResourceException("Email already registered");
      }
      throw e;
    } catch (UnauthorizedException e) {
      securityMonitoringService.onFailedLogin(ip, "google");
      throw e;
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

  @SuppressWarnings("unchecked")
  private static Map<String, Object> extractAuthPayload(Map<String, Object> serviceResult) {
    Object data = serviceResult.get("data");
    if (data instanceof Map<?, ?> map) {
      return (Map<String, Object>) map;
    }
    throw new IllegalStateException("Invalid auth service response");
  }
}
