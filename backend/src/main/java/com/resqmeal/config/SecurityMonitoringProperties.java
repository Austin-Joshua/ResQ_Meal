package com.resqmeal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "app.security")
public class SecurityMonitoringProperties {

  /** Telegram Bot API token (optional; alerts skipped if blank). */
  private String telegramBotToken = "";

  /** Telegram chat id for sendMessage (optional). */
  private String telegramChatId = "";

  /** User IDs from `users.id` that receive ROLE_ADMIN and may access /api/admin/** */
  private List<Long> adminUserIds = new ArrayList<>();

  private int maxFailedLoginsPerMinute = 5;

  private int maxMutationsPerMinute = 20;

  public String getTelegramBotToken() {
    return telegramBotToken;
  }

  public void setTelegramBotToken(String telegramBotToken) {
    this.telegramBotToken = telegramBotToken;
  }

  public String getTelegramChatId() {
    return telegramChatId;
  }

  public void setTelegramChatId(String telegramChatId) {
    this.telegramChatId = telegramChatId;
  }

  public List<Long> getAdminUserIds() {
    return adminUserIds;
  }

  public void setAdminUserIds(List<Long> adminUserIds) {
    this.adminUserIds = sanitizeAdminUserIds(adminUserIds);
  }

  /**
   * Supports env-style CSV values (e.g. ADMIN_USER_IDS=1,42) without failing binding when values
   * are blank or contain whitespace.
   */
  public void setAdminUserIds(String rawAdminUserIds) {
    if (rawAdminUserIds == null || rawAdminUserIds.isBlank()) {
      this.adminUserIds = new ArrayList<>();
      return;
    }
    List<Long> parsed = new ArrayList<>();
    for (String token : rawAdminUserIds.split(",")) {
      String value = token.trim();
      if (value.isEmpty()) {
        continue;
      }
      try {
        long id = Long.parseLong(value);
        if (id > 0) {
          parsed.add(id);
        }
      } catch (NumberFormatException ignored) {
      }
    }
    this.adminUserIds = sanitizeAdminUserIds(parsed);
  }

  public int getMaxFailedLoginsPerMinute() {
    return maxFailedLoginsPerMinute;
  }

  public void setMaxFailedLoginsPerMinute(int maxFailedLoginsPerMinute) {
    this.maxFailedLoginsPerMinute = Math.max(1, maxFailedLoginsPerMinute);
  }

  public int getMaxMutationsPerMinute() {
    return maxMutationsPerMinute;
  }

  public void setMaxMutationsPerMinute(int maxMutationsPerMinute) {
    this.maxMutationsPerMinute = Math.max(1, maxMutationsPerMinute);
  }

  private static List<Long> sanitizeAdminUserIds(List<Long> ids) {
    if (ids == null || ids.isEmpty()) {
      return new ArrayList<>();
    }
    List<Long> out = new ArrayList<>();
    for (Long id : ids) {
      if (id != null && id > 0 && !out.contains(id)) {
        out.add(id);
      }
    }
    return out;
  }
}
