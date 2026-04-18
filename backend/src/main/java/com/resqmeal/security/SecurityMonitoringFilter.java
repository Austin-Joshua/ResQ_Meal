package com.resqmeal.security;

import com.resqmeal.service.BlockedEntityRegistry;
import com.resqmeal.service.SecurityMonitoringService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * After JWT: blocks banned users, detects unauthorized admin access, and records each API request
 * for audit and rule evaluation.
 */
public class SecurityMonitoringFilter extends OncePerRequestFilter {

  private final SecurityMonitoringService securityMonitoringService;
  private final BlockedEntityRegistry blockedEntityRegistry;

  public SecurityMonitoringFilter(
      SecurityMonitoringService securityMonitoringService,
      BlockedEntityRegistry blockedEntityRegistry) {
    this.securityMonitoringService = securityMonitoringService;
    this.blockedEntityRegistry = blockedEntityRegistry;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    String uri = request.getRequestURI();
    if (!uri.startsWith("/api/") || "/api/health".equals(uri)) {
      filterChain.doFilter(request, response);
      return;
    }

    String ip = SecurityMonitoringService.clientIp(request);
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Long userId = extractUserId(auth);

    if (userId != null && blockedEntityRegistry.isUserBlocked(userId)) {
      writeForbidden(response, "Account blocked");
      return;
    }

    if (uri.startsWith("/api/admin")
        && auth != null
        && auth.isAuthenticated()
        && !hasRole(auth, "ROLE_ADMIN")) {
      securityMonitoringService.onUnauthorizedAdminAccess(userId, ip, uri);
    }

    filterChain.doFilter(request, response);

    if (uri.contains("/api/auth/login")) {
      return;
    }
    int status = response.getStatus();
    auth = SecurityContextHolder.getContext().getAuthentication();
    securityMonitoringService.recordApiRequest(request, auth, status);
  }

  private static boolean hasRole(Authentication auth, String role) {
    if (auth == null) {
      return false;
    }
    for (GrantedAuthority a : auth.getAuthorities()) {
      if (role.equals(a.getAuthority())) {
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

  private static void writeForbidden(HttpServletResponse response, String reason)
      throws IOException {
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response.setContentType("application/json");
    response.getWriter().write("{\"error\":\"Forbidden\",\"reason\":\"" + reason + "\"}");
  }
}
