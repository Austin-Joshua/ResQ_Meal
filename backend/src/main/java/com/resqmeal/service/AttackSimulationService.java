package com.resqmeal.service;

import com.resqmeal.config.AttackSimulationProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class AttackSimulationService {

  private static final Logger log = LoggerFactory.getLogger(AttackSimulationService.class);

  public static final String BLOCK_MESSAGE =
      "Threat attack has been stopped by the security system.";

  private static final String MAIN_TABLE = "attack_sim_records";
  private static final String LOG_TABLE = "attack_simulation_logs";
  private static final String STATE_TABLE = "attack_simulation_state";

  private final JdbcTemplate jdbc;
  private final AttackSimulationProperties props;
  private final TelegramAlertService telegramAlertService;

  public AttackSimulationService(
      JdbcTemplate jdbc,
      AttackSimulationProperties props,
      TelegramAlertService telegramAlertService) {
    this.jdbc = jdbc;
    this.props = props;
    this.telegramAlertService = telegramAlertService;
  }

  @PostConstruct
  public void initialize() {
    if (!props.isEnabled()) {
      return;
    }
    String backupSchema = safeSchema(props.getBackupSchema());
    jdbc.execute("CREATE SCHEMA IF NOT EXISTS `" + backupSchema + "`");
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS attack_sim_records (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          payload VARCHAR(255) NOT NULL,
          status VARCHAR(64) NOT NULL DEFAULT 'CLEAN',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """);
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS attack_simulation_logs (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          event_type VARCHAR(64) NOT NULL,
          action VARCHAR(64) NOT NULL,
          actor VARCHAR(128) NULL,
          details VARCHAR(1024) NULL,
          blocked BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_created (created_at),
          INDEX idx_event_action (event_type, action)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """);
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS attack_simulation_state (
          id INT PRIMARY KEY,
          security_mode_on BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """);
    jdbc.execute(
        "CREATE TABLE IF NOT EXISTS `"
            + backupSchema
            + "`.attack_sim_records_backup ("
            + "id BIGINT PRIMARY KEY, "
            + "payload VARCHAR(255) NOT NULL, "
            + "status VARCHAR(64) NOT NULL, "
            + "created_at TIMESTAMP NULL, "
            + "updated_at TIMESTAMP NULL"
            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    jdbc.update(
        "INSERT INTO attack_simulation_state (id, security_mode_on) VALUES (1, TRUE) "
            + "ON DUPLICATE KEY UPDATE id = id");
    seedIfEmpty();
    synchronizeBackup();
  }

  @Scheduled(fixedDelayString = "${app.attack-sim.backup-sync-delay-ms:15000}")
  public void synchronizeBackupWhenSecure() {
    if (!props.isEnabled() || !isSecurityModeOn()) {
      return;
    }
    synchronizeBackup();
  }

  public boolean isSecurityModeOn() {
    Boolean on =
        jdbc.query(
            "SELECT security_mode_on FROM attack_simulation_state WHERE id = 1",
            rs -> rs.next() ? rs.getBoolean(1) : Boolean.TRUE);
    return on == null || on;
  }

  @Transactional
  public Map<String, Object> setSecurityMode(boolean enabled, String actor) {
    boolean previous = isSecurityModeOn();
    jdbc.update("UPDATE attack_simulation_state SET security_mode_on = ? WHERE id = 1", enabled);
    if (!previous && enabled) {
      Map<String, Object> recovery = recoverFromBackup(actor);
      return Map.of(
          "success",
          true,
          "security_mode_on",
          true,
          "message",
          "Security mode turned ON and recovery completed.",
          "recovery",
          recovery);
    }
    logEvent("SECURITY_MODE", enabled ? "ON" : "OFF", actor, "security_mode_on=" + enabled, false);
    if (enabled) {
      synchronizeBackup();
    }
    return Map.of(
        "success",
        true,
        "security_mode_on",
        enabled,
        "message",
        enabled ? "Security mode enabled." : "Security mode disabled.");
  }

  /**
   * @param sourceHttpIp client IP when the attack is triggered over HTTP (admin API); may be null
   * @param sourceHint free-text source when there is no HTTP IP (e.g. Telegram sender id / username)
   */
  @Transactional
  public Map<String, Object> executeAttack(
      String attackType, String actor, String sourceHttpIp, String sourceHint) {
    String normalized = normalizeAttackType(attackType);
    if (normalized == null) {
      return Map.of("success", false, "message", "Unsupported attack type.");
    }
    if (isSecurityModeOn()) {
      String blockDetails =
          "attack="
              + normalized
              + " source_http_ip="
              + nullToNa(sourceHttpIp)
              + " source="
              + nullToNa(sourceHint);
      logEvent("THREAT_BLOCKED", normalized, actor, blockDetails, true);
      log.warn(
          "SECURITY attack BLOCKED (security mode ON): type={} actor={} source_http_ip={} source={}",
          normalized,
          actor,
          nullToNa(sourceHttpIp),
          nullToNa(sourceHint));
      return Map.of("success", false, "blocked", true, "message", BLOCK_MESSAGE);
    }
    int affectedRows = switch (normalized) {
      case "insert" -> insertMaliciousRecord();
      case "delete" -> deleteLatestRecord();
      case "manipulate" -> manipulateExistingRecord();
      case "duplicate" -> duplicateExistingRecord();
      default -> 0;
    };
    String httpIp = sourceHttpIp != null ? sourceHttpIp.trim() : "";
    String hint = sourceHint != null ? sourceHint.trim() : "";
    String details =
        "attack="
            + normalized
            + " affected_rows="
            + affectedRows
            + " source_http_ip="
            + (httpIp.isEmpty() ? "n/a" : httpIp)
            + " source="
            + (hint.isEmpty() ? "n/a" : hint);
    logEvent("ATTACK_EXECUTED", normalized, actor, details, false);
    log.warn(
        "SECURITY attack EXECUTED while security mode OFF: type={} actor={} affected_rows={} source_http_ip={} source={}",
        normalized,
        actor,
        affectedRows,
        httpIp.isEmpty() ? "n/a" : httpIp,
        hint.isEmpty() ? "n/a" : hint);
    String ts = OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    String ipForAlert =
        !httpIp.isEmpty()
            ? httpIp
            : (!hint.isEmpty() ? "(no HTTP IP) " + hint : "unknown (no HTTP IP or Telegram hint)");
    String reason =
        "Security mode OFF — simulated attack ran on main DB. "
            + details
            + " — block this IP in Admin if it is a real client.";
    telegramAlertService.sendAlertAsync(actor, ipForAlert, "ATTACK_SIM_EXECUTED", reason, ts);
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("success", true);
    out.put("blocked", false);
    out.put("attack", normalized);
    out.put("affected_rows", affectedRows);
    out.put("message", "Attack simulation executed on main database.");
    out.put("source_http_ip", httpIp.isEmpty() ? null : httpIp);
    out.put("source_hint", hint.isEmpty() ? null : hint);
    return out;
  }

  private static String nullToNa(String s) {
    if (s == null || s.isBlank()) {
      return "n/a";
    }
    return s.trim();
  }

  @Transactional
  public Map<String, Object> recoverFromBackup(String actor) {
    String backupSchema = safeSchema(props.getBackupSchema());
    int alteredInMain =
        jdbc.queryForObject(
            "SELECT COUNT(*) "
                + "FROM attack_sim_records m "
                + "LEFT JOIN `"
                + backupSchema
                + "`.attack_sim_records_backup b "
                + "ON m.id = b.id AND m.payload = b.payload AND m.status = b.status "
                + "WHERE b.id IS NULL",
            Integer.class);
    int missingInMain =
        jdbc.queryForObject(
            "SELECT COUNT(*) "
                + "FROM `"
                + backupSchema
                + "`.attack_sim_records_backup b "
                + "LEFT JOIN attack_sim_records m "
                + "ON m.id = b.id AND m.payload = b.payload AND m.status = b.status "
                + "WHERE m.id IS NULL",
            Integer.class);
    jdbc.update("DELETE FROM attack_sim_records");
    int restored =
        jdbc.update(
            "INSERT INTO attack_sim_records (id, payload, status, created_at, updated_at) "
                + "SELECT id, payload, status, created_at, updated_at FROM `"
                + backupSchema
                + "`.attack_sim_records_backup");
    String details =
        "altered_in_main="
            + alteredInMain
            + " missing_in_main="
            + missingInMain
            + " restored="
            + restored;
    logEvent("RECOVERY", "RESTORE", actor, details, false);
    return Map.of(
        "success",
        true,
        "message",
        "Main database restored from backup database.",
        "altered_in_main",
        alteredInMain,
        "missing_in_main",
        missingInMain,
        "restored_rows",
        restored);
  }

  @Transactional
  public Map<String, Object> synchronizeBackup() {
    if (!props.isEnabled()) {
      return Map.of("success", false, "message", "Attack simulation module is disabled.");
    }
    String backupSchema = safeSchema(props.getBackupSchema());
    jdbc.update("DELETE FROM `" + backupSchema + "`.attack_sim_records_backup");
    int copied =
        jdbc.update(
            "INSERT INTO `"
                + backupSchema
                + "`.attack_sim_records_backup (id, payload, status, created_at, updated_at) "
                + "SELECT id, payload, status, created_at, updated_at FROM attack_sim_records");
    return Map.of("success", true, "copied_rows", copied);
  }

  public List<Map<String, Object>> listSimulationLogs(int limit) {
    int lim = Math.max(1, Math.min(limit, 500));
    return jdbc.queryForList(
        "SELECT id, event_type, action, actor, details, blocked, created_at "
            + "FROM attack_simulation_logs ORDER BY created_at DESC LIMIT "
            + lim);
  }

  public List<Map<String, Object>> listMainData(int limit) {
    int lim = Math.max(1, Math.min(limit, 500));
    return jdbc.queryForList(
        "SELECT id, payload, status, created_at, updated_at "
            + "FROM attack_sim_records ORDER BY id DESC LIMIT "
            + lim);
  }

  private int insertMaliciousRecord() {
    String payload = "MALICIOUS_PAYLOAD_" + UUID.randomUUID();
    return jdbc.update(
        "INSERT INTO attack_sim_records (payload, status) VALUES (?, 'MALICIOUS')", payload);
  }

  private int deleteLatestRecord() {
    Long id =
        jdbc.query(
            "SELECT id FROM attack_sim_records ORDER BY id DESC LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null);
    if (id == null) {
      return 0;
    }
    return jdbc.update("DELETE FROM attack_sim_records WHERE id = ?", id);
  }

  private int manipulateExistingRecord() {
    Long id =
        jdbc.query(
            "SELECT id FROM attack_sim_records ORDER BY id ASC LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null);
    if (id == null) {
      return 0;
    }
    String payload = "MANIPULATED_" + Instant.now().toEpochMilli();
    return jdbc.update(
        "UPDATE attack_sim_records SET payload = ?, status = 'CORRUPTED' WHERE id = ?", payload, id);
  }

  private int duplicateExistingRecord() {
    Map<String, Object> row =
        jdbc.query(
            "SELECT payload, status FROM attack_sim_records ORDER BY id DESC LIMIT 1",
            rs -> {
              if (!rs.next()) {
                return null;
              }
              return Map.of("payload", rs.getString("payload"), "status", rs.getString("status"));
            });
    if (row == null) {
      return 0;
    }
    String payload = String.valueOf(row.get("payload")) + "_DUP";
    String status = String.valueOf(row.get("status"));
    return jdbc.update(
        "INSERT INTO attack_sim_records (payload, status) VALUES (?, ?)", payload, status);
  }

  private void seedIfEmpty() {
    Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM attack_sim_records", Integer.class);
    if (count != null && count > 0) {
      return;
    }
    jdbc.update("INSERT INTO attack_sim_records (payload, status) VALUES ('Sample clean row 1', 'CLEAN')");
    jdbc.update("INSERT INTO attack_sim_records (payload, status) VALUES ('Sample clean row 2', 'CLEAN')");
    jdbc.update("INSERT INTO attack_sim_records (payload, status) VALUES ('Sample clean row 3', 'CLEAN')");
  }

  private void logEvent(
      String eventType, String action, String actor, String details, boolean blocked) {
    jdbc.update(
        "INSERT INTO attack_simulation_logs (event_type, action, actor, details, blocked) VALUES (?,?,?,?,?)",
        eventType,
        action,
        actor,
        details,
        blocked);
  }

  private static String normalizeAttackType(String attackType) {
    if (attackType == null || attackType.isBlank()) {
      return null;
    }
    String t = attackType.trim().toLowerCase(Locale.ROOT);
    return switch (t) {
      case "insert", "delete", "manipulate", "duplicate" -> t;
      default -> null;
    };
  }

  private static String safeSchema(String raw) {
    if (raw == null) {
      return "resqmeal_backup";
    }
    String cleaned = raw.trim().replaceAll("[^A-Za-z0-9_]", "");
    return cleaned.isEmpty() ? "resqmeal_backup" : cleaned;
  }
}
