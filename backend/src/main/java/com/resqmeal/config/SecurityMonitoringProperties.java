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
    this.adminUserIds = adminUserIds;
  }

  public int getMaxFailedLoginsPerMinute() {
    return maxFailedLoginsPerMinute;
  }

  public void setMaxFailedLoginsPerMinute(int maxFailedLoginsPerMinute) {
    this.maxFailedLoginsPerMinute = maxFailedLoginsPerMinute;
  }

  public int getMaxMutationsPerMinute() {
    return maxMutationsPerMinute;
  }

  public void setMaxMutationsPerMinute(int maxMutationsPerMinute) {
    this.maxMutationsPerMinute = maxMutationsPerMinute;
  }
}
