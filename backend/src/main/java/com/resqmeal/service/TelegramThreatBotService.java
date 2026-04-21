package com.resqmeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmeal.config.AttackSimulationProperties;
import com.resqmeal.config.SecurityMonitoringProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TelegramThreatBotService {

  private static final Logger log = LoggerFactory.getLogger(TelegramThreatBotService.class);

  private final SecurityMonitoringProperties securityProps;
  private final AttackSimulationProperties attackProps;
  private final AttackSimulationService attackSimulationService;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
  private final AtomicLong lastUpdateId = new AtomicLong(0L);

  public TelegramThreatBotService(
      SecurityMonitoringProperties securityProps,
      AttackSimulationProperties attackProps,
      AttackSimulationService attackSimulationService) {
    this.securityProps = securityProps;
    this.attackProps = attackProps;
    this.attackSimulationService = attackSimulationService;
  }

  @Scheduled(fixedDelayString = "${app.attack-sim.bot-poll-delay-ms:3000}")
  public void pollUpdates() {
    if (!attackProps.isEnabled() || !attackProps.isTelegramBotEnabled()) {
      return;
    }
    String token = securityProps.getTelegramBotToken();
    if (token == null || token.isBlank()) {
      return;
    }
    try {
      String url =
          "https://api.telegram.org/bot"
              + token
              + "/getUpdates?timeout=1&allowed_updates="
              + URLEncoder.encode("[\"message\"]", StandardCharsets.UTF_8);
      long offset = lastUpdateId.get();
      if (offset > 0) {
        url += "&offset=" + offset;
      }
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(url))
              .timeout(Duration.ofSeconds(8))
              .GET()
              .build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() >= 400) {
        log.warn("Telegram getUpdates failed {} {}", res.statusCode(), res.body());
        return;
      }
      JsonNode root = objectMapper.readTree(res.body());
      JsonNode results = root.path("result");
      if (!results.isArray()) {
        return;
      }
      for (JsonNode item : results) {
        long updateId = item.path("update_id").asLong(0L);
        if (updateId > 0) {
          lastUpdateId.set(updateId + 1L);
        }
        JsonNode msg = item.path("message");
        if (msg.isMissingNode()) {
          continue;
        }
        handleMessage(token, msg);
      }
    } catch (Exception e) {
      log.debug("Telegram bot poll skipped: {}", e.getMessage());
    }
  }

  private void handleMessage(String token, JsonNode msg) {
    String text = msg.path("text").asText("");
    if (text.isBlank() || !text.startsWith("/")) {
      return;
    }
    long chatId = msg.path("chat").path("id").asLong(0L);
    long fromId = msg.path("from").path("id").asLong(0L);
    if (!isAuthorized(fromId)) {
      sendMessage(token, chatId, "Unauthorized user. Command rejected.");
      return;
    }
    String command = text.trim().split("\\s+")[0].toLowerCase();
    String actor = "telegram_user:" + fromId;
    String telegramSource = telegramSourceHint(msg, fromId);
    String response;
    switch (command) {
      case "/insert" ->
          response = toMessage(attackSimulationService.executeAttack("insert", actor, null, telegramSource));
      case "/delete" ->
          response = toMessage(attackSimulationService.executeAttack("delete", actor, null, telegramSource));
      case "/manipulate" ->
          response =
              toMessage(attackSimulationService.executeAttack("manipulate", actor, null, telegramSource));
      case "/duplicate" ->
          response =
              toMessage(attackSimulationService.executeAttack("duplicate", actor, null, telegramSource));
      case "/security_on" -> response = toMessage(attackSimulationService.setSecurityMode(true, actor));
      case "/security_off" -> response = toMessage(attackSimulationService.setSecurityMode(false, actor));
      case "/recover" -> response = toMessage(attackSimulationService.recoverFromBackup(actor));
      case "/status" ->
          response =
              attackSimulationService.isSecurityModeOn()
                  ? "Security mode is ON."
                  : "Security mode is OFF.";
      default ->
          response =
              """
              Supported commands:
              /insert
              /delete
              /manipulate
              /duplicate
              /security_on
              /security_off
              /recover
              /status
              """;
    }
    sendMessage(token, chatId, response);
  }

  private boolean isAuthorized(long fromId) {
    return fromId > 0
        && attackProps.getAuthorizedTelegramUserIds() != null
        && attackProps.getAuthorizedTelegramUserIds().contains(fromId);
  }

  /** Telegram does not expose the operator's public IP to the bot; we record sender id and @username. */
  private static String telegramSourceHint(JsonNode msg, long fromId) {
    String username = msg.path("from").path("username").asText("").trim();
    String first = msg.path("from").path("first_name").asText("").trim();
    StringBuilder sb = new StringBuilder();
    sb.append("telegram_user_id=").append(fromId);
    if (!username.isEmpty()) {
      sb.append(" @").append(username);
    } else if (!first.isEmpty()) {
      sb.append(" first_name=").append(first);
    }
    return sb.toString();
  }

  private void sendMessage(String token, long chatId, String text) {
    if (chatId == 0 || text == null || text.isBlank()) {
      return;
    }
    try {
      String url =
          "https://api.telegram.org/bot"
              + token
              + "/sendMessage?chat_id="
              + URLEncoder.encode(String.valueOf(chatId), StandardCharsets.UTF_8)
              + "&text="
              + URLEncoder.encode(text, StandardCharsets.UTF_8);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(url))
              .timeout(Duration.ofSeconds(10))
              .GET()
              .build();
      http.send(req, HttpResponse.BodyHandlers.ofString());
    } catch (Exception e) {
      log.debug("Telegram sendMessage failed: {}", e.getMessage());
    }
  }

  private static String toMessage(Map<String, Object> response) {
    if (response == null || response.isEmpty()) {
      return "No response.";
    }
    Object message = response.get("message");
    StringBuilder out = new StringBuilder();
    if (message != null) {
      out.append(message);
    } else {
      out.append(response);
    }
    Object ip = response.get("source_http_ip");
    Object hint = response.get("source_hint");
    if (ip != null && !String.valueOf(ip).isBlank()) {
      out.append("\nHTTP client IP: ").append(ip);
    }
    if (hint != null && !String.valueOf(hint).isBlank()) {
      out.append("\nSource: ").append(hint);
    }
    if (Boolean.TRUE.equals(response.get("blocked"))) {
      out.append("\n(Blocked by security mode.)");
    }
    return out.toString();
  }
}
