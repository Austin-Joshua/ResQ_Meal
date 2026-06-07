package com.resqmeal.service;

import com.resqmeal.common.AppConstants;
import com.resqmeal.security.JwtUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
@Service
public class AuthService {

  private final JdbcTemplate jdbc;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public AuthService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
    this.jdbc = jdbc;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
  }

  @Transactional
  public Map<String, Object> register(
      String name,
      String email,
      String password,
      String role,
      String phoneNumber,
      String address,
      Double latitude,
      Double longitude) {
    if (name == null
        || email == null
        || password == null
        || role == null
        || !List.of(
                AppConstants.ROLE_RESTAURANT, AppConstants.ROLE_NGO, AppConstants.ROLE_VOLUNTEER)
            .contains(role)) {
      throw new IllegalArgumentException("Invalid registration data");
    }
    String hash = passwordEncoder.encode(password);
    GeneratedKeyHolder kh = new GeneratedKeyHolder();
    try {
      jdbc.update(
          con -> {
            PreparedStatement ps =
                con.prepareStatement(
                    "INSERT INTO users (name, email, password, role, phone_number, address, latitude, longitude) VALUES (?,?,?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, hash);
            ps.setString(4, role);
            ps.setString(5, phoneNumber);
            ps.setString(6, address);
            if (latitude != null) {
              ps.setDouble(7, latitude);
            } else {
              ps.setObject(7, null);
            }
            if (longitude != null) {
              ps.setDouble(8, longitude);
            } else {
              ps.setObject(8, null);
            }
            return ps;
          },
          kh);
    } catch (DataIntegrityViolationException e) {
      throw new IllegalStateException("Email already registered");
    }
    Number key = kh.getKey();
    long userId = key != null ? key.longValue() : 0;
    createRoleProfile(userId, name, role);
    String token = jwtUtil.generateToken(userId, role);
    return Map.of(
        "success", true,
        "message", "User registered successfully",
        "data",
            Map.of(
                "id", userId,
                "name", name,
                "email", email,
                "role", role,
                "token", token));
  }

  private void createRoleProfile(long userId, String name, String role) {
    switch (role) {
      case AppConstants.ROLE_RESTAURANT -> jdbc.update(
          "INSERT INTO restaurants (user_id, business_name) VALUES (?, ?)",
          userId,
          name != null && !name.isBlank() ? name : "Donor");
      case AppConstants.ROLE_NGO -> jdbc.update(
          "INSERT INTO ngos (user_id, organization_name, daily_capacity, used_capacity, verified) VALUES (?, ?, 100, 0, FALSE)",
          userId,
          name != null && !name.isBlank() ? name : "Organisation");
      case AppConstants.ROLE_VOLUNTEER -> {
        Long ngoId =
            jdbc.query(
                "SELECT MIN(id) AS id FROM ngos",
                rs -> {
                  if (rs.next()) {
                    long v = rs.getLong("id");
                    return rs.wasNull() ? null : v;
                  }
                  return null;
                });
        if (ngoId != null) {
          jdbc.update(
              "INSERT INTO volunteers (user_id, ngo_id, is_active) VALUES (?, ?, TRUE)",
              userId,
              ngoId);
        }
      }
      default -> {}
    }
  }

  public Map<String, Object> login(String email, String password) {
    if (email == null || password == null) {
      throw new IllegalArgumentException("Missing email or password");
    }
    List<Map<String, Object>> rows =
        jdbc.queryForList(
            "SELECT id, name, email, password, role FROM users WHERE email = ?", email);
    if (rows.isEmpty()) {
      throw new IllegalStateException("Invalid email or password");
    }
    Map<String, Object> u = rows.get(0);
    Object storedPassword = u.get("password");
    if (storedPassword == null || storedPassword.toString().isBlank()) {
      throw new IllegalStateException("This account uses Google sign-in. Please continue with Google.");
    }
    if (!passwordEncoder.matches(password, storedPassword.toString())) {
      throw new IllegalStateException("Invalid email or password");
    }
    return buildAuthResponse(
        ((Number) u.get("id")).longValue(),
        (String) u.get("name"),
        (String) u.get("email"),
        (String) u.get("role"));
  }

  @Transactional
  public Map<String, Object> authenticateWithGoogle(String idToken, String role, FirebaseAuthService firebaseAuthService) {
    var decoded = firebaseAuthService.verifyIdToken(idToken);
    String uid = decoded.getUid();
    String email = decoded.getEmail();
    String name = decoded.getName();
    if (email == null || email.isBlank()) {
      throw new IllegalStateException("Google account has no email address");
    }
    String displayName = (name != null && !name.isBlank()) ? name : email.split("@")[0];

    List<Map<String, Object>> byUid =
        jdbc.queryForList(
            "SELECT id, name, email, role FROM users WHERE firebase_uid = ?", uid);
    if (!byUid.isEmpty()) {
      Map<String, Object> u = byUid.get(0);
      return buildAuthResponse(
          ((Number) u.get("id")).longValue(),
          (String) u.get("name"),
          (String) u.get("email"),
          (String) u.get("role"));
    }

    List<Map<String, Object>> byEmail =
        jdbc.queryForList(
            "SELECT id, name, email, role, firebase_uid FROM users WHERE email = ?", email);
    if (!byEmail.isEmpty()) {
      Map<String, Object> u = byEmail.get(0);
      if (u.get("firebase_uid") == null) {
        jdbc.update("UPDATE users SET firebase_uid = ? WHERE id = ?", uid, u.get("id"));
      }
      return buildAuthResponse(
          ((Number) u.get("id")).longValue(),
          (String) u.get("name"),
          (String) u.get("email"),
          (String) u.get("role"));
    }

    String effectiveRole = normalizeRole(role);
    return registerGoogleUser(displayName, email, uid, effectiveRole);
  }

  private String normalizeRole(String role) {
    if (role != null
        && List.of(AppConstants.ROLE_RESTAURANT, AppConstants.ROLE_NGO, AppConstants.ROLE_VOLUNTEER)
            .contains(role.toLowerCase())) {
      return role.toLowerCase();
    }
    return AppConstants.ROLE_VOLUNTEER;
  }

  private Map<String, Object> registerGoogleUser(String name, String email, String firebaseUid, String role) {
    GeneratedKeyHolder kh = new GeneratedKeyHolder();
    try {
      jdbc.update(
          con -> {
            PreparedStatement ps =
                con.prepareStatement(
                    "INSERT INTO users (name, email, password, firebase_uid, role) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setNull(3, java.sql.Types.VARCHAR);
            ps.setString(4, firebaseUid);
            ps.setString(5, role);
            return ps;
          },
          kh);
    } catch (DataIntegrityViolationException e) {
      throw new IllegalStateException("Email already registered");
    }
    Number key = kh.getKey();
    long userId = key != null ? key.longValue() : 0;
    createRoleProfile(userId, name, role);
    return buildAuthResponse(userId, name, email, role);
  }

  private Map<String, Object> buildAuthResponse(long id, String name, String email, String role) {
    String token = jwtUtil.generateToken(id, role);
    return Map.of(
        "success", true,
        "message", "Login successful",
        "data",
            Map.of(
                "id", id,
                "name", name,
                "email", email,
                "role", role,
                "token", token));
  }
}
