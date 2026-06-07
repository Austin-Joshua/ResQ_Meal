package com.resqmeal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class JwtSecretValidator {

  private static final Logger log = LoggerFactory.getLogger(JwtSecretValidator.class);

  @Value("${jwt.secret}")
  private String jwtSecret;

  @EventListener(ApplicationReadyEvent.class)
  public void warnIfSecretTooShort() {
    if (jwtSecret == null || jwtSecret.length() < 32) {
      log.warn(
          "WARNING: JWT_SECRET is too short. Use at least 32 random characters in production.");
    }
  }
}
