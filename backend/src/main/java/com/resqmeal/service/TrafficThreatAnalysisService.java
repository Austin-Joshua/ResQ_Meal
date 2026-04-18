package com.resqmeal.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmeal.config.TrafficSecurityProperties;
import com.resqmeal.security.TrafficSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TrafficThreatAnalysisService {

  private static final Logger log = LoggerFactory.getLogger(TrafficThreatAnalysisService.class);
  private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

  private final TrafficSecurityProperties props;
  private final TrafficMlRemoteClient mlClient;
  private final ThreatMlEventService threatMlEventService;
  private final TelegramAlertService telegram;
  private final FirebaseThreatWebhookNotifier firebaseNotifier;
  private final RealtimeEmitter realtimeEmitter;
  private final BlockedEntityRegistry blockedEntityRegistry;
  private final SecurityMonitoringService securityMonitoringService;
  private final ObjectMapper objectMapper = new ObjectMapper();

  /** Per-IP request rate for flow-level ML features (DDoS / bot burst heuristics). */
  private final SlidingWindowCounter requestsByIp = new SlidingWindowCounter(60_000);

  public TrafficThreatAnalysisService(
      TrafficSecurityProperties props,
      TrafficMlRemoteClient mlClient,
      ThreatMlEventService threatMlEventService,
      TelegramAlertService telegram,
      FirebaseThreatWebhookNotifier firebaseNotifier,
      RealtimeEmitter realtimeEmitter,
      BlockedEntityRegistry blockedEntityRegistry,
      SecurityMonitoringService securityMonitoringService) {
    this.props = props;
    this.mlClient = mlClient;
    this.threatMlEventService = threatMlEventService;
    this.telegram = telegram;
    this.firebaseNotifier = firebaseNotifier;
    this.realtimeEmitter = realtimeEmitter;
    this.blockedEntityRegistry = blockedEntityRegistry;
    this.securityMonitoringService = securityMonitoringService;
  }

  public double recordRequestRateAndGetPerMinute(String ip) {
    if (ip == null || ip.isBlank()) {
      return 0.0;
    }
    return requestsByIp.incrementAndCount("ml:" + ip);
  }

  @Async("trafficMlExecutor")
  public void analyzeAsync(TrafficSnapshot snapshot) {
    if (!props.isEnabled()) {
      return;
    }
    try {
      List<Map<String, Object>> results =
          mlClient.predictBatch(List.of(snapshot.toMlItem()));
      if (results.isEmpty()) {
        return;
      }
      Map<String, Object> r = results.get(0);
      String label = String.valueOf(r.getOrDefault("label", "normal"));
      double confidence = toDouble(r.get("confidence"));
      Object familiesObj = r.get("attack_families");
      String familiesJson = toJson(familiesObj);
      String details =
          "status=%d cached=%s probs=%s"
              .formatted(
                  snapshot.httpStatus(),
                  r.get("cached"),
                  r.get("probabilities") != null ? r.get("probabilities").toString() : "");

      persist(snapshot, label, confidence, familiesJson, details);
      securityMonitoringService.recordMlThreatClassification(
          snapshot.userId(), snapshot.ip(), label, confidence, snapshot.path(), familiesJson);
      if ("malicious".equalsIgnoreCase(label)) {
        onMalicious(snapshot, confidence, familiesObj, familiesJson);
      } else if ("suspicious".equalsIgnoreCase(label) && confidence >= 0.5) {
        onSuspicious(snapshot, confidence, familiesObj, familiesJson);
      }
      if (!"normal".equalsIgnoreCase(label)) {
        emitDashboard(snapshot, label, confidence, familiesObj);
      }
    } catch (Exception e) {
      log.debug("Traffic ML analysis error: {}", e.getMessage());
    }
  }

  private void persist(
      TrafficSnapshot snapshot,
      String label,
      double confidence,
      String familiesJson,
      String details) {
    try {
      threatMlEventService.insert(
          snapshot.userId(),
          snapshot.ip(),
          snapshot.method(),
          snapshot.path(),
          label,
          confidence,
          familiesJson,
          details);
    } catch (DataAccessException e) {
      log.debug("Threat ML DB insert skipped: {}", e.getMessage());
    }
  }

  private void onMalicious(
      TrafficSnapshot snapshot,
      double confidence,
      Object familiesObj,
      String familiesJson) {
    String ts = ISO.format(Instant.now().atOffset(ZoneOffset.UTC));
    String reason =
        "ML traffic threat: malicious (confidence=%.2f) path=%s families=%s"
            .formatted(confidence, snapshot.path(), familiesJson);
    telegram.sendAlertAsync(
        snapshot.userId() != null ? snapshot.userId() : "n/a",
        snapshot.ip(),
        "THREAT_ML_MALICIOUS",
        reason,
        ts);
    firebaseNotifier.notifyAsync(
        firebaseNotifier.buildPayload(
            "malicious", confidence, snapshot.path(), snapshot.ip(), snapshot.userId(), familiesObj));
    if (props.isBlockOnMalicious() && snapshot.ip() != null && !snapshot.ip().isBlank()) {
      blockedEntityRegistry.blockIp(snapshot.ip(), "Auto-block: ML malicious traffic");
    }
  }

  private void onSuspicious(
      TrafficSnapshot snapshot,
      double confidence,
      Object familiesObj,
      String familiesJson) {
    String ts = ISO.format(Instant.now().atOffset(ZoneOffset.UTC));
    String reason =
        "ML traffic threat: suspicious (confidence=%.2f) path=%s families=%s"
            .formatted(confidence, snapshot.path(), familiesJson);
    telegram.sendAlertAsync(
        snapshot.userId() != null ? snapshot.userId() : "n/a",
        snapshot.ip(),
        "THREAT_ML_SUSPICIOUS",
        reason,
        ts);
    firebaseNotifier.notifyAsync(
        firebaseNotifier.buildPayload(
            "suspicious", confidence, snapshot.path(), snapshot.ip(), snapshot.userId(), familiesObj));
  }

  private void emitDashboard(
      TrafficSnapshot snapshot, String label, double confidence, Object familiesObj) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("label", label);
    payload.put("confidence", confidence);
    payload.put("path", snapshot.path());
    payload.put("method", snapshot.method());
    payload.put("ip", snapshot.ip());
    payload.put("userId", snapshot.userId());
    payload.put("attackFamilies", familiesObj);
    payload.put("timestamp", ISO.format(Instant.now().atOffset(ZoneOffset.UTC)));
    realtimeEmitter.broadcast("security_threat", payload);
  }

  private static double toDouble(Object o) {
    if (o instanceof Number n) {
      return n.doubleValue();
    }
    try {
      return Double.parseDouble(String.valueOf(o));
    } catch (Exception e) {
      return 0.0;
    }
  }

  private String toJson(Object o) {
    try {
      return objectMapper.writeValueAsString(o);
    } catch (JsonProcessingException e) {
      return String.valueOf(o);
    }
  }
}
