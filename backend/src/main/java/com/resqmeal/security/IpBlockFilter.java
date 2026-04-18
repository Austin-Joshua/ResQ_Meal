package com.resqmeal.security;

import com.resqmeal.service.BlockedEntityRegistry;
import com.resqmeal.service.SecurityMonitoringService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs before JWT: rejects requests from blocked IPs early so login and public routes are also
 * protected.
 */
public class IpBlockFilter extends OncePerRequestFilter {

  private final BlockedEntityRegistry blockedEntityRegistry;

  public IpBlockFilter(BlockedEntityRegistry blockedEntityRegistry) {
    this.blockedEntityRegistry = blockedEntityRegistry;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    String uri = request.getRequestURI();
    if (!uri.startsWith("/api/")) {
      filterChain.doFilter(request, response);
      return;
    }
    String ip = SecurityMonitoringService.clientIp(request);
    if (blockedEntityRegistry.isIpBlocked(ip)) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Forbidden\",\"reason\":\"IP blocked\"}");
      return;
    }
    filterChain.doFilter(request, response);
  }
}
