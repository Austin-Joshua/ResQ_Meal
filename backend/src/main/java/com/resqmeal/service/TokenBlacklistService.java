package com.resqmeal.service;

import com.resqmeal.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class TokenBlacklistService {

  private final JdbcTemplate jdbc;
  private final JwtUtil jwtUtil;

  public TokenBlacklistService(JdbcTemplate jdbc, JwtUtil jwtUtil) {
    this.jdbc = jdbc;
    this.jwtUtil = jwtUtil;
  }

  public void blacklist(String token) {
    if (token == null || token.isBlank()) {
      return;
    }
    String hash = sha256(token);
    Instant expiresAt = extractExpiration(token);
    jdbc.update(
        """
        INSERT INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)
        """,
        hash,
        Timestamp.from(expiresAt));
  }

  public boolean isBlacklisted(String token) {
    if (token == null || token.isBlank()) {
      return false;
    }
    String hash = sha256(token);
    Integer count =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM token_blacklist WHERE token_hash = ? AND expires_at > NOW()",
            Integer.class,
            hash);
    return count != null && count > 0;
  }

  public int purgeExpired() {
    return jdbc.update("DELETE FROM token_blacklist WHERE expires_at <= NOW()");
  }

  private Instant extractExpiration(String token) {
    try {
      Claims claims = jwtUtil.parse(token);
      if (claims.getExpiration() != null) {
        return claims.getExpiration().toInstant();
      }
    } catch (Exception ignored) {
      // fall through to default TTL
    }
    return Instant.now().plusSeconds(7L * 24 * 60 * 60);
  }

  static String sha256(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(hashed);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
