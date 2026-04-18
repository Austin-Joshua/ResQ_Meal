package com.resqmeal.service;

import com.resqmeal.config.SecurityMonitoringProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class TelegramAlertService {

  private static final Logger log = LoggerFactory.getLogger(TelegramAlertService.class);

  private final SecurityMonitoringProperties props;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

  public TelegramAlertService(SecurityMonitoringProperties props) {
    this.props = props;
  }

  public void sendAlertAsync(
      String userId, String ip, String action, String reason, String timestampIso) {
    String token = props.getTelegramBotToken();
    String chatId = props.getTelegramChatId();
    if (token == null || token.isBlank() || chatId == null || chatId.isBlank()) {
      log.debug("Telegram not configured; skipping alert: {}", reason);
      return;
    }
    String text =
        """
        <b>ResQ Meal Security Alert</b>
        user_id: <code>%s</code>
        ip: <code>%s</code>
        action: %s
        reason: %s
        time: %s
        """
            .formatted(
                escape(userId),
                escape(ip),
                escape(action),
                escape(reason),
                escape(timestampIso));
    String url =
        "https://api.telegram.org/bot"
            + token
            + "/sendMessage?"
            + "chat_id="
            + URLEncoder.encode(chatId, StandardCharsets.UTF_8)
            + "&parse_mode=HTML&text="
            + URLEncoder.encode(text, StandardCharsets.UTF_8);
    java.util.concurrent.CompletableFuture.runAsync(
        () -> {
          try {
            HttpRequest req =
                HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() >= 400) {
              log.warn("Telegram API error {}: {}", res.statusCode(), res.body());
            }
          } catch (Exception e) {
            log.warn("Failed to send Telegram alert: {}", e.getMessage());
          }
        });
  }

  private static String escape(String s) {
    if (s == null) {
      return "";
    }
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }
}
