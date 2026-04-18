package com.resqmeal.security;

import com.resqmeal.config.TrafficSecurityProperties;
import com.resqmeal.service.TrafficThreatAnalysisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Wraps API requests for body capture and schedules asynchronous ML threat analysis after the
 * response (non-blocking for the user request).
 */
public class TrafficCaptureFilter extends OncePerRequestFilter implements Ordered {

  public static final int ORDER = 110;

  private final TrafficSecurityProperties props;
  private final TrafficThreatAnalysisService trafficThreatAnalysisService;

  public TrafficCaptureFilter(
      TrafficSecurityProperties props, TrafficThreatAnalysisService trafficThreatAnalysisService) {
    this.props = props;
    this.trafficThreatAnalysisService = trafficThreatAnalysisService;
  }

  @Override
  public int getOrder() {
    return ORDER;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    if (!props.isEnabled()) {
      filterChain.doFilter(request, response);
      return;
    }
    String uri = request.getRequestURI();
    if (!uri.startsWith("/api/")
        || "/api/health".equals(uri)
        || uri.startsWith("/api/admin/threat-ml-events")) {
      filterChain.doFilter(request, response);
      return;
    }
    // Never forward credentials to the ML pipeline
    if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
      filterChain.doFilter(request, response);
      return;
    }
    String ct = request.getContentType();
    if (ct != null && ct.toLowerCase(Locale.ROOT).startsWith("multipart/")) {
      filterChain.doFilter(request, response);
      return;
    }

    ContentCachingRequestWrapper wrapped =
        new ContentCachingRequestWrapper(request, props.getMaxBodyBytes());
    filterChain.doFilter(wrapped, response);

    byte[] body = wrapped.getContentAsByteArray();
    String ip = com.resqmeal.service.SecurityMonitoringService.clientIp(wrapped);
    double rate = trafficThreatAnalysisService.recordRequestRateAndGetPerMinute(ip);
    Map<String, String> headers = safeHeaders(wrapped);
    String userId = extractUserId();
    String sid = sessionId(wrapped);
    TrafficSnapshot snap =
        new TrafficSnapshot(
            wrapped.getMethod(),
            wrapped.getRequestURI(),
            safeQuery(wrapped),
            headers,
            body,
            ip,
            userId,
            sid,
            rate,
            response.getStatus());
    trafficThreatAnalysisService.analyzeAsync(snap);
  }

  private static String safeQuery(HttpServletRequest r) {
    String q = r.getQueryString();
    return q != null ? q : "";
  }

  private static Map<String, String> safeHeaders(HttpServletRequest r) {
    Map<String, String> m = new LinkedHashMap<>();
    Enumeration<String> names = r.getHeaderNames();
    if (names == null) {
      return m;
    }
    Collections.list(names).stream()
        .limit(32)
        .forEach(
            n -> {
              String ln = n.toLowerCase(Locale.ROOT);
              if ("authorization".equals(ln) || "cookie".equals(ln)) {
                return;
              }
              String v = r.getHeader(n);
              if (v != null && v.length() > 512) {
                v = v.substring(0, 512);
              }
              m.put(n, v != null ? v : "");
            });
    return m;
  }

  private static String sessionId(HttpServletRequest r) {
    String rid = r.getHeader("X-Request-Id");
    if (rid != null && !rid.isBlank()) {
      return rid.trim();
    }
    Cookie[] cookies = r.getCookies();
    if (cookies != null) {
      for (Cookie c : cookies) {
        if ("JSESSIONID".equals(c.getName()) && c.getValue() != null) {
          return c.getValue();
        }
      }
    }
    return "";
  }

  private static String extractUserId() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    if (a == null || !a.isAuthenticated()) {
      return null;
    }
    Object p = a.getPrincipal();
    if (p instanceof AuthPrincipal ap) {
      return String.valueOf(ap.id());
    }
    return null;
  }
}
