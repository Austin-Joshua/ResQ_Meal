package com.resqmeal.service;

import com.resqmeal.config.SecurityMonitoringProperties;
import com.resqmeal.security.AuthPrincipal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SecurityMonitoringService {

  private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

  private final JdbcTemplate jdbc;
  private final SecurityMonitoringProperties props;
  private final TelegramAlertService telegram;
  private final BlockedEntityRegistry blockedEntityRegistry;
  private final SlidingWindowCounter failedLoginByIp = new SlidingWindowCounter(60_000);
  private final SlidingWindowCounter mutationsByUser = new SlidingWindowCounter(60_000);

  public SecurityMonitoringService(
      JdbcTemplate jdbc,
      SecurityMonitoringProperties props,
      TelegramAlertService telegram,
      BlockedEntityRegistry blockedEntityRegistry) {
    this.jdbc = jdbc;
    this.props = props;
    this.telegram = telegram;
    this.blockedEntityRegistry = blockedEntityRegistry;
  }

  public boolean isSecurityAdmin(long userId) {
    return props.getAdminUserIds() != null && props.getAdminUserIds().contains(userId);
  }

  public void onFailedLogin(String ip, String email) {
    if (ip == null) {
      return;
    }
    String action = "LOGIN_FAILED";
    insertLog(null, ip, action, "FAILURE", false, "email=" + (email != null ? email : ""));
    int n = failedLoginByIp.incrementAndCount("ip:" + ip);
    if (n > props.getMaxFailedLoginsPerMinute()) {
      String reason = "More than %d failed login attempts within 1 minute from this IP"
          .formatted(props.getMaxFailedLoginsPerMinute());
      blockedEntityRegistry.blockIp(ip, reason);
      insertLog(null, ip, "AUTO_BLOCK_IP", "BLOCKED", true, reason);
      alert(null, ip, action, reason);
    }
  }

  public void onLoginSuccess(long userId, String ip) {
    if (ip == null) {
      return;
    }
    rememberIp(userId, ip);
    insertLog(
        String.valueOf(userId),
        ip,
        "LOGIN_SUCCESS",
        "SUCCESS",
        false,
        null);
  }

  public void onUnauthorizedAdminAccess(Long userId, String ip, String uri) {
    String uid = userId != null ? String.valueOf(userId) : "anonymous";
    insertLog(uid, ip, "UNAUTHORIZED_ADMIN_ROUTE", "DENIED", true, uri);
    String reason = "Unauthorized access to restricted admin route: " + uri;
    alert(uid, ip != null ? ip : "unknown", "UNAUTHORIZED_ADMIN_ROUTE", reason);
  }

  public void recordApiRequest(
      HttpServletRequest request,
      Authentication authentication,
      int responseStatus) {
    String path = request.getRequestURI();
    if (path.startsWith("/api/admin")
        && authentication != null
        && authentication.isAuthenticated()
        && extractUserId(authentication) != null
        && !hasAuthority(authentication, "ROLE_ADMIN")) {
      return;
    }

    String ip = clientIp(request);
    String method = request.getMethod();
    Long userId = extractUserId(authentication);
    String userKey = userId != null ? String.valueOf(userId) : null;

    String action = classifyAction(method, path);
    boolean critical = false;
    String details = method + " " + path;

    if (userId != null
        && path.startsWith("/api/admin")
        && (responseStatus == 401 || responseStatus == 403)) {
      critical = true;
    }

    String statusLabel = responseStatus >= 400 ? "ERROR" : "OK";
    if (responseStatus >= 500) {
      statusLabel = "FAILURE";
    }

    insertLog(userKey, ip, action, statusLabel, critical, details);

    if (userId != null && isMutating(method) && responseStatus < 400) {
      int m = mutationsByUser.incrementAndCount("u:" + userId);
      if (m > props.getMaxMutationsPerMinute()) {
        String reason =
            "More than %d delete/update actions within 1 minute"
                .formatted(props.getMaxMutationsPerMinute());
        blockedEntityRegistry.blockUser(userId, reason);
        insertLog(userKey, ip, "AUTO_BLOCK_USER", "BLOCKED", true, reason);
        alert(userKey, ip, action, reason);
      }
    }

    if (userId != null && responseStatus < 400) {
      checkNewIp(userId, ip);
    }
  }

  private void checkNewIp(long userId, String ip) {
    if (ip == null || ip.isBlank()) {
      return;
    }
    String uid = String.valueOf(userId);
    Integer count =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM user_known_ips WHERE user_id = ?", Integer.class, uid);
    Integer ipCount =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM user_known_ips WHERE user_id = ? AND ip_address = ?",
            Integer.class,
            uid,
            ip);
    boolean known = ipCount != null && ipCount > 0;
    if (!known && count != null && count > 0) {
      insertLog(
          String.valueOf(userId),
          ip,
          "NEW_IP_ACCESS",
          "WARNING",
          true,
          "Access from a new or unknown IP address");
      alert(
          String.valueOf(userId),
          ip,
          "NEW_IP_ACCESS",
          "Access from a new or unknown IP address for this account");
    }
    rememberIp(userId, ip);
  }

  private void rememberIp(long userId, String ip) {
    jdbc.update(
        """
        INSERT INTO user_known_ips (user_id, ip_address) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE first_seen = first_seen
        """,
        String.valueOf(userId),
        ip);
  }

  private static boolean hasAuthority(Authentication authentication, String authority) {
    if (authentication == null) {
      return false;
    }
    for (GrantedAuthority a : authentication.getAuthorities()) {
      if (authority.equals(a.getAuthority())) {
        return true;
      }
    }
    return false;
  }

  private static Long extractUserId(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return null;
    }
    Object p = authentication.getPrincipal();
    if (p instanceof AuthPrincipal ap) {
      return ap.id();
    }
    return null;
  }

  private static boolean isMutating(String method) {
    return "PUT".equalsIgnoreCase(method)
        || "PATCH".equalsIgnoreCase(method)
        || "DELETE".equalsIgnoreCase(method);
  }

  static String classifyAction(String method, String path) {
    if (path != null && path.contains("/api/auth/login")) {
      return "LOGIN";
    }
    if ("DELETE".equalsIgnoreCase(method)) {
      return "DELETE";
    }
    if ("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
      return "UPDATE";
    }
    if ("POST".equalsIgnoreCase(method)) {
      return "API_CALL";
    }
    if ("GET".equalsIgnoreCase(method)) {
      return "READ";
    }
    return "API_CALL";
  }

  public static String clientIp(HttpServletRequest request) {
    String xff = request.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      return xff.split(",")[0].trim();
    }
    return request.getRemoteAddr() != null ? request.getRemoteAddr() : "";
  }

  private void insertLog(
      String userId, String ip, String action, String status, boolean critical, String details) {
    jdbc.update(
        """
        INSERT INTO security_logs (user_id, ip_address, action, status, is_critical, details)
        VALUES (?,?,?,?,?,?)
        """,
        userId,
        ip != null ? ip : "",
        action,
        status,
        critical,
        details != null && details.length() > 500 ? details.substring(0, 500) : details);
  }

  private void alert(String userId, String ip, String action, String reason) {
    String ts = ISO.format(Instant.now().atOffset(ZoneOffset.UTC));
    telegram.sendAlertAsync(
        userId != null ? userId : "n/a", ip != null ? ip : "n/a", action, reason, ts);
  }

  public List<java.util.Map<String, Object>> listLogs(int limit, boolean criticalOnly) {
    int lim = Math.min(Math.max(limit, 1), 500);
    if (criticalOnly) {
      return jdbc.queryForList(
          "SELECT id, user_id, ip_address, action, status, is_critical, details, created_at "
              + "FROM security_logs WHERE is_critical = TRUE ORDER BY created_at DESC LIMIT "
              + lim);
    }
    return jdbc.queryForList(
        "SELECT id, user_id, ip_address, action, status, is_critical, details, created_at "
            + "FROM security_logs ORDER BY created_at DESC LIMIT "
            + lim);
  }

  public List<java.util.Map<String, Object>> listBlocked() {
    return jdbc.queryForList(
        "SELECT id, user_id, ip_address, reason, blocked_at FROM blocked_entities ORDER BY blocked_at DESC");
  }

  /** Persists ML pipeline threat classification alongside structured threat events. */
  public void recordMlThreatClassification(
      String userId, String ip, String label, double confidence, String path, String familiesJson) {
    if ("normal".equalsIgnoreCase(label)) {
      return;
    }
    boolean critical = "malicious".equalsIgnoreCase(label);
    String details =
        ("label=%s confidence=%.3f path=%s families=%s")
            .formatted(label, confidence, path != null ? path : "", familiesJson != null ? familiesJson : "");
    insertLog(userId, ip, "THREAT_ML", critical ? "ALERT" : "INFO", critical, details);
  }
}
