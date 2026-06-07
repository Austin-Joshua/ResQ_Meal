package com.resqmeal.service;

import com.resqmeal.common.AppConstants;
import com.resqmeal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

  private final JdbcTemplate jdbc;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final SecurityMonitoringService securityMonitoringService;

  @Value("${app.api-public-base-url:http://localhost:8080}")
  private String apiPublicBase;

  @Value("${app.upload-dir:uploads}")
  private String uploadDir;

  public UserService(
      JdbcTemplate jdbc,
      PasswordEncoder passwordEncoder,
      JwtUtil jwtUtil,
      SecurityMonitoringService securityMonitoringService) {
    this.jdbc = jdbc;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
    this.securityMonitoringService = securityMonitoringService;
  }

  public Map<String, Object> getMe(long userId) {
    Map<String, Object> row =
        jdbc.query(
            """
            SELECT id, name, email, role, phone_number, address, latitude, longitude,
                   profile_photo, created_at, updated_at FROM users WHERE id = ?
            """,
            rs -> {
              if (!rs.next()) {
                return null;
              }
              Map<String, Object> m = new HashMap<>();
              m.put("id", rs.getLong("id"));
              m.put("name", rs.getString("name"));
              m.put("email", rs.getString("email"));
              m.put("role", rs.getString("role"));
              m.put("phone_number", rs.getString("phone_number"));
              m.put("address", rs.getString("address"));
              m.put("latitude", rs.getObject("latitude"));
              m.put("longitude", rs.getObject("longitude"));
              m.put("profile_photo", rs.getString("profile_photo"));
              m.put("created_at", rs.getTimestamp("created_at"));
              m.put("updated_at", rs.getTimestamp("updated_at"));
              return m;
            },
            userId);
    if (row == null) {
      return null;
    }
    String photo = (String) row.get("profile_photo");
    if (photo != null && !photo.isBlank()) {
      String base = apiPublicBase.replaceAll("/$", "");
      row.put("profile_photo_url", base + "/uploads/" + photo);
    }
    row.put("is_security_admin", securityMonitoringService.isSecurityAdmin(userId));
    return Map.of("success", true, "message", "User profile retrieved", "data", row);
  }

  @Transactional
  public Map<String, Object> updateMe(long userId, String jwtRole, Map<String, Object> body) {
    Map<String, Object> user = jdbc.queryForMap("SELECT * FROM users WHERE id = ?", userId);
    String newPassword = (String) body.get("new_password");
    if (newPassword != null && !newPassword.isBlank()) {
      String current = (String) body.get("current_password");
      if (current == null || !passwordEncoder.matches(current, (String) user.get("password"))) {
        throw new IllegalStateException("Current password is incorrect");
      }
    }
    StringBuilder sql = new StringBuilder("UPDATE users SET updated_at = NOW()");
    List<Object> params = new java.util.ArrayList<>();
    if (body.get("name") != null) {
      sql.append(", name = ?");
      params.add(body.get("name"));
    }
    if (body.get("phone_number") != null) {
      sql.append(", phone_number = ?");
      params.add(body.get("phone_number"));
    }
    if (body.get("address") != null) {
      sql.append(", address = ?");
      params.add(body.get("address"));
    }
    if (body.get("latitude") != null) {
      sql.append(", latitude = ?");
      params.add(body.get("latitude"));
    }
    if (body.get("longitude") != null) {
      sql.append(", longitude = ?");
      params.add(body.get("longitude"));
    }
    String role = (String) body.get("role");
    if (role != null
        && List.of(
                AppConstants.ROLE_VOLUNTEER, AppConstants.ROLE_RESTAURANT, AppConstants.ROLE_NGO)
            .contains(role)) {
      sql.append(", role = ?");
      params.add(role);
    }
    if (newPassword != null && !newPassword.isBlank()) {
      sql.append(", password = ?");
      params.add(passwordEncoder.encode(newPassword));
    }
    sql.append(" WHERE id = ?");
    params.add(userId);
    jdbc.update(sql.toString(), params.toArray());

    Map<String, Object> data =
        jdbc.query(
            """
            SELECT id, name, email, role, phone_number, address, latitude, longitude,
                   profile_photo, created_at, updated_at FROM users WHERE id = ?
            """,
            rs -> {
              rs.next();
              Map<String, Object> m = new HashMap<>();
              m.put("id", rs.getLong("id"));
              m.put("name", rs.getString("name"));
              m.put("email", rs.getString("email"));
              m.put("role", rs.getString("role"));
              m.put("phone_number", rs.getString("phone_number"));
              m.put("address", rs.getString("address"));
              m.put("latitude", rs.getObject("latitude"));
              m.put("longitude", rs.getObject("longitude"));
              m.put("profile_photo", rs.getString("profile_photo"));
              m.put("created_at", rs.getTimestamp("created_at"));
              m.put("updated_at", rs.getTimestamp("updated_at"));
              return m;
            },
            userId);
    if (role != null
        && List.of(
                AppConstants.ROLE_VOLUNTEER, AppConstants.ROLE_RESTAURANT, AppConstants.ROLE_NGO)
            .contains(role)) {
      data.put("token", jwtUtil.generateToken(userId, (String) data.get("role")));
    }
    String photo = (String) data.get("profile_photo");
    if (photo != null && !photo.isBlank()) {
      String base = apiPublicBase.replaceAll("/$", "");
      data.put("profile_photo_url", base + "/uploads/" + photo);
    }
    return Map.of("success", true, "message", "User profile updated successfully", "data", data);
  }

  public Map<String, Object> uploadProfilePhoto(long userId, byte[] bytes, String originalFilename)
      throws Exception {
    Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(dir);
    String ext = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
    String filename = "profile_" + userId + "_" + UUID.randomUUID() + ext;
    Files.write(dir.resolve(filename), bytes);
    jdbc.update("UPDATE users SET profile_photo = ? WHERE id = ?", filename, userId);
    String base = apiPublicBase.replaceAll("/$", "");
    return Map.of(
        "success",
        true,
        "message",
        "Profile photo uploaded successfully",
        "data",
        Map.of(
            "profile_photo",
            filename,
            "profile_photo_url",
            base + "/uploads/" + filename));
  }
}
