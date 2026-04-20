package com.resqmeal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "app.attack-sim")
public class AttackSimulationProperties {

  private boolean enabled = true;
  private boolean telegramBotEnabled = true;
  private String backupSchema = "resqmeal_backup";
  private long botPollDelayMs = 3000;
  private List<Long> authorizedTelegramUserIds = new ArrayList<>();

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public boolean isTelegramBotEnabled() {
    return telegramBotEnabled;
  }

  public void setTelegramBotEnabled(boolean telegramBotEnabled) {
    this.telegramBotEnabled = telegramBotEnabled;
  }

  public String getBackupSchema() {
    return backupSchema;
  }

  public void setBackupSchema(String backupSchema) {
    if (backupSchema == null || backupSchema.isBlank()) {
      this.backupSchema = "resqmeal_backup";
      return;
    }
    this.backupSchema = backupSchema.trim();
  }

  public long getBotPollDelayMs() {
    return botPollDelayMs;
  }

  public void setBotPollDelayMs(long botPollDelayMs) {
    this.botPollDelayMs = Math.max(1000L, botPollDelayMs);
  }

  public List<Long> getAuthorizedTelegramUserIds() {
    return authorizedTelegramUserIds;
  }

  public void setAuthorizedTelegramUserIds(List<Long> authorizedTelegramUserIds) {
    this.authorizedTelegramUserIds = sanitizeIds(authorizedTelegramUserIds);
  }

  public void setAuthorizedTelegramUserIds(String rawIds) {
    if (rawIds == null || rawIds.isBlank()) {
      this.authorizedTelegramUserIds = new ArrayList<>();
      return;
    }
    List<Long> parsed = new ArrayList<>();
    for (String token : rawIds.split(",")) {
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
    this.authorizedTelegramUserIds = sanitizeIds(parsed);
  }

  private static List<Long> sanitizeIds(List<Long> ids) {
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
