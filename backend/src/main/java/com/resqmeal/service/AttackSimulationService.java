package com.resqmeal.service;

import com.resqmeal.config.AttackSimulationProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class AttackSimulationService {

  public static final String BLOCK_MESSAGE =
      "Threat attack has been stopped by the security system.";

  private static final String MAIN_TABLE = "attack_sim_records";
  private static final String LOG_TABLE = "attack_simulation_logs";
  private static final String STATE_TABLE = "attack_simulation_state";

  private final JdbcTemplate jdbc;
  private final AttackSimulationProperties props;

  public AttackSimulationService(JdbcTemplate jdbc, AttackSimulationProperties props) {
    this.jdbc = jdbc;
    this.props = props;
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

  @Transactional
  public Map<String, Object> executeAttack(String attackType, String actor) {
    String normalized = normalizeAttackType(attackType);
    if (normalized == null) {
      return Map.of("success", false, "message", "Unsupported attack type.");
    }
    if (isSecurityModeOn()) {
      logEvent("THREAT_BLOCKED", normalized, actor, BLOCK_MESSAGE, true);
      return Map.of("success", false, "blocked", true, "message", BLOCK_MESSAGE);
    }
    int affectedRows = switch (normalized) {
      case "insert" -> insertMaliciousRecord();
      case "delete" -> deleteLatestRecord();
      case "manipulate" -> manipulateExistingRecord();
      case "duplicate" -> duplicateExistingRecord();
      default -> 0;
    };
    String details = "attack=" + normalized + " affected_rows=" + affectedRows;
    logEvent("ATTACK_EXECUTED", normalized, actor, details, false);
    return Map.of(
        "success",
        true,
        "blocked",
        false,
        "attack",
        normalized,
        "affected_rows",
        affectedRows,
        "message",
        "Attack simulation executed on main database.");
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
