package com.resqmeal.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

  private final SecretKey key;
  private final int expirationDays;

  public JwtUtil(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.expiration-days:7}") int expirationDays) {
    byte[] bytes;
    try {
      bytes = Decoders.BASE64.decode(secret);
    } catch (Exception e) {
      bytes = secret.getBytes(StandardCharsets.UTF_8);
    }
    this.key = Keys.hmacShaKeyFor(bytes.length >= 32 ? bytes : pad(secret));
    this.expirationDays = expirationDays;
  }

  private static byte[] pad(String secret) {
    byte[] b = secret.getBytes(StandardCharsets.UTF_8);
    if (b.length >= 32) {
      return b;
    }
    byte[] out = new byte[32];
    System.arraycopy(b, 0, out, 0, b.length);
    for (int i = b.length; i < 32; i++) {
      out[i] = (byte) i;
    }
    return out;
  }

  public String generateToken(long userId, String role) {
    long now = System.currentTimeMillis();
    long exp = now + expirationDays * 24L * 60 * 60 * 1000;
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("id", userId)
        .claim("role", role)
        .issuedAt(new Date(now))
        .expiration(new Date(exp))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
