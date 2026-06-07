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
    if (!passwordEncoder.matches(password, (String) u.get("password"))) {
      throw new IllegalStateException("Invalid email or password");
    }
    long id = ((Number) u.get("id")).longValue();
    String role = (String) u.get("role");
    String token = jwtUtil.generateToken(id, role);
    return Map.of(
        "success", true,
        "message", "Login successful",
        "data",
            Map.of(
                "id", id,
                "name", u.get("name"),
                "email", u.get("email"),
                "role", role,
                "token", token));
  }
}
