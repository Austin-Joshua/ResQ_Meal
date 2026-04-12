package com.resqmeal.web;

import com.resqmeal.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
    try {
      String name = (String) body.get("name");
      String email = (String) body.get("email");
      String password = (String) body.get("password");
      String role = (String) body.get("role");
      String phone = body.get("phone_number") != null ? body.get("phone_number").toString() : null;
      String address = (String) body.get("address");
      Double lat = body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : null;
      Double lon = body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : null;
      return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(name, email, password, role, phone, address, lat, lon));
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
  public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    try {
      return ResponseEntity.ok(authService.login(body.get("email"), body.get("password")));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @PostMapping("/logout")
  public Map<String, Object> logout() {
    return Map.of("success", true, "message", "Logout successful");
  }
}
