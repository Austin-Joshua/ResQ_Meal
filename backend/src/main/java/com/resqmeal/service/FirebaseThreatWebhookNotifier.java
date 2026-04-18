package com.resqmeal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmeal.config.TrafficSecurityProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Optional outbound webhook for mobile / Firebase-backed alerting. POSTs JSON to
 * {@code app.traffic-security.firebase-webhook-url} when set (e.g. HTTPS Cloud Function).
 */
@Service
public class FirebaseThreatWebhookNotifier {

  private static final Logger log = LoggerFactory.getLogger(FirebaseThreatWebhookNotifier.class);

  private final TrafficSecurityProperties props;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

  public FirebaseThreatWebhookNotifier(TrafficSecurityProperties props) {
    this.props = props;
  }

  public void notifyAsync(Map<String, Object> payload) {
    String url = props.getFirebaseWebhookUrl();
    if (url == null || url.isBlank()) {
      return;
    }
    java.util.concurrent.CompletableFuture.runAsync(
        () -> {
          try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest.Builder b =
                HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
            String secret = props.getFirebaseWebhookSecret();
            if (secret != null && !secret.isBlank()) {
              b.header("X-Webhook-Secret", secret);
            }
            HttpResponse<String> resp = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
              log.warn("Firebase/webhook alert HTTP {}: {}", resp.statusCode(), resp.body());
            }
          } catch (Exception e) {
            log.warn("Firebase/webhook alert failed: {}", e.getMessage());
          }
        });
  }

  public Map<String, Object> buildPayload(
      String label,
      double confidence,
      String path,
      String ip,
      String userId,
      Object attackFamilies) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("event", "security_threat");
    m.put("label", label);
    m.put("confidence", confidence);
    m.put("path", path);
    m.put("ip", ip);
    m.put("userId", userId);
    m.put("attackFamilies", attackFamilies);
    return m;
  }
}
