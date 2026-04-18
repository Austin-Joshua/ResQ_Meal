package com.resqmeal.security;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/** Immutable capture of one HTTP exchange for the traffic-security ML pipeline (Phase A input). */
public record TrafficSnapshot(
    String method,
    String path,
    String query,
    Map<String, String> headers,
    byte[] body,
    String ip,
    String userId,
    String sessionId,
    double requestsLastMinute,
    int httpStatus) {

  public Map<String, Object> toMlItem() {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("method", method);
    m.put("path", path);
    m.put("query", query == null ? "" : query);
    m.put("headers", headers == null ? Map.of() : headers);
    m.put(
        "body_b64",
        body == null || body.length == 0 ? "" : Base64.getEncoder().encodeToString(body));
    m.put("ip", ip == null ? "" : ip);
    m.put("userId", userId);
    m.put("sessionId", sessionId == null ? "" : sessionId);
    m.put("requestsLastMinute", requestsLastMinute);
    return m;
  }
}
