package com.resqmeal.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.resqmeal.config.FirebaseProperties;
import com.resqmeal.exception.UnauthorizedException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Service
public class FirebaseAuthService {

  private static final Logger log = LoggerFactory.getLogger(FirebaseAuthService.class);

  private final FirebaseProperties properties;
  private FirebaseAuth firebaseAuth;

  public FirebaseAuthService(FirebaseProperties properties) {
    this.properties = properties;
  }

  @PostConstruct
  void init() {
    if (!properties.isEnabled()) {
      log.info("Firebase auth disabled (app.firebase.enabled=false)");
      return;
    }
    if (properties.getServiceAccountJson().isBlank()) {
      log.warn("Firebase enabled but FIREBASE_SERVICE_ACCOUNT_JSON is empty — Google sign-in unavailable");
      return;
    }
    try {
      GoogleCredentials credentials =
          GoogleCredentials.fromStream(
              new ByteArrayInputStream(
                  properties.getServiceAccountJson().getBytes(StandardCharsets.UTF_8)));
      FirebaseOptions options =
          FirebaseOptions.builder()
              .setCredentials(credentials)
              .setProjectId(properties.getProjectId())
              .build();
      if (FirebaseApp.getApps().isEmpty()) {
        FirebaseApp.initializeApp(options);
      }
      firebaseAuth = FirebaseAuth.getInstance();
      log.info("Firebase Admin SDK initialized for project {}", properties.getProjectId());
    } catch (Exception e) {
      log.error("Failed to initialize Firebase Admin SDK", e);
    }
  }

  public boolean isAvailable() {
    return firebaseAuth != null;
  }

  public FirebaseToken verifyIdToken(String idToken) {
    if (firebaseAuth == null) {
      throw new IllegalStateException("Google sign-in is not configured on the server");
    }
    try {
      return firebaseAuth.verifyIdToken(idToken);
    } catch (FirebaseAuthException e) {
      throw new UnauthorizedException("Invalid or expired Google sign-in token");
    }
  }
}
